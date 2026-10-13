import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Download,
  X,
  Package,
} from 'lucide-react';
import { INITIAL_SALES_RETURNS, SalesReturnRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { Customer } from '../../types/pos';

interface SalesReturnsTabProps {
  customers?: Customer[];
}

export const SalesReturnsTab: React.FC<SalesReturnsTabProps> = ({ customers = [] }) => {
  const [returns, setReturns] = useState<SalesReturnRecord[]>(INITIAL_SALES_RETURNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [viewingReturn, setViewingReturn] = useState<SalesReturnRecord | null>(null);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);

  // New return form state
  const [invoiceRef, setInvoiceRef] = useState('SAL0015');
  const [customerName, setCustomerName] = useState(customers[0]?.name || 'MD. Shamim');
  const [customerPhone, setCustomerPhone] = useState(customers[0]?.phone || '01712-987654');
  const [itemName, setItemName] = useState('Surface Pro 7 (i5, 8GB, 256GB)');
  const [itemSku, setItemSku] = useState('MS-SP7-02');
  const [returnQty, setReturnQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(35500);
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'Credit Note' | 'Bank Transfer' | 'MFS'>('Credit Note');
  const [reason, setReason] = useState('Customer exchange / upgrade request');
  const [restocked, setRestocked] = useState(true);

  const filteredReturns = returns.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = r.returnNo.toLowerCase().includes(q);
      const matchInv = r.invoiceRef.toLowerCase().includes(q);
      const matchCust = r.customerName.toLowerCase().includes(q);
      const matchItem = r.itemsList.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNo && !matchInv && !matchCust && !matchItem) return false;
    }
    return true;
  });

  const totalRefundAmount = returns.reduce((sum, r) => sum + r.totalRefund, 0);

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    const newRecord: SalesReturnRecord = {
      id: `sr-${Date.now()}`,
      returnNo: `SR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      invoiceRef: invoiceRef.trim() || 'SAL-MANUAL',
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      itemsList: [
        {
          name: itemName.trim(),
          sku: itemSku.trim(),
          qty: returnQty,
          unitPrice: unitPrice,
          refundTotal: returnQty * unitPrice,
        },
      ],
      totalRefund: returnQty * unitPrice,
      restocked,
      reason: reason.trim(),
      refundMethod,
      status: 'Completed',
      createdBy: 'Forhad (Admin)',
    };

    setReturns([newRecord, ...returns]);
    setIsNewReturnModalOpen(false);
  };

  const handleDeleteReturn = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this sales return record?')) {
      setReturns(returns.filter((r) => r.id !== id));
      if (viewingReturn?.id === id) setViewingReturn(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Return No,Invoice Ref,Date,Customer,Phone,Refund Total,Method,Status,Reason\n'];
    const rows = filteredReturns.map(
      (r) =>
        `"${r.returnNo}","${r.invoiceRef}","${r.date}","${r.customerName}","${r.customerPhone}","${r.totalRefund}","${r.refundMethod}","${r.status}","${r.reason}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_returns_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans select-none">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search return memo, invoice ref, customer, item..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['All', 'Completed', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsNewReturnModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Return</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Returns</p>
            <p className="text-lg font-black text-white font-mono mt-0.5">{returns.length}</p>
            <p className="text-[10px] text-rose-400">Customer return memos</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Refunded</p>
            <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{formatCurrency(totalRefundAmount)}</p>
            <p className="text-[10px] text-slate-400">Cash / Credit Note</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Restocked to Inventory</p>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {returns.filter((r) => r.restocked).length} <span className="text-xs text-slate-400 font-normal">items</span>
            </p>
            <p className="text-[10px] text-emerald-400">Re-inventoried into warehouse</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Return Ref</th>
              <th className="p-3">Original Invoice</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items Returned</th>
              <th className="p-3 text-right">Refund Total</th>
              <th className="p-3 text-center">Restocked</th>
              <th className="p-3 text-center">Method</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredReturns.length > 0 ? (
              filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-rose-400">{ret.returnNo}</td>
                  <td className="p-3 font-mono text-blue-400">{ret.invoiceRef}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{ret.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{ret.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ret.customerPhone}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    {ret.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400">
                    {formatCurrency(ret.totalRefund)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        ret.restocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ret.restocked ? '✓ In Stock' : 'Discarded'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-300">{ret.refundMethod}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingReturn(ret);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View & Print Credit Note"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReturn(ret.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No sales return records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VIEW / PRINT CREDIT NOTE */}
      {viewingReturn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Credit Note Voucher / Sales Return</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingReturn.returnNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingReturn(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-750">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Customer Information</span>
                  <div className="text-sm font-bold text-white mt-1">{viewingReturn.customerName}</div>
                  <div className="text-slate-300 font-mono">{viewingReturn.customerPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Original Invoice Reference</span>
                  <div className="text-sm font-bold text-blue-400 font-mono mt-1">{viewingReturn.invoiceRef}</div>
                  <div className="text-slate-400">Return Date: {viewingReturn.date}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs mb-2">Returned Items</h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="p-2.5">Item &amp; SKU</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Refund Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {viewingReturn.itemsList.map((i, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5">
                            <div className="font-semibold text-white">{i.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{i.sku}</div>
                          </td>
                          <td className="p-2.5 text-center font-mono">{i.qty}</td>
                          <td className="p-2.5 text-right font-mono">{formatCurrency(i.unitPrice)}</td>
                          <td className="p-2.5 text-right font-mono text-rose-400 font-bold">
                            {formatCurrency(i.refundTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Return Reason:</span>
                  <span className="text-white font-medium">{viewingReturn.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Refund Settlement Method:</span>
                  <span className="text-white font-bold">{viewingReturn.refundMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Physical Stock Reversal:</span>
                  <span className="text-emerald-400 font-bold">{viewingReturn.restocked ? 'Restocked to inventory' : 'Scrapped / Defective'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold">
                  <span className="text-white">Total Refund Amount:</span>
                  <span className="text-rose-400 font-mono">{formatCurrency(viewingReturn.totalRefund)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteReturn(viewingReturn.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingReturn(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Credit Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW SALES RETURN */}
      {isNewReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Record New Sales Return</span>
              </h3>
              <button onClick={() => setIsNewReturnModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Invoice Reference *</label>
                  <input
                    type="text"
                    required
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Refund Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Credit Note">Credit Note / Wallet</option>
                    <option value="Cash">Cash Return</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="MFS">bKash / Nagad</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Returned Product Name *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={itemSku}
                      onChange={(e) => setItemSku(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={returnQty}
                      onChange={(e) => setReturnQty(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Unit Refund ৳</label>
                    <input
                      type="number"
                      min={0}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reason for Return</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Incompatible hardware / customer upgrade"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={restocked}
                    onChange={(e) => setRestocked(e.target.checked)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Automatically restock item into active inventory</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Total Refund:</span>{' '}
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    {formatCurrency(returnQty * unitPrice)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewReturnModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                  >
                    Confirm Return
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
