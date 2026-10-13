import React, { useState } from 'react';
import {
  ArrowUpRight,
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
  FileText,
  Filter,
} from 'lucide-react';
import { INITIAL_PAYMENT_VOUCHERS, PaymentVoucherRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface MakePaymentTabProps {
  initialModeFilter?: string;
}

export const MakePaymentTab: React.FC<MakePaymentTabProps> = ({ initialModeFilter = 'All' }) => {
  const [vouchers, setVouchers] = useState<PaymentVoucherRecord[]>(INITIAL_PAYMENT_VOUCHERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>(initialModeFilter);
  const [viewingVoucher, setViewingVoucher] = useState<PaymentVoucherRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [partyName, setPartyName] = useState('Global Tech Distribution Ltd');
  const [amount, setAmount] = useState<number>(100000);
  const [mode, setMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Card / Other'>('Bank Transfer');
  const [accountName, setAccountName] = useState('Brac Bank Current Account');
  const [category, setCategory] = useState('Supplier Payment');
  const [refNo, setRefNo] = useState('PB-2026-0021');
  const [notes, setNotes] = useState('Vendor shipment partial settlement');

  const filtered = vouchers.filter((v) => {
    if (modeFilter !== 'All' && v.mode !== modeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = v.voucherNo.toLowerCase().includes(q);
      const matchParty = v.partyName.toLowerCase().includes(q);
      const matchRef = (v.refNo || '').toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      if (!matchNo && !matchParty && !matchRef && !matchCat) return false;
    }
    return true;
  });

  const totalPaid = filtered.reduce((acc, v) => acc + v.amount, 0);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: PaymentVoucherRecord = {
      id: `pv-${Date.now()}`,
      voucherNo: `PV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      partyName: partyName.trim(),
      amount,
      mode,
      accountName,
      category,
      refNo: refNo.trim() || undefined,
      notes: notes.trim(),
      status: 'Disbursed',
    };

    setVouchers([newRecord, ...vouchers]);
    setIsModalOpen(false);
  };

  const handleDeleteVoucher = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment payout voucher?')) {
      playClickSound();
      setVouchers((prev) => prev.filter((v) => v.id !== id));
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
              placeholder="Search voucher #, vendor/party name, bill ref, category..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                  ? 'bg-rose-600 text-white'
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
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Make Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Disbursed</span>
          <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vendor Payouts</span>
          <div className="text-lg font-mono font-bold text-white mt-0.5">
            {formatCurrency(filtered.filter((v) => v.category === 'Supplier Payment').reduce((acc, v) => acc + v.amount, 0))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Operational Expenses</span>
          <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">
            {formatCurrency(filtered.filter((v) => v.category !== 'Supplier Payment').reduce((acc, v) => acc + v.amount, 0))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Voucher Count</span>
          <div className="text-lg font-mono font-bold text-slate-300 mt-0.5">{filtered.length} Vouchers</div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Payment Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Payee / Party Name</th>
              <th className="p-3">Expense Category</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Paid From Account</th>
              <th className="p-3">Ref Bill #</th>
              <th className="p-3 text-right">Disbursed Amount</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                  No payment payout vouchers found.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-rose-400">{v.voucherNo}</td>
                  <td className="p-3 text-slate-300 font-mono">{v.date}</td>
                  <td className="p-3 font-bold text-white">{v.partyName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                      {v.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.mode === 'Cash'
                          ? 'bg-blue-500/20 text-blue-300'
                          : v.mode === 'Bank Transfer'
                          ? 'bg-purple-500/20 text-purple-300'
                          : v.mode === 'Cheque'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      {v.mode}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{v.accountName}</td>
                  <td className="p-3 font-mono text-purple-400">{v.refNo || '—'}</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400 text-sm">
                    {formatCurrency(v.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingVoucher(v);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors cursor-pointer"
                        title="View & Print Payment Voucher"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete voucher"
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

      {/* NEW PAYMENT VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-200" />
                <span>Make Payment · Debit Voucher</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Payee / Vendor / Party *</label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Global Tech Distribution Ltd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Expense Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Supplier Payment">Supplier Payment</option>
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                    <option value="Showroom Rent">Showroom Rent</option>
                    <option value="Office Refreshment">Office Refreshment</option>
                    <option value="Repair & Maintenance">Repair & Maintenance</option>
                    <option value="Logistics & Delivery">Logistics & Delivery</option>
                    <option value="Other Expenses">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Bill / PO Ref</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="PB-2026-0021"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Amount to Pay (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-rose-400 font-mono font-bold text-sm"
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
                      else if (m === 'Cheque') setAccountName('Brac Bank Current Account');
                      else setAccountName('City Bank Business Account');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card / Other">Card / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Disburse From Account</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Notes / Remarks</label>
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Confirm &amp; Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT VOUCHER MODAL */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6">
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  DEBIT PAYMENT VOUCHER
                </h2>
                <p className="text-xs text-slate-600">NextGen IT Systems Ltd. · Financial Disbursement</p>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono font-bold text-rose-700 text-sm">{viewingVoucher.voucherNo}</div>
                <div className="text-slate-500">{viewingVoucher.date}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Paid To (Payee):</span>
                <span className="font-bold">{viewingVoucher.partyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold">{viewingVoucher.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill / PO Ref:</span>
                <span className="font-mono font-bold">{viewingVoucher.refNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold">{viewingVoucher.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid From Account:</span>
                <span>{viewingVoucher.accountName}</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-rose-900">Total Amount Disbursed:</span>
              <span className="text-xl font-mono font-black text-rose-700">
                {formatCurrency(viewingVoucher.amount)}
              </span>
            </div>

            <div className="text-xs text-slate-600 mb-6">
              <strong>Notes / Remarks:</strong> {viewingVoucher.notes || 'Payment disbursed successfully.'}
            </div>

            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1 mt-6">Receiver Signature</div>
              <div className="border-t border-slate-400 pt-1 mt-6">Accounts &amp; Finance Approved</div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
