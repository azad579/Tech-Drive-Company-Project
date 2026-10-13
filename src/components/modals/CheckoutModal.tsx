import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Customer, CartItem, Transaction } from '../../types/pos';
import { formatCurrency, generateInvoiceNumber } from '../../utils/format';
import { playCashDrawerDing } from '../../utils/sound';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: Customer;
  orderMode: 'sale' | 'quote';
  subtotal: number;
  discountTotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  cashierName: string;
  onCompleteSale: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  orderMode,
  subtotal,
  discountTotal,
  vatRate,
  vatAmount,
  grandTotal,
  cashierName,
  onCompleteSale,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'bKash / MFS' | 'Bank Transfer'>('Cash');
  const [tenderedInput, setTenderedInput] = useState<string>('');
  const [mfsNumber, setMfsNumber] = useState('01712-345678');
  const [cardLast4, setCardLast4] = useState('4242');
  const [publicInvoiceNote, setPublicInvoiceNote] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTenderedInput(String(Math.ceil(grandTotal)));
      setPublicInvoiceNote(customer.invoiceNote || '');
      setInternalNote(customer.internalNote || '');
    }
  }, [isOpen, grandTotal, customer]);

  if (!isOpen) return null;

  const tenderedAmount = parseFloat(tenderedInput) || 0;
  const changeDue = Math.max(0, tenderedAmount - grandTotal);
  const isInsufficient = paymentMethod === 'Cash' && tenderedAmount < grandTotal;

  const handleQuickAddCash = (amount: number) => {
    setTenderedInput(String(amount));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficient) return;

    playCashDrawerDing();

    const transaction: Transaction = {
      id: 'txn-' + Date.now(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toLocaleString(),
      customer,
      items: [...cartItems],
      mode: orderMode,
      subtotal,
      discountTotal,
      vatRate,
      vatAmount,
      grandTotal,
      paymentMethod,
      amountTendered: paymentMethod === 'Cash' ? tenderedAmount : grandTotal,
      changeDue: paymentMethod === 'Cash' ? changeDue : 0,
      cashierName,
      publicInvoiceNote: publicInvoiceNote.trim() || undefined,
      internalNote: internalNote.trim() || undefined,
    };

    onCompleteSale(transaction);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {orderMode === 'sale' ? 'Complete Payment' : 'Confirm Sales Quote'}
            </h3>
            <p className="text-xs text-slate-400">
              Customer: <span className="font-medium text-slate-700 dark:text-slate-300">{customer.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Total Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Total Amount Payable
            </span>
            <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 font-mono tabular-nums mt-1">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Includes {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items & VAT ({vatRate}%)
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'Card', label: 'POS Card', icon: CreditCard },
                { id: 'bKash / MFS', label: 'bKash / MFS', icon: Smartphone },
                { id: 'Bank Transfer', label: 'Bank Wire', icon: Building },
              ].map((m) => {
                const IconComponent = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Specific Fields */}
          {paymentMethod === 'Cash' ? (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Amount Received / Tendered:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={tenderedInput}
                    onChange={(e) => setTenderedInput(e.target.value)}
                    autoFocus
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickAddCash(Math.ceil(grandTotal))}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono hover:bg-slate-100"
                >
                  Exact ({formatCurrency(grandTotal)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddCash(Math.ceil(grandTotal / 500) * 500)}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono hover:bg-slate-100"
                >
                  Round 500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddCash(Math.ceil(grandTotal / 1000) * 1000)}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono hover:bg-slate-100"
                >
                  Round 1,000
                </button>
              </div>

              {/* Change calculation */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Change Due to Customer:
                </span>
                <span
                  className={`font-mono text-base font-bold tabular-nums ${
                    isInsufficient ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isInsufficient ? 'Short by ' + formatCurrency(grandTotal - tenderedAmount) : formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          ) : paymentMethod === 'bKash / MFS' ? (
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Customer Mobile Wallet Number:
              </label>
              <input
                type="text"
                value={mfsNumber}
                onChange={(e) => setMfsNumber(e.target.value)}
                placeholder="017XX-XXXXXX"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">
                Merchant QR Scan initiated on POS screen. Customer can approve via PIN.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Card Reference / Last 4 Digits:
              </label>
              <input
                type="text"
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                placeholder="4242"
                maxLength={4}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">
                POS Terminal connected. Chip card authorization confirmed.
              </p>
            </div>
          )}

          {/* 2 Note Sections: 1 Public (Shows on Invoice) & 1 Internal Message Only */}
          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Invoice & Order Notes
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Section 1: Public Invoice Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span>📄</span>
                    <span>Invoice Note</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Shows on invoice</span>
                </label>
                <input
                  type="text"
                  value={publicInvoiceNote}
                  onChange={(e) => setPublicInvoiceNote(e.target.value)}
                  placeholder="e.g. PO Ref, delivery terms..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Section 2: Internal Message Only */}
              <div>
                <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>🔒</span>
                    <span>Internal Message</span>
                  </span>
                  <span className="text-[10px] text-amber-500 font-normal">Staff only (hidden)</span>
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Internal store memo..."
                  className="w-full bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-amber-400/80 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isInsufficient}
              className="flex-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Sale & Print Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
