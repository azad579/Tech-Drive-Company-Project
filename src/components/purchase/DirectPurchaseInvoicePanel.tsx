import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Minus,
  CheckCircle,
  Truck,
  Building,
  Smartphone,
  Banknote,
  Receipt,
  FileCheck,
  Tag,
  Check,
} from 'lucide-react';
import { Product } from '../../types/pos';
import { Supplier, PurchaseInvoice } from '../../types/purchase';
import { formatCurrency, generateInvoiceNumber } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { SerialPocketModal } from './SerialPocketModal';

export interface DirectPurchaseItem {
  product: Product;
  unitCost: number;
  quantity: number;
  taxRate: number;
  serials?: string[];
}

interface DirectPurchaseInvoicePanelProps {
  suppliers: Supplier[];
  selectedSupplier: Supplier;
  onSelectSupplier: (supplier: Supplier) => void;
  onCreateSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  items: DirectPurchaseItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  onUpdateUnitCost: (productId: string, cost: number) => void;
  onUpdateSerials?: (productId: string, serials: string[]) => void;
  onRemoveItem: (productId: string) => void;
  onClearItems: () => void;
  onCompletePurchaseInvoice: (invoiceData: {
    paymentMethod: 'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Credit / Due';
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    notes: string;
    internalNotes: string;
  }) => void;
}

export const DirectPurchaseInvoicePanel: React.FC<DirectPurchaseInvoicePanelProps> = ({
  suppliers,
  selectedSupplier,
  onSelectSupplier,
  onCreateSupplier,
  items,
  onUpdateQuantity,
  onSetQuantity,
  onUpdateUnitCost,
  onUpdateSerials,
  onRemoveItem,
  onClearItems,
  onCompletePurchaseInvoice,
}) => {
  // Active item for serial number pocket popup
  const [activeSerialItem, setActiveSerialItem] = useState<DirectPurchaseItem | null>(null);

  // Quick supplier state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Credit / Due'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Paid');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [internalNote, setInternalNote] = useState('');

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
      paymentTerms: 'Cash on Delivery',
      balance: 0,
    });
    onSelectSupplier(newSup);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const taxAmount = items.reduce((sum, item) => sum + item.unitCost * item.quantity * (item.taxRate / 100), 0);
  const grandTotal = subtotal + taxAmount;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add products from the left catalog to purchase.');
      return;
    }
    playCashDrawerDing();
    onCompletePurchaseInvoice({
      paymentMethod,
      paymentStatus,
      notes: invoiceNote,
      internalNotes: internalNote,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden font-sans">
      {/* 1. Header: Supplier Selector, Type & Direct Invoice Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/90 p-2.5 shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <label className="text-[11px] font-semibold text-slate-500 shrink-0">
              Vendor:
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

          {/* Direct Buy Tag */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Direct Purchase Invoice</span>
            </span>
          </div>
        </div>

        {/* Selected Supplier Details */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap pt-0.5 border-t border-slate-200/80 dark:border-slate-800/80">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Code: <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedSupplier.code}</span>
          </span>
          <span>·</span>
          <span>📞 {selectedSupplier.phone}</span>
          <span>·</span>
          <span>Terms: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSupplier.paymentTerms}</span></span>
          <span>·</span>
          <span className="truncate max-w-[200px]">📍 {selectedSupplier.address}</span>
        </div>

        {/* Quick Supplier Form */}
        <form onSubmit={handleQuickCreateSupplier} className="space-y-1.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="New vendor name:"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="Vendor phone / contact:"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="Vendor email:"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            <div className="relative flex items-center">
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Vendor address..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-lg pl-2.5 pr-14 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              {formName.trim() && (
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 2. Direct Buying Notice */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Bypasses PO stage: Completing invoice immediately adds purchased quantity to physical stock.</span>
        </span>
      </div>

      {/* 3. Items Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
            Purchase Items ({items.length}) · Total Units: {totalQuantity}
          </span>
          {items.length > 0 && (
            <button
              onClick={onClearItems}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No products selected for direct purchase
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any product on the left catalog to add to this purchase invoice.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl border bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
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
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        Current Stock: {item.product.stock}
                      </span>
                    </div>

                    {/* Unit Cost input */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Unit Buy Cost: ৳</span>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => onUpdateUnitCost(item.product.id, Number(e.target.value) || 0)}
                          className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <div>
                        <span className="text-[11px] text-slate-400">Total: </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.unitCost * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Controls & Add Serial Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400">
                      Units: <span className="font-semibold text-emerald-600">(+{item.quantity} to stock)</span>
                    </span>

                    {/* "Add Serial" Button */}
                    <button
                      type="button"
                      onClick={() => setActiveSerialItem(item)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer border shadow-2xs ${
                        item.serials && item.serials.length === item.quantity
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                          : item.serials && item.serials.length > 0
                          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100'
                      }`}
                      title="Click to open small pocket to add serial numbers"
                    >
                      <Tag className="w-3 h-3" />
                      <span>
                        {item.serials && item.serials.length === item.quantity
                          ? `✓ Serials (${item.serials.length}/${item.quantity})`
                          : item.serials && item.serials.length > 0
                          ? `⚠️ Serials (${item.serials.length}/${item.quantity})`
                          : `Add Serial (${item.serials?.length || 0}/${item.quantity})`}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => onSetQuantity(item.product.id, Math.max(1, Number(e.target.value) || 1))}
                      className="w-12 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-0.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Serial pills preview if assigned */}
                {item.serials && item.serials.length > 0 && (
                  <div className="mt-1.5 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800/60 flex items-center gap-1 flex-wrap text-[10px]">
                    <span className="font-semibold text-slate-400 shrink-0">S/N:</span>
                    {item.serials.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        onClick={() => setActiveSerialItem(item)}
                        className="font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded hover:border-emerald-400 transition-colors cursor-pointer"
                        title="Click to edit in serial pocket"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom Controls: Payment Method, Totals & Action */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0 space-y-2.5">
        {/* Payment Method Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Vendor Payment Method:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'Cash', label: 'Cash', icon: Banknote },
              { id: 'Bank Transfer', label: 'Bank Wire', icon: Building },
              { id: 'MFS / bKash', label: 'bKash/MFS', icon: Smartphone },
              { id: 'Credit / Due', label: 'Vendor Credit', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT / Tax (5%)</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Total Purchase Payable
            </span>
            <span className="text-lg md:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={items.length === 0}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs md:text-sm font-bold shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save Purchase Invoice & Increase Stock</span>
        </button>
      </div>

      {/* Small Pocket Modal to Add Serial Numbers */}
      {activeSerialItem && (
        <SerialPocketModal
          isOpen={!!activeSerialItem}
          onClose={() => setActiveSerialItem(null)}
          product={activeSerialItem.product}
          quantity={activeSerialItem.quantity}
          currentSerials={activeSerialItem.serials || []}
          onSaveSerials={(newSerials) => {
            if (onUpdateSerials) {
              onUpdateSerials(activeSerialItem.product.id, newSerials);
            }
            setActiveSerialItem(null);
          }}
        />
      )}
    </div>
  );
};
