import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Phone,
  Send,
  Building,
  Sparkles,
  Smartphone,
  Globe,
} from 'lucide-react';
import {
  Quotation,
  buildWhatsAppQuoteUrl,
  updateQuotation,
  sanitizeWhatsAppPhone,
} from '../../utils/quotationService';
import { getStoredLetterheadConfig } from '../../utils/letterheadService';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onQuotationUpdated?: (quote: Quotation) => void;
}

const COUNTRY_CODES = [
  { code: '880', label: '🇧🇩 Bangladesh (+880)', flag: '🇧🇩' },
  { code: '91', label: '🇮🇳 India (+91)', flag: '🇮🇳' },
  { code: '971', label: '🇦🇪 UAE (+971)', flag: '🇦🇪' },
  { code: '966', label: '🇸🇦 Saudi Arabia (+966)', flag: '🇸🇦' },
  { code: '1', label: '🇺🇸 / 🇨🇦 USA / Canada (+1)', flag: '🇺🇸' },
  { code: '44', label: '🇬🇧 UK (+44)', flag: '🇬🇧' },
  { code: '65', label: '🇸🇬 Singapore (+65)', flag: '🇸🇬' },
  { code: '60', label: '🇲🇾 Malaysia (+60)', flag: '🇲🇾' },
  { code: '61', label: '🇦🇺 Australia (+61)', flag: '🇦🇺' },
  { code: '974', label: '🇶🇦 Qatar (+974)', flag: '🇶🇦' },
  { code: '968', label: '🇴🇲 Oman (+968)', flag: '🇴🇲' },
];

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onQuotationUpdated,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('880');
  const [phoneInput, setPhoneInput] = useState('');
  const [customGreeting, setCustomGreeting] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const letterhead = getStoredLetterheadConfig();

  useEffect(() => {
    if (isOpen && quotation) {
      setPhoneInput(quotation.partyPhone || '');
      setCustomGreeting(`Dear ${quotation.partyName || 'Customer'},`);
      const { message } = buildWhatsAppQuoteUrl(quotation, letterhead);
      setCustomMessage(message);
      setCopiedText(false);
      setCopiedLink(false);
      setIsEditingMessage(false);
    }
  }, [isOpen, quotation]);

  if (!isOpen || !quotation) return null;

  // Compute clean phone & URLs
  const cleanPhone = sanitizeWhatsAppPhone(phoneInput, selectedCountryCode);
  const messageToSend = isEditingMessage
    ? customMessage
    : buildWhatsAppQuoteUrl(quotation, letterhead, phoneInput, customGreeting).message;
  const encodedText = encodeURIComponent(messageToSend);

  const waMeUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  const waWebUrl = cleanPhone
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;

  const handleSendViaWhatsApp = (url: string) => {
    playCashDrawerDing();
    // Update quotation status to 'Sent'
    const now = new Date();
    const updated: Quotation = {
      ...quotation,
      status: quotation.status === 'Draft' ? 'Sent' : quotation.status,
      sentViaWhatsAppAt: `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      whatsappPhoneUsed: phoneInput,
    };
    updateQuotation(updated);
    if (onQuotationUpdated) onQuotationUpdated(updated);

    // Open WhatsApp link in new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    playClickSound();
    navigator.clipboard.writeText(messageToSend);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyLink = () => {
    playClickSound();
    navigator.clipboard.writeText(waMeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh]">
        {/* Modal Top Header with WhatsApp Green accent */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-950 to-slate-950 border-b border-emerald-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Send Quotation by WhatsApp</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  WhatsApp Direct
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate click-to-chat WhatsApp link with formatted quote &amp; letterhead info
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Quick Quote Info Pill Banner */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Quotation Document:</span>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>{quotation.quoteNumber}</span>
                <span className="text-xs font-normal text-slate-400">· {quotation.partyName}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Grand Total:</span>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {formatCurrency(quotation.grandTotal)}
              </div>
            </div>
          </div>

          {/* Recipient Phone Configuration */}
          <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recipient WhatsApp Mobile Number:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-hidden font-medium"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-7 flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 01711-456789 or +88017..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono font-semibold text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                {quotation.partyPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setPhoneInput(quotation.partyPhone || '');
                    }}
                    className="px-2.5 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-[11px] text-slate-300 hover:text-white hover:bg-slate-750 transition-colors whitespace-nowrap cursor-pointer"
                    title="Autofill from Quotation Customer Phone"
                  >
                    Customer Phone
                  </button>
                )}
              </div>
            </div>

            {cleanPhone ? (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <span className="text-emerald-400 font-bold">✓ Formatted WhatsApp ID:</span>
                <span>+{cleanPhone}</span>
              </p>
            ) : (
              <p className="text-[11px] text-amber-400/90 italic">
                * Enter customer's mobile number above to automatically target their WhatsApp chat.
              </p>
            )}
          </div>

          {/* WhatsApp Message Preview / Edit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Message Preview (Pre-Formatted Markdown)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsEditingMessage(!isEditingMessage);
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                {isEditingMessage ? 'Preview Formatted' : 'Custom Edit Text'}
              </button>
            </div>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="bg-[#0b141a] border border-slate-800 rounded-xl p-4 overflow-hidden relative">
              {/* WhatsApp background pattern simulation */}
              <div className="absolute inset-0 opacity-5 bg-radial-gradient pointer-events-none" />

              {isEditingMessage ? (
                <textarea
                  rows={10}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-[#111b21] border border-emerald-800/60 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-hidden focus:border-emerald-500 relative z-10"
                />
              ) : (
                <div className="bg-[#1f2c34] text-slate-100 p-3.5 rounded-xl rounded-tl-none shadow-md max-w-full font-sans text-xs relative z-10 whitespace-pre-wrap leading-relaxed select-text border border-emerald-950/40">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold pb-2 border-b border-slate-700/60 mb-2">
                    <span className="text-sm">📄</span>
                    <span>{letterhead.companyName} — Quotation {quotation.quoteNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-200">
                    {messageToSend}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-2 font-mono">
                    <span>Just now</span>
                    <span className="text-emerald-400 font-bold">✓✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Message Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy direct wa.me click-to-chat URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Copy wa.me Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSendViaWhatsApp(waWebUrl)}
              className="px-3 py-2 rounded-xl border border-emerald-800/80 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open directly in WhatsApp Web for desktop browser"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>WhatsApp Web</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendViaWhatsApp(waMeUrl)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/40 flex items-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
