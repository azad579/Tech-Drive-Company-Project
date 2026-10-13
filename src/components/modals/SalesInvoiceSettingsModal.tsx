import React, { useState } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Receipt,
  Printer,
  Building,
  FileText,
  DollarSign,
  ShieldCheck,
  QrCode,
  Tag,
} from 'lucide-react';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export interface SalesInvoiceSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultVatRate: number;
  defaultPaymentTerms: string;
  companyName: string;
  trnOrVatNumber: string;
  hotlinePhone: string;
  address: string;
  footerNotes: string;
  paperFormat: 'thermal_80mm' | 'a4_full' | 'a5_half';
  showQrCode: boolean;
  showBarcode: boolean;
  showCashierName: boolean;
  showCustomerPhone: boolean;
  showWarrantySummary: boolean;
  allowItemDiscount: boolean;
}

export const DEFAULT_SALES_INVOICE_SETTINGS: SalesInvoiceSettings = {
  invoicePrefix: 'INV-2026-',
  nextInvoiceNumber: 1045,
  defaultVatRate: 5,
  defaultPaymentTerms: 'Cash on Counter',
  companyName: 'NextGen IT Systems Ltd.',
  trnOrVatNumber: 'BIN-192837465-01',
  hotlinePhone: '+880 1823-456789',
  address: 'Level 5, Computer City Centre, Multiplan, Dhaka',
  footerNotes: 'Warranty is void if safety stickers are peeled or damaged. Goods once sold are not returnable without original invoice.',
  paperFormat: 'thermal_80mm',
  showQrCode: true,
  showBarcode: true,
  showCashierName: true,
  showCustomerPhone: true,
  showWarrantySummary: true,
  allowItemDiscount: true,
};

interface SalesInvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: SalesInvoiceSettings) => void;
}

export const SalesInvoiceSettingsModal: React.FC<SalesInvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [settings, setSettings] = useState<SalesInvoiceSettings>(() => {
    const saved = localStorage.getItem('nextgen_sales_invoice_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SALES_INVOICE_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SALES_INVOICE_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'numbering' | 'header' | 'print' | 'terms'>('numbering');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    localStorage.setItem('nextgen_sales_invoice_settings', JSON.stringify(settings));
    if (onSaved) onSaved(settings);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    playClickSound();
    setSettings(DEFAULT_SALES_INVOICE_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Sliders className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">2.3 Sales Invoice Settings</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100">
                  Configuration
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Customize invoice numbering sequence, VAT rate, print layout &amp; header details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('numbering')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'numbering'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Numbering &amp; VAT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'header'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Store Header</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'print'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Layout</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Footer &amp; Terms</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'numbering' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. INV-2026-"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Prepend prefix before each invoice sequence
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Sequence Counter
                  </label>
                  <input
                    type="number"
                    value={settings.nextInvoiceNumber}
                    onChange={(e) => setSettings({ ...settings, nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Example next invoice: <strong className="text-blue-600 dark:text-blue-400 font-mono">{settings.invoicePrefix}{settings.nextInvoiceNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default VAT / Sales Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={settings.defaultVatRate}
                      onChange={(e) => setSettings({ ...settings, defaultVatRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Applied automatically to items without tax exemptions
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Payment Terms
                  </label>
                  <select
                    value={settings.defaultPaymentTerms}
                    onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Cash on Counter">Cash on Counter</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    Allow Item-Level Discount
                  </h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Cashiers can apply specific discounts directly per cart line item
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowItemDiscount}
                  onChange={(e) => setSettings({ ...settings, allowItemDiscount: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Store Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    VAT / TRN / BIN Registration #
                  </label>
                  <input
                    type="text"
                    value={settings.trnOrVatNumber}
                    onChange={(e) => setSettings({ ...settings, trnOrVatNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hotline / Support Phone
                  </label>
                  <input
                    type="text"
                    value={settings.hotlinePhone}
                    onChange={(e) => setSettings({ ...settings, hotlinePhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Store Address (Printed on Invoices)
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'print' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Print Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'thermal_80mm', label: '80mm Thermal', desc: 'Roll printer receipt' },
                    { id: 'a4_full', label: 'A4 Full Page', desc: 'Official tax invoice' },
                    { id: 'a5_half', label: 'A5 Half Page', desc: 'Compact retail invoice' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, paperFormat: fmt.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.paperFormat === fmt.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-750 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{fmt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Visible Invoice Features on Print
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.showQrCode}
                      onChange={(e) => setSettings({ ...settings, showQrCode: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Print QR Verification Code</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.showBarcode}
                      onChange={(e) => setSettings({ ...settings, showBarcode: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Print 1D Code128 Barcode</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.showCashierName}
                      onChange={(e) => setSettings({ ...settings, showCashierName: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Show Served by Cashier Name</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={settings.showWarrantySummary}
                      onChange={(e) => setSettings({ ...settings, showWarrantySummary: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Include 30D Guarantee Note</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Terms &amp; Conditions / Disclaimer (Printed at Bottom of Invoice)
                </label>
                <textarea
                  rows={4}
                  value={settings.footerNotes}
                  onChange={(e) => setSettings({ ...settings, footerNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter return policies, warranty void conditions, etc."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold">NextGen Warranty Notice:</span> Invoices automatically cross-reference with the active 30-Day Guarantee &amp; 5-Year Service Warranty policy configured in Module 1.4.
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {showSuccessToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Sales Invoice Settings Saved Successfully!</span>
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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
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
