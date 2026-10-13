import React from 'react';
import { X, Printer, CheckCircle, RotateCcw, PackageCheck } from 'lucide-react';
import { PurchaseInvoice } from '../../types/purchase';
import { formatCurrency } from '../../utils/format';

interface PurchaseInvoiceReceiptModalProps {
  invoice: PurchaseInvoice | null;
  onClose: () => void;
  onNewPurchase: () => void;
}

export const PurchaseInvoiceReceiptModal: React.FC<PurchaseInvoiceReceiptModalProps> = ({
  invoice,
  onClose,
  onNewPurchase,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Purchase Invoice & Stock Voucher
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Print voucher"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Slip */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-slate-950/60">
          <div className="bg-white text-slate-900 p-5 rounded-xl shadow-xs border border-slate-200 text-xs font-mono space-y-3">
            {/* Header info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="font-bold text-sm tracking-wide">VERTEX COMPUTING LTD</h2>
              <p className="text-[10px] text-slate-500">GOODS RECEIPT & PURCHASE INVOICE</p>
              <p className="text-[9px] text-slate-400">Inventory Stock Increased Instantly</p>
            </div>

            {/* Voucher Metadata */}
            <div className="text-[10px] space-y-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Ref:</span>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{invoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-bold">{invoice.supplier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span>{invoice.paymentMethod} ({invoice.paymentStatus})</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 text-[9px] font-bold text-slate-400 uppercase pb-1">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Cost</div>
              </div>

              <div className="space-y-1.5 pt-1">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[10px]">
                    <div className="col-span-6 truncate font-medium">{item.product.name}</div>
                    <div className="col-span-2 text-center text-emerald-700 font-bold">+{item.quantity}</div>
                    <div className="col-span-4 text-right font-medium">{formatCurrency(item.totalCost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pt-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT:</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>

            {/* Stock Confirmation Notice */}
            <div className="pt-2 text-center">
              <p className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Physical stock updated in central database</span>
              </p>
              <p className="text-[9px] text-slate-400 mt-1">Recorded by: {invoice.recordedBy}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onNewPurchase}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Continue Purchasing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
