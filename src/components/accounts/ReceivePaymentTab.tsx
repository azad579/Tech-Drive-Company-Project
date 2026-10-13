import React, { useState } from 'react';
import {
  ArrowDownLeft,
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
  CreditCard,
  Building,
  User,
  Phone,
  Receipt,
  Filter,
} from 'lucide-react';
import { INITIAL_PAYMENT_RECEIPTS, PaymentReceiptRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface ReceivePaymentTabProps {
  initialModeFilter?: string;
}

export const ReceivePaymentTab: React.FC<ReceivePaymentTabProps> = ({ initialModeFilter = 'All' }) => {
  const [receipts, setReceipts] = useState<PaymentReceiptRecord[]>(INITIAL_PAYMENT_RECEIPTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>(initialModeFilter);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceiptRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [partyName, setPartyName] = useState('Apex Data Systems Ltd');
  const [partyPhone, setPartyPhone] = useState('01712-334455');
  const [amount, setAmount] = useState<number>(50000);
  const [mode, setMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Card / Other'>('Cash');
  const [accountName, setAccountName] = useState('Main POS Cash Register');
  const [invoiceRef, setInvoiceRef] = useState('INV-2026-9041');
  const [notes, setNotes] = useState('Customer bill payment');

  const filtered = receipts.filter((r) => {
    if (modeFilter !== 'All' && r.mode !== modeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = r.receiptNo.toLowerCase().includes(q);
      const matchParty = r.partyName.toLowerCase().includes(q);
      const matchRef = (r.invoiceRef || '').toLowerCase().includes(q);
      const matchAcc = r.accountName.toLowerCase().includes(q);
      if (!matchNo && !matchParty && !matchRef && !matchAcc) return false;
    }
    return true;
  });

  const totalReceived = filtered.reduce((acc, r) => acc + r.amount, 0);

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: PaymentReceiptRecord = {
      id: `rcp-${Date.now()}`,
      receiptNo: `MR-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      amount,
      mode,
      accountName,
      invoiceRef: invoiceRef.trim() || undefined,
      notes: notes.trim(),
      status: 'Received',
    };

    setReceipts([newRecord, ...receipts]);
    setIsModalOpen(false);
  };

  const handleDeleteReceipt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment receipt voucher?')) {
      playClickSound();
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Top Action & Search Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, customer name, invoice ref, account..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Mode Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Cash', 'Bank Transfer', 'Cheque', 'Card / Other'].map((m) => (
            <button
              key={m}
              onClick={() => {
                playClickSound();
                setModeFilter(m);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                modeFilter === m
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}

          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Vouchers</span>
          <div className="text-lg font-mono font-bold text-white mt-0.5">{filtered.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Received</span>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{formatCurrency(totalReceived)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cash Collections</span>
          <div className="text-lg font-mono font-bold text-blue-400 mt-0.5">
            {formatCurrency(filtered.filter((r) => r.mode === 'Cash').reduce((acc, r) => acc + r.amount, 0))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bank & Cheque</span>
          <div className="text-lg font-mono font-bold text-purple-400 mt-0.5">
            {formatCurrency(filtered.filter((r) => r.mode === 'Bank Transfer' || r.mode === 'Cheque').reduce((acc, r) => acc + r.amount, 0))}
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Money Receipt #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer / Client</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Deposited Account</th>
              <th className="p-3">Invoice Ref</th>
              <th className="p-3 text-right">Amount Received</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                  No payment receipts found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{r.receiptNo}</td>
                  <td className="p-3 text-slate-300 font-mono">{r.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{r.partyName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.partyPhone}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.mode === 'Cash'
                          ? 'bg-blue-500/20 text-blue-300'
                          : r.mode === 'Bank Transfer'
                          ? 'bg-purple-500/20 text-purple-300'
                          : r.mode === 'Cheque'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      {r.mode}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{r.accountName}</td>
                  <td className="p-3 font-mono text-cyan-400">{r.invoiceRef || '—'}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{r.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingReceipt(r);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors cursor-pointer"
                        title="View & Print Money Receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(r.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete receipt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NEW PAYMENT RECEIPT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-200" />
                <span>Receive Payment · Money Receipt (MR)</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Customer / Client Name *</label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Apex Data Systems Ltd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    placeholder="01712-334455"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Invoice Reference</label>
                  <input
                    type="text"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="INV-2026-9041"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Amount Received (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Payment Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => {
                      const m = e.target.value as any;
                      setMode(m);
                      if (m === 'Cash') setAccountName('Main POS Cash Register');
                      else if (m === 'Bank Transfer') setAccountName('Brac Bank Current Account');
                      else if (m === 'Cheque') setAccountName('City Bank Business Account');
                      else setAccountName('City Bank POS Terminal');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card / Other">Card / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Deposit Into Account</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Particulars / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Receipt Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT RECEIPT MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6">
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  OFFICIAL MONEY RECEIPT (MR)
                </h2>
                <p className="text-xs text-slate-600">NextGen IT Systems Ltd. · Payment Voucher</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono font-bold text-emerald-700 text-sm">{viewingReceipt.receiptNo}</div>
                <div className="text-slate-500">{viewingReceipt.date}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Received From:</span>
                <span className="font-bold">{viewingReceipt.partyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono">{viewingReceipt.partyPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-mono font-bold">{viewingReceipt.invoiceRef || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold">{viewingReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposited Account:</span>
                <span>{viewingReceipt.accountName}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-900">Total Amount Received:</span>
              <span className="text-xl font-mono font-black text-emerald-700">
                {formatCurrency(viewingReceipt.amount)}
              </span>
            </div>

            <div className="text-xs text-slate-600 mb-6">
              <strong>Notes / Remarks:</strong> {viewingReceipt.notes || 'Payment recorded successfully.'}
            </div>

            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1 mt-6">Customer Signature</div>
              <div className="border-t border-slate-400 pt-1 mt-6">Cashier / Authorised Signatory</div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
