import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Receipt,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  RotateCcw,
  Truck,
  Package,
  CheckCircle2,
  Download,
  X,
  Building,
  Phone,
  Wallet,
  Sliders,
  Store,
  FileText,
} from 'lucide-react';
import {
  INITIAL_PURCHASE_BILLS,
  INITIAL_PURCHASE_RETURNS,
  INITIAL_GOODS_RECEIVED,
  PurchaseBillRecord,
  PurchaseReturnRecord,
  GoodsReceivedRecord,
} from '../../data/mockErpData';
import { Supplier, PurchaseOrder } from '../../types/purchase';
import { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface PurchaseManagementViewProps {
  onOpenDirectPurchase: () => void;
  onOpenPOBuilder: () => void;
  suppliers?: Supplier[];
  products?: Product[];
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
  purchaseOrders?: PurchaseOrder[];
}

export const PurchaseManagementView: React.FC<PurchaseManagementViewProps> = ({
  onOpenDirectPurchase,
  onOpenPOBuilder,
  suppliers = [],
  products = [],
  activeSubItem = '2.2',
  onSelectSubItem,
  purchaseOrders = [],
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeSubItem || '2.2');

  useEffect(() => {
    if (activeSubItem) {
      if (activeSubItem === '2.1') {
        // Direct purchase shortcut can either show quick bill or toggle
        setCurrentTab('2.2');
      } else {
        setCurrentTab(activeSubItem);
      }
    }
  }, [activeSubItem]);

  // Bills State
  const [bills, setBills] = useState<PurchaseBillRecord[]>(INITIAL_PURCHASE_BILLS);
  const [billSearch, setBillSearch] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Due'>('All');
  const [viewingBill, setViewingBill] = useState<PurchaseBillRecord | null>(null);
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);

  // New Bill form state
  const [newBillSupplier, setNewBillSupplier] = useState(suppliers[0]?.name || 'Global Tech Distribution Ltd');
  const [newBillSupplierPhone, setNewBillSupplierPhone] = useState('01711-445566');
  const [newBillInvoiceRef, setNewBillInvoiceRef] = useState('GTD-INV-9905');
  const [newBillWarehouse, setNewBillWarehouse] = useState('Main Headquarters & Showroom');
  const [newBillItemName, setNewBillItemName] = useState('Surface Pro 7 (i5, 8GB, 256GB)');
  const [newBillItemSku, setNewBillItemSku] = useState('MS-SP7-02');
  const [newBillQty, setNewBillQty] = useState(5);
  const [newBillUnitCost, setNewBillUnitCost] = useState(28000);
  const [newBillTax, setNewBillTax] = useState(7000);
  const [newBillPaid, setNewBillPaid] = useState(100000);
  const [newBillPaymentMethod, setNewBillPaymentMethod] = useState('Bank Wire (Brac Bank)');

  // Returns State
  const [returns, setReturns] = useState<PurchaseReturnRecord[]>(INITIAL_PURCHASE_RETURNS);
  const [returnSearch, setReturnSearch] = useState('');
  const [viewingReturn, setViewingReturn] = useState<PurchaseReturnRecord | null>(null);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);

  // Goods Received State
  const [grns, setGrns] = useState<GoodsReceivedRecord[]>(INITIAL_GOODS_RECEIVED);
  const [grnSearch, setGrnSearch] = useState('');
  const [viewingGrn, setViewingGrn] = useState<GoodsReceivedRecord | null>(null);
  const [isNewGrnModalOpen, setIsNewGrnModalOpen] = useState(false);

  // Supplier Payables State
  const [supplierList, setSupplierList] = useState<Supplier[]>(() => {
    return suppliers.map((s, idx) => ({
      ...s,
      balance: s.balance !== undefined ? s.balance : idx === 0 ? 225000 : idx === 1 ? 0 : 688800,
    }));
  });
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [paySupplierAmount, setPaySupplierAmount] = useState<number>(50000);
  const [paySupplierAccount, setPaySupplierAccount] = useState<string>('Brac Bank Current Account');
  const [paySupplierNote, setPaySupplierNote] = useState<string>('Vendor invoice partial clearance');

  // Audit Logs State
  const [purchaseLogs] = useState([
    { id: 'pl-1', timestamp: '2026-10-08 16:40', action: 'Goods Received', refNo: 'GRN-2026-0072', party: 'Flora Limited BD', amount: 688800, operator: 'Arif Mahmud', details: '8 ThinkPad T14 units verified and tagged' },
    { id: 'pl-2', timestamp: '2026-10-08 14:15', action: 'Purchase Bill', refNo: 'PB-2026-0021', party: 'Flora Limited BD', amount: 688800, operator: 'Forhad (Admin)', details: 'Bill recorded on Net 30 payment terms' },
    { id: 'pl-3', timestamp: '2026-10-07 11:20', action: 'Supplier Payout', refNo: 'PAY-2026-0182', party: 'Global Tech Distribution Ltd', amount: 150000, operator: 'Forhad (Admin)', details: 'Check clearance via Brac Bank #1501204899' },
    { id: 'pl-4', timestamp: '2026-10-04 18:00', action: 'Purchase Return', refNo: 'PR-2026-0008', party: 'Global Tech Distribution Ltd', amount: 22000, operator: 'Kamrul Hasan', details: '2 defective SSD units returned with Debit Note' },
    { id: 'pl-5', timestamp: '2026-10-02 10:30', action: 'Purchase Bill', refNo: 'PB-2026-0019', party: 'Global Tech Distribution Ltd', amount: 525000, operator: 'Forhad (Admin)', details: 'Shipment batch #29 booked with partial advance' },
  ]);

  // KPIs
  const totalBilled = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalDue = totalBilled - totalPaid;

  // Handlers for Bills
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    const sub = newBillQty * newBillUnitCost;
    const grand = sub + newBillTax;
    const due = Math.max(0, grand - newBillPaid);

    const newRecord: PurchaseBillRecord = {
      id: `pb-${Date.now()}`,
      billNo: `PB-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: newBillSupplier.trim(),
      supplierPhone: newBillSupplierPhone.trim(),
      supplierInvoiceRef: newBillInvoiceRef.trim(),
      warehouse: newBillWarehouse,
      itemsList: [
        {
          name: newBillItemName.trim(),
          sku: newBillItemSku.trim(),
          qty: newBillQty,
          unitCost: newBillUnitCost,
          total: sub,
        },
      ],
      subtotal: sub,
      taxAmount: newBillTax,
      grandTotal: grand,
      paidAmount: newBillPaid,
      dueAmount: due,
      paymentMethod: newBillPaymentMethod,
      status: due === 0 ? 'Paid' : newBillPaid > 0 ? 'Partial' : 'Due',
      createdBy: 'Forhad (Admin)',
      notes: 'Direct supplier purchase bill recorded.',
    };

    setBills([newRecord, ...bills]);
    setIsNewBillModalOpen(false);
  };

  const handleDeleteBill = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this purchase bill?')) {
      setBills(bills.filter((b) => b.id !== id));
      if (viewingBill?.id === id) setViewingBill(null);
    }
  };

  // Handlers for Pay Supplier
  const handleProcessSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || paySupplierAmount <= 0) return;
    playCashDrawerDing();

    const curBal = selectedSupplierForPayment.balance || 0;
    const nextBal = Math.max(0, curBal - paySupplierAmount);

    setSupplierList((prev) =>
      prev.map((s) => (s.id === selectedSupplierForPayment.id ? { ...s, balance: nextBal } : s))
    );

    setSelectedSupplierForPayment(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                2. PURCHASE — ক্রয়
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Vendor Supply Chain
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Procurement, purchase orders, goods receipts &amp; supplier accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenDirectPurchase();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shadow-purple-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>2.1 Direct Purchase Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenPOBuilder();
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>PO Creator</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs Bar (2.2 - 2.7) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '2.2', label: '2.2 Purchase List', badge: `${bills.length} Bills` },
          { id: '2.3', label: '2.3 Purchase Return', badge: 'Vendor Ret' },
          { id: '2.4', label: '2.4 Purchase Order', badge: `${purchaseOrders.length || 2} POs` },
          { id: '2.5', label: '2.5 Goods Received', badge: 'GRN Challan' },
          { id: '2.6', label: '2.6 Supplier Due / Payable', badge: 'Payable ৳' },
          { id: '2.7', label: '2.7 Purchase History', badge: 'Audit Log' },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClickSound();
                setCurrentTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
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

      {/* ======================================================== */}
      {/* SUB-VIEW 2.2: PURCHASE LIST / INVOICES                   */}
      {/* ======================================================== */}
      {currentTab === '2.2' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Purchase Bills</p>
                <p className="text-lg font-black text-white font-mono mt-0.5">{bills.length}</p>
                <p className="text-[10px] text-purple-400 font-medium">Vendor inwards registered</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Billed</p>
                <p className="text-lg font-black text-purple-400 font-mono mt-0.5">{formatCurrency(totalBilled)}</p>
                <p className="text-[10px] text-slate-400 font-medium">VAT inclusive cost</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disbursed &amp; Paid</p>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatCurrency(totalPaid)}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Paid to suppliers</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payables Due</p>
                <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{formatCurrency(totalDue)}</p>
                <p className="text-[10px] text-rose-400 font-medium">Pending vendor dues</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={billSearch}
                onChange={(e) => setBillSearch(e.target.value)}
                placeholder="Search bill #, supplier, phone, item..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                {(['All', 'Paid', 'Partial', 'Due'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBillStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      billStatusFilter === st ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setIsNewBillModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Purchase Bill</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3">Bill Ref</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier / Vendor</th>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3">Items Summary</th>
                  <th className="p-3 text-right">Grand Total</th>
                  <th className="p-3 text-right">Paid ৳</th>
                  <th className="p-3 text-right">Due ৳</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bills
                  .filter((b) => {
                    if (billStatusFilter !== 'All' && b.status !== billStatusFilter) return false;
                    if (billSearch.trim()) {
                      const q = billSearch.toLowerCase();
                      const matchNo = b.billNo.toLowerCase().includes(q);
                      const matchSup = b.supplierName.toLowerCase().includes(q);
                      const matchItem = b.itemsList.some((i) => i.name.toLowerCase().includes(q));
                      if (!matchNo && !matchSup && !matchItem) return false;
                    }
                    return true;
                  })
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-400">{b.billNo}</td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">{b.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{b.supplierName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.supplierPhone}</div>
                      </td>
                      <td className="p-3 text-slate-300">{b.warehouse}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {b.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {formatCurrency(b.grandTotal)}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400">
                        {formatCurrency(b.paidAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {formatCurrency(b.dueAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : b.status === 'Partial'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              playClickSound();
                              setViewingBill(b);
                            }}
                            className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Open bill details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBill(b.id)}
                            className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                            title="Delete bill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2.3: PURCHASE RETURN                            */}
      {/* ======================================================== */}
      {currentTab === '2.3' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={returnSearch}
                onChange={(e) => setReturnSearch(e.target.value)}
                placeholder="Search vendor return #, supplier..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsNewReturnModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Vendor Return</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3">Return #</th>
                  <th className="p-3">Bill Ref</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Items Returned</th>
                  <th className="p-3 text-right">Debit Note Total</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-rose-400">{ret.returnNo}</td>
                    <td className="p-3 font-mono text-blue-400">{ret.billRef}</td>
                    <td className="p-3 font-mono text-slate-300">{ret.date}</td>
                    <td className="p-3 font-bold text-white">{ret.supplierName}</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {ret.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(ret.totalRefund)}
                    </td>
                    <td className="p-3 text-slate-400">{ret.reason}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {ret.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingReturn(ret);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold cursor-pointer"
                      >
                        View Note
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2.4: PURCHASE ORDER (LIST & ACTIONS)            */}
      {/* ======================================================== */}
      {currentTab === '2.4' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-white">Purchase Orders Registry</span>
            <button
              onClick={() => {
                playClickSound();
                onOpenPOBuilder();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { po: 'PO-2026-4412', sup: 'Global Tech Distribution Ltd', date: '2026-10-01', total: 525000, items: 30, status: 'Received' },
                { po: 'PO-2026-4415', sup: 'Flora Limited BD', date: '2026-10-06', total: 688800, items: 8, status: 'Verified' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-purple-400 text-sm">{item.po}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                  <div className="font-bold text-white">{item.sup}</div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Order Date: {item.date}</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print PO</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2.5: GOODS RECEIVED / GRN CHALLAN               */}
      {/* ======================================================== */}
      {currentTab === '2.5' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-white">Goods Received Notes (GRN) Inward Challans</span>
            <button
              onClick={() => {
                playClickSound();
                setIsNewGrnModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record GRN Inward</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3">GRN #</th>
                  <th className="p-3">PO Reference</th>
                  <th className="p-3">Supplier Challan #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Inspector</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {grns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-400">{g.grnNo}</td>
                    <td className="p-3 font-mono text-purple-400">{g.poRef}</td>
                    <td className="p-3 font-mono text-slate-300">{g.supplierChallanNo}</td>
                    <td className="p-3 text-slate-300 font-mono">{g.date}</td>
                    <td className="p-3 font-bold text-white">{g.supplierName}</td>
                    <td className="p-3 text-slate-300">{g.inspector}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {g.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingGrn(g);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2.6: SUPPLIER DUE / PAYABLE                     */}
      {/* ======================================================== */}
      {currentTab === '2.6' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center text-xs">
            <div>
              <h3 className="font-bold text-white text-sm">Supplier Accounts Payable Ledger</h3>
              <p className="text-slate-400">Total vendor outstandings and payment settlement</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase">Total Payables:</span>
              <div className="text-lg font-mono font-bold text-rose-400">
                {formatCurrency(supplierList.reduce((acc, s) => acc + (s.balance || 0), 0))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Terms</th>
                  <th className="p-3 text-right">Outstanding Payable ৳</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {supplierList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-bold text-white">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.contactPerson}</td>
                    <td className="p-3 text-slate-400 font-mono">{s.phone}</td>
                    <td className="p-3 text-slate-400">{s.paymentTerms || 'Net 30'}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(s.balance || 0)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(s.balance || 0) > 0 && (
                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedSupplierForPayment(s);
                              setPaySupplierAmount(s.balance || 0);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Pay Vendor ৳
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        >
                          Statement
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2.7: PURCHASE HISTORY                           */}
      {/* ======================================================== */}
      {currentTab === '2.7' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white">Purchase &amp; Supply Chain Audit Log</span>
            <button onClick={() => window.print()} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Log</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Reference #</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3 text-right">Value ৳</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{log.refNo}</td>
                    <td className="p-3 font-bold text-slate-200">{log.party}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(log.amount)}</td>
                    <td className="p-3 text-slate-300">{log.operator}</td>
                    <td className="p-3 text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BILL */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Purchase Bill Voucher — {viewingBill.billNo}</h3>
              <button onClick={() => setViewingBill(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-3.5 rounded-xl">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Supplier Info</div>
                  <div className="font-bold text-white text-sm mt-0.5">{viewingBill.supplierName}</div>
                  <div className="text-slate-400 font-mono">{viewingBill.supplierPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Bill Date: {viewingBill.date}</div>
                  <div className="text-slate-400">Supplier Inv: {viewingBill.supplierInvoiceRef}</div>
                  <div className="text-purple-400 font-bold">{viewingBill.warehouse}</div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Cost</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewingBill.itemsList.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold text-white">{i.name}</td>
                      <td className="p-2 text-center font-mono">{i.qty}</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(i.unitCost)}</td>
                      <td className="p-2 text-right font-mono font-bold text-white">{formatCurrency(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-60 bg-slate-850 p-3 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grand Total:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(viewingBill.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paid Amount:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(viewingBill.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-1 font-bold">
                    <span className="text-rose-400">Due Payable:</span>
                    <span className="font-mono text-rose-400">{formatCurrency(viewingBill.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button onClick={() => setViewingBill(null)} className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-300 cursor-pointer">
                Close
              </button>
              <button onClick={() => window.print()} className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer">
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAY SUPPLIER */}
      {selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Disburse Payment to Supplier</h3>
              <button onClick={() => setSelectedSupplierForPayment(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProcessSupplierPayment} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                <div className="text-white font-bold text-sm">{selectedSupplierForPayment.name}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Current Payable Due:</span>
                  <span className="text-rose-400 font-mono font-bold text-base">
                    {formatCurrency(selectedSupplierForPayment.balance || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Disbursement Amount ৳ *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedSupplierForPayment.balance || 9999999}
                  value={paySupplierAmount}
                  onChange={(e) => setPaySupplierAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Paying Bank / Cash Drawer</label>
                <select
                  value={paySupplierAccount}
                  onChange={(e) => setPaySupplierAccount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Brac Bank Current Account">Brac Bank Current A/C #1501204899</option>
                  <option value="City Bank Business Account">City Bank Business A/C #2102938475</option>
                  <option value="Main POS Cash Register">Main POS Cash Drawer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment Reference / Note</label>
                <input
                  type="text"
                  value={paySupplierNote}
                  onChange={(e) => setPaySupplierNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForPayment(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
