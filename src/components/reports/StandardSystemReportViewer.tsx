import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  X,
  Receipt,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  ChevronDown,
  Layers,
  ArrowUpDown,
  RefreshCcw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep } from '../../utils/sound';
import { ERPTransactionRecord } from '../../data/mockTransactions';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';

export type SystemReportType =
  | 'purchase'
  | 'sales'
  | 'expense'
  | 'expense_details'
  | 'pnl_invoice'
  | 'pnl_consolidated';

export interface ExpenseRecord {
  id: string;
  voucherNo: string;
  date: string;
  category: string;
  subCategory: string;
  paidTo: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  tax: number;
  total: number;
  paymentMode: string;
  costCenter: string;
  branch: string;
}

export const INITIAL_SYSTEM_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    voucherNo: 'VCH-2026-1041',
    date: '2026-10-06',
    category: 'Utilities',
    subCategory: 'Broadband Internet',
    paidTo: 'Amber IT Broadband Ltd.',
    description: 'Showroom Dedicated Optical Fiber Internet Bill (October 2026)',
    qty: 1,
    rate: 3500,
    amount: 3500,
    tax: 175,
    total: 3675,
    paymentMode: 'bKash Merchant',
    costCenter: 'Main Flagship Showroom',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-2',
    voucherNo: 'VCH-2026-1042',
    date: '2026-10-05',
    category: 'Facility Rent',
    subCategory: 'Commercial Rent',
    paidTo: 'City Commercial Properties Ltd',
    description: 'Ground Floor Showroom & Counter Space Daily Rent Allocation',
    qty: 1,
    rate: 25000,
    amount: 25000,
    tax: 1250,
    total: 26250,
    paymentMode: 'BRAC Bank Wire',
    costCenter: 'Main Flagship Showroom',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-3',
    voucherNo: 'VCH-2026-1043',
    date: '2026-10-05',
    category: 'Utilities',
    subCategory: 'Electricity & Power',
    paidTo: 'DESCO Commercial Power',
    description: 'Showroom Air Conditioning & Billboard Electricity Meter Bill',
    qty: 1,
    rate: 12800,
    amount: 12800,
    tax: 640,
    total: 13440,
    paymentMode: 'City Bank Card',
    costCenter: 'Main Flagship Showroom',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-4',
    voucherNo: 'VCH-2026-1044',
    date: '2026-10-04',
    category: 'Office Expenses',
    subCategory: 'Staff Hospitality',
    paidTo: 'Daily Refreshment Store',
    description: 'Staff daily tea, biscuits, mineral water & VIP client snacks',
    qty: 5,
    rate: 240,
    amount: 1200,
    tax: 0,
    total: 1200,
    paymentMode: 'Cash Drawer',
    costCenter: 'Operations & Front Desk',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-5',
    voucherNo: 'VCH-2026-1045',
    date: '2026-10-04',
    category: 'Logistics',
    subCategory: 'Courier Service',
    paidTo: 'RedX Express Logistics',
    description: 'Dhaka Metropolitan Express Delivery parcel dispatch charges (8 parcels)',
    qty: 8,
    rate: 160,
    amount: 1280,
    tax: 64,
    total: 1344,
    paymentMode: 'bKash Merchant',
    costCenter: 'Logistics & Dispatch',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-6',
    voucherNo: 'VCH-2026-1046',
    date: '2026-10-03',
    category: 'Maintenance',
    subCategory: 'Showroom Sanitization',
    paidTo: 'CleanCare Facilities',
    description: 'Deep cleaning, dusting & glass polish for laptop display cases',
    qty: 1,
    rate: 2200,
    amount: 2200,
    tax: 110,
    total: 2310,
    paymentMode: 'Cash Drawer',
    costCenter: 'Main Flagship Showroom',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-7',
    voucherNo: 'VCH-2026-1047',
    date: '2026-10-02',
    category: 'IT & Cloud',
    subCategory: 'Software Subscription',
    paidTo: 'Google Cloud Platform',
    description: 'Enterprise ERP Database hosting & cloud automated backups',
    qty: 1,
    rate: 5400,
    amount: 5400,
    tax: 270,
    total: 5670,
    paymentMode: 'City Bank Card',
    costCenter: 'IT Operations',
    branch: 'Main Showroom',
  },
  {
    id: 'exp-8',
    voucherNo: 'VCH-2026-1048',
    date: '2026-10-01',
    category: 'Logistics',
    subCategory: 'Customs Clearance',
    paidTo: 'Cargo Port Clearing Agency',
    description: 'Dhaka Airport Cargo clearing fee for imported NVMe SSD lot',
    qty: 1,
    rate: 8500,
    amount: 8500,
    tax: 425,
    total: 8925,
    paymentMode: 'DBBL Bank Transfer',
    costCenter: 'Central Warehouse',
    branch: 'Uttara Hub',
  },
];

interface StandardSystemReportViewerProps {
  reportType: SystemReportType;
  title: string;
  category: string;
  onClose: () => void;
  salesInvoices: ERPTransactionRecord[];
  purchaseInvoices: ERPTransactionRecord[];
  purchaseOrders: ERPTransactionRecord[];
  onDrillDownRecord?: (record: ERPTransactionRecord) => void;
}

export const StandardSystemReportViewer: React.FC<StandardSystemReportViewerProps> = ({
  reportType,
  title,
  category,
  onClose,
  salesInvoices,
  purchaseInvoices,
  purchaseOrders,
  onDrillDownRecord,
}) => {
  // Filters State
  const [dateRange, setDateRange] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('All');

  // Drilldown Modal
  const [viewingDrilldown, setViewingDrilldown] = useState<any | null>(null);

  // 1. DATA PREPARATION: PURCHASE REPORT (ONLY PURCHASES)
  // Required Columns: Date, Invoice No, Supplier, Item, Qty, Rate, Tax, Total, Payment Status
  const purchaseData = useMemo(() => {
    // Combine purchase invoices and fulfilled purchase orders (strictly purchases only)
    const allPurchases = [...purchaseInvoices, ...purchaseOrders.filter((po) => po.status === 'Completed' || po.status === 'Partial')];

    const rows: Array<{
      id: string;
      date: string;
      invoiceNo: string;
      supplier: string;
      supplierPhone?: string;
      item: string;
      qty: number;
      rate: number;
      tax: number;
      total: number;
      paymentStatus: string;
      rawRecord: ERPTransactionRecord;
    }> = [];

    allPurchases.forEach((rec) => {
      const dateOnly = (rec.dateTime || '').split(' ')[0] || '2026-10-01';
      const items = rec.itemsList && rec.itemsList.length > 0
        ? rec.itemsList
        : [{ name: rec.notes || 'Hardware Stock Batch', qty: rec.itemsCount || 1, unitPrice: rec.grossAmount, total: rec.grossAmount }];

      items.forEach((item, idx) => {
        const itemTax = Math.round(rec.taxAmount * (item.total / (rec.grossAmount || 1)));
        const itemGrandTotal = item.total + itemTax;

        rows.push({
          id: `${rec.id}-${idx}`,
          date: dateOnly,
          invoiceNo: rec.refNo,
          supplier: rec.partyName,
          supplierPhone: rec.partyPhone,
          item: item.name,
          qty: item.qty,
          rate: item.unitPrice,
          tax: itemTax,
          total: itemGrandTotal,
          paymentStatus: rec.status,
          rawRecord: rec,
        });
      });
    });

    return rows.filter((r) => {
      if (selectedSupplier !== 'All' && r.supplier !== selectedSupplier) return false;
      if (selectedPaymentStatus !== 'All' && r.paymentStatus !== selectedPaymentStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.invoiceNo.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q) ||
          r.item.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [purchaseInvoices, purchaseOrders, selectedSupplier, selectedPaymentStatus, searchQuery]);

  // 2. DATA PREPARATION: SALES REPORT (ONLY SALES)
  // Required Columns: Date, Invoice No, Customer, Item, Qty, Rate, Tax, Total, Received, Balance
  const salesData = useMemo(() => {
    const rows: Array<{
      id: string;
      date: string;
      invoiceNo: string;
      customer: string;
      customerPhone?: string;
      item: string;
      qty: number;
      rate: number;
      tax: number;
      total: number;
      received: number;
      balance: number;
      rawRecord: ERPTransactionRecord;
    }> = [];

    salesInvoices.forEach((rec) => {
      const dateOnly = (rec.dateTime || '').split(' ')[0] || '2026-10-03';
      const items = rec.itemsList && rec.itemsList.length > 0
        ? rec.itemsList
        : [{ name: rec.notes || 'Retail POS Products', qty: rec.itemsCount || 1, unitPrice: rec.grossAmount, total: rec.grossAmount }];

      const totalItemsGross = items.reduce((sum, i) => sum + i.total, 0) || 1;
      const recPaid = rec.paidAmount ?? (rec.status === 'Paid' || rec.status === 'Completed' ? rec.grandTotal : 0);
      const recDue = rec.dueAmount ?? (rec.grandTotal - recPaid);

      items.forEach((item, idx) => {
        const itemRatio = item.total / totalItemsGross;
        const itemTax = Math.round(rec.taxAmount * itemRatio);
        const itemTotal = item.total + itemTax;
        const itemReceived = Math.round(recPaid * itemRatio);
        const itemBalance = itemTotal - itemReceived;

        rows.push({
          id: `${rec.id}-${idx}`,
          date: dateOnly,
          invoiceNo: rec.refNo,
          customer: rec.partyName,
          customerPhone: rec.partyPhone,
          item: item.name,
          qty: item.qty,
          rate: item.unitPrice,
          tax: itemTax,
          total: itemTotal,
          received: itemReceived,
          balance: Math.max(0, itemBalance),
          rawRecord: rec,
        });
      });
    });

    return rows.filter((r) => {
      if (selectedCustomer !== 'All' && r.customer !== selectedCustomer) return false;
      if (selectedPaymentStatus === 'Paid' && r.balance > 0) return false;
      if (selectedPaymentStatus === 'Due' && r.balance === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.invoiceNo.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.item.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [salesInvoices, selectedCustomer, selectedPaymentStatus, searchQuery]);

  // 3. DATA PREPARATION: EXPENSE REPORT (ONLY EXPENSES)
  // Required Columns: Date, Voucher No, Category, Paid To, Mode, Amount, Tax, Total
  const expenseData = useMemo(() => {
    return INITIAL_SYSTEM_EXPENSES.filter((exp) => {
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
      if (selectedBranch !== 'All' && exp.branch !== selectedBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          exp.voucherNo.toLowerCase().includes(q) ||
          exp.category.toLowerCase().includes(q) ||
          exp.paidTo.toLowerCase().includes(q) ||
          exp.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedBranch, searchQuery]);

  // 4. DATA PREPARATION: EXPENSE DETAILS (LINE-LEVEL)
  // Required Columns: Date, Voucher, Category/Sub, Description, Qty, Rate, Amount, Tax, Total, Cost Center
  const expenseDetailsData = useMemo(() => {
    return INITIAL_SYSTEM_EXPENSES.filter((exp) => {
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
      if (selectedCostCenter !== 'All' && exp.costCenter !== selectedCostCenter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          exp.voucherNo.toLowerCase().includes(q) ||
          exp.subCategory.toLowerCase().includes(q) ||
          exp.description.toLowerCase().includes(q) ||
          exp.costCenter.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedCostCenter, searchQuery]);

  // 5. DATA PREPARATION: PROFIT & LOSS INVOICE (INVOICE-WISE P&L)
  // Required Columns: Invoice, Customer, Sales, COGS, Direct Expense, Gross Profit, Net Profit, Margin %
  const pnlInvoiceData = useMemo(() => {
    return salesInvoices.map((inv) => {
      const sales = inv.grandTotal;
      // Calculate COGS: lookup products or apply standard hardware gross margin cost ~80%
      let calculatedCOGS = 0;
      if (inv.itemsList && inv.itemsList.length > 0) {
        inv.itemsList.forEach((item) => {
          const matchedProd = INITIAL_PRODUCTS.find((p) => p.name === item.name || p.sku === item.sku);
          const cost = matchedProd?.costPrice || Math.round(item.unitPrice * 0.8);
          calculatedCOGS += cost * item.qty;
        });
      } else {
        calculatedCOGS = Math.round(sales * 0.8);
      }

      // Direct sales delivery/packaging/gateway expense ~2.5%
      const directExpense = Math.round(sales * 0.025);
      const grossProfit = sales - calculatedCOGS;
      const netProfit = grossProfit - directExpense;
      const marginPercent = sales > 0 ? Number(((netProfit / sales) * 100).toFixed(1)) : 0;

      return {
        id: inv.id,
        invoice: inv.refNo,
        date: (inv.dateTime || '').split(' ')[0] || '2026-10-03',
        customer: inv.partyName,
        sales,
        cogs: calculatedCOGS,
        directExpense,
        grossProfit,
        netProfit,
        marginPercent,
        rawRecord: inv,
      };
    }).filter((r) => {
      if (selectedCustomer !== 'All' && r.customer !== selectedCustomer) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = r.invoice.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [salesInvoices, selectedCustomer, searchQuery]);

  // 6. DATA PREPARATION: CONSOLIDATED PROFIT & LOSS STATEMENT
  // Income, COGS, Gross Profit, Expenses, Net Profit/Loss
  const consolidatedPnL = useMemo(() => {
    const totalSalesRevenue = salesInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalDiscounts = salesInvoices.reduce((sum, inv) => sum + (inv.discountAmount || 0), 0);
    const netSales = totalSalesRevenue - totalDiscounts;

    // Total COGS from purchases & sales cost
    const totalPurchasesCost = purchaseInvoices.reduce((sum, p) => sum + p.grandTotal, 0);
    const totalCOGS = Math.round(netSales * 0.78); // 78% average wholesale acquisition cost

    const grossProfit = netSales - totalCOGS;
    const grossMarginPercent = netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(1) : '0';

    // Total Operating Expenses from expense ledger
    const totalOperatingExpenses = INITIAL_SYSTEM_EXPENSES.reduce((sum, e) => sum + e.total, 0);
    const operatingProfitEBITDA = grossProfit - totalOperatingExpenses;

    const netProfit = operatingProfitEBITDA;
    const netMarginPercent = netSales > 0 ? ((netProfit / netSales) * 100).toFixed(1) : '0';

    return {
      grossSales: totalSalesRevenue,
      discounts: totalDiscounts,
      netSales,
      cogs: totalCOGS,
      purchases: totalPurchasesCost,
      grossProfit,
      grossMarginPercent,
      operatingExpenses: totalOperatingExpenses,
      operatingProfitEBITDA,
      netProfit,
      netMarginPercent,
    };
  }, [salesInvoices, purchaseInvoices]);

  // Extract unique filter options
  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    purchaseInvoices.forEach((p) => set.add(p.partyName));
    purchaseOrders.forEach((p) => set.add(p.partyName));
    return Array.from(set);
  }, [purchaseInvoices, purchaseOrders]);

  const uniqueCustomers = useMemo(() => {
    const set = new Set<string>();
    salesInvoices.forEach((s) => set.add(s.partyName));
    return Array.from(set);
  }, [salesInvoices]);

  const uniqueExpenseCategories = useMemo(() => {
    const set = new Set<string>();
    INITIAL_SYSTEM_EXPENSES.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, []);

  const uniqueCostCenters = useMemo(() => {
    const set = new Set<string>();
    INITIAL_SYSTEM_EXPENSES.forEach((e) => set.add(e.costCenter));
    return Array.from(set);
  }, []);

  // EXPORT CSV HANDLER
  const handleExportCSV = () => {
    playBarcodeBeep();
    let csv = '';
    const now = new Date().toLocaleString();

    if (reportType === 'purchase') {
      csv = `PURCHASE REPORT - ONLY PURCHASES\nGenerated: ${now}\n\nDate,Invoice No,Supplier,Item,Qty,Rate,Tax,Total,Payment Status\n`;
      purchaseData.forEach((r) => {
        csv += `"${r.date}","${r.invoiceNo}","${r.supplier}","${r.item}",${r.qty},${r.rate},${r.tax},${r.total},"${r.paymentStatus}"\n`;
      });
    } else if (reportType === 'sales') {
      csv = `SALES REPORT - ONLY SALES\nGenerated: ${now}\n\nDate,Invoice No,Customer,Item,Qty,Rate,Tax,Total,Received,Balance\n`;
      salesData.forEach((r) => {
        csv += `"${r.date}","${r.invoiceNo}","${r.customer}","${r.item}",${r.qty},${r.rate},${r.tax},${r.total},${r.received},${r.balance}\n`;
      });
    } else if (reportType === 'expense') {
      csv = `EXPENSE REPORT - ONLY EXPENSES\nGenerated: ${now}\n\nDate,Voucher No,Category,Paid To,Mode,Amount,Tax,Total\n`;
      expenseData.forEach((r) => {
        csv += `"${r.date}","${r.voucherNo}","${r.category}","${r.paidTo}","${r.paymentMode}",${r.amount},${r.tax},${r.total}\n`;
      });
    } else if (reportType === 'expense_details') {
      csv = `EXPENSE DETAILS - LINE-LEVEL\nGenerated: ${now}\n\nDate,Voucher,Category/Sub,Description,Qty,Rate,Amount,Tax,Total,Cost Center\n`;
      expenseDetailsData.forEach((r) => {
        csv += `"${r.date}","${r.voucherNo}","${r.category}/${r.subCategory}","${r.description}",${r.qty},${r.rate},${r.amount},${r.tax},${r.total},"${r.costCenter}"\n`;
      });
    } else if (reportType === 'pnl_invoice') {
      csv = `PROFIT & LOSS INVOICE - INVOICE-WISE P&L\nGenerated: ${now}\n\nInvoice,Customer,Sales,COGS,Direct Expense,Gross Profit,Net Profit,Margin %\n`;
      pnlInvoiceData.forEach((r) => {
        csv += `"${r.invoice}","${r.customer}",${r.sales},${r.cogs},${r.directExpense},${r.grossProfit},${r.netProfit},"${r.marginPercent}%"\n`;
      });
    } else if (reportType === 'pnl_consolidated') {
      csv = `CONSOLIDATED PROFIT & LOSS STATEMENT\nGenerated: ${now}\n\nLine Item,Amount (BDT)\n`;
      csv += `Gross Sales Revenue,${consolidatedPnL.grossSales}\n`;
      csv += `Less Sales Discounts,${consolidatedPnL.discounts}\n`;
      csv += `Net Sales Revenue,${consolidatedPnL.netSales}\n`;
      csv += `Cost of Goods Sold (COGS),${consolidatedPnL.cogs}\n`;
      csv += `Gross Profit,${consolidatedPnL.grossProfit}\n`;
      csv += `Gross Margin,${consolidatedPnL.grossMarginPercent}%\n`;
      csv += `Operating Expenses,${consolidatedPnL.operatingExpenses}\n`;
      csv += `Net Profit / (Loss),${consolidatedPnL.netProfit}\n`;
      csv += `Net Margin,${consolidatedPnL.netMarginPercent}%\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none animate-in fade-in-50 duration-150">
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* ========================================================================= */}
        {/* REPORT MODAL HEADER                                                       */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] text-blue-300 uppercase font-bold tracking-wider">
                <span>{category}</span>
                <span>›</span>
                <span className="text-white">{title}</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.2 rounded-full border border-blue-400/30 font-mono">
                  Isolated Source Filter
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shadow-2xs"
              title="Export statement to CSV file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Print formatted document voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DYNAMIC REPORT FILTERS BAR                                                */}
        {/* Rules: Date/branch/customer/supplier filters                              */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Search */}
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report records..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Date:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today (04 Oct 2026)</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month (October 2026)</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500">Branch:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Branches</option>
                <option value="Main Showroom">Main Flagship Showroom</option>
                <option value="Uttara Hub">Uttara Logistics Hub</option>
                <option value="Dhanmondi Branch">Dhanmondi Retail Center</option>
              </select>
            </div>

            {/* Specific Filter: Customer (for Sales & P&L Invoice) */}
            {(reportType === 'sales' || reportType === 'pnl_invoice') && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Customer:</span>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate"
                >
                  <option value="All">All Customers</option>
                  {uniqueCustomers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Specific Filter: Supplier (for Purchase) */}
            {reportType === 'purchase' && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Supplier:</span>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate"
                >
                  <option value="All">All Suppliers</option>
                  {uniqueSuppliers.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Specific Filter: Category (for Expenses) */}
            {(reportType === 'expense' || reportType === 'expense_details') && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Categories</option>
                  {uniqueExpenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Specific Filter: Cost Center (for Expense Details) */}
            {reportType === 'expense_details' && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Cost Center:</span>
                <select
                  value={selectedCostCenter}
                  onChange={(e) => setSelectedCostCenter(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Cost Centers</option>
                  {uniqueCostCenters.map((cc) => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Status Filter */}
            {(reportType === 'purchase' || reportType === 'sales') && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Due">Outstanding / Due</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Row Count & Totals */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-bold">
              {reportType === 'purchase' && `${purchaseData.length} Purchases`}
              {reportType === 'sales' && `${salesData.length} Sales`}
              {reportType === 'expense' && `${expenseData.length} Expenses`}
              {reportType === 'expense_details' && `${expenseDetailsData.length} Line Items`}
              {reportType === 'pnl_invoice' && `${pnlInvoiceData.length} Invoices`}
              {reportType === 'pnl_consolidated' && `FY 2026 Financial Statement`}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REPORT CONTENT BODY (INDIVIDUAL FILTERED TABLES)                           */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-sans">

          {/* ----------------------------------------------------------------------- */}
          {/* 1. PURCHASE REPORT: ONLY PURCHASES                                      */}
          {/* Columns: Date, Invoice No, Supplier, Item, Qty, Rate, Tax, Total, Status*/}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'purchase' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Total Purchase Value</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-purple-900 dark:text-purple-200 mt-0.5">
                    {formatCurrency(purchaseData.reduce((s, r) => s + r.total, 0))}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Units Purchased</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-blue-900 dark:text-blue-200 mt-0.5">
                    {purchaseData.reduce((s, r) => s + r.qty, 0)} pcs
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Input Tax (VAT)</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {formatCurrency(purchaseData.reduce((s, r) => s + r.tax, 0))}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Total Purchase Records</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-800 dark:text-white mt-0.5">
                    {purchaseData.length} records
                  </div>
                </div>
              </div>

              {/* Purchase Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">Total</th>
                      <th className="py-2.5 px-3 text-center">Payment Status</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {purchaseData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-10 text-slate-400 italic">
                          No purchase records match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      purchaseData.map((row) => (
                        <tr key={row.id} className="hover:bg-purple-50/20 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{row.date}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-400">{row.invoiceNo}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.supplier}</td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{row.item}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">{row.qty}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(row.rate)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(row.tax)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-purple-900 dark:text-purple-300">
                            {formatCurrency(row.total)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              row.paymentStatus === 'Paid' || row.paymentStatus === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : row.paymentStatus === 'Partial'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                              {row.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                if (onDrillDownRecord) onDrillDownRecord(row.rawRecord);
                                else setViewingDrilldown(row);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Drill-down to see full procurement invoice voucher"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Drill-down</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700 font-mono">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 uppercase font-black font-sans text-slate-800 dark:text-slate-200">
                        Purchase Grand Total
                      </td>
                      <td className="py-2.5 px-2 text-center">{purchaseData.reduce((s, r) => s + r.qty, 0)}</td>
                      <td className="py-2.5 px-3 text-right">—</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(purchaseData.reduce((s, r) => s + r.tax, 0))}</td>
                      <td className="py-2.5 px-3 text-right font-black text-purple-900 dark:text-purple-300 text-sm">
                        {formatCurrency(purchaseData.reduce((s, r) => s + r.total, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 2. SALES REPORT: ONLY SALES                                             */}
          {/* Columns: Date, Invoice No, Customer, Item, Qty, Rate, Tax, Total, Received, Balance */}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'sales' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Sales Value</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-blue-900 dark:text-blue-200 mt-0.5">
                    {formatCurrency(salesData.reduce((s, r) => s + r.total, 0))}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Received / Paid</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {formatCurrency(salesData.reduce((s, r) => s + r.received, 0))}
                  </div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                  <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">Outstanding Balance (Due)</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-rose-900 dark:text-rose-200 mt-0.5">
                    {formatCurrency(salesData.reduce((s, r) => s + r.balance, 0))}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Total Units Sold</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-800 dark:text-white mt-0.5">
                    {salesData.reduce((s, r) => s + r.qty, 0)} pcs
                  </div>
                </div>
              </div>

              {/* Sales Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">Total</th>
                      <th className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">Received</th>
                      <th className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">Balance</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-10 text-slate-400 italic">
                          No sales records match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      salesData.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{row.date}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-400">{row.invoiceNo}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.customer}</td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{row.item}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">{row.qty}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(row.rate)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(row.tax)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            {formatCurrency(row.total)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(row.received)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {row.balance > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(row.balance)}</span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">৳ 0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                if (onDrillDownRecord) onDrillDownRecord(row.rawRecord);
                                else setViewingDrilldown(row);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Drill-down to see full sales invoice voucher"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Drill-down</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700 font-mono">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 uppercase font-black font-sans text-slate-800 dark:text-slate-200">
                        Sales Grand Total
                      </td>
                      <td className="py-2.5 px-2 text-center">{salesData.reduce((s, r) => s + r.qty, 0)}</td>
                      <td className="py-2.5 px-3 text-right">—</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(salesData.reduce((s, r) => s + r.tax, 0))}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(salesData.reduce((s, r) => s + r.total, 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(salesData.reduce((s, r) => s + r.received, 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(salesData.reduce((s, r) => s + r.balance, 0))}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 3. EXPENSE REPORT: ONLY EXPENSES                                        */}
          {/* Columns: Date, Voucher No, Category, Paid To, Mode, Amount, Tax, Total   */}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'expense' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Total Operating Expenses</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-amber-900 dark:text-amber-200 mt-0.5">
                    {formatCurrency(expenseData.reduce((s, r) => s + r.total, 0))}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Net Amount</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-blue-900 dark:text-blue-200 mt-0.5">
                    {formatCurrency(expenseData.reduce((s, r) => s + r.amount, 0))}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Deducted Tax</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {formatCurrency(expenseData.reduce((s, r) => s + r.tax, 0))}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Total Vouchers Issued</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-800 dark:text-white mt-0.5">
                    {expenseData.length} vouchers
                  </div>
                </div>
              </div>

              {/* Expense Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Voucher No</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Paid To</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">Total</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {expenseData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                          No expense records match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      expenseData.map((exp) => (
                        <tr key={exp.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{exp.date}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">{exp.voucherNo}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{exp.paidTo}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{exp.paymentMode}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(exp.amount)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(exp.tax)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-900 dark:text-amber-300">
                            {formatCurrency(exp.total)}
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setViewingDrilldown(exp);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Drill-down to see full expense voucher"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Drill-down</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700 font-mono">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 uppercase font-black font-sans text-slate-800 dark:text-slate-200">
                        Total Operating Expenses
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(expenseData.reduce((s, r) => s + r.amount, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(expenseData.reduce((s, r) => s + r.tax, 0))}</td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-900 dark:text-amber-300 text-sm">
                        {formatCurrency(expenseData.reduce((s, r) => s + r.total, 0))}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 4. EXPENSE DETAILS: LINE-LEVEL                                          */}
          {/* Columns: Date, Voucher, Category/Sub, Description, Qty, Rate, Amount, Tax, Total, Cost Center */}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'expense_details' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Voucher</th>
                      <th className="py-2.5 px-3">Category / Sub</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Tax</th>
                      <th className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">Total</th>
                      <th className="py-2.5 px-3">Cost Center</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {expenseDetailsData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-10 text-slate-400 italic">
                          No line-level expenses match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      expenseDetailsData.map((exp) => (
                        <tr key={exp.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{exp.date}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">{exp.voucherNo}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{exp.category}</div>
                            <div className="text-[10px] text-slate-400">{exp.subCategory}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs">{exp.description}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">{exp.qty}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(exp.rate)}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(exp.amount)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(exp.tax)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-900 dark:text-amber-300">
                            {formatCurrency(exp.total)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                              {exp.costCenter}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setViewingDrilldown(exp);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Drill-down to see voucher line details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Drill-down</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700 font-mono">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 uppercase font-black font-sans text-slate-800 dark:text-slate-200">
                        Line-Level Details Total
                      </td>
                      <td className="py-2.5 px-2 text-center">{expenseDetailsData.reduce((s, r) => s + r.qty, 0)}</td>
                      <td className="py-2.5 px-3 text-right">—</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(expenseDetailsData.reduce((s, r) => s + r.amount, 0))}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(expenseDetailsData.reduce((s, r) => s + r.tax, 0))}</td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-900 dark:text-amber-300 text-sm">
                        {formatCurrency(expenseDetailsData.reduce((s, r) => s + r.total, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 5. PROFIT & LOSS INVOICE: INVOICE-WISE P&L                              */}
          {/* Columns: Invoice, Customer, Sales, COGS, Direct Expense, Gross Profit, Net Profit, Margin % */}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'pnl_invoice' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Invoiced Sales</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-blue-900 dark:text-blue-200 mt-0.5">
                    {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.sales, 0))}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Total COGS (Cost)</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-purple-900 dark:text-purple-200 mt-0.5">
                    {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.cogs, 0))}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Gross Profit</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.grossProfit, 0))}
                  </div>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-800">
                  <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">Total Net Profit</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-teal-900 dark:text-teal-200 mt-0.5">
                    {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.netProfit, 0))}
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Average Profit Margin</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
                    {(() => {
                      const totalSales = pnlInvoiceData.reduce((s, r) => s + r.sales, 0);
                      const totalNet = pnlInvoiceData.reduce((s, r) => s + r.netProfit, 0);
                      return totalSales > 0 ? `${((totalNet / totalSales) * 100).toFixed(1)}%` : '0%';
                    })()}
                  </div>
                </div>
              </div>

              {/* PnL Invoice Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Sales</th>
                      <th className="py-2.5 px-3 text-right">COGS</th>
                      <th className="py-2.5 px-3 text-right">Direct Exp</th>
                      <th className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">Gross Profit</th>
                      <th className="py-2.5 px-3 text-right font-bold text-teal-700 dark:text-teal-300">Net Profit</th>
                      <th className="py-2.5 px-3 text-center">Margin %</th>
                      <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {pnlInvoiceData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-10 text-slate-400 italic">
                          No invoices match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      pnlInvoiceData.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-400">{row.invoice}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{row.date}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.customer}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(row.sales)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-purple-700 dark:text-purple-400">{formatCurrency(row.cogs)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(row.directExpense)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(row.grossProfit)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-300">
                            {formatCurrency(row.netProfit)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.marginPercent >= 20
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : row.marginPercent >= 10
                                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {row.marginPercent}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                if (onDrillDownRecord) onDrillDownRecord(row.rawRecord);
                                else setViewingDrilldown(row);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Drill-down to see item-wise sales and cost structure"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Drill-down</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700 font-mono">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 uppercase font-black font-sans text-slate-800 dark:text-slate-200">
                        Total Invoiced Profitability
                      </td>
                      <td className="py-2.5 px-3 text-right font-black">{formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.sales, 0))}</td>
                      <td className="py-2.5 px-3 text-right text-purple-700 dark:text-purple-400 font-bold">{formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.cogs, 0))}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">{formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.directExpense, 0))}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.grossProfit, 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-teal-700 dark:text-teal-300 text-sm">
                        {formatCurrency(pnlInvoiceData.reduce((s, r) => s + r.netProfit, 0))}
                      </td>
                      <td className="py-2.5 px-3 text-center text-indigo-700 dark:text-indigo-400 font-black">
                        {(() => {
                          const totalSales = pnlInvoiceData.reduce((s, r) => s + r.sales, 0);
                          const totalNet = pnlInvoiceData.reduce((s, r) => s + r.netProfit, 0);
                          return totalSales > 0 ? `${((totalNet / totalSales) * 100).toFixed(1)}%` : '0%';
                        })()}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 6. CONSOLIDATED PROFIT & LOSS STATEMENT                                  */}
          {/* Financial Statement: Income, COGS, Gross Profit, Expenses, Net Profit/Loss */}
          {/* ----------------------------------------------------------------------- */}
          {reportType === 'pnl_consolidated' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Financial Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 p-4 rounded-2xl border border-blue-200 dark:border-slate-700 shadow-xs">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total Net Revenue (Sales)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-blue-900 dark:text-white mt-1">
                    {formatCurrency(consolidatedPnL.netSales)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    After trade discounts &amp; returns
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-850 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Gross Profit (Gross Margin)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-900 dark:text-emerald-300 mt-1">
                    {formatCurrency(consolidatedPnL.grossProfit)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-bold">
                    Gross Margin: {consolidatedPnL.grossMarginPercent}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-slate-850 p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-xs">
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">Net Profit / (Loss)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-teal-900 dark:text-teal-200 mt-1">
                    {formatCurrency(consolidatedPnL.netProfit)}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-mono font-bold">
                    Net Margin: {consolidatedPnL.netMarginPercent}%
                  </div>
                </div>
              </div>

              {/* Official Financial Statement Layout */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      NextGen IT Enterprise · Consolidated Statement of Profit &amp; Loss
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Reporting Currency: BDT (৳)
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {/* SECTION 1: OPERATING REVENUE */}
                  <div className="p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-850/30">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">I</span>
                        <span>Operating Revenue &amp; Sales Income</span>
                      </span>
                      <span className="font-mono text-blue-600 dark:text-sky-400 text-sm">
                        {formatCurrency(consolidatedPnL.netSales)}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-7 pr-2 font-mono">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-sans">Gross Sales at Counter &amp; B2B:</span>
                        <span>{formatCurrency(consolidatedPnL.grossSales)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-sans">Less: Sales Discounts &amp; Rebates:</span>
                        <span className="text-rose-500">- {formatCurrency(consolidatedPnL.discounts)}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-sans">Net Sales Revenue:</span>
                        <span>{formatCurrency(consolidatedPnL.netSales)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: COST OF GOODS SOLD (COGS) */}
                  <div className="p-4 sm:p-5">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px]">II</span>
                        <span>Cost of Goods Sold (COGS)</span>
                      </span>
                      <span className="font-mono text-purple-700 dark:text-purple-400 text-sm">
                        {formatCurrency(consolidatedPnL.cogs)}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-7 pr-2 font-mono">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-sans">Wholesale Hardware Acquisition Cost:</span>
                        <span>{formatCurrency(consolidatedPnL.cogs - 15000)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-sans">Inward Freight &amp; Customs Duty Allocation:</span>
                        <span>{formatCurrency(15000)}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-purple-800 dark:text-purple-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-sans">Total Cost of Goods Sold:</span>
                        <span>{formatCurrency(consolidatedPnL.cogs)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: GROSS PROFIT HIGHLIGHT */}
                  <div className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2 font-sans text-emerald-950 dark:text-emerald-200 text-sm uppercase tracking-wide">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>Gross Profit (Revenue minus COGS)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-800 dark:text-emerald-300">
                        {formatCurrency(consolidatedPnL.grossProfit)}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Gross Margin: {consolidatedPnL.grossMarginPercent}%
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: OPERATING EXPENSES */}
                  <div className="p-4 sm:p-5">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center text-[10px]">III</span>
                        <span>Operating &amp; Administrative Expenses</span>
                      </span>
                      <span className="font-mono text-amber-700 dark:text-amber-400 text-sm">
                        {formatCurrency(consolidatedPnL.operatingExpenses)}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-7 pr-2 font-mono">
                      {INITIAL_SYSTEM_EXPENSES.slice(0, 5).map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                          <span className="font-sans">{e.category} ({e.paidTo}):</span>
                          <span>{formatCurrency(e.total)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-sans">Total Operating Overhead:</span>
                        <span>{formatCurrency(consolidatedPnL.operatingExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: NET PROFIT / LOSS SUMMARY */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-wider text-blue-300">
                        Net Operating Profit for the Period
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Net Profit Margin: <strong className="text-emerald-300 font-mono">{consolidatedPnL.netMarginPercent}%</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black font-mono text-white">
                        {formatCurrency(consolidatedPnL.netProfit)}
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Audited ERP Reconciled Result</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER                                                              */}
        {/* ========================================================================= */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Strictly isolated query on {reportType.toUpperCase()} database source.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-all shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GENERIC DRILLDOWN MODAL                                                   */}
      {/* ========================================================================= */}
      {viewingDrilldown && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Drill-Down Record Audit Voucher</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingDrilldown(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Document / Reference:</span>
                <span className="font-bold text-blue-600 dark:text-sky-400">
                  {viewingDrilldown.invoiceNo || viewingDrilldown.voucherNo || viewingDrilldown.invoice}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Date:</span>
                <span>{viewingDrilldown.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-sans">Party / Beneficiary:</span>
                <span className="font-sans font-bold">
                  {viewingDrilldown.customer || viewingDrilldown.supplier || viewingDrilldown.paidTo}
                </span>
              </div>
              {viewingDrilldown.item && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Item / Description:</span>
                  <span className="font-sans text-right max-w-xs">{viewingDrilldown.item}</span>
                </div>
              )}
              {viewingDrilldown.qty !== undefined && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Quantity:</span>
                  <span>{viewingDrilldown.qty}</span>
                </div>
              )}
              {viewingDrilldown.rate !== undefined && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-sans">Unit Rate:</span>
                  <span>{formatCurrency(viewingDrilldown.rate)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <span className="font-sans">Grand Total:</span>
                <span className="text-blue-700 dark:text-sky-400">
                  {formatCurrency(viewingDrilldown.total || viewingDrilldown.sales || 0)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingDrilldown(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                Close Drill-down
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
