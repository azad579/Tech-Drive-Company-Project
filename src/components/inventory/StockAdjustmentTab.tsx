import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_STOCK_ADJUSTMENTS, StockAdjustmentRecord } from '../../data/mockErpData';
import { Product } from '../../types/pos';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface StockAdjustmentTabProps {
  products?: Product[];
  onUpdateProductStock?: (productId: string, newStock: number) => void;
}

export const StockAdjustmentTab: React.FC<StockAdjustmentTabProps> = ({
  products = [],
  onUpdateProductStock,
}) => {
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>(INITIAL_STOCK_ADJUSTMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAdj, setViewingAdj] = useState<StockAdjustmentRecord | null>(null);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [warehouse, setWarehouse] = useState('Main Headquarters & Showroom');
  const [physicalQty, setPhysicalQty] = useState(products[0]?.stock || 30);
  const [reason, setReason] = useState<'Shrinkage' | 'Damage / Defect' | 'Physical Audit Variance' | 'Expired Batch'>('Physical Audit Variance');
  const [adjustedBy, setAdjustedBy] = useState('Sadia Rahman');
  const [approvedBy, setApprovedBy] = useState('Forhad (Admin)');

  const targetProd = products.find((p) => p.id === selectedProductId) || products[0];
  const systemQty = targetProd ? targetProd.stock : 30;
  const diffQty = physicalQty - systemQty;

  const filtered = adjustments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = a.adjNo.toLowerCase().includes(q);
      const matchProd = a.productName.toLowerCase().includes(q);
      const matchSku = a.sku.toLowerCase().includes(q);
      if (!matchNo && !matchProd && !matchSku) return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: StockAdjustmentRecord = {
      id: `adj-${Date.now()}`,
      adjNo: `ADJ-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      warehouse,
      productName: targetProd ? targetProd.name : 'Hardware Component',
      sku: targetProd ? targetProd.sku : 'SKU-GEN',
      systemQty,
      physicalQty,
      diffQty,
      reason,
      adjustedBy: adjustedBy.trim(),
      approvedBy: approvedBy.trim(),
      status: 'Reconciled',
    };

    setAdjustments([newRecord, ...adjustments]);

    // Update physical product stock if callback provided
    if (onUpdateProductStock && targetProd) {
      onUpdateProductStock(targetProd.id, physicalQty);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this stock adjustment record?')) {
      setAdjustments(adjustments.filter((a) => a.id !== id));
      if (viewingAdj?.id === id) setViewingAdj(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Adj #,Date,Warehouse,Product,SKU,System Qty,Physical Qty,Diff,Reason,Adjusted By\n'];
    const rows = filtered.map(
      (a) => `"${a.adjNo}","${a.date}","${a.warehouse}","${a.productName}","${a.sku}","${a.systemQty}","${a.physicalQty}","${a.diffQty}","${a.reason}","${a.adjustedBy}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_adjustments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search adjustment #, product, SKU..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Adj #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3 text-center">System Qty</th>
              <th className="p-3 text-center">Physical Count</th>
              <th className="p-3 text-center">Variance (+/-)</th>
              <th className="p-3">Reason</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{a.adjNo}</td>
                <td className="p-3 text-slate-500 font-mono">{a.date}</td>
                <td className="p-3 text-slate-700 dark:text-slate-300">{a.warehouse}</td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">{a.productName}</td>
                <td className="p-3 font-mono text-slate-500">{a.sku}</td>
                <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{a.systemQty}</td>
                <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-white">{a.physicalQty}</td>
                <td className="p-3 text-center font-mono font-bold">
                  <span className={a.diffQty < 0 ? 'text-rose-500' : 'text-emerald-500'}>
                    {a.diffQty > 0 ? `+${a.diffQty}` : a.diffQty}
                  </span>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{a.reason}</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    {a.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        playClickSound();
                        setViewingAdj(a);
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="View Reconciliation Slip"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: NEW ADJUSTMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Physical Inventory Reconciliation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setPhysicalQty(p.stock);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Current System Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block">System Registered Quantity</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1 block">
                    {systemQty} units
                  </span>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Physical Counted Qty *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={physicalQty}
                    onChange={(e) => setPhysicalQty(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono font-bold text-base"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-200 font-medium">Variance / Stock Discrepancy:</span>
                <span className={`font-mono font-bold text-sm ${diffQty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {diffQty > 0 ? `+${diffQty}` : diffQty} units
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Discrepancy Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Physical Audit Variance">Physical Audit Variance</option>
                    <option value="Shrinkage">Shrinkage / Lost</option>
                    <option value="Damage / Defect">Damage / Defect Discard</option>
                    <option value="Expired Batch">Expired Batch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Audit Conducted By</label>
                  <input
                    type="text"
                    value={adjustedBy}
                    onChange={(e) => setAdjustedBy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Save &amp; Reconcile Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ADJUSTMENT */}
      {viewingAdj && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audit Reconciliation Slip — {viewingAdj.adjNo}</h3>
              <button onClick={() => setViewingAdj(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Item:</span> <span className="font-bold text-slate-900 dark:text-white">{viewingAdj.productName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">SKU:</span> <span className="font-mono text-slate-500">{viewingAdj.sku}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Warehouse:</span> <span className="text-slate-900 dark:text-white">{viewingAdj.warehouse}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">System Count:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{viewingAdj.systemQty}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Physical Count:</span> <span className="font-mono font-bold text-slate-900 dark:text-white">{viewingAdj.physicalQty}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Discrepancy:</span> <span className={`font-mono font-bold ${viewingAdj.diffQty < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{viewingAdj.diffQty} units</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason:</span> <span className="text-slate-900 dark:text-white">{viewingAdj.reason}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Auditor:</span> <span className="text-slate-900 dark:text-white">{viewingAdj.adjustedBy}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Approved By:</span> <span className="text-slate-900 dark:text-white">{viewingAdj.approvedBy}</span></div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setViewingAdj(null)} className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
