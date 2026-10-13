import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  Download,
  X,
  Truck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_STOCK_TRANSFERS, StockTransferRecord } from '../../data/mockErpData';
import { Product } from '../../types/pos';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface StockTransferTabProps {
  products?: Product[];
}

export const StockTransferTab: React.FC<StockTransferTabProps> = ({ products = [] }) => {
  const [transfers, setTransfers] = useState<StockTransferRecord[]>(INITIAL_STOCK_TRANSFERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Transit' | 'Pending'>('All');
  const [viewingTransfer, setViewingTransfer] = useState<StockTransferRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [fromWarehouse, setFromWarehouse] = useState('Central Logistics Warehouse');
  const [toWarehouse, setToWarehouse] = useState('Main Headquarters & Showroom');
  const [itemName, setItemName] = useState(products[0]?.name || 'ThinkPad T14 Gen 4');
  const [itemSku, setItemSku] = useState(products[0]?.sku || 'TP-T14-G4');
  const [qty, setQty] = useState(2);
  const [unit, setUnit] = useState('Unit');
  const [vehicleRef, setVehicleRef] = useState('Delivery Van Dhaka-Metro-Tha 14-8821');
  const [dispatchedBy, setDispatchedBy] = useState('Logistics Supervisor (Arif)');

  const filtered = transfers.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = t.transferNo.toLowerCase().includes(q);
      const matchFrom = t.fromWarehouse.toLowerCase().includes(q);
      const matchTo = t.toWarehouse.toLowerCase().includes(q);
      const matchItem = t.itemsList.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNo && !matchFrom && !matchTo && !matchItem) return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: StockTransferRecord = {
      id: `trf-${Date.now()}`,
      transferNo: `TRF-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      fromWarehouse,
      toWarehouse,
      itemsList: [
        {
          name: itemName.trim(),
          sku: itemSku.trim(),
          qty,
          unit,
        },
      ],
      dispatchedBy: dispatchedBy.trim(),
      receivedBy: 'Branch In-charge',
      status: 'In Transit',
      vehicleRef: vehicleRef.trim(),
    };

    setTransfers([newRecord, ...transfers]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this stock transfer?')) {
      setTransfers(transfers.filter((t) => t.id !== id));
      if (viewingTransfer?.id === id) setViewingTransfer(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Transfer #,Date,From,To,Items,Vehicle,Status\n'];
    const rows = filtered.map(
      (t) => `"${t.transferNo}","${t.date}","${t.fromWarehouse}","${t.toWarehouse}","${t.itemsList.map((i) => `${i.name} (${i.qty})`).join('; ')}","${t.vehicleRef || ''}","${t.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_transfers_${new Date().toISOString().slice(0, 10)}.csv`;
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
            placeholder="Search transfer #, origin, destination..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'Completed', 'In Transit', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  statusFilter === st ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

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
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Transfer</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Transfer #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Source Warehouse</th>
              <th className="p-3">Destination Branch</th>
              <th className="p-3">Items Transferred</th>
              <th className="p-3">Transport / Carrier</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">{t.transferNo}</td>
                <td className="p-3 text-slate-500 font-mono">{t.date}</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{t.fromWarehouse}</td>
                <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  <span>{t.toWarehouse}</span>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {t.itemsList.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
                </td>
                <td className="p-3 text-slate-500">{t.vehicleRef || 'N/A'}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        playClickSound();
                        setViewingTransfer(t);
                      }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="View Challan"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title="Delete transfer"
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

      {/* MODAL: NEW TRANSFER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inter-Branch Stock Transfer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Origin Warehouse *</label>
                  <select
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Central Logistics Warehouse">Central Logistics Warehouse</option>
                    <option value="Main Headquarters & Showroom">Main Headquarters & Showroom</option>
                    <option value="Dhanmondi Retail Branch">Dhanmondi Retail Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Destination Branch *</label>
                  <select
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="Main Headquarters & Showroom">Main Headquarters & Showroom</option>
                    <option value="Dhanmondi Retail Branch">Dhanmondi Retail Branch</option>
                    <option value="Banani Corporate Outlet">Banani Corporate Outlet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Product Description *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">SKU</label>
                  <input
                    type="text"
                    value={itemSku}
                    onChange={(e) => setItemSku(e.target.value)}
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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Vehicle / Carrier Details</label>
                  <input
                    type="text"
                    value={vehicleRef}
                    onChange={(e) => setVehicleRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Dispatched By</label>
                  <input
                    type="text"
                    value={dispatchedBy}
                    onChange={(e) => setDispatchedBy(e.target.value)}
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
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Issue Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW TRANSFER */}
      {viewingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Transfer Challan — {viewingTransfer.transferNo}</h3>
              <button onClick={() => setViewingTransfer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">From:</span> <span className="font-bold text-slate-900 dark:text-white">{viewingTransfer.fromWarehouse}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">To:</span> <span className="font-bold text-purple-600 dark:text-purple-400">{viewingTransfer.toWarehouse}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Items:</span> <span className="text-slate-900 dark:text-white">{viewingTransfer.itemsList.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Vehicle:</span> <span className="text-slate-900 dark:text-white">{viewingTransfer.vehicleRef}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Dispatched By:</span> <span className="text-slate-900 dark:text-white">{viewingTransfer.dispatchedBy}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="font-bold text-emerald-600">{viewingTransfer.status}</span></div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setViewingTransfer(null)} className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer">
                Print Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
