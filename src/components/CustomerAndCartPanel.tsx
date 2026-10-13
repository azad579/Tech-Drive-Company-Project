import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Minus,
  PauseCircle,
  CreditCard,
  Check,
  Gift,
  X,
  Barcode,
  Sparkles,
  Hash,
} from 'lucide-react';
import { Customer, CartItem, GiftItem, CustomerType } from '../types/pos';
import { formatCurrency } from '../utils/format';
import { playClickSound } from '../utils/sound';
import { SerialModal } from './modals/SerialModal';
import { GiftModal } from './modals/GiftModal';

interface CustomerAndCartPanelProps {
  customers: Customer[];
  selectedCustomer: Customer;
  onSelectCustomer: (cust: Customer) => void;
  onCreateCustomer: (customerData: Omit<Customer, 'id'>) => Customer;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onUpdateSerials: (productId: string, serials: string[]) => void;
  onUpdateGifts: (productId: string, gifts: GiftItem[]) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  onCheckout: () => void;
  orderMode: 'sale' | 'quote';
  onSetOrderMode: (mode: 'sale' | 'quote') => void;
  discountPercent: number;
  onSetDiscountPercent: (pct: number) => void;
  vatRate: number;
}

export const CustomerAndCartPanel: React.FC<CustomerAndCartPanelProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onCreateCustomer,
  cartItems,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateSerials,
  onUpdateGifts,
  onRemoveItem,
  onClearCart,
  onHoldOrder,
  onCheckout,
  orderMode,
  onSetOrderMode,
  discountPercent,
  onSetDiscountPercent,
  vatRate,
}) => {
  // Quick form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCustomerType, setFormCustomerType] = useState<CustomerType>('Regular');

  // Serial Number Modal State
  const [serialModalItem, setSerialModalItem] = useState<CartItem | null>(null);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);

  // Gift Accessories Modal State
  const [giftModalItem, setGiftModalItem] = useState<CartItem | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Handle Quick Create submit
  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    playClickSound();
    const newCust = onCreateCustomer({
      name: formName.trim(),
      phone: formPhone.trim() || 'N/A',
      customerType: formCustomerType,
      address: formAddress.trim() || undefined,
      email: formEmail.trim() || undefined,
      loyaltyPoints: 0,
    });
    onSelectCustomer(newCust);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.customPrice ?? item.product.price) * item.quantity,
    0
  );
  const discountTotal = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const vatAmount = (taxableAmount * vatRate) / 100;
  const grandTotal = taxableAmount + vatAmount;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Customer Selection, Type & Order Mode Header Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/90 p-2.5 shrink-0 space-y-2">
        {/* Row 1: Customer selector + Type Badge & Switcher + Sale/Quote Mode */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <label className="text-[11px] font-semibold text-slate-500 shrink-0">
              Customer:
            </label>
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                if (found) onSelectCustomer(found);
              }}
              className="flex-1 min-w-[130px] max-w-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} [{c.customerType || 'Regular'}] - {c.phone}
                </option>
              ))}
            </select>

            {/* Customer Type Dropdown Selector */}
            <select
              value={selectedCustomer.customerType || 'Regular'}
              onChange={(e) => {
                playClickSound();
                onSelectCustomer({
                  ...selectedCustomer,
                  customerType: e.target.value as CustomerType,
                });
              }}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs focus:outline-none ${
                (selectedCustomer.customerType || 'Regular') === 'B2B'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800'
                  : (selectedCustomer.customerType || 'Regular') === 'New'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
              }`}
              title="Customer Classification"
            >
              <option value="Regular" className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold">
                ● Regular
              </option>
              <option value="B2B" className="bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold">
                ● B2B
              </option>
              <option value="New" className="bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-semibold">
                ● New
              </option>
            </select>
          </div>

          {/* Sale / Quote Dropdown Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={orderMode}
              onChange={(e) => {
                playClickSound();
                onSetOrderMode(e.target.value as 'sale' | 'quote');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                orderMode === 'sale'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-indigo-700 text-white border-indigo-700'
              }`}
              title="Select Order Mode (Sale or Quote)"
            >
              <option value="sale" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                Sale Mode
              </option>
              <option value="quote" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                Quote Mode
              </option>
            </select>
          </div>
        </div>

        {/* Form fields for customer entry */}
        <form onSubmit={handleQuickCreateSubmit} className="space-y-1.5">
          {/* Row 1: Customer name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="New customer name:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg pl-3 pr-14 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const match = customers.find((c) =>
                    c.name.toLowerCase().includes(formName.toLowerCase())
                  );
                  if (match) onSelectCustomer(match);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 font-medium cursor-pointer"
              >
                Search
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Phone / Customer No:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg pl-3 pr-14 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const match = customers.find((c) => c.phone.includes(formPhone));
                  if (match) onSelectCustomer(match);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 font-medium cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Row 2: Email & Address + Save Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Email:"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg px-3 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Address Input + Save Button */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Address / Delivery location..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-lg pl-3 pr-16 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {formName.trim() && (
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Save customer"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 3. SCROLLABLE ORDER ITEMS LIST */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
              Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </span>
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-rose-500 hover:text-rose-600 font-medium text-[11px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-400">
              <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Cart is currently empty
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any product on the left catalog or scan barcode (F2) to add items.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => {
                const isLaptop = item.product.category === 'Laptops';
                const totalGiftQty = (item.selectedGifts || []).reduce((sum, g) => sum + (g.quantity || 1), 0);

                return (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Product Details: Lines 1-2 for product name, Line 3 for meta details */}
                      <div className="min-w-0 flex-1 overflow-hidden pr-1">
                      {/* Line 1, 2: Product Name (up to 2 lines) */}
                      <p
                        className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug"
                        title={item.product.name}
                      >
                        {item.product.name}
                      </p>
                      {/* Line 3: Unit price, SKU, and the interactive serial badge & visible gift button */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold tabular-nums shrink-0">
                          {formatCurrency(item.customPrice ?? item.product.price)}
                          {item.customPrice !== undefined && item.customPrice !== item.product.price && (
                            <span className="ml-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-sans font-medium">(custom)</span>
                          )}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-400 font-mono text-[10px] truncate max-w-[65px] shrink-0">
                          {item.product.sku}
                        </span>
                        {isLaptop && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            {/* Button 1 as Interactive Serial Number Button - perfectly aligned with Gift button */}
                            {!item.selectedSerials || item.selectedSerials.length === 0 ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playClickSound();
                                  setSerialModalItem(item);
                                  setIsSerialModalOpen(true);
                                }}
                                className="h-6 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs hover:scale-102 active:scale-98"
                                title="Click to view available serial numbers with authorized cost prices"
                              >
                                <Barcode className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Serial +</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playClickSound();
                                  setSerialModalItem(item);
                                  setIsSerialModalOpen(true);
                                }}
                                className="h-6 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 border border-blue-600 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs hover:scale-102 active:scale-98"
                                title={`Selected ${item.selectedSerials.length} serial numbers: ${item.selectedSerials.join(', ')}`}
                              >
                                <Barcode className="w-3 h-3 text-cyan-200 shrink-0" />
                                <span>Serial Qty:</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-[10px] font-black font-mono leading-none shadow-2xs">
                                  {item.selectedSerials.length}
                                </span>
                              </button>
                            )}

                            {/* Button 2 as Interactive Gift Accessories Button - aligned alongside Serial button */}
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            {!item.selectedGifts || item.selectedGifts.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  playClickSound();
                                  setGiftModalItem(item);
                                  setIsGiftModalOpen(true);
                                }}
                                className="h-6 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-700 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs hover:scale-102 active:scale-98"
                                title="Choose free accessory gifts for this laptop"
                              >
                                <Gift className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span>Gift +</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  playClickSound();
                                  setGiftModalItem(item);
                                  setIsGiftModalOpen(true);
                                }}
                                className="h-6 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 border border-purple-600 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs hover:scale-102 active:scale-98"
                                title={`Selected ${item.selectedGifts.length} gift items (${totalGiftQty} pcs total for this laptop): ${item.selectedGifts.map((g) => `${g.name}${g.quantity && g.quantity > 1 ? ` (x${g.quantity})` : ''}`).join(', ')}`}
                              >
                                <Gift className="w-3 h-3 text-amber-300 fill-amber-300/30 shrink-0" />
                                <span>Gift Qty:</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-white text-purple-700 text-[10px] font-black font-mono leading-none shadow-2xs">
                                  {totalGiftQty}
                                </span>
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Assigned serials summary badge if serials selected */}
                      {isLaptop && item.selectedSerials && item.selectedSerials.length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 truncate font-medium bg-blue-50/70 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
                          <Barcode className="w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold shrink-0">Assigned Serials ({item.selectedSerials.length}/{item.quantity}):</span>
                          <span className="text-slate-600 dark:text-slate-300 truncate font-mono">
                            {item.selectedSerials.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Free gifts summary badge if gifts selected */}
                      {isLaptop && item.selectedGifts && item.selectedGifts.length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-purple-300 truncate font-medium bg-purple-50/70 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
                          <Gift className="w-3 h-3 shrink-0 text-purple-600 dark:text-purple-400" />
                          <span className="font-bold shrink-0">Free Gifts (Qty: {totalGiftQty} · {totalGiftQty * item.quantity} pcs total):</span>
                          <span className="text-slate-600 dark:text-slate-300 truncate">
                            {item.selectedGifts.map((g) => `${g.name}${g.quantity && g.quantity > 1 ? ` (x${g.quantity})` : ''}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total & Editable Unit Price */}
                  <div className="flex flex-col items-end min-w-[85px]">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-400">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.customPrice !== undefined ? item.customPrice : item.product.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdatePrice(item.product.id, isNaN(val) ? 0 : val);
                        }}
                        title="Click to edit unit price"
                        className="w-20 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-blue-400 focus:border-blue-500 rounded px-1.5 py-0.5 text-right font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-text"
                      />
                    </div>
                    {item.quantity > 1 ? (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 tabular-nums">
                        Total: {formatCurrency((item.customPrice ?? item.product.price) * item.quantity)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-sans mt-0.5">Editable</span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Footer: Calculations & Checkout Actions */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-3.5 space-y-3 shrink-0">
        {/* Bill Calculations breakdown */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                {[0, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => onSetDiscountPercent(pct)}
                    className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                      discountPercent === pct
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <span className="font-mono text-rose-600 font-medium tabular-nums">
              -{formatCurrency(discountTotal)}
            </span>
          </div>

          <div className="flex justify-between text-slate-500">
            <span>Govt VAT ({vatRate}%)</span>
            <span className="font-mono font-medium tabular-nums">{formatCurrency(vatAmount)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {orderMode === 'sale' ? 'Total Payable' : 'Quote Estimate'}
            </span>
            <span className="text-lg md:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Hold Order & Pay/Checkout */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={onHoldOrder}
            disabled={cartItems.length === 0}
            className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Suspend this cart and start a new sale"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">Hold</span>
          </button>

          <button
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>{orderMode === 'sale' ? 'Pay / Checkout' : 'Generate Quote'}</span>
            <kbd className="hidden sm:inline bg-blue-700/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
              F9
            </kbd>
          </button>
        </div>
      </div>

      {/* 5. Serial Number Selection Modal Popup */}
      <SerialModal
        isOpen={isSerialModalOpen}
        onClose={() => setIsSerialModalOpen(false)}
        cartItem={serialModalItem}
        onSaveSerials={onUpdateSerials}
      />

      {/* 6. Free Gift Accessories Selection Modal Popup */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        cartItem={giftModalItem}
        onSaveGifts={onUpdateGifts}
      />
    </div>
  );
};
