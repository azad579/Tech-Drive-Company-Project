/**
 * Sales Service Layer
 * Traces API communication for sales, transactions, and line items.
 */

import { ERPTransactionRecord, getStoredSalesInvoices, saveStoredSalesInvoices } from '../data/mockTransactions';

export interface CreateSalePayload {
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  saleDate?: string;
  orderMode: 'sale' | 'quotation';
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Completed';
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxRate: number;
  grandTotal: number;
  paidAmount?: number;
  dueAmount?: number;
  notes?: string;
  createdBy: string;
  items: Array<{
    productId?: string;
    productName: string;
    sku?: string;
    category?: string;
    unitPrice: number;
    costPrice?: number;
    quantity: number;
    discountAmount?: number;
    totalPrice: number;
    serialNumbers?: string[];
  }>;
}

/**
 * Fetch all sales transactions from backend API
 */
export async function fetchSalesTransactions(): Promise<ERPTransactionRecord[]> {
  console.log('[Data Flow -> salesApi] Fetching sales transactions from /api/sales...');
  try {
    const res = await fetch('/api/sales');
    if (!res.ok) {
      throw new Error(`Failed to fetch sales: HTTP ${res.status}`);
    }
    const data = await res.json();
    console.log(`[Data Flow -> salesApi] Successfully received ${data.sales?.length || 0} sales transactions:`, data.sales);
    
    // Map backend sales to frontend ERPTransactionRecord format if needed
    if (data.sales && Array.isArray(data.sales)) {
      const formatted: ERPTransactionRecord[] = data.sales.map((s: any) => ({
        id: s.id,
        type: 'sales_invoice',
        refNo: s.invoiceNumber,
        dateTime: s.saleDate,
        partyName: s.customerName,
        partyPhone: s.customerPhone,
        partyType: 'Customer',
        itemsCount: (s.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
        itemsList: (s.items || []).map((it: any) => ({
          name: it.productName,
          qty: it.quantity,
          unitPrice: it.unitPrice,
          total: it.totalPrice,
          sku: it.sku,
        })),
        grossAmount: s.subtotal,
        discountAmount: s.discountAmount,
        discountPercent: s.discountPercent,
        taxAmount: s.taxAmount,
        grandTotal: s.grandTotal,
        paidAmount: s.paidAmount,
        dueAmount: s.dueAmount,
        status: s.paymentStatus || 'Paid',
        paymentMethod: s.paymentMethod,
        notes: s.notes,
        createdBy: s.createdBy,
      }));

      // Cache to local storage
      saveStoredSalesInvoices(formatted);
      return formatted;
    }
  } catch (error) {
    console.warn('[Data Flow -> salesApi] Backend fetch failed, falling back to local store:', error);
  }

  // Graceful fallback to stored sales
  return getStoredSalesInvoices();
}

/**
 * Record a new sale transaction via POST /api/sales
 */
export async function recordSaleTransaction(payload: CreateSalePayload): Promise<ERPTransactionRecord> {
  console.log('[Data Flow -> salesApi] POST /api/sales payload:', payload);

  let createdRecord: ERPTransactionRecord;

  try {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('[Data Flow -> salesApi] Sale recorded on server:', data);

    const s = data.sale;
    createdRecord = {
      id: s.id,
      type: 'sales_invoice',
      refNo: s.invoiceNumber,
      dateTime: s.saleDate,
      partyName: s.customerName,
      partyPhone: s.customerPhone,
      partyType: 'Customer',
      itemsCount: (s.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
      itemsList: (s.items || []).map((it: any) => ({
        name: it.productName,
        qty: it.quantity,
        unitPrice: it.unitPrice,
        total: it.totalPrice,
        sku: it.sku,
      })),
      grossAmount: s.subtotal,
      discountAmount: s.discountAmount,
      discountPercent: s.discountPercent,
      taxAmount: s.taxAmount,
      grandTotal: s.grandTotal,
      paidAmount: s.paidAmount,
      dueAmount: s.dueAmount,
      status: s.paymentStatus || 'Paid',
      paymentMethod: s.paymentMethod,
      notes: s.notes,
      createdBy: s.createdBy,
    };
  } catch (err) {
    console.warn('[Data Flow -> salesApi] Backend POST failed, executing offline recording:', err);
    createdRecord = {
      id: `rec-sal-${Date.now()}`,
      type: 'sales_invoice',
      refNo: payload.invoiceNumber,
      dateTime: new Date().toLocaleString(),
      partyName: payload.customerName,
      partyPhone: payload.customerPhone,
      partyType: 'Customer',
      itemsCount: payload.items.reduce((acc, it) => acc + it.quantity, 0),
      itemsList: payload.items.map(it => ({
        name: it.productName,
        qty: it.quantity,
        unitPrice: it.unitPrice,
        total: it.totalPrice,
        sku: it.sku,
      })),
      grossAmount: payload.subtotal,
      discountAmount: payload.discountAmount,
      discountPercent: payload.discountPercent,
      taxAmount: payload.taxAmount,
      grandTotal: payload.grandTotal,
      paidAmount: payload.paidAmount || payload.grandTotal,
      dueAmount: payload.dueAmount || 0,
      status: payload.paymentStatus || 'Paid',
      paymentMethod: payload.paymentMethod,
      notes: payload.notes,
      createdBy: payload.createdBy,
    };
  }

  // Sync to local storage & trigger cross-module reactive event
  const current = getStoredSalesInvoices();
  const updated = [createdRecord, ...current.filter(c => c.refNo !== createdRecord.refNo)];
  saveStoredSalesInvoices(updated);
  window.dispatchEvent(new Event('erp_transactions_updated'));
  console.log('[Data Flow -> salesApi] Dispatched erp_transactions_updated event to notify Reports view.');

  return createdRecord;
}

/**
 * Delete a sale transaction
 */
export async function deleteSaleTransaction(id: string): Promise<boolean> {
  console.log(`[Data Flow -> salesApi] DELETE /api/sales/${id}`);
  try {
    await fetch(`/api/sales/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Backend delete failed, continuing with local sync', e);
  }

  const current = getStoredSalesInvoices();
  const next = current.filter(r => r.id !== id);
  saveStoredSalesInvoices(next);
  window.dispatchEvent(new Event('erp_transactions_updated'));
  return true;
}
