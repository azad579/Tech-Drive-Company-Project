import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  Download,
  X,
  Package,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_STOCK_MOVEMENTS, StockMovementRecord } from '../../data/mockErpData';
import { Product } from '../../types/pos';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface StockInOutTabProps {
  products?: Product[];
}

export const StockInOutTab: React.FC<StockInOutTabProps> = ({ products = [] }) => {
  const [movements, setMovements] = useState<StockMovementRecord[]>(INITIAL_STOCK_MOVEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'IN' | 'OUT'>('All');
  const [viewingMvt, setViewingMvt] = useState<StockMovementRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [mvtType, setMvtType] = useState<'IN' | 'OUT'>('IN');
  const [warehouse, setWarehouse] = useState('Main Headquarters & Showroom');
  const [productName, setProductName] = useState(products[0]?.name || 'Surface Pro 7 (i5, 8GB, 256GB)');
  const [sku, setSku] = useState(products[0]?.sku || 'MS-SP7-02');
  const [qty, setQty] = useState(5);
  const [unit, setUnit] = useState('Unit');
  const [reason, setReason] = useState<'Purchase Inward' | 'Customer Return' | 'Sales Dispatch' | 'Defective Discard' | 'Internal Transfer' | 'Sample'>('Purchase Inward');
  const [operator, setOperator] = useState('Kamrul Hasan (Store Officer)');

  const filtered = movements.filter((m) => {
    if (typeFilter !== 'All' && m.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = m.refNo.toLowerCase().includes(q);
      const matchProd = m.productName.toLowerCase().includes(q);
      const matchSku = m.sku.toLowerCase().includes(q);
      const matchWh = m.warehouse.toLowerCase().includes(q);
      if (!matchRef && !matchProd && !matchSku && !matchWh) return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: StockMovementRecord = {
      id: `mvt-${Date.now()}`,
      refNo: `MVT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      type: mvtType,
      warehouse,
      productName: productName.trim(),
      sku: sku.trim(),
      qty,
      unit,
      reason,
      operator: operator.trim(),
      status: 'Verified',
    };

    setMovements([newRecord, ...movements]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this movement record?')) {
      setMovements(movements.filter((m) => m.id !== id));
      if (viewingMvt?.id === id) setViewingMvt(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Ref No,Date,Type,Warehouse,Product,SKU,Qty,Unit,Reason,Operator,Status\n'];
    const rows = filtered.map(
      (m) => `"${m.refNo}","${m.date}","${m.type}","${m.warehouse}","${m.productName}","${m.sku}","${m.qty}","${m.unit}","${m.reason}","${m.operator}","${m.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_movements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movement #, product, SKU..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'IN', 'OUT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  typeFilter === t
                    ? t === 'IN'
                      ? 'bg-emerald-600 text-white'
                      : t === 'OUT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t === 'All' ? 'All Movements' : t === 'IN' ? 'Stock In (+)' : 'Stock Out (-)'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Ref #</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Type</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Product Description</th>
              <th className="p-3">SKU</th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3">Reason / Source</th>
              <th className="p-3">Operator</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.refNo}</td>
                <td className="p-3 text-slate-500 font-mono">{m.date}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.type === 'IN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {m.type === 'IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    <span>{m.type === 'IN' ? 'Stock IN' : 'Stock OUT'}</span>
                  </span>
                </td>
                <td className="p-3 text-slate-700 dark:text-slate-300">{m.warehouse}</td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">{m.productName}</td>
                <td className="p-3 font-mono text-slate-500">{m.sku}</td>
                <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                  {m.type === 'IN' ? `+${m.qty}` : `-${m.qty}`} {m.unit}
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{m.reason}</td>
                <td className="p-3 text-slate-500">{m.operator}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        playClickSound();
                        setViewingMvt(m);
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="View voucher"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
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

      {/* MODAL: RECORD STOCK MOVEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Physical Stock Movement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Movement Direction *</label>
                  <select
                    value={mvtType}
                    onChange={(e) => setMvtType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="IN">Stock IN (Receive / Add)</option>
                    <option value="OUT">Stock OUT (Issue / Deduct)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Target Warehouse *</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Main Headquarters & Showroom">Main Headquarters & Showroom</option>
                    <option value="Central Logistics Warehouse">Central Logistics Warehouse</option>
                    <option value="Dhanmondi Retail Branch">Dhanmondi Retail Branch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Reason / Purpose</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Purchase Inward">Purchase Inward</option>
                    <option value="Customer Return">Customer Return</option>
                    <option value="Sales Dispatch">Sales Dispatch</option>
                    <option value="Defective Discard">Defective Discard</option>
                    <option value="Internal Transfer">Internal Transfer</option>
                    <option value="Sample">Sample / Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Operator In-charge</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
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
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW MOVEMENT */}
      {viewingMvt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Stock Movement Voucher — {viewingMvt.refNo}</h3>
              <button onClick={() => setViewingMvt(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Direction:</span> <span className="font-bold text-slate-900 dark:text-white">{viewingMvt.type === 'IN' ? 'Stock IN (+)' : 'Stock OUT (-)'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Warehouse:</span> <span className="text-slate-900 dark:text-white">{viewingMvt.warehouse}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Item:</span> <span className="font-bold text-slate-900 dark:text-white">{viewingMvt.productName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">SKU:</span> <span className="font-mono text-slate-500">{viewingMvt.sku}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Quantity:</span> <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{viewingMvt.qty} {viewingMvt.unit}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason:</span> <span className="text-slate-900 dark:text-white">{viewingMvt.reason}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Operator:</span> <span className="text-slate-900 dark:text-white">{viewingMvt.operator}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="font-mono text-slate-500">{viewingMvt.date}</span></div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setViewingMvt(null)} className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
