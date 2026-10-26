import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { TechDriveDocumentHeader } from './TechDriveDocumentHeader';

export const InvoicePrintModal: React.FC = () => {
  const { invoiceToPrint, setInvoiceToPrint } = useApp();

  const [paperSize, setPaperSize] = useState<'A4' | 'Letter' | 'POS80'>('A4');
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>('Portrait');
  const [docType, setDocType] = useState<'Invoice Only' | 'With Chalan' | 'Chalan Only'>('Invoice Only');

  if (!invoiceToPrint) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex flex-col justify-between overflow-hidden">
      {/* Top Controls Bar matching image_160b9cba.png & image_23a34444.png */}
      <div className="bg-[#1e2227] text-white px-4 py-2.5 flex flex-wrap items-center justify-between border-b border-gray-700 shadow-md no-print text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-sky-400 flex items-center space-x-1.5">
            <i className="fa fa-print"></i>
            <span>Print Document: {invoiceToPrint.invoiceNo}</span>
          </span>

          {/* Paper Size */}
          <div className="flex items-center space-x-1.5 pl-3 border-l border-gray-700">
            <span className="text-gray-400">Paper:</span>
            <select
              value={paperSize}
              onChange={e => setPaperSize(e.target.value as any)}
              className="bg-[#2d3238] border border-gray-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="A4">A4 [210mm x 297mm]</option>
              <option value="Letter">Letter [216mm x 279mm]</option>
              <option value="POS80">Thermal POS [80mm]</option>
            </select>
          </div>

          {/* Orientation */}
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">Orientation:</span>
            <select
              value={orientation}
              onChange={e => setOrientation(e.target.value as any)}
              className="bg-[#2d3238] border border-gray-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
            </select>
          </div>

          {/* Document Type */}
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">Type:</span>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as any)}
              className="bg-[#2d3238] border border-gray-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="Invoice Only">Invoice Only</option>
              <option value="With Chalan">With Chalan</option>
              <option value="Chalan Only">Chalan Only</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded flex items-center space-x-1.5 transition uppercase tracking-wide text-xs"
          >
            <i className="fa fa-print"></i>
            <span>PRINT</span>
          </button>
          <button
            onClick={() => setInvoiceToPrint(null)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Preview Container with Thumbnail Sidebar on Left */}
      <div className="flex-1 flex overflow-hidden bg-[#525659] p-4 lg:p-6 justify-center">
        {/* Left Thumbnails Panel */}
        <div className="hidden md:flex flex-col w-48 mr-6 space-y-3 no-print select-none">
          <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider flex items-center space-x-1">
            <i className="fa fa-file-text-o"></i>
            <span>Pages (1)</span>
          </div>
          <div className="bg-white p-2 rounded shadow border-2 border-sky-400 cursor-pointer">
            <div className="bg-gray-50 border border-gray-200 h-56 rounded text-[8px] text-gray-400 p-2 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="font-bold text-gray-800">TECH DRIVE</div>
                <div className="text-[7px]">Sales Invoice {invoiceToPrint.invoiceNo}</div>
              </div>
              <div className="text-center font-bold text-sky-800">Page 1</div>
            </div>
          </div>
        </div>

        {/* Center Paper Sheet Preview */}
        <div className="overflow-y-auto max-h-full flex justify-center w-full">
          <div className="bg-white text-gray-800 shadow-2xl rounded-xs p-8 max-w-3xl w-full border border-gray-300 my-auto text-xs min-h-[850px] flex flex-col justify-between printable-sheet">
            <div className="space-y-4">
              {/* Official Tech Drive Document Header matching image.png */}
              <TechDriveDocumentHeader
                refNo={invoiceToPrint.invoiceNo}
                date={invoiceToPrint.date}
                docTitle={docType === 'Chalan Only' ? 'DELIVERY CHALAN' : 'SALES INVOICE'}
              />

              {/* Bill To Customer Section */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">Bill To:</span>
                  <div className="font-bold text-gray-900 text-sm mt-0.5 flex items-center space-x-1.5">
                    <span>{invoiceToPrint.customerName}</span>
                    <span className="bg-[#00305d] text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      ABA/SU/001
                    </span>
                  </div>
                  <div className="text-gray-600 text-[11px] mt-0.5">
                    Phone: {invoiceToPrint.customerPhone || '01711223344'}
                  </div>
                  <div className="text-gray-600 text-[11px]">
                    Address: {invoiceToPrint.district || 'Dhaka, Bangladesh'}
                  </div>
                </div>

                <div className="text-right space-y-0.5 text-[11px]">
                  <span className="font-bold text-gray-500 uppercase text-[9px] block">Payment Terms</span>
                  <div className="text-gray-700">
                    Payment Mode: <strong className="text-gray-900">{invoiceToPrint.paymentMethod}</strong>
                  </div>
                  <div className="text-gray-700">
                    Status:{' '}
                    <strong className={invoiceToPrint.dueAmount <= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {invoiceToPrint.status}
                    </strong>
                  </div>
                  <div className="text-gray-700">Sales Branch: <strong className="text-gray-900">Dhaka Main</strong></div>
                </div>
              </div>

              {/* Line Items Table with Serial Numbers */}
              <table className="w-full text-left text-xs border border-gray-300">
                <thead className="bg-[#00305d] text-white text-[11px] uppercase">
                  <tr>
                    <th className="py-2 px-2.5 w-8 text-center border-r border-[#002447]">SN</th>
                    <th className="py-2 px-2.5 border-r border-[#002447]">Product Description</th>
                    <th className="py-2 px-2 w-20 text-center border-r border-[#002447]">Warranty</th>
                    <th className="py-2 px-2 w-12 text-center border-r border-[#002447]">Qty</th>
                    <th className="py-2 px-2.5 w-24 text-right border-r border-[#002447]">Price</th>
                    <th className="py-2 px-2 w-18 text-right border-r border-[#002447]">Disc</th>
                    <th className="py-2 px-2.5 w-28 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceToPrint.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-2.5 text-center text-gray-500 border-r">{idx + 1}</td>
                      <td className="py-2 px-2.5 border-r font-medium">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          SKU: {item.sku} &bull; <span className="text-[#0084bf] font-bold">SL#TD-5CD22734GT</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-600 border-r">{item.warranty || '1 Year'}</td>
                      <td className="py-2 px-2 text-center font-bold border-r">{item.qty}</td>
                      <td className="py-2 px-2.5 text-right border-r">{formatBDT(item.price)}</td>
                      <td className="py-2 px-2 text-right text-gray-500 border-r">
                        {item.discount > 0 ? formatBDT(item.discount) : '-'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-gray-900">{formatBDT(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom In Words & Totals Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                <div className="md:col-span-7 space-y-2">
                  <div className="bg-sky-50 p-2 rounded border border-sky-200 text-[11px] text-[#00305d]">
                    <span className="font-bold">In Words: </span>
                    <span className="italic font-medium">
                      Seventy Five Thousand Taka Only.
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-500 space-y-0.5 pt-2">
                    <p className="font-bold text-gray-700">Terms &amp; Conditions:</p>
                    <p>1. Warranty void if serial tag is removed, broken or damaged.</p>
                    <p>2. Hardware turnaround time is subject to vendor replacement availability.</p>
                    <p>3. Sold goods are not refundable after invoice processing.</p>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-1 text-xs border border-gray-200 p-2.5 rounded bg-gray-50/50">
                  <div className="flex justify-between py-0.5 text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatBDT(invoiceToPrint.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-600">
                    <span>Special Discount:</span>
                    <span className="text-rose-600">-{formatBDT(invoiceToPrint.discount)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-gray-600">
                    <span>VAT / Tax (0%):</span>
                    <span>৳ 0.00</span>
                  </div>
                  <div className="flex justify-between py-1 border-t-2 border-gray-800 font-bold text-sm text-[#00305d]">
                    <span>Grand Total:</span>
                    <span className="text-base text-[#0084bf]">{formatBDT(invoiceToPrint.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-emerald-700 font-bold">
                    <span>Paid Amount:</span>
                    <span>{formatBDT(invoiceToPrint.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-rose-600 font-bold">
                    <span>Due Balance:</span>
                    <span>{formatBDT(invoiceToPrint.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Signature Lines matching image_160b9cba.png & image_23a34444.png */}
            <div className="grid grid-cols-2 pt-12 text-center text-xs text-gray-700">
              <div>
                <div className="border-t border-gray-400 w-44 mx-auto pt-1 font-semibold">
                  Customer Singnature
                </div>
              </div>
              <div>
                <div className="border-t border-gray-400 w-44 mx-auto pt-1 font-semibold">
                  Authorized Singnature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
