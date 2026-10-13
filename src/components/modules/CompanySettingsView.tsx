import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Printer,
  FileText,
  CreditCard,
  Check,
  Globe,
  Phone,
  Mail,
  Palette,
  Sliders,
  Eye,
  Sparkles,
} from 'lucide-react';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import {
  LetterheadConfig,
  LetterheadTemplate,
  getStoredLetterheadConfig,
  saveStoredLetterheadConfig,
} from '../../utils/letterheadService';
import { CompanyLetterheadModal } from '../modals/CompanyLetterheadModal';

export const CompanySettingsView: React.FC = () => {
  const [letterheadConfig, setLetterheadConfig] = useState<LetterheadConfig>(() =>
    getStoredLetterheadConfig()
  );
  const [isLetterheadModalOpen, setIsLetterheadModalOpen] = useState(false);

  const [companyName, setCompanyName] = useState(letterheadConfig.companyName || 'NextGen IT Systems Ltd.');
  const [companyNameBn, setCompanyNameBn] = useState(letterheadConfig.companyNameBn || 'নেক্সটজেন আইটি সিস্টেমস লিমিটেড');
  const [tagline, setTagline] = useState(letterheadConfig.tagline || 'Premier Computer, Laptop & IT Hardware Solutions');
  const [phone, setPhone] = useState(letterheadConfig.phone || '+880 1711-000000');
  const [whatsapp, setWhatsapp] = useState(letterheadConfig.whatsapp || '+880 1823-456789');
  const [email, setEmail] = useState(letterheadConfig.email || 'sales@nextgenit.com.bd');
  const [address, setAddress] = useState(
    letterheadConfig.addressLine1 + ', ' + letterheadConfig.addressLine2
  );
  const [vatNumber, setVatNumber] = useState(letterheadConfig.binVatReg || 'BIN-003928192-0101');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [footerMessage, setFooterMessage] = useState(
    letterheadConfig.footerText ||
      'Thank you for choosing NextGen IT! 15-day return policy with original receipt & packaging.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const cfg = getStoredLetterheadConfig();
      setLetterheadConfig(cfg);
      setCompanyName(cfg.companyName);
      setCompanyNameBn(cfg.companyNameBn || '');
      setTagline(cfg.tagline);
      setPhone(cfg.phone);
      setWhatsapp(cfg.whatsapp);
      setEmail(cfg.email);
      setVatNumber(cfg.binVatReg);
      setFooterMessage(cfg.footerText);
    };
    window.addEventListener('erp_letterhead_updated', handleUpdate);
    return () => window.removeEventListener('erp_letterhead_updated', handleUpdate);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    // Split address into two lines if comma present
    const addrParts = address.split(',');
    const line1 = addrParts[0]?.trim() || address;
    const line2 = addrParts.slice(1).join(',').trim() || '';

    const updatedConfig: LetterheadConfig = {
      ...letterheadConfig,
      companyName,
      companyNameBn,
      tagline,
      phone,
      whatsapp,
      email,
      addressLine1: line1,
      addressLine2: line2 || letterheadConfig.addressLine2,
      binVatReg: vatNumber,
      footerText: footerMessage,
    };

    saveStoredLetterheadConfig(updatedConfig);
    setLetterheadConfig(updatedConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTemplateChange = (tpl: LetterheadTemplate) => {
    playClickSound();
    const updated = { ...letterheadConfig, template: tpl };
    setLetterheadConfig(updated);
    saveStoredLetterheadConfig(updated);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto font-sans text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>ERP Master</span>
            <span>›</span>
            <span className="text-white font-semibold">12. Company &amp; Letterhead Settings</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" />
            <span>Company Branding &amp; System Settings</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Settings Saved!
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsLetterheadModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Palette className="w-4 h-4" />
            <span>Open Letterhead Designer</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Official Company Letterhead Stationery */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Official Company Letterhead Stationery
                  </h3>
                  <p className="text-xs text-slate-400">
                    Template used when printing or sending Quotations &amp; Invoices
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsLetterheadModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Full Letterhead Designer &amp; Preview</span>
              </button>
            </div>

            {/* Quick Template Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Letterhead Design Template:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'corporate', label: 'Corporate Blue', desc: 'Navy header & badge' },
                  { id: 'modern', label: 'Modern Gradient', desc: 'Accent stripe & pills' },
                  { id: 'minimal', label: 'Minimal Slate', desc: 'Sleek fine rules' },
                  { id: 'bordered', label: 'Executive Boxed', desc: 'Formal framed border' },
                  { id: 'preprinted', label: 'Pre-Printed Pad', desc: 'Stationery paper gap' },
                ].map((tpl) => {
                  const isSelected = letterheadConfig.template === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id as LetterheadTemplate)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-white ring-2 ring-blue-500/30'
                          : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-xs">{tpl.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tpl.desc}</div>
                      <div className="mt-2 text-[10px] font-bold">
                        {isSelected ? (
                          <span className="text-blue-400">✓ Active</span>
                        ) : (
                          <span className="text-slate-500">Select</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Watermark & Preprinted Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Document Watermark</span>
                  <span className="text-[11px] text-slate-400">
                    Faint security watermark on center of page
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={letterheadConfig.showWatermark}
                  onChange={(e) => {
                    const up = { ...letterheadConfig, showWatermark: e.target.checked };
                    setLetterheadConfig(up);
                    saveStoredLetterheadConfig(up);
                  }}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Pre-Printed Top Margin</span>
                  <span className="text-[11px] text-slate-400">
                    Gap for physical stationery: {letterheadConfig.topMarginPreprintedMm}mm
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLetterheadModalOpen(true)}
                  className="text-xs text-blue-400 hover:underline font-bold"
                >
                  Adjust
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: General Company Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Company Legal Profile &amp; Billing Data</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Company / Shop Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Company Name (Bangla / Local Script)</label>
                <input
                  type="text"
                  value={companyNameBn}
                  onChange={(e) => setCompanyNameBn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden font-sans"
                  placeholder="e.g. নেক্সটজেন আইটি সিস্টেমস লিমিটেড"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-slate-300">Tagline / Business Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Contact Hotline Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">
                  <span className="text-emerald-400 font-bold">WhatsApp Business Number</span>
                  <span className="text-[10px] text-slate-400 ml-1">(Used for Quotations)</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-semibold text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">VAT / BIN Registration #</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold mb-1 text-slate-300">Address &amp; Branch Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Receipt & Invoicing Policy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Receipt &amp; Invoice Printing Preferences</span>
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">
                  Receipt Footer Terms &amp; Return Policy
                </label>
                <textarea
                  rows={2}
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Print Barcode &amp; Serial Number on Invoices</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Auto-open Cash Drawer upon Cash Checkout</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal: Full Letterhead Designer */}
      {isLetterheadModalOpen && (
        <CompanyLetterheadModal
          isOpen={isLetterheadModalOpen}
          onClose={() => setIsLetterheadModalOpen(false)}
        />
      )}
    </div>
  );
};
