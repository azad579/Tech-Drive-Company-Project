import React, { useState } from 'react';
import { X, Gift, Check, Plus, Trash2, Package } from 'lucide-react';
import { CartItem, GiftItem } from '../../types/pos';
import { playClickSound } from '../../utils/sound';

export const DEFAULT_GIFT_ACCESSORIES: GiftItem[] = [
  { id: 'gift-1', name: 'Premium Water-resistant Laptop Backpack', sku: 'GIFT-BAG-01' },
  { id: 'gift-2', name: 'Wireless 2.4GHz Optical Mouse', sku: 'GIFT-MSE-02' },
  { id: 'gift-3', name: 'Extended Speed Gaming Mouse Pad', sku: 'GIFT-PAD-03' },
  { id: 'gift-4', name: 'Silicone Keyboard Protector Skin', sku: 'GIFT-SKN-04' },
  { id: 'gift-5', name: '4-in-1 Screen Cleaning Kit & Microfiber', sku: 'GIFT-CLN-05' },
  { id: 'gift-6', name: 'USB-C to USB 3.0 High-Speed OTG Adapter', sku: 'GIFT-OTG-06' },
  { id: 'gift-7', name: 'Foldable Aluminum Laptop Cooling Stand', sku: 'GIFT-STD-07' },
  { id: 'gift-8', name: 'In-Ear Stereo Earphones with Mic', sku: 'GIFT-EAR-08' },
];

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onSaveGifts: (productId: string, gifts: GiftItem[]) => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  cartItem,
  onSaveGifts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customGiftInput, setCustomGiftInput] = useState('');
  const [selectedGifts, setSelectedGifts] = useState<GiftItem[]>([]);

  // Sync initial gifts when modal opens
  React.useEffect(() => {
    if (cartItem) {
      setSelectedGifts(cartItem.selectedGifts || []);
      setSearchQuery('');
      setCustomGiftInput('');
    }
  }, [cartItem, isOpen]);

  if (!isOpen || !cartItem) return null;

  const MAX_GIFTS = 5;

  const handleToggleGift = (gift: GiftItem) => {
    playClickSound();
    const exists = selectedGifts.some((g) => g.id === gift.id);
    if (exists) {
      setSelectedGifts((prev) => prev.filter((g) => g.id !== gift.id));
    } else {
      if (selectedGifts.length >= MAX_GIFTS) {
        alert(`You can choose up to ${MAX_GIFTS} gift accessories.`);
        return;
      }
      setSelectedGifts((prev) => [...prev, { ...gift, quantity: 1 }]);
    }
  };

  const handleUpdateGiftQty = (giftId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setSelectedGifts((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        const currentQty = g.quantity || 1;
        const newQty = Math.max(1, Math.min(10, currentQty + delta));
        return { ...g, quantity: newQty };
      })
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customGiftInput.trim();
    if (!val) return;
    if (selectedGifts.length >= MAX_GIFTS) {
      alert(`You can choose up to ${MAX_GIFTS} gift accessories.`);
      return;
    }
    playClickSound();
    const customItem: GiftItem = {
      id: 'custom-gift-' + Date.now(),
      name: val,
      sku: 'GIFT-CUST',
      quantity: 1,
    };
    setSelectedGifts((prev) => [...prev, customItem]);
    setCustomGiftInput('');
  };

  const totalGiftQty = selectedGifts.reduce((sum, g) => sum + (g.quantity || 1), 0);

  const handleApply = () => {
    playClickSound();
    onSaveGifts(cartItem.product.id, selectedGifts);
    onClose();
  };

  const handleClear = () => {
    playClickSound();
    setSelectedGifts([]);
    onSaveGifts(cartItem.product.id, []);
    onClose();
  };

  const filteredAccessories = DEFAULT_GIFT_ACCESSORIES.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.sku && g.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-50/70 dark:bg-purple-950/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Choose Free Gift Accessories</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                  Max 5 Items
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                Bundled with: <strong>{cartItem.product.name}</strong> (Qty will count as {cartItem.quantity} unit{cartItem.quantity > 1 ? 's' : ''})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Status Counter Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Selected: <span className="text-purple-600 dark:text-purple-400 font-bold">{selectedGifts.length} items</span> ({totalGiftQty} pcs total) / {MAX_GIFTS} gifts
              </div>
              <span className="text-[11px] text-slate-400">
                (Per laptop: <strong className="text-slate-700 dark:text-slate-300">{cartItem.quantity}x</strong>)
              </span>
            </div>
            {selectedGifts.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessory gifts..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Gift Accessories Grid / List */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Available Accessories for Free Gift Bundle
            </span>
            <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/40 dark:bg-slate-850/40">
              {filteredAccessories.map((gift) => {
                const selectedItem = selectedGifts.find((g) => g.id === gift.id);
                const isSelected = !!selectedItem;
                return (
                  <div
                    key={gift.id}
                    onClick={() => handleToggleGift(gift)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                        isSelected
                          ? 'border-white bg-white text-purple-600 font-bold'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-purple-600 stroke-3" />}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold block truncate">{gift.name}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                          {gift.sku} · Qty multiplier: {cartItem.quantity}x
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <div
                          className="flex items-center border border-purple-400 bg-purple-700/80 rounded-md overflow-hidden text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleUpdateGiftQty(gift.id, -1, e)}
                            className="px-1.5 py-0.5 hover:bg-purple-800 text-[11px] font-bold cursor-pointer"
                            title="Decrease gift quantity"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-[11px] font-mono font-bold">
                            Qty: {selectedItem.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleUpdateGiftQty(gift.id, 1, e)}
                            className="px-1.5 py-0.5 hover:bg-purple-800 text-[11px] font-bold cursor-pointer"
                            title="Increase gift quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add custom accessory gift */}
          <form onSubmit={handleAddCustom} className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Add Other Custom Accessory as Gift
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customGiftInput}
                onChange={(e) => setCustomGiftInput(e.target.value)}
                placeholder="e.g. Type-C Card Reader, Stylus Pen..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!customGiftInput.trim() || selectedGifts.length >= MAX_GIFTS}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Package className="w-3.5 h-3.5 text-purple-500" />
            <span>Count will multiply with laptop quantity ({cartItem.quantity}x)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Gifts ({totalGiftQty} pcs)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
