import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  FileText,
  FileCheck,
  Edit,
} from 'lucide-react';
import {
  Quotation,
  numberToWords,
  convertQuotationToInvoice,
} from '../../utils/quotationService';
import {
  LetterheadConfig,
  getStoredLetterheadConfig,
} from '../../utils/letterheadService';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface QuotationDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onOpenWhatsApp: (quote: Quotation) => void;
  onOpenLetterheadSettings: () => void;
  onQuotationConverted?: (quote: Quotation) => void;
}

export const QuotationDocumentModal: React.FC<QuotationDocumentModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onOpenWhatsApp,
  onOpenLetterheadSettings,
  onQuotationConverted,
}) => {
  const [printLetterheadMode, setPrintLetterheadMode] = useState<'full' | 'preprinted'>('full');
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => getStoredLetterheadConfig());

  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const handleConvert = () => {
    if (confirm(`Convert Quotation ${quotation.quoteNumber} into an official active Sales Invoice?`)) {
      playCashDrawerDing();
      const newInv = convertQuotationToInvoice(quotation);
      if (onQuotationConverted) {
        onQuotationConverted({ ...quotation, status: 'Converted to Invoice', convertedInvoiceRef: newInv.refNo });
      }
      alert(`Quotation successfully converted to Sales Invoice ${newInv.refNo}!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{quotation.quoteNumber}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    quotation.status === 'Sent'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : quotation.status === 'Accepted'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : quotation.status === 'Converted to Invoice'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {quotation.status}
                </span>
                {quotation.sentViaWhatsAppAt && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    ✓ WhatsApp Sent ({quotation.sentViaWhatsAppAt})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Official Company Letterhead Quotation Document
              </p>
            </div>
          </div>

          {/* Quick letterhead controls & Actions */}
          <div className="flex items-center gap-2">
            {/* Stationery mode selector */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPrintLetterheadMode('full')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  printLetterheadMode === 'full'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Print full letterhead design (logo, company name, address)"
              >
                With Letterhead
              </button>
              <button
                type="button"
                onClick={() => setPrintLetterheadMode('preprinted')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  printLetterheadMode === 'preprinted'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Print on physical pre-printed stationary paper (reserves top margin)"
              >
                Pre-printed Pad
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenLetterheadSettings}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Edit Company Letterhead Settings & Template"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* SEND VIA WHATSAPP BUTTON (Prominent Green) */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenWhatsApp(quotation);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Send Quotation via WhatsApp link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
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

        {/* Printable Letterhead Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70 flex justify-center">
          <div
            id="quotation-print-sheet"
            className="w-full max-w-[800px] bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-10 font-sans border border-slate-300 relative select-text"
            style={{ minHeight: '920px' }}
          >
            {/* Watermark (Optional) */}
            {letterhead.showWatermark && printLetterheadMode !== 'preprinted' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                <div
                  className="text-6xl sm:text-7xl font-black uppercase tracking-widest -rotate-35 text-slate-900 select-none"
                  style={{ opacity: letterhead.watermarkOpacity }}
                >
                  {letterhead.watermarkText || letterhead.companyName}
                </div>
              </div>
            )}

            {/* LETTERHEAD HEADER SECTION */}
            {printLetterheadMode === 'preprinted' ? (
              <div
                className="border-b border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs italic mb-6 print:border-none"
                style={{ height: `${letterhead.topMarginPreprintedMm * 2.5}px` }}
              >
                <span>[ Pre-printed Stationery Space — {letterhead.topMarginPreprintedMm}mm Top Gap ]</span>
              </div>
            ) : (
              <>
                {/* 1. CORPORATE TEMPLATE */}
                {letterhead.template === 'corporate' && (
                  <div className="border-b-2 border-blue-900 pb-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0"
                          style={{ backgroundColor: letterhead.primaryColor }}
                        >
                          {letterhead.logoText || 'N'}
                        </div>
                        <div>
                          <h1
                            className="text-2xl font-black tracking-tight"
                            style={{ color: letterhead.primaryColor }}
                          >
                            {letterhead.companyName}
                          </h1>
                          {letterhead.companyNameBn && (
                            <p className="text-xs font-semibold text-slate-600 font-sans">
                              {letterhead.companyNameBn}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 mt-0.5 italic">
                            {letterhead.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-600 space-y-0.5 leading-tight font-medium">
                        <p className="font-semibold text-slate-800">{letterhead.addressLine1}</p>
                        <p>{letterhead.addressLine2}</p>
                        <p>
                          Hotline: <strong className="text-slate-900">{letterhead.phone}</strong>
                        </p>
                        <p>
                          WhatsApp: <strong className="text-emerald-700">{letterhead.whatsapp}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {letterhead.binVatReg} · {letterhead.tradeLicense}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MODERN TEMPLATE */}
                {letterhead.template === 'modern' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${letterhead.primaryColor}, ${letterhead.accentColor})`,
                          }}
                        >
                          {letterhead.logoText || 'N'}
                        </div>
                        <div>
                          <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            {letterhead.companyName}
                          </h1>
                          <p className="text-xs text-blue-600 font-semibold">{letterhead.tagline}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <p className="font-mono">{letterhead.email}</p>
                        <p className="font-mono font-bold text-slate-800">{letterhead.phone}</p>
                        <p className="text-[10px] text-slate-400">{letterhead.website}</p>
                      </div>
                    </div>
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${letterhead.primaryColor}, ${letterhead.accentColor}, #06b6d4)`,
                      }}
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                      <span>{letterhead.addressLine1}, {letterhead.addressLine2}</span>
                      <span className="font-mono">{letterhead.binVatReg}</span>
                    </div>
                  </div>
                )}

                {/* 3. MINIMAL TEMPLATE */}
                {letterhead.template === 'minimal' && (
                  <div className="border-b border-slate-300 pb-4 mb-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase text-slate-950">
                          {letterhead.companyName}
                        </h1>
                        <p className="text-[11px] text-slate-500 tracking-wider uppercase mt-0.5">
                          {letterhead.tagline}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                        <p>{letterhead.addressLine1}</p>
                        <p>{letterhead.phone} · {letterhead.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BORDERED TEMPLATE */}
                {letterhead.template === 'bordered' && (
                  <div className="border-2 border-slate-800 p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-black tracking-wide uppercase text-slate-900">
                          {letterhead.companyName}
                        </h1>
                        <p className="text-xs text-slate-600 font-serif italic">{letterhead.tagline}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{letterhead.addressLine1}, {letterhead.addressLine2}</p>
                      </div>
                      <div className="text-right text-xs">
                        <div className="w-12 h-12 border-2 border-slate-800 rounded-lg flex items-center justify-center font-bold text-lg mx-auto mb-1">
                          {letterhead.logoText}
                        </div>
                        <p className="font-mono text-[10px]">{letterhead.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* DOCUMENT TITLE & META BAR */}
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Official Commercial Document:
                </span>
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  PRICE QUOTATION / PRO-FORMA ESTIMATE
                </h2>
                <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                  <span>Ref: <strong className="font-mono text-blue-700">{quotation.quoteNumber}</strong></span>
                  <span>·</span>
                  <span>Date: <strong>{quotation.date}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Quotation Validity:
                </span>
                <div className="text-xs font-bold text-slate-900">
                  Valid Until: <span className="text-emerald-700">{quotation.validUntil}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Prepared by: {quotation.createdBy}
                </div>
              </div>
            </div>

            {/* CUSTOMER & SUBJECT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 mb-5 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Recipient / Valued Customer:
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {quotation.partyName}
                </div>
                {quotation.partyCompany && (
                  <div className="font-semibold text-blue-800">{quotation.partyCompany}</div>
                )}
                {quotation.attention && (
                  <div className="text-slate-600 mt-0.5 font-medium">{quotation.attention}</div>
                )}
                {quotation.partyAddress && (
                  <div className="text-slate-600 mt-0.5">{quotation.partyAddress}</div>
                )}
                {quotation.partyPhone && (
                  <div className="text-slate-600 mt-0.5 font-mono">
                    Phone / WhatsApp: <strong>{quotation.partyPhone}</strong>
                  </div>
                )}
              </div>

              <div className="text-right sm:text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Project / Procurement Subject:
                </div>
                <div className="font-bold text-slate-900 text-xs leading-relaxed">
                  {quotation.subject || 'Supply of Hardware, Equipment & IT Solutions'}
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold">Delivery Timeline:</span> {quotation.deliveryLeadTime}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">Payment Terms:</span> {quotation.paymentTerms}
                </div>
              </div>
            </div>

            {/* LINE ITEMS TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5">Item Description &amp; Technical Specifications</th>
                    <th className="p-2.5 text-center w-28">Warranty</th>
                    <th className="p-2.5 text-center w-16">Qty</th>
                    <th className="p-2.5 text-right w-24">Unit Price</th>
                    <th className="p-2.5 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quotation.itemsList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.specs && (
                          <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {item.specs}
                          </div>
                        )}
                        {item.sku && (
                          <div className="text-[10px] font-mono text-purple-700 mt-0.5">
                            SKU: {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-center text-slate-700 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                          {item.warranty || 'Official Warranty'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{item.qty}</td>
                      <td className="p-2.5 text-right font-mono text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FINANCIAL TOTALS BREAKDOWN */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start mb-6">
              {/* Amount in words & notes */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                    Amount in Words:
                  </span>
                  <p className="font-semibold text-blue-950 text-xs italic mt-0.5">
                    {numberToWords(quotation.grandTotal)}
                  </p>
                </div>

                {quotation.notes && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Special Note:
                    </span>
                    <p className="text-slate-700 text-xs mt-0.5">{quotation.notes}</p>
                  </div>
                )}
              </div>

              {/* Subtotal, Discount, Tax, Grand Total */}
              <div className="sm:col-span-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono">{formatCurrency(quotation.grossAmount)}</span>
                </div>
                {quotation.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Special Discount:</span>
                    <span className="font-mono">-{formatCurrency(quotation.discountAmount)}</span>
                  </div>
                )}
                {quotation.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax ({quotation.vatRate}%):</span>
                    <span className="font-mono">{formatCurrency(quotation.taxAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Net Grand Total:</span>
                  <span className="font-mono text-base text-blue-700">
                    {formatCurrency(quotation.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 mb-6 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">
                Commercial Terms &amp; Conditions:
              </div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>This quotation is valid until <strong>{quotation.validUntil}</strong>.</li>
                <li>Delivery lead time: <strong>{quotation.deliveryLeadTime}</strong>.</li>
                <li>Payment terms: <strong>{quotation.paymentTerms}</strong>.</li>
                <li>Warranty terms: <strong>{quotation.warrantyTerms}</strong>.</li>
                <li>Goods once sold can be returned only in original unsealed condition within 7 days.</li>
              </ul>
            </div>

            {/* BANK DETAILS & SIGNATORY STAMP BLOCK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-300 items-end">
              {/* Bank Details */}
              <div className="text-[10px] space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold uppercase text-slate-800 text-[10px] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bank Wire Transfer Information:</span>
                </span>
                <p>Bank: <strong className="text-slate-900">{letterhead.bankDetails.bankName}</strong></p>
                <p>Account Name: <strong>{letterhead.bankDetails.accountName}</strong></p>
                <p className="font-mono text-xs font-bold text-blue-800">
                  A/C Number: {letterhead.bankDetails.accountNumber}
                </p>
                <p>Branch: {letterhead.bankDetails.branch}</p>
                {letterhead.bankDetails.routingNumber && (
                  <p className="font-mono">Routing / Swift: {letterhead.bankDetails.routingNumber}</p>
                )}
              </div>

              {/* Authorized Signatory & Seal */}
              <div className="flex flex-col items-center sm:items-end justify-between space-y-3">
                {letterhead.showAuthorizedSeal && (
                  <div className="w-20 h-20 rounded-full border-2 border-red-500/80 text-red-600 flex flex-col items-center justify-center text-[8px] font-black uppercase text-center rotate-6 select-none opacity-85 shadow-xs">
                    <span>{letterhead.companyName.split(' ')[0]}</span>
                    <span className="text-[7px]">★ AUTHENTIC ★</span>
                    <span>OFFICIAL SEAL</span>
                  </div>
                )}
                <div className="text-center pt-2 border-t-2 border-slate-800 w-48">
                  <p className="font-bold text-slate-900 text-xs">{letterhead.signatoryName}</p>
                  <p className="text-[10px] text-slate-600">{letterhead.signatoryTitle}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{letterhead.companyName}</p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-6 mt-6 border-t border-slate-200 text-center text-[10px] text-slate-500">
              <p>{letterhead.footerText}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Printed via NextGen IT ERP System · Page 1 of 1 · Ref: {quotation.quoteNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {quotation.status !== 'Converted to Invoice' && (
              <button
                type="button"
                onClick={handleConvert}
                className="px-3.5 py-2 rounded-xl border border-purple-800/80 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Convert this quotation into an official sales invoice"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Convert to Sales Invoice</span>
              </button>
            )}

            {quotation.convertedInvoiceRef && (
              <span className="text-xs text-purple-400 font-medium">
                ✓ Converted to Invoice #{quotation.convertedInvoiceRef}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Big Green Send via WhatsApp button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenWhatsApp(quotation);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Quotation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
