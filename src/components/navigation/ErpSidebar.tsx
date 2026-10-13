import React, { useState, useMemo } from 'react';
import {
  Store,
  ShoppingCart,
  Boxes,
  Users,
  DollarSign,
  Landmark,
  BarChart3,
  Sliders,
  UserCheck,
  ChevronDown,
  ChevronRight,
  X,
  Search,
  Wrench,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import { WarrantyPolicySettings } from '../../types/warranty';

export type ERPModule =
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'clients'
  | 'payroll'
  | 'accounts'
  | 'finance'
  | 'reports'
  | 'master_setup'
  | 'company_settings'
  | 'users'
  | 'service'
  | 'warranty'
  | 'product_setup'
  | 'daily_process';

export interface SidebarSubItemChild {
  id: string; // e.g. "4.1.retail", "6.2.cash"
  label: string;
  subTabTarget?: string;
  badge?: string;
}

export interface SidebarSubItem {
  id: string; // e.g. "1.1", "1.2"
  label: string; // e.g. "1.1 New Sale / Sales Invoice"
  badge?: string;
  badgeColor?: string;
  moduleTarget: ERPModule;
  subTabTarget?: string;
  action?: 'shortcut' | 'modal' | 'route';
  children?: SidebarSubItemChild[];
}

export interface SidebarModuleItem {
  num: number;
  id: string;
  titleEn: string;
  titleBn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentBg: string;
  subItems: SidebarSubItem[];
}

export interface SidebarSection {
  title: string;
  badgeRange: string;
  modules: SidebarModuleItem[];
}

export const ERP_SIDEBAR_SECTIONS: SidebarSection[] = [
  // SECTION 1: CORE OPERATIONS
  {
    title: 'CORE OPERATIONS',
    badgeRange: '1 - 3',
    modules: [
      {
        num: 1,
        id: 'sales',
        titleEn: 'SALES',
        titleBn: 'বিক্রয়',
        icon: Store,
        color: 'text-blue-400',
        accentBg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
        subItems: [
          { id: '1.1', label: '1.1 New Sale / Sales Invoice', badge: 'Fast POS', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'sales', subTabTarget: 'pos', action: 'shortcut' },
          { id: '1.2', label: '1.2 Sales List', badge: 'Invoices', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'sales', subTabTarget: 'invoice', action: 'route' },
          { id: '1.3', label: '1.3 Sales Return', badge: 'Return', badgeColor: 'bg-rose-500/20 text-rose-300', moduleTarget: 'sales', subTabTarget: 'returns', action: 'route' },
          { id: '1.4', label: '1.4 Quotation', badge: 'Estimate', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'sales', subTabTarget: 'quote', action: 'route' },
          { id: '1.5', label: '1.5 Sales Order', badge: 'Orders', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'sales', subTabTarget: 'orders', action: 'route' },
          { id: '1.6', label: '1.6 Delivery / Challan', badge: 'Challan', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'sales', subTabTarget: 'challan', action: 'route' },
          { id: '1.7', label: '1.7 Customer Due / Receivable', badge: 'Due ৳', badgeColor: 'bg-cyan-500/20 text-cyan-300', moduleTarget: 'sales', subTabTarget: 'receivable', action: 'route' },
          { id: '1.8', label: '1.8 Sales History', badge: 'Audit Log', badgeColor: 'bg-slate-700 text-slate-300', moduleTarget: 'sales', subTabTarget: 'history', action: 'route' },
        ],
      },
      {
        num: 2,
        id: 'purchase',
        titleEn: 'PURCHASE',
        titleBn: 'ক্রয়',
        icon: ShoppingCart,
        color: 'text-purple-400',
        accentBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
        subItems: [
          { id: '2.1', label: '2.1 New Purchase / Purchase Invoice', badge: 'Direct Bill', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'purchase', subTabTarget: 'direct', action: 'shortcut' },
          { id: '2.2', label: '2.2 Purchase List', badge: 'Bills', badgeColor: 'bg-purple-500/20 text-purple-300', moduleTarget: 'purchase', subTabTarget: 'list', action: 'route' },
          { id: '2.3', label: '2.3 Purchase Return', badge: 'Vendor Ret', badgeColor: 'bg-rose-500/20 text-rose-300', moduleTarget: 'purchase', subTabTarget: 'returns', action: 'route' },
          { id: '2.4', label: '2.4 Purchase Order', badge: 'PO Order', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'purchase', subTabTarget: 'po', action: 'route' },
          { id: '2.5', label: '2.5 Goods Received / Receive Challan', badge: 'GRN Challan', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'purchase', subTabTarget: 'receive', action: 'route' },
          { id: '2.6', label: '2.6 Supplier Due / Payable', badge: 'Payable ৳', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'purchase', subTabTarget: 'payable', action: 'route' },
          { id: '2.7', label: '2.7 Purchase History', badge: 'History', badgeColor: 'bg-slate-700 text-slate-300', moduleTarget: 'purchase', subTabTarget: 'history', action: 'route' },
        ],
      },
      {
        num: 3,
        id: 'inventory',
        titleEn: 'INVENTORY',
        titleBn: 'মজুদ স্টক ও পণ্য',
        icon: Boxes,
        color: 'text-indigo-400',
        accentBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
        subItems: [
          { id: '3.1', label: '3.1 Products', badge: 'Catalog', badgeColor: 'bg-sky-500/20 text-sky-300', moduleTarget: 'inventory', subTabTarget: 'products', action: 'route' },
          { id: '3.2', label: '3.2 Stock In / Out', badge: 'Movement', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'inventory', subTabTarget: 'stock_in_out', action: 'route' },
          { id: '3.3', label: '3.3 Stock Transfer', badge: 'Warehouse', badgeColor: 'bg-purple-500/20 text-purple-300', moduleTarget: 'inventory', subTabTarget: 'transfer', action: 'route' },
          { id: '3.4', label: '3.4 Stock Adjustment', badge: 'Adjust', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'inventory', subTabTarget: 'adjustment', action: 'route' },
          { id: '3.5', label: '3.5 Stock Report', badge: 'Valuation', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'inventory', subTabTarget: 'report', action: 'route' },
        ],
      },
    ],
  },

  // SECTION 2: MANAGEMENT
  {
    title: 'MANAGEMENT',
    badgeRange: '4 - 6',
    modules: [
      {
        num: 4,
        id: 'clients',
        titleEn: 'CLIENT SETUP',
        titleBn: 'গ্রাহক ও সাপ্লায়ার সেটিংস',
        icon: Users,
        color: 'text-cyan-400',
        accentBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
        subItems: [
          {
            id: '4.1',
            label: '4.1 Customers',
            badge: 'Clients',
            badgeColor: 'bg-cyan-500/20 text-cyan-300',
            moduleTarget: 'clients',
            subTabTarget: 'customers',
            action: 'route',
            children: [
              { id: '4.1.retail', label: 'Retail Customers', subTabTarget: 'retail', badge: 'B2C' },
              { id: '4.1.b2b', label: 'B2B / Corporate Clients', subTabTarget: 'b2b', badge: 'B2B Corp' },
            ],
          },
          { id: '4.2', label: '4.2 Suppliers', badge: 'Vendors', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'clients', subTabTarget: 'suppliers', action: 'route' },
          { id: '4.3', label: '4.3 Customer / Supplier Groups', badge: 'Tiers', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'clients', subTabTarget: 'groups', action: 'route' },
          { id: '4.4', label: '4.4 Opening Balance', badge: 'Ledger ৳', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'clients', subTabTarget: 'opening', action: 'route' },
        ],
      },
      {
        num: 5,
        id: 'payroll',
        titleEn: 'STAFF PAYROLL & SLIPS',
        titleBn: 'কর্মচারীদের বেতন ও রসিদ',
        icon: DollarSign,
        color: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        subItems: [
          { id: '5.1', label: '5.1 Employees', badge: 'Staff CRM', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'payroll', subTabTarget: 'employees', action: 'route' },
          { id: '5.2', label: '5.2 Attendance', badge: 'Roster', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'payroll', subTabTarget: 'attendance', action: 'route' },
          { id: '5.3', label: '5.3 Payroll / Salary', badge: 'Monthly', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'payroll', subTabTarget: 'salary', action: 'route' },
          { id: '5.4', label: '5.4 Salary Slips', badge: 'A4 Print', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'payroll', subTabTarget: 'slips', action: 'route' },
          { id: '5.5', label: '5.5 Employee Advances', badge: 'Advances', badgeColor: 'bg-purple-500/20 text-purple-300', moduleTarget: 'payroll', subTabTarget: 'advances', action: 'route' },
          { id: '5.6', label: '5.6 Payroll Report', badge: 'Summary', badgeColor: 'bg-rose-500/20 text-rose-300', moduleTarget: 'payroll', subTabTarget: 'report', action: 'route' },
        ],
      },
      {
        num: 6,
        id: 'accounts',
        titleEn: 'ACCOUNTS & FINANCE',
        titleBn: 'হিসাব ও অর্থ লেনদেন',
        icon: Landmark,
        color: 'text-amber-400',
        accentBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
        subItems: [
          { id: '6.1', label: '6.1 Accounts Dashboard', badge: 'Liquidity', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'accounts', subTabTarget: 'dashboard', action: 'route' },
          {
            id: '6.2',
            label: '6.2 Cash & Bank',
            badge: 'Balances',
            badgeColor: 'bg-blue-500/20 text-blue-300',
            moduleTarget: 'accounts',
            subTabTarget: 'cash_bank',
            action: 'route',
            children: [
              { id: '6.2.cash', label: 'Cash', subTabTarget: 'cash' },
              { id: '6.2.bank', label: 'Bank Accounts', subTabTarget: 'bank' },
              { id: '6.2.cheque', label: 'Cheque Management', subTabTarget: 'cheque' },
            ],
          },
          {
            id: '6.3',
            label: '6.3 Receive Payment',
            badge: 'Cash In',
            badgeColor: 'bg-emerald-500/20 text-emerald-300',
            moduleTarget: 'accounts',
            subTabTarget: 'receive_payment',
            action: 'route',
            children: [
              { id: '6.3.cash', label: 'Cash', subTabTarget: 'receive_cash' },
              { id: '6.3.bank', label: 'Bank Transfer', subTabTarget: 'receive_bank' },
              { id: '6.3.cheque', label: 'Cheque', subTabTarget: 'receive_cheque' },
              { id: '6.3.card', label: 'Card / Other', subTabTarget: 'receive_card' },
            ],
          },
          {
            id: '6.4',
            label: '6.4 Make Payment',
            badge: 'Payout',
            badgeColor: 'bg-rose-500/20 text-rose-300',
            moduleTarget: 'accounts',
            subTabTarget: 'make_payment',
            action: 'route',
            children: [
              { id: '6.4.cash', label: 'Cash', subTabTarget: 'pay_cash' },
              { id: '6.4.bank', label: 'Bank Transfer', subTabTarget: 'pay_bank' },
              { id: '6.4.cheque', label: 'Cheque', subTabTarget: 'pay_cheque' },
              { id: '6.4.card', label: 'Card / Other', subTabTarget: 'pay_card' },
            ],
          },
          { id: '6.5', label: '6.5 Income & Expense', badge: 'Vouchers', badgeColor: 'bg-purple-500/20 text-purple-300', moduleTarget: 'accounts', subTabTarget: 'income_expense', action: 'route' },
          { id: '6.6', label: '6.6 Journal / Ledger', badge: 'Ledger', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'accounts', subTabTarget: 'journal', action: 'route' },
          { id: '6.7', label: '6.7 Accounts Receivable / Payable', badge: 'Dues', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'accounts', subTabTarget: 'receivable_payable', action: 'route' },
          { id: '6.8', label: '6.8 Financial Reports', badge: 'P&L / BS', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'accounts', subTabTarget: 'financial_reports', action: 'route' },
        ],
      },
    ],
  },

  // SECTION 3: REPORTING & ADMIN
  {
    title: 'REPORTING & ADMIN',
    badgeRange: '7 - 9',
    modules: [
      {
        num: 7,
        id: 'reports',
        titleEn: 'REPORT',
        titleBn: 'প্রতিবেদন',
        icon: BarChart3,
        color: 'text-rose-400',
        accentBg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
        subItems: [
          { id: '7.1', label: '7.1 Sales Reports', badge: 'Sales BI', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'reports', subTabTarget: 'sales', action: 'route' },
          { id: '7.2', label: '7.2 Purchase Reports', badge: 'Purchase BI', badgeColor: 'bg-purple-500/20 text-purple-300', moduleTarget: 'reports', subTabTarget: 'purchase', action: 'route' },
          { id: '7.3', label: '7.3 Inventory Reports', badge: 'Stock BI', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'reports', subTabTarget: 'inventory', action: 'route' },
          { id: '7.4', label: '7.4 Customer & Supplier Reports', badge: 'Parties', badgeColor: 'bg-cyan-500/20 text-cyan-300', moduleTarget: 'reports', subTabTarget: 'clients', action: 'route' },
          { id: '7.5', label: '7.5 Accounts & Finance Reports', badge: 'Cash & P&L', badgeColor: 'bg-emerald-500/20 text-emerald-300', moduleTarget: 'reports', subTabTarget: 'finance', action: 'route' },
          { id: '7.6', label: '7.6 Payroll Reports', badge: 'Salary BI', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'reports', subTabTarget: 'payroll', action: 'route' },
        ],
      },
      {
        num: 8,
        id: 'master_setup',
        titleEn: 'MASTER SETUP',
        titleBn: 'মাস্টার সেটিংস',
        icon: Sliders,
        color: 'text-teal-400',
        accentBg: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
        subItems: [
          { id: '8.1', label: '8.1 Company / Business Setup', badge: 'A4 Pad', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'master_setup', subTabTarget: 'company', action: 'route' },
          { id: '8.2', label: '8.2 Branch / Warehouse', badge: 'Branches', badgeColor: 'bg-cyan-500/20 text-cyan-300', moduleTarget: 'master_setup', subTabTarget: 'branches', action: 'route' },
          { id: '8.3', label: '8.3 Products & Categories', badge: 'Catalog', badgeColor: 'bg-indigo-500/20 text-indigo-300', moduleTarget: 'master_setup', subTabTarget: 'categories', action: 'route' },
          { id: '8.4', label: '8.4 Units & Tax / VAT', badge: 'VAT 5%', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'master_setup', subTabTarget: 'units_tax', action: 'route' },
          {
            id: '8.5',
            label: '8.5 Payment Methods',
            badge: 'Gateways',
            badgeColor: 'bg-emerald-500/20 text-emerald-300',
            moduleTarget: 'master_setup',
            subTabTarget: 'payment_methods',
            action: 'route',
            children: [
              { id: '8.5.cash', label: 'Cash', subTabTarget: 'method_cash' },
              { id: '8.5.bank', label: 'Bank', subTabTarget: 'method_bank' },
              { id: '8.5.cheque', label: 'Cheque', subTabTarget: 'method_cheque' },
              { id: '8.5.card', label: 'Card', subTabTarget: 'method_card' },
              { id: '8.5.mfs', label: 'Mobile / Online Payment', subTabTarget: 'method_mfs' },
            ],
          },
          { id: '8.6', label: '8.6 Invoice & Document Settings', badge: 'Config', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'master_setup', subTabTarget: 'invoice_settings', action: 'route' },
          { id: '8.7', label: '8.7 Financial Year & General Settings', badge: 'General', badgeColor: 'bg-slate-700 text-slate-300', moduleTarget: 'master_setup', subTabTarget: 'financial_year', action: 'route' },
        ],
      },
      {
        num: 9,
        id: 'users',
        titleEn: 'USER & ROLE',
        titleBn: 'ব্যবহারকারী ও অনুমতি',
        icon: UserCheck,
        color: 'text-violet-400',
        accentBg: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
        subItems: [
          { id: '9.1', label: '9.1 Users', badge: 'Accounts', badgeColor: 'bg-violet-500/20 text-violet-300', moduleTarget: 'users', subTabTarget: 'users', action: 'route' },
          { id: '9.2', label: '9.2 Roles & Permissions', badge: 'RBAC', badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300', moduleTarget: 'users', subTabTarget: 'roles', action: 'route' },
          { id: '9.3', label: '9.3 User Access / Module Access', badge: 'Access Matrix', badgeColor: 'bg-blue-500/20 text-blue-300', moduleTarget: 'users', subTabTarget: 'access', action: 'route' },
          { id: '9.4', label: '9.4 Login & Security', badge: 'Security', badgeColor: 'bg-amber-500/20 text-amber-300', moduleTarget: 'users', subTabTarget: 'security', action: 'route' },
          { id: '9.5', label: '9.5 Activity / Audit Log', badge: 'Audit Trail', badgeColor: 'bg-teal-500/20 text-teal-300', moduleTarget: 'users', subTabTarget: 'audit', action: 'route' },
        ],
      },
    ],
  },
];

// Flat list for easy reference
export const ERP_SIDEBAR_MENU: SidebarModuleItem[] = ERP_SIDEBAR_SECTIONS.flatMap(
  (sec) => sec.modules
);

interface ErpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ERPModule;
  onSelectModule: (module: ERPModule) => void;
  activeSubItem?: string;
  onSelectSubItem?: (module: ERPModule, subId: string, subTab?: string) => void;
  heldOrdersCount?: number;
  pendingPOCount?: number;
  warrantyPolicy?: WarrantyPolicySettings;
  onOpenWarrantyPolicyModal?: () => void;
  salesSubTab?: 'pos' | 'invoice';
  onSelectSalesSubTab?: (tab: 'pos' | 'invoice') => void;
  onOpenSalesInvoiceSettings?: () => void;
  purchaseSubTab?: 'po' | 'direct' | 'list';
  onSelectPurchaseSubTab?: (tab: 'po' | 'direct' | 'list') => void;
  onOpenPurchaseSettings?: () => void;
  onOpenLetterheadSettings?: () => void;
  onNewSaleShortcut?: () => void;
  onNewPurchaseShortcut?: () => void;
  onCashReceiveShortcut?: () => void;
  onCashPayShortcut?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const ErpSidebar: React.FC<ErpSidebarProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
  activeSubItem = '1.1',
  onSelectSubItem,
  heldOrdersCount = 0,
  pendingPOCount = 0,
  salesSubTab = 'pos',
  onSelectSalesSubTab,
  onOpenSalesInvoiceSettings,
  purchaseSubTab = 'direct',
  onSelectPurchaseSubTab,
  onOpenPurchaseSettings,
  onOpenLetterheadSettings,
  onNewSaleShortcut,
  onNewPurchaseShortcut,
  onCashReceiveShortcut,
  onCashPayShortcut,
  onOpenGoogleDrive,
}) => {
  // Collapsible state for the 9 modules
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sales: true,
    purchase: true,
    inventory: false,
    clients: false,
    payroll: false,
    accounts: false,
    reports: false,
    master_setup: false,
    users: false,
  });

  // Expandable sub-items with children
  const [openSubChildren, setOpenSubChildren] = useState<Record<string, boolean>>({
    '4.1': true,
    '6.2': false,
    '6.3': false,
    '6.4': false,
    '8.5': false,
  });

  const [searchFilter, setSearchFilter] = useState('');

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleSubChildren = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSubChildren((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  const handleSubItemClick = (
    moduleItem: SidebarModuleItem,
    subItem: SidebarSubItem,
    child?: SidebarSubItemChild
  ) => {
    const targetSubId = child ? child.id : subItem.id;
    const targetSubTab = child ? child.subTabTarget : subItem.subTabTarget;

    // 1. Check for specific modal shortcuts
    if (subItem.id === '1.1') {
      if (onNewSaleShortcut) onNewSaleShortcut();
      else {
        onSelectModule('sales');
        if (onSelectSalesSubTab) onSelectSalesSubTab('pos');
      }
    } else if (subItem.id === '2.1') {
      if (onNewPurchaseShortcut) onNewPurchaseShortcut();
      else {
        onSelectModule('purchase');
        if (onSelectPurchaseSubTab) onSelectPurchaseSubTab('direct');
      }
    } else if (subItem.id === '6.3' && child?.id === '6.3.cash') {
      if (onCashReceiveShortcut) onCashReceiveShortcut();
      else onSelectModule('accounts');
    } else if (subItem.id === '6.4' && child?.id === '6.4.cash') {
      if (onCashPayShortcut) onCashPayShortcut();
      else onSelectModule('accounts');
    } else if (subItem.id === '8.1' && onOpenLetterheadSettings) {
      onSelectModule('master_setup');
    } else if (subItem.id === '8.6' && onOpenSalesInvoiceSettings) {
      onSelectModule('master_setup');
    } else {
      // Standard ERP Module Navigation
      onSelectModule(subItem.moduleTarget);
      if (subItem.moduleTarget === 'sales' && onSelectSalesSubTab) {
        if (subItem.id === '1.1') {
          onSelectSalesSubTab('pos');
        } else {
          onSelectSalesSubTab('invoice');
        }
      }
      if (subItem.moduleTarget === 'purchase' && onSelectPurchaseSubTab) {
        if (subItem.id === '2.4' || subItem.id === '2.5') {
          onSelectPurchaseSubTab('po');
        } else {
          onSelectPurchaseSubTab('direct');
        }
      }
    }

    if (onSelectSubItem) {
      onSelectSubItem(subItem.moduleTarget, targetSubId, targetSubTab);
    }

    // Auto-close on small mobile screens
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Filter menu items if search filter is active
  const filteredSections = useMemo(() => {
    if (!searchFilter.trim()) return ERP_SIDEBAR_SECTIONS;
    const q = searchFilter.toLowerCase();

    return ERP_SIDEBAR_SECTIONS.map((sec) => {
      const filteredModules = sec.modules
        .map((group) => {
          const matchGroup =
            group.titleEn.toLowerCase().includes(q) ||
            group.titleBn.toLowerCase().includes(q);
          const filteredSubs = group.subItems.filter((s) => {
            const matchSub =
              s.label.toLowerCase().includes(q) ||
              (s.badge && s.badge.toLowerCase().includes(q));
            const matchChild = s.children?.some(
              (c) =>
                c.label.toLowerCase().includes(q) ||
                (c.badge && c.badge.toLowerCase().includes(q))
            );
            return matchSub || matchChild;
          });
          if (matchGroup) return group;
          return {
            ...group,
            subItems: filteredSubs,
          };
        })
        .filter((group) => group.subItems.length > 0);

      return {
        ...sec,
        modules: filteredModules,
      };
    }).filter((sec) => sec.modules.length > 0);
  }, [searchFilter]);

  // Is module or any of its subItems currently active?
  const isModuleActive = (group: SidebarModuleItem) => {
    if (group.id === activeModule) return true;
    if (group.id === 'accounts' && ['accounts', 'finance'].includes(activeModule)) {
      return true;
    }
    if (group.id === 'inventory' && ['inventory', 'product_setup'].includes(activeModule)) {
      return true;
    }
    if (group.id === 'master_setup' && ['master_setup', 'company_settings'].includes(activeModule)) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-68 md:w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-72 md:-w-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-xs font-black text-base">
              N
            </div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-wide leading-tight flex items-center gap-1.5">
                <span>NextGen IT</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.2 rounded border border-blue-500/30">
                  ERP
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise POS &amp; Accounting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search inside Sidebar */}
        <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search ERP menus (e.g. B2B, Stock, Cash)..."
              className="w-full bg-slate-850 border border-slate-750 text-white rounded-lg pl-8 pr-7 py-1.5 text-[11px] placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu - 3 Distinct Sections & 9 Modules Architecture */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredSections.map((section, secIdx) => (
            <div key={section.title} className="space-y-1.5">
              {/* Section Category Header */}
              <div className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                  <span>{section.title}</span>
                </span>
                <span className="text-[9px] font-mono bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750">
                  {section.badgeRange}
                </span>
              </div>

              {/* Modules in this Section */}
              <div className="space-y-1.5">
                {section.modules.map((group) => {
                  const Icon = group.icon;
                  const isOpenGroup = openGroups[group.id] || searchFilter.length > 0;
                  const groupActive = isModuleActive(group);

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/60 overflow-hidden transition-colors"
                    >
                      {/* Module Group Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all cursor-pointer ${
                          groupActive
                            ? 'bg-slate-800/90 text-white border-b border-slate-700/60'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                              groupActive ? group.accentBg : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-200">
                              <span>
                                {group.num}. {group.titleEn}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-bengali truncate leading-tight">
                              {group.titleBn}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {group.id === 'sales' && heldOrdersCount > 0 && (
                            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                              {heldOrdersCount}
                            </span>
                          )}
                          {group.id === 'purchase' && pendingPOCount > 0 && (
                            <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                              {pendingPOCount}
                            </span>
                          )}
                          {isOpenGroup ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Sub-menu List */}
                      {isOpenGroup && (
                        <div className="px-2 py-1.5 space-y-1 bg-slate-950/40">
                          {group.subItems.map((sub) => {
                            const isSubActive =
                              activeSubItem === sub.id ||
                              (group.id === 'sales' && sub.id === '1.1' && activeModule === 'sales' && salesSubTab === 'pos') ||
                              (group.id === 'sales' && sub.id === '1.2' && activeModule === 'sales' && salesSubTab === 'invoice' && activeSubItem === '1.2') ||
                              (group.id === 'purchase' && sub.id === '2.1' && activeModule === 'purchase' && purchaseSubTab === 'direct' && activeSubItem === '2.1') ||
                              (group.id === 'purchase' && sub.id === '2.4' && activeModule === 'purchase' && purchaseSubTab === 'po' && activeSubItem === '2.4');

                            const hasChildren = sub.children && sub.children.length > 0;
                            const isChildrenOpen = openSubChildren[sub.id] || searchFilter.length > 0;

                            return (
                              <div key={sub.id} className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSubItemClick(group, sub)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer group text-left ${
                                    isSubActive
                                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                                  }`}
                                  title={sub.label}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`text-[10px] shrink-0 font-mono font-bold ${
                                        isSubActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-blue-400'
                                      }`}
                                    >
                                      ▸
                                    </span>
                                    <span className="truncate">{sub.label}</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                    {sub.badge && (
                                      <span
                                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                                          isSubActive
                                            ? 'bg-white/20 text-white font-bold'
                                            : sub.badgeColor || 'bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {sub.badge}
                                      </span>
                                    )}

                                    {hasChildren && (
                                      <span
                                        onClick={(e) => toggleSubChildren(sub.id, e)}
                                        className="p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white cursor-pointer ml-0.5"
                                        title="Toggle details"
                                      >
                                        {isChildrenOpen ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </button>

                                {/* Child Sub-items (e.g. Retail Customers, B2B Clients, Payment Methods) */}
                                {hasChildren && isChildrenOpen && (
                                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800/80 ml-3.5">
                                    {sub.children!.map((child) => {
                                      const isChildActive = activeSubItem === child.id;

                                      return (
                                        <button
                                          key={child.id}
                                          type="button"
                                          onClick={() => handleSubItemClick(group, sub, child)}
                                          className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer text-left ${
                                            isChildActive
                                              ? 'bg-indigo-600 text-white font-semibold'
                                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                          }`}
                                          title={child.label}
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <span className="text-[9px] text-slate-500">•</span>
                                            <span className="truncate">{child.label}</span>
                                          </div>
                                          {child.badge && (
                                            <span className="text-[8px] bg-slate-800/80 text-slate-400 px-1 py-0.2 rounded ml-1 font-mono">
                                              {child.badge}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Specialized Operations & Support Utilities (Preserving Service & Warranty) */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center justify-between">
              <span>SPECIALIZED UTILITIES</span>
              <span className="text-[9px] text-emerald-400 font-mono">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSelectModule('service');
                  if (onSelectSubItem) onSelectSubItem('service', 'srv.tickets', 'tickets');
                  if (window.innerWidth < 768) onClose();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                  activeModule === 'service'
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Service</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectModule('warranty');
                  if (onSelectSubItem) onSelectSubItem('warranty', 'wty.policy', 'policy');
                  if (window.innerWidth < 768) onClose();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                  activeModule === 'warranty'
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">Warranty</span>
              </button>
            </div>
          </div>
        </div>

        {/* Google Drive Cloud Sync Quick Action */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={onOpenGoogleDrive}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Google Drive Cloud Sync</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
              Backups
            </span>
          </button>
        </div>

        {/* Footer Info & System Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-300">9 Core ERP Modules</span>
          </div>
          <span className="text-emerald-400 font-medium">Bilingual BD</span>
        </div>
      </aside>
    </>
  );
};
