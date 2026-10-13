import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Minus,
  CheckCircle2,
  Truck,
  Calendar,
  AlertCircle,
  Package,
  Clock,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Supplier, PurchaseOrder, PurchaseOrderItem, POStatus } from '../../types/purchase';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface PurchaseOrderPanelProps {
  suppliers: Supplier[];
  selectedSupplier: Supplier;
  onSelectSupplier: (supplier: Supplier) => void;
  onCreateSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  poItems: PurchaseOrderItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  onUpdateUnitCost: (productId: string, cost: number) => void;
  onUpdateReceivingNow?: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearItems: () => void;
  activePO: PurchaseOrder | null;
  onSaveNewPO: (poData: {
    expectedDeliveryDate: string;
    notes: string;
    internalNotes: string;
  }) => void;
  onProcessReceive: (referenceNote: string) => void;
  onOpenPOList?: () => void;
  isReceiveMode: boolean;
  onToggleReceiveMode: (receive: boolean) => void;
  pendingPOCount: number;
}

export const PurchaseOrderPanel: React.FC<PurchaseOrderPanelProps> = ({
  suppliers,
  selectedSupplier,
  onSelectSupplier,
  onCreateSupplier,
  poItems,
  onUpdateQuantity,
  onSetQuantity,
  onUpdateUnitCost,
  onUpdateReceivingNow,
  onRemoveItem,
  onClearItems,
  activePO,
  onSaveNewPO,
  onProcessReceive,
  onOpenPOList,
  isReceiveMode,
  onToggleReceiveMode,
  pendingPOCount,
}) => {
  // Quick supplier creation form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // PO Order details
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [publicNotes, setPublicNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [receiveRefNote, setReceiveRefNote] = useState('');

  // Local receive quantities map (for Receive Mode)
  const [receivingQuantities, setReceivingQuantities] = useState<Record<string, number>>({});

  const handleQuickCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a supplier name.');
      return;
    }
    playClickSound();
    const newSup = onCreateSupplier({
      name: formName.trim(),
      code: `SUP-${String(Math.floor(100 + Math.random() * 900))}`,
      contactPerson: formName.trim(),
      phone: formPhone.trim() || 'N/A',
      email: formEmail.trim() || '',
      address: formAddress.trim() || 'Dhaka, Bangladesh',
      supplierType: 'Wholesaler',
      paymentTerms: 'Net 30',
      balance: 0,
    });
    onSelectSupplier(newSup);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
  };

  // Calculations
  const subtotal = poItems.reduce((sum, item) => sum + item.unitCost * item.quantityOrdered, 0);
  const taxAmount = poItems.reduce((sum, item) => sum + item.unitCost * item.quantityOrdered * (item.taxRate / 100), 0);
  const grandTotal = subtotal + taxAmount;

  // Total items & quantities
  const totalQtyOrdered = poItems.reduce((sum, i) => sum + i.quantityOrdered, 0);
  const totalQtyReceived = poItems.reduce((sum, i) => sum + i.quantityReceived, 0);

  // Handle Receive Input Change
  const handleReceiveQtyChange = (productId: string, val: number, maxAvailable: number) => {
    const clamped = Math.max(0, Math.min(val, maxAvailable));
    setReceivingQuantities((prev) => ({
      ...prev,
      [productId]: clamped,
    }));
    if (onUpdateReceivingNow) {
      onUpdateReceivingNow(productId, clamped);
    }
  };

  // Handle Receive All Remaining shortcut
  const handleReceiveAllRemaining = () => {
    playClickSound();
    const map: Record<string, number> = {};
    poItems.forEach((item) => {
      const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
      map[item.productId] = remaining;
      if (onUpdateReceivingNow) {
        onUpdateReceivingNow(item.productId, remaining);
      }
    });
    setReceivingQuantities(map);
  };

  const handleSavePO = () => {
    if (poItems.length === 0) {
      alert('Please add at least one product to the Purchase Order.');
      return;
    }
    playCashDrawerDing();
    onSaveNewPO({
      expectedDeliveryDate: expectedDate,
      notes: publicNotes,
      internalNotes,
    });
  };

  const handleExecuteReceive = () => {
    playCashDrawerDing();
    onProcessReceive(receiveRefNote || 'Warehouse Dock Receive');
    setReceivingQuantities({});
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden font-sans">
      {/* 1. TOP HEADER: Supplier Selection, Type Dropdown, & Workflow Mode */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/90 p-2.5 shrink-0 space-y-2">
        {/* Row 1: Supplier Selector + Type Dropdown + PO List Button + Mode Selector */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <label className="text-[11px] font-semibold text-slate-500 shrink-0">
              Supplier:
            </label>
            <select
              value={selectedSupplier.id}
              onChange={(e) => {
                const found = suppliers.find((s) => s.id === e.target.value);
                if (found) onSelectSupplier(found);
              }}
              className="flex-1 min-w-[130px] max-w-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} [{s.supplierType}] - {s.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Right Mode Actions: Order/Receive Mode Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode Selector Dropdown: Draft PO vs Receive Mode */}
            <select
              value={isReceiveMode ? 'receive' : 'order'}
              onChange={(e) => {
                playClickSound();
                onToggleReceiveMode(e.target.value === 'receive');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isReceiveMode
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-blue-600 text-white border-blue-600'
              }`}
              title="Switch PO Workflow Mode"
            >
              <option value="order" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                📋 Draft / Create PO
              </option>
              <option value="receive" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                📦 Receive Goods Mode
              </option>
            </select>
          </div>
        </div>

        {/* Selected Supplier Info & Active PO Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2 pt-0.5 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Code: <span className="font-mono text-blue-600 dark:text-blue-400">{selectedSupplier.code}</span>
            </span>
            <span>·</span>
            <span>📞 {selectedSupplier.phone}</span>
            <span>·</span>
            <span className="truncate max-w-[180px]">📍 {selectedSupplier.address}</span>
          </div>

          {activePO ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activePO.poNumber}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activePO.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : activePO.status === 'Partial Receive'
                    ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {activePO.status}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium italic">
              New PO Draft (Pending)
            </span>
          )}
        </div>

        {/* Quick New Supplier Entry Form (Collapsed by default or clean inline) */}
        {!isReceiveMode && (
          <form onSubmit={handleQuickCreateSupplier} className="space-y-1.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="New supplier name:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Supplier phone / mobile:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Supplier email:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Supplier address..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg pl-2.5 pr-14 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                {formName.trim() && (
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 2. RECEIVE MODE INSTRUCTION BANNER (When Receive Mode is Active) */}
      {isReceiveMode && (
        <div className="bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800/80 px-3 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
            <Truck className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold">Receive Mode Active:</span>{' '}
              <span className="text-[11px] text-purple-700 dark:text-purple-300">
                Enter quantity received per item. Stocks will increase immediately upon saving receipt.
              </span>
            </div>
          </div>
          <button
            onClick={handleReceiveAllRemaining}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg shrink-0 transition-colors shadow-xs"
          >
            Receive All Remaining
          </button>
        </div>
      )}

      {/* 3. SCROLLABLE PO ITEM GRID */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
            PO Items ({poItems.length}) · Ordered: {totalQtyOrdered} · Received: {totalQtyReceived}
          </span>
          {poItems.length > 0 && !isReceiveMode && (
            <button
              onClick={onClearItems}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {poItems.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              PO Item Grid is currently empty
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any product from the left catalog to add to this Purchase Order.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {poItems.map((item) => {
              const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
              const receivingNow = receivingQuantities[item.productId] ?? 0;
              const isFullyReceived = item.quantityReceived >= item.quantityOrdered;

              return (
                <div
                  key={item.productId}
                  className={`p-3 rounded-xl border transition-all ${
                    isFullyReceived
                      ? 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.product.name}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                          {item.product.sku}
                        </span>
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                          Current Stock: {item.product.stock}
                        </span>
                      </div>

                      {/* Unit Cost & Line Total */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400">Unit Cost: ৳</span>
                          <input
                            type="number"
                            disabled={isReceiveMode}
                            value={item.unitCost}
                            onChange={(e) => onUpdateUnitCost(item.productId, Number(e.target.value) || 0)}
                            className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-blue-500 disabled:opacity-75"
                          />
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <div>
                          <span className="text-[11px] text-slate-400">Total: </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(item.unitCost * item.quantityOrdered)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item (Draft Mode only) */}
                    {!isReceiveMode && (
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove from PO"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quantity Controls in Draft Mode */}
                  {!isReceiveMode ? (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Order Quantity:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantityOrdered}
                          onChange={(e) => onSetQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
                          className="w-12 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-0.5 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.productId, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Receiving Mode Controls & Status */
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="grid grid-cols-4 gap-1 text-[11px] text-center">
                        <div className="p-1 rounded bg-slate-50 dark:bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Ordered</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.quantityOrdered}
                          </span>
                        </div>
                        <div className="p-1 rounded bg-slate-50 dark:bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Prev. Recv</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {item.quantityReceived}
                          </span>
                        </div>
                        <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                          <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold block">
                            Recv Now
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            value={receivingNow}
                            onChange={(e) =>
                              handleReceiveQtyChange(item.productId, Number(e.target.value) || 0, remaining)
                            }
                            className="w-full text-center font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded py-0.5 text-purple-700 dark:text-purple-300 focus:outline-none"
                          />
                        </div>
                        <div className="p-1 rounded bg-slate-50 dark:bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Remaining</span>
                          <span
                            className={`font-mono font-bold ${
                              remaining === 0 ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {remaining}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Item Status:</span>
                        {isFullyReceived ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Fully Received
                          </span>
                        ) : item.quantityReceived > 0 ? (
                          <span className="text-purple-600 font-bold">
                            Partial ({item.quantityReceived}/{item.quantityOrdered})
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Pending Delivery</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. BOTTOM TOTALS & ACTION BUTTONS */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0 space-y-2.5">
        {/* Totals Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>PO Subtotal</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Govt VAT / Tax (5%)</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Estimated PO Amount
            </span>
            <span className="text-lg md:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Button: Save PO vs Receive Stock */}
        {!isReceiveMode ? (
          <div className="pt-1">
            <button
              onClick={handleSavePO}
              disabled={poItems.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create Purchase Order (Status: Pending)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={receiveRefNote}
              onChange={(e) => setReceiveRefNote(e.target.value)}
              placeholder="Goods receive delivery challan / courier note..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleExecuteReceive}
              disabled={
                Object.values(receivingQuantities).reduce((a, b) => a + b, 0) === 0
              }
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs md:text-sm font-bold shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Goods Receipt & Increase Stock</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
