import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Package,
  Plus,
  Trash2,
  Percent,
  User,
  CreditCard,
  Check,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Sparkles,
  Sliders,
  Receipt,
  Tag,
} from 'lucide-react';
import { ERPTransactionRecord, ERPTransactionItem } from '../../data/mockTransactions';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing, playBarcodeBeep } from '../../utils/sound';

export type InvoiceEditPart =
  | 'menu'
  | 'date'
  | 'items'
  | 'add_item'
  | 'discount'
  | 'customer'
  | 'payment'
  | 'full';

interface EditInvoiceModalProps {
  invoice: ERPTransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedInvoice: ERPTransactionRecord) => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activePart, setActivePart] = useState<InvoiceEditPart>('menu');

  // Form states
  const [refNo, setRefNo] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [items, setItems] = useState<ERPTransactionItem[]>([]);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [status, setStatus] = useState<ERPTransactionRecord['status']>('Completed');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  // New Item addition form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemQty, setNewItemQty] = useState<number>(1);

  useEffect(() => {
    if (invoice) {
      setRefNo(invoice.refNo);
      setDateTime(invoice.dateTime);
      setPartyName(invoice.partyName);
      setPartyPhone(invoice.partyPhone || '');
      const initialItems: ERPTransactionItem[] =
        invoice.itemsList && invoice.itemsList.length > 0
          ? JSON.parse(JSON.stringify(invoice.itemsList))
          : [
              {
                name: invoice.partyName ? `Products / Services for ${invoice.partyName}` : 'Catalog Products',
                qty: invoice.itemsCount || 1,
                unitPrice: Math.round((invoice.grossAmount || invoice.grandTotal) / (invoice.itemsCount || 1)),
                total: invoice.grossAmount || invoice.grandTotal,
              },
            ];
      setItems(initialItems);
      if (invoice.discountPercent && invoice.discountPercent > 0) {
        setDiscountType('percent');
        setDiscountValue(invoice.discountPercent);
      } else if (invoice.discountAmount && invoice.discountAmount > 0) {
        setDiscountType('flat');
        setDiscountValue(invoice.discountAmount);
      } else {
        setDiscountType('flat');
        setDiscountValue(0);
      }
      setPaidAmount(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal);
      setStatus(invoice.status || 'Completed');
      setPaymentMethod(invoice.paymentMethod || 'Cash');
      setNotes(invoice.notes || '');
      setActivePart('menu'); // Start at menu to ask user which part to modify
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  // Real-time calculations
  const grossAmount = items.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
  const discountAmount =
    discountType === 'percent'
      ? Math.round((grossAmount * (discountValue || 0)) / 100)
      : Math.min(grossAmount, Math.max(0, discountValue || 0));
  const taxableAmount = Math.max(0, grossAmount - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.05); // 5% VAT
  const grandTotal = taxableAmount + taxAmount;
  const calculatedDue = Math.max(0, grandTotal - paidAmount);

  // Handlers for items
  const handleItemQtyChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, qty: newQty, total: it.unitPrice * newQty } : it))
    );
  };

  const handleItemPriceChange = (index: number, newPrice: number) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === index
          ? { ...it, unitPrice: Math.max(0, newPrice), total: Math.max(0, newPrice) * it.qty }
          : it
      )
    );
  };

  const handleItemNameChange = (index: number, newName: string) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, name: newName } : it))
    );
  };

  const handleRemoveItem = (index: number) => {
    playBarcodeBeep();
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice <= 0 || newItemQty <= 0) return;
    playClickSound();

    const newItem: ERPTransactionItem = {
      name: newItemName.trim(),
      unitPrice: newItemPrice,
      qty: newItemQty,
      total: newItemPrice * newItemQty,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemPrice(0);
    setNewItemQty(1);
    setActivePart('items'); // Return to items view
  };

  const handleSaveInvoice = () => {
    playCashDrawerDing();

    const updated: ERPTransactionRecord = {
      ...invoice,
      refNo: refNo.trim() || invoice.refNo,
      dateTime: dateTime.trim() || invoice.dateTime,
      partyName: partyName.trim() || invoice.partyName,
      partyPhone: partyPhone.trim(),
      itemsList: items,
      itemsCount: items.reduce((acc, it) => acc + it.qty, 0),
      grossAmount,
      discountAmount,
      discountPercent: discountType === 'percent' ? discountValue : undefined,
      taxAmount,
      grandTotal,
      paidAmount,
      dueAmount: calculatedDue,
      status: calculatedDue > 0 && paidAmount > 0 ? 'Partial' : calculatedDue === 0 ? 'Completed' : status,
      paymentMethod,
      notes: notes.trim(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">Edit Invoice</span>
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  {refNo}
                </span>
                <span className="text-xs text-slate-400">({partyName})</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activePart === 'menu'
                  ? 'Choose which part of the invoice you want to modify'
                  : `Modifying: ${
                      activePart === 'date'
                        ? 'Invoice Date & Time'
                        : activePart === 'items'
                        ? 'Items & Unit Prices'
                        : activePart === 'add_item'
                        ? 'Add New Item'
                        : activePart === 'discount'
                        ? 'Invoice Discount'
                        : activePart === 'customer'
                        ? 'Customer / Party Details'
                        : activePart === 'payment'
                        ? 'Payment & Status'
                        : 'Full Invoice Details'
                    }`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePart !== 'menu' && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActivePart('menu');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Options</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* STEP 1: PART SELECTION MENU ("asks the user which part of the invoice they want to modify") */}
          {activePart === 'menu' && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Which part of the invoice would you like to modify?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a section below to update date, item quantities, prices, discounts, or add new items.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Date & Time */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('date');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      1. Date &amp; Time
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Current: {dateTime}
                    </span>
                  </div>
                </button>

                {/* 2. Items & Prices */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('items');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      2. Items &amp; Prices
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Edit unit price, quantity or remove ({items.length} items)
                    </span>
                  </div>
                </button>

                {/* 3. Add New Item */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('add_item');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      3. Add New Item
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Insert an extra product or service to this invoice
                    </span>
                  </div>
                </button>

                {/* 4. Add / Modify Discount */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('discount');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      4. Add / Modify Discount
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {discountAmount > 0 ? `Current: ${formatCurrency(discountAmount)} off` : 'Apply % or flat cash discount'}
                    </span>
                  </div>
                </button>

                {/* 5. Customer / Party Details */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('customer');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      5. Customer / Party Details
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Name: {partyName}
                    </span>
                  </div>
                </button>

                {/* 6. Payment & Status */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('payment');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-bold text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      6. Payment &amp; Status
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Paid: {formatCurrency(paidAmount)} · Status: {status}
                    </span>
                  </div>
                </button>
              </div>

              {/* Comprehensive Full Editor link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePart('full');
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
                >
                  Or open Full All-in-One Editor →
                </button>
              </div>
            </div>
          )}

          {/* 1. DATE & TIME EDITOR */}
          {(activePart === 'date' || activePart === 'full') && (
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Invoice Date &amp; Time</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Invoice Date &amp; Timestamp String:
                  </label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder="e.g. 03/10/2026, 10:16 pm"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const d = String(now.getDate()).padStart(2, '0');
                      const m = String(now.getMonth() + 1).padStart(2, '0');
                      const y = now.getFullYear();
                      let hours = now.getHours();
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      const ampm = hours >= 12 ? 'pm' : 'am';
                      hours = hours % 12 || 12;
                      setDateTime(`${d}/${m}/${y}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`);
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 rounded-lg text-xs font-semibold cursor-pointer border border-blue-200 dark:border-blue-800"
                  >
                    Set to Current Date &amp; Time
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ITEM & PRICE EDITOR */}
          {(activePart === 'items' || activePart === 'full') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Modify Existing Items &amp; Prices</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePart('add_item')}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Another Item</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  No items in this invoice. Click "Add Another Item" above.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="p-2.5">Item Name</th>
                        <th className="p-2.5 w-24 text-center">Quantity</th>
                        <th className="p-2.5 w-32 text-right">Unit Price (৳)</th>
                        <th className="p-2.5 w-28 text-right">Total (৳)</th>
                        <th className="p-2.5 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={it.name}
                              onChange={(e) => handleItemNameChange(idx, e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 px-1 py-0.5 font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, it.qty - 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold">{it.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, it.qty + 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={it.unitPrice}
                              onChange={(e) => handleItemPriceChange(idx, Number(e.target.value) || 0)}
                              className="w-24 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 font-mono px-1 py-0.5"
                            />
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(it.unitPrice * it.qty)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. ADD NEW ITEM FORM */}
          {activePart === 'add_item' && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add a New Item to this Invoice</span>
              </div>

              <form onSubmit={handleAddNewItem} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Item / Product Description *
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Dell UltraSharp 27 Monitor, Extra Thermal Paste, Service Fee..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unit Price (৳) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(Number(e.target.value) || 0)}
                      placeholder="e.g. 15000"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActivePart('items')}
                    className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Item</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. ADD / MODIFY DISCOUNT */}
          {(activePart === 'discount' || activePart === 'full') && (
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Add / Modify Discount</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border cursor-pointer ${
                        discountType === 'flat'
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Fixed Amount (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs border cursor-pointer ${
                        discountType === 'percent'
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {discountType === 'percent' ? 'Discount Percentage (%)' : 'Discount Cash Amount (৳)'}:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="e.g. 500 or 10"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-purple-700 dark:text-purple-400 text-xs"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Presets:</span>
                {[
                  { label: '৳0 (Clear)', type: 'flat' as const, val: 0 },
                  { label: '৳200', type: 'flat' as const, val: 200 },
                  { label: '৳500', type: 'flat' as const, val: 500 },
                  { label: '৳1,000', type: 'flat' as const, val: 1000 },
                  { label: '5%', type: 'percent' as const, val: 5 },
                  { label: '10%', type: 'percent' as const, val: 10 },
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDiscountType(p.type);
                      setDiscountValue(p.val);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-100 cursor-pointer shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. CUSTOMER / PARTY DETAILS */}
          {(activePart === 'customer' || activePart === 'full') && (
            <div className="p-4 bg-sky-50/50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/60 space-y-3">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-xs">
                <User className="w-4 h-4 text-sky-600" />
                <span>Customer / Supplier Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    placeholder="e.g. +880 1712-345678"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Notes &amp; Remarks
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional delivery instructions, warranty serials, etc."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>
            </div>
          )}

          {/* 6. PAYMENT & STATUS */}
          {(activePart === 'payment' || activePart === 'full') && (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Payment &amp; Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid Amount (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold text-blue-600 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-xs"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Cash, Card, bKash..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LIVE TOTALS PREVIEW BAR */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Subtotal ({items.length} items):</span>
              <span className="font-mono font-semibold">{formatCurrency(grossAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-purple-700 dark:text-purple-400 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax / VAT (5%):</span>
              <span className="font-mono">+{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>Updated Grand Total:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-emerald-700 dark:text-emerald-400">Paid: {formatCurrency(paidAmount)}</span>
              {calculatedDue > 0 ? (
                <span className="text-rose-600 font-bold">Due Balance: {formatCurrency(calculatedDue)}</span>
              ) : (
                <span className="text-emerald-600 font-semibold">✓ Fully Settled</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            {activePart !== 'menu' && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActivePart('menu');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose Another Part</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveInvoice}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
