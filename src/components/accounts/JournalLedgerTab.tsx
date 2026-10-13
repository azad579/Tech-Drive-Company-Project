import React, { useState } from 'react';
import {
  FileText,
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
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { INITIAL_JOURNAL_ENTRIES, JournalEntryRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export const JournalLedgerTab: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntryRecord[]>(INITIAL_JOURNAL_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [debitAccount, setDebitAccount] = useState('Brac Bank Current Account');
  const [creditAccount, setCreditAccount] = useState('Accounts Receivable (Apex Data Systems)');
  const [amount, setAmount] = useState<number>(50000);
  const [narration, setNarration] = useState('Double entry adjustment entry');
  const [recordedBy, setRecordedBy] = useState('Forhad (Admin)');

  const filtered = entries.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = e.journalNo.toLowerCase().includes(q);
      const matchDr = e.debitAccount.toLowerCase().includes(q);
      const matchCr = e.creditAccount.toLowerCase().includes(q);
      const matchNarration = e.narration.toLowerCase().includes(q);
      if (!matchNo && !matchDr && !matchCr && !matchNarration) return false;
    }
    return true;
  });

  const totalAmount = filtered.reduce((acc, e) => acc + e.amount, 0);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: JournalEntryRecord = {
      id: `jrn-${Date.now()}`,
      journalNo: `JV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      debitAccount: debitAccount.trim(),
      creditAccount: creditAccount.trim(),
      amount,
      narration: narration.trim(),
      recordedBy,
    };

    setEntries([newRecord, ...entries]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Top Search & Actions Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voucher #, account name, narration..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Journal</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal Voucher</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Journal Vouchers</span>
          <div className="text-lg font-mono font-bold text-white mt-0.5">{filtered.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Debits</span>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Credits</span>
          <div className="text-lg font-mono font-bold text-blue-400 mt-0.5">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Trial Balance Variance</span>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">৳0.00 (Balanced)</div>
        </div>
      </div>

      {/* Journal Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">JV Number</th>
              <th className="p-3">Date</th>
              <th className="p-3">Debit Account (Dr.)</th>
              <th className="p-3">Credit Account (Cr.)</th>
              <th className="p-3 text-right">Debit ৳</th>
              <th className="p-3 text-right">Credit ৳</th>
              <th className="p-3">Narration / Particulars</th>
              <th className="p-3">Recorded By</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-slate-900/70 transition-colors">
                <td className="p-3 font-mono font-bold text-amber-400">{j.journalNo}</td>
                <td className="p-3 text-slate-300 font-mono">{j.date}</td>
                <td className="p-3 font-bold text-emerald-400">{j.debitAccount}</td>
                <td className="p-3 font-bold text-blue-400">{j.creditAccount}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(j.amount)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-400 text-sm">
                  {formatCurrency(j.amount)}
                </td>
                <td className="p-3 text-slate-300 max-w-xs">{j.narration}</td>
                <td className="p-3 text-slate-400 text-[11px]">{j.recordedBy}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => window.print()}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Print JV Voucher"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW JOURNAL ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-200" />
                <span>Post General Journal Voucher</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Debit Account (Dr.) *</label>
                <input
                  type="text"
                  value={debitAccount}
                  onChange={(e) => setDebitAccount(e.target.value)}
                  placeholder="e.g. Brac Bank Current Account"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Credit Account (Cr.) *</label>
                <input
                  type="text"
                  value={creditAccount}
                  onChange={(e) => setCreditAccount(e.target.value)}
                  placeholder="e.g. Accounts Receivable"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Transaction Amount (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Authorised Signatory</label>
                  <input
                    type="text"
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Narration / Explanation *</label>
                <textarea
                  rows={2}
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Full business rationale for double entry ledger booking..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
