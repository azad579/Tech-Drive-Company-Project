import React, { useState } from 'react';
import { X, Printer, CheckCircle2, RotateCcw, Share2, FileText } from 'lucide-react';
import { Transaction } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { Quotation } from '../../utils/quotationService';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { QuotationDocumentModal } from './QuotationDocumentModal';
import { CompanyLetterheadModal } from './CompanyLetterheadModal';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
  onNewSale,
}) => {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isLetterheadDocOpen, setIsLetterheadDocOpen] = useState(false);
  const [isLetterheadSettingsOpen, setIsLetterheadSettingsOpen] = useState(false);

  if (!transaction) return null;

  const quoteFromTxn: Quotation = {
    id: transaction.id,
    quoteNumber: transaction.invoiceNumber,
    date: transaction.date.split(',')[0] || new Date().toLocaleDateString('en-GB'),
    validUntil: new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-GB'),
    partyName: transaction.customer.name,
    partyCompany: transaction.customer.companyName,
    partyPhone: transaction.customer.phone,
    partyEmail: transaction.customer.email,
    partyAddress: transaction.customer.address,
    subject: transaction.mode === 'sale' ? 'Tax Invoice Memo' : 'Sales Price Estimate',
    itemsList: transaction.items.map((it, idx) => ({
      id: `qi-${idx}`,
      name: it.product.name,
      sku: it.product.sku,
      specs: it.product.category,
      warranty: it.product.warranty || '1 Year Official Warranty',
      qty: it.quantity,
      unitPrice: it.customPrice ?? it.product.price,
      total: (it.customPrice ?? it.product.price) * it.quantity,
    })),
    grossAmount: transaction.subtotal,
    discountAmount: transaction.discountTotal,
    vatRate: transaction.vatRate,
    taxAmount: transaction.vatAmount,
    grandTotal: transaction.grandTotal,
    status: 'Sent',
    paymentTerms: transaction.paymentMethod,
    deliveryLeadTime: 'Delivered',
    warrantyTerms: 'Official warranty included',
    createdBy: transaction.cashierName,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {transaction.mode === 'sale' ? 'Sale Completed' : 'Sales Quotation Generated'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Send via WhatsApp link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setIsLetterheadDocOpen(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="View on Company Letterhead"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Letterhead</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div className="p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 max-h-[70vh] overflow-y-auto flex justify-center">
          <div
            id="thermal-receipt-print-area"
            className="w-full max-w-[320px] bg-white text-slate-900 p-5 rounded-lg shadow-sm border border-slate-200 font-mono text-[11px] leading-tight select-text"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-sm tracking-tight uppercase">VERTEX COMPUTING LTD</h2>
              <p className="text-[10px] text-slate-600 mt-0.5">Plot 14, Road 7, Dhanmondi, Dhaka</p>
              <p className="text-[10px] text-slate-600">Hotline: +880 1712-000000</p>
              <p className="text-[9px] text-slate-500 mt-0.5">BIN/VAT REG: 001928374-0101</p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider">
                {transaction.mode === 'sale' ? 'TAX INVOICE / CASH MEMO' : 'PRO-FORMA QUOTATION'}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{transaction.cashierName} (POS-02)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold flex items-center gap-1">
                  {transaction.customer.name}
                  <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-slate-300 text-slate-600">
                    {transaction.customer.customerType || 'Regular'}
                  </span>
                </span>
              </div>
              {transaction.customer.phone && transaction.customer.phone !== 'N/A' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span>{transaction.customer.phone}</span>
                </div>
              )}
              {transaction.customer.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-right truncate max-w-[170px]">{transaction.customer.email}</span>
                </div>
              )}
              {transaction.customer.address && (
                <div className="flex justify-between text-slate-600 pt-0.5">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-right max-w-[170px] truncate">{transaction.customer.address}</span>
                </div>
              )}
              {(transaction.publicInvoiceNote || transaction.customer.invoiceNote) && (
                <div className="flex justify-between text-slate-600 pt-0.5">
                  <span className="text-slate-500 font-semibold">Invoice Note:</span>
                  <span className="text-right max-w-[170px] truncate text-slate-800 font-medium">
                    {transaction.publicInvoiceNote || transaction.customer.invoiceNote}
                  </span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-200 uppercase">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Price</div>
              </div>

              <div className="pt-1.5 space-y-1.5">
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[10px]">
                    <div className="col-span-6 leading-tight">
                      <div className="font-medium text-slate-800">{item.product.name}</div>
                      <div className="text-[9px] text-slate-400 font-sans">{item.product.sku}</div>
                      {item.selectedSerials && item.selectedSerials.length > 0 && (
                        <div className="text-[8px] text-slate-700 font-mono font-bold tracking-tight">
                          S/N: {item.selectedSerials.join(', ')}
                        </div>
                      )}
                      {item.selectedGifts && item.selectedGifts.length > 0 && (
                        <div className="text-[8px] text-purple-700 font-sans font-medium tracking-tight">
                          + Free Gift ({item.quantity}x each): {item.selectedGifts.map((g) => `${g.name}${g.quantity && g.quantity > 1 ? ` (Qty: ${g.quantity})` : ''}`).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                    <div className="col-span-4 text-right tabular-nums">
                      {formatCurrency((item.customPrice ?? item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="tabular-nums">{formatCurrency(transaction.subtotal)}</span>
              </div>
              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span className="tabular-nums">-{formatCurrency(transaction.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">VAT ({transaction.vatRate}%):</span>
                <span className="tabular-nums">{formatCurrency(transaction.vatAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-xs font-bold text-slate-900">
                <span>NET TOTAL:</span>
                <span className="tabular-nums">{formatCurrency(transaction.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold">{transaction.paymentMethod}</span>
              </div>
              {transaction.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Tendered:</span>
                    <span className="tabular-nums">{formatCurrency(transaction.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Change Returned:</span>
                    <span className="tabular-nums text-emerald-700">{formatCurrency(transaction.changeDue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer Notice */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex flex-col items-center justify-center">
                {/* Simulated barcode lines */}
                <div className="h-8 w-44 flex items-stretch justify-center gap-[2px] bg-white px-2">
                  {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,3,1,2,1,4,2,1,3,1,2,1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] tracking-widest text-slate-500 font-mono mt-1">
                  *{transaction.invoiceNumber}*
                </span>
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">
                Warranty claims require original invoice receipt.
                <br />Thank you for shopping with Vertex Computing!
              </p>
            </div>
          </div>
        </div>

        {/* Staff Internal Message (Only visible on cashier terminal screen, NOT on customer receipt paper) */}
        {(transaction.internalNote || transaction.customer.internalNote) && (
          <div className="mx-4 mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-xs">
            <span className="shrink-0 text-sm">🔒</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-300">
                  Internal Staff Message
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-normal italic">
                  Not printed on customer invoice
                </span>
              </div>
              <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                {transaction.internalNote || transaction.customer.internalNote}
              </p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onNewSale}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Next Transaction</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Share Modal */}
      {isWhatsAppOpen && (
        <WhatsAppShareModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          quotation={quoteFromTxn}
        />
      )}

      {/* Quotation / Voucher on Company Letterhead */}
      {isLetterheadDocOpen && (
        <QuotationDocumentModal
          isOpen={isLetterheadDocOpen}
          onClose={() => setIsLetterheadDocOpen(false)}
          quotation={quoteFromTxn}
          onOpenWhatsApp={() => {
            setIsLetterheadDocOpen(false);
            setIsWhatsAppOpen(true);
          }}
          onOpenLetterheadSettings={() => setIsLetterheadSettingsOpen(true)}
        />
      )}

      {/* Company Letterhead Designer */}
      {isLetterheadSettingsOpen && (
        <CompanyLetterheadModal
          isOpen={isLetterheadSettingsOpen}
          onClose={() => setIsLetterheadSettingsOpen(false)}
        />
      )}
    </div>
  );
};
