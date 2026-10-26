import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { TechDriveDocumentHeader } from '../components/TechDriveDocumentHeader';
import {
  getFull339Customers,
  AUTHENTIC_SUPPLIERS,
  AUTHENTIC_CASH_TRANSACTIONS,
  AUTHENTIC_PAYMENTS,
  AUTHENTIC_RECEIPTS,
  AUTHENTIC_JOURNALS,
  AUTHENTIC_COLLECTIONS,
  AUTHENTIC_INTERNAL_TRANSFERS,
  AUTHENTIC_EMPLOYEES,
  AUTHENTIC_ATTENDANCE,
  AUTHENTIC_LEAVES,
  AUTHENTIC_SALARIES,
  AUTHENTIC_COMMISSIONS,
  RealCustomerRecord,
  RealSupplierRecord,
  RealCashTransaction
} from '../data/reportDataBank';

export const formatDisplayDate = (dStr: string) => {
  if (!dStr) return '';
  const parts = dStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day < 10 ? '0' + day : day} ${months[monthIdx] || ''} ${year}`;
  }
  return dStr;
};

// 9 Major Sections matching Tech Drive BGD ERP
export type ReportSection =
  | 'daily'
  | 'sales'
  | 'account'
  | 'purchase'
  | 'receivables'
  | 'voucher'
  | 'inventory'
  | 'payables'
  | 'payroll';

interface SubReportConfig {
  key: string;
  label: string;
  pageTitle: string;
  docTitle: string;
  refCode: string;
  defaultOrientation: 'Landscape' | 'Portrait';
}

const SECTION_CONFIGS: Record<
  ReportSection,
  {
    title: string;
    icon: string;
    subReports: SubReportConfig[];
  }
> = {
  daily: {
    title: 'DAILY REPORT',
    icon: 'fa-exchange',
    subReports: [
      { key: 'daily_purchase', label: 'Purchase', pageTitle: 'Daily Purchase Report', docTitle: 'DAILY PURCHASE REPORT', refCode: 'REP251026DPES', defaultOrientation: 'Landscape' },
      { key: 'daily_sales', label: 'Sales', pageTitle: 'Daily Sales Report', docTitle: 'DAILY SALES REPORT', refCode: 'REP251026DSLS', defaultOrientation: 'Landscape' },
      { key: 'daily_expenses', label: 'Expenses', pageTitle: 'Daily Expenses Report', docTitle: 'DAILY EXPENSES REPORT', refCode: 'REP251026DEXP', defaultOrientation: 'Landscape' },
      { key: 'daily_expenses_details', label: 'Expenses Details', pageTitle: 'Daily Expenses Details', docTitle: 'EXPENSES DETAILS REPORT', refCode: 'REP251026DXPD', defaultOrientation: 'Landscape' },
      { key: 'daily_cash_statement', label: 'Daily Cash Statement', pageTitle: 'Daily Cash Statement', docTitle: 'DAILY CASH STATEMENT', refCode: 'REP251026DCST', defaultOrientation: 'Portrait' },
      { key: 'daily_pl_invoice', label: 'Profit & Loss (Invoice)', pageTitle: 'Profit & Loss (Invoice)', docTitle: 'PROFIT & LOSS (INVOICE)', refCode: 'REP251026DPLI', defaultOrientation: 'Landscape' },
      { key: 'daily_pl_item', label: 'Profit & Loss (Item)', pageTitle: 'Profit & Loss (Item)', docTitle: 'PROFIT & LOSS (ITEM)', refCode: 'REP251026DPLT', defaultOrientation: 'Landscape' },
      { key: 'daily_overview', label: 'Overview', pageTitle: 'Daily Overview', docTitle: 'DAILY OPERATIONS OVERVIEW', refCode: 'REP251026DOVW', defaultOrientation: 'Landscape' }
    ]
  },
  purchase: {
    title: 'PURCHASE',
    icon: 'fa-exchange',
    subReports: [
      { key: 'pur_record_inv', label: 'Purchase Record (Invoice)', pageTitle: 'Purchase Record Invoicewise', docTitle: 'INVOICE WISE PURCHASE', refCode: 'REP251026PINR', defaultOrientation: 'Landscape' },
      { key: 'pur_return_inv', label: 'Retrun Record (Invoice)', pageTitle: 'Purchase Return Record', docTitle: 'PURCHASE RETURN RECORD', refCode: 'REP251026PRTI', defaultOrientation: 'Landscape' },
      { key: 'pur_supplier_wise', label: 'Supplier Wise (Invoice)', pageTitle: 'Supplier Wise Purchase', docTitle: 'SUPPLIER WISE PURCHASE', refCode: 'REP251026PSWI', defaultOrientation: 'Landscape' },
      { key: 'pur_item_wise', label: 'Item Wise', pageTitle: 'Item Wise Purchase', docTitle: 'ITEM WISE PURCHASE', refCode: 'REP251026PITW', defaultOrientation: 'Landscape' },
      { key: 'pur_item_statement', label: 'Item Statement', pageTitle: 'Purchase Item Statement', docTitle: 'PURCHASE ITEM STATEMENT', refCode: 'REP251026PITS', defaultOrientation: 'Landscape' },
      { key: 'pur_periodic_record', label: 'Periodic Purchase Record', pageTitle: 'Periodic Purchase Record', docTitle: 'PERIODIC PURCHASE RECORD', refCode: 'REP251026PPUR', defaultOrientation: 'Landscape' },
      { key: 'pur_overview', label: 'Overview', pageTitle: 'Purchase Overview', docTitle: 'PURCHASE OVERVIEW', refCode: 'REP251026POVW', defaultOrientation: 'Landscape' }
    ]
  },
  sales: {
    title: 'SALES',
    icon: 'fa-users',
    subReports: [
      { key: 'sales_record_inv', label: 'Sales Record (Invoice)', pageTitle: 'Sales Recod invoicewise', docTitle: 'INVOICE WISE SALES', refCode: 'REP251026SIRE', defaultOrientation: 'Landscape' },
      { key: 'sales_return_inv', label: 'Return Record (Invoice)', pageTitle: 'Sales Return Record', docTitle: 'SALES RETURN RECORD', refCode: 'REP251026SRTI', defaultOrientation: 'Landscape' },
      { key: 'sales_customer_wise', label: 'Customer Wise (Invoice)', pageTitle: 'Customer Wise Sales', docTitle: 'CUSTOMER WISE SALES', refCode: 'REP251026SCWI', defaultOrientation: 'Landscape' },
      { key: 'sales_item_wise', label: 'Item Wise', pageTitle: 'Item Wise Sales', docTitle: 'ITEM WISE SALES', refCode: 'REP251026SITW', defaultOrientation: 'Landscape' },
      { key: 'sales_item_statement', label: 'Item Statement', pageTitle: 'Sales Item Statement', docTitle: 'SALES ITEM STATEMENT', refCode: 'REP251026SITS', defaultOrientation: 'Landscape' },
      { key: 'sales_periodic_record', label: 'Periodic Sales Record', pageTitle: 'Periodic Sales Record', docTitle: 'PERIODIC SALES RECORD', refCode: 'REP251026PSLR', defaultOrientation: 'Landscape' },
      { key: 'sales_overview', label: 'Overview', pageTitle: 'Sales Overview', docTitle: 'SALES OVERVIEW', refCode: 'REP251026SOVW', defaultOrientation: 'Landscape' },
      { key: 'sales_customer_product', label: 'Customer Wise (Product)', pageTitle: 'Customer Wise Product Sales', docTitle: 'CUSTOMER WISE PRODUCT SALES', refCode: 'REP251026SCWP', defaultOrientation: 'Landscape' }
    ]
  },
  inventory: {
    title: 'INVENTORY',
    icon: 'fa-exchange',
    subReports: [
      { key: 'inv_product_list', label: 'Product List', pageTitle: 'Product List', docTitle: 'PRODUCT LIST', refCode: 'REP251026IPRL', defaultOrientation: 'Portrait' },
      { key: 'inv_serial_record', label: 'Serial Record', pageTitle: 'Serial Record', docTitle: 'SERIAL RECORD', refCode: 'REP251026ISEL', defaultOrientation: 'Portrait' },
      { key: 'inv_inventory_summary', label: 'Inventory Summary', pageTitle: 'Inventory Summary', docTitle: 'INVENTORY SUMMARY', refCode: 'REP251026INVS', defaultOrientation: 'Landscape' },
      { key: 'inv_periodic_count', label: 'Periodic Inventory Count', pageTitle: 'Periodic Inventory Count', docTitle: 'PERIODIC INVENTORY COUNT', refCode: 'REP251026IPIC', defaultOrientation: 'Landscape' },
      { key: 'inv_valuation', label: 'Inventory Valuation', pageTitle: 'Inventory Valuation', docTitle: 'INVENTORY VALUATION', refCode: 'REP251026IVAL', defaultOrientation: 'Landscape' },
      { key: 'inv_periodic_valuation', label: 'Periodic Inventory Valuation', pageTitle: 'Periodic Inventory Valuation', docTitle: 'PERIODIC INVENTORY VALUATION', refCode: 'REP251026IPIV', defaultOrientation: 'Landscape' },
      { key: 'inv_warranty_summary', label: 'Warranty Summary', pageTitle: 'Warranty Summary', docTitle: 'WARRANTY SUMMARY', refCode: 'REP251026IWAR', defaultOrientation: 'Landscape' },
      { key: 'inv_overview', label: 'Overview', pageTitle: 'Inventory Overview', docTitle: 'INVENTORY OVERVIEW', refCode: 'REP251026IOVW', defaultOrientation: 'Landscape' }
    ]
  },
  receivables: {
    title: 'RECEIVABLES',
    icon: 'fa-users',
    subReports: [
      { key: 'rec_customer_list', label: 'Customer List', pageTitle: 'Customer List', docTitle: 'CUSTOMER LIST', refCode: 'REP251026RCST', defaultOrientation: 'Portrait' },
      { key: 'rec_customer_balance', label: 'Customer Balance', pageTitle: 'Customer Balance', docTitle: 'CUSTOMER BALANCE', refCode: 'REP251026RCBL', defaultOrientation: 'Portrait' },
      { key: 'rec_customer_statement', label: 'Customer Statement', pageTitle: 'Customer Statement', docTitle: 'CUSTOMER STATEMENT', refCode: 'REP251026RCSS', defaultOrientation: 'Portrait' },
      { key: 'rec_customer_statement_item', label: 'Customer Statement (Item)', pageTitle: 'Customer Statement (Item)', docTitle: 'CUSTOMER STATEMENT (ITEM)', refCode: 'REP251026RCSI', defaultOrientation: 'Landscape' },
      { key: 'rec_customer_due_collection', label: 'Customer Due Collection', pageTitle: 'Customer Due Collection', docTitle: 'CUSTOMER DUE COLLECTION', refCode: 'REP251026RCDC', defaultOrientation: 'Portrait' },
      { key: 'rec_balance_overview', label: 'Balance Overview', pageTitle: 'Receivables Balance Overview', docTitle: 'BALANCE OVERVIEW', refCode: 'REP261026RBOV', defaultOrientation: 'Portrait' },
      { key: 'rec_overview', label: 'Overview', pageTitle: 'Receivables Overview', docTitle: 'RECEIVABLES OVERVIEW', refCode: 'REP251026ROVW', defaultOrientation: 'Landscape' }
    ]
  },
  payables: {
    title: 'PAYABLES',
    icon: 'fa-users',
    subReports: [
      { key: 'pay_supplier_list', label: 'Supplier List', pageTitle: 'Supplier List', docTitle: 'SUPPLIER LIST', refCode: 'REP261026PSUL', defaultOrientation: 'Portrait' },
      { key: 'pay_supplier_balance', label: 'Supplier Balance', pageTitle: 'Supplier Balance', docTitle: 'VENDORE BALANCE', refCode: 'REP261026PSBL', defaultOrientation: 'Portrait' },
      { key: 'pay_supplier_statement', label: 'Supplier Statement', pageTitle: 'Supplier Statement', docTitle: 'SUPPLIER STATEMENT', refCode: 'REP261026PSSS', defaultOrientation: 'Portrait' },
      { key: 'pay_supplier_statement_item', label: 'Supplier Statement (Item)', pageTitle: 'Supplier Statement (Item)', docTitle: 'SUPPLIER STATEMENT (ITEM)', refCode: 'REP261026PSSI', defaultOrientation: 'Landscape' },
      { key: 'pay_supplier_overview', label: 'Supplier Overview', pageTitle: 'Payables Overview', docTitle: 'SUPPLIER OVERVIEW', refCode: 'REP261026PSOV', defaultOrientation: 'Landscape' }
    ]
  },
  account: {
    title: 'ACCOUNT',
    icon: 'fa-file-text-o',
    subReports: [
      { key: 'acc_ledger_statement', label: 'Ledger Statement', pageTitle: 'Ledger Statement', docTitle: 'LEDGER STATEMENT', refCode: 'REP261026ALST', defaultOrientation: 'Portrait' },
      { key: 'acc_cash_statement', label: 'Cash Statement', pageTitle: 'Cash Statement', docTitle: 'CASH STATEMENT', refCode: 'REP261026ACST', defaultOrientation: 'Portrait' },
      { key: 'acc_bank_statement', label: 'Bank Statement', pageTitle: 'Bank Statement', docTitle: 'BANK STATEMENT', refCode: 'REP261026ABST', defaultOrientation: 'Portrait' },
      { key: 'acc_mobile_statement', label: 'Mobile Statement', pageTitle: 'Mobile Statement', docTitle: 'MOBILE STATEMENT', refCode: 'REP261026AMST', defaultOrientation: 'Portrait' },
      { key: 'acc_journal_history', label: 'Journal History', pageTitle: 'Journal History', docTitle: 'JOURNAL HISTORY', refCode: 'REP261026AJOU', defaultOrientation: 'Landscape' },
      { key: 'acc_trial_balance', label: 'Trial Balance', pageTitle: 'Trial Balance', docTitle: 'TRIAL BALANCE', refCode: 'REP261026ATBL', defaultOrientation: 'Portrait' },
      { key: 'acc_balance_sheet', label: 'Balance Sheet', pageTitle: 'Balance Sheet', docTitle: 'BALANCE SHEET', refCode: 'REP261026ABLS', defaultOrientation: 'Portrait' },
      { key: 'acc_profit_loss', label: 'Profit & Loss', pageTitle: 'Profit & Loss Statement', docTitle: 'PROFIT & LOSS', refCode: 'REP261026APNL', defaultOrientation: 'Portrait' },
      { key: 'acc_overview', label: 'Overview', pageTitle: 'Accounts Overview', docTitle: 'ACCOUNTS OVERVIEW', refCode: 'REP261026AOVW', defaultOrientation: 'Portrait' }
    ]
  },
  voucher: {
    title: 'VOUCHER',
    icon: 'fa-file-text-o',
    subReports: [
      { key: 'vouch_payment', label: 'Payment', pageTitle: 'Payment Report', docTitle: 'PAYMENT REPORT', refCode: 'REP261026PAVR', defaultOrientation: 'Landscape' },
      { key: 'vouch_receipt', label: 'Receipt', pageTitle: 'Receipt Report', docTitle: 'RECEIPT REPORT', refCode: 'REP261026REVR', defaultOrientation: 'Landscape' },
      { key: 'vouch_journal', label: 'Journal', pageTitle: 'Journal Report', docTitle: 'JOURNAL REPORT', refCode: 'REP261026JOVR', defaultOrientation: 'Landscape' },
      { key: 'vouch_pay_rec_statement', label: 'Payment & Receipt Statement', pageTitle: 'Payment & Receipt Report', docTitle: 'PAYMENT & RECEIPT STATEMENT', refCode: 'REP261026VPRS', defaultOrientation: 'Portrait' },
      { key: 'vouch_internal_transaction', label: 'Internal Transaction', pageTitle: 'Internal Transaction', docTitle: 'INTERNAL TRANSACTION REPORT', refCode: 'REP261026VINT', defaultOrientation: 'Portrait' },
      { key: 'vouch_overview', label: 'Overview', pageTitle: 'Voucher Overview', docTitle: 'CUSTOMER COLLECTION REPORT', refCode: 'REP261026REVR', defaultOrientation: 'Landscape' }
    ]
  },
  payroll: {
    title: 'PAYROLL',
    icon: 'fa-file-text-o',
    subReports: [
      { key: 'payr_employee_list', label: 'Employee List', pageTitle: 'Employee List', docTitle: 'EMPLOYEE LIST', refCode: 'REP261026PRLE', defaultOrientation: 'Portrait' },
      { key: 'payr_attendance', label: 'Attendance', pageTitle: 'Attendence', docTitle: 'ATTENDANCE REPORT', refCode: 'REP261026PRAT', defaultOrientation: 'Portrait' },
      { key: 'payr_leave_record', label: 'Leave Record', pageTitle: 'Leave Recod', docTitle: 'LEAVE RECORD', refCode: 'REP261026PRLR', defaultOrientation: 'Portrait' },
      { key: 'payr_salary_report', label: 'Salary Report', pageTitle: 'Salary Report', docTitle: 'SALARY REPORT', refCode: 'REP261026PRSR', defaultOrientation: 'Portrait' },
      { key: 'payr_commission_report', label: 'Commission Report', pageTitle: 'Commission Report', docTitle: 'COMMISSION REPORT', refCode: 'REP261026PRCR', defaultOrientation: 'Portrait' },
      { key: 'payr_overview', label: 'Overview', pageTitle: 'Employee Overview', docTitle: 'PAYROLL OVERVIEW', refCode: 'REP261026PROV', defaultOrientation: 'Portrait' }
    ]
  }
};

interface AdvancedReportsViewProps {
  initialReport?: string;
}

export const AdvancedReportsView: React.FC<AdvancedReportsViewProps> = ({ initialReport }) => {
  const { currentRoute, setCurrentRoute, sales, purchases, expenses } = useApp();

  // Load 339 customers from authentic dataset
  const allCustomers = useMemo<RealCustomerRecord[]>(() => {
    return getFull339Customers();
  }, []);

  // Active view: 'hub' (image_605de4d5.png) or active sub-report key
  const [activeReportKey, setActiveReportKey] = useState<string>(() => {
    if (initialReport && initialReport !== 'hub') return initialReport;
    if (currentRoute === 'rep_dailycashst.php') return 'daily_cash_statement';
    if (currentRoute === 'rep_sales.php') return 'sales_record_inv';
    if (currentRoute === 'rep_purchase.php') return 'pur_record_inv';
    if (currentRoute === 'rep_stock.php') return 'inv_inventory_summary';
    if (currentRoute === 'rep_customerdue.php') return 'rec_customer_balance';
    if (currentRoute === 'rep_supplierdue.php') return 'pay_supplier_balance';
    if (currentRoute === 'fin_proandlos.php') return 'acc_profit_loss';
    if (currentRoute === 'fin_trialbal.php') return 'acc_trial_balance';
    if (currentRoute === 'fin_blasheet.php') return 'acc_balance_sheet';
    return 'hub';
  });

  // Active Section
  const [activeSection, setActiveSection] = useState<ReportSection>('daily');

  // Hub search query
  const [hubSearch, setHubSearch] = useState('');

  // Filter States
  const [category, setCategory] = useState('-Select-');
  const [subCategory, setSubCategory] = useState('-Select-');
  const [brand, setBrand] = useState('-Select-');
  const [item, setItem] = useState('-Select-');
  const [serial, setSerial] = useState('-Select-');
  const [statusVal, setStatusVal] = useState('All');
  const [district, setDistrict] = useState('-Select-');
  const [zone, setZone] = useState('-Select-');
  const [supplierVal, setSupplierVal] = useState('-Select-');
  const [customerVal, setCustomerVal] = useState('CU');
  const [headVal, setHeadVal] = useState('+ -');
  const [customerSearch, setCustomerSearch] = useState('');
  const [fromDate, setFromDate] = useState('2026-09-27');
  const [toDate, setToDate] = useState('2026-10-26');

  // Pagination for large customer lists
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeRows, setPageSizeRows] = useState(25);

  // Toolbar settings
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'Landscape' | 'Portrait'>('Landscape');

  // Modals & Feedback
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('info.techdrivebd@gmail.com');
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Sync route changes
  useEffect(() => {
    if (currentRoute === 'axe_report.php') {
      setActiveReportKey('hub');
    }
  }, [currentRoute]);

  // Determine current active sub-report config and its parent section
  const currentSubConfig = useMemo<SubReportConfig>(() => {
    for (const [, sec] of Object.entries(SECTION_CONFIGS)) {
      const found = sec.subReports.find(r => r.key === activeReportKey);
      if (found) {
        return found;
      }
    }
    return SECTION_CONFIGS.daily.subReports[0];
  }, [activeReportKey]);

  // Filtered customers for Customer Balance & Balance Overview
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(c => {
      if (district !== '-Select-' && c.district !== district) return false;
      if (zone !== '-Select-' && c.zone !== zone) return false;
      if (statusVal === 'Due' && c.status !== 'Due') return false;
      if (statusVal === 'Advance' && c.status !== 'Advance') return false;
      if (statusVal === 'Settled' && c.status !== 'Settled') return false;
      if (customerSearch.trim()) {
        const q = customerSearch.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allCustomers, district, zone, statusVal, customerSearch]);

  // Calculate dynamic totals for customer balance overview
  const customerSummary = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    let getFromCustomer = 0;
    let payToCustomer = 0;

    for (const c of filteredCustomers) {
      totalDebit += c.debit;
      totalCredit += c.credit;
      if (c.debit > c.credit) {
        getFromCustomer += (c.debit - c.credit);
      } else if (c.credit > c.debit) {
        payToCustomer += (c.credit - c.debit);
      }
    }

    return {
      count: filteredCustomers.length,
      totalDebit,
      totalCredit,
      netBalance: totalDebit - totalCredit,
      getFromCustomer,
      payToCustomer
    };
  }, [filteredCustomers]);

  // Paginated customer list
  const paginatedCustomers = useMemo(() => {
    if (pageSizeRows === 0) return filteredCustomers;
    const start = (currentPage - 1) * pageSizeRows;
    return filteredCustomers.slice(start, start + pageSizeRows);
  }, [filteredCustomers, currentPage, pageSizeRows]);

  const totalPages = pageSizeRows === 0 ? 1 : Math.ceil(filteredCustomers.length / pageSizeRows);

  // When active report key changes, update section and orientation
  const handleSelectReport = (reportKey: string, sectionKey?: ReportSection) => {
    setActiveReportKey(reportKey);
    let sec = sectionKey;
    if (!sec) {
      for (const [sKey, sVal] of Object.entries(SECTION_CONFIGS)) {
        if (sVal.subReports.some(r => r.key === reportKey)) {
          sec = sKey as ReportSection;
          break;
        }
      }
    }
    if (sec) {
      setActiveSection(sec);
    }

    // Set contextual default date ranges matching screenshots
    if (reportKey === 'vouch_overview') {
      setFromDate('2026-10-25');
      setToDate('2026-10-26');
    } else if (reportKey.startsWith('vouch_')) {
      setFromDate('2026-09-27');
      setToDate('2026-10-26');
    } else if (reportKey === 'acc_overview') {
      setFromDate('2026-10-01');
      setToDate('2026-10-26');
    }

    // Set orientation default for this report
    for (const sVal of Object.values(SECTION_CONFIGS)) {
      const found = sVal.subReports.find(r => r.key === reportKey);
      if (found) {
        setOrientation(found.defaultOrientation);
        break;
      }
    }
    setCurrentPage(1);
  };

  // Submit filter
  const handleSubmitFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setExportNotice(`Applied filters: ${district !== '-Select-' ? district : 'All Districts'} | Status: ${statusVal}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Reset filter
  const handleResetFilter = () => {
    setCategory('-Select-');
    setSubCategory('-Select-');
    setBrand('-Select-');
    setItem('-Select-');
    setSerial('-Select-');
    setStatusVal('All');
    setDistrict('-Select-');
    setZone('-Select-');
    setSupplierVal('-Select-');
    setCustomerVal('CU');
    setHeadVal('+ -');
    setCustomerSearch('');
    if (activeReportKey === 'vouch_overview') {
      setFromDate('2026-10-25');
      setToDate('2026-10-26');
    } else if (activeReportKey.startsWith('vouch_')) {
      setFromDate('2026-09-27');
      setToDate('2026-10-26');
    } else if (activeReportKey === 'acc_overview') {
      setFromDate('2026-10-01');
      setToDate('2026-10-26');
    } else {
      setFromDate('2026-09-27');
      setToDate('2026-10-26');
    }
    setCurrentPage(1);
  };

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailNotice(`Report PDF sent successfully to ${emailTo}`);
    setShowEmailModal(false);
    setTimeout(() => setEmailNotice(null), 4000);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,"TECH DRIVE - ' +
      currentSubConfig.docTitle +
      '"\n"Date Range: ' +
      fromDate +
      ' to ' +
      toDate +
      '"\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TechDrive_${currentSubConfig.docTitle.replace(/\s+/g, '_')}_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(`Exported ${currentSubConfig.docTitle} successfully.`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  /* =========================================================================
     VIEW 1: 9-CARD REPORT DIRECTORY HUB (image_605de4d5.png 1:1)
     ========================================================================= */
  if (activeReportKey === 'hub') {
    const col1 = [SECTION_CONFIGS.daily, SECTION_CONFIGS.sales, SECTION_CONFIGS.account];
    const col2 = [SECTION_CONFIGS.purchase, SECTION_CONFIGS.receivables, SECTION_CONFIGS.voucher];
    const col3 = [SECTION_CONFIGS.inventory, SECTION_CONFIGS.payables, SECTION_CONFIGS.payroll];

    const filterSec = (sec: typeof SECTION_CONFIGS.daily) => {
      if (!hubSearch.trim()) return sec;
      const secMatch = sec.title.toLowerCase().includes(hubSearch.toLowerCase());
      const filtered = sec.subReports.filter(s =>
        s.label.toLowerCase().includes(hubSearch.toLowerCase()) ||
        s.docTitle.toLowerCase().includes(hubSearch.toLowerCase())
      );
      if (secMatch) return sec;
      if (filtered.length > 0) {
        return { ...sec, subReports: filtered };
      }
      return null;
    };

    return (
      <div className="space-y-4 select-none pb-12">
        {/* Top Header / Breadcrumbs matching image_605de4d5.png */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">Report</h1>

          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <span
              onClick={() => setCurrentRoute('home.php', 'Dashboard')}
              className="hover:text-[#0084bf] cursor-pointer flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Dashboard</span>
            </span>
            <span>&gt;</span>
            <span onClick={() => setActiveReportKey('hub')} className="hover:text-[#0084bf] cursor-pointer">
              Report
            </span>
            <span>&gt;</span>
            <span className="text-gray-800 font-semibold">Report</span>
          </div>
        </div>

        {/* Live Search and menu toggle on right */}
        <div className="flex justify-end items-center gap-1">
          <div className="relative w-64">
            <input
              type="text"
              value={hubSearch}
              onChange={e => setHubSearch(e.target.value)}
              placeholder="Search.."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-none focus:border-[#0084bf] focus:outline-none"
            />
            <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs"></i>
            {hubSearch && (
              <button
                type="button"
                onClick={() => setHubSearch('')}
                className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="button"
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-none border border-gray-300 flex items-center justify-center text-xs cursor-pointer"
            title="Toggle View"
          >
            <i className="fa fa-bars"></i>
          </button>
        </div>

        {/* 3 Columns matching image_605de4d5.png */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Column 1 */}
          <div className="space-y-5">
            {col1.map((sec, idx) => {
              const filtered = filterSec(sec);
              if (!filtered) return null;
              const sectionKey: ReportSection = idx === 0 ? 'daily' : idx === 1 ? 'sales' : 'account';
              return (
                <div key={sec.title} className="bg-white border border-gray-300 rounded-none overflow-hidden shadow-2xs">
                  <div className="bg-[#d2d6de] text-[#333] px-3.5 py-2 font-bold text-xs uppercase tracking-wide flex items-center space-x-2 border-b border-gray-300">
                    <i className={`fa ${sec.icon} text-gray-700 text-sm`}></i>
                    <span>{sec.title}</span>
                  </div>
                  <div className="divide-y divide-gray-100 py-0.5">
                    {filtered.subReports.map(sub => (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => handleSelectReport(sub.key, sectionKey)}
                        className="w-full text-left px-4 py-1.5 text-xs text-[#0084bf] hover:text-[#005b84] hover:bg-sky-50/60 transition flex items-center space-x-2 group cursor-pointer"
                      >
                        <span className="text-[#0084bf] text-xs font-bold transition-transform group-hover:translate-x-0.5">
                          &#9656;
                        </span>
                        <span className="font-semibold uppercase tracking-tight text-[11px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-5">
            {col2.map((sec, idx) => {
              const filtered = filterSec(sec);
              if (!filtered) return null;
              const sectionKey: ReportSection = idx === 0 ? 'purchase' : idx === 1 ? 'receivables' : 'voucher';
              return (
                <div key={sec.title} className="bg-white border border-gray-300 rounded-none overflow-hidden shadow-2xs">
                  <div className="bg-[#d2d6de] text-[#333] px-3.5 py-2 font-bold text-xs uppercase tracking-wide flex items-center space-x-2 border-b border-gray-300">
                    <i className={`fa ${sec.icon} text-gray-700 text-sm`}></i>
                    <span>{sec.title}</span>
                  </div>
                  <div className="divide-y divide-gray-100 py-0.5">
                    {filtered.subReports.map(sub => (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => handleSelectReport(sub.key, sectionKey)}
                        className="w-full text-left px-4 py-1.5 text-xs text-[#0084bf] hover:text-[#005b84] hover:bg-sky-50/60 transition flex items-center space-x-2 group cursor-pointer"
                      >
                        <span className="text-[#0084bf] text-xs font-bold transition-transform group-hover:translate-x-0.5">
                          &#9656;
                        </span>
                        <span className="font-semibold uppercase tracking-tight text-[11px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 3 */}
          <div className="space-y-5">
            {col3.map((sec, idx) => {
              const filtered = filterSec(sec);
              if (!filtered) return null;
              const sectionKey: ReportSection = idx === 0 ? 'inventory' : idx === 1 ? 'payables' : 'payroll';
              return (
                <div key={sec.title} className="bg-white border border-gray-300 rounded-none overflow-hidden shadow-2xs">
                  <div className="bg-[#d2d6de] text-[#333] px-3.5 py-2 font-bold text-xs uppercase tracking-wide flex items-center space-x-2 border-b border-gray-300">
                    <i className={`fa ${sec.icon} text-gray-700 text-sm`}></i>
                    <span>{sec.title}</span>
                  </div>
                  <div className="divide-y divide-gray-100 py-0.5">
                    {filtered.subReports.map(sub => (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => handleSelectReport(sub.key, sectionKey)}
                        className="w-full text-left px-4 py-1.5 text-xs text-[#0084bf] hover:text-[#005b84] hover:bg-sky-50/60 transition flex items-center space-x-2 group cursor-pointer"
                      >
                        <span className="text-[#0084bf] text-xs font-bold transition-transform group-hover:translate-x-0.5">
                          &#9656;
                        </span>
                        <span className="font-semibold uppercase tracking-tight text-[11px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: SUB-REPORT DOCUMENT CANVAS (Left Filter Sidebar + A4 Sheet)
     ========================================================================= */
  const activeSectionConfig = SECTION_CONFIGS[activeSection] || SECTION_CONFIGS.daily;

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Toast Notices */}
      {emailNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between no-print">
          <span>{emailNotice}</span>
          <button type="button" onClick={() => setEmailNotice(null)} className="ml-2 font-bold">&times;</button>
        </div>
      )}
      {exportNotice && (
        <div className="bg-[#0084bf] text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between no-print">
          <span>{exportNotice}</span>
          <button type="button" onClick={() => setExportNotice(null)} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Breadcrumb Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">
          {currentSubConfig.pageTitle}
        </h1>

        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <span
            onClick={() => setCurrentRoute('home.php', 'Dashboard')}
            className="hover:text-[#0084bf] cursor-pointer flex items-center space-x-1"
          >
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
          </span>
          <span>&gt;</span>
          <span
            onClick={() => setActiveReportKey('hub')}
            className="hover:text-[#0084bf] cursor-pointer"
          >
            Report
          </span>
          <span>&gt;</span>
          <span className="text-gray-800 font-semibold">{currentSubConfig.pageTitle}</span>
        </div>
      </div>

      {/* Main Grid: Left Filter (3 cols) + Right Document Sheet (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: Sub-Nav and Filter Form */}
        <div className="lg:col-span-3 bg-white border border-gray-300 shadow-2xs p-4 no-print space-y-5">
          {/* Section Sub-Nav List */}
          <div className="space-y-1 border-b border-gray-200 pb-4">
            {activeSectionConfig.subReports.map(sub => {
              const isActive = sub.key === activeReportKey;
              return (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => handleSelectReport(sub.key, activeSection)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs transition flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'text-[#dd4b39] font-bold border-l-3 border-[#dd4b39] bg-red-50/40 pl-2'
                      : 'text-gray-700 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Filter Controls Based on Active Report */}
          <form onSubmit={handleSubmitFilter} className="space-y-3 pt-1">
            {/* Contextual Filters */}
            {activeReportKey === 'rec_balance_overview' ||
            activeReportKey === 'rec_customer_balance' ||
            activeReportKey === 'rec_customer_due_collection' ||
            activeReportKey === 'rec_customer_list' ? (
              /* Filter Case 1: Customer / Receivables Filters */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Select District</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Narayanganj">Narayanganj</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Rajshahi">Rajshahi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Select Zone</label>
                    <select
                      value={zone}
                      onChange={e => setZone(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                      <option value="Mirpur">Mirpur</option>
                      <option value="Uttara">Uttara</option>
                      <option value="Dhanmondi">Dhanmondi</option>
                      <option value="Gulshan">Gulshan</option>
                      <option value="Banani">Banani</option>
                      <option value="Elephant Road">Elephant Road</option>
                      <option value="Motijheel">Motijheel</option>
                      <option value="Badda">Badda</option>
                      <option value="Mohammadpur">Mohammadpur</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-[11px] font-semibold mb-1">Status</label>
                  <select
                    value={statusVal}
                    onChange={e => setStatusVal(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Due">Get From Customer (Due)</option>
                    <option value="Advance">Pay To Customer (Advance)</option>
                    <option value="Settled">Zero Balance / Settled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-[11px] font-semibold mb-1">Search Customer</label>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Name, Code or Mobile..."
                    className="w-full bg-white border border-gray-300 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                  />
                </div>
              </div>
            ) : activeReportKey === 'pay_supplier_balance' || activeReportKey === 'pay_supplier_list' ? (
              /* Filter Case 2: Supplier Filters */
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-[11px] font-semibold mb-1">Select Supplier</label>
                  <select
                    value={supplierVal}
                    onChange={e => setSupplierVal(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="-Select-">-Select-</option>
                    {AUTHENTIC_SUPPLIERS.map(s => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : activeReportKey === 'acc_ledger_statement' ||
              activeReportKey === 'acc_cash_statement' ||
              activeReportKey === 'daily_cash_statement' ||
              activeReportKey === 'acc_bank_statement' ||
              activeReportKey === 'acc_mobile_statement' ? (
              /* Filter Case 3: Account Statements */
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-[11px] font-semibold mb-1">Select Head</label>
                  <select
                    value={headVal}
                    onChange={e => setHeadVal(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none font-bold"
                  >
                    <option value="+ -">+ -</option>
                    <option value="CITY/01700000072">CITY/01700000072</option>
                    <option value="DBBL/123456789">DBBL/123456789</option>
                    <option value="BRAC/123456789">BRAC/123456789</option>
                    <option value="bKash/01920424323">bKash/01920424323</option>
                    <option value="Nagad/01701561395">Nagad/01701561395</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : activeReportKey === 'pay_supplier_statement' || activeReportKey === 'rec_customer_statement' ? (
              /* Filter Case 4: Individual Customer/Supplier Statement */
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-[11px] font-semibold mb-1">
                    {activeReportKey.startsWith('pay') ? 'Select Supplier' : 'Select Customer'}
                  </label>
                  <select
                    value={activeReportKey.startsWith('pay') ? supplierVal : customerVal}
                    onChange={e => activeReportKey.startsWith('pay') ? setSupplierVal(e.target.value) : setCustomerVal(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none font-bold"
                  >
                    {activeReportKey.startsWith('pay') ? (
                      <>
                        <option value="-Select-">-Select-</option>
                        {AUTHENTIC_SUPPLIERS.map(s => (
                          <option key={s.code} value={s.name}>SU - {s.name}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        <option value="CU">CU</option>
                        <option value="Mr . Shoan Rahman">CU - Mr . Shoan Rahman</option>
                        <option value="City Laptop Zone">CU - City Laptop Zone</option>
                        <option value="Infosystem Technology Limited">CU - Infosystem Technology Limited</option>
                        <option value="Ahik Billah">CU - Ahik Billah</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : activeSection === 'voucher' || activeReportKey === 'acc_overview' ? (
              /* Filter Case 5: Voucher Reports & Accounts Overview (Screenshots 1, 2, 3, 4, 5, 6, 11) */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : activeSection === 'payroll' ? (
              /* Filter Case 6: Payroll Reports (Screenshots 7, 8, 9, 10, 12, 13) */
              activeReportKey === 'payr_employee_list' ? (
                /* Screenshot 7: Employee List has no inputs, just SUBMIT and CLOSE */
                <div className="py-2 text-[11px] text-gray-400 italic">
                  Press Submit to reload employee directory
                </div>
              ) : (
                /* Attendance, Leave, Salary, Commission: From / To dates */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-gray-700 text-[11px] font-semibold mb-1">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-[11px] font-semibold mb-1">To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Filter Case 7: Default Category / Brand / Item / Date Range */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Sub-Category</label>
                    <select
                      value={subCategory}
                      onChange={e => setSubCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Brand</label>
                    <select
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                      <option value="Acer">Acer</option>
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Lenovo">Lenovo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">Item</label>
                    <select
                      value={item}
                      onChange={e => setItem(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="-Select-">-Select-</option>
                      <option value="Lenovo ThinkPad T490">Lenovo ThinkPad T490</option>
                      <option value="HP ProBook 450 G8">HP ProBook 450 G8</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-[11px] font-semibold mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#605ca8] hover:bg-[#504c98] text-white font-bold rounded-none uppercase text-xs tracking-wider transition shadow-2xs cursor-pointer"
              >
                SUBMIT
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-4 py-1.5 bg-[#a6a6a6] hover:bg-[#919191] text-white font-bold rounded-none uppercase text-xs tracking-wider transition shadow-2xs cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Toolbar & Document Sheet */}
        <div className="lg:col-span-9 space-y-0">
          {/* Top Dark Toolbar (#545b62) */}
          <div className="bg-[#545b62] text-white px-3 py-2 flex items-center justify-between no-print shadow-xs">
            {/* Left Action Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="w-8 h-7 bg-[#00c0ef] hover:bg-[#00a7d0] text-white rounded-none flex items-center justify-center text-xs shadow-xs cursor-pointer transition"
                title="Print Document"
              >
                <i className="fa fa-print"></i>
              </button>
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="w-8 h-7 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-none flex items-center justify-center text-xs shadow-xs cursor-pointer transition"
                title="Email Report"
              >
                <i className="fa fa-envelope"></i>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-8 h-7 bg-[#f8f9fa] hover:bg-[#e2e6ea] text-gray-800 rounded-none flex items-center justify-center text-xs shadow-xs cursor-pointer border border-gray-300 transition"
                title="Export Data"
              >
                <i className="fa fa-file-text-o"></i>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={pageSize}
                onChange={e => setPageSize(e.target.value as any)}
                className="bg-white text-gray-800 text-xs px-2 py-1 rounded-none border border-gray-300 focus:outline-none"
              >
                <option value="A4">A4 [210mm × 297mm]</option>
                <option value="Letter">Letter [216mm × 279mm]</option>
                <option value="Legal">Legal [216mm × 356mm]</option>
              </select>

              <select
                value={orientation}
                onChange={e => setOrientation(e.target.value as any)}
                className="bg-white text-gray-800 text-xs px-2 py-1 rounded-none border border-gray-300 focus:outline-none"
              >
                <option value="Landscape">Landscape</option>
                <option value="Portrait">Portrait</option>
              </select>

              <button
                type="button"
                onClick={() => setActiveReportKey('hub')}
                className="w-7 h-7 bg-[#545b62] hover:bg-[#454b51] text-white rounded-none flex items-center justify-center text-xs border border-gray-500 cursor-pointer"
                title="View All Reports Directory"
              >
                <i className="fa fa-bars"></i>
              </button>
            </div>
          </div>

          {/* Document Sheet Canvas */}
          <div className="bg-white border border-gray-300 shadow-sm p-6 overflow-x-auto printable-sheet">
            <div className="min-w-[850px] space-y-4">
              {/* Official 3-Column Header */}
              <TechDriveDocumentHeader
                refNo={currentSubConfig.refCode}
                date="26 Oct 2026"
              />

              {/* Document Title */}
              <div className="text-center pt-1">
                <h2 className="text-sm font-black text-[#0073b7] uppercase tracking-wider">
                  {currentSubConfig.docTitle}
                </h2>
                {activeReportKey === 'rec_balance_overview' && (
                  <p className="text-[11px] text-gray-500 font-medium">
                    Receivables &amp; Customer Ledger Accounts Status Overview
                  </p>
                )}
                {activeReportKey === 'acc_balance_sheet' && (
                  <p className="text-[11px] text-gray-500 font-medium">
                    As on 26 Oct 2026 (Operational &amp; Financial Position)
                  </p>
                )}
              </div>

              {/* Date banner */}
              {activeReportKey !== 'pay_supplier_balance' &&
                activeReportKey !== 'rec_customer_balance' &&
                activeReportKey !== 'rec_balance_overview' &&
                activeReportKey !== 'acc_balance_sheet' &&
                activeReportKey !== 'payr_employee_list' && (
                  <div className="flex items-center justify-between text-xs text-gray-700 font-semibold px-1">
                    <div>
                      Start Date:{' '}
                      <span className="text-[#0073b7] font-bold">{formatDisplayDate(fromDate)}</span>
                    </div>
                    {activeReportKey === 'acc_ledger_statement' && (
                      <div>Statement For: <span className="text-[#0073b7] font-bold">0</span></div>
                    )}
                    <div>
                      End Date:{' '}
                      <span className="text-[#0073b7] font-bold">{formatDisplayDate(toDate)}</span>
                    </div>
                  </div>
                )}

              {/* =================================================================
                  REPORT: BALANCE OVERVIEW (Receivables -> Balance Overview)
                 ================================================================= */}
              {activeReportKey === 'rec_balance_overview' && (
                <div className="space-y-4">
                  {/* Executive Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 border border-gray-200">
                    <div className="bg-white p-2.5 border border-gray-200 shadow-2xs">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Total Accounts</div>
                      <div className="text-base font-bold text-gray-800 font-mono mt-0.5">
                        {customerSummary.count} <span className="text-[10px] font-normal text-gray-500">Customers</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 border border-red-200 shadow-2xs">
                      <div className="text-[10px] text-red-600 uppercase font-bold">Get From Customer (Due)</div>
                      <div className="text-base font-bold text-red-600 font-mono mt-0.5">
                        ৳ {formatBDT(customerSummary.getFromCustomer)}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] text-emerald-700 uppercase font-bold">Pay To Customer (Advance)</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                        ৳ {formatBDT(customerSummary.payToCustomer)}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 border border-blue-200 shadow-2xs">
                      <div className="text-[10px] text-[#0073b7] uppercase font-bold">Net Receivable</div>
                      <div className="text-base font-bold text-[#0073b7] font-mono mt-0.5">
                        ৳ {formatBDT(customerSummary.netBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Balance Overview Table */}
                  <div className="overflow-x-auto border-t border-[#dd4b39]">
                    <div className="flex items-center justify-between py-1.5 px-2 bg-gray-100 text-[11px] font-semibold text-gray-700">
                      <span>Showing {paginatedCustomers.length} of {filteredCustomers.length} customer records</span>
                      <div className="flex items-center space-x-2">
                        <span>Show:</span>
                        <select
                          value={pageSizeRows}
                          onChange={e => {
                            setPageSizeRows(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="bg-white border border-gray-300 text-[10px] px-1 py-0.5"
                        >
                          <option value="25">25 rows</option>
                          <option value="50">50 rows</option>
                          <option value="100">100 rows</option>
                          <option value="0">All rows</option>
                        </select>
                      </div>
                    </div>

                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                          <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                          <th className="py-1 px-2 border-r border-gray-300 w-24">Code</th>
                          <th className="py-1 px-2 border-r border-gray-300">Name</th>
                          <th className="py-1 px-2 border-r border-gray-300 w-28">Mobile</th>
                          <th className="py-1 px-2 border-r border-gray-300 w-32">Zone / District</th>
                          <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit (Sales)</th>
                          <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit (Paid)</th>
                          <th className="py-1 px-2 border-r border-gray-300 text-right w-28 font-bold">Balance</th>
                          <th className="py-1 px-2 text-center w-20">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {paginatedCustomers.map(r => (
                          <tr key={r.sn} className="hover:bg-gray-50/50">
                            <td className="py-1 px-2 border-r border-gray-200 text-center">{r.sn}</td>
                            <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf] font-semibold">{r.code}</td>
                            <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{r.name}</td>
                            <td className="py-1 px-2 border-r border-gray-200 font-mono">{r.phone}</td>
                            <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{r.address}</td>
                            <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.debit)}</td>
                            <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.credit)}</td>
                            <td className={`py-1 px-2 border-r border-gray-200 text-right font-mono font-bold ${
                              r.status === 'Due' ? 'text-red-600' : r.status === 'Advance' ? 'text-emerald-700' : 'text-gray-700'
                            }`}>
                              {formatBDT(r.balance)}
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                                r.status === 'Due'
                                  ? 'bg-red-100 text-red-700'
                                  : r.status === 'Advance'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Grand Total Row */}
                        <tr className="bg-gray-100 font-bold border-t border-b border-gray-300">
                          <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">
                            {formatBDT(customerSummary.totalDebit)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">
                            {formatBDT(customerSummary.totalCredit)}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 text-red-600 font-black">
                            {formatBDT(customerSummary.netBalance)}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px]">339 Cust.</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Pagination Bar */}
                    {pageSizeRows > 0 && totalPages > 1 && (
                      <div className="flex items-center justify-between p-2 bg-white border-t border-gray-200 text-xs">
                        <span className="text-gray-600">Page {currentPage} of {totalPages}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-2 py-0.5 border border-gray-300 disabled:opacity-40 text-xs"
                          >
                            Prev
                          </button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={`px-2 py-0.5 text-xs border ${currentPage === p ? 'bg-[#0073b7] text-white border-[#0073b7]' : 'border-gray-300'}`}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="px-2 py-0.5 border border-gray-300 disabled:opacity-40 text-xs"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 text-xs font-bold text-red-600">
                      Note: Pay To Customer: {formatBDT(customerSummary.payToCustomer)} || Get From Customer: {formatBDT(customerSummary.getFromCustomer)}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
                  REPORT: BALANCE SHEET (Account -> Balance Sheet)
                 ================================================================= */}
              {activeReportKey === 'acc_balance_sheet' && (
                <div className="space-y-4">
                  <div className="border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300">
                      {/* Left: Property & Assets */}
                      <div className="p-3 space-y-3">
                        <div className="bg-[#f4f6f9] p-1.5 font-bold text-xs uppercase tracking-wide text-gray-800 border-b border-gray-300">
                          Property &amp; Assets
                        </div>

                        {/* Current Assets */}
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-gray-800 text-[11px] underline">Current Assets:</div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Cash in Hand</span>
                            <span className="font-mono font-semibold">1,03,87,912.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Cash at Bank (DBBL / BRAC / City Bank)</span>
                            <span className="font-mono font-semibold">83,925.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Mobile Banking Accounts (bKash / Nagad)</span>
                            <span className="font-mono font-semibold">89,510.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Accounts Receivable (Get From Customer)</span>
                            <span className="font-mono font-semibold text-red-600 font-bold">13,36,660.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Merchandise Inventory (Stock Valuation)</span>
                            <span className="font-mono font-semibold">22,27,742.11</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Advance to Suppliers (Get From Vendor)</span>
                            <span className="font-mono font-semibold">16,650.00</span>
                          </div>
                          <div className="flex justify-between py-1 font-bold bg-gray-50 border-t border-b border-gray-200">
                            <span>Total Current Assets:</span>
                            <span className="font-mono">1,41,42,399.11</span>
                          </div>
                        </div>

                        {/* Fixed Assets */}
                        <div className="space-y-1 text-xs pt-2">
                          <div className="font-bold text-gray-800 text-[11px] underline">Non-Current / Fixed Assets:</div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Office Furniture &amp; Fixtures</span>
                            <span className="font-mono font-semibold">1,45,000.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Computer &amp; IT Machinery</span>
                            <span className="font-mono font-semibold">3,20,000.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Shop Security Deposit (Harun Super Market)</span>
                            <span className="font-mono font-semibold">5,00,000.00</span>
                          </div>
                          <div className="flex justify-between py-1 font-bold bg-gray-50 border-t border-b border-gray-200">
                            <span>Total Fixed Assets:</span>
                            <span className="font-mono">9,65,000.00</span>
                          </div>
                        </div>

                        {/* Total Assets Row */}
                        <div className="flex justify-between p-2 bg-blue-50 font-black text-sm border-2 border-blue-200 text-[#0073b7]">
                          <span>TOTAL PROPERTY &amp; ASSETS</span>
                          <span className="font-mono">৳ 1,51,07,399.11</span>
                        </div>
                      </div>

                      {/* Right: Liabilities & Equity */}
                      <div className="p-3 space-y-3">
                        <div className="bg-[#f4f6f9] p-1.5 font-bold text-xs uppercase tracking-wide text-gray-800 border-b border-gray-300">
                          Capital &amp; Liabilities
                        </div>

                        {/* Current Liabilities */}
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-gray-800 text-[11px] underline">Current Liabilities:</div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Accounts Payable (Pay To Vendor)</span>
                            <span className="font-mono font-semibold text-red-600 font-bold">19,23,551.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Customer Advance Balances (Pay To Customer)</span>
                            <span className="font-mono font-semibold">83,035.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Accrued Operational Bills &amp; Expenses</span>
                            <span className="font-mono font-semibold">42,500.00</span>
                          </div>
                          <div className="flex justify-between py-1 font-bold bg-gray-50 border-t border-b border-gray-200">
                            <span>Total Current Liabilities:</span>
                            <span className="font-mono">20,49,086.00</span>
                          </div>
                        </div>

                        {/* Equity & Capital */}
                        <div className="space-y-1 text-xs pt-2">
                          <div className="font-bold text-gray-800 text-[11px] underline">Owner's Equity &amp; Capital:</div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Opening Capital</span>
                            <span className="font-mono font-semibold">1,15,00,000.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-700 pl-2">Retained Earnings / Operating Net Profit</span>
                            <span className="font-mono font-semibold">15,58,313.11</span>
                          </div>
                          <div className="flex justify-between py-1 font-bold bg-gray-50 border-t border-b border-gray-200">
                            <span>Total Capital &amp; Reserves:</span>
                            <span className="font-mono">1,30,58,313.11</span>
                          </div>
                        </div>

                        {/* Total Liabilities Row */}
                        <div className="flex justify-between p-2 bg-blue-50 font-black text-sm border-2 border-blue-200 text-[#0073b7]">
                          <span>TOTAL CAPITAL &amp; LIABILITIES</span>
                          <span className="font-mono">৳ 1,51,07,399.11</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
                  REPORT: SUPPLIER LIST (Payables -> Supplier List) (Screenshot 1)
                 ================================================================= */}
              {activeReportKey === 'pay_supplier_list' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300">Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Mobile</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">Email</th>
                        <th className="py-1 px-2">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_SUPPLIERS.map(s => (
                        <tr key={s.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{s.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{s.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf] font-bold">{s.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono">{s.phone}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{s.email || '-'}</td>
                          <td className="py-1 px-2 text-gray-600">{s.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: SUPPLIER BALANCE / VENDORE BALANCE (Screenshot 2 & 3)
                 ================================================================= */}
              {activeReportKey === 'pay_supplier_balance' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300">Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Mobile</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">Email</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Debit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Credit</th>
                        <th className="py-1 px-2 text-right w-28 font-bold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_SUPPLIERS.map(r => (
                        <tr key={r.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{r.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">[{r.code}] {r.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono">{r.phone}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-500">{r.email || '-'}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.debit)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.credit)}</td>
                          <td className={`py-1 px-2 text-right font-mono font-bold ${r.status === 'Payable' ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatBDT(r.balance)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row matching screenshot */}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={4} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">2,16,16,673.00</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">2,35,23,574.00</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">-19,06,901.00</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="pt-2 text-xs font-bold text-red-600">
                    Note: Pay To Vendor: 19,23,551.00 || Get From Vendor: 16,650.00
                  </div>
                </div>
              )}

              {/* =================================================================
                  REPORT: CASH STATEMENT (Screenshot 11, 12, 13 & PDF 3-Page Dump)
                 ================================================================= */}
              {(activeReportKey === 'acc_cash_statement' || activeReportKey === 'daily_cash_statement') && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th rowSpan={2} className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th rowSpan={2} className="py-1 px-2 border-r border-gray-300">Particulars</th>
                        <th colSpan={3} className="py-1 px-2 border-r border-gray-300 text-center">Transction Details</th>
                        <th rowSpan={2} className="py-1 px-2 w-28">Remarks</th>
                      </tr>
                      <tr className="bg-white text-gray-800 font-semibold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      <tr className="bg-gray-50/80 font-bold">
                        <td className="py-1 px-2 border-r"></td>
                        <td className="py-1 px-2 border-r font-bold text-gray-900">Opening Balance</td>
                        <td className="py-1 px-2 border-r text-right font-mono">95,21,858.00</td>
                        <td className="py-1 px-2 border-r text-right font-mono text-gray-400"></td>
                        <td className="py-1 px-2 border-r text-right font-mono">95,21,858.00 [ + ]</td>
                        <td className="py-1 px-2"></td>
                      </tr>
                      {AUTHENTIC_CASH_TRANSACTIONS.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200">{r.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">
                            {r.particulars.includes(' > ') ? (
                              <>
                                <span className="font-bold text-gray-900">{r.particulars.split(' > ')[0]}</span> &gt; {r.particulars.split(' > ')[1]}
                              </>
                            ) : (
                              r.particulars
                            )}
                          </td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{r.debit ? formatBDT(r.debit) : ''}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{r.credit ? formatBDT(r.credit) : ''}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-bold text-gray-900">
                            {formatBDT(r.balance)} [ + ]
                          </td>
                          <td className="py-1 px-2 text-gray-600 font-mono text-[10px]">{r.remarks}</td>
                        </tr>
                      ))}
                      {/* Total row matching PDF Page 3 */}
                      <tr className="bg-gray-100 font-black border-t-2 border-b-2 border-gray-400">
                        <td colSpan={2} className="py-1.5 px-2 text-right border-r border-gray-300">Total</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">1,14,83,208.00</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">10,95,296.00</td>
                        <td colSpan={2} className="py-1.5 px-2 text-right font-mono text-gray-900">
                          End Balance: 1,03,87,912.00 [ + ]
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: LEDGER STATEMENT (Screenshots 8, 9, 10)
                 ================================================================= */}
              {activeReportKey === 'acc_ledger_statement' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th rowSpan={2} className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th rowSpan={2} className="py-1 px-2 border-r border-gray-300">Particulars</th>
                        <th colSpan={3} className="py-1 px-2 border-r border-gray-300 text-center">Transction Details</th>
                        <th rowSpan={2} className="py-1 px-2 w-28">Remarks</th>
                      </tr>
                      <tr className="bg-white text-gray-800 font-semibold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      <tr className="bg-gray-50/70 font-semibold">
                        <td className="py-1 px-2 border-r"></td>
                        <td className="py-1 px-2 border-r font-bold text-gray-800">Opening Balance</td>
                        <td className="py-1 px-2 border-r text-right font-mono font-bold">95,21,858.00</td>
                        <td className="py-1 px-2 border-r text-right font-mono text-gray-400"></td>
                        <td className="py-1 px-2 border-r text-right font-mono font-bold">95,21,858.00 [ + ]</td>
                        <td className="py-1 px-2"></td>
                      </tr>
                      {AUTHENTIC_CASH_TRANSACTIONS.slice(0, 30).map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200">{r.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">
                            <span className="font-bold text-gray-900">{r.particulars.split(' > ')[0]}</span> &gt; {r.particulars.split(' > ')[1]}
                          </td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{r.debit ? formatBDT(r.debit) : ''}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{r.credit ? formatBDT(r.credit) : ''}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-bold text-gray-900">{formatBDT(r.balance)} [ + ]</td>
                          <td className="py-1 px-2 text-gray-600 font-mono text-[10px]">{r.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: CUSTOMER DUE COLLECTION (image_a6f54cc7.png)
                 ================================================================= */}
              {activeReportKey === 'rec_customer_due_collection' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300">Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Mobile</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Total Sale</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Paid</th>
                        <th className="py-1 px-2 text-right w-28 font-bold">Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {filteredCustomers.filter(c => c.balance > 0).slice(0, 40).map((r, i) => (
                        <tr key={r.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{i + 1}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">{r.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono">{r.phone}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.debit)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.credit)}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold text-red-600">{formatBDT(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: CUSTOMER BALANCE / DIRECTORY (image_12d9a1e2.png)
                 ================================================================= */}
              {activeReportKey === 'rec_customer_balance' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300">Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Mobile</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-40">Email</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit</th>
                        <th className="py-1 px-2 text-right w-28 font-bold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {paginatedCustomers.map(r => (
                        <tr key={r.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{r.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">[{r.code}] {r.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono">{r.phone}</td>
                          <td className="py-1 px-2 border-r border-gray-200">-</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.debit)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(r.credit)}</td>
                          <td className={`py-1 px-2 text-right font-mono font-bold ${r.status === 'Due' ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatBDT(r.balance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={4} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">{formatBDT(customerSummary.totalDebit)}</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">{formatBDT(customerSummary.totalCredit)}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">{formatBDT(customerSummary.netBalance)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="pt-2 text-xs font-bold text-red-600">
                    Note: Pay To Customer: {formatBDT(customerSummary.payToCustomer)} || Get From Customer: {formatBDT(customerSummary.getFromCustomer)}
                  </div>
                </div>
              )}

              {/* =================================================================
                  REPORT: PAYMENT REPORT (Screenshot 1)
                 ================================================================= */}
              {activeReportKey === 'vouch_payment' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-10">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Invoice</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-16">From</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">To</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Amount</th>
                        <th className="py-1 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_PAYMENTS.map(p => (
                        <tr key={p.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{p.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{p.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{p.invoice}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{p.from}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{p.to}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(p.amount)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{p.note}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_PAYMENTS.reduce((s, p) => s + p.amount, 0))}
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: RECEIPT REPORT (Screenshot 2)
                 ================================================================= */}
              {activeReportKey === 'vouch_receipt' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-10">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Invoice</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-52">From</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-40">To</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Amount</th>
                        <th className="py-1 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_RECEIPTS.map(r => (
                        <tr key={r.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{r.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{r.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{r.invoice}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{r.from}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{r.to}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(r.amount)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{r.note}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_RECEIPTS.reduce((s, r) => s + r.amount, 0))}
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: JOURNAL REPORT (Screenshot 3)
                 ================================================================= */}
              {activeReportKey === 'vouch_journal' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-10">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Invoice</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Amount</th>
                        <th className="py-1 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          0.00
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: PAYMENT & RECEIPT STATEMENT (Screenshot 4)
                 ================================================================= */}
              {activeReportKey === 'vouch_pay_rec_statement' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-10">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Invoice</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Type</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">Party / Account</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Amount</th>
                        <th className="py-1 px-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_PAYMENTS.map((p, i) => (
                        <tr key={`p-${p.sn}`} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{i + 1}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{p.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{p.invoice}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-bold text-red-600">PAYMENT</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{p.to}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(p.amount)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{p.note}</td>
                        </tr>
                      ))}
                      {AUTHENTIC_RECEIPTS.map((r, i) => (
                        <tr key={`r-${r.sn}`} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{AUTHENTIC_PAYMENTS.length + i + 1}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{r.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{r.invoice}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-bold text-emerald-700">RECEIPT</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{r.from}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(r.amount)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{r.note || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total Net Outflow-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_PAYMENTS.reduce((s, p) => s + p.amount, 0))}
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: INTERNAL TRANSACTION (Screenshot 5)
                 ================================================================= */}
              {activeReportKey === 'vouch_internal_transaction' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-10">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Reference</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">From Account</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">To Account</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Amount</th>
                        <th className="py-1 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_INTERNAL_TRANSFERS.map(itr => (
                        <tr key={itr.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{itr.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{itr.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{itr.reference}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium">{itr.fromAccount}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{itr.toAccount}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(itr.amount)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{itr.note}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_INTERNAL_TRANSFERS.reduce((s, x) => s + x.amount, 0))}
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: CUSTOMER COLLECTION REPORT / VOUCHER OVERVIEW (Screenshot 6)
                 ================================================================= */}
              {activeReportKey === 'vouch_overview' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Invoice</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-48">From</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">To</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Privious Due</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Collect</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Present Due</th>
                        <th className="py-1 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_COLLECTIONS.map(c => (
                        <tr key={c.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{c.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{c.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{c.invoice}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{c.from}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-700">{c.to}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono text-red-600">{formatBDT(c.previousDue)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-bold text-emerald-700">{formatBDT(c.collect)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono text-red-600">{formatBDT(c.presentDue)}</td>
                          <td className="py-1 px-2 text-[10px] text-gray-600">{c.note}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={6} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-emerald-700">
                          {formatBDT(AUTHENTIC_COLLECTIONS.reduce((s, c) => s + c.collect, 0))}
                        </td>
                        <td colSpan={2} className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: EMPLOYEE LIST (Screenshot 7)
                 ================================================================= */}
              {activeReportKey === 'payr_employee_list' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-20">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Employee Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">Designation</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Department</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Phone</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-40">Email</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Joining Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Basic Salary</th>
                        <th className="py-1 px-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_EMPLOYEES.map(emp => (
                        <tr key={emp.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{emp.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{emp.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{emp.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-700">{emp.designation}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{emp.department}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono">{emp.phone}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{emp.email}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{emp.joiningDate}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium">{formatBDT(emp.basicSalary)}</td>
                          <td className="py-1 px-2 text-center">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={8} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_EMPLOYEES.reduce((s, e) => s + e.totalSalary, 0))}
                        </td>
                        <td className="py-1.5 px-2 text-center text-[10px]">{AUTHENTIC_EMPLOYEES.length} Active Staff</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: ATTENDANCE REPORT (Screenshot 8)
                 ================================================================= */}
              {activeReportKey === 'payr_attendance' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-20">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Employee Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-44">Designation</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-24">In Time</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-24">Out Time</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-24">Work Hours</th>
                        <th className="py-1 px-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_ATTENDANCE.map(att => (
                        <tr key={att.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{att.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{att.date}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{att.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{att.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-700">{att.designation}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-center font-mono">{att.inTime}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-center font-mono">{att.outTime}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-center font-mono font-bold text-gray-800">{att.workHours}</td>
                          <td className="py-1 px-2 text-center">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                              att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: LEAVE RECORD (Screenshot 9)
                 ================================================================= */}
              {activeReportKey === 'payr_leave_record' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-20">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Employee Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-32">Leave Type</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">From</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-24">To</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-16">Days</th>
                        <th className="py-1 px-2 border-r border-gray-300">Reason</th>
                        <th className="py-1 px-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_LEAVES.map(l => (
                        <tr key={l.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{l.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{l.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{l.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{l.leaveType}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{l.fromDate}</td>
                          <td className="py-1 px-2 border-r border-gray-200">{l.toDate}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-center font-bold">{l.days}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{l.reason}</td>
                          <td className="py-1 px-2 text-center">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">{l.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: SALARY REPORT (Screenshot 10)
                 ================================================================= */}
              {activeReportKey === 'payr_salary_report' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-28">Month</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-20">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Employee Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-40">Designation</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Basic</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Allowances</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Net Salary</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Payment Method</th>
                        <th className="py-1 px-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_SALARIES.map(sal => (
                        <tr key={sal.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{sal.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-semibold">{sal.month}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{sal.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{sal.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-700">{sal.designation}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(sal.basicSalary)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(sal.allowances)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-bold text-gray-900">{formatBDT(sal.netSalary)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-gray-600">{sal.paymentMethod}</td>
                          <td className="py-1 px-2 text-center">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">{sal.status}</span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={5} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">{formatBDT(AUTHENTIC_SALARIES.reduce((s, x) => s + x.basicSalary, 0))}</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">{formatBDT(AUTHENTIC_SALARIES.reduce((s, x) => s + x.allowances, 0))}</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">{formatBDT(AUTHENTIC_SALARIES.reduce((s, x) => s + x.netSalary, 0))}</td>
                        <td colSpan={2} className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: COMMISSION REPORT (Screenshot 12)
                 ================================================================= */}
              {activeReportKey === 'payr_commission_report' && (
                <div className="overflow-x-auto border-t border-[#dd4b39]">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-20">Code</th>
                        <th className="py-1 px-2 border-r border-gray-300 w-36">Employee Name</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Target (৳)</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28">Achieved (৳)</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-center w-20">Rate (%)</th>
                        <th className="py-1 px-2 border-r border-gray-300 text-right w-28 font-bold">Commission (৳)</th>
                        <th className="py-1 px-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {AUTHENTIC_COMMISSIONS.map(comm => (
                        <tr key={comm.sn} className="hover:bg-gray-50/50">
                          <td className="py-1 px-2 border-r border-gray-200 text-center">{comm.sn}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{comm.code}</td>
                          <td className="py-1 px-2 border-r border-gray-200 font-medium text-gray-900">{comm.name}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(comm.targetAmount)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-medium text-emerald-700">{formatBDT(comm.achievedAmount)}</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-center font-mono">{comm.commissionRate}%</td>
                          <td className="py-1 px-2 border-r border-gray-200 text-right font-mono font-bold text-gray-900">{formatBDT(comm.commissionEarned)}</td>
                          <td className="py-1 px-2 text-center">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">{comm.status}</span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                        <td colSpan={6} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total Commission Paid-</td>
                        <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 font-bold text-gray-900">
                          {formatBDT(AUTHENTIC_COMMISSIONS.reduce((s, c) => s + c.commissionEarned, 0))}
                        </td>
                        <td className="py-1.5 px-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================================
                  REPORT: EMPLOYEE OVERVIEW (Screenshot 13)
                 ================================================================= */}
              {activeReportKey === 'payr_overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 border border-gray-200">
                    <div className="bg-white p-2.5 border border-gray-200 shadow-2xs">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Total Staff</div>
                      <div className="text-base font-bold text-gray-800 font-mono mt-0.5">6 Employees</div>
                    </div>
                    <div className="bg-white p-2.5 border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] text-emerald-700 uppercase font-bold">Present Today</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">100% (6/6)</div>
                    </div>
                    <div className="bg-white p-2.5 border border-blue-200 shadow-2xs">
                      <div className="text-[10px] text-[#0073b7] uppercase font-bold">Monthly Payroll</div>
                      <div className="text-base font-bold text-[#0073b7] font-mono mt-0.5">৳ 1,90,000.00</div>
                    </div>
                    <div className="bg-white p-2.5 border border-purple-200 shadow-2xs">
                      <div className="text-[10px] text-purple-700 uppercase font-bold">Total Commission</div>
                      <div className="text-base font-bold text-purple-700 font-mono mt-0.5">৳ 33,550.00</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 bg-white space-y-3">
                    <h3 className="font-bold text-xs uppercase text-[#0073b7] border-b pb-1">Department Staffing Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-gray-50 border border-gray-200">
                        <div className="font-bold text-gray-800">Sales &amp; Client Relations</div>
                        <div className="text-gray-500 text-[11px] mt-1">2 Executives • ৳ 60,000.00</div>
                      </div>
                      <div className="p-2.5 bg-gray-50 border border-gray-200">
                        <div className="font-bold text-gray-800">Technical Service &amp; Repairs</div>
                        <div className="text-gray-500 text-[11px] mt-1">2 Engineers • ৳ 57,000.00</div>
                      </div>
                      <div className="p-2.5 bg-gray-50 border border-gray-200">
                        <div className="font-bold text-gray-800">Accounts &amp; Warehouse</div>
                        <div className="text-gray-500 text-[11px] mt-1">2 Managers • ৳ 73,000.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
                  REPORT: ACCOUNTS OVERVIEW (Screenshot 11)
                 ================================================================= */}
              {activeReportKey === 'acc_overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 border border-gray-200">
                    <div className="bg-white p-2.5 border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] text-emerald-700 uppercase font-bold">Cash in Hand</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">৳ 1,03,87,912.00</div>
                    </div>
                    <div className="bg-white p-2.5 border border-blue-200 shadow-2xs">
                      <div className="text-[10px] text-[#0073b7] uppercase font-bold">Bank Balances</div>
                      <div className="text-base font-bold text-[#0073b7] font-mono mt-0.5">৳ 83,925.00</div>
                    </div>
                    <div className="bg-white p-2.5 border border-red-200 shadow-2xs">
                      <div className="text-[10px] text-red-600 uppercase font-bold">Customer Due (Receivable)</div>
                      <div className="text-base font-bold text-red-600 font-mono mt-0.5">৳ 13,36,660.00</div>
                    </div>
                    <div className="bg-white p-2.5 border border-amber-200 shadow-2xs">
                      <div className="text-[10px] text-amber-700 uppercase font-bold">Vendor Payable</div>
                      <div className="text-base font-bold text-amber-700 font-mono mt-0.5">৳ 19,23,551.00</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 bg-white space-y-3">
                    <h3 className="font-bold text-xs uppercase text-[#0073b7] border-b pb-1">Operational Financial Position</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Total Liquid Funds (Cash + Banks + Mobile):</span>
                          <span className="font-mono font-bold">৳ 1,05,61,347.00</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Inventory Stock Valuation:</span>
                          <span className="font-mono font-bold">৳ 22,27,742.11</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Fixed Assets (IT &amp; Showroom):</span>
                          <span className="font-mono font-bold">৳ 9,65,000.00</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Net Profit for the Period:</span>
                          <span className="font-mono font-bold text-emerald-700">৳ 15,58,313.11</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Total Capital &amp; Reserves:</span>
                          <span className="font-mono font-bold text-[#0073b7]">৳ 1,30,58,313.11</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100 font-bold bg-gray-50 px-2">
                          <span>Total Balance Sheet Value:</span>
                          <span className="font-mono text-gray-900">৳ 1,51,07,399.11</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================
                  DEFAULT REPORT TABLE (Sales, Purchase, Inventory, etc.)
                 ================================================================= */}
              {activeReportKey !== 'rec_balance_overview' &&
                activeReportKey !== 'acc_balance_sheet' &&
                activeReportKey !== 'pay_supplier_list' &&
                activeReportKey !== 'pay_supplier_balance' &&
                activeReportKey !== 'acc_cash_statement' &&
                activeReportKey !== 'daily_cash_statement' &&
                activeReportKey !== 'acc_ledger_statement' &&
                activeReportKey !== 'rec_customer_due_collection' &&
                activeReportKey !== 'rec_customer_balance' &&
                activeReportKey !== 'vouch_payment' &&
                activeReportKey !== 'vouch_receipt' &&
                activeReportKey !== 'vouch_journal' &&
                activeReportKey !== 'vouch_pay_rec_statement' &&
                activeReportKey !== 'vouch_internal_transaction' &&
                activeReportKey !== 'vouch_overview' &&
                activeReportKey !== 'payr_employee_list' &&
                activeReportKey !== 'payr_attendance' &&
                activeReportKey !== 'payr_leave_record' &&
                activeReportKey !== 'payr_salary_report' &&
                activeReportKey !== 'payr_commission_report' &&
                activeReportKey !== 'payr_overview' &&
                activeReportKey !== 'acc_overview' && (
                  <div className="overflow-x-auto border-t border-[#dd4b39]">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                          <th className="py-1 px-2 border-r border-gray-300 text-center w-8">SN</th>
                          <th className="py-1 px-2 border-r border-gray-300 w-24">Date</th>
                          <th className="py-1 px-2 border-r border-gray-300 w-28">Reference</th>
                          <th className="py-1 px-2 border-r border-gray-300">Particulars / Head</th>
                          <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Debit (৳)</th>
                          <th className="py-1 px-2 border-r border-gray-300 text-right w-24">Credit (৳)</th>
                          <th className="py-1 px-2 text-right w-28 font-bold">Total (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {sales.slice(0, 10).map((s, idx) => (
                          <tr key={s.id} className="hover:bg-gray-50/50">
                            <td className="py-1 px-2 border-r border-gray-200 text-center">{idx + 1}</td>
                            <td className="py-1 px-2 border-r border-gray-200">{s.date}</td>
                            <td className="py-1 px-2 border-r border-gray-200 font-mono text-[#0084bf]">{s.invoiceNo}</td>
                            <td className="py-1 px-2 border-r border-gray-200 font-medium">{s.customerName}</td>
                            <td className="py-1 px-2 border-r border-gray-200 text-right font-mono">{formatBDT(s.grandTotal)}</td>
                            <td className="py-1 px-2 border-r border-gray-200 text-right font-mono text-gray-400">0.00</td>
                            <td className="py-1 px-2 text-right font-mono font-bold text-gray-900">{formatBDT(s.grandTotal)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold border-t border-b border-gray-300">
                          <td colSpan={4} className="py-1.5 px-2 text-right border-r border-gray-300 uppercase">-Total-</td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300">
                            {formatBDT(sales.reduce((sum, s) => sum + s.grandTotal, 0))}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono border-r border-gray-300 text-gray-400">0.00</td>
                          <td className="py-1.5 px-2 text-right font-mono text-gray-900">
                            {formatBDT(sales.reduce((sum, s) => sum + s.grandTotal, 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Document Sheet Footer */}
              <div className="text-center pt-8 pb-4 text-xs text-gray-600 font-medium">
                TECH DRIVE. © 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-xl border border-gray-300 w-full max-w-md p-5 text-xs">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
                <i className="fa fa-envelope text-[#007bff]"></i>
                <span>Email {currentSubConfig.docTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Recipient Email:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-3 py-1.5 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  defaultValue={`Tech Drive ERP - ${currentSubConfig.docTitle} (${toDate})`}
                  className="w-full border border-gray-300 px-3 py-1.5 text-xs focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Format Attachment:</label>
                <div className="text-gray-600 bg-gray-50 border p-2">
                  <i className="fa fa-file-pdf-o text-red-600 mr-1.5"></i>
                  <span>PDF Document: {currentSubConfig.docTitle.replace(/\s+/g, '_')}.pdf</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-1.5 bg-gray-200 text-gray-700 font-semibold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold uppercase text-xs shadow-xs cursor-pointer"
                >
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
