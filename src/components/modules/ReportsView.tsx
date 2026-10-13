import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Users,
  FileText,
  Boxes,
  Receipt,
  DollarSign,
  Landmark,
  Search,
  Printer,
  Download,
  Calendar,
  Filter,
  X,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building,
  UserCheck,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Eye,
  Edit2,
  Trash2,
  Plus,
  AlertTriangle,
  Check,
  ShieldCheck,
  Package,
  Award,
  Trophy,
  Percent,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  BarChart3,
  PieChart,
  Activity,
  RefreshCcw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';
import {
  ERPTransactionRecord,
  getStoredSalesInvoices,
  saveStoredSalesInvoices,
  getStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  getStoredPurchaseInvoices,
  saveStoredPurchaseInvoices,
  computeEmployeeWiseSaleSummary,
  EmployeeSalesSummary,
  STANDARD_STAFF_MEMBERS,
  StaffSalesProfile,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_ORDERS_RECORDS,
  INITIAL_PURCHASE_INVOICES_RECORDS,
} from '../../data/mockTransactions';
import {
  fetchReportsSummary,
  fetchSalesByDate,
  fetchTopSellingItems,
  fetchSalesByCategory,
  fetchSalesByPaymentMethod,
  ReportSummaryData,
  SalesByDateItem,
  TopSellingItem,
  SalesByCategoryItem,
  PaymentMethodItem,
} from '../../services/reportsApi';
import {
  fetchSalesTransactions,
  deleteSaleTransaction,
} from '../../services/salesApi';
import { EditInvoiceModal } from '../modals/EditInvoiceModal';
import { DailyCashStatementSheet } from '../reports/DailyCashStatementSheet';
import { StandardSystemReportViewer, SystemReportType } from '../reports/StandardSystemReportViewer';

interface ReportCategory {
  id: string;
  title: string;
  iconType: 'arrows' | 'users' | 'voucher';
  column: 1 | 2 | 3;
  items: string[];
}

const REPORT_SECTIONS: ReportCategory[] = [
  // COLUMN 1
  {
    id: 'daily_report',
    title: 'DAILY REPORT',
    iconType: 'arrows',
    column: 1,
    items: [
      'PURCHASE',
      'SALES',
      'EXPENSES',
      'EXPENSES DETAILS',
      'DAILY CASH STATEMENT',
      'PROFIT & LOSS (INVOICE)',
      'PROFIT & LOSS (ITEM)',
      'OVERVIEW',
    ],
  },
  {
    id: 'sales_category',
    title: 'SALES',
    iconType: 'users',
    column: 1,
    items: [
      'EMPLOYEE WISE SALE REPORT',
      'SALES RECORD (INVOICE)',
      'RETURN REORD (INVOICE)',
      'CUSTOMER WISE (INVOICE)',
      'ITEM WISE',
      'ITEM STATEMENT',
      'PERIODIC SALES RECORD',
      'OVERVIEW',
      'CUSTOMER WISE (PRODUCT)',
    ],
  },
  {
    id: 'account_category',
    title: 'ACCOUNT',
    iconType: 'voucher',
    column: 1,
    items: [
      'LEDGER STATEMENT',
      'CASH STATEMENT',
      'BANK STATEMENT',
      'MOBILE STATEMENT',
      'JOURNAL HISTORY',
      'TRIAL BALANCE',
      'BALANCE SHEET',
      'PROFIT & LOSS',
      'OVERVIEW',
    ],
  },

  // COLUMN 2
  {
    id: 'purchase_category',
    title: 'PURCHASE',
    iconType: 'arrows',
    column: 2,
    items: [
      'PURCHASE RECORD (INVOICE)',
      'RETRUN RECORD (INVOICE)',
      'SUPPLIER WISE (INVOICE)',
      'ITEM WISE',
      'ITEM STATEMENT',
      'PERIODIC PURCHASE RECORD',
      'OVERVIEW',
    ],
  },
  {
    id: 'receivables_category',
    title: 'RECEIVABLES',
    iconType: 'users',
    column: 2,
    items: [
      'CUSTOMER LIST',
      'CUSTOMER BALANCE',
      'CUSTOMER STATEMENT',
      'CUSTOMER STATEMENT (ITEM)',
      'CUSTOMER DUE COLLECTION',
      'BALANCE OVERVIEW',
      'OVERVIEW',
    ],
  },
  {
    id: 'voucher_category',
    title: 'VOUCHER',
    iconType: 'voucher',
    column: 2,
    items: [
      'PAYMENT',
      'RECEIPT',
      'JOURNAL',
      'PAYMENT & RECEIPT STATEMENT',
      'INTERNAL TRANSACTION',
      'OVERVIEW',
    ],
  },

  // COLUMN 3
  {
    id: 'inventory_category',
    title: 'INVENTORY',
    iconType: 'arrows',
    column: 3,
    items: [
      'PRODUCT LIST',
      'SERIAL RECORD',
      'INVENTORY SUMMARY',
      'PERIODIC INVENTORY COUNT',
      'INVENTORY VALUATION',
      'PERIODIC INVENTORY VALUATION',
      'WARRANTY SUMMARY',
    ],
  },
  {
    id: 'payables_category',
    title: 'PAYABLES',
    iconType: 'users',
    column: 3,
    items: [
      'SUPPLIER LIST',
      'SUPPLIER BALANCE',
      'SUPPLIER STATEMENT',
      'SUPPLIER STATEMENT (ITEM)',
      'SUPPLIER OVERVIEW',
    ],
  },
  {
    id: 'payroll_category',
    title: 'PAYROLL',
    iconType: 'voucher',
    column: 3,
    items: [
      'EMPLOYEE WISE SALE REPORT',
      'EMPLOYEE LIST',
      'ATTENDANCE',
      'LEAVE RECORD',
      'SALARY REPORT',
      'COMMISSION REPORT',
      'OVERVIEW',
    ],
  },
];

export const getStandardReportType = (category: string, item: string): SystemReportType | null => {
  const itemUpper = item.trim().toUpperCase();
  const catUpper = category.trim().toUpperCase();

  // 1. Purchase Report – only purchases
  if (
    itemUpper === 'PURCHASE' ||
    itemUpper.includes('PURCHASE RECORD') ||
    itemUpper.includes('SUPPLIER WISE (INVOICE)') ||
    itemUpper.includes('PERIODIC PURCHASE RECORD')
  ) {
    return 'purchase';
  }

  // 2. Sales Report – only sales
  if (
    itemUpper === 'SALES' ||
    itemUpper.includes('SALES RECORD') ||
    itemUpper.includes('CUSTOMER WISE (INVOICE)') ||
    itemUpper.includes('PERIODIC SALES RECORD')
  ) {
    return 'sales';
  }

  // 3. Expense Report – only expenses
  if (itemUpper === 'EXPENSES') {
    return 'expense';
  }

  // 4. Expense Details – line-level
  if (itemUpper === 'EXPENSES DETAILS' || itemUpper.includes('EXPENSE DETAILS')) {
    return 'expense_details';
  }

  // 5. Profit & Loss Invoice – invoice-wise P&L
  if (itemUpper.includes('PROFIT & LOSS (INVOICE)') || itemUpper.includes('PROFIT & LOSS (ITEM)')) {
    return 'pnl_invoice';
  }

  // 6. Profit & Loss – consolidated
  if (
    itemUpper === 'PROFIT & LOSS' ||
    (itemUpper === 'OVERVIEW' && (catUpper.includes('DAILY') || catUpper.includes('ACCOUNT')))
  ) {
    return 'pnl_consolidated';
  }

  return null;
};

interface ReportsViewProps {
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeSubItem = '7.1',
  onSelectSubItem,
}) => {
  const [currentReportSubTab, setCurrentReportSubTab] = useState<string>(activeSubItem || '7.1');
  const [selectedReport, setSelectedReport] = useState<{ category: string; item: string } | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [reportDateRange, setReportDateRange] = useState('This Month (October 2026)');

  // Quick Ledger Panel open/collapse on main Reports page
  const [isQuickLedgerOpen, setIsQuickLedgerOpen] = useState(true);
  const [quickLedgerTab, setQuickLedgerTab] = useState<'sales_invoice' | 'purchase_order' | 'purchase_invoice' | 'employee_wise_sales'>('sales_invoice');

  useEffect(() => {
    if (activeSubItem) {
      setCurrentReportSubTab(activeSubItem);
      if (activeSubItem === '7.1') {
        setIsQuickLedgerOpen(true);
        setQuickLedgerTab('sales_invoice');
      } else if (activeSubItem === '7.2') {
        setIsQuickLedgerOpen(true);
        setQuickLedgerTab('purchase_invoice');
      } else if (activeSubItem === '7.3') {
        setGlobalFilter('STOCK');
      } else if (activeSubItem === '7.4') {
        setGlobalFilter('CUSTOMER');
      } else if (activeSubItem === '7.5') {
        setGlobalFilter('ACCOUNT');
      } else if (activeSubItem === '7.6') {
        setIsQuickLedgerOpen(true);
        setQuickLedgerTab('employee_wise_sales');
      }
    }
  }, [activeSubItem]);

  // Dynamic state for editable & deletable records
  const [salesInvoices, setSalesInvoices] = useState<ERPTransactionRecord[]>(() => getStoredSalesInvoices());
  const [purchaseOrders, setPurchaseOrders] = useState<ERPTransactionRecord[]>(() => getStoredPurchaseOrders());
  const [purchaseInvoices, setPurchaseInvoices] = useState<ERPTransactionRecord[]>(() => getStoredPurchaseInvoices());

  // Dynamic API state for real-time aggregated reports and data visualization
  const [reportSummary, setReportSummary] = useState<ReportSummaryData | null>(null);
  const [salesByDate, setSalesByDate] = useState<SalesByDateItem[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryItem[]>([]);
  const [salesByPaymentMethod, setSalesByPaymentMethod] = useState<PaymentMethodItem[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const loadDynamicReportsData = async () => {
    console.log('[Data Flow -> ReportsView] Fetching fresh dynamic report data from API for dateRange:', reportDateRange);
    setIsReportsLoading(true);
    try {
      const [sales, summary, dateSales, topItems, catSales, payMethods] = await Promise.all([
        fetchSalesTransactions(),
        fetchReportsSummary(reportDateRange),
        fetchSalesByDate(),
        fetchTopSellingItems(10),
        fetchSalesByCategory(),
        fetchSalesByPaymentMethod(),
      ]);

      setSalesInvoices(sales);
      setReportSummary(summary);
      setSalesByDate(dateSales);
      setTopSellingItems(topItems);
      setSalesByCategory(catSales);
      setSalesByPaymentMethod(payMethods);
      setLastSyncTime(new Date().toLocaleTimeString());

      console.log(`[Data Flow -> ReportsView] Dynamic data loaded successfully from database/API: ${sales.length} sales, ৳${summary.totalRevenue} revenue.`);
    } catch (err) {
      console.error('[Data Flow -> ReportsView] Error loading dynamic reports data:', err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  // Initial load and sync on cross-module sale updates
  useEffect(() => {
    loadDynamicReportsData();

    const handleSync = () => {
      console.log('[Data Flow -> ReportsView] Detected erp_transactions_updated / storage event. Reloading dynamic reports...');
      loadDynamicReportsData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('erp_transactions_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('erp_transactions_updated', handleSync);
    };
  }, [reportDateRange]);

  // Active record view type in modal: 'sales_invoice' | 'purchase_order' | 'purchase_invoice' | 'employee_wise_sales' | 'generic'
  const [activeRecordType, setActiveRecordType] = useState<'sales_invoice' | 'purchase_order' | 'purchase_invoice' | 'employee_wise_sales' | 'generic'>('sales_invoice');

  // Employee-wise sales report state
  const [expandedEmployeeCode, setExpandedEmployeeCode] = useState<string | null>(null);
  const [expandedQuickEmployeeCode, setExpandedQuickEmployeeCode] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState('All');
  const [employeeSortBy, setEmployeeSortBy] = useState<'grandTotal' | 'invoicesCount' | 'commissionEarned'>('grandTotal');
  const [viewingStaffSlip, setViewingStaffSlip] = useState<EmployeeSalesSummary | null>(null);

  // Modals for SEE, EDIT, DELETE
  const [viewingRecord, setViewingRecord] = useState<ERPTransactionRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ERPTransactionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ERPTransactionRecord | null>(null);

  // Edit form state
  const [editRefNo, setEditRefNo] = useState('');
  const [editPartyName, setEditPartyName] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editGrandTotal, setEditGrandTotal] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'Paid' | 'Partial' | 'Unpaid' | 'Completed' | 'Pending'>('Paid');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Save to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('erp_sales_invoices_v1', JSON.stringify(salesInvoices));
  }, [salesInvoices]);

  useEffect(() => {
    localStorage.setItem('erp_purchase_orders_v1', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('erp_purchase_invoices_v1', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  // Compute employee-wise sales summary dynamically from salesInvoices state
  const employeeSummaries = computeEmployeeWiseSaleSummary(salesInvoices, STANDARD_STAFF_MEMBERS);

  const filteredEmployeeSummaries = employeeSummaries
    .filter((emp) => {
      const matchSearch =
        employeeSearch.trim() === '' ||
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.designation.toLowerCase().includes(employeeSearch.toLowerCase());
      const matchDept =
        employeeDeptFilter === 'All' || emp.department === employeeDeptFilter;
      return matchSearch && matchDept;
    })
    .sort((a, b) => b[employeeSortBy] - a[employeeSortBy]);

  const totalEmpGrandTotal = employeeSummaries.reduce((sum, e) => sum + e.grandTotal, 0);
  const totalEmpInvoices = employeeSummaries.reduce((sum, e) => sum + e.invoicesCount, 0);
  const totalEmpUnits = employeeSummaries.reduce((sum, e) => sum + e.unitsCount, 0);
  const totalEmpPaid = employeeSummaries.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalEmpDue = employeeSummaries.reduce((sum, e) => sum + e.dueAmount, 0);
  const totalEmpCommission = employeeSummaries.reduce((sum, e) => sum + e.commissionEarned, 0);
  const topPerformer = [...employeeSummaries].sort((a, b) => b.grandTotal - a.grandTotal)[0];

  const handleOpenReport = (categoryTitle: string, itemTitle: string) => {
    playClickSound();
    setSelectedReport({ category: categoryTitle, item: itemTitle });

    // Auto-detect entity type
    if (itemTitle.includes('EMPLOYEE WISE') || itemTitle.includes('COMMISSION REPORT')) {
      setActiveRecordType('employee_wise_sales');
    } else if (itemTitle.includes('PURCHASE RECORD') || itemTitle.includes('PURCHASE INVOICE')) {
      setActiveRecordType('purchase_invoice');
    } else if (itemTitle === 'PURCHASE' || itemTitle.includes('PURCHASE ORDER')) {
      setActiveRecordType('purchase_order');
    } else if (itemTitle.includes('SALES') || itemTitle.includes('PROFIT & LOSS (INVOICE)')) {
      setActiveRecordType('sales_invoice');
    } else {
      setActiveRecordType('generic');
    }
  };

  const handleCloseReport = () => {
    playClickSound();
    setSelectedReport(null);
  };

  const handleExportCSV = () => {
    playBarcodeBeep();
    alert(`Exporting ${selectedReport?.category} - ${selectedReport?.item} data as CSV spreadsheet.`);
  };

  const handlePrintReport = () => {
    playClickSound();
    window.print();
  };

  // --- SEE (VIEW) HANDLER ---
  const handleSeeRecord = (rec: ERPTransactionRecord) => {
    playClickSound();
    setViewingRecord(rec);
  };

  // --- PRINT HANDLER ---
  const handlePrintRecord = (rec: ERPTransactionRecord) => {
    playClickSound();
    setViewingRecord(rec);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // --- EDIT HANDLERS (ASKS WHICH PART TO MODIFY) ---
  const handleOpenEditRecord = (rec: ERPTransactionRecord) => {
    playClickSound();
    setEditingRecord(rec);
  };

  const handleSaveInvoiceRecord = (updated: ERPTransactionRecord) => {
    playCashDrawerDing();

    if (updated.type === 'sales_invoice') {
      setSalesInvoices((prev) => {
        const next = prev.map((r) => (r.id === updated.id ? updated : r));
        saveStoredSalesInvoices(next);
        return next;
      });
    } else if (updated.type === 'purchase_order') {
      setPurchaseOrders((prev) => {
        const next = prev.map((r) => (r.id === updated.id ? updated : r));
        saveStoredPurchaseOrders(next);
        return next;
      });
    } else if (updated.type === 'purchase_invoice') {
      setPurchaseInvoices((prev) => {
        const next = prev.map((r) => (r.id === updated.id ? updated : r));
        saveStoredPurchaseInvoices(next);
        return next;
      });
    }

    window.dispatchEvent(new Event('erp_transactions_updated'));
    setEditingRecord(null);
  };

  // --- DELETE HANDLERS ---
  const handleOpenDeleteRecord = (rec: ERPTransactionRecord) => {
    playClickSound();
    setDeletingRecord(rec);
  };

  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    playBarcodeBeep();

    if (deletingRecord.type === 'sales_invoice') {
      deleteSaleTransaction(deletingRecord.id).catch((err) => console.error('Error deleting sale via API:', err));
      setSalesInvoices((prev) => prev.filter((r) => r.id !== deletingRecord.id));
    } else if (deletingRecord.type === 'purchase_order') {
      setPurchaseOrders((prev) => prev.filter((r) => r.id !== deletingRecord.id));
    } else if (deletingRecord.type === 'purchase_invoice') {
      setPurchaseInvoices((prev) => prev.filter((r) => r.id !== deletingRecord.id));
    }

    setDeletingRecord(null);
  };

  // Quick action helpers for familiar category item rows
  const getRelevantRecordsForItem = (itemTitle: string) => {
    if (itemTitle.includes('PURCHASE RECORD') || itemTitle.includes('PURCHASE INVOICE')) {
      return { list: purchaseInvoices, type: 'purchase_invoice' as const };
    } else if (itemTitle === 'PURCHASE' || itemTitle.includes('PURCHASE ORDER')) {
      return { list: purchaseOrders, type: 'purchase_order' as const };
    } else {
      return { list: salesInvoices, type: 'sales_invoice' as const };
    }
  };

  const handleQuickSeeItem = (categoryTitle: string, itemTitle: string) => {
    if (itemTitle.includes('EMPLOYEE WISE')) {
      handleOpenReport(categoryTitle, itemTitle);
      return;
    }
    const { list } = getRelevantRecordsForItem(itemTitle);
    if (list.length > 0) {
      handleSeeRecord(list[0]);
    } else {
      handleOpenReport(categoryTitle, itemTitle);
    }
  };

  const handleQuickEditItem = (categoryTitle: string, itemTitle: string) => {
    if (itemTitle.includes('EMPLOYEE WISE')) {
      handleOpenReport(categoryTitle, itemTitle);
      return;
    }
    const { list } = getRelevantRecordsForItem(itemTitle);
    if (list.length > 0) {
      handleOpenEditRecord(list[0]);
    } else {
      handleOpenReport(categoryTitle, itemTitle);
    }
  };

  const handleQuickDeleteItem = (categoryTitle: string, itemTitle: string) => {
    if (itemTitle.includes('EMPLOYEE WISE')) {
      handleOpenReport(categoryTitle, itemTitle);
      return;
    }
    const { list } = getRelevantRecordsForItem(itemTitle);
    if (list.length > 0) {
      handleOpenDeleteRecord(list[0]);
    } else {
      handleOpenReport(categoryTitle, itemTitle);
    }
  };

  const renderCategoryIcon = (iconType: 'arrows' | 'users' | 'voucher') => {
    if (iconType === 'arrows') {
      return (
        <span className="font-bold text-sm tracking-tighter leading-none mr-2">
          ⇄
        </span>
      );
    }
    if (iconType === 'users') {
      return (
        <span className="font-bold text-sm leading-none mr-2 flex items-center">
          <Users className="w-3.5 h-3.5 inline mr-0.5" />
        </span>
      );
    }
    return (
      <span className="font-bold text-sm leading-none mr-2">
        🗄️
      </span>
    );
  };

  const activeRecordsList: ERPTransactionRecord[] =
    activeRecordType === 'sales_invoice'
      ? salesInvoices
      : activeRecordType === 'purchase_order'
      ? purchaseOrders
      : activeRecordType === 'purchase_invoice'
      ? purchaseInvoices
      : salesInvoices;

  const totalFilteredSum = activeRecordsList.reduce((acc, r) => acc + r.grandTotal, 0);

  const quickLedgerRecords: ERPTransactionRecord[] =
    quickLedgerTab === 'sales_invoice'
      ? salesInvoices
      : quickLedgerTab === 'purchase_order'
      ? purchaseOrders
      : purchaseInvoices;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f6f8] dark:bg-slate-950 overflow-y-auto font-sans select-none">
      {/* Top Header Bar matching Screenshot */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-normal text-slate-800 dark:text-slate-100 tracking-tight">
            Report
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Master ERP Analytics, Transaction Ledgers &amp; Record Audits
          </p>
        </div>

        {/* Global Quick Search Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Quick search reports, invoices, PO..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* DEDICATED PROMINENT EMPLOYEE WISE SALE REPORT BUTTON */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              handleOpenReport('SALES', 'EMPLOYEE WISE SALE REPORT');
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-xs hover:shadow-md border border-indigo-500/40"
            title="Open Employee Wise Sale Report (Staff sales performance, targets & commission audit)"
          >
            <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-extrabold tracking-tight">EMPLOYEE WISE SALE REPORT</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {employeeSummaries.length} Staff
            </span>
          </button>

          {/* DEDICATED PROMINENT DAILY CASH STATEMENT SYSTEM REPORT BUTTON */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              handleOpenReport('DAILY REPORT', 'DAILY CASH STATEMENT');
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-xs hover:shadow-md border border-emerald-500/40"
            title="Open Daily Cash & Bank Statement (Enterprise System Report & Reconciliation)"
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span className="font-extrabold tracking-tight">DAILY CASH STATEMENT</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono font-bold">
              System Report
            </span>
          </button>

          {/* LIVE API SYNC BUTTON */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              loadDynamicReportsData();
            }}
            disabled={isReportsLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs hover:shadow-xs"
            title="Refetch dynamic sales and reporting data from backend API"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isReportsLoading ? 'animate-spin' : ''}`} />
            <span>{isReportsLoading ? 'Syncing...' : 'Live Sync'}</span>
            {lastSyncTime && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden xl:inline">
                ({lastSyncTime})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsQuickLedgerOpen(!isQuickLedgerOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isQuickLedgerOpen
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Live Transaction Registry table (Sales Invoice, Purchase Order, Purchase Invoice)"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Live Transaction Registry</span>
          </button>
        </div>
      </div>

      {/* Report ERP Subtabs Bar (7.1 to 7.6) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '7.1', label: '7.1 Sales Reports', badge: 'Sales Memos', tab: 'sales_invoice' },
          { id: '7.2', label: '7.2 Purchase Reports', badge: 'Procurement', tab: 'purchase_invoice' },
          { id: '7.3', label: '7.3 Inventory Reports', badge: 'Stock & Items', filter: 'STOCK' },
          { id: '7.4', label: '7.4 Customer & Supplier Reports', badge: 'Party Ledgers', filter: 'CUSTOMER' },
          { id: '7.5', label: '7.5 Accounts & Finance Reports', badge: 'Financials', filter: 'ACCOUNT' },
          { id: '7.6', label: '7.6 Payroll Report', badge: 'Staff Salary', tab: 'employee_wise_sales' },
        ].map((tab) => {
          const isActive = currentReportSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setCurrentReportSubTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
                if (tab.tab) {
                  setIsQuickLedgerOpen(true);
                  setQuickLedgerTab(tab.tab as any);
                } else if (tab.filter) {
                  setGlobalFilter(tab.filter);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE REAL-TIME SALES & REVENUE ANALYTICS DASHBOARD                  */}
      {/* Data Visualization Layer: Real-time dynamic charts & aggregated KPIs      */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 pb-0 max-w-[1600px] w-full mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Dashboard Control Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between flex-wrap gap-4 border-b border-indigo-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Real-Time Sales API Active
                  </span>
                  {lastSyncTime && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Synced {lastSyncTime}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Executive Sales &amp; Revenue Analytics
                </h2>
              </div>
            </div>

            {/* Filter & Live Sync Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">Period:</span>
                <select
                  value={reportDateRange}
                  onChange={(e) => setReportDateRange(e.target.value)}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Today" className="bg-slate-900 text-white">Today</option>
                  <option value="Yesterday" className="bg-slate-900 text-white">Yesterday</option>
                  <option value="This Week" className="bg-slate-900 text-white">This Week</option>
                  <option value="This Month (October 2026)" className="bg-slate-900 text-white">This Month (October 2026)</option>
                  <option value="Quarter to Date" className="bg-slate-900 text-white">Quarter to Date</option>
                  <option value="Year to Date" className="bg-slate-900 text-white">Year to Date (FY 2026)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  loadDynamicReportsData();
                }}
                disabled={isReportsLoading}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isReportsLoading ? 'animate-spin' : ''}`} />
                <span>{isReportsLoading ? 'Updating...' : 'Refresh Live Data'}</span>
              </button>
            </div>
          </div>

          {/* 6 Dynamic Summary KPI Cards */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* 1. Total Net Revenue */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Total Net Sales</span>
                  <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg font-bold font-mono text-blue-700 dark:text-sky-400">
                  {formatCurrency(reportSummary?.totalRevenue || 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Gross:</span>
                  <span className="font-mono">{formatCurrency(reportSummary?.totalGross || 0)}</span>
                </div>
              </div>

              {/* 2. Invoices / Completed Sales */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Invoices Issued</span>
                  <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {reportSummary?.totalInvoices || salesInvoices.length} inv
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Real sales recorded</span>
                </div>
              </div>

              {/* 3. Items Sold */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-purple-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Units / Items Sold</span>
                  <Package className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg font-bold font-mono text-purple-700 dark:text-purple-400">
                  {reportSummary?.totalItemsSold || 0} pcs
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Aggregated line items
                </div>
              </div>

              {/* 4. Average Order Value */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Avg Order Value (AOV)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-400">
                  {formatCurrency(reportSummary?.averageOrderValue || 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Per customer receipt
                </div>
              </div>

              {/* 5. Estimated Gross Profit */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Est. Gross Profit</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                  {formatCurrency(reportSummary?.estimatedGrossProfit || 0)}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  Revenue minus cost
                </div>
              </div>

              {/* 6. Collections & Due */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-teal-100 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                  <span>Collected / Due</span>
                  <Landmark className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-base font-bold font-mono text-teal-700 dark:text-teal-400">
                  {formatCurrency(reportSummary?.totalPaid || 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Due: <span className="font-mono text-rose-500 font-bold">{formatCurrency(reportSummary?.totalDue || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Visualizations Grid (Charts & Tables) */}
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Visual 1: Daily Sales Trend (Dynamic Bar Chart) */}
            <div className="lg:col-span-7 bg-slate-50/70 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Dynamic Sales Trend (Revenue by Date)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {salesByDate.length} Timeline Dates Recorded
                </span>
              </div>

              {/* Dynamic Chart Container */}
              {salesByDate.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400 italic">
                  No sales recorded in the selected period. New sales will appear here dynamically.
                </div>
              ) : (
                <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-700">
                  {(() => {
                    const maxRev = Math.max(...salesByDate.map((d) => d.revenue), 1);
                    return salesByDate.map((item, idx) => {
                      const heightPercent = Math.max(14, Math.round((item.revenue / maxRev) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                          {/* Tooltip on Hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none z-20 whitespace-nowrap shadow-md">
                            <div>{item.date}</div>
                            <div className="text-emerald-300 font-bold">{formatCurrency(item.revenue)}</div>
                            <div className="text-slate-300">{item.invoicesCount} inv ({item.itemsCount} pcs)</div>
                          </div>

                          {/* Amount on top of bar */}
                          <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 truncate max-w-full">
                            ৳{Math.round(item.revenue / 1000)}k
                          </span>

                          {/* Dynamic Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-blue-700 via-indigo-600 to-sky-400 group-hover:from-blue-600 group-hover:to-sky-300 transition-all cursor-pointer shadow-xs"
                          />

                          {/* Date Label */}
                          <span className="text-[10px] font-mono text-slate-500 truncate max-w-full text-center">
                            {item.date.split('-').slice(1).join('/')}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  <span>Real Revenue Aggregation</span>
                </span>
                <span>Automatic live sync on each POS checkout</span>
              </div>
            </div>

            {/* Visual 2: Top-Selling Items Leaderboard Table */}
            <div className="lg:col-span-5 bg-slate-50/70 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Top-Selling Products Leaderboard
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Ranked by Units Sold
                </span>
              </div>

              {topSellingItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 italic">
                  No products sold yet. Record a sale to see real-time rankings.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[9px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1">
                        <th className="pb-1.5 font-bold">Product</th>
                        <th className="pb-1.5 text-center font-bold">Units</th>
                        <th className="pb-1.5 text-right font-bold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {topSellingItems.slice(0, 5).map((item, idx) => {
                        const maxUnits = Math.max(...topSellingItems.map((i) => i.quantitySold), 1);
                        const percent = Math.round((item.quantitySold / maxUnits) * 100);

                        return (
                          <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                            <td className="py-2 pr-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                  idx === 0
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 dark:text-white truncate text-[11px]">
                                    {item.name}
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                                    <span>{item.sku || 'SKU'}</span>
                                    <span>·</span>
                                    <span className="text-blue-600 dark:text-sky-400">{item.category || 'General'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="w-16 mx-auto">
                                <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {item.quantitySold} pcs
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-0.5 overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-1 rounded-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2 pl-2 text-right font-mono font-bold text-blue-700 dark:text-sky-400 text-xs">
                              {formatCurrency(item.totalRevenue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Quick Breakdown (Payment Methods & Categories) */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Payment Channels:
                </span>
                <div className="flex items-center gap-2">
                  {salesByPaymentMethod.slice(0, 3).map((m, i) => (
                    <span key={i} className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {m.method}: {formatCurrency(m.amount)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK TRANSACTION ROWS CONTAINER (Sales Invoice, Purchase Order, Purchase Invoice, and Employee Wise Sales) */}
      {isQuickLedgerOpen && (
        <div className="p-4 sm:p-6 pb-0 max-w-[1600px] w-full mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            {/* Header & Tabs */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Live Transaction Registry · Sales Invoices · Purchase Orders · Purchase Invoices
                </span>
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  (Click any record to open full invoice voucher)
                </span>
              </div>

              {/* 4 Quick Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuickLedgerTab('sales_invoice')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickLedgerTab === 'sales_invoice'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                  }`}
                >
                  <Receipt className="w-3 h-3" />
                  <span>Sales Invoices ({salesInvoices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickLedgerTab('purchase_order')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickLedgerTab === 'purchase_order'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-purple-600'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>Purchase Orders ({purchaseOrders.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickLedgerTab('purchase_invoice')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickLedgerTab === 'purchase_invoice'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Purchase Invoices ({purchaseInvoices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickLedgerTab('employee_wise_sales')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickLedgerTab === 'employee_wise_sales'
                      ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>Employee Wise Sales ({employeeSummaries.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Ledger Table: Either Transaction Records or Employee Wise Sales Breakdown */}
            {quickLedgerTab === 'employee_wise_sales' ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                      <th className="py-2.5 px-3">Staff Code &amp; Name</th>
                      <th className="py-2.5 px-3">Designation &amp; Department</th>
                      <th className="py-2.5 px-3 text-center">Invoices</th>
                      <th className="py-2.5 px-3 text-center">Units Sold</th>
                      <th className="py-2.5 px-3 text-right">Gross Sales</th>
                      <th className="py-2.5 px-3 text-right">Grand Total (৳)</th>
                      <th className="py-2.5 px-3 text-right">Paid / Due</th>
                      <th className="py-2.5 px-3 text-right">Commission</th>
                      <th className="py-2.5 px-3 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                        Actions (See Invoices · Slip · Report)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeSummaries.map((emp, idx) => {
                      const isExpandedQuick = expandedQuickEmployeeCode === emp.employeeCode;
                      return (
                        <React.Fragment key={emp.employeeCode}>
                          <tr className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors font-medium text-slate-800 dark:text-slate-200">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{emp.name}</span>
                                    {idx === 0 && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                                        Top
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono text-[10px] text-slate-400">
                                    {emp.employeeCode}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="text-slate-700 dark:text-slate-300 font-medium">
                                {emp.designation}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {emp.department}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {emp.invoicesCount} inv
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">
                              {emp.unitsCount} pcs
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                              {formatCurrency(emp.grossAmount)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 dark:text-sky-400">
                              {formatCurrency(emp.grandTotal)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                              <div className="text-emerald-600 font-semibold">{formatCurrency(emp.paidAmount)}</div>
                              {emp.dueAmount > 0 && (
                                <div className="text-rose-500 text-[10px]">Due: {formatCurrency(emp.dueAmount)}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-amber-700 dark:text-amber-400 font-semibold">
                              <div>{formatCurrency(emp.commissionEarned)}</div>
                              <div className="text-[9px] text-slate-400">({emp.commissionRate}%)</div>
                            </td>
                            <td className="py-2.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    playClickSound();
                                    setExpandedQuickEmployeeCode(isExpandedQuick ? null : emp.employeeCode);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                                    isExpandedQuick
                                      ? 'bg-blue-600 text-white border-blue-700'
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                  }`}
                                  title="Toggle drilldown of this employee's sales invoices"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Invoices ({emp.invoicesCount})</span>
                                  {isExpandedQuick ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playClickSound();
                                    setViewingStaffSlip(emp);
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Print official sales performance slip"
                                >
                                  <Printer className="w-3 h-3 text-emerald-600" />
                                  <span>Slip</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReport('SALES', 'EMPLOYEE WISE SALE REPORT')}
                                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Open full detailed employee sales report"
                                >
                                  <Award className="w-3 h-3 text-indigo-500" />
                                  <span>Report</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDED INVOICES FOR THIS EMPLOYEE WITH SEE, EDIT, DELETE BESIDE FAMILIAR ROWS */}
                          {isExpandedQuick && (
                            <tr className="bg-blue-50/50 dark:bg-slate-850/80 border-y border-blue-200 dark:border-slate-700">
                              <td colSpan={9} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-blue-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Sales Invoices Generated by {emp.name} ({emp.employeeCode})</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-normal">
                                      (Click invoice to open official document voucher)
                                    </span>
                                  </div>

                                  {emp.invoices.length === 0 ? (
                                    <div className="text-center py-4 text-slate-400 text-xs italic">
                                      No sales invoices recorded for this employee yet.
                                    </div>
                                  ) : (
                                    <table className="w-full text-left text-xs bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                                      <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800 text-[9px] font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                          <th className="p-2">Invoice #</th>
                                          <th className="p-2">Date &amp; Time</th>
                                          <th className="p-2">Customer</th>
                                          <th className="p-2 text-center">Items</th>
                                          <th className="p-2 text-right">Grand Total</th>
                                          <th className="p-2 text-center">Status</th>
                                          <th className="p-2 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50">
                                            Document Action
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {emp.invoices.map((inv) => (
                                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-2 font-mono font-bold text-blue-700 dark:text-sky-400">
                                              {inv.refNo}
                                            </td>
                                            <td className="p-2 text-slate-500 font-mono text-[10px]">
                                              {inv.dateTime}
                                            </td>
                                            <td className="p-2">
                                              <div className="font-semibold">{inv.partyName}</div>
                                              {inv.partyPhone && (
                                                <div className="text-[10px] text-slate-400 font-mono">{inv.partyPhone}</div>
                                              )}
                                            </td>
                                            <td className="p-2 text-center font-mono">
                                              {inv.itemsCount}
                                            </td>
                                            <td className="p-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                                              {formatCurrency(inv.grandTotal)}
                                            </td>
                                            <td className="p-2 text-center">
                                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {inv.status}
                                              </span>
                                            </td>
                                            <td className="p-2 text-center">
                                              <div className="flex items-center justify-center gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => handleSeeRecord(inv)}
                                                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                                                  title="Open invoice to view, edit, print or delete"
                                                >
                                                  <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                  <span>Open Invoice</span>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                      <th className="py-2.5 px-3">Ref / Invoice #</th>
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Party (Customer / Vendor)</th>
                      <th className="py-2.5 px-3 text-center">Items</th>
                      <th className="py-2.5 px-3 text-right">Grand Total</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      {/* ACTION COLUMN: BESIDE THE FAMILIAR ROW */}
                      <th className="py-2.5 px-3 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                        Actions (View · Edit · Print · Delete)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quickLedgerRecords.map((rec) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors font-medium text-slate-800 dark:text-slate-200"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-400">
                          {rec.refNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                          {rec.dateTime}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {rec.partyName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {rec.itemsCount} {rec.itemsCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(rec.grandTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              rec.status === 'Paid' || rec.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : rec.status === 'Partial'
                                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {rec.status} ({rec.paymentMethod})
                          </span>
                        </td>

                        {/* Action: Open Record */}
                        <td className="py-2.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleSeeRecord(rec)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                            title="Open transaction record to view, edit, print or delete"
                          >
                            <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>Open Record</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main 3-Column Grid Container matching the screenshot */}
      <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {[1, 2, 3].map((colIndex) => {
            const categoriesInCol = REPORT_SECTIONS.filter((cat) => cat.column === colIndex);

            return (
              <div key={colIndex} className="space-y-6">
                {categoriesInCol.map((category) => {
                  const filteredItems = globalFilter.trim()
                    ? category.items.filter((item) =>
                        item.toLowerCase().includes(globalFilter.toLowerCase())
                      )
                    : category.items;

                  if (globalFilter.trim() && filteredItems.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={category.id}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs rounded-xs overflow-hidden"
                    >
                      {/* Panel Category Header (Light Gray-Blue matching image) */}
                      <div className="bg-[#b8c9d9] dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase px-3 py-2 border-b border-slate-300 dark:border-slate-700 flex items-center tracking-wider">
                        {renderCategoryIcon(category.iconType)}
                        <span>{category.title}</span>
                      </div>

                      {/* Panel Items List without action buttons on report names */}
                      <div className="p-2.5 bg-white dark:bg-slate-900 space-y-1">
                        {filteredItems.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOpenReport(category.title, item)}
                            className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-blue-50/80 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                            title={`Open ${item} report & ledger`}
                          >
                            <div className="flex items-center min-w-0 gap-2">
                              <span className="text-blue-600 dark:text-sky-400 font-bold text-[10px] group-hover:translate-x-0.5 transition-transform shrink-0">
                                ▸
                              </span>
                              <span className={`text-xs font-semibold truncate uppercase tracking-tight ${
                                item === 'DAILY CASH STATEMENT'
                                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                  : 'text-[#1a5fb4] dark:text-sky-400 group-hover:text-blue-800 dark:group-hover:text-sky-300'
                              }`}>
                                {item}
                              </span>
                              {item === 'DAILY CASH STATEMENT' && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-700 shrink-0">
                                  System Report
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              Open Report ↗
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* DAILY CASH STATEMENT (5-SECTION EXCEL SPREADSHEET MATCHING USER SCREENSHOT) */}
      {selectedReport && selectedReport.item === 'DAILY CASH STATEMENT' && (
        <div className="fixed inset-0 z-50 bg-[#f0f2f5] dark:bg-slate-950 flex flex-col overflow-y-auto animate-in fade-in-50 duration-150">
          <DailyCashStatementSheet onBack={() => setSelectedReport(null)} />
        </div>
      )}

      {/* DEDICATED STANDARD SYSTEM REPORT VIEWER (PURCHASE, SALES, EXPENSES, EXPENSE DETAILS, P&L INVOICE, P&L CONSOLIDATED) */}
      {selectedReport && selectedReport.item !== 'DAILY CASH STATEMENT' && getStandardReportType(selectedReport.category, selectedReport.item) && (
        <StandardSystemReportViewer
          reportType={getStandardReportType(selectedReport.category, selectedReport.item)!}
          title={selectedReport.item}
          category={selectedReport.category}
          onClose={handleCloseReport}
          salesInvoices={salesInvoices}
          purchaseInvoices={purchaseInvoices}
          purchaseOrders={purchaseOrders}
          onDrillDownRecord={(rec) => {
            handleSeeRecord(rec);
          }}
        />
      )}

      {/* INTERACTIVE REPORT VIEWER MODAL WITH SEE, EDIT, DELETE BESIDE FAMILIAR ROWS (FOR EMPLOYEE REPORT / OTHER) */}
      {selectedReport && selectedReport.item !== 'DAILY CASH STATEMENT' && !getStandardReportType(selectedReport.category, selectedReport.item) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none animate-in fade-in-50 duration-150">
          <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-300 uppercase font-bold tracking-wider">
                    <span>{selectedReport.category}</span>
                    <span>›</span>
                    <span className="text-white">{selectedReport.item}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    {selectedReport.item} Statement &amp; Audit Log
                  </h2>
                </div>
              </div>

              {/* Top Quick-Switcher between Sales Invoice, Purchase Order, and Purchase Invoice */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveRecordType('sales_invoice')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRecordType === 'sales_invoice'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Sales Invoices ({salesInvoices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRecordType('purchase_order')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRecordType === 'purchase_order'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Purchase Orders ({purchaseOrders.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRecordType('purchase_invoice')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRecordType === 'purchase_invoice'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Purchase Invoices ({purchaseInvoices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRecordType('employee_wise_sales')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRecordType === 'employee_wise_sales'
                      ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-xs font-bold ring-1 ring-amber-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Employee Wise Sales ({employeeSummaries.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Export to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button
                  onClick={handlePrintReport}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={handleCloseReport}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Date Range:</span>
                <select
                  value={reportDateRange}
                  onChange={(e) => setReportDateRange(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Today">Today (04 Oct 2026)</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month (October 2026)">This Month (October 2026)</option>
                  <option value="Last Month (September 2026)">Last Month (September 2026)</option>
                  <option value="Quarter to Date">Quarter to Date (Q4 2026)</option>
                  <option value="Year to Date">Year to Date (FY 2026)</option>
                </select>

                {activeRecordType === 'employee_wise_sales' && (
                  <>
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Search employee name/code..."
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 w-48"
                    />

                    <select
                      value={employeeDeptFilter}
                      onChange={(e) => setEmployeeDeptFilter(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="All">All Departments</option>
                      <option value="Sales & Operations">Sales &amp; Operations</option>
                      <option value="Operations & Management">Operations &amp; Management</option>
                      <option value="Finance & Counter">Finance &amp; Counter</option>
                      <option value="Service & RMA">Service &amp; RMA</option>
                      <option value="Retail Counter">Retail Counter</option>
                    </select>

                    <select
                      value={employeeSortBy}
                      onChange={(e) => setEmployeeSortBy(e.target.value as any)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="grandTotal">Sort by Highest Sales</option>
                      <option value="invoicesCount">Sort by Invoices Count</option>
                      <option value="commissionEarned">Sort by Commission</option>
                    </select>
                  </>
                )}

                <span className="text-[11px] text-slate-500 ml-2">
                  Showing <strong>{activeRecordType === 'employee_wise_sales' ? filteredEmployeeSummaries.length : activeRecordsList.length}</strong> active rows
                </span>
              </div>

              {/* Summary KPIs */}
              <div className="flex items-center gap-3 flex-wrap">
                {activeRecordType === 'employee_wise_sales' ? (
                  <>
                    <div className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                      <span className="text-slate-500 mr-1.5">Total Staff Sales:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {formatCurrency(totalEmpGrandTotal)}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                      <span className="text-slate-500 mr-1.5">Collected:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatCurrency(totalEmpPaid)}
                      </span>
                    </div>
                    {totalEmpDue > 0 && (
                      <div className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-900 dark:text-rose-200">
                        <span className="text-slate-500 mr-1.5">Due:</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                          {formatCurrency(totalEmpDue)}
                        </span>
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                      <span className="text-slate-500 mr-1.5">Total Commission:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                        {formatCurrency(totalEmpCommission)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                      <span className="text-slate-500 mr-1.5">Total Transaction Volume:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {formatCurrency(totalFilteredSum)}
                      </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {activeRecordsList.length} Records
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Table Container: Either Employee Wise Sale Report OR Transaction Records with See, Edit, Delete beside familiar rows */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {activeRecordType === 'employee_wise_sales' ? (
                <div className="space-y-4">
                  {/* Top Performer Ribbon */}
                  {topPerformer && (
                    <div className="p-3 bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                            ★ Top Performing Sales Associate
                          </span>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {topPerformer.name} ({topPerformer.employeeCode}) · {topPerformer.designation}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[11px] block">Sales Generated:</span>
                          <strong className="text-blue-700 dark:text-sky-400 text-sm font-bold">{formatCurrency(topPerformer.grandTotal)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px] block">Commission Earned:</span>
                          <strong className="text-amber-600 text-sm font-bold">{formatCurrency(topPerformer.commissionEarned)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employee Wise Sales Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3 px-3.5">Staff Code &amp; Name</th>
                          <th className="py-3 px-3.5">Designation &amp; Dept</th>
                          <th className="py-3 px-3.5 text-center">Invoices</th>
                          <th className="py-3 px-3.5 text-center">Units Sold</th>
                          <th className="py-3 px-3.5 text-right">Gross Sales</th>
                          <th className="py-3 px-3.5 text-right">VAT (5%)</th>
                          <th className="py-3 px-3.5 text-right font-bold text-blue-700 dark:text-sky-400">Grand Total (Net)</th>
                          <th className="py-3 px-3.5 text-right">Paid / Due</th>
                          <th className="py-3 px-3.5 text-right">Commission Rate &amp; Earned</th>
                          <th className="py-3 px-3.5 text-center">Sales Share %</th>
                          <th className="py-3 px-4 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                            Actions Beside Familiar Row
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredEmployeeSummaries.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="text-center py-10 text-slate-400 italic">
                              No employees found matching filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredEmployeeSummaries.map((emp, idx) => {
                            const isExpanded = expandedEmployeeCode === emp.employeeCode;
                            const sharePercentage = totalEmpGrandTotal > 0
                              ? Math.round((emp.grandTotal / totalEmpGrandTotal) * 100)
                              : 0;

                            return (
                              <React.Fragment key={emp.employeeCode}>
                                <tr className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors font-medium text-slate-800 dark:text-slate-200">
                                  <td className="py-3 px-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        idx === 0
                                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                      }`}>
                                        #{idx + 1}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                          <span>{emp.name}</span>
                                          {idx === 0 && (
                                            <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                                              ★ Top
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-mono text-[10px] text-slate-400">
                                          {emp.employeeCode}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3.5">
                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                      {emp.designation}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {emp.department}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3.5 text-center">
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      {emp.invoicesCount} inv
                                    </span>
                                  </td>

                                  <td className="py-3 px-3.5 text-center font-mono font-semibold">
                                    {emp.unitsCount} pcs
                                  </td>

                                  <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                                    {formatCurrency(emp.grossAmount)}
                                  </td>

                                  <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                                    {formatCurrency(emp.taxAmount)}
                                  </td>

                                  <td className="py-3 px-3.5 text-right font-mono font-bold text-blue-700 dark:text-sky-400 text-xs">
                                    {formatCurrency(emp.grandTotal)}
                                  </td>

                                  <td className="py-3 px-3.5 text-right font-mono text-[11px]">
                                    <div className="text-emerald-600 font-semibold">{formatCurrency(emp.paidAmount)}</div>
                                    {emp.dueAmount > 0 && (
                                      <div className="text-rose-500 text-[10px]">Due: {formatCurrency(emp.dueAmount)}</div>
                                    )}
                                  </td>

                                  <td className="py-3 px-3.5 text-right font-mono">
                                    <div className="font-bold text-amber-700 dark:text-amber-400">{formatCurrency(emp.commissionEarned)}</div>
                                    <div className="text-[10px] text-slate-400">Rate: {emp.commissionRate}%</div>
                                  </td>

                                  <td className="py-3 px-3.5 text-center">
                                    <div className="w-20 mx-auto">
                                      <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                                        {sharePercentage}%
                                      </div>
                                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-blue-600 h-1.5 rounded-full"
                                          style={{ width: `${sharePercentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* ACTIONS BESIDE THE FAMILIAR ROW */}
                                  <td className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          playClickSound();
                                          setExpandedEmployeeCode(isExpanded ? null : emp.employeeCode);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                                          isExpanded
                                            ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                        }`}
                                        title="See all sales invoices generated by this employee with See, Edit, Delete"
                                      >
                                        <Receipt className="w-3.5 h-3.5" />
                                        <span>Invoices ({emp.invoicesCount})</span>
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          playClickSound();
                                          setViewingStaffSlip(emp);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                        title="Print official commercial performance & commission pay slip"
                                      >
                                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Print Slip</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* EXPANDED INVOICES FOR THIS EMPLOYEE WITH SEE, EDIT, DELETE BESIDE FAMILIAR ROWS */}
                                {isExpanded && (
                                  <tr className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-y-2 border-blue-300 dark:border-blue-900">
                                    <td colSpan={11} className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-slate-700 flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-blue-600" />
                                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                                              Individual Sales Invoices Generated by {emp.name} ({emp.employeeCode})
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              (Click invoice to open official document voucher)
                                            </span>
                                          </div>
                                          <span className="text-xs font-mono font-bold text-blue-700 dark:text-sky-400">
                                            Total: {formatCurrency(emp.grandTotal)} ({emp.invoices.length} invoices)
                                          </span>
                                        </div>

                                        {emp.invoices.length === 0 ? (
                                          <div className="text-center py-6 text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                            No sales invoices recorded for this employee yet.
                                          </div>
                                        ) : (
                                          <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                                            <table className="w-full text-left text-xs border-collapse">
                                              <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                                  <th className="py-2.5 px-3">Invoice #</th>
                                                  <th className="py-2.5 px-3">Date &amp; Time</th>
                                                  <th className="py-2.5 px-3">Customer (Bill To)</th>
                                                  <th className="py-2.5 px-3 text-center">Items</th>
                                                  <th className="py-2.5 px-3 text-right">Gross Amount</th>
                                                  <th className="py-2.5 px-3 text-right">Tax (5%)</th>
                                                  <th className="py-2.5 px-3 text-right font-bold text-blue-700 dark:text-sky-400">Grand Total</th>
                                                  <th className="py-2.5 px-3 text-center">Status &amp; Payment</th>
                                                  <th className="py-2.5 px-3 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                                                    Document Action
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {emp.invoices.map((inv) => (
                                                  <tr key={inv.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 font-medium">
                                                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-400">
                                                      {inv.refNo}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                                                      {inv.dateTime}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                      <div className="font-semibold text-slate-900 dark:text-white">{inv.partyName}</div>
                                                      {inv.partyPhone && (
                                                        <div className="text-[10px] text-slate-400 font-mono">{inv.partyPhone}</div>
                                                      )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-mono">
                                                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {inv.itemsCount} {inv.itemsCount === 1 ? 'item' : 'items'}
                                                      </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                                                      {formatCurrency(inv.grossAmount)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                                                      {formatCurrency(inv.taxAmount)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                      {formatCurrency(inv.grandTotal)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                                        {inv.status} ({inv.paymentMethod})
                                                      </span>
                                                    </td>

                                                    {/* Action: Open Invoice */}
                                                    <td className="py-2.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                                                      <button
                                                        type="button"
                                                        onClick={() => handleSeeRecord(inv)}
                                                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                                                        title="Open invoice to view, edit, print or delete"
                                                      >
                                                        <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                        <span>Open Invoice</span>
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-3.5">Ref / Invoice #</th>
                        <th className="py-3 px-3.5">Date &amp; Time</th>
                        <th className="py-3 px-3.5">Party (Customer / Vendor)</th>
                        <th className="py-3 px-3.5 text-center">Items</th>
                        <th className="py-3 px-3.5 text-right">Gross Amount</th>
                        <th className="py-3 px-3.5 text-right">Tax / VAT</th>
                        <th className="py-3 px-3.5 text-right">Grand Total</th>
                        <th className="py-3 px-3.5 text-center">Status</th>
                        {/* ACTION COLUMN: BESIDE THE FAMILIAR ROW */}
                        <th className="py-3 px-4 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                          Document Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeRecordsList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                            No transaction records found in this category.
                          </td>
                        </tr>
                      ) : (
                        activeRecordsList.map((rec) => (
                          <tr
                            key={rec.id}
                            className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors font-medium text-slate-800 dark:text-slate-200"
                          >
                            {/* 1. Reference / Invoice # */}
                            <td className="py-3 px-3.5 font-mono font-bold text-blue-700 dark:text-sky-400">
                              {rec.refNo}
                            </td>

                            {/* 2. Date & Time */}
                            <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                              {rec.dateTime}
                            </td>

                            {/* 3. Party Name */}
                            <td className="py-3 px-3.5">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {rec.partyName}
                              </div>
                              {rec.partyPhone && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {rec.partyPhone}
                                </div>
                              )}
                            </td>

                            {/* 4. Items Count */}
                            <td className="py-3 px-3.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {rec.itemsCount} {rec.itemsCount === 1 ? 'item' : 'items'}
                              </span>
                            </td>

                            {/* 5. Gross Amount */}
                            <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                              {formatCurrency(rec.grossAmount)}
                            </td>

                            {/* 6. Tax / VAT */}
                            <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                              {formatCurrency(rec.taxAmount)}
                            </td>

                            {/* 7. Grand Total */}
                            <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {formatCurrency(rec.grandTotal)}
                            </td>

                            {/* 8. Status */}
                            <td className="py-3 px-3.5 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  rec.status === 'Paid' || rec.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                    : rec.status === 'Partial'
                                    ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                }`}
                              >
                                {rec.status} ({rec.paymentMethod})
                              </span>
                            </td>

                            {/* Action: Open Invoice */}
                            <td className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => handleSeeRecord(rec)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                                title="Open invoice to view, edit, print or delete"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Open Invoice</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Notice */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
                <span>
                  ✓ Live Ledger &amp; ERP Grounded Statement for <strong>{selectedReport.item}</strong> (Generated on 05 Oct 2026).
                </span>
                <span className="font-mono text-[10px]">Authorised Signatory: System Auditor (Forhad)</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleCloseReport}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. SEE DETAILS MODAL (FULL PRINTABLE COMMERCIAL DOCUMENT) */}
      {viewingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    {viewingRecord.type === 'sales_invoice'
                      ? 'Sales Invoice Document'
                      : viewingRecord.type === 'purchase_order'
                      ? 'Purchase Order Specification'
                      : 'Purchase Invoice Voucher'} · {viewingRecord.refNo}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Official ERP commercial transaction statement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ACTION TOOLBAR INSIDE THE INVOICE: VIEW · EDIT · PRINT · DELETE */}
            <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Invoice Actions:
                </span>
                <span className="font-mono text-blue-300 font-bold bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                  {viewingRecord.refNo}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. VIEW */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="View formatted commercial voucher"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {/* 2. EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const target = viewingRecord;
                    setViewingRecord(null);
                    handleOpenEditRecord(target);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit invoice: modify items, prices, date, or discount"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* 3. PRINT */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.print();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Print official commercial document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* 4. DELETE */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const target = viewingRecord;
                    setViewingRecord(null);
                    handleOpenDeleteRecord(target);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete this transaction record permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">NEXTGEN IT ERP &amp; POS</h2>
                  <p className="text-slate-500">Dhaka, Bangladesh · Phone: +880 1700-000000</p>
                  <p className="text-[10px] text-slate-400">Official Commercial Transaction Statement</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                    {viewingRecord.refNo}
                  </div>
                  <div className="text-slate-500">Date: {viewingRecord.dateTime}</div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewingRecord.status === 'Paid' || viewingRecord.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {viewingRecord.status}
                  </span>
                </div>
              </div>

              {/* Party Information */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl grid grid-cols-2 gap-3 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {viewingRecord.partyType === 'Customer' ? 'Bill To (Customer):' : 'Vendor / Supplier:'}
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {viewingRecord.partyName}
                  </div>
                  {viewingRecord.partyPhone && (
                    <div className="text-slate-500 font-mono mt-0.5">{viewingRecord.partyPhone}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method:</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingRecord.paymentMethod}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold mt-1 block">Created By:</span>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {viewingRecord.createdBy || 'Forhad'}
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Itemized Breakdown:</span>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {viewingRecord.itemsList.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-sans font-medium">{item.name}</td>
                        <td className="p-2 text-center">{item.qty}</td>
                        <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Gross:</span>
                  <span className="font-mono">{formatCurrency(viewingRecord.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tax / VAT (5%):</span>
                  <span className="font-mono">+{formatCurrency(viewingRecord.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total Amount:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(viewingRecord.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Remaining Balance Section (Calculated after this transaction) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-slate-850 dark:to-amber-950/20 border border-amber-300 dark:border-amber-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Previous Account Balance:</span>
                  <span className="font-mono font-bold">{formatCurrency(viewingRecord.partyType === 'Customer' ? 18500 : 65000)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Transaction Amount:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(viewingRecord.grandTotal)}</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200 dark:border-amber-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                      REMAINING BALANCE / OUTSTANDING DUE (অবশিষ্ট বকেয়া)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Party outstanding balance right after this transaction
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                      {formatCurrency((viewingRecord.partyType === 'Customer' ? 18500 : 65000) + (viewingRecord.status === 'Paid' ? 0 : viewingRecord.grandTotal))}
                    </span>
                  </div>
                </div>
              </div>

              {viewingRecord.notes && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200">
                  <strong>Notes &amp; Terms:</strong> {viewingRecord.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{viewingRecord.refNo}</span>
                <span>•</span>
                <span>{viewingRecord.dateTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingRecord;
                    setViewingRecord(null);
                    handleOpenDeleteRecord(target);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Delete this record permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewingRecord;
                    setViewingRecord(null);
                    handleOpenEditRecord(target);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Edit invoice: modify items, prices, date, or discount"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    window.print();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="Print invoice document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT RECORD MODAL (ASKS WHICH PART TO MODIFY: DATE, ITEM, PRICE, ADD ITEM, DISCOUNT) */}
      {editingRecord && (
        <EditInvoiceModal
          invoice={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveInvoiceRecord}
        />
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deletingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Confirm Record Deletion</h3>
                <p className="text-xs text-slate-400">This action will permanently delete this row.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div>
                <strong>Reference #:</strong> <span className="font-mono text-blue-600">{deletingRecord.refNo}</span>
              </div>
              <div>
                <strong>Party:</strong> {deletingRecord.partyName}
              </div>
              <div>
                <strong>Grand Total:</strong> <span className="font-mono font-bold">{formatCurrency(deletingRecord.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. OFFICIAL EMPLOYEE WISE SALES & COMMISSION STATEMENT MODAL (A4 PRINTABLE) */}
      {viewingStaffSlip && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  Official Employee Sales Statement · {viewingStaffSlip.name} ({viewingStaffSlip.employeeCode})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingStaffSlip(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    NEXTGEN IT ERP &amp; POS
                  </h2>
                  <p className="text-slate-500">Dhaka, Bangladesh · Phone: +880 1700-000000</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    EMPLOYEE WISE SALES &amp; COMMISSION STATEMENT (কর্মচারী বিক্রয় ও কমিশন বিবরণী)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 block">
                    EMP-STMT-{viewingStaffSlip.employeeCode}
                  </span>
                  <div className="text-slate-500 text-[11px]">Period: {reportDateRange}</div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Commission Rate: {viewingStaffSlip.commissionRate}%
                  </span>
                </div>
              </div>

              {/* Employee Bio Grid */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employee Name:</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{viewingStaffSlip.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employee ID:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{viewingStaffSlip.employeeCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Designation:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{viewingStaffSlip.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{viewingStaffSlip.department}</span>
                </div>
              </div>

              {/* KPI Performance Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Invoices</span>
                  <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">
                    {viewingStaffSlip.invoicesCount} ({viewingStaffSlip.unitsCount} pcs)
                  </span>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gross Sales</span>
                  <span className="font-mono text-base font-bold text-indigo-700 dark:text-indigo-300">
                    {formatCurrency(viewingStaffSlip.grossAmount)}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Net Sales (Grand Total)</span>
                  <span className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(viewingStaffSlip.grandTotal)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Commission Earned</span>
                  <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-300">
                    {formatCurrency(viewingStaffSlip.commissionEarned)}
                  </span>
                </div>
              </div>

              {/* Invoices Breakdown Table */}
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Itemized Sales Invoices ({viewingStaffSlip.invoices.length} Records):
                </span>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[9px] font-bold">
                    <tr>
                      <th className="p-2">Invoice #</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Customer Name</th>
                      <th className="p-2 text-center">Items</th>
                      <th className="p-2 text-right">Grand Total</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {viewingStaffSlip.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                          No invoices found for this employee.
                        </td>
                      </tr>
                    ) : (
                      viewingStaffSlip.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="p-2 font-bold text-blue-600 dark:text-sky-400">{inv.refNo}</td>
                          <td className="p-2 text-slate-500 font-sans">{inv.dateTime}</td>
                          <td className="p-2 font-sans font-medium">{inv.partyName}</td>
                          <td className="p-2 text-center">{inv.itemsCount}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(inv.grandTotal)}</td>
                          <td className="p-2 text-center font-sans font-bold text-[10px]">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Settlement & Signatures */}
              <div className="pt-8 grid grid-cols-4 gap-4 text-center border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
                <div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                    {viewingStaffSlip.name}
                  </div>
                  <div>Employee Signature</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                    POS Counter
                  </div>
                  <div>Cashier / Sales Lead</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                    Accounts Dept
                  </div>
                  <div>Auditor / Accountant</div>
                </div>
                <div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                    Management
                  </div>
                  <div>Managing Director</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingStaffSlip(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
