import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Filter,
  ShieldCheck,
  FileText,
  User,
  Hash,
  Sparkles,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Customer } from '../../types/pos';
import {
  ClientLedgerEntry,
  ClientTransactionType,
} from '../../types/clientLedger';
import { INITIAL_CLIENT_LEDGERS } from '../../data/mockClientLedgers';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';

interface ClientLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdateCustomerBalance?: (
    customerId: string,
    newBalance: number,
    newCreditLimit?: number
  ) => void;
}

export const ClientLedgerModal: React.FC<ClientLedgerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onUpdateCustomerBalance,
}) => {
  // Load ledgers with localStorage persistence
  const [allLedgers, setAllLedgers] = useState<ClientLedgerEntry[]>(() => {
    const saved = localStorage.getItem('nextgen_client_ledgers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse client ledgers', e);
      }
    }
    return INITIAL_CLIENT_LEDGERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Debit' | 'Credit'>('All');
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'INVOICE_DEBIT' | 'PAYMENT_CREDIT'>('INVOICE_DEBIT');
  const [txAmount, setTxAmount] = useState<number>(10000);
  const [txReference, setTxReference] = useState<string>('');
  const [txParticulars, setTxParticulars] = useState<string>('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<
    'Cash' | 'Bank Transfer' | 'Cheque' | 'bKash / MFS' | 'Credit Memo'
  >('Bank Transfer');
  const [txNotes, setTxNotes] = useState<string>('');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nextgen_client_ledgers', JSON.stringify(allLedgers));
  }, [allLedgers]);

  // Set default reference whenever transaction type changes
  useEffect(() => {
    if (txType === 'INVOICE_DEBIT') {
      setTxReference(`INV-2026-${Math.floor(9050 + Math.random() * 900)}`);
      setTxParticulars('B2B Equipment Purchase Invoice');
      setTxPaymentMethod('Credit Memo');
    } else {
      setTxReference(`RCP-2026-${Math.floor(100 + Math.random() * 900)}`);
      setTxParticulars('Corporate Payment Collection Receipt');
      setTxPaymentMethod('Bank Transfer');
    }
  }, [txType, isNewTxOpen]);

  if (!isOpen || !customer) return null;

  // Base Credit Limit (defaults to ৳50,000 as specified in prompt)
  const baseCreditLimit = customer.creditLimit || 50000;

  // Ledger entries specifically for this customer
  const customerLedgers = allLedgers
    .filter((l) => l.customerId === customer.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Dynamic Auto-Calculations
  const totalInvoiced = customerLedgers.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalPaid = customerLedgers.reduce((sum, l) => sum + (l.credit || 0), 0);
  const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);
  const availableCredit = baseCreditLimit - outstandingBalance;
  const utilizationPercent = Math.min(
    100,
    Math.max(0, Math.round((outstandingBalance / baseCreditLimit) * 100))
  );

  // Filtered entries for view table
  const filteredLedgers = customerLedgers
    .filter((l) => {
      const matchesSearch =
        l.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === 'All'
          ? true
          : filterType === 'Debit'
          ? l.debit > 0
          : l.credit > 0;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handle Posting New Transaction (Automated Calculation & Immutable Log Hook)
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txParticulars.trim() || txAmount <= 0) return;

    playCashDrawerDing();

    const isDebit = txType === 'INVOICE_DEBIT';
    const debitAmount = isDebit ? txAmount : 0;
    const creditAmount = !isDebit ? txAmount : 0;

    // Calculate new balance
    const newEndingBalance = outstandingBalance + debitAmount - creditAmount;
    const newAvailableCredit = baseCreditLimit - newEndingBalance;

    const now = new Date();
    const formattedTimestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    // Immutable Audit Trail Line Item
    const newLogItem: ClientLedgerEntry = {
      id: `clg-${Date.now()}`,
      customerId: customer.id,
      timestamp: formattedTimestamp,
      date: now.toISOString().split('T')[0],
      transaction_type: txType,
      reference_no:
        txReference.trim() ||
        (isDebit ? `INV-2026-${Date.now().toString().slice(-4)}` : `RCP-2026-${Date.now().toString().slice(-4)}`),
      particulars: txParticulars.trim(),
      debit: debitAmount,
      credit: creditAmount,
      amount: txAmount,
      ending_balance: newEndingBalance,
      available_credit: newAvailableCredit,
      credit_limit: baseCreditLimit,
      payment_method: txPaymentMethod,
      operator_id: 'Forhad (Branch Manager)',
      notes: txNotes.trim() || (isDebit ? 'Invoiced to client account' : 'Payment acknowledged & deposited'),
    };

    const updatedLedgers = [...allLedgers, newLogItem];
    setAllLedgers(updatedLedgers);

    // Sync to main customer table & ERP state hook
    if (onUpdateCustomerBalance) {
      onUpdateCustomerBalance(customer.id, newEndingBalance, baseCreditLimit);
    }

    setIsNewTxOpen(false);
    setTxNotes('');
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      {/* Container - Printable isolation style */}
      <div
        id="client-statement-print-area"
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-full"
      >
        {/* MODAL HEADER (Hidden during print) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base shadow-inner">
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {customer.customerType || 'B2B'} CLIENT
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {customer.id}</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{customer.name}</span>
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                  · Ledger &amp; Credit Statement
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                setIsNewTxOpen(!isNewTxOpen);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Transaction</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Official Statement"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL B2B DOCUMENT HEADER (Only visible when printing or in print view) */}
        <div className="hidden print:block p-6 border-b-2 border-slate-900 text-slate-900 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
                NextGen IT Solutions
              </h1>
              <p className="text-xs text-slate-600">Enterprise Hardware &amp; IT Equipment Supplier</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Tax BIN / VAT Reg: 001928374-0101 · Corporate Hotline: +880 9612-445566
              </p>
              <p className="text-xs text-slate-600">City Centre Tower, Motijheel C/A, Dhaka-1000</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-slate-900 text-white rounded">
                Official Client Ledger Statement
              </span>
              <div className="text-xs font-mono text-slate-600 mt-2">
                Statement Date: {new Date().toISOString().split('T')[0]}
              </div>
              <div className="text-xs font-mono text-slate-600">
                Generated By: Forhad (Branch Manager)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-300 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">B2B Account Information</span>
              <div className="font-bold text-sm text-slate-900 mt-0.5">{customer.name}</div>
              {customer.address && <div className="text-slate-700">{customer.address}</div>}
              <div className="font-mono text-slate-700 mt-0.5">Contact: {customer.phone}</div>
              {customer.email && <div className="text-slate-700">Email: {customer.email}</div>}
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Credit Facility Status</span>
              <div>Base Credit Limit: <strong className="font-mono">{formatCurrency(baseCreditLimit)}</strong></div>
              <div>Current Outstanding: <strong className="font-mono text-rose-700">{formatCurrency(outstandingBalance)}</strong></div>
              <div>Remaining Available Credit: <strong className="font-mono text-emerald-700">{formatCurrency(availableCredit)}</strong></div>
              <div>Payment Terms: <span className="font-mono">Net 7 Days</span></div>
            </div>
          </div>
        </div>

        {/* AUTOMATED CALCULATION & CREDIT GAUGE METRIC BAR */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 print:border-b print:py-3 print:bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Base Credit Limit */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Approved Credit Limit
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(baseCreditLimit)}
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                Authorized Facility
              </span>
            </div>

            {/* Total Invoiced (Debits) */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Invoiced (Debits)
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalInvoiced)}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                {customerLedgers.filter((l) => l.debit > 0).length} Invoices Billed
              </span>
            </div>

            {/* Current Outstanding Balance */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300/80 dark:border-amber-700/80 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">
                Outstanding Balance Due
              </span>
              <div className="text-base sm:text-lg font-mono font-extrabold text-amber-800 dark:text-amber-300 mt-0.5">
                {formatCurrency(outstandingBalance)}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                {utilizationPercent}% Limit Utilized
              </span>
            </div>

            {/* Remaining Available Credit */}
            <div
              className={`p-3 bg-white dark:bg-slate-900 rounded-xl border shadow-2xs ${
                availableCredit < 0
                  ? 'border-rose-400 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                  : 'border-emerald-300/80 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-emerald-950/20'
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold block tracking-wider ${
                  availableCredit < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                Available Credit Facility
              </span>
              <div
                className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 ${
                  availableCredit < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {formatCurrency(availableCredit)}
              </div>
              <span
                className={`text-[10px] font-semibold block mt-0.5 ${
                  availableCredit < 0
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {availableCredit < 0 ? '⚠️ Credit Limit Overrun' : '✓ Safe Purchasing Cushion'}
              </span>
            </div>
          </div>

          {/* Credit Facility Progress Bar (Hidden in print) */}
          <div className="mt-3 print:hidden">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Credit Utilization Monitor</span>
              <span className="font-mono">
                {formatCurrency(outstandingBalance)} / {formatCurrency(baseCreditLimit)} ({utilizationPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  utilizationPercent > 90
                    ? 'bg-rose-500'
                    : utilizationPercent > 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, utilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* TRANSACTION POSTING FORM DRAWER (Hidden in print) */}
        {isNewTxOpen && (
          <div className="p-4 sm:p-5 bg-blue-50/60 dark:bg-slate-850 border-b border-blue-200 dark:border-slate-700 animate-in fade-in-50 duration-150 print:hidden">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-200/80 dark:border-slate-700">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Post Ledger Entry to {customer.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTxOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setTxType('INVOICE_DEBIT')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                      txType === 'INVOICE_DEBIT'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Invoice (Debit: + Owes)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTxType('PAYMENT_CREDIT')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                      txType === 'PAYMENT_CREDIT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Payment (Credit: - Owes)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Reference / Voucher # *
                  </label>
                  <input
                    type="text"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Payment Method
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Corporate Cheque</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="bKash / MFS">bKash / MFS</option>
                    <option value="Credit Memo">Credit Memo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Particulars / Item Description *
                  </label>
                  <input
                    type="text"
                    value={txParticulars}
                    onChange={(e) => setTxParticulars(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Audit Notes / PO Ref
                  </label>
                  <input
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    placeholder="e.g. PO Ref: VTX-PO-2026-90, Cheque #49210"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Dynamic Impact Preview */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 font-sans block text-[10px]">Predicted Outstanding:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(
                      txType === 'INVOICE_DEBIT'
                        ? outstandingBalance + txAmount
                        : Math.max(0, outstandingBalance - txAmount)
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-sans block text-[10px]">Predicted Available Credit:</span>
                  <span
                    className={`font-bold ${
                      baseCreditLimit -
                        (txType === 'INVOICE_DEBIT'
                          ? outstandingBalance + txAmount
                          : Math.max(0, outstandingBalance - txAmount)) <
                      0
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(
                      baseCreditLimit -
                        (txType === 'INVOICE_DEBIT'
                          ? outstandingBalance + txAmount
                          : Math.max(0, outstandingBalance - txAmount))
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-sans shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Commit to Ledger</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & FILTER BAR (Hidden in print) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs print:hidden">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, particulars, or notes..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'Debit', 'Credit'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterType === mode
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mode === 'All' ? 'All Transactions' : mode === 'Debit' ? 'Invoices (Debit)' : 'Payments (Credit)'}
              </button>
            ))}
          </div>
        </div>

        {/* LEDGER TRANSACTION HISTORY TABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 print:p-0 print:overflow-visible">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs print:border-none print:shadow-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 print:bg-slate-200 print:text-slate-900">
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">Ref / Voucher #</th>
                  <th className="py-3 px-3.5">Particulars &amp; Notes</th>
                  <th className="py-3 px-3.5">Method</th>
                  <th className="py-3 px-3.5 text-right text-amber-700 dark:text-amber-400">Debit (Invoice)</th>
                  <th className="py-3 px-3.5 text-right text-emerald-700 dark:text-emerald-400">Credit (Payment)</th>
                  <th className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white">Ending Balance</th>
                  <th className="py-3 px-3.5 text-right font-mono text-slate-500">Avail. Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans print:divide-slate-300">
                {filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {row.timestamp}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                        {row.reference_no}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.particulars}
                        </div>
                        {row.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            {row.notes} · Audit: {row.operator_id}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {row.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                        {row.debit > 0 ? `+${formatCurrency(row.debit)}` : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {row.credit > 0 ? `-${formatCurrency(row.credit)}` : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(row.ending_balance)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatCurrency(row.available_credit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PRINT-ONLY SIGNATURE SECTION */}
          <div className="hidden print:grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-400 text-xs text-center text-slate-800">
            <div>
              <div className="border-t border-slate-800 w-40 mx-auto pt-1 font-semibold">
                Customer Signature &amp; Seal
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Vertex Technologies Ltd</p>
            </div>
            <div>
              <div className="border-t border-slate-800 w-40 mx-auto pt-1 font-semibold">
                Credit Control Officer
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Audited &amp; Reconciled</p>
            </div>
            <div>
              <div className="border-t border-slate-800 w-40 mx-auto pt-1 font-semibold">
                Authorised Signatory
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">NextGen IT Solutions</p>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER (Hidden in print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden text-xs">
          <div className="text-slate-500 flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable Audit Trail: All transaction line items permanently recorded.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Statement</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
