import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  CheckCircle2,
  Download,
  X,
  Store,
  Building,
  User,
  Clock,
} from 'lucide-react';
import { INITIAL_QUOTATIONS, QuotationRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { Customer } from '../../types/pos';

interface QuotationsTabProps {
  customers?: Customer[];
  onOpenPOS?: () => void;
}

export const QuotationsTab: React.FC<QuotationsTabProps> = ({ customers = [], onOpenPOS }) => {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Sent' | 'Accepted' | 'Draft' | 'Expired'>('All');
  const [viewingQuote, setViewingQuote] = useState<QuotationRecord | null>(null);
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);

  // New Quote form state
  const [customerName, setCustomerName] = useState(customers[0]?.name || 'Vertex Technologies Ltd');
  const [companyName, setCompanyName] = useState('Vertex Technologies Ltd');
  const [customerPhone, setCustomerPhone] = useState('01711-234567');
  const [customerEmail, setCustomerEmail] = useState('procurement@vertexbd.com');
  const [validUntil, setValidUntil] = useState('2026-10-31');
  const [itemName, setItemName] = useState('ThinkPad T14 Gen 4 (i7, 16GB, 512GB)');
  const [itemSku, setItemSku] = useState('TP-T14-G4');
  const [qty, setQty] = useState(2);
  const [unitPrice, setUnitPrice] = useState(95000);
  const [discount, setDiscount] = useState(5000);
  const [vat, setVat] = useState(9250);
  const [notes, setNotes] = useState('Price includes 3-year warranty and standard delivery.');

  const filteredQuotes = quotations.filter((q) => {
    if (statusFilter !== 'All' && q.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchNo = q.quoteNo.toLowerCase().includes(term);
      const matchCust = q.customerName.toLowerCase().includes(term);
      const matchComp = q.companyName?.toLowerCase().includes(term);
      const matchItem = q.itemsList.some((i) => i.name.toLowerCase().includes(term));
      if (!matchNo && !matchCust && !matchComp && !matchItem) return false;
    }
    return true;
  });

  const totalQuoteValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    const sub = qty * unitPrice;
    const total = sub - discount + vat;

    const newRecord: QuotationRecord = {
      id: `qt-${Date.now()}`,
      quoteNo: `QT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      validUntil,
      customerName: customerName.trim(),
      companyName: companyName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      itemsList: [
        {
          name: itemName.trim(),
          sku: itemSku.trim(),
          qty,
          unitPrice,
          total: sub,
        },
      ],
      subtotal: sub,
      discount,
      vat,
      grandTotal: total,
      status: 'Sent',
      notes: notes.trim(),
      createdBy: 'Forhad (Admin)',
    };

    setQuotations([newRecord, ...quotations]);
    setIsNewQuoteModalOpen(false);
  };

  const handleDeleteQuote = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter((q) => q.id !== id));
      if (viewingQuote?.id === id) setViewingQuote(null);
    }
  };

  const handleConvertToInvoice = (quote: QuotationRecord) => {
    playCashDrawerDing();
    // Update status to accepted
    setQuotations(
      quotations.map((q) => (q.id === quote.id ? { ...q, status: 'Accepted' } : q))
    );
    alert(`Quotation ${quote.quoteNo} converted to Sales Order / Invoice successfully!`);
    if (onOpenPOS) onOpenPOS();
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Quote No,Date,Valid Until,Customer,Company,Grand Total,Status\n'];
    const rows = filteredQuotes.map(
      (q) => `"${q.quoteNo}","${q.date}","${q.validUntil}","${q.customerName}","${q.companyName || ''}","${q.grandTotal}","${q.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans select-none">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotation #, customer, company, item..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['All', 'Sent', 'Accepted', 'Draft', 'Expired'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsNewQuoteModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-amber-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Quotations</p>
            <p className="text-lg font-black text-white font-mono mt-0.5">{quotations.length}</p>
            <p className="text-[10px] text-amber-400">All issued estimates</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Pipeline Value</p>
            <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{formatCurrency(totalQuoteValue)}</p>
            <p className="text-[10px] text-slate-400">Potential revenue</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Accepted</p>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {quotations.filter((q) => q.status === 'Accepted').length}
            </p>
            <p className="text-[10px] text-emerald-400">Ready to invoice</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Pending Sent</p>
            <p className="text-lg font-black text-blue-400 font-mono mt-0.5">
              {quotations.filter((q) => q.status === 'Sent').length}
            </p>
            <p className="text-[10px] text-blue-400">Awaiting client decision</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Quote #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Client / Company</th>
              <th className="p-3">Items Summary</th>
              <th className="p-3 text-right">Grand Total</th>
              <th className="p-3 text-center">Valid Until</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">{q.quoteNo}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{q.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{q.companyName || q.customerName}</div>
                    <div className="text-[10px] text-slate-400">{q.customerPhone}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    {q.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(q.grandTotal)}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">{q.validUntil}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : q.status === 'Sent'
                          ? 'bg-blue-500/20 text-blue-300'
                          : q.status === 'Draft'
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingQuote(q);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View & Print Quotation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {q.status !== 'Accepted' && (
                        <button
                          onClick={() => handleConvertToInvoice(q)}
                          className="px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Convert directly to invoice"
                        >
                          <Store className="w-3 h-3" />
                          <span>Convert</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No quotation records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VIEW / PRINT QUOTATION */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Official Price Quotation / Estimate</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingQuote.quoteNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingQuote(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-750">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Prepared For Client</span>
                  <div className="text-sm font-bold text-white mt-1">{viewingQuote.companyName || viewingQuote.customerName}</div>
                  <div className="text-slate-300">Contact: {viewingQuote.customerName}</div>
                  <div className="text-slate-400 font-mono">{viewingQuote.customerPhone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Quotation Dates</span>
                  <div className="text-white mt-1">Issue Date: <strong className="font-mono">{viewingQuote.date}</strong></div>
                  <div className="text-amber-400 font-medium">Valid Until: <strong className="font-mono">{viewingQuote.validUntil}</strong></div>
                  <div className="text-slate-400 mt-1">Status: <span className="font-bold text-white">{viewingQuote.status}</span></div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingQuote.itemsList.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-white">{i.name}</td>
                        <td className="p-2.5 font-mono text-slate-400">{i.sku}</td>
                        <td className="p-2.5 text-center font-mono">{i.qty}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(i.unitPrice)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-200">{formatCurrency(i.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 bg-slate-850 p-3 rounded-xl border border-slate-750 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(viewingQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Discount:</span>
                    <span className="font-mono text-emerald-400">-{formatCurrency(viewingQuote.discount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VAT / Tax:</span>
                    <span className="font-mono">+{formatCurrency(viewingQuote.vat)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-slate-700 pt-1.5 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(viewingQuote.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {viewingQuote.notes && (
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-white block mb-0.5">Terms &amp; Notes:</strong>
                  {viewingQuote.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteQuote(viewingQuote.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingQuote(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleConvertToInvoice(viewingQuote)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Convert to Invoice</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW QUOTATION */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Create New Price Quotation</span>
              </h3>
              <button onClick={() => setIsNewQuoteModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Product Description *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={itemSku}
                      onChange={(e) => setItemSku(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Unit Price ৳</label>
                    <input
                      type="number"
                      min={0}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Discount ৳</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">VAT / Tax ৳</label>
                    <input
                      type="number"
                      value={vat}
                      onChange={(e) => setVat(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Terms &amp; Warranty Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Grand Total:</span>{' '}
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {formatCurrency(qty * unitPrice - discount + vat)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewQuoteModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                  >
                    Save Quotation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
