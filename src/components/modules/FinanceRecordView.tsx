import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Calendar,
  Filter,
  Receipt,
  Printer,
  Eye,
  Edit2,
  Trash2,
  X,
  FileText,
  Building,
  CheckCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export interface FinanceTransaction {
  id: string;
  voucherNo: string;
  type: 'Income' | 'Expense' | 'Due Collection' | 'Vendor Payment';
  partyName: string;
  partyPhone?: string;
  description: string;
  category: string;
  amount: number;
  paymentMode: string;
  date: string;
  recordedBy: string;
  previousBalance?: number;
  remainingBalance?: number;
}

const INITIAL_FINANCE: FinanceTransaction[] = [
  {
    id: 'fn-1',
    voucherNo: 'VCH-2026-1041',
    type: 'Income',
    partyName: 'Walk-in Retail Counter',
    partyPhone: '+880 1711-223344',
    description: 'POS Counter Daily Cash Sales & Services',
    category: 'Sales',
    amount: 85000,
    paymentMode: 'Cash Drawer',
    date: '2026-10-07',
    recordedBy: 'Forhad',
    previousBalance: 0,
    remainingBalance: 0,
  },
  {
    id: 'fn-2',
    voucherNo: 'VCH-2026-1042',
    type: 'Expense',
    partyName: 'Amber IT Broadband Ltd.',
    partyPhone: '+880 1912-345678',
    description: 'Shop Dedicated Fiber Internet Bill (October 2026)',
    category: 'Utilities',
    amount: 3500,
    paymentMode: 'bKash Merchant',
    date: '2026-10-06',
    recordedBy: 'Forhad',
    previousBalance: 3500,
    remainingBalance: 0,
  },
  {
    id: 'fn-3',
    voucherNo: 'VCH-2026-1043',
    type: 'Vendor Payment',
    partyName: 'Global Tech Distributors Ltd.',
    partyPhone: '+880 1712-998877',
    description: 'B2B Partial Due Payment for Dell & HP Laptop Consignment',
    category: 'Supplier Due',
    amount: 45000,
    paymentMode: 'Brac Bank Wire',
    date: '2026-10-05',
    recordedBy: 'Forhad',
    previousBalance: 125000,
    remainingBalance: 80000, // Remaining due after payment
  },
  {
    id: 'fn-4',
    voucherNo: 'VCH-2026-1044',
    type: 'Due Collection',
    partyName: 'Apex Technologies Ltd.',
    partyPhone: '+880 1819-334455',
    description: 'B2B Corporate Credit Payment Collection (INV-2026-8812)',
    category: 'Client Due',
    amount: 32000,
    paymentMode: 'City Bank Card',
    date: '2026-10-04',
    recordedBy: 'Forhad',
    previousBalance: 52000,
    remainingBalance: 20000, // Remaining due after collection
  },
  {
    id: 'fn-5',
    voucherNo: 'VCH-2026-1045',
    type: 'Expense',
    partyName: 'Daily Refreshment Store',
    description: 'Staff tea, snacks & client hospitality refreshments',
    category: 'Office Expense',
    amount: 850,
    paymentMode: 'Cash Drawer',
    date: '2026-10-03',
    recordedBy: 'Forhad',
    previousBalance: 0,
    remainingBalance: 0,
  },
];

export const FinanceRecordView: React.FC = () => {
  const [records, setRecords] = useState<FinanceTransaction[]>(INITIAL_FINANCE);

  // Global Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<FinanceTransaction | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<FinanceTransaction | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<FinanceTransaction | null>(null);

  // New Entry Form State
  const [type, setType] = useState<'Income' | 'Expense' | 'Due Collection' | 'Vendor Payment'>('Expense');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Office Expense');
  const [amount, setAmount] = useState<number>(1500);
  const [paymentMode, setPaymentMode] = useState('Cash Drawer');
  const [previousBalance, setPreviousBalance] = useState<number>(0);

  // KPI Calculations
  const totalIncome = records
    .filter((r) => r.type === 'Income' || r.type === 'Due Collection')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records
    .filter((r) => r.type === 'Expense' || r.type === 'Vendor Payment')
    .reduce((sum, r) => sum + r.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    playCashDrawerDing();
    const calculatedRemaining = Math.max(0, previousBalance - amount);
    const newRecord: FinanceTransaction = {
      id: `fn-${Date.now()}`,
      voucherNo: `VCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      partyName: partyName.trim() || (type === 'Expense' ? 'General Payee' : 'Retail Customer'),
      partyPhone: partyPhone.trim(),
      description: description.trim(),
      category,
      amount,
      paymentMode,
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'Forhad',
      previousBalance,
      remainingBalance: calculatedRemaining,
    };

    setRecords([newRecord, ...records]);
    setIsNewModalOpen(false);
    setDescription('');
    setPartyName('');
    setPartyPhone('');
    setAmount(1000);
    setPreviousBalance(0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;
    playClickSound();

    setRecords((prev) =>
      prev.map((r) => (r.id === editingVoucher.id ? editingVoucher : r))
    );
    setViewingVoucher(editingVoucher);
    setEditingVoucher(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingVoucher) return;
    playClickSound();
    setRecords((prev) => prev.filter((r) => r.id !== deletingVoucher.id));
    setDeletingVoucher(null);
  };

  const handlePrintA4Voucher = () => {
    playClickSound();
    window.print();
  };

  // Filtered Records logic
  const filtered = records.filter((r) => {
    if (filterType !== 'All' && r.type !== filterType) return false;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVch = r.voucherNo.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchParty = r.partyName.toLowerCase().includes(q);
      const matchPhone = r.partyPhone?.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      if (!matchVch && !matchDesc && !matchParty && !matchPhone && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <span>7. ACCOUNTS &amp; FINANCE</span>
            <span>›</span>
            <span className="text-white font-semibold">Cash Book, Vouchers &amp; Receipts</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <span>7.5 Expense Voucher &amp; Payment Slips (A4 Optimized)</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setIsNewModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Voucher Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/60 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Inflow (জমা)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sales &amp; Customer Due Collections</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Outflow (খরচ/পরিশোধ)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Operating Expenses &amp; Vendor Payments</p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Net Liquid Balance</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {formatCurrency(netCashFlow)}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Active operational funds</p>
        </div>
      </div>

      {/* Global Search & Advanced Filtering Top Bar */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by voucher #, party, purpose..."
            className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdown & Date Range */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-750 px-2.5 py-1 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-slate-850">All Voucher Types</option>
              <option value="Income" className="bg-slate-850">Income / Cash In</option>
              <option value="Expense" className="bg-slate-850">Expense / Outflow</option>
              <option value="Due Collection" className="bg-slate-850">Customer Due Collection</option>
              <option value="Vendor Payment" className="bg-slate-850">Vendor / Supplier Payment</option>
            </select>
          </div>

          {/* Date Range Picker (From Date & To Date) */}
          <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-750 px-2.5 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-hidden cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-medium ml-1">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-hidden cursor-pointer"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="text-[10px] text-slate-400 hover:text-white px-1 ml-1"
                title="Clear date range"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table - Clean, uncluttered list without See/Edit/Del buttons */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Voucher Ref</th>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Party / Beneficiary</th>
              <th className="p-3">Description &amp; Category</th>
              <th className="p-3">Payment Account</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-right">Remaining Due</th>
              <th className="p-3 text-center">Document Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((r) => {
                const isPositive = r.type === 'Income' || r.type === 'Due Collection';
                return (
                  <tr key={r.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">
                      {r.voucherNo}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{r.date}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{r.partyName}</div>
                      {r.partyPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{r.partyPhone}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      <span className="font-medium text-white">{r.description}</span>
                      <span className="text-[10px] text-slate-400 block">Category: {r.category}</span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px]">{r.paymentMode}</td>
                    <td
                      className={`p-3 text-right font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-amber-400">
                      {r.remainingBalance !== undefined && r.remainingBalance > 0
                        ? formatCurrency(r.remainingBalance)
                        : '৳0'}
                    </td>
                    {/* Clean single Open Voucher button */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setViewingVoucher(r);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-blue-800/70 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Open voucher to View, Edit, Print or Delete"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Voucher</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No transaction records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* A4 PRINTABLE DOCUMENT MODAL WITH VIEW, EDIT, PRINT, DELETE ACTIONS       */}
      {/* ========================================================================= */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Action Bar Header with View, Edit, Print, Delete inside the transaction */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">
                  Payment Slip Voucher · {viewingVoucher.voucherNo}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  A4 Optimized
                </span>
              </div>

              {/* 4 Core In-Voucher Actions: View, Edit, Print, Delete */}
              <div className="flex items-center gap-2">
                {/* 1. VIEW */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                  }}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-default shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {/* 2. EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setEditingVoucher({ ...viewingVoucher });
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit voucher details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* 3. PRINT (A4 Paper Optimized) */}
                <button
                  type="button"
                  onClick={handlePrintA4Voucher}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Print official A4 Payment Slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* 4. DELETE */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const target = viewingVoucher;
                    setViewingVoucher(null);
                    setDeletingVoucher(target);
                  }}
                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete voucher permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingVoucher(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official A4 Size Document Sheet */}
            <div
              id="printable-a4-voucher"
              className="p-6 md:p-8 overflow-y-auto space-y-5 bg-white text-slate-900 font-sans"
            >
              {/* Store & Company Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                    NEXTGEN IT SYSTEMS LTD.
                  </h2>
                  <p className="text-xs text-slate-600">
                    Level 5, Computer City Centre, Multiplan, New Elephant Road, Dhaka-1205
                  </p>
                  <p className="text-xs text-slate-600">
                    BIN / VAT Reg: <strong>003928192-0101</strong> · Phone: +880 1711-000000
                  </p>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mt-1">
                    Official Financial Money Receipt / Payment Slip
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Voucher Number
                  </div>
                  <div className="text-base font-mono font-black text-blue-700">
                    {viewingVoucher.voucherNo}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">Date: {viewingVoucher.date}</div>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingVoucher.type === 'Income' || viewingVoucher.type === 'Due Collection'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {viewingVoucher.type}
                  </span>
                </div>
              </div>

              {/* Party Information */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                    {viewingVoucher.type === 'Income' || viewingVoucher.type === 'Due Collection'
                      ? 'Received With Thanks From (Client):'
                      : 'Paid To (Beneficiary / Supplier):'}
                  </div>
                  <div className="font-black text-base text-slate-900">
                    {viewingVoucher.partyName}
                  </div>
                  {viewingVoucher.partyPhone && (
                    <div className="text-slate-600 font-mono mt-0.5">
                      Phone / Mobile: {viewingVoucher.partyPhone}
                    </div>
                  )}
                  <div className="text-slate-500 text-[11px] mt-1">
                    Accounting Category: <strong>{viewingVoucher.category}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                    Payment Method &amp; Handled By
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    {viewingVoucher.paymentMode}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Authorized Cashier: <strong>{viewingVoucher.recordedBy || 'Forhad'}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    System Audit: Verified &amp; Balanced
                  </div>
                </div>
              </div>

              {/* Particulars & Amount Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Particulars / Payment Description</th>
                      <th className="p-3 text-center">Category</th>
                      <th className="p-3 text-right">Transaction Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium text-slate-900">
                        {viewingVoucher.description}
                      </td>
                      <td className="p-3 text-center text-slate-600 font-mono">
                        {viewingVoucher.category}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-sm text-slate-900">
                        {formatCurrency(viewingVoucher.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CRITICAL REQUIREMENT: Clear Display of Remaining Balance (Outstanding Due) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/40 border-2 border-amber-300 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Previous Balance (আগের বকেয়া / স্থিতি):</span>
                  <span className="font-mono text-sm font-semibold">
                    {formatCurrency(viewingVoucher.previousBalance || viewingVoucher.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Current Transaction Amount (বর্তমান লেনদেন):</span>
                  <span className="font-mono text-sm font-semibold text-blue-600">
                    {formatCurrency(viewingVoucher.amount)}
                  </span>
                </div>

                {/* Outstanding Remaining Balance Highlight Card */}
                <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-black text-slate-950 uppercase tracking-tight block">
                      REMAINING BALANCE / OUTSTANDING DUE (অবশিষ্ট বকেয়া)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Calculated outstanding due right after this transaction
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                      {formatCurrency(viewingVoucher.remainingBalance || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Authorization & Signatures (A4 Footer Standard) */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1 pb-4" />
                  <p className="font-semibold text-slate-700">Prepared By</p>
                  <p className="text-[10px]">{viewingVoucher.recordedBy || 'Forhad'}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1 pb-4" />
                  <p className="font-semibold text-slate-700">Client / Receiver Signature</p>
                  <p className="text-[10px]">Verified Beneficiary</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1 pb-4" />
                  <p className="font-semibold text-slate-700">Authorized Manager</p>
                  <p className="text-[10px]">NextGen IT ERP Approved</p>
                </div>
              </div>
            </div>

            {/* Modal Footer with Close button */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="font-mono text-[11px]">NextGen IT Official Voucher Receipt · v2.5</span>
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <span>Edit Voucher: {editingVoucher.voucherNo}</span>
              <button onClick={() => setEditingVoucher(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs text-slate-200">
              <div>
                <label className="block font-semibold mb-1">Party / Payee Name</label>
                <input
                  type="text"
                  value={editingVoucher.partyName}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, partyName: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Particulars</label>
                <input
                  type="text"
                  value={editingVoucher.description}
                  onChange={(e) =>
                    setEditingVoucher({ ...editingVoucher, description: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    value={editingVoucher.amount}
                    onChange={(e) =>
                      setEditingVoucher({
                        ...editingVoucher,
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Remaining Due (৳)</label>
                  <input
                    type="number"
                    value={editingVoucher.remainingBalance || 0}
                    onChange={(e) =>
                      setEditingVoucher({
                        ...editingVoucher,
                        remainingBalance: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVoucher(null)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Permanently Delete Voucher?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Are you sure you want to delete voucher{' '}
              <strong className="text-rose-400 font-mono">{deletingVoucher.voucherNo}</strong> for{' '}
              {deletingVoucher.partyName}? This action cannot be reversed.
            </p>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeletingVoucher(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Voucher Entry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <span>New Cash Voucher &amp; Payment Entry</span>
              <button onClick={() => setIsNewModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveNew} className="p-5 space-y-3.5 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Expense">Expense / Outflow</option>
                    <option value="Income">Income / Cash In</option>
                    <option value="Due Collection">Customer Due Collection</option>
                    <option value="Vendor Payment">Vendor Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Party / Payee Name</label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="Customer or Supplier..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Party Phone</label>
                  <input
                    type="text"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    placeholder="e.g. 01700..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Office courier, shop rent, client due settlement..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Previous Balance / Due (৳)</label>
                  <input
                    type="number"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(Number(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold text-xs"
                    placeholder="e.g. 25000"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs font-semibold"
                  >
                    <option value="Cash Drawer">Cash Drawer</option>
                    <option value="Brac Bank">Brac Bank (A/C: 1501...)</option>
                    <option value="City Bank">City Bank (A/C: 2102...)</option>
                    <option value="bKash Merchant">bKash Merchant</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                <span>Calculated Remaining Due:</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(Math.max(0, previousBalance - amount))}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 shadow-xs"
                >
                  Record Entry &amp; Generate A4 Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
