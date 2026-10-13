import { Request, Response } from 'express';
import { db, DbSale, DbSaleItem } from './db';

/**
 * GET /api/sales
 * Returns all sales transactions with their line items
 */
export async function getSales(req: Request, res: Response) {
  try {
    console.log('[API Server] GET /api/sales received');
    const sales = db.getAllSales();
    console.log(`[API Server] Returning ${sales.length} sales transactions from database.`);
    return res.status(200).json({
      success: true,
      total: sales.length,
      sales,
    });
  } catch (error: any) {
    console.error('[API Server] Error in getSales:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/sales/:id
 * Returns single sale transaction by ID
 */
export async function getSaleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log(`[API Server] GET /api/sales/${id} received`);
    const sale = db.getSaleById(id);
    if (!sale) {
      return res.status(404).json({ error: `Sale transaction ${id} not found` });
    }
    return res.status(200).json({ success: true, sale });
  } catch (error: any) {
    console.error(`[API Server] Error in getSaleById:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * POST /api/sales
 * Creates a new sale transaction with line items and atomically updates product inventory
 */
export async function createSale(req: Request, res: Response) {
  try {
    console.log('[API Server] POST /api/sales received. Payload:', JSON.stringify(req.body));
    const {
      invoiceNumber,
      customerId,
      customerName,
      customerPhone,
      saleDate,
      orderMode,
      paymentMethod,
      paymentStatus,
      subtotal,
      discountAmount,
      discountPercent,
      taxAmount,
      taxRate,
      grandTotal,
      paidAmount,
      dueAmount,
      notes,
      createdBy,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one line item is required to record a sale.' });
    }

    const saleRecord: Omit<DbSale, 'id'> = {
      invoiceNumber: invoiceNumber || `SAL${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customerId || 'cust-walkin',
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      saleDate: saleDate || new Date().toISOString(),
      orderMode: orderMode || 'sale',
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid',
      subtotal: Number(subtotal) || 0,
      discountAmount: Number(discountAmount) || 0,
      discountPercent: Number(discountPercent) || 0,
      taxAmount: Number(taxAmount) || 0,
      taxRate: Number(taxRate) || 0,
      grandTotal: Number(grandTotal) || 0,
      paidAmount: paidAmount !== undefined ? Number(paidAmount) : Number(grandTotal) || 0,
      dueAmount: Number(dueAmount) || 0,
      notes: notes || '',
      createdBy: createdBy || 'Cashier',
    };

    const formattedItems: Omit<DbSaleItem, 'id' | 'saleId'>[] = items.map((it: any) => ({
      productId: it.productId || it.product?.id,
      productName: it.productName || it.name || it.product?.name || 'Item',
      sku: it.sku || it.product?.sku || '',
      category: it.category || it.product?.category || 'General',
      unitPrice: Number(it.unitPrice ?? it.customPrice ?? it.product?.price ?? 0),
      costPrice: Number(it.costPrice ?? it.product?.costPrice ?? 0),
      quantity: Number(it.quantity) || 1,
      discountAmount: Number(it.discountAmount) || 0,
      totalPrice: Number(it.totalPrice ?? ((it.unitPrice ?? it.product?.price ?? 0) * (it.quantity || 1))),
      serialNumbers: it.serialNumbers || it.selectedSerials || [],
    }));

    // Atomically insert into relational database
    const createdSale = db.insertSale(saleRecord, formattedItems);

    console.log(`[API Server] Sale recorded successfully! ID: ${createdSale.id}, Invoice: ${createdSale.invoiceNumber}, Grand Total: ৳${createdSale.grandTotal}`);

    return res.status(201).json({
      success: true,
      message: `Sale ${createdSale.invoiceNumber} recorded successfully. Reports and analytics updated in real-time.`,
      sale: createdSale,
    });
  } catch (error: any) {
    console.error('[API Server] Error creating sale:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while recording sale.' });
  }
}

/**
 * PUT /api/sales/:id
 * Updates an existing sale transaction
 */
export async function updateSale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log(`[API Server] PUT /api/sales/${id} received:`, req.body);
    const updated = db.updateSale(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: `Sale transaction ${id} not found` });
    }
    return res.status(200).json({ success: true, sale: updated });
  } catch (error: any) {
    console.error(`[API Server] Error in updateSale:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * DELETE /api/sales/:id
 * Deletes sale transaction (cascades to line items)
 */
export async function deleteSale(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log(`[API Server] DELETE /api/sales/${id} received`);
    const success = db.deleteSale(id);
    if (!success) {
      return res.status(404).json({ error: `Sale transaction ${id} not found` });
    }
    return res.status(200).json({ success: true, message: `Sale transaction ${id} deleted.` });
  } catch (error: any) {
    console.error(`[API Server] Error in deleteSale:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
