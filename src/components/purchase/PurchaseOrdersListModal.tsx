import React, { useState } from 'react';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ChevronRight,
  Search,
  Package,
  Printer,
  Eye,
  Edit,
} from 'lucide-react';
import { PurchaseOrder, POStatus } from '../../types/purchase';
import { formatCurrency } from '../../utils/format';
import { EditInvoiceModal } from '../modals/EditInvoiceModal';
import { ERPTransactionRecord } from '../../data/mockTransactions';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface PurchaseOrdersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  onSelectPOToReceive: (po: PurchaseOrder) => void;
  onUpdatePurchaseOrder?: (po: PurchaseOrder) => void;
}

export const PurchaseOrdersListModal: React.FC<PurchaseOrdersListModalProps> = ({
  isOpen,
  onClose,
  purchaseOrders,
  onSelectPOToReceive,
  onUpdatePurchaseOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [editingPOAsInvoice, setEditingPOAsInvoice] = useState<ERPTransactionRecord | null>(null);
  const [currentEditingPOId, setCurrentEditingPOId] = useState<string | null>(null);

  const handleOpenEditPO = (po: PurchaseOrder) => {
    playClickSound();
    setCurrentEditingPOId(po.id);
    const rec: ERPTransactionRecord = {
      id: po.id,
      refNo: po.poNumber,
      type: 'purchase_order',
      dateTime: po.orderDate,
      partyName: po.supplier.name,
      partyPhone: po.supplier.phone,
      partyType: 'Supplier',
      itemsCount: po.items.length,
      itemsList: po.items.map((i) => ({
        name: i.product.name,
        qty: i.quantityOrdered,
        unitPrice: i.unitCost,
        total: i.totalCost,
        sku: i.product.sku,
      })),
      grandTotal: po.grandTotal,
      grossAmount: po.subtotal,
      paidAmount: 0,
      dueAmount: po.grandTotal,
      taxAmount: po.taxAmount || 0,
      status: po.status === 'Completed' ? 'Completed' : 'Pending',
      paymentMethod: 'Bank / Credit',
      createdBy: 'Purchase Manager',
    };
    setEditingPOAsInvoice(rec);
  };

  const handleSaveEditedPO = (updated: ERPTransactionRecord) => {
    playCashDrawerDing();
    if (currentEditingPOId) {
      const existing = purchaseOrders.find((p) => p.id === currentEditingPOId);
      if (existing) {
        const updatedPO: PurchaseOrder = {
          ...existing,
          poNumber: updated.refNo,
          orderDate: updated.dateTime,
          supplier: {
            ...existing.supplier,
            name: updated.partyName,
            phone: updated.partyPhone || existing.supplier.phone,
          },
          grandTotal: updated.grandTotal,
          subtotal: updated.grossAmount || updated.grandTotal,
        };
        if (onUpdatePurchaseOrder) {
          onUpdatePurchaseOrder(updatedPO);
        }
      }
    }
    setEditingPOAsInvoice(null);
    setCurrentEditingPOId(null);
    window.dispatchEvent(new Event('erp_transactions_updated'));
  };

  if (!isOpen) return null;

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.items.some((i) => i.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Purchase Orders &amp; Goods Receiving</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track purchase orders, perform partial deliveries, and receive inventory stock.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 flex-wrap shrink-0">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {['All', 'Pending', 'Partial Receive', 'Completed'].map((s) => {
                const isSelected = filterStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PO #, supplier, product..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* PO List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredPOs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No Purchase Orders found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try switching filters or create a new PO from the Purchase Order module.
                </p>
              </div>
            ) : (
              filteredPOs.map((po) => {
                const totalOrdered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
                const totalReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);
                const percentReceived = Math.round((totalReceived / totalOrdered) * 100);

                return (
                  <div
                    key={po.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {po.poNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            po.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : po.status === 'Partial Receive'
                              ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Date: <span className="font-mono text-slate-600 dark:text-slate-300">{po.orderDate}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Supplier: {po.supplier.name}
                        </span>
                        <span>·</span>
                        <span>Phone: {po.supplier.phone}</span>
                        <span>·</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          Total: {formatCurrency(po.grandTotal)}
                        </span>
                      </div>

                      {/* Progress Bar of Receiving */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Fulfillment: <strong className="text-slate-700 dark:text-slate-200">{totalReceived}</strong> of {totalOrdered} items received ({percentReceived}%)
                          </span>
                          {po.receiveHistory && po.receiveHistory.length > 0 && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                              {po.receiveHistory.length} delivery batches
                            </span>
                          )}
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              po.status === 'Completed'
                                ? 'bg-emerald-500'
                                : po.status === 'Partial Receive'
                                ? 'bg-purple-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentReceived}%` }}
                          />
                        </div>
                      </div>

                      {/* Items chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {po.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-md text-slate-600 dark:text-slate-300"
                          >
                            {item.product.name} (Recv: {item.quantityReceived}/{item.quantityOrdered})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons: View · Print · Receive Goods */}
                    <div className="shrink-0 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setViewingPO(po)}
                        className="px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="View purchase order specification"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewingPO(po);
                          setTimeout(() => {
                            window.print();
                          }, 350);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Print purchase order voucher"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Print</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditPO(po)}
                        className="px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Edit purchase order: modify dates, items, quantities, or prices"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit</span>
                      </button>

                      {po.status !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPOToReceive(po);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Receive Goods</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PO Document Preview Modal */}
      {viewingPO && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-sm">
                  Purchase Order Specification · {viewingPO.poNumber}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPO(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">PURCHASE ORDER VOUCHER</h3>
                  <p className="text-slate-500">NEXTGEN IT ERP · Official Goods Replenishment Order</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-600 dark:text-sky-400 text-sm">{viewingPO.poNumber}</div>
                  <div className="text-slate-500">Date: {viewingPO.orderDate}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    Status: {viewingPO.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl grid grid-cols-2 gap-3 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Vendor / Supplier:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingPO.supplier.name}</div>
                  <div className="text-slate-500 font-mono mt-0.5">Phone: {viewingPO.supplier.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Order Terms:</span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">Cash / Net 30 Terms</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[9px]">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Ordered</th>
                      <th className="p-2 text-center">Received</th>
                      <th className="p-2 text-right">Unit Cost</th>
                      <th className="p-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {viewingPO.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-sans font-medium">{item.product.name}</td>
                        <td className="p-2 text-center">{item.quantityOrdered}</td>
                        <td className="p-2 text-center text-emerald-600 font-bold">{item.quantityReceived}</td>
                        <td className="p-2 text-right">{formatCurrency(item.unitCost)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(item.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Grand Total Order Valuation:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">{formatCurrency(viewingPO.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPO(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Purchase Order Modal (Asks which part to modify) */}
      {editingPOAsInvoice && (
        <EditInvoiceModal
          invoice={editingPOAsInvoice}
          isOpen={!!editingPOAsInvoice}
          onClose={() => {
            setEditingPOAsInvoice(null);
            setCurrentEditingPOId(null);
          }}
          onSave={handleSaveEditedPO}
        />
      )}
    </>
  );
};
