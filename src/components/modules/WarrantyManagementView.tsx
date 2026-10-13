import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  FileCheck,
  Calendar,
  Barcode,
  Settings,
  Plus,
  Wrench,
  DollarSign,
  Receipt,
  X,
  Check,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  WarrantyPolicySettings,
  DEFAULT_WARRANTY_POLICY,
  WarrantyRecord,
  WarrantyClaimLog,
} from '../../types/warranty';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';

export interface WarrantyManagementViewProps {
  policy?: WarrantyPolicySettings;
  onUpdatePolicy?: (newPolicy: WarrantyPolicySettings) => void;
  onOpenPolicyModal?: () => void;
  onAddExpenseRecord?: (expense: {
    description: string;
    category: string;
    amount: number;
    paymentMode: string;
    date: string;
    recordedBy: string;
  }) => void;
}

const INITIAL_WARRANTIES: WarrantyRecord[] = [
  {
    id: 'war-1',
    serialNumber: 'SN-TP-8921',
    productName: 'ThinkPad T14 Gen 2 (AMD Ryzen 5)',
    sku: 'LPT-001',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01711223344',
    invoiceNumber: 'INV-2026-9041',
    purchaseDate: '2026-09-25', // 9 days ago (Within 30-Day Guarantee: Free components + added in expense)
    guaranteeDays: 30,
    serviceWarrantyYears: 5,
    status: 'Active',
    claimCount: 0,
    claimsHistory: [],
  },
  {
    id: 'war-2',
    serialNumber: 'SN-DL-4301',
    productName: 'Dell Latitude 5420 (Core i5 11th Gen)',
    sku: 'LPT-002',
    customerName: 'Nusrat Jahan',
    customerPhone: '01899887766',
    invoiceNumber: 'INV-2026-8812',
    purchaseDate: '2026-06-15', // ~110 days ago (>30 days, within 5 years: Free service labor, components paid by customer)
    guaranteeDays: 30,
    serviceWarrantyYears: 5,
    status: 'Active',
    claimCount: 1,
    claimsHistory: [
      {
        id: 'clm-1',
        warrantyId: 'war-2',
        claimDate: '2026-08-20',
        daysSincePurchase: 66,
        componentName: 'Keyboard Backlight Module',
        componentCost: 2200,
        repairLaborFee: 0,
        isComponentFreeForCustomer: false,
        isRepairFeeFreeForCustomer: true,
        addedToCompanyExpense: false,
        customerPayable: 2200,
        companyExpenseAmount: 0,
        technicianNotes: 'Labor free under 5Y warranty, customer paid ৳2,200 for keyboard module.',
        status: 'Resolved',
      },
    ],
  },
  {
    id: 'war-3',
    serialNumber: 'SN-MS-1088',
    productName: 'Surface Pro 7 (Core i7 / 16GB)',
    sku: 'LPT-003',
    customerName: 'Farhan Kabir',
    customerPhone: '01911223344',
    invoiceNumber: 'INV-2026-9120',
    purchaseDate: '2026-09-28', // 6 days ago (Within 30-Day Guarantee!)
    guaranteeDays: 30,
    serviceWarrantyYears: 5,
    status: 'Active',
    claimCount: 0,
    claimsHistory: [],
  },
  {
    id: 'war-4',
    serialNumber: 'SN-AP-9902',
    productName: 'MacBook Air M1 (256GB SSD)',
    sku: 'LPT-004',
    customerName: 'Rahim Chowdhury',
    customerPhone: '01755667788',
    invoiceNumber: 'INV-2026-7734',
    purchaseDate: '2021-08-10', // > 5 years ago (Expired)
    guaranteeDays: 30,
    serviceWarrantyYears: 5,
    status: 'Expired',
    claimCount: 0,
    claimsHistory: [],
  },
];

export const WarrantyManagementView: React.FC<WarrantyManagementViewProps> = ({
  policy = DEFAULT_WARRANTY_POLICY,
  onUpdatePolicy,
  onOpenPolicyModal,
  onAddExpenseRecord,
}) => {
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(() => {
    const saved = localStorage.getItem('nextgen_warranties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_WARRANTIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Claim Modal State
  const [activeClaimRecord, setActiveClaimRecord] = useState<WarrantyRecord | null>(null);
  const [componentName, setComponentName] = useState('');
  const [componentCost, setComponentCost] = useState(2500);
  const [laborFee, setLaborFee] = useState(800);
  const [customNotes, setCustomNotes] = useState('');
  const [manualOverrideComponentFree, setManualOverrideComponentFree] = useState<boolean | null>(null);

  // Edit / Add Record Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WarrantyRecord | null>(null);
  const [recordForm, setRecordForm] = useState({
    serialNumber: '',
    productName: '',
    sku: '',
    customerName: '',
    customerPhone: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    guaranteeDays: policy.guaranteeDays,
    serviceWarrantyYears: policy.serviceWarrantyYears,
  });

  // History Drawer State
  const [historyDrawerRecord, setHistoryDrawerRecord] = useState<WarrantyRecord | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('nextgen_warranties', JSON.stringify(warranties));
  }, [warranties]);

  // Calculate days since purchase from reference date (today: 2026-10-04)
  const calculateDaysSince = (purchaseDateStr: string) => {
    const today = new Date('2026-10-04').getTime();
    const pDate = new Date(purchaseDateStr).getTime();
    const diffTime = today - pDate;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleOpenClaimModal = (record: WarrantyRecord) => {
    playClickSound();
    setActiveClaimRecord(record);
    setComponentName('Display Connector Ribbon / Cooling Fan');
    setComponentCost(1800);
    setLaborFee(500);
    setCustomNotes('Hardware defect diagnosed during inspection.');
    setManualOverrideComponentFree(null);
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimRecord) return;
    playBarcodeBeep();

    const days = calculateDaysSince(activeClaimRecord.purchaseDate);
    const guaranteeLimit = activeClaimRecord.guaranteeDays || policy.guaranteeDays;
    const serviceYearsLimit = activeClaimRecord.serviceWarrantyYears || policy.serviceWarrantyYears;
    const serviceDaysLimit = serviceYearsLimit * 365;

    // Policy rules:
    // 1) 30 days guarantee: all components are free for customer and added in expense
    // 2) 5 years service warranty: no repair fee, components cost paid by customer
    const isWithinGuarantee = days <= guaranteeLimit;
    const isWithinServiceWarranty = days <= serviceDaysLimit;

    const isCompFree =
      manualOverrideComponentFree !== null
        ? manualOverrideComponentFree
        : isWithinGuarantee && policy.isGuaranteeComponentsFree;

    const isRepairFree = isWithinServiceWarranty && policy.isServiceLaborFree;

    const customerPayable = (isCompFree ? 0 : componentCost) + (isRepairFree ? 0 : laborFee);
    const companyExpense =
      isCompFree && policy.isGuaranteeAddToExpense ? componentCost : 0;

    const newClaim: WarrantyClaimLog = {
      id: `clm-${Date.now()}`,
      warrantyId: activeClaimRecord.id,
      claimDate: '2026-10-04',
      daysSincePurchase: days,
      componentName,
      componentCost,
      repairLaborFee: isRepairFree ? 0 : laborFee,
      isComponentFreeForCustomer: isCompFree,
      isRepairFeeFreeForCustomer: isRepairFree,
      addedToCompanyExpense: companyExpense > 0,
      customerPayable,
      companyExpenseAmount: companyExpense,
      technicianNotes: customNotes,
      status: 'Approved',
    };

    // Auto-record to Finance Expense
    if (companyExpense > 0) {
      const expenseObj = {
        description: `Warranty ${policy.guaranteeDays}D Guarantee Free Parts: ${componentName} for S/N ${activeClaimRecord.serialNumber} (${activeClaimRecord.customerName})`,
        category: policy.guaranteeExpenseCategory || 'Warranty & Replacement Expense',
        amount: companyExpense,
        paymentMode: 'Cash Drawer',
        date: '2026-10-04',
        recordedBy: 'Forhad',
      };

      if (onAddExpenseRecord) {
        onAddExpenseRecord(expenseObj);
      }

      // Also persist to localStorage nextgen_finance_records so Finance Record view sees it immediately
      try {
        const existingRaw = localStorage.getItem('nextgen_finance_records');
        const existingFinance = existingRaw ? JSON.parse(existingRaw) : [];
        const newFinanceTx = {
          id: `fn-${Date.now()}`,
          type: 'Expense',
          description: expenseObj.description,
          category: expenseObj.category,
          amount: expenseObj.amount,
          paymentMode: expenseObj.paymentMode,
          date: expenseObj.date,
          recordedBy: expenseObj.recordedBy,
        };
        localStorage.setItem(
          'nextgen_finance_records',
          JSON.stringify([newFinanceTx, ...existingFinance])
        );
      } catch (err) {
        console.error('Failed to sync to finance records', err);
      }
    }

    setWarranties((prev) =>
      prev.map((w) => {
        if (w.id === activeClaimRecord.id) {
          return {
            ...w,
            status: 'Claimed',
            claimCount: w.claimCount + 1,
            claimsHistory: [newClaim, ...(w.claimsHistory || [])],
          };
        }
        return w;
      })
    );

    setActiveClaimRecord(null);
    playCashDrawerDing();
  };

  const handleOpenAddRecord = () => {
    playClickSound();
    setEditingRecord(null);
    setRecordForm({
      serialNumber: `SN-POS-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: '',
      sku: 'PRD-001',
      customerName: '',
      customerPhone: '',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      guaranteeDays: policy.guaranteeDays,
      serviceWarrantyYears: policy.serviceWarrantyYears,
    });
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecord = (record: WarrantyRecord) => {
    playClickSound();
    setEditingRecord(record);
    setRecordForm({
      serialNumber: record.serialNumber,
      productName: record.productName,
      sku: record.sku,
      customerName: record.customerName,
      customerPhone: record.customerPhone || '',
      invoiceNumber: record.invoiceNumber,
      purchaseDate: record.purchaseDate,
      guaranteeDays: record.guaranteeDays || policy.guaranteeDays,
      serviceWarrantyYears: record.serviceWarrantyYears || policy.serviceWarrantyYears,
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.serialNumber || !recordForm.productName || !recordForm.customerName) return;

    playClickSound();
    if (editingRecord) {
      setWarranties((prev) =>
        prev.map((w) =>
          w.id === editingRecord.id
            ? {
                ...w,
                ...recordForm,
              }
            : w
        )
      );
    } else {
      const newRec: WarrantyRecord = {
        id: `war-${Date.now()}`,
        ...recordForm,
        status: 'Active',
        claimCount: 0,
        claimsHistory: [],
      };
      setWarranties((prev) => [newRec, ...prev]);
    }
    setIsRecordModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to remove this warranty registration?')) {
      playClickSound();
      setWarranties((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const filtered = warranties.filter((w) => {
    const matchesStatus = selectedStatus === 'All' || w.status === selectedStatus;
    const matchesSearch =
      w.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Daily Process</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              4. Warranty & Guarantee Policy
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Warranty & Guarantee Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Policy Options Button */}
          <button
            onClick={onOpenPolicyModal}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Edit Warranty & Guarantee Policy Options"
          >
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Edit Policy Rules: {policy.guaranteeDays}D Free / {policy.serviceWarrantyYears}Y Service ⚙️</span>
          </button>

          {/* Add New Registration Button */}
          <button
            onClick={handleOpenAddRecord}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Warranty</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* Policy Highlights Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-emerald-600/40 shadow-md space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Enforced Policy
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  {policy.guaranteeDays} Days Guarantee · {policy.serviceWarrantyYears} Years Service
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                {policy.guaranteeDays}-Day Replacement Guarantee + {policy.serviceWarrantyYears}-Year Free Service Warranty
              </h2>
            </div>
            <button
              onClick={onOpenPolicyModal}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Change Options</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Rule 1: 30-Day Guarantee */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-500/40 font-mono">
                {policy.guaranteeDays}D
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-emerald-300">
                    {policy.guaranteeDays}-Day Guarantee (All Components Free)
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 text-[9px] font-bold">
                    Added to Expense
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Within <strong>{policy.guaranteeDays} days</strong> of purchase, all replacement components are <strong>100% Free</strong> for the customer. The component replacement cost is automatically <strong>added to Company Expenses</strong> ({policy.guaranteeExpenseCategory}).
                </p>
              </div>
            </div>

            {/* Rule 2: 5-Year Service Warranty */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-indigo-500/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs border border-indigo-500/40 font-mono">
                {policy.serviceWarrantyYears}Y
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-indigo-300">
                    {policy.serviceWarrantyYears}-Year Service Warranty (Labor Free)
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 text-[9px] font-bold">
                    Parts Paid
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  For <strong>{policy.serviceWarrantyYears} years</strong> from purchase date: <strong>No repair fee (0 ৳ Labor)</strong>. Replacement parts and hardware component costs will be paid by the customer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan / Search Serial Number (S/N), Invoice #, or Customer..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
              {['All', 'Active', 'Claimed', 'Expired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warranty Records Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Serial & Product</th>
                  <th className="py-3 px-4">Customer & Invoice</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Days Elapsed</th>
                  <th className="py-3 px-4">Policy Coverage Status</th>
                  <th className="py-3 px-4 text-center">Claims History</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No warranty records matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => {
                    const daysElapsed = calculateDaysSince(w.purchaseDate);
                    const guaranteeDaysLimit = w.guaranteeDays || policy.guaranteeDays;
                    const serviceDaysLimit = (w.serviceWarrantyYears || policy.serviceWarrantyYears) * 365;
                    const isUnderGuarantee = daysElapsed <= guaranteeDaysLimit;
                    const isUnderService = daysElapsed <= serviceDaysLimit;

                    return (
                      <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                        {/* Serial & Product */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            <span>{w.serialNumber}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {w.productName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{w.sku}</div>
                        </td>

                        {/* Customer & Invoice */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{w.customerName}</div>
                          <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{w.invoiceNumber}</div>
                          {w.customerPhone && <div className="text-[10px] text-slate-400">{w.customerPhone}</div>}
                        </td>

                        {/* Purchase Date */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                          {w.purchaseDate}
                        </td>

                        {/* Days Elapsed */}
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={daysElapsed <= guaranteeDaysLimit ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}>
                            {daysElapsed} days
                          </span>
                        </td>

                        {/* Policy Coverage Status */}
                        <td className="py-3 px-4">
                          {isUnderGuarantee ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>{guaranteeDaysLimit}D Guarantee (Free Parts + Labor)</span>
                            </div>
                          ) : isUnderService ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                              <Wrench className="w-3 h-3 text-indigo-600" />
                              <span>{w.serviceWarrantyYears || policy.serviceWarrantyYears}Y Free Service (Parts Paid)</span>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                              Expired (&gt;{w.serviceWarrantyYears || policy.serviceWarrantyYears}Y)
                            </span>
                          )}
                        </td>

                        {/* Claims History */}
                        <td className="py-3 px-4 text-center">
                          {w.claimsHistory && w.claimsHistory.length > 0 ? (
                            <button
                              onClick={() => setHistoryDrawerRecord(w)}
                              className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 cursor-pointer"
                              title="View claim history log"
                            >
                              {w.claimsHistory.length} Claim{w.claimsHistory.length > 1 ? 's' : ''} 👁️
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0 Claims</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenClaimModal(w)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                              title="Process a component replacement or service claim"
                            >
                              Claim
                            </button>
                            <button
                              onClick={() => handleOpenEditRecord(w)}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                              title="Edit registration and policy duration"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(w.id)}
                              className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CLAIM PROCESSING MODAL */}
      {activeClaimRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Process Warranty Claim & Component Replacement</h3>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  S/N: {activeClaimRecord.serialNumber} · {activeClaimRecord.productName}
                </p>
              </div>
              <button
                onClick={() => setActiveClaimRecord(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClaim} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Dynamic Policy Evaluation Banner */}
              {(() => {
                const days = calculateDaysSince(activeClaimRecord.purchaseDate);
                const isUnderGuarantee = days <= (activeClaimRecord.guaranteeDays || policy.guaranteeDays);
                const isUnderService =
                  days <= (activeClaimRecord.serviceWarrantyYears || policy.serviceWarrantyYears) * 365;

                return (
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isUnderGuarantee
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : isUnderService
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {isUnderGuarantee
                          ? `🎉 ${activeClaimRecord.guaranteeDays || policy.guaranteeDays}-Day Guarantee Active`
                          : isUnderService
                          ? `🛠️ ${activeClaimRecord.serviceWarrantyYears || policy.serviceWarrantyYears}-Year Free Service Active`
                          : '⏳ Expired Warranty'}
                      </span>
                      <span className="font-mono text-xs font-bold">{days} Days Elapsed</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {isUnderGuarantee
                        ? `Customer receives FREE components & repair. The ৳${componentCost} component replacement cost will be automatically charged to Company Expenses.`
                        : isUnderService
                        ? `No repair labor fee (0 ৳ Labor). The customer pays ৳${componentCost} for the replacement hardware component.`
                        : `Out of warranty. Customer pays both labor fee and component costs.`}
                    </p>
                  </div>
                );
              })()}

              {/* Component & Cost Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Defective Component / Part *
                  </label>
                  <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="e.g. Keyboard, Display Panel, RAM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Component Cost (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={componentCost}
                    onChange={(e) => setComponentCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Technician Notes / Defect Details
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Reason for claim, diagnostic tests performed..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              {/* Manual Override Controls */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Override Options:
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="compOverride"
                      checked={manualOverrideComponentFree === null}
                      onChange={() => setManualOverrideComponentFree(null)}
                    />
                    <span>Auto (By Policy Rules)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="compOverride"
                      checked={manualOverrideComponentFree === true}
                      onChange={() => setManualOverrideComponentFree(true)}
                    />
                    <span className="text-emerald-600 font-semibold">Force Free Components</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="compOverride"
                      checked={manualOverrideComponentFree === false}
                      onChange={() => setManualOverrideComponentFree(false)}
                    />
                    <span className="text-amber-600 font-semibold">Customer Pays Components</span>
                  </label>
                </div>
              </div>

              {/* Billing Summary Box */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1.5 text-xs">
                {(() => {
                  const days = calculateDaysSince(activeClaimRecord.purchaseDate);
                  const isUnderGuarantee = days <= (activeClaimRecord.guaranteeDays || policy.guaranteeDays);
                  const isUnderService =
                    days <= (activeClaimRecord.serviceWarrantyYears || policy.serviceWarrantyYears) * 365;

                  const isCompFree =
                    manualOverrideComponentFree !== null
                      ? manualOverrideComponentFree
                      : isUnderGuarantee && policy.isGuaranteeComponentsFree;
                  const isRepairFree = isUnderService && policy.isServiceLaborFree;

                  const custPay = (isCompFree ? 0 : componentCost) + (isRepairFree ? 0 : laborFee);
                  const expAmount = isCompFree && policy.isGuaranteeAddToExpense ? componentCost : 0;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer Total Payable:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(custPay)} {custPay === 0 ? '(100% Free)' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Added to Company Expenses:</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(expAmount)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveClaimRecord(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Claim & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT WARRANTY REGISTRATION MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingRecord ? 'Edit Warranty Registration & Terms' : 'Register New Serial Warranty'}
                </h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Serial Number (S/N) *
                  </label>
                  <input
                    type="text"
                    value={recordForm.serialNumber}
                    onChange={(e) => setRecordForm({ ...recordForm, serialNumber: e.target.value })}
                    placeholder="e.g. SN-TP-8921"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={recordForm.productName}
                    onChange={(e) => setRecordForm({ ...recordForm, productName: e.target.value })}
                    placeholder="e.g. ThinkPad T14 Gen 2"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={recordForm.customerName}
                    onChange={(e) => setRecordForm({ ...recordForm, customerName: e.target.value })}
                    placeholder="Customer Name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={recordForm.customerPhone}
                    onChange={(e) => setRecordForm({ ...recordForm, customerPhone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={recordForm.invoiceNumber}
                    onChange={(e) => setRecordForm({ ...recordForm, invoiceNumber: e.target.value })}
                    placeholder="INV-2026-xxxx"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={recordForm.purchaseDate}
                    onChange={(e) => setRecordForm({ ...recordForm, purchaseDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Guarantee Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={recordForm.guaranteeDays}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, guaranteeDays: Number(e.target.value) || 30 })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Service Warranty (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={recordForm.serviceWarrantyYears}
                    onChange={(e) =>
                      setRecordForm({
                        ...recordForm,
                        serviceWarrantyYears: Number(e.target.value) || 5,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingRecord ? 'Update Registration' : 'Save Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIMS HISTORY DRAWER */}
      {historyDrawerRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Claims History
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    S/N: {historyDrawerRecord.serialNumber} · {historyDrawerRecord.customerName}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryDrawerRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                {(!historyDrawerRecord.claimsHistory || historyDrawerRecord.claimsHistory.length === 0) ? (
                  <p className="text-slate-400 py-6 text-center">No past claims logged.</p>
                ) : (
                  historyDrawerRecord.claimsHistory.map((clm) => (
                    <div
                      key={clm.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {clm.componentName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{clm.claimDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Component Cost:</span>
                        <span className="font-mono font-semibold">{formatCurrency(clm.componentCost)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Customer Paid:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(clm.customerPayable)}
                        </span>
                      </div>
                      {clm.companyExpenseAmount > 0 && (
                        <div className="flex justify-between text-[11px] text-rose-600 font-bold">
                          <span>Company Expense:</span>
                          <span className="font-mono">{formatCurrency(clm.companyExpenseAmount)}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                        {clm.technicianNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setHistoryDrawerRecord(null)}
              className="w-full mt-4 py-2 border rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
