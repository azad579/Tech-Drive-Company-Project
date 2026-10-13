import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { INITIAL_CHEQUES, ChequeRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export const ChequeManagementTab: React.FC = () => {
  const [cheques, setCheques] = useState<ChequeRecord[]>(INITIAL_CHEQUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Cleared' | 'Bounced'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Received' | 'Issued'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [chequeNo, setChequeNo] = useState('CQ-889901');
  const [bankName, setBankName] = useState('Islami Bank Bangladesh Ltd');
  const [accountNo, setAccountNo] = useState('2050114020089');
  const [partyName, setPartyName] = useState('Apex Data Systems Ltd');
  const [amount, setAmount] = useState<number>(65000);
  const [issueDate, setIssueDate] = useState('2026-10-08');
  const [maturityDate, setMaturityDate] = useState('2026-10-15');
  const [type, setType] = useState<'Received' | 'Issued'>('Received');
  const [notes, setNotes] = useState('Corporate invoice clearing cheque');

  const filtered = cheques.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (typeFilter !== 'All' && c.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = c.chequeNo.toLowerCase().includes(q);
      const matchBank = c.bankName.toLowerCase().includes(q);
      const matchParty = c.partyName.toLowerCase().includes(q);
      if (!matchNo && !matchBank && !matchParty) return false;
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: 'Pending' | 'Cleared' | 'Bounced') => {
    playClickSound();
    setCheques((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleCreateCheque = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: ChequeRecord = {
      id: `chq-${Date.now()}`,
      chequeNo: chequeNo.trim(),
      bankName: bankName.trim(),
      accountNo: accountNo.trim(),
      partyName: partyName.trim(),
      amount,
      issueDate,
      maturityDate,
      type,
      status: 'Pending',
      notes: notes.trim(),
    };

    setCheques([newRecord, ...cheques]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Search & Actions Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cheque #, bank, party name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            {['All', 'Pending', 'Cleared', 'Bounced'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  statusFilter === s ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cheque</span>
          </button>
        </div>
      </div>

      {/* Cheques Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Cheque #</th>
              <th className="p-3">Type</th>
              <th className="p-3">Bank &amp; Account</th>
              <th className="p-3">Party Name</th>
              <th className="p-3">Issue Date</th>
              <th className="p-3">Maturity Date</th>
              <th className="p-3 text-right">Cheque Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/70 transition-colors">
                <td className="p-3 font-mono font-bold text-amber-400">{c.chequeNo}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                      c.type === 'Received' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {c.type === 'Received' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    <span>{c.type}</span>
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-white">{c.bankName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.accountNo}</div>
                </td>
                <td className="p-3 font-medium text-slate-200">{c.partyName}</td>
                <td className="p-3 font-mono text-slate-400">{c.issueDate}</td>
                <td className="p-3 font-mono text-amber-300 font-bold">{c.maturityDate}</td>
                <td className="p-3 text-right font-mono font-bold text-white text-sm">
                  {formatCurrency(c.amount)}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Cleared'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : c.status === 'Bounced'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {c.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Cleared')}
                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Bounced')}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Bounce
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Print Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW CHEQUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-200" />
                <span>Register Cheque</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCheque} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Cheque Direction</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Received">Received from Customer</option>
                    <option value="Issued">Issued to Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Cheque Number *</label>
                  <input
                    type="text"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Bank Name *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Account Number</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Party Name *</label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Amount (৳) *</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Maturity Date</label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Notes</label>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Cheque Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
