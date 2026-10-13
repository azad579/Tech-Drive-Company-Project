import React, { useState } from 'react';
import {
  X,
  Printer,
  Save,
  RotateCcw,
  Building,
  Check,
  Palette,
  Phone,
  Mail,
  Globe,
  Sliders,
  FileText,
  ShieldCheck,
  CreditCard,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  LetterheadConfig,
  LetterheadTemplate,
  getStoredLetterheadConfig,
  saveStoredLetterheadConfig,
  resetToDefaultLetterheadConfig,
} from '../../utils/letterheadService';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface CompanyLetterheadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyLetterheadModal: React.FC<CompanyLetterheadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<LetterheadConfig>(() => getStoredLetterheadConfig());
  const [activeTab, setActiveTab] = useState<'branding' | 'contacts' | 'stationery' | 'bank' | 'preview'>('branding');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    playCashDrawerDing();
    saveStoredLetterheadConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset all company letterhead settings to official factory default?')) {
      playClickSound();
      const def = resetToDefaultLetterheadConfig();
      setConfig(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handlePrintSample = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Company Letterhead &amp; Official Stationery
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Branding Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Design official company header, watermark, seals, and physical pre-printed stationary settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Letterhead Saved
              </span>
            )}
            <button
              type="button"
              onClick={handlePrintSample}
              className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Sample Letterhead"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sample</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="px-5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          {[
            { id: 'branding', label: '1. Brand & Template', icon: Palette },
            { id: 'contacts', label: '2. Contacts & Tax', icon: Phone },
            { id: 'stationery', label: '3. Stationery & Watermark', icon: Sliders },
            { id: 'bank', label: '4. Bank & Signatory', icon: CreditCard },
            { id: 'preview', label: '5. Live A4 Document Preview', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950/60 space-y-5">
          {/* TAB 1: BRANDING & TEMPLATE */}
          {activeTab === 'branding' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Template Selector Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Letterhead Design Template:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    {
                      id: 'corporate',
                      title: 'Corporate Blue',
                      desc: 'Classic executive navy header with official badge & contact grid',
                      badge: 'Most Popular',
                    },
                    {
                      id: 'modern',
                      title: 'Modern Gradient',
                      desc: 'Centered logo, sleek brand stripe, vibrant contact pills',
                      badge: 'Contemporary',
                    },
                    {
                      id: 'minimal',
                      title: 'Minimal Slate',
                      desc: 'Monochrome high-fashion typography with ultra-fine rules',
                      badge: 'Clean & Sleek',
                    },
                    {
                      id: 'bordered',
                      title: 'Executive Boxed',
                      desc: 'Formal bordered frame with official corner accents',
                      badge: 'Official / Legal',
                    },
                    {
                      id: 'preprinted',
                      title: 'Pre-Printed Paper',
                      desc: 'Blank header margin gap for physical printed stationery sheets',
                      badge: 'Stationery Pad',
                    },
                  ].map((tpl) => {
                    const isSelected = config.template === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          playClickSound();
                          setConfig((prev) => ({ ...prev, template: tpl.id as LetterheadTemplate }));
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-lg shadow-blue-950/40'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5 ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tpl.badge}
                          </span>
                          <h4 className="font-bold text-sm text-white">{tpl.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tpl.desc}</p>
                        </div>
                        <div className="pt-3 flex items-center justify-between text-xs font-semibold">
                          <span className={isSelected ? 'text-blue-400' : 'text-slate-500'}>
                            {isSelected ? '✓ Selected' : 'Choose'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Company Identity Fields */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>Company Identity &amp; Slogan</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Company Legal Name (English) *
                    </label>
                    <input
                      type="text"
                      value={config.companyName}
                      onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Company Name (Bangla / Local Script)
                    </label>
                    <input
                      type="text"
                      value={config.companyNameBn || ''}
                      onChange={(e) => setConfig({ ...config, companyNameBn: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden font-sans"
                      placeholder="e.g. নেক্সটজেন আইটি সিস্টেমস লিমিটেড"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-300">
                      Tagline / Corporate Slogan
                    </label>
                    <input
                      type="text"
                      value={config.tagline}
                      onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-10 h-9 rounded-lg border border-slate-700 cursor-pointer bg-slate-800 p-0.5"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-10 h-9 rounded-lg border border-slate-700 cursor-pointer bg-slate-800 p-0.5"
                      />
                      <input
                        type="text"
                        value={config.accentColor}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS & TAX */}
          {activeTab === 'contacts' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Official Contact Details &amp; Registration Numbers</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Hotline / Primary Phone
                    </label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">WhatsApp Business Number</span>
                      <span className="text-[10px] text-slate-400">(Used for Quotations)</span>
                    </label>
                    <input
                      type="text"
                      value={config.whatsapp}
                      onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-semibold text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Official Sales Email
                    </label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={(e) => setConfig({ ...config, email: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={config.website}
                      onChange={(e) => setConfig({ ...config, website: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-300">
                      Registered Head Office / Showroom Address (Line 1)
                    </label>
                    <input
                      type="text"
                      value={config.addressLine1}
                      onChange={(e) => setConfig({ ...config, addressLine1: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-300">
                      City, Postal Code &amp; Country (Line 2)
                    </label>
                    <input
                      type="text"
                      value={config.addressLine2}
                      onChange={(e) => setConfig({ ...config, addressLine2: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      BIN / VAT Registration #
                    </label>
                    <input
                      type="text"
                      value={config.binVatReg}
                      onChange={(e) => setConfig({ ...config, binVatReg: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Trade License #
                    </label>
                    <input
                      type="text"
                      value={config.tradeLicense}
                      onChange={(e) => setConfig({ ...config, tradeLicense: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATIONERY & WATERMARK */}
          {activeTab === 'stationery' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Stationery Printing, Margin Gap &amp; Watermark</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Pre-printed Stationary Margin Gap */}
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Pre-Printed Stationery Top Gap</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                        {config.topMarginPreprintedMm} mm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      If your enterprise prints on physical stationary paper with pre-printed logos, adjust this margin gap so quotation text starts below your physical header.
                    </p>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={config.topMarginPreprintedMm}
                      onChange={(e) =>
                        setConfig({ ...config, topMarginPreprintedMm: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30mm (Compact)</span>
                      <span>55mm (Standard)</span>
                      <span>90mm (Deep)</span>
                    </div>
                  </div>

                  {/* Watermark Controls */}
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-3">
                    <label className="flex items-center justify-between font-bold text-white cursor-pointer">
                      <span>Enable Page Watermark</span>
                      <input
                        type="checkbox"
                        checked={config.showWatermark}
                        onChange={(e) => setConfig({ ...config, showWatermark: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Renders a subtle, security-verified watermark across the middle of quotations and invoices.
                    </p>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        value={config.watermarkText}
                        onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
                        disabled={!config.showWatermark}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Footer Terms */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-semibold text-slate-300">
                      Standard Letterhead Footer Message &amp; Policy
                    </label>
                    <textarea
                      rows={2}
                      value={config.footerText}
                      onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BANK & SIGNATORY */}
          {activeTab === 'bank' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Company Bank Account (For B2B Wire Transfer &amp; Quotation Payment)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      value={config.bankDetails.bankName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, bankName: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Account Name</label>
                    <input
                      type="text"
                      value={config.bankDetails.accountName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, accountName: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Account Number</label>
                    <input
                      type="text"
                      value={config.bankDetails.accountNumber}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, accountNumber: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Branch Name</label>
                    <input
                      type="text"
                      value={config.bankDetails.branch}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, branch: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Routing Number / IBAN</label>
                    <input
                      type="text"
                      value={config.bankDetails.routingNumber || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, routingNumber: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      value={config.bankDetails.swiftCode || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          bankDetails: { ...config.bankDetails, swiftCode: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pt-3 pb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Authorized Signatory &amp; Official Seal</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Signatory Officer Name</label>
                    <input
                      type="text"
                      value={config.signatoryName}
                      onChange={(e) => setConfig({ ...config, signatoryName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Designation / Title</label>
                    <input
                      type="text"
                      value={config.signatoryTitle}
                      onChange={(e) => setConfig({ ...config, signatoryTitle: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 font-medium text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showAuthorizedSeal}
                        onChange={(e) => setConfig({ ...config, showAuthorizedSeal: e.target.checked })}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span>Show Official Company Round Seal Stamp on Letterhead</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE A4 DOCUMENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center justify-center p-2">
              <div className="text-center mb-3">
                <span className="text-xs text-slate-400 font-medium">
                  Live preview of A4 page rendered with template: <strong className="text-blue-400 uppercase">{config.template}</strong>
                </span>
              </div>

              {/* A4 Sheet Simulation */}
              <div
                id="letterhead-preview-sheet"
                className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-10 font-sans border border-slate-300 relative select-text"
                style={{
                  minHeight: '850px',
                }}
              >
                {/* Watermark */}
                {config.showWatermark && config.template !== 'preprinted' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                    <div
                      className="text-6xl sm:text-7xl font-black uppercase tracking-widest -rotate-35 text-slate-900 select-none"
                      style={{ opacity: config.watermarkOpacity }}
                    >
                      {config.watermarkText || config.companyName}
                    </div>
                  </div>
                )}

                {/* TEMPLATE: PREPRINTED */}
                {config.template === 'preprinted' && (
                  <div
                    className="border-b border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs italic mb-6"
                    style={{ height: `${config.topMarginPreprintedMm * 2.5}px` }}
                  >
                    <span>[ Reserved {config.topMarginPreprintedMm}mm gap for physical pre-printed stationery letterhead ]</span>
                  </div>
                )}

                {/* TEMPLATE: CORPORATE */}
                {config.template === 'corporate' && (
                  <div className="border-b-2 border-blue-900 pb-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          {config.logoText || 'N'}
                        </div>
                        <div>
                          <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: config.primaryColor }}
                          >
                            {config.companyName}
                          </h1>
                          {config.companyNameBn && (
                            <p className="text-xs font-semibold text-slate-600 font-sans">
                              {config.companyNameBn}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 mt-0.5 italic">
                            {config.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-600 space-y-0.5 leading-tight font-medium">
                        <p className="font-semibold text-slate-800">{config.addressLine1}</p>
                        <p>{config.addressLine2}</p>
                        <p>
                          Hotline: <strong className="text-slate-900">{config.phone}</strong>
                        </p>
                        <p>
                          WhatsApp: <strong className="text-emerald-700">{config.whatsapp}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {config.binVatReg} · {config.tradeLicense}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE: MODERN */}
                {config.template === 'modern' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
                          }}
                        >
                          {config.logoText || 'N'}
                        </div>
                        <div>
                          <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            {config.companyName}
                          </h1>
                          <p className="text-xs text-blue-600 font-semibold">{config.tagline}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <p className="font-mono">{config.email}</p>
                        <p className="font-mono font-bold text-slate-800">{config.phone}</p>
                        <p className="text-[10px] text-slate-400">{config.website}</p>
                      </div>
                    </div>
                    {/* Modern gradient stripe */}
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${config.primaryColor}, ${config.accentColor}, #06b6d4)`,
                      }}
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>{config.addressLine1}, {config.addressLine2}</span>
                      <span className="font-mono">{config.binVatReg}</span>
                    </div>
                  </div>
                )}

                {/* TEMPLATE: MINIMAL */}
                {config.template === 'minimal' && (
                  <div className="border-b border-slate-300 pb-4 mb-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase text-slate-950">
                          {config.companyName}
                        </h1>
                        <p className="text-[11px] text-slate-500 tracking-wider uppercase mt-0.5">
                          {config.tagline}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                        <p>{config.addressLine1}</p>
                        <p>{config.phone} · {config.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE: BORDERED */}
                {config.template === 'bordered' && (
                  <div className="border-2 border-slate-800 p-4 mb-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-black tracking-wide uppercase text-slate-900">
                          {config.companyName}
                        </h1>
                        <p className="text-xs text-slate-600 font-serif italic">{config.tagline}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{config.addressLine1}, {config.addressLine2}</p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="w-12 h-12 border-2 border-slate-800 rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-1">
                          {config.logoText}
                        </div>
                        <p className="font-mono text-[10px]">{config.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample Quotation Content Body */}
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                        Document Type:
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">OFFICIAL PRICE QUOTATION</h3>
                      <p className="text-slate-600 text-[11px]">Ref: QT-2026-0042 · Date: 07/10/2026</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">Valid Until:</span>
                      <p className="font-bold text-slate-900">22/10/2026 (15 Days)</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Ready for WhatsApp
                      </span>
                    </div>
                  </div>

                  {/* Customer Block */}
                  <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Client Organization:</span>
                      <h4 className="font-bold text-slate-900">Apex Software &amp; Solutions Ltd.</h4>
                      <p className="text-slate-600 text-[11px]">Attn: Mr. Tanvir Ahmed (Procurement Lead)</p>
                      <p className="text-slate-600 text-[11px]">Banani, Dhaka-1213 · +880 1711-456789</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Subject:</span>
                      <p className="font-semibold text-slate-800">
                        Supply of Intel Core i7 14th Gen Workstations &amp; 4K Displays
                      </p>
                    </div>
                  </div>

                  {/* Sample Items Table */}
                  <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Sl</th>
                        <th className="p-2">Description &amp; Specifications</th>
                        <th className="p-2 text-center">Warranty</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2">1</td>
                        <td className="p-2 font-semibold">
                          NextGen Pro Workstation (i7-14700K, 32GB RAM, 1TB NVMe, RTX 4060)
                        </td>
                        <td className="p-2 text-center text-slate-600">3 Years</td>
                        <td className="p-2 text-center font-bold">3</td>
                        <td className="p-2 text-right">৳125,000</td>
                        <td className="p-2 text-right font-bold">৳375,000</td>
                      </tr>
                      <tr>
                        <td className="p-2">2</td>
                        <td className="p-2 font-semibold">
                          Dell UltraSharp 27" 4K UHD IPS USB-C Monitor (U2723QE)
                        </td>
                        <td className="p-2 text-center text-slate-600">3 Years</td>
                        <td className="p-2 text-center font-bold">3</td>
                        <td className="p-2 text-right">৳58,500</td>
                        <td className="p-2 text-right font-bold">৳175,500</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={5} className="p-2 text-right">Grand Total:</td>
                        <td className="p-2 text-right text-blue-700 text-sm">৳550,500</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Bank & Signature Block */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-[10px] space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="font-bold uppercase text-slate-800">Bank Account for Payment:</span>
                      <p>Bank: {config.bankDetails.bankName}</p>
                      <p>A/C Name: {config.bankDetails.accountName}</p>
                      <p className="font-mono font-bold text-slate-900">A/C: {config.bankDetails.accountNumber}</p>
                      <p>Branch: {config.bankDetails.branch}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      {config.showAuthorizedSeal && (
                        <div className="w-16 h-16 rounded-full border-2 border-red-500/80 text-red-600 flex flex-col items-center justify-center text-[7px] font-black uppercase text-center rotate-6 select-none opacity-80">
                          <span>{config.companyName.split(' ')[0]}</span>
                          <span className="text-[6px]">★ SEAL ★</span>
                          <span>VERIFIED</span>
                        </div>
                      )}
                      <div className="text-center pt-2 border-t border-slate-400 w-44">
                        <p className="font-bold text-slate-900 text-xs">{config.signatoryName}</p>
                        <p className="text-[10px] text-slate-500">{config.signatoryTitle}</p>
                        <p className="text-[9px] text-slate-400">{config.companyName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Letterhead Footer */}
                  <div className="pt-6 border-t border-slate-300 text-center text-[10px] text-slate-500">
                    <p>{config.footerText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Apply Letterhead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
