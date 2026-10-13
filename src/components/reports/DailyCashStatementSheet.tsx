import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  Download,
  Calendar,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Landmark,
  DollarSign,
  Wallet,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';
import { formatCurrency } from '../../utils/format';
import {
  getStoredSalesInvoices,
  getStoredPurchaseInvoices,
  ERPTransactionRecord,
} from '../../data/mockTransactions';
import { fetchSalesTransactions } from '../../services/salesApi';

export interface DailyCashStatementSheetProps {
  onBack?: () => void;
  initialDate?: string;
}

export interface OpeningBalanceState {
  mainCash: number;
  bracBank: number;
  dbbl: number;
  city: number;
  bkash: number;
  other: number;
}

export interface SalesDetailRow {
  id: string;
  customerName: string;
  invoiceNo: string;
  serialNumber: string;
  description: string;
  qty: number;
  cash: number;
  bracBank: number;
  dbbl: number;
  city: number;
  bkash: number;
}

export interface ExpenseDetailRow {
  id: string;
  n: number;
  reference: string;
  description: string;
  qty: number | string;
  mainCash: number;
  bracBank: number;
  dbbl: number;
  city: number;
  bkash: number;
}

export interface PaymentDetailRow {
  id: string;
  n: number;
  reference: string;
  description: string;
  qty: number | string;
  mainCash: number;
  bracBank: number;
  dbbl: number;
  city: number;
  bkash: number;
}

const formatTaka = (amount: number): string => {
  return '৳ ' + (amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const DailyCashStatementSheet: React.FC<DailyCashStatementSheetProps> = ({
  onBack,
  initialDate = '14-Oct-2026',
}) => {
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [dayIndex, setDayIndex] = useState<number>(14);
  const [activeAccountFilter, setActiveAccountFilter] = useState<'ALL' | 'CASH' | 'BANK' | 'BKASH'>('ALL');
  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(new Date().toLocaleTimeString());

  // 1. OPENING BALANCE STATE
  const [opening, setOpening] = useState<OpeningBalanceState>(() => {
    const saved = localStorage.getItem('erp_daily_statement_opening_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      mainCash: 35000,
      bracBank: 85000,
      dbbl: 42000,
      city: 15000,
      bkash: 12500,
      other: 5000,
    };
  });

  // 2. SALES DETAILS STATE (Synchronized dynamically with system sales)
  const [salesRows, setSalesRows] = useState<SalesDetailRow[]>(() => {
    const saved = localStorage.getItem('erp_daily_statement_sales_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'sale-1',
        customerName: 'Rahim Telecom (B2B Corp)',
        invoiceNo: 'INV-2026-0042',
        serialNumber: 'LNV-SN-8812',
        description: 'ThinkPad T14s Gen 3 (Core i7 16GB 512GB)',
        qty: 1,
        cash: 0,
        bracBank: 125000,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'sale-2',
        customerName: 'Tanvir Hossain',
        invoiceNo: 'INV-2026-0043',
        serialNumber: 'DL-9320-X1',
        description: 'Dell XPS 13 Plus 9320 OLED Touch',
        qty: 1,
        cash: 35000,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 15000,
      },
      {
        id: 'sale-3',
        customerName: 'Anika Rahman',
        invoiceNo: 'INV-2026-0044',
        serialNumber: 'HP-ENVY-44',
        description: 'HP Envy x360 2-in-1 Touch Laptop',
        qty: 1,
        cash: 20000,
        bracBank: 0,
        dbbl: 27500,
        city: 0,
        bkash: 0,
      },
      {
        id: 'sale-4',
        customerName: 'Walk-in Retail Buyer',
        invoiceNo: 'INV-2026-0045',
        serialNumber: 'LOGI-MX3S',
        description: 'Logitech MX Master 3S Wireless Mouse + Case',
        qty: 2,
        cash: 12500,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'sale-5',
        customerName: 'Apex Solutions Ltd',
        invoiceNo: 'INV-2026-0046',
        serialNumber: 'ASUS-ZEN-09',
        description: 'Asus ZenBook 14 OLED UX3402 Intel Core i5',
        qty: 1,
        cash: 0,
        bracBank: 55000,
        dbbl: 0,
        city: 13000,
        bkash: 0,
      },
      {
        id: 'sale-6',
        customerName: 'Green Delta Insurance',
        invoiceNo: 'INV-2026-0047',
        serialNumber: 'SAM-T7-2TB',
        description: 'Samsung T7 Shield 2TB Portable SSD',
        qty: 3,
        cash: 4500,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 9000,
      },
    ];
  });

  // 3. EXPENSES STATE
  const [expenseRows, setExpenseRows] = useState<ExpenseDetailRow[]>(() => {
    const saved = localStorage.getItem('erp_daily_statement_expenses_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'exp-1',
        n: 1,
        reference: 'EXP-RENT-01',
        description: 'Showroom & Branch Daily Rent Allocation',
        qty: 1,
        mainCash: 2500,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'exp-2',
        n: 2,
        reference: 'EXP-UTIL-02',
        description: 'DESCO Electricity & Commercial Generator Maintenance',
        qty: 1,
        mainCash: 0,
        bracBank: 3800,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'exp-3',
        n: 3,
        reference: 'EXP-TEA-03',
        description: 'Staff Daily Refreshment, Snacks & Client Hospitality',
        qty: 1,
        mainCash: 650,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'exp-4',
        n: 4,
        reference: 'EXP-CONV-04',
        description: 'Delivery Staff Conveyance & Courier Dispatch',
        qty: 3,
        mainCash: 1200,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'exp-5',
        n: 5,
        reference: 'EXP-NET-05',
        description: 'Optical Fiber High-Speed Internet & POS Cloud Sync',
        qty: 1,
        mainCash: 0,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 1500,
      },
      {
        id: 'exp-6',
        n: 6,
        reference: 'EXP-CLEAN-06',
        description: 'Showroom Daily Sanitization & Packaging Supplies',
        qty: 1,
        mainCash: 450,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
    ];
  });

  // 4. PAYMENTS STATE (Supplier Procurement & Vendor Settlements)
  const [paymentRows, setPaymentRows] = useState<PaymentDetailRow[]>(() => {
    const saved = localStorage.getItem('erp_daily_statement_payments_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'pay-1',
        n: 1,
        reference: 'PO-SUP-101',
        description: 'Central Hardware Distributor - Surface Pro Replenishment',
        qty: 3,
        mainCash: 0,
        bracBank: 120000,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
      {
        id: 'pay-2',
        n: 2,
        reference: 'PINV-IMP-201',
        description: 'Global Supplier Imports BD - NVMe SSD Bulk Lot Purchase',
        qty: 10,
        mainCash: 25000,
        bracBank: 0,
        dbbl: 70000,
        city: 0,
        bkash: 0,
      },
      {
        id: 'pay-3',
        n: 3,
        reference: 'PINV-CUST-202',
        description: 'Customs Handling & Cargo Port Duty Clearance',
        qty: 1,
        mainCash: 8500,
        bracBank: 0,
        dbbl: 0,
        city: 0,
        bkash: 0,
      },
    ];
  });

  // 5. ACTUAL PHYSICAL CLOSING BALANCE
  const [actualClosing, setActualClosing] = useState<OpeningBalanceState>(() => {
    const saved = localStorage.getItem('erp_daily_statement_actual_closing_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      mainCash: 99450,
      bracBank: 141200,
      dbbl: -500,
      city: 28000,
      bkash: 26900,
      other: 5000,
    };
  });

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('erp_daily_statement_opening_v1', JSON.stringify(opening));
  }, [opening]);

  useEffect(() => {
    localStorage.setItem('erp_daily_statement_sales_v1', JSON.stringify(salesRows));
  }, [salesRows]);

  useEffect(() => {
    localStorage.setItem('erp_daily_statement_expenses_v1', JSON.stringify(expenseRows));
  }, [expenseRows]);

  useEffect(() => {
    localStorage.setItem('erp_daily_statement_payments_v1', JSON.stringify(paymentRows));
  }, [paymentRows]);

  useEffect(() => {
    localStorage.setItem('erp_daily_statement_actual_closing_v1', JSON.stringify(actualClosing));
  }, [actualClosing]);

  // Synchronize dynamic sales from system transactions
  const syncWithSystemTransactions = async () => {
    setIsRefreshing(true);
    console.log('[Data Flow -> DailyCashStatementSheet] Syncing with system transactions via API & Storage...');
    try {
      const sales = await fetchSalesTransactions();
      if (sales && sales.length > 0) {
        // Map recent transactions into SalesDetailRow format
        const newRows: SalesDetailRow[] = sales.slice(0, 15).map((inv, idx) => {
          const totalAmt = inv.grandTotal || 0;
          const method = (inv.paymentMethod || '').toLowerCase();

          let cash = 0;
          let bracBank = 0;
          let dbbl = 0;
          let city = 0;
          let bkash = 0;

          if (method.includes('cash')) {
            cash = totalAmt;
          } else if (method.includes('brac') || method.includes('card') || method.includes('bank')) {
            bracBank = totalAmt;
          } else if (method.includes('dbbl') || method.includes('rocket')) {
            dbbl = totalAmt;
          } else if (method.includes('city') || method.includes('visa')) {
            city = totalAmt;
          } else if (method.includes('bkash') || method.includes('mfs')) {
            bkash = totalAmt;
          } else {
            cash = totalAmt;
          }

          return {
            id: `dyn-sale-${inv.id || idx}`,
            customerName: inv.partyName || 'Retail Customer',
            invoiceNo: inv.refNo || `INV-2026-${1000 + idx}`,
            serialNumber: `SN-${(inv.refNo || '').replace(/\D/g, '').slice(-4) || '7721'}`,
            description: inv.notes || 'IT Equipment & POS Sale Items',
            qty: inv.itemsCount || 1,
            cash,
            bracBank,
            dbbl,
            city,
            bkash,
          };
        });

        setSalesRows(newRows);
        setLastRefreshedTime(new Date().toLocaleTimeString());
        console.log(`[Data Flow -> DailyCashStatementSheet] Loaded ${newRows.length} real system sales into Statement.`);
      }
    } catch (err) {
      console.error('[Data Flow -> DailyCashStatementSheet] Failed to sync transactions:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleSync = () => {
      console.log('[Data Flow -> DailyCashStatementSheet] Triggering live sync from erp_transactions_updated');
      syncWithSystemTransactions();
    };

    window.addEventListener('erp_transactions_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('erp_transactions_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // CALCULATIONS
  // 1. Opening Total
  const openingTotal = useMemo(() => {
    return (
      (opening.mainCash || 0) +
      (opening.bracBank || 0) +
      (opening.dbbl || 0) +
      (opening.city || 0) +
      (opening.bkash || 0) +
      (opening.other || 0)
    );
  }, [opening]);

  // 2. Sales Totals
  const salesTotals = useMemo(() => {
    const res = {
      cash: 0,
      brac: 0,
      dbbl: 0,
      city: 0,
      bkash: 0,
      totalQty: 0,
      total: 0,
    };
    salesRows.forEach((r) => {
      res.cash += r.cash || 0;
      res.brac += r.bracBank || 0;
      res.dbbl += r.dbbl || 0;
      res.city += r.city || 0;
      res.bkash += r.bkash || 0;
      res.totalQty += r.qty || 0;
    });
    res.total = res.cash + res.brac + res.dbbl + res.city + res.bkash;
    return res;
  }, [salesRows]);

  // 3. Expense Totals
  const expenseTotals = useMemo(() => {
    const res = {
      cash: 0,
      brac: 0,
      dbbl: 0,
      city: 0,
      bkash: 0,
      total: 0,
    };
    expenseRows.forEach((r) => {
      res.cash += r.mainCash || 0;
      res.brac += r.bracBank || 0;
      res.dbbl += r.dbbl || 0;
      res.city += r.city || 0;
      res.bkash += r.bkash || 0;
    });
    res.total = res.cash + res.brac + res.dbbl + res.city + res.bkash;
    return res;
  }, [expenseRows]);

  // 4. Payment Totals
  const paymentTotals = useMemo(() => {
    const res = {
      cash: 0,
      brac: 0,
      dbbl: 0,
      city: 0,
      bkash: 0,
      total: 0,
    };
    paymentRows.forEach((r) => {
      res.cash += r.mainCash || 0;
      res.brac += r.bracBank || 0;
      res.dbbl += r.dbbl || 0;
      res.city += r.city || 0;
      res.bkash += r.bkash || 0;
    });
    res.total = res.cash + res.brac + res.dbbl + res.city + res.bkash;
    return res;
  }, [paymentRows]);

  // 5. Total Inflow (Sale + Opening)
  const totalSaleAndOpening = useMemo(() => {
    const cash = (salesTotals.cash || 0) + (opening.mainCash || 0);
    const brac = (salesTotals.brac || 0) + (opening.bracBank || 0);
    const dbbl = (salesTotals.dbbl || 0) + (opening.dbbl || 0);
    const city = (salesTotals.city || 0) + (opening.city || 0);
    const bkash = (salesTotals.bkash || 0) + (opening.bkash || 0);
    const other = opening.other || 0;
    const total = cash + brac + dbbl + city + bkash + other;
    return { cash, brac, dbbl, city, bkash, other, total };
  }, [salesTotals, opening]);

  // Total Outflow (Expense + Payment)
  const totalExpenseAndPayments = useMemo(() => {
    const cash = (expenseTotals.cash || 0) + (paymentTotals.cash || 0);
    const brac = (expenseTotals.brac || 0) + (paymentTotals.brac || 0);
    const dbbl = (expenseTotals.dbbl || 0) + (paymentTotals.dbbl || 0);
    const city = (expenseTotals.city || 0) + (paymentTotals.city || 0);
    const bkash = (expenseTotals.bkash || 0) + (paymentTotals.bkash || 0);
    const other = 0;
    const total = cash + brac + dbbl + city + bkash + other;
    return { cash, brac, dbbl, city, bkash, other, total };
  }, [expenseTotals, paymentTotals]);

  // Estimated Closing Balance
  const estimatedClosing = useMemo(() => {
    const cash = totalSaleAndOpening.cash - totalExpenseAndPayments.cash;
    const brac = totalSaleAndOpening.brac - totalExpenseAndPayments.brac;
    const dbbl = totalSaleAndOpening.dbbl - totalExpenseAndPayments.dbbl;
    const city = totalSaleAndOpening.city - totalExpenseAndPayments.city;
    const bkash = totalSaleAndOpening.bkash - totalExpenseAndPayments.bkash;
    const other = totalSaleAndOpening.other - totalExpenseAndPayments.other;
    const total = cash + brac + dbbl + city + bkash + other;
    return { cash, brac, dbbl, city, bkash, other, total };
  }, [totalSaleAndOpening, totalExpenseAndPayments]);

  // Actual Closing Total
  const actualClosingTotal = useMemo(() => {
    return (
      (actualClosing.mainCash || 0) +
      (actualClosing.bracBank || 0) +
      (actualClosing.dbbl || 0) +
      (actualClosing.city || 0) +
      (actualClosing.bkash || 0) +
      (actualClosing.other || 0)
    );
  }, [actualClosing]);

  // Difference / Variance
  const difference = useMemo(() => {
    const cash = (actualClosing.mainCash || 0) - estimatedClosing.cash;
    const brac = (actualClosing.bracBank || 0) - estimatedClosing.brac;
    const dbbl = (actualClosing.dbbl || 0) - estimatedClosing.dbbl;
    const city = (actualClosing.city || 0) - estimatedClosing.city;
    const bkash = (actualClosing.bkash || 0) - estimatedClosing.bkash;
    const other = (actualClosing.other || 0) - estimatedClosing.other;
    const total = actualClosingTotal - estimatedClosing.total;
    return { cash, brac, dbbl, city, bkash, other, total };
  }, [actualClosing, estimatedClosing, actualClosingTotal]);

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const handleExportCSV = () => {
    playBarcodeBeep();
    let csv = `NEXTGEN IT ENTERPRISE ERP - DAILY CASH & BANK RECONCILIATION STATEMENT\n`;
    csv += `Statement Date: ${currentDate}\n`;
    csv += `Generated At: ${new Date().toLocaleString()}\n\n`;

    csv += `1. OPENING BALANCE\n`;
    csv += `Main Cash,BRAC Bank,DBBL,City Bank,bKash,Other,Total Opening\n`;
    csv += `${opening.mainCash},${opening.bracBank},${opening.dbbl},${opening.city},${opening.bkash},${opening.other},${openingTotal}\n\n`;

    csv += `2. SALES & CASH INFLOW IN DETAILS\n`;
    csv += `Customer Name,Invoice No,Serial Number,Description,Qty,Main Cash,BRAC Bank,DBBL,City Bank,bKash,Row Total\n`;
    salesRows.forEach((r) => {
      const tot = (r.cash || 0) + (r.bracBank || 0) + (r.dbbl || 0) + (r.city || 0) + (r.bkash || 0);
      csv += `"${r.customerName}","${r.invoiceNo}","${r.serialNumber}","${r.description}",${r.qty},${r.cash},${r.bracBank},${r.dbbl},${r.city},${r.bkash},${tot}\n`;
    });
    csv += `Total Sales,,,,,${salesTotals.cash},${salesTotals.brac},${salesTotals.dbbl},${salesTotals.city},${salesTotals.bkash},${salesTotals.total}\n\n`;

    csv += `3. OPERATING EXPENSES DETAILS\n`;
    csv += `N,Reference,Description,Qty,Main Cash,BRAC Bank,DBBL,City Bank,bKash,Row Total\n`;
    expenseRows.forEach((r) => {
      const tot = (r.mainCash || 0) + (r.bracBank || 0) + (r.dbbl || 0) + (r.city || 0) + (r.bkash || 0);
      csv += `${r.n},"${r.reference}","${r.description}",${r.qty},${r.mainCash},${r.bracBank},${r.dbbl},${r.city},${r.bkash},${tot}\n`;
    });
    csv += `Total Expense,,,,${expenseTotals.cash},${expenseTotals.brac},${expenseTotals.dbbl},${expenseTotals.city},${expenseTotals.bkash},${expenseTotals.total}\n\n`;

    csv += `4. VENDOR & SUPPLIER PROCUREMENT PAYMENTS\n`;
    csv += `N,Reference,Description,Qty,Main Cash,BRAC Bank,DBBL,City Bank,bKash,Row Total\n`;
    paymentRows.forEach((r) => {
      const tot = (r.mainCash || 0) + (r.bracBank || 0) + (r.dbbl || 0) + (r.city || 0) + (r.bkash || 0);
      csv += `${r.n},"${r.reference}","${r.description}",${r.qty},${r.mainCash},${r.bracBank},${r.dbbl},${r.city},${r.bkash},${tot}\n`;
    });
    csv += `Total Payment,,,,${paymentTotals.cash},${paymentTotals.brac},${paymentTotals.dbbl},${paymentTotals.city},${paymentTotals.bkash},${paymentTotals.total}\n\n`;

    csv += `5. SYSTEM RECONCILIATION & CLOSING AUDIT\n`;
    csv += `Metric,Main Cash,BRAC Bank,DBBL,City Bank,bKash,Other,Total\n`;
    csv += `Total Sale and Opening Balance,${totalSaleAndOpening.cash},${totalSaleAndOpening.brac},${totalSaleAndOpening.dbbl},${totalSaleAndOpening.city},${totalSaleAndOpening.bkash},${totalSaleAndOpening.other},${totalSaleAndOpening.total}\n`;
    csv += `Total Expense and Payments,${totalExpenseAndPayments.cash},${totalExpenseAndPayments.brac},${totalExpenseAndPayments.dbbl},${totalExpenseAndPayments.city},${totalExpenseAndPayments.bkash},${totalExpenseAndPayments.other},${totalExpenseAndPayments.total}\n`;
    csv += `Estimated Closing Balance,${estimatedClosing.cash},${estimatedClosing.brac},${estimatedClosing.dbbl},${estimatedClosing.city},${estimatedClosing.bkash},${estimatedClosing.other},${estimatedClosing.total}\n`;
    csv += `Actual Counted Closing Balance,${actualClosing.mainCash},${actualClosing.bracBank},${actualClosing.dbbl},${actualClosing.city},${actualClosing.bkash},${actualClosing.other},${actualClosingTotal}\n`;
    csv += `Reconciliation Difference (Short/Excess),${difference.cash},${difference.brac},${difference.dbbl},${difference.city},${difference.bkash},${difference.other},${difference.total}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Cash_Statement_${currentDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoReconcile = () => {
    playCashDrawerDing();
    setActualClosing({
      mainCash: estimatedClosing.cash,
      bracBank: estimatedClosing.brac,
      dbbl: estimatedClosing.dbbl,
      city: estimatedClosing.city,
      bkash: estimatedClosing.bkash,
      other: estimatedClosing.other,
    });
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none print:bg-white print:text-black">
      {/* ========================================================================= */}
      {/* SYSTEM REPORT TOP APP BAR                                                 */}
      {/* ========================================================================= */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3 shrink-0 print:hidden shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ERP System Report
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                SR-7.1-DCS
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight flex items-center gap-2">
              <span>Daily Cash &amp; Bank Statement</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 hidden md:inline">
                (দৈনন্দিন ক্যাশ ও ব্যাংক হিসাব বিবরণী)
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="14-Oct-2026">14-Oct-2026 (Today)</option>
              <option value="13-Oct-2026">13-Oct-2026 (Yesterday)</option>
              <option value="12-Oct-2026">12-Oct-2026</option>
              <option value="11-Oct-2026">11-Oct-2026</option>
              <option value="10-Oct-2026">10-Oct-2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={syncWithSystemTransactions}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Reload real sales and transactions directly from system database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync System Sales</span>
          </button>

          <button
            type="button"
            onClick={handleAutoReconcile}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Auto-match actual physical drawer count with calculated system closing balance"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Auto-Reconcile</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export full statement data to Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Print official audited statement"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SYSTEM REPORT DOCUMENT CANVAS                                             */}
      {/* ========================================================================= */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-[1550px] w-full mx-auto space-y-6">

        {/* 1. Official Report Letterhead & Statement Overview Banner */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-xs">
                  N
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    NextGen IT Enterprise POS &amp; ERP
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Retail Operations · Multi-Channel Cash &amp; Bank Management
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white dark:bg-blue-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                DAILY CASH &amp; BANK STATEMENT
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Date: <span className="font-bold text-slate-800 dark:text-slate-200">{currentDate}</span> · Sync: {lastRefreshedTime}
              </div>
              <div className="text-[11px] text-slate-400">
                Currency: <span className="font-bold">BDT (৳)</span> · Branch: Main Flagship Showroom
              </div>
            </div>
          </div>

          {/* 5 High-Level Executive Reconciliation KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-5">
            {/* Card 1: Opening Balance */}
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                <span>1. Opening Balance</span>
                <Wallet className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-base md:text-lg font-bold font-mono text-slate-900 dark:text-white">
                {formatTaka(openingTotal)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Cash in Vault &amp; Bank Accounts
              </div>
            </div>

            {/* Card 2: Total Sales & Inflow */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                <span>2. Total Sales / Inflow</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-base md:text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300">
                +{formatTaka(salesTotals.total)}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                {salesRows.length} Invoices · {salesTotals.totalQty} Units Sold
              </div>
            </div>

            {/* Card 3: Operating Expenses */}
            <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-semibold mb-1">
                <span>3. Operating Expense</span>
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-base md:text-lg font-bold font-mono text-amber-800 dark:text-amber-300">
                -{formatTaka(expenseTotals.total)}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                {expenseRows.length} Petty Cash &amp; Utility Vouchers
              </div>
            </div>

            {/* Card 4: Supplier Payments */}
            <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs font-semibold mb-1">
                <span>4. Supplier Payments</span>
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-base md:text-lg font-bold font-mono text-rose-800 dark:text-rose-300">
                -{formatTaka(paymentTotals.total)}
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                {paymentRows.length} Procurement Settlements
              </div>
            </div>

            {/* Card 5: Net Estimated Closing */}
            <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                <span>5. Closing Balance</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-base md:text-lg font-bold font-mono text-blue-900 dark:text-sky-300">
                {formatTaka(estimatedClosing.total)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                <span>Diff:</span>
                <span className={difference.total === 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {difference.total === 0 ? '৳ 0.00 (Balanced)' : formatTaka(difference.total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: OPENING BALANCE SYSTEM BREAKDOWN                               */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider">
                Opening Balance by Ledger Accounts (প্রারম্ভিক স্থিতি)
              </h3>
            </div>
            <span className="text-[11px] text-slate-300 font-mono">
              Total Opening: <strong className="text-white">{formatTaka(openingTotal)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Account Type</th>
                  <th className="py-2.5 px-3 text-right">Main Cash Drawer</th>
                  <th className="py-2.5 px-3 text-right">BRAC Bank A/C</th>
                  <th className="py-2.5 px-3 text-right">DBBL Bank A/C</th>
                  <th className="py-2.5 px-3 text-right">City Bank A/C</th>
                  <th className="py-2.5 px-3 text-right">bKash Merchant MFS</th>
                  <th className="py-2.5 px-3 text-right">Other Floats</th>
                  <th className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white bg-slate-100/70 dark:bg-slate-800">
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-850 font-mono font-semibold text-slate-800 dark:text-slate-200">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Carried Forward from Previous Day Close</span>
                  </td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.mainCash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.bracBank)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.dbbl)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.city)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.bkash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(opening.other)}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700 dark:text-sky-400 bg-slate-50/70 dark:bg-slate-800/80">
                    {formatTaka(openingTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SALES & AMOUNT IN DETAILS (SYSTEM INVOICES & COLLECTIONS)     */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="bg-emerald-700 text-white px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-white text-emerald-800 flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider">
                Sales &amp; Collections in Details (বিক্রয় ও নগদ/ব্যাংক বিবরণী)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono bg-emerald-800 px-2 py-0.5 rounded text-emerald-100">
                {salesRows.length} Invoices
              </span>
              <span className="font-mono font-bold text-white">
                Total: {formatTaka(salesTotals.total)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Serial / Batch</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Main Cash</th>
                  <th className="py-2.5 px-3 text-right">BRAC Bank</th>
                  <th className="py-2.5 px-3 text-right">DBBL Bank</th>
                  <th className="py-2.5 px-3 text-right">City Bank</th>
                  <th className="py-2.5 px-3 text-right">bKash MFS</th>
                  <th className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white bg-slate-100/70 dark:bg-slate-800">
                    Row Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {salesRows.map((row, idx) => {
                  const lineTotal =
                    (row.cash || 0) +
                    (row.bracBank || 0) +
                    (row.dbbl || 0) +
                    (row.city || 0) +
                    (row.bkash || 0);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/60 transition-colors font-medium text-slate-800 dark:text-slate-200"
                    >
                      <td className="py-2.5 px-3 font-sans text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                        {row.customerName}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-sky-400">
                        {row.invoiceNo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                        {row.serialNumber || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300 max-w-xs truncate" title={row.description}>
                        {row.description}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {row.qty}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.cash > 0 ? formatTaka(row.cash) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.bracBank > 0 ? formatTaka(row.bracBank) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.dbbl > 0 ? formatTaka(row.dbbl) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.city > 0 ? formatTaka(row.city) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.bkash > 0 ? formatTaka(row.bkash) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-800/40">
                        {formatTaka(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-emerald-50/80 dark:bg-emerald-950/50 border-t-2 border-emerald-300 dark:border-emerald-800 font-mono font-bold text-xs text-slate-900 dark:text-white">
                <tr>
                  <td colSpan={5} className="py-2.5 px-4 font-sans uppercase tracking-wider font-black text-emerald-900 dark:text-emerald-200">
                    Total Sales &amp; Daily Collections (মোট বিক্রয়)
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-800 dark:text-emerald-300 font-black">
                    {salesTotals.totalQty}
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(salesTotals.cash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(salesTotals.brac)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(salesTotals.dbbl)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(salesTotals.city)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(salesTotals.bkash)}</td>
                  <td className="py-2.5 px-4 text-right font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 text-sm">
                    {formatTaka(salesTotals.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 2-Column Grid: Section 3 (Expenses) and Section 4 (Supplier Payments) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ========================================================================= */}
          {/* SECTION 3: OPERATING EXPENSES DETAILS                                     */}
          {/* ========================================================================= */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-amber-600 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white text-amber-700 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Operating Expenses (প্রতিদিনের অন্যান্য খরচ)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold">
                Total: {formatTaka(expenseTotals.total)}
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Ref</th>
                    <th className="py-2 px-3">Expense Head / Description</th>
                    <th className="py-2 px-3 text-right">Cash</th>
                    <th className="py-2 px-3 text-right">Bank / bKash</th>
                    <th className="py-2 px-3 text-right font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {expenseRows.map((row) => {
                    const rowBankMfs = (row.bracBank || 0) + (row.dbbl || 0) + (row.city || 0) + (row.bkash || 0);
                    const rowTot = (row.mainCash || 0) + rowBankMfs;
                    return (
                      <tr key={row.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-semibold text-slate-500">{row.reference}</td>
                        <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">{row.description}</td>
                        <td className="py-2 px-3 text-right">{row.mainCash > 0 ? formatTaka(row.mainCash) : '—'}</td>
                        <td className="py-2 px-3 text-right">{rowBankMfs > 0 ? formatTaka(rowBankMfs) : '—'}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700 dark:text-amber-400">{formatTaka(rowTot)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-amber-50/70 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 font-mono font-bold text-xs text-amber-950 dark:text-amber-200">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 font-sans uppercase font-black">
                      Total Operating Expense (মোট ব্যয়)
                    </td>
                    <td className="py-2 px-3 text-right">{formatTaka(expenseTotals.cash)}</td>
                    <td className="py-2 px-3 text-right">{formatTaka(expenseTotals.total - expenseTotals.cash)}</td>
                    <td className="py-2 px-3 text-right font-black text-amber-800 dark:text-amber-300">
                      {formatTaka(expenseTotals.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: VENDOR & SUPPLIER PAYMENTS                                    */}
          {/* ========================================================================= */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            <div className="bg-rose-700 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white text-rose-700 flex items-center justify-center text-xs font-black">
                  4
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Supplier &amp; Procurement Payments (পেমেন্ট - পণ্যের ক্রয়মূল্য)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold">
                Total: {formatTaka(paymentTotals.total)}
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Ref</th>
                    <th className="py-2 px-3">Supplier / Lot Description</th>
                    <th className="py-2 px-3 text-right">Cash</th>
                    <th className="py-2 px-3 text-right">Bank / bKash</th>
                    <th className="py-2 px-3 text-right font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {paymentRows.map((row) => {
                    const rowBankMfs = (row.bracBank || 0) + (row.dbbl || 0) + (row.city || 0) + (row.bkash || 0);
                    const rowTot = (row.mainCash || 0) + rowBankMfs;
                    return (
                      <tr key={row.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-semibold text-slate-500">{row.reference}</td>
                        <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">{row.description}</td>
                        <td className="py-2 px-3 text-right">{row.mainCash > 0 ? formatTaka(row.mainCash) : '—'}</td>
                        <td className="py-2 px-3 text-right">{rowBankMfs > 0 ? formatTaka(rowBankMfs) : '—'}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-700 dark:text-rose-400">{formatTaka(rowTot)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-rose-50/70 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 font-mono font-bold text-xs text-rose-950 dark:text-rose-200">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 font-sans uppercase font-black">
                      Total Supplier Payments (মোট পেমেন্ট)
                    </td>
                    <td className="py-2 px-3 text-right">{formatTaka(paymentTotals.cash)}</td>
                    <td className="py-2 px-3 text-right">{formatTaka(paymentTotals.total - paymentTotals.cash)}</td>
                    <td className="py-2 px-3 text-right font-black text-rose-800 dark:text-rose-300">
                      {formatTaka(paymentTotals.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: MASTER RECONCILIATION & CLOSING AUDIT LEDGER                   */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                5
              </span>
              <h3 className="font-bold text-xs uppercase tracking-wider">
                System Cash &amp; Bank Reconciliation Matrix (সমাপনী স্থিতি ও নিরীক্ষা)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                difference.total === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {difference.total === 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{difference.total === 0 ? 'Audit Status: Fully Balanced' : 'Audit Status: Variance Detected'}</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-sans font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Reconciliation Flow / Account Details</th>
                  <th className="py-2.5 px-3 text-right">Main Cash</th>
                  <th className="py-2.5 px-3 text-right">BRAC Bank</th>
                  <th className="py-2.5 px-3 text-right">DBBL Bank</th>
                  <th className="py-2.5 px-3 text-right">City Bank</th>
                  <th className="py-2.5 px-3 text-right">bKash MFS</th>
                  <th className="py-2.5 px-3 text-right">Other Float</th>
                  <th className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-800">
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                {/* Row A: Total Inflow (Sales + Opening) */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Total Inflow (Opening Balance + Sales Collections)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.cash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.brac)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.dbbl)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.city)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.bkash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalSaleAndOpening.other)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                    {formatTaka(totalSaleAndOpening.total)}
                  </td>
                </tr>

                {/* Row B: Total Outflow (Expenses + Supplier Payments) */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-rose-700 dark:text-rose-400 font-semibold">
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Total Outflow (Operating Expenses + Supplier Payments)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.cash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.brac)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.dbbl)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.city)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.bkash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(totalExpenseAndPayments.other)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-rose-800 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
                    {formatTaka(totalExpenseAndPayments.total)}
                  </td>
                </tr>

                {/* Row C: System Estimated Closing Balance */}
                <tr className="bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-sky-300 font-bold border-t border-b border-blue-200 dark:border-blue-900">
                  <td className="py-3 px-4 font-sans font-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>System Calculated Closing Balance (Inflow minus Outflow)</span>
                  </td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.cash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.brac)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.dbbl)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.city)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.bkash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(estimatedClosing.other)}</td>
                  <td className="py-3 px-4 text-right font-black text-blue-700 dark:text-sky-400 bg-blue-100/70 dark:bg-blue-900/50 text-sm">
                    {formatTaka(estimatedClosing.total)}
                  </td>
                </tr>

                {/* Row D: Physical Counted Closing Balance */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-semibold text-slate-800 dark:text-slate-200">
                  <td className="py-2.5 px-4 font-sans font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Physical Vault &amp; Bank Verified Count</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdjustmentsModal(true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-sans hover:underline flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Count</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.mainCash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.bracBank)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.dbbl)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.city)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.bkash)}</td>
                  <td className="py-2.5 px-3 text-right">{formatTaka(actualClosing.other)}</td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800">
                    {formatTaka(actualClosingTotal)}
                  </td>
                </tr>

                {/* Row E: Variance / Shortage / Excess */}
                <tr className={`font-black ${
                  difference.total === 0
                    ? 'bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-100/60 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                }`}>
                  <td className="py-3 px-4 font-sans uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Audit Variance (Short / Excess / Reconciliation Status)</span>
                  </td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.cash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.brac)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.dbbl)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.city)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.bkash)}</td>
                  <td className="py-3 px-3 text-right">{formatTaka(difference.other)}</td>
                  <td className="py-3 px-4 text-right text-sm">
                    {difference.total === 0 ? '৳ 0.00 (Balanced)' : formatTaka(difference.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* OFFICIAL AUDIT SIGNATURE STRIP (PRINT & ERP ARCHIVAL)                     */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 text-center">
            <div className="border-t border-slate-300 dark:border-slate-700 pt-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Md. Shakil Ahmed</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Prepared by (Head Cashier)</p>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kamrul Hasan, ACA</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified by (Senior Accountant)</p>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Nayeem Chowdhury</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Checked by (Store Operations Manager)</p>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Engr. Taufiqul Islam</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signatory (Managing Director)</p>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* ADJUSTMENTS & PHYSICAL COUNT MODAL                                        */}
      {/* ========================================================================= */}
      {showAdjustmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <span>Adjust Physical Vault &amp; Bank Count</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustmentsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Input actual verified physical cash counted from drawer and bank statement end-of-day balances to reconcile variance:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Main Cash Drawer (৳)</label>
                <input
                  type="number"
                  value={actualClosing.mainCash}
                  onChange={(e) => setActualClosing({ ...actualClosing, mainCash: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">BRAC Bank A/C (৳)</label>
                <input
                  type="number"
                  value={actualClosing.bracBank}
                  onChange={(e) => setActualClosing({ ...actualClosing, bracBank: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">DBBL Bank A/C (৳)</label>
                <input
                  type="number"
                  value={actualClosing.dbbl}
                  onChange={(e) => setActualClosing({ ...actualClosing, dbbl: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">City Bank A/C (৳)</label>
                <input
                  type="number"
                  value={actualClosing.city}
                  onChange={(e) => setActualClosing({ ...actualClosing, city: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">bKash Merchant MFS (৳)</label>
                <input
                  type="number"
                  value={actualClosing.bkash}
                  onChange={(e) => setActualClosing({ ...actualClosing, bkash: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Other Floats (৳)</label>
                <input
                  type="number"
                  value={actualClosing.other}
                  onChange={(e) => setActualClosing({ ...actualClosing, other: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleAutoReconcile}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Match Calculated (৳ {formatTaka(estimatedClosing.total)})
              </button>

              <button
                type="button"
                onClick={() => setShowAdjustmentsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
