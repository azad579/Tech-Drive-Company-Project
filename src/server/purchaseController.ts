import { Request, Response } from 'express';
import { PurchaseOrder, PurchaseOrderItem, PurchaseInvoice, POStatus } from '../types/purchase';
import { Product } from '../types/pos';

// In-memory persistent state simulation for development/testing
// (Directly maps to the SQL tables and transaction logic defined in schema.sql)
let purchaseOrdersStore: PurchaseOrder[] = [];
let purchaseInvoicesStore: PurchaseInvoice[] = [];
let productsStore: Product[] = [];

export function initializeStore(initialPOs: PurchaseOrder[], initialProducts: Product[]) {
  purchaseOrdersStore = [...initialPOs];
  productsStore = [...initialProducts];
}

/**
 * Controller: Create Purchase Order (Status: Pending)
 * POST /api/purchases/orders
 */
export async function createPurchaseOrder(req: Request, res: Response) {
  try {
    const { supplier, items, expectedDeliveryDate, notes, internalNotes, createdBy } = req.body;

    if (!supplier || !supplier.id) {
      return res.status(400).json({ error: 'Valid supplier is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item must be in the purchase order.' });
    }

    const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const orderDate = new Date().toISOString().split('T')[0];

    const formattedItems: PurchaseOrderItem[] = items.map((item: any, idx: number) => {
      const quantityOrdered = Number(item.quantityOrdered) || 1;
      const unitCost = Number(item.unitCost) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const totalCost = (unitCost * quantityOrdered) * (1 + taxRate / 100);

      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: item.productId,
        product: item.product,
        unitCost,
        quantityOrdered,
        quantityReceived: 0,
        quantityReceivingNow: 0,
        taxRate,
        totalCost,
      };
    });

    const subtotal = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantityOrdered), 0);
    const taxAmount = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantityOrdered * (i.taxRate / 100)), 0);
    const grandTotal = subtotal + taxAmount;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: supplier.id,
      supplier,
      orderDate,
      expectedDeliveryDate: expectedDeliveryDate || orderDate,
      status: 'Pending',
      items: formattedItems,
      subtotal,
      taxAmount,
      grandTotal,
      notes: notes || '',
      internalNotes: internalNotes || '',
      createdBy: createdBy || 'Admin',
      receiveHistory: [],
    };

    purchaseOrdersStore.unshift(newPO);

    return res.status(201).json({
      success: true,
      message: `Purchase Order ${poNumber} created with status Pending.`,
      purchaseOrder: newPO,
    });
  } catch (error: any) {
    console.error('Error in createPurchaseOrder:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
}

/**
 * Controller: Partial or Full Receive Purchase Order
 * POST /api/purchases/orders/:id/receive
 * 
 * Workflow Logic:
 * 1. User enters quantity_received per line item.
 * 2. If quantity_received < quantity_ordered across items, status becomes "Partial Receive".
 *    If all match quantity_ordered, status becomes "Completed".
 * 3. Immediately triggers an inventory addition transaction that increases physical stock:
 *    current_stock = current_stock + quantity_received
 */
export async function receivePurchaseOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { itemsToReceive, receivedBy, referenceNote } = req.body;
    // itemsToReceive: Array of { productId, quantityReceivedNow }

    const poIndex = purchaseOrdersStore.findIndex((p) => p.id === id);
    if (poIndex === -1) {
      return res.status(404).json({ error: `Purchase Order ${id} not found.` });
    }

    const po = purchaseOrdersStore[poIndex];
    if (po.status === 'Completed') {
      return res.status(400).json({ error: `Purchase Order ${po.poNumber} has already been completed.` });
    }

    if (!itemsToReceive || !Array.isArray(itemsToReceive) || itemsToReceive.length === 0) {
      return res.status(400).json({ error: 'Please provide items and receiving quantities.' });
    }

    let hasAnyReceived = false;
    const stockUpdates: { productId: string; quantityAdded: number; newStock: number }[] = [];
    const historyItemRecords: { productId: string; productName: string; quantity: number }[] = [];

    // Step 1: Validate and apply received quantities
    po.items = po.items.map((poItem) => {
      const receiveItem = itemsToReceive.find((r: any) => r.productId === poItem.productId);
      const qtyReceivingNow = receiveItem ? Number(receiveItem.quantityReceivedNow) || 0 : 0;

      if (qtyReceivingNow > 0) {
        hasAnyReceived = true;
        const newTotalReceived = poItem.quantityReceived + qtyReceivingNow;

        if (newTotalReceived > poItem.quantityOrdered) {
          throw new Error(
            `Cannot receive ${qtyReceivingNow} for ${poItem.product.name}. Total received (${newTotalReceived}) would exceed ordered (${poItem.quantityOrdered}).`
          );
        }

        // Increase inventory stock immediately
        const prod = productsStore.find((p) => p.id === poItem.productId);
        if (prod) {
          const stockBefore = prod.stock;
          prod.stock += qtyReceivingNow;
          stockUpdates.push({
            productId: prod.id,
            quantityAdded: qtyReceivingNow,
            newStock: prod.stock,
          });
        }

        historyItemRecords.push({
          productId: poItem.productId,
          productName: poItem.product.name,
          quantity: qtyReceivingNow,
        });

        return {
          ...poItem,
          quantityReceived: newTotalReceived,
          quantityReceivingNow: 0,
        };
      }

      return poItem;
    });

    if (!hasAnyReceived) {
      return res.status(400).json({ error: 'No receiving quantities were greater than 0.' });
    }

    // Step 2: Determine new PO status (Completed vs Partial Receive)
    const isAllCompleted = po.items.every((item) => item.quantityReceived >= item.quantityOrdered);
    const newStatus: POStatus = isAllCompleted ? 'Completed' : 'Partial Receive';
    po.status = newStatus;

    // Step 3: Log receiving history
    const historyRecord = {
      id: `rec-${Date.now()}`,
      receivedAt: new Date().toLocaleString(),
      receivedBy: receivedBy || 'Staff',
      referenceNote: referenceNote || 'Goods Receipt Voucher',
      itemsReceived: historyItemRecords,
    };

    if (!po.receiveHistory) po.receiveHistory = [];
    po.receiveHistory.unshift(historyRecord);

    purchaseOrdersStore[poIndex] = { ...po };

    return res.status(200).json({
      success: true,
      message: isAllCompleted
        ? `Purchase Order ${po.poNumber} fully received and marked Completed.`
        : `Purchase Order ${po.poNumber} partially received. Status updated to Partial Receive.`,
      newStatus,
      stockUpdates,
      purchaseOrder: po,
    });
  } catch (error: any) {
    console.error('Error in receivePurchaseOrder:', error);
    return res.status(400).json({ error: error.message || 'Failed to process purchase order receipt.' });
  }
}

/**
 * Controller: Create Direct Purchase Invoice
 * POST /api/purchases/invoices
 * 
 * Workflow Logic:
 * 1. Bypasses the PO stage entirely.
 * 2. Saving the invoice immediately updates inventory stock (current_stock + quantity).
 * 3. Logs a completed purchase transaction with vendor payment details.
 */
export async function createDirectPurchaseInvoice(req: Request, res: Response) {
  try {
    const {
      supplier,
      items,
      paymentMethod,
      paymentStatus,
      amountPaid,
      notes,
      internalNotes,
      recordedBy,
    } = req.body;

    if (!supplier || !supplier.id) {
      return res.status(400).json({ error: 'Supplier is required for direct purchase invoice.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required.' });
    }

    const invoiceNumber = `PINV-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    const stockUpdates: { productId: string; quantityAdded: number; newStock: number }[] = [];

    const formattedItems = items.map((item: any, idx: number) => {
      const quantity = Number(item.quantity) || 1;
      const unitCost = Number(item.unitCost) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const totalCost = (unitCost * quantity) * (1 + taxRate / 100);

      // Immediately increment inventory stock
      const prod = productsStore.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += quantity;
        stockUpdates.push({
          productId: prod.id,
          quantityAdded: quantity,
          newStock: prod.stock,
        });
      }

      return {
        id: `pii-${Date.now()}-${idx}`,
        productId: item.productId,
        product: item.product,
        unitCost,
        quantity,
        taxRate,
        totalCost,
      };
    });

    const subtotal = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantity), 0);
    const taxAmount = formattedItems.reduce((acc, i) => acc + (i.unitCost * i.quantity * (i.taxRate / 100)), 0);
    const grandTotal = subtotal + taxAmount;

    const newInvoice: PurchaseInvoice = {
      id: `pinv-${Date.now()}`,
      invoiceNumber,
      supplierId: supplier.id,
      supplier,
      invoiceDate,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid',
      items: formattedItems,
      subtotal,
      taxAmount,
      grandTotal,
      amountPaid: amountPaid !== undefined ? Number(amountPaid) : grandTotal,
      notes: notes || '',
      internalNotes: internalNotes || '',
      recordedBy: recordedBy || 'Forhad',
    };

    purchaseInvoicesStore.unshift(newInvoice);

    return res.status(201).json({
      success: true,
      message: `Direct Purchase Invoice ${invoiceNumber} created. Inventory stock increased immediately.`,
      invoice: newInvoice,
      stockUpdates,
    });
  } catch (error: any) {
    console.error('Error in createDirectPurchaseInvoice:', error);
    return res.status(500).json({ error: error.message || 'Failed to create purchase invoice.' });
  }
}

/**
 * Controller: List Purchase Orders
 * GET /api/purchases/orders
 */
export async function getPurchaseOrders(req: Request, res: Response) {
  const { status, supplierId } = req.query;
  let filtered = [...purchaseOrdersStore];

  if (status && status !== 'All') {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (supplierId) {
    filtered = filtered.filter((p) => p.supplierId === supplierId);
  }

  return res.json({
    total: filtered.length,
    purchaseOrders: filtered,
  });
}

/**
 * Controller: List Purchase Invoices
 * GET /api/purchases/invoices
 */
export async function getPurchaseInvoices(req: Request, res: Response) {
  return res.json({
    total: purchaseInvoicesStore.length,
    invoices: purchaseInvoicesStore,
  });
}
