import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  TrendingUp,
  FileText,
  Search,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Download,
  CheckCircle,
  Eye,
  Sliders,
  ChevronRight,
  Building,
  RotateCcw,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing, playBarcodeBeep } from '../../utils/sound';
import { ReceivePaymentTab } from '../accounts/ReceivePaymentTab';
import { MakePaymentTab } from '../accounts/MakePaymentTab';
import { ChequeManagementTab } from '../accounts/ChequeManagementTab';
import { JournalLedgerTab } from '../accounts/JournalLedgerTab';
import { ReceivablePayableTab } from '../accounts/ReceivablePayableTab';
import { FinancialReportsTab } from '../accounts/FinancialReportsTab';
import { FinanceRecordView } from './FinanceRecordView';

export interface AccountLedgerEntry {
  id: string;
  accountId: string;
  date: string;
  referenceNo: string;
  description: string;
  type: 'Debit' | 'Credit'; // Debit = Money In (Inflow), Credit = Money Out (Outflow)
  inflow: number;
  outflow: number;
  runningBalance: number;
  category: string;
  paymentMode: string;
  recordedBy: string;
  reconciled: boolean;
  notes?: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  accountType: 'Cash' | 'Bank' | 'MFS' | 'Asset';
  accountNumber: string;
  branch?: string;
  balance: number;
  currency?: string;
  isDefault?: boolean;
}

const INITIAL_ACCOUNTS: AccountRecord[] = [
  { id: 'acc-1', name: 'Main POS Cash Register', accountType: 'Cash', accountNumber: 'DRAWER-01', balance: 75000, isDefault: true },
  { id: 'acc-2', name: 'Brac Bank Current Account', accountType: 'Bank', accountNumber: '1501204899201001', branch: 'Gulshan Branch', balance: 485000 },
  { id: 'acc-3', name: 'City Bank Business Account', accountType: 'Bank', accountNumber: '2102938475001', branch: 'Dhanmondi Branch', balance: 240000 },
  { id: 'acc-4', name: 'bKash Merchant Gateway', accountType: 'MFS', accountNumber: '01700998877', balance: 68500 },
  { id: 'acc-5', name: 'Nagad Business Wallet', accountType: 'MFS', accountNumber: '01899112233', balance: 34200 },
];

const INITIAL_LEDGER_ENTRIES: AccountLedgerEntry[] = [
  // acc-1: Main POS Cash Register (75,000)
  {
    id: 'ldg-101',
    accountId: 'acc-1',
    date: '2026-10-01',
    referenceNo: 'FLT-2026-001',
    description: 'Morning Opening Cash Drawer Float',
    type: 'Debit',
    inflow: 10000,
    outflow: 0,
    runningBalance: 10000,
    category: 'Opening Float',
    paymentMode: 'Cash',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-102',
    accountId: 'acc-1',
    date: '2026-10-01',
    referenceNo: 'INV-2026-9021',
    description: 'Counter Cash Sales Collections (Morning Shift)',
    type: 'Debit',
    inflow: 45000,
    outflow: 0,
    runningBalance: 55000,
    category: 'Sales Collection',
    paymentMode: 'Cash Drawer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-103',
    accountId: 'acc-1',
    date: '2026-10-02',
    referenceNo: 'EXP-2026-081',
    description: 'Office Refreshment, Tea & Guest Snacks',
    type: 'Credit',
    inflow: 0,
    outflow: 850,
    runningBalance: 54150,
    category: 'Office Expense',
    paymentMode: 'Cash Drawer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-104',
    accountId: 'acc-1',
    date: '2026-10-02',
    referenceNo: 'INV-2026-9035',
    description: 'Hardware Peripheral & Laptop Sales (Afternoon)',
    type: 'Debit',
    inflow: 52000,
    outflow: 0,
    runningBalance: 106150,
    category: 'Sales Collection',
    paymentMode: 'Cash Drawer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-105',
    accountId: 'acc-1',
    date: '2026-10-03',
    referenceNo: 'TRF-2026-012',
    description: 'End of Day Cash Drop Transfer to Brac Bank Safe',
    type: 'Credit',
    inflow: 0,
    outflow: 60000,
    runningBalance: 46150,
    category: 'Bank Deposit',
    paymentMode: 'Cash Drawer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-106',
    accountId: 'acc-1',
    date: '2026-10-04',
    referenceNo: 'INV-2026-9048',
    description: 'Counter Cash Sales Receipt Total (Current Session)',
    type: 'Debit',
    inflow: 28850,
    outflow: 0,
    runningBalance: 75000,
    category: 'Sales Collection',
    paymentMode: 'Cash Drawer',
    recordedBy: 'Forhad',
    reconciled: true,
  },

  // acc-2: Brac Bank Current Account (485,000)
  {
    id: 'ldg-201',
    accountId: 'acc-2',
    date: '2026-10-01',
    referenceNo: 'BAL-FWD-01',
    description: 'Monthly Balance Brought Forward',
    type: 'Debit',
    inflow: 420000,
    outflow: 0,
    runningBalance: 420000,
    category: 'Balance Forward',
    paymentMode: 'Bank Transfer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-202',
    accountId: 'acc-2',
    date: '2026-10-01',
    referenceNo: 'INV-CORP-9011',
    description: 'Corporate Client Payment Cleared - Apex Technologies Ltd',
    type: 'Debit',
    inflow: 65000,
    outflow: 0,
    runningBalance: 485000,
    category: 'Client Due Collection',
    paymentMode: 'Direct Bank Wire',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-203',
    accountId: 'acc-2',
    date: '2026-10-02',
    referenceNo: 'VND-2026-441',
    description: 'Partial Vendor Due Payment to Global Tech Ltd for ThinkPad Laptops',
    type: 'Credit',
    inflow: 0,
    outflow: 45000,
    runningBalance: 440000,
    category: 'Supplier Due',
    paymentMode: 'Brac Bank Transfer',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-204',
    accountId: 'acc-2',
    date: '2026-10-03',
    referenceNo: 'TRF-2026-012',
    description: 'Cash Drop Deposit Credited from Main Cash Drawer',
    type: 'Debit',
    inflow: 60000,
    outflow: 0,
    runningBalance: 500000,
    category: 'Cash Inflow Transfer',
    paymentMode: 'Cash Deposit',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-205',
    accountId: 'acc-2',
    date: '2026-10-03',
    referenceNo: 'UTIL-2026-092',
    description: 'Shop Dedicated High-Speed Fiber Internet Bill (October)',
    type: 'Credit',
    inflow: 0,
    outflow: 3500,
    runningBalance: 496500,
    category: 'Utilities',
    paymentMode: 'Online Bank Bill',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-206',
    accountId: 'acc-2',
    date: '2026-10-04',
    referenceNo: 'ADV-STF-014',
    description: 'Staff Salary Advance Payout (Disbursed to Rahim Chowdhury)',
    type: 'Credit',
    inflow: 0,
    outflow: 11500,
    runningBalance: 485000,
    category: 'Staff Advance Payout',
    paymentMode: 'Bank Transfer',
    recordedBy: 'Forhad',
    reconciled: true,
  },

  // acc-3: City Bank Business Account (240,000)
  {
    id: 'ldg-301',
    accountId: 'acc-3',
    date: '2026-09-30',
    referenceNo: 'BAL-FWD-02',
    description: 'Monthly Balance Forward',
    type: 'Debit',
    inflow: 200000,
    outflow: 0,
    runningBalance: 200000,
    category: 'Balance Forward',
    paymentMode: 'Bank Wire',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-302',
    accountId: 'acc-3',
    date: '2026-10-02',
    referenceNo: 'SETL-2026-004',
    description: 'POS Visa & Mastercard Merchant Gateway Terminal Settlement',
    type: 'Debit',
    inflow: 55000,
    outflow: 0,
    runningBalance: 255000,
    category: 'Merchant Settlement',
    paymentMode: 'Card Clearing',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-303',
    accountId: 'acc-3',
    date: '2026-10-03',
    referenceNo: 'RENT-2026-10',
    description: 'Commercial Outlet Monthly Advance Rent Installment',
    type: 'Credit',
    inflow: 0,
    outflow: 15000,
    runningBalance: 240000,
    category: 'Outlet Rent',
    paymentMode: 'City Bank Pay Order',
    recordedBy: 'Forhad',
    reconciled: true,
  },

  // acc-4: bKash Merchant Gateway (68,500)
  {
    id: 'ldg-401',
    accountId: 'acc-4',
    date: '2026-10-01',
    referenceNo: 'MFS-OP-01',
    description: 'Opening bKash Merchant Wallet Balance',
    type: 'Debit',
    inflow: 32000,
    outflow: 0,
    runningBalance: 32000,
    category: 'Opening Balance',
    paymentMode: 'MFS Gateway',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-402',
    accountId: 'acc-4',
    date: '2026-10-02',
    referenceNo: 'MFS-TX-8812',
    description: 'Customer Counter QR Code Scan Payments Batch',
    type: 'Debit',
    inflow: 48500,
    outflow: 0,
    runningBalance: 80500,
    category: 'MFS Sales',
    paymentMode: 'bKash Merchant QR',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-403',
    accountId: 'acc-4',
    date: '2026-10-03',
    referenceNo: 'MFS-FEE-02',
    description: 'Merchant Gateway Platform Fee & Cash-Out Settlement',
    type: 'Credit',
    inflow: 0,
    outflow: 12000,
    runningBalance: 68500,
    category: 'Settlement & Fee',
    paymentMode: 'Auto Settlement',
    recordedBy: 'Forhad',
    reconciled: true,
  },

  // acc-5: Nagad Business Wallet (34,200)
  {
    id: 'ldg-501',
    accountId: 'acc-5',
    date: '2026-10-01',
    referenceNo: 'NGD-OP-01',
    description: 'Opening Nagad Business Wallet Balance',
    type: 'Debit',
    inflow: 18000,
    outflow: 0,
    runningBalance: 18000,
    category: 'Opening Balance',
    paymentMode: 'Nagad Wallet',
    recordedBy: 'Forhad',
    reconciled: true,
  },
  {
    id: 'ldg-502',
    accountId: 'acc-5',
    date: '2026-10-03',
    referenceNo: 'NGD-TX-9914',
    description: 'Customer Direct Mobile Payment for Accessories & Cable',
    type: 'Debit',
    inflow: 16200,
    outflow: 0,
    runningBalance: 34200,
    category: 'MFS Sales',
    paymentMode: 'Nagad Wallet',
    recordedBy: 'Forhad',
    reconciled: true,
  },
];

interface AccountsSetupViewProps {
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const AccountsSetupView: React.FC<AccountsSetupViewProps> = ({
  activeSubItem = '6.1',
  onSelectSubItem,
}) => {
  // Sub-tabs 6.1 to 6.8
  const [currentAccTab, setCurrentAccTab] = useState<string>(activeSubItem || '6.1');

  useEffect(() => {
    if (activeSubItem) {
      if (activeSubItem.startsWith('6.2')) setCurrentAccTab('6.2');
      else if (activeSubItem.startsWith('6.3')) setCurrentAccTab('6.3');
      else if (activeSubItem.startsWith('6.4')) setCurrentAccTab('6.4');
      else setCurrentAccTab(activeSubItem);
    }
  }, [activeSubItem]);

  // Load Accounts with localStorage persistence
  const [accounts, setAccounts] = useState<AccountRecord[]>(() => {
    const saved = localStorage.getItem('nextgen_accounts_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
    return INITIAL_ACCOUNTS;
  });

  // Load Ledger Entries with localStorage persistence
  const [ledgerEntries, setLedgerEntries] = useState<AccountLedgerEntry[]>(() => {
    const saved = localStorage.getItem('nextgen_accounts_ledger');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse ledger entries', e);
      }
    }
    return INITIAL_LEDGER_ENTRIES;
  });

  // Active view tab: 'overview' (cards) vs 'ledger' (detailed ledger records)
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1');

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // New Account Form State
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'Cash' | 'Bank' | 'MFS'>('Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [initialBalance, setInitialBalance] = useState(10000);

  // New Ledger Entry Form State
  const [txType, setTxType] = useState<'Debit' | 'Credit'>('Debit');
  const [txAmount, setTxAmount] = useState<number>(5000);
  const [txReference, setTxReference] = useState<string>(`VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`);
  const [txDescription, setTxDescription] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('Sales Collection');
  const [txPaymentMode, setTxPaymentMode] = useState<string>('Bank Transfer');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Search & Filter State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'All' | 'Debit' | 'Credit'>('All');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nextgen_accounts_list', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('nextgen_accounts_ledger', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  // Selected Account Record
  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Filtered Ledger Entries for current account
  const currentAccountLedgers = ledgerEntries
    .filter((l) => l.accountId === currentAccount.id)
    .filter((l) => {
      const matchesSearch =
        l.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        l.referenceNo.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        l.category.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesType =
        ledgerTypeFilter === 'All' || l.type === ledgerTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Statistics for Current Account
  const totalInflow = ledgerEntries
    .filter((l) => l.accountId === currentAccount.id)
    .reduce((sum, l) => sum + l.inflow, 0);

  const totalOutflow = ledgerEntries
    .filter((l) => l.accountId === currentAccount.id)
    .reduce((sum, l) => sum + l.outflow, 0);

  const totalFunds = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Switch to Ledger view for an account
  const handleOpenAccountLedger = (accId: string) => {
    playClickSound();
    setSelectedAccountId(accId);
    setActiveTab('ledger');
  };

  // Save New Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playCashDrawerDing();

    const newAccountId = `acc-${Date.now()}`;
    const newAcc: AccountRecord = {
      id: newAccountId,
      name: name.trim(),
      accountType,
      accountNumber: accountNumber.trim() || `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      branch: branch.trim() || undefined,
      balance: initialBalance,
    };

    // Auto-create initial opening balance ledger entry
    const initialLedger: AccountLedgerEntry = {
      id: `ldg-${Date.now()}`,
      accountId: newAccountId,
      date: new Date().toISOString().split('T')[0],
      referenceNo: `INIT-${Math.floor(1000 + Math.random() * 9000)}`,
      description: `Opening Balance for ${name.trim()}`,
      type: 'Debit',
      inflow: initialBalance,
      outflow: 0,
      runningBalance: initialBalance,
      category: 'Opening Balance',
      paymentMode: accountType === 'Cash' ? 'Cash Drawer' : accountType === 'MFS' ? 'Mobile Wallet' : 'Bank Deposit',
      recordedBy: 'Forhad',
      reconciled: true,
    };

    setAccounts([...accounts, newAcc]);
    setLedgerEntries([...ledgerEntries, initialLedger]);
    setIsAccountModalOpen(false);
    setSelectedAccountId(newAccountId);
    setActiveTab('ledger');

    // Reset Form
    setName('');
    setAccountNumber('');
    setBranch('');
    setInitialBalance(10000);
  };

  // Save New Ledger Entry
  const handleSaveLedgerEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim() || txAmount <= 0) return;
    playBarcodeBeep();

    const inflow = txType === 'Debit' ? txAmount : 0;
    const outflow = txType === 'Credit' ? txAmount : 0;
    const newBalance = currentAccount.balance + inflow - outflow;

    const newLedger: AccountLedgerEntry = {
      id: `ldg-${Date.now()}`,
      accountId: currentAccount.id,
      date: txDate,
      referenceNo: txReference.trim() || `VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`,
      description: txDescription.trim(),
      type: txType,
      inflow,
      outflow,
      runningBalance: newBalance,
      category: txCategory,
      paymentMode: txPaymentMode,
      recordedBy: 'Forhad',
      reconciled: true,
    };

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentAccount.id ? { ...acc, balance: newBalance } : acc
      )
    );

    setLedgerEntries([...ledgerEntries, newLedger]);
    setIsTransactionModalOpen(false);

    // Reset Form
    setTxDescription('');
    setTxAmount(5000);
    setTxReference(`VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ERP</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">Accounts Setup</span>
          </div>
          {/* Target Element: h1 > span */}
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-600 shrink-0" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent font-extrabold tracking-tight drop-shadow-2xs">
              Chart of Accounts &amp; Detailed Ledger Records
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentAccTab === '6.1' && activeTab === 'ledger' && (
            <button
              onClick={() => {
                playClickSound();
                setIsTransactionModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Ledger Entry</span>
            </button>
          )}

          <button
            onClick={() => {
              playClickSound();
              setIsAccountModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Subtabs Bar (6.1 to 6.8) */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '6.1', label: '6.1 Accounts Dashboard', badge: 'Overview' },
          { id: '6.2', label: '6.2 Cash & Bank', badge: `${accounts.length} Accs` },
          { id: '6.3', label: '6.3 Receive Payment', badge: 'Cash In' },
          { id: '6.4', label: '6.4 Make Payment', badge: 'Payout' },
          { id: '6.5', label: '6.5 Income & Expense', badge: 'Vouchers' },
          { id: '6.6', label: '6.6 Journal / Ledger', badge: 'Double Entry' },
          { id: '6.7', label: '6.7 Accounts Receivable / Payable', badge: 'AR/AP' },
          { id: '6.8', label: '6.8 Financial Reports', badge: 'P&L / BS' },
        ].map((tab) => {
          const isActive = currentAccTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setCurrentAccTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs'
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

      {currentAccTab === '6.3' ? (
        <ReceivePaymentTab />
      ) : currentAccTab === '6.4' ? (
        <MakePaymentTab />
      ) : currentAccTab === '6.5' ? (
        <FinanceRecordView />
      ) : currentAccTab === '6.6' ? (
        <JournalLedgerTab />
      ) : currentAccTab === '6.7' ? (
        <ReceivablePayableTab />
      ) : currentAccTab === '6.8' ? (
        <FinancialReportsTab />
      ) : currentAccTab === '6.2' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs shrink-0">
            <span className="font-bold text-white">6.2 Cash, Bank &amp; Cheque Management</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('overview');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  activeTab !== ('cheque' as any)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cash &amp; Bank Accounts
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('cheque' as any);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === ('cheque' as any)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cheque Management
              </button>
            </div>
          </div>
          {activeTab === ('cheque' as any) ? (
            <ChequeManagementTab />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => {
                  const accLedgers = ledgerEntries.filter((l) => l.accountId === acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        handleOpenAccountLedger(acc.id);
                        setCurrentAccTab('6.1');
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              acc.accountType === 'Bank'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : acc.accountType === 'MFS'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {acc.accountType} Account
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {accLedgers.length} Records
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {acc.name}
                        </h3>
                        <div className="font-mono text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>{acc.accountNumber}</span>
                        </div>
                        {acc.branch && (
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{acc.branch}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Balance</span>
                          <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(acc.balance)}
                          </span>
                        </div>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                          View Ledger ›
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Total Funds Liquidity Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700 text-white p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-amber-100">
                Consolidated Liquidity
              </span>
              <span className="text-xs text-amber-200">
                {accounts.length} Active Accounts with Individual Ledger Books
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-mono font-bold mt-1">
              {formatCurrency(totalFunds)}
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              Real-time balance consolidated across Cash Registers, Bank Accounts &amp; MFS Wallets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs border border-white/20">
              <span className="text-[10px] text-amber-200 font-semibold uppercase block">
                Total Ledger Entries
              </span>
              <span className="text-lg font-mono font-bold">{ledgerEntries.length} Recorded</span>
            </div>
          </div>
        </div>

        {activeTab === 'overview' ? (
          /* ACCOUNTS OVERVIEW CARDS */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-600" />
                <span>Financial Accounts &amp; Quick Access</span>
              </h2>
              <span className="text-xs text-slate-500">
                Click any account card or "View Details Ledger" to inspect full transaction history
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const accLedgers = ledgerEntries.filter((l) => l.accountId === acc.id);
                const lastEntry = accLedgers[accLedgers.length - 1];

                return (
                  <div
                    key={acc.id}
                    onClick={() => handleOpenAccountLedger(acc.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            acc.accountType === 'Bank'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : acc.accountType === 'MFS'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {acc.accountType} Account
                        </span>

                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {accLedgers.length} Transactions
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {acc.name}
                      </h3>
                      <div className="font-mono text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{acc.accountNumber}</span>
                      </div>
                      {acc.branch && (
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{acc.branch}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Current Ledger Balance
                          </span>
                          <span className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">
                            {formatCurrency(acc.balance)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAccountLedger(acc.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1 transition-colors"
                        >
                          <span>View Ledger</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {lastEntry && (
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                          <span>Last Activity:</span>
                          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                            {lastEntry.date} · {lastEntry.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* DETAILED ACCOUNT LEDGER VIEW */
          <div className="space-y-4">
            {/* Account Selector Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Selected Account Ledger:
                  </span>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumber}) — Balance: {formatCurrency(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Details Pills */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                      Total Inflow (Credits)
                    </span>
                    <span className="font-mono font-bold">+{formatCurrency(totalInflow)}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                      Total Outflow (Debits)
                    </span>
                    <span className="font-mono font-bold">-{formatCurrency(totalOutflow)}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                      Current Book Balance
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {formatCurrency(currentAccount.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search ledger by reference, particulars, or category..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                {(['All', 'Debit', 'Credit'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLedgerTypeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      ledgerTypeFilter === filter
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'All' ? 'All Transactions' : filter === 'Debit' ? 'Inflows (In)' : 'Outflows (Out)'}
                  </button>
                ))}
              </div>
            </div>

            {/* LEDGER TRANSACTIONS TABLE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Voucher / Ref #</th>
                      <th className="py-3.5 px-4">Particulars / Description</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right text-emerald-600">Inflow (+ ৳)</th>
                      <th className="py-3.5 px-4 text-right text-rose-600">Outflow (- ৳)</th>
                      <th className="py-3.5 px-4 text-right font-bold">Running Balance</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {currentAccountLedgers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No ledger records found matching query.
                        </td>
                      </tr>
                    ) : (
                      currentAccountLedgers.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-amber-50/40 dark:hover:bg-slate-850/60 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                            {row.referenceNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {row.description}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Mode: {row.paymentMode} · By: {row.recordedBy}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {row.inflow > 0 ? `+${formatCurrency(row.inflow)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {row.outflow > 0 ? `-${formatCurrency(row.outflow)}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {formatCurrency(row.runningBalance)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Reconciled</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* NEW ACCOUNT MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-200" />
                <span>Add Financial / Bank Account</span>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Account Name / Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eastern Bank Ltd. or Petty Cash Drawer"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                  >
                    <option value="Bank">Bank Account</option>
                    <option value="MFS">Mobile Wallet / MFS</option>
                    <option value="Cash">Cash Drawer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Account / Wallet #
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="123456789..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Branch Name (Optional)
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Banani Branch, Dhaka"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Opening Ledger Balance (৳) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Automatically initializes this account's Ledger Book with an Opening Balance entry.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 shadow-xs cursor-pointer"
                >
                  Save Account &amp; Create Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW LEDGER ENTRY MODAL */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-200" />
                <span>Post Ledger Entry to {currentAccount.name}</span>
              </div>
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLedgerEntry} className="p-5 space-y-3.5 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                Posting transaction to <strong>{currentAccount.name}</strong> ({currentAccount.accountNumber}). Current balance: <strong>{formatCurrency(currentAccount.balance)}</strong>.
              </div>

              {/* Type Switcher: Debit (Inflow) vs Credit (Outflow) */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Transaction Nature *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('Debit');
                      setTxCategory('Deposit / Inflow');
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer ${
                      txType === 'Debit'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                    <span>Inflow (+ Deposit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxType('Credit');
                      setTxCategory('Payment / Outflow');
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer ${
                      txType === 'Credit'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-300" />
                    <span>Outflow (- Withdrawal)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Voucher / Ref # *
                  </label>
                  <input
                    type="text"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Particulars / Description *
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Sales deposit, vendor payment, safe replenishment"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    <option value="Sales Collection">Sales Collection</option>
                    <option value="Vendor Payment">Vendor Payment</option>
                    <option value="Internal Transfer">Internal Transfer</option>
                    <option value="Utilities & Bills">Utilities &amp; Bills</option>
                    <option value="Staff Advance Payout">Staff Advance Payout</option>
                    <option value="Customer Refund">Customer Refund</option>
                    <option value="Bank Fee / Charge">Bank Fee / Charge</option>
                    <option value="Deposit / Inflow">General Deposit</option>
                    <option value="Payment / Outflow">General Outflow</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Post Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
