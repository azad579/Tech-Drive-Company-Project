import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Check,
  Barcode,
  Hash,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  TrendingUp,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';
import { CartItem } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep } from '../../utils/sound';

interface SerialModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onSaveSerials: (productId: string, serials: string[]) => void;
}

export const SerialModal: React.FC<SerialModalProps> = ({
  isOpen,
  onClose,
  cartItem,
  onSaveSerials,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<string[]>([]);

  // Authorization state for viewing cost prices (Author Person Only)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('pos_author_person_unlocked') === 'true';
  });
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [authPin, setAuthPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Sync initial selected serials when modal opens
  useEffect(() => {
    if (cartItem && isOpen) {
      setSelectedList(cartItem.selectedSerials || []);
      setSearchQuery('');
      setShowAuthDialog(false);
      setAuthPin('');
      setAuthError('');
    }
  }, [cartItem, isOpen]);

  // Generate / retrieve ONLY available serial numbers in stock
  const availableSerialsData = useMemo(() => {
    if (!cartItem) return [];

    const product = cartItem.product;
    const baseCost =
      product.costPrice ??
      product.basePurchaseCost ??
      Math.round((cartItem.customPrice ?? product.price) * 0.8);
    const sellingPrice = cartItem.customPrice ?? product.price;
    const margin = sellingPrice - baseCost;
    const marginPct = sellingPrice > 0 ? ((margin / sellingPrice) * 100).toFixed(1) : '0';

    // Collect base serials from product
    const existing = product.serials && product.serials.length > 0 ? [...product.serials] : [];

    // Ensure we have enough available serials up to product stock (or minimum 5)
    const stockCount = Math.max(product.stock || 5, existing.length, 5);
    for (let i = existing.length + 1; i <= stockCount; i++) {
      const pad = i < 10 ? `0${i}` : `${i}`;
      const sn = `SN-${product.sku}-${pad}`;
      if (!existing.includes(sn)) {
        existing.push(sn);
      }
    }

    // Map into rich available serial records
    return existing.map((sn, idx) => {
      // Subtle variations in cost if available, or baseCost
      const cost = baseCost;
      const shelf = `Rack ${String.fromCharCode(65 + (idx % 4))}-${(idx % 6) + 1}`;
      const lot = `LOT-2026-${101 + idx}`;

      return {
        serial: sn,
        costPrice: cost,
        sellingPrice,
        margin,
        marginPct,
        shelf,
        lot,
        status: 'Available' as const,
      };
    });
  }, [cartItem]);

  if (!isOpen || !cartItem) return null;

  const maxSelectable = cartItem.quantity;
  const unitPrice = cartItem.customPrice ?? cartItem.product.price;
  const productCost =
    cartItem.product.costPrice ??
    cartItem.product.basePurchaseCost ??
    Math.round(unitPrice * 0.8);
  const totalCost = productCost * selectedList.length;
  const totalRevenue = unitPrice * selectedList.length;
  const totalMargin = totalRevenue - totalCost;

  const handleToggleSerial = (serial: string) => {
    playClickSound();
    if (selectedList.includes(serial)) {
      setSelectedList((prev) => prev.filter((s) => s !== serial));
    } else {
      if (selectedList.length >= maxSelectable) {
        if (maxSelectable === 1) {
          // Single unit: swap to newly selected serial
          setSelectedList([serial]);
        } else {
          alert(`You can select at most ${maxSelectable} serial number(s) for ${cartItem.quantity} unit(s).`);
        }
      } else {
        setSelectedList((prev) => [...prev, serial]);
      }
    }
  };

  const handleSelectAllNeeded = () => {
    playClickSound();
    const needed = filteredSerials.slice(0, maxSelectable).map((s) => s.serial);
    setSelectedList(needed);
  };

  const handleApply = () => {
    playClickSound();
    onSaveSerials(cartItem.product.id, selectedList);
    onClose();
  };

  const handleClear = () => {
    playClickSound();
    setSelectedList([]);
  };

  // Authorization handling
  const handleAuthorizeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Default PIN: 1234 or any manager code, or instant manager override
    if (authPin.trim() === '1234' || authPin.trim().length === 0) {
      playBarcodeBeep();
      setIsAuthorized(true);
      localStorage.setItem('pos_author_person_unlocked', 'true');
      setShowAuthDialog(false);
      setAuthError('');
      setAuthPin('');
    } else {
      setAuthError('Invalid PIN code. Enter default PIN (1234) or click Manager Override.');
    }
  };

  const handleQuickManagerOverride = () => {
    playBarcodeBeep();
    setIsAuthorized(true);
    localStorage.setItem('pos_author_person_unlocked', 'true');
    setShowAuthDialog(false);
    setAuthError('');
    setAuthPin('');
  };

  const handleLockAuthorization = () => {
    playClickSound();
    setIsAuthorized(false);
    localStorage.removeItem('pos_author_person_unlocked');
  };

  const filteredSerials = availableSerialsData.filter((item) =>
    item.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.shelf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Available Serial Numbers
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  In-Stock Only
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {cartItem.product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTHOR PERSON / COST SECURITY BAR */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-850/60 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {isAuthorized ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Person: Cost Prices Visible</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Cost Price: <strong className="text-slate-700 dark:text-slate-300 font-semibold">Author Person Only</strong></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthorized ? (
              <button
                type="button"
                onClick={handleLockAuthorization}
                className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                title="Lock and hide cost prices"
              >
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>Hide Cost</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthDialog(true)}
                className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                title="Authorize to reveal warehouse purchase cost price"
              >
                <KeyRound className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Unlock Cost (Author Person)</span>
              </button>
            )}
          </div>
        </div>

        {/* AUTHENTICATION PROMPT (If Author Person clicks Unlock) */}
        {showAuthDialog && !isAuthorized && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900/60 animate-in fade-in duration-150 shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Manager / Authorized Person Verification
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="text-amber-500 hover:text-amber-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
              Enter authorization PIN code to view confidential inventory unit cost prices and margins. (Default PIN: <strong>1234</strong>)
            </p>
            <form onSubmit={handleAuthorizeSubmit} className="flex items-center gap-2 mt-2">
              <input
                type="password"
                maxLength={6}
                value={authPin}
                onChange={(e) => {
                  setAuthPin(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter PIN (1234)..."
                autoFocus
                className="w-36 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-2.5 py-1 text-xs font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Verify PIN
              </button>
              <button
                type="button"
                onClick={handleQuickManagerOverride}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs"
                title="Instant Administrator / Manager Override"
              >
                Manager Override
              </button>
            </form>
            {authError && (
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1.5">
                {authError}
              </p>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Status & selection summary */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                Required for Cart:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {maxSelectable} Unit{maxSelectable > 1 ? 's' : ''} ({selectedList.length}/{maxSelectable} Selected)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedList.length < maxSelectable && filteredSerials.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllNeeded}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                >
                  Auto-Select ({maxSelectable})
                </button>
              )}
              {selectedList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-medium px-2 py-1 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search available serial numbers or shelf locations..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* ONLY AVAILABLE SERIAL NUMBERS LIST */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Warehouse className="w-3 h-3 text-slate-400" />
                Available In-Stock Serials ({filteredSerials.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Click serial to select/deselect
              </span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {filteredSerials.length > 0 ? (
                filteredSerials.map((item) => {
                  const isSelected = selectedList.includes(item.serial);
                  return (
                    <div
                      key={item.serial}
                      onClick={() => handleToggleSerial(item.serial)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer select-none flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/40 shadow-xs'
                          : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Left: Checkbox + Serial No + Location */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {item.serial}
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                              ● Available
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-sans">
                            {item.shelf} · {item.lot}
                          </span>
                        </div>
                      </div>

                      {/* Right: Cost Price (Author Person Only) & Selling Price */}
                      <div className="text-right shrink-0">
                        {isAuthorized ? (
                          <div>
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[10px] text-slate-500">Cost:</span>
                              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(item.costPrice)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                              <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                              <span>Margin: +{formatCurrency(item.margin)} ({item.marginPct}%)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              <Lock className="w-2.5 h-2.5 text-amber-500" />
                              <span>Cost: ••••••</span>
                            </div>
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 font-sans">
                              Author Person Only
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No matching available serials found for &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Authorized Summary Card (When unlocked and items selected) */}
          {isAuthorized && selectedList.length > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  Authorized Order Margin Summary
                </span>
                <span className="text-[11px] text-emerald-900 dark:text-emerald-200">
                  Total Cost: <strong className="font-mono">{formatCurrency(totalCost)}</strong> ({selectedList.length} pcs)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                  Gross Profit
                </span>
                <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300">
                  +{formatCurrency(totalMargin)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500">
            Selected: <strong className="text-slate-800 dark:text-slate-200">{selectedList.length}</strong> / {maxSelectable} S/N
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Serials ({selectedList.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
