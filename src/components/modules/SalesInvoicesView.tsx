import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Sliders,
  Store,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ERPTransactionRecord,
  getStoredSalesInvoices,
  saveStoredSalesInvoices,
} from '../../data/mockTransactions';
import { Customer, Product } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing, playBarcodeBeep } from '../../utils/sound';
import { EditInvoiceModal } from '../modals/EditInvoiceModal';
import {
  INITIAL_SALES_RETURNS,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_ORDERS,
  INITIAL_DELIVERY_CHALLANS,
  SalesReturnRecord,
  QuotationRecord,
  SalesOrderRecord,
  DeliveryChallanRecord,
} from '../../data/mockErpData';
import {
  RotateCcw,
  FileCheck,
  Package,
  Truck,
  CreditCard,
  History,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
  Building,
  User,
  Phone,
} from 'lucide-react';
import { SalesReturnsTab } from '../sales/SalesReturnsTab';
import { QuotationsTab } from '../sales/QuotationsTab';
import { SalesOrdersTab } from '../sales/SalesOrdersTab';
import { DeliveryChallansTab } from '../sales/DeliveryChallansTab';
import { CustomerDueTab } from '../sales/CustomerDueTab';
import { SalesHistoryTab } from '../sales/SalesHistoryTab';

interface SalesInvoicesViewProps {
  onOpenPOS: () => void;
  onOpenSettings: () => void;
  onOpenLetterhead?: () => void;
  customers?: Customer[];
  products?: Product[];
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const SalesInvoicesView: React.FC<SalesInvoicesViewProps> = ({
  onOpenPOS,
  onOpenSettings,
  customers = [],
  activeSubItem = '1.2',
  onSelectSubItem,
}) => {
  const [currentSalesTab, setCurrentSalesTab] = useState<string>(activeSubItem || '1.2');

  useEffect(() => {
    if (activeSubItem) {
      setCurrentSalesTab(activeSubItem);
    }
  }, [activeSubItem]);

  // Invoices State (Sales Invoice records)
  const [salesInvoices, setSalesInvoices] = useState<ERPTransactionRecord[]>(() =>
    getStoredSalesInvoices()
  );
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'All' | 'Completed' | 'Partial' | 'Due'>('All');
  const [invoicePaymentMethodFilter, setInvoicePaymentMethodFilter] = useState<string>('All');
  const [invoiceFromDate, setInvoiceFromDate] = useState('');
  const [invoiceToDate, setInvoiceToDate] = useState('');

  // Modals state for selected invoice
  const [viewingInvoice, setViewingInvoice] = useState<ERPTransactionRecord | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<ERPTransactionRecord | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<ERPTransactionRecord | null>(null);

  // Sync with global storage & events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setSalesInvoices(getStoredSalesInvoices());
    };
    window.addEventListener('erp_transactions_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('erp_transactions_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Invoice Handlers
  const handleSaveUpdatedInvoice = (updated: ERPTransactionRecord) => {
    playCashDrawerDing();
    setSalesInvoices((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      saveStoredSalesInvoices(next);
      return next;
    });
    setEditingInvoice(null);
    window.dispatchEvent(new Event('erp_transactions_updated'));
  };

  const handleConfirmDeleteInvoice = () => {
    if (!deletingInvoice) return;
    playClickSound();
    setSalesInvoices((prev) => {
      const next = prev.filter((i) => i.id !== deletingInvoice.id);
      saveStoredSalesInvoices(next);
      return next;
    });
    setDeletingInvoice(null);
    window.dispatchEvent(new Event('erp_transactions_updated'));
  };

  // Filtered Invoices logic
  const filteredInvoices = salesInvoices.filter((inv) => {
    if (invoiceStatusFilter === 'Completed' && inv.status !== 'Completed' && inv.status !== 'Paid') return false;
    if (invoiceStatusFilter === 'Partial' && inv.status !== 'Partial') return false;
    if (invoiceStatusFilter === 'Due' && inv.status !== 'Unpaid' && (inv.status as string) !== 'Due' && (inv.dueAmount || 0) <= 0) return false;
    if (invoicePaymentMethodFilter !== 'All' && inv.paymentMethod !== invoicePaymentMethodFilter) return false;
    if (invoiceFromDate && inv.dateTime.slice(0, 10) < invoiceFromDate) return false;
    if (invoiceToDate && inv.dateTime.slice(0, 10) > invoiceToDate) return false;
    if (invoiceSearchQuery.trim()) {
      const q = invoiceSearchQuery.toLowerCase();
      const matchRef = inv.refNo.toLowerCase().includes(q);
      const matchParty = inv.partyName.toLowerCase().includes(q);
      const matchPhone = inv.partyPhone?.toLowerCase().includes(q);
      const matchItem = inv.itemsList?.some((item) => item.name.toLowerCase().includes(q));
      if (!matchRef && !matchParty && !matchPhone && !matchItem) return false;
    }
    return true;
  });

  // Invoice KPI Metrics
  const totalSalesCount = salesInvoices.length;
  const totalGrossRevenue = salesInvoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalCollectedAmount = salesInvoices.reduce((acc, i) => {
    if (i.status === 'Completed' || i.status === 'Paid') return acc + i.grandTotal;
    if (i.status === 'Partial') return acc + Math.round(i.grandTotal * 0.6);
    return acc;
  }, 0);
  const totalDueReceivable = totalGrossRevenue - totalCollectedAmount;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Header Bar - 1. SALES — বিক্রয় */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                1. SALES — বিক্রয়
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                {currentSalesTab === '1.2'
                  ? '1.2 Sales List'
                  : currentSalesTab === '1.3'
                  ? '1.3 Sales Return'
                  : currentSalesTab === '1.4'
                  ? '1.4 Quotation'
                  : currentSalesTab === '1.5'
                  ? '1.5 Sales Order'
                  : currentSalesTab === '1.6'
                  ? '1.6 Delivery / Challan'
                  : currentSalesTab === '1.7'
                  ? '1.7 Customer Due / Receivable'
                  : '1.8 Sales History'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sales management, invoices register, returns, quotations, orders, challans &amp; receivables
            </p>
          </div>
        </div>

        {/* Header Action Buttons (POS shortcut & settings) */}
        <div className="flex items-center gap-2">
          {/* POS Counter Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenPOS();
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1.1 New Sale / POS</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenSettings();
            }}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Sales Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sales Navigation Subtabs Bar (1.2 - 1.8) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '1.2', label: '1.2 Sales List', badge: 'Invoices' },
          { id: '1.3', label: '1.3 Sales Return', badge: 'Returns' },
          { id: '1.4', label: '1.4 Quotation', badge: 'Quote' },
          { id: '1.5', label: '1.5 Sales Order', badge: 'Orders' },
          { id: '1.6', label: '1.6 Delivery / Challan', badge: 'Challan' },
          { id: '1.7', label: '1.7 Customer Due / Receivable', badge: 'Due ৳' },
          { id: '1.8', label: '1.8 Sales History', badge: 'Audit' },
        ].map((tab) => {
          const isActive = currentSalesTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClickSound();
                setCurrentSalesTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-750'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content: Dynamic Sub-views (1.2 to 1.8) */}
      {currentSalesTab === '1.3' ? (
        <SalesReturnsTab customers={customers} />
      ) : currentSalesTab === '1.4' ? (
        <QuotationsTab customers={customers} onOpenPOS={onOpenPOS} />
      ) : currentSalesTab === '1.5' ? (
        <SalesOrdersTab customers={customers} onOpenChallans={() => setCurrentSalesTab('1.6')} />
      ) : currentSalesTab === '1.6' ? (
        <DeliveryChallansTab customers={customers} />
      ) : currentSalesTab === '1.7' ? (
        <CustomerDueTab customers={customers} />
      ) : currentSalesTab === '1.8' ? (
        <SalesHistoryTab />
      ) : (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* KPI Summary Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Invoices</p>
              <p className="text-lg font-black text-white font-mono mt-0.5">{totalSalesCount}</p>
              <p className="text-[10px] text-emerald-400 font-medium">All registered memos</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Turnover</p>
              <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatCurrency(totalGrossRevenue)}</p>
              <p className="text-[10px] text-slate-400 font-medium">VAT inclusive</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Settled &amp; Paid</p>
              <p className="text-lg font-black text-teal-400 font-mono mt-0.5">{formatCurrency(totalCollectedAmount)}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Realized into cash/bank</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accounts Due</p>
              <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{formatCurrency(totalDueReceivable)}</p>
              <p className="text-[10px] text-amber-400 font-medium">Pending receivables</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar with Search Box, Filter Dropdown, and Date Range Picker */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer, phone, item..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter Pills, Method Dropdown & Date Range Picker */}
          <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
            <span className="text-slate-500 font-medium">Status:</span>
            {(['All', 'Completed', 'Partial', 'Due'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  playClickSound();
                  setInvoiceStatusFilter(st);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  invoiceStatusFilter === st
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}

            <span className="text-slate-500 font-medium ml-2">Payment:</span>
            <select
              value={invoicePaymentMethodFilter}
              onChange={(e) => setInvoicePaymentMethodFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="bKash / MFS">bKash / MFS</option>
              <option value="Bank Transfer">Bank Wire</option>
            </select>

            {/* Date Range Picker (From Date & To Date) */}
            <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-700 px-2.5 py-1 rounded-xl ml-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={invoiceFromDate}
                onChange={(e) => setInvoiceFromDate(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-hidden cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-medium ml-1">To:</span>
              <input
                type="date"
                value={invoiceToDate}
                onChange={(e) => setInvoiceToDate(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-hidden cursor-pointer"
              />
              {(invoiceFromDate || invoiceToDate) && (
                <button
                  onClick={() => {
                    setInvoiceFromDate('');
                    setInvoiceToDate('');
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

        {/* Invoices Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
              <tr>
                <th className="p-3">Invoice Ref</th>
                <th className="p-3">Date &amp; Time</th>
                <th className="p-3">Customer / Party</th>
                <th className="p-3">Items Summary</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Payment</th>
                <th className="p-3 text-center">Standard Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">
                      {inv.refNo}
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">
                      {inv.dateTime}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{inv.partyName}</div>
                      {inv.partyPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{inv.partyPhone}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {inv.itemsList && inv.itemsList.length > 0
                        ? inv.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')
                        : `${inv.itemsCount || 1} items`}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Completed' || inv.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : inv.status === 'Partial'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-300 text-[11px]">
                      {inv.paymentMethod}
                    </td>
                    {/* Action: Open Invoice */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setViewingInvoice(inv);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-blue-800/70 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Open invoice to view, edit, print or delete"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No invoices found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW SALES INVOICE (A4 PRINT OPTIMIZED & REMAINING BALANCE)         */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header Actions Bar: View, Edit, Print, Delete */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Tax Invoice Voucher</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {viewingInvoice.refNo}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Official sales receipt voucher · {viewingInvoice.dateTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. VIEW */}
                <button
                  type="button"
                  onClick={() => playClickSound()}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="View formatted voucher"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {/* 2. EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    setEditingInvoice(inv);
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Modify invoice details"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* 3. PRINT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.print();
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Print official invoice (A4 Size)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* 4. DELETE */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    setDeletingInvoice(inv);
                  }}
                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete this invoice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet (A4 Size Optimized) */}
            <div id="printable-a4-invoice" className="p-6 md:p-8 overflow-y-auto space-y-5 bg-white text-slate-900 font-sans max-w-[210mm] w-full mx-auto shadow-sm">
              {/* Store Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-blue-600">
                    NextGen IT Systems Ltd.
                  </h2>
                  <p className="text-xs text-slate-600">
                    Level 5, Computer City Centre, Multiplan, Elephant Road, Dhaka
                  </p>
                  <p className="text-xs text-slate-600">
                    BIN / VAT Reg: <strong>003928192-0101</strong> · Hotline: +880 1711-000000
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Invoice Details
                  </div>
                  <div className="text-sm font-mono font-bold text-blue-600">
                    {viewingInvoice.refNo}
                  </div>
                  <div className="text-xs text-slate-500">{viewingInvoice.dateTime}</div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                    Billed To / Customer
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    {viewingInvoice.partyName}
                  </div>
                  {viewingInvoice.partyPhone && (
                    <div className="text-slate-600 font-mono mt-0.5">
                      Phone: {viewingInvoice.partyPhone}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                    Payment Status
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      viewingInvoice.status === 'Completed' || viewingInvoice.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viewingInvoice.status} ({viewingInvoice.paymentMethod})
                  </span>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Served by: {viewingInvoice.createdBy || 'Cashier Forhad'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingInvoice.itemsList && viewingInvoice.itemsList.length > 0 ? (
                      viewingInvoice.itemsList.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            {item.sku && (
                              <div className="text-[10px] font-mono text-purple-600">
                                SKU: {item.sku}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono">{item.qty || 1}</td>
                          <td className="p-2.5 text-right font-mono">
                            {formatCurrency(item.unitPrice || 0)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            {formatCurrency(item.total || (item.qty || 1) * (item.unitPrice || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900">Product Batch Item</td>
                        <td className="p-2.5 text-center font-mono">{viewingInvoice.itemsCount || 1}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(viewingInvoice.grandTotal)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(viewingInvoice.grandTotal)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-1">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(viewingInvoice.grossAmount || viewingInvoice.grandTotal)}</span>
                  </div>
                  {(viewingInvoice.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatCurrency(viewingInvoice.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (5%):</span>
                    <span className="font-mono">{formatCurrency(viewingInvoice.taxAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-600">{formatCurrency(viewingInvoice.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* CRITICAL REQUIREMENT: Clear Display of Customer Remaining Balance (Outstanding Due) */}
              {(() => {
                const customer = customers.find((c) => c.name === viewingInvoice.partyName);
                const prevDue = customer?.balance || (viewingInvoice.status === 'Partial' || viewingInvoice.status === 'Unpaid' || (viewingInvoice.status as string) === 'Due' ? 18500 : 0);
                const paidToday = viewingInvoice.status === 'Completed' || viewingInvoice.status === 'Paid'
                  ? viewingInvoice.grandTotal
                  : viewingInvoice.status === 'Partial'
                  ? Math.round(viewingInvoice.grandTotal * 0.6)
                  : 0;
                const netInvoiceDue = Math.max(0, viewingInvoice.grandTotal - paidToday);
                const remainingOutstanding = prevDue + netInvoiceDue;

                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 border-2 border-amber-300 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">Previous Outstanding Due (পূর্বের বকেয়া):</span>
                      <span className="font-mono text-sm font-bold">{formatCurrency(prevDue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">Current Invoice Amount (বর্তমান বিল):</span>
                      <span className="font-mono text-sm font-bold text-slate-900">+{formatCurrency(viewingInvoice.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">Paid Amount Today (আজকের পরিশোধ):</span>
                      <span className="font-mono text-sm font-bold text-emerald-600">-{formatCurrency(paidToday)}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                      <div>
                        <span className="text-sm font-black text-slate-950 uppercase tracking-tight block">
                          REMAINING BALANCE / OUTSTANDING DUE (অবশিষ্ট বকেয়া)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Total customer balance remaining right after this invoice
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                          {formatCurrency(remainingOutstanding)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Warranty Notice Footer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Includes 30-Day Guarantee &amp; 5-Year Hardware Service Warranty. Keep invoice safe.
                  </span>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                  Code128 · Verified
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    setDeletingInvoice(inv);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Void / Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    setEditingInvoice(inv);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-amber-800/80 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modify Invoice</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INVOICE */}
      {editingInvoice && (
        <EditInvoiceModal
          isOpen={!!editingInvoice}
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSave={handleSaveUpdatedInvoice}
        />
      )}

      {/* MODAL: DELETE INVOICE CONFIRMATION */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Void / Delete Sales Invoice?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to void invoice <strong className="text-white">{deletingInvoice.refNo}</strong> for{' '}
                <strong>{deletingInvoice.partyName}</strong> ({formatCurrency(deletingInvoice.grandTotal)})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteInvoice}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Yes, Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
