import { PurchaseOrder, PurchaseInvoice, Supplier, POStatus, PurchaseOrderItem } from '../types/purchase';
import { Product } from '../types/pos';
import { INITIAL_PURCHASE_ORDERS } from '../data/initialPurchaseOrders';

// Local storage keys for resilient persistence
const PO_STORAGE_KEY = 'pos_purchase_orders_store_v1';
const PI_STORAGE_KEY = 'pos_purchase_invoices_store_v1';

export function loadStoredPurchaseOrders(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(PO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading purchase orders from storage', e);
  }
  return INITIAL_PURCHASE_ORDERS;
}

export function saveStoredPurchaseOrders(orders: PurchaseOrder[]) {
  try {
    localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed saving purchase orders to storage', e);
  }
}

export function loadStoredPurchaseInvoices(): PurchaseInvoice[] {
  try {
    const raw = localStorage.getItem(PI_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading purchase invoices from storage', e);
  }
  return [];
}

export function saveStoredPurchaseInvoices(invoices: PurchaseInvoice[]) {
  try {
    localStorage.setItem(PI_STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed saving purchase invoices to storage', e);
  }
}

/**
 * Execute Partial or Full Receive transaction:
 * 1. Checks received quantities per line item
 * 2. If quantity_received < quantity_ordered across items, sets status to 'Partial Receive'
 *    If all items match, sets status to 'Completed'
 * 3. Immediately increments physical product stock (current_stock + quantity_received)
 */
export function executeReceiveTransaction(
  po: PurchaseOrder,
  receiveMap: Record<string, number>, // productId -> quantityReceivedNow
  allProducts: Product[],
  receivedBy: string = 'Forhad',
  referenceNote: string = 'Goods Received Note'
): {
  updatedPO: PurchaseOrder;
  updatedProducts: Product[];
  receivedSummary: { productName: string; quantity: number }[];
  isCompleted: boolean;
} {
  const updatedProducts = [...allProducts];
  const receivedSummary: { productName: string; quantity: number }[] = [];

  const updatedItems: PurchaseOrderItem[] = po.items.map((item) => {
    const qtyReceivingNow = receiveMap[item.productId] || 0;
    if (qtyReceivingNow > 0) {
      const newTotalReceived = item.quantityReceived + qtyReceivingNow;

      // Update product stock immediately
      const pIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (pIdx !== -1) {
        updatedProducts[pIdx] = {
          ...updatedProducts[pIdx],
          stock: updatedProducts[pIdx].stock + qtyReceivingNow,
        };
      }

      receivedSummary.push({
        productName: item.product.name,
        quantity: qtyReceivingNow,
      });

      return {
        ...item,
        quantityReceived: newTotalReceived,
        quantityReceivingNow: 0,
      };
    }
    return item;
  });

  const isCompleted = updatedItems.every((item) => item.quantityReceived >= item.quantityOrdered);
  const newStatus: POStatus = isCompleted ? 'Completed' : 'Partial Receive';

  const newReceiveRecord = {
    id: `rec-${Date.now()}`,
    receivedAt: new Date().toLocaleString(),
    receivedBy,
    referenceNote,
    itemsReceived: receivedSummary.map((r) => ({
      productId: updatedItems.find((ui) => ui.product.name === r.productName)?.productId || '',
      productName: r.productName,
      quantity: r.quantity,
    })),
  };

  const updatedPO: PurchaseOrder = {
    ...po,
    items: updatedItems,
    status: newStatus,
    receiveHistory: [newReceiveRecord, ...(po.receiveHistory || [])],
  };

  return {
    updatedPO,
    updatedProducts,
    receivedSummary,
    isCompleted,
  };
}

/**
 * Execute Direct Purchase Invoice transaction:
 * 1. Bypasses PO
 * 2. Immediately updates physical inventory stock (current_stock + quantity)
 * 3. Logs a completed purchase invoice
 */
export function executeDirectPurchaseTransaction(
  supplier: Supplier,
  items: { product: Product; unitCost: number; quantity: number; taxRate: number; serials?: string[] }[],
  allProducts: Product[],
  paymentMethod: 'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Credit / Due',
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid',
  notes: string = '',
  internalNotes: string = '',
  recordedBy: string = 'Forhad'
): {
  newInvoice: PurchaseInvoice;
  updatedProducts: Product[];
} {
  const updatedProducts = [...allProducts];

  const formattedItems = items.map((item, idx) => {
    // Increase product stock immediately and register serials
    const pIdx = updatedProducts.findIndex((p) => p.id === item.product.id);
    if (pIdx !== -1) {
      const existingSerials = updatedProducts[pIdx].serials || [];
      const newSerials = item.serials ? item.serials.filter((s) => s.trim()) : [];
      updatedProducts[pIdx] = {
        ...updatedProducts[pIdx],
        stock: updatedProducts[pIdx].stock + item.quantity,
        serials: [...existingSerials, ...newSerials],
      };
    }

    const totalCost = (item.unitCost * item.quantity) * (1 + item.taxRate / 100);

    return {
      id: `pii-${Date.now()}-${idx}`,
      productId: item.product.id,
      product: item.product,
      unitCost: item.unitCost,
      quantity: item.quantity,
      taxRate: item.taxRate,
      totalCost,
      serials: item.serials || [],
    };
  });

  const subtotal = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0);
  const taxAmount = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantity * (i.taxRate / 100)), 0);
  const grandTotal = subtotal + taxAmount;

  const newInvoice: PurchaseInvoice = {
    id: `pinv-${Date.now()}`,
    invoiceNumber: `PINV-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`,
    supplierId: supplier.id,
    supplier,
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMethod,
    paymentStatus,
    items: formattedItems,
    subtotal,
    taxAmount,
    grandTotal,
    amountPaid: paymentStatus === 'Paid' ? grandTotal : 0,
    notes,
    internalNotes,
    recordedBy,
  };

  return {
    newInvoice,
    updatedProducts,
  };
}
