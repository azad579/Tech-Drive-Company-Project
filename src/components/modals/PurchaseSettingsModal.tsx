import React, { useState } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Truck,
  Building,
  Package,
  Layers,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export interface PurchaseSettings {
  poPrefix: string;
  nextPoNumber: number;
  directInvoicePrefix: string;
  nextDirectInvoiceNumber: number;
  defaultTaxRate: number;
  defaultSupplierPaymentTerms: string;
  autoIncrementStockOnReceive: boolean;
  autoUpdateProductCostPrice: boolean;
  defaultWarehouseLocation: string;
  allowOverReceiving: boolean;
  printGoodsReceiptNote: boolean;
}

export const DEFAULT_PURCHASE_SETTINGS: PurchaseSettings = {
  poPrefix: 'PO-2026-',
  nextPoNumber: 804,
  directInvoicePrefix: 'PINV-2026-',
  nextDirectInvoiceNumber: 2190,
  defaultTaxRate: 0,
  defaultSupplierPaymentTerms: 'Cash on Delivery',
  autoIncrementStockOnReceive: true,
  autoUpdateProductCostPrice: true,
  defaultWarehouseLocation: 'Central Hub - Motijheel Warehouse',
  allowOverReceiving: false,
  printGoodsReceiptNote: true,
};

interface PurchaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: PurchaseSettings) => void;
}

export const PurchaseSettingsModal: React.FC<PurchaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [settings, setSettings] = useState<PurchaseSettings>(() => {
    const saved = localStorage.getItem('nextgen_purchase_settings');
    if (saved) {
      try {
        return { ...DEFAULT_PURCHASE_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return DEFAULT_PURCHASE_SETTINGS;
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    localStorage.setItem('nextgen_purchase_settings', JSON.stringify(settings));
    if (onSaved) onSaved(settings);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    playClickSound();
    setSettings(DEFAULT_PURCHASE_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Sliders className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">3.3 Purchase Setting</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-100">
                  Procurement Config
                </span>
              </div>
              <p className="text-xs text-purple-200/90 mt-0.5">
                Configure Purchase Orders, Direct Purchase Invoices, receiving rules &amp; stock sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-4">
            {/* Numbering section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>PO &amp; Direct Invoice Sequences</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Order Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.poPrefix}
                    onChange={(e) => setSettings({ ...settings, poPrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="PO-2026-"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next PO Sequence Number
                  </label>
                  <input
                    type="number"
                    value={settings.nextPoNumber}
                    onChange={(e) => setSettings({ ...settings, nextPoNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Purchase Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.directInvoicePrefix}
                    onChange={(e) => setSettings({ ...settings, directInvoicePrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="PINV-2026-"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Direct Invoice Number
                  </label>
                  <input
                    type="number"
                    value={settings.nextDirectInvoiceNumber}
                    onChange={(e) => setSettings({ ...settings, nextDirectInvoiceNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Auto-Sync Rules */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Stock Synchronization &amp; Cost Updates</span>
              </h4>

              <div className="space-y-2.5">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={settings.autoIncrementStockOnReceive}
                    onChange={(e) => setSettings({ ...settings, autoIncrementStockOnReceive: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-Increment Physical Stock in Inventory
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Instantly increase product stock quantities when a Direct Purchase Invoice is confirmed or PO items are received.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={settings.autoUpdateProductCostPrice}
                    onChange={(e) => setSettings({ ...settings, autoUpdateProductCostPrice: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-Update Product Unit Cost (Moving Average / Latest)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sync new purchase costs into the product catalog to recalculate profit margins and valuation accurately.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Procurement Defaults */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Receiving Warehouse
                </label>
                <select
                  value={settings.defaultWarehouseLocation}
                  onChange={(e) => setSettings({ ...settings, defaultWarehouseLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Central Hub - Motijheel Warehouse">Central Hub - Motijheel Warehouse</option>
                  <option value="Showroom Counter - Multiplan Branch">Showroom Counter - Multiplan Branch</option>
                  <option value="IDB Bhaban Branch Storage">IDB Bhaban Branch Storage</option>
                  <option value="Service & RMA Depot">Service &amp; RMA Depot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Supplier Payment Terms
                </label>
                <select
                  value={settings.defaultSupplierPaymentTerms}
                  onChange={(e) => setSettings({ ...settings, defaultSupplierPaymentTerms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Net 15 Days Credit">Net 15 Days Credit</option>
                  <option value="Net 30 Days Credit">Net 30 Days Credit</option>
                  <option value="Consignment Basis">Consignment Basis</option>
                </select>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {showSuccessToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Purchase Settings Saved Successfully!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
