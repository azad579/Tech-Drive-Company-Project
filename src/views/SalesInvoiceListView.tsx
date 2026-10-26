import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { SalesInvoice } from '../types';

interface SalesReturnRecord {
  id: string;
  sn: number;
  date: string;
  customerName: string;
  customerPhone: string;
  invoiceNo: string;
  againstInvoice: string;
  total: number;
  note: string;
}

const INITIAL_RETURNS: SalesReturnRecord[] = [
  {
    id: 'ret-1',
    sn: 1,
    date: '20 Oct 2026',
    customerName: 'Siam Electronics',
    customerPhone: '01719876543',
    invoiceNo: 'SRT201026101',
    againstInvoice: 'SEL151026099',
    total: 46500,
    note: 'Customer exchanged Dell Latitude 5420 for higher configuration'
  }
];

export const SalesInvoiceListView: React.FC<{
  initialMode?: 'list' | 'edit' | 'returnCreate' | 'returnList';
}> = ({ initialMode = 'list' }) => {
  const { sales, setInvoiceToPrint, setCurrentRoute } = useApp();

  const [mode, setMode] = useState<'list' | 'edit' | 'returnCreate' | 'returnList'>(initialMode);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(
    sales[0] || null
  );

  // Return Records
  const [returns, setReturns] = useState<SalesReturnRecord[]>(INITIAL_RETURNS);

  // List Search & Date Filters
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [searchQuery, setSearchQuery] = useState('');

  // Invoice Edit State (matching image_d65a5747.png)
  const [editSerials, setEditSerials] = useState<{ [key: string]: string }>({
    'prod-0': 'TD-5CD22734GT',
    'prod-1': '5CG9453QN4',
    'prod-2': 'DL5420-SN9821'
  });

  // Return Create State (matching image_4e13277f.png)
  const [returnQtys, setReturnQtys] = useState<{ [key: string]: number }>({});
  const [returnSelectedSerials, setReturnSelectedSerials] = useState<{ [key: string]: boolean }>({
    'TD-5CD22734GT': true
  });
  const [returnReason, setReturnReason] = useState('Customer returned for warranty replacement/refund');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered invoices for list view
  const filteredInvoices: SalesInvoice[] = useMemo(() => {
    return sales.filter((inv: SalesInvoice) => {
      const matchSearch =
        searchQuery === '' ||
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [sales, searchQuery]);

  const handleOpenEdit = (inv: SalesInvoice) => {
    setSelectedInvoice(inv);
    setMode('edit');
  };

  const handleOpenReturn = (inv: SalesInvoice) => {
    setSelectedInvoice(inv);
    // Initialize return quantities
    const initialQtys: { [key: string]: number } = {};
    inv.items.forEach((item, idx) => {
      initialQtys[`${item.productId}-${idx}`] = 1;
    });
    setReturnQtys(initialQtys);
    setMode('returnCreate');
  };

  const handleSaveInvoiceEdit = () => {
    setToastMessage(`Invoice ${selectedInvoice?.invoiceNo} updated successfully!`);
    setTimeout(() => {
      setToastMessage(null);
      setMode('list');
    }, 1500);
  };

  const handleConfirmReturn = () => {
    if (!selectedInvoice) return;
    const returnNo = `SRT${Date.now().toString().slice(-6)}`;
    const newReturn: SalesReturnRecord = {
      id: `ret-${Date.now()}`,
      sn: returns.length + 1,
      date: '24 Oct 2026',
      customerName: selectedInvoice.customerName,
      customerPhone: selectedInvoice.customerPhone || '01700000000',
      invoiceNo: returnNo,
      againstInvoice: selectedInvoice.invoiceNo,
      total: selectedInvoice.grandTotal,
      note: returnReason
    };

    setReturns([newReturn, ...returns]);
    setToastMessage(`Return ${returnNo} created against ${selectedInvoice.invoiceNo}!`);
    setTimeout(() => {
      setToastMessage(null);
      setMode('returnList');
    }, 1500);
  };

  const exportCSV = () => {
    const headers = 'SN,Date,Customer,Invoice,Total,Status,PaymentMethod\n';
    const rows = filteredInvoices
      .map(
        (inv: SalesInvoice, i: number) =>
          `${i + 1},${inv.date},"${inv.customerName}",${inv.invoiceNo},${inv.grandTotal},${inv.status},${inv.paymentMethod}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techdrive_sales_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#00a65a] text-white px-4 py-2.5 rounded shadow-lg flex items-center space-x-2 text-xs font-bold">
          <i className="fa fa-check-circle"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">
          {mode === 'list' && 'Sales Invoices'}
          {mode === 'edit' && `Invoice Edit ( Invoice No: ${selectedInvoice?.invoiceNo} )`}
          {mode === 'returnCreate' && `Return Create ( Against: ${selectedInvoice?.invoiceNo} )`}
          {mode === 'returnList' && 'Sales Return Record'}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span
            className="cursor-pointer hover:underline"
            onClick={() => setCurrentRoute('home.php')}
          >
            Dashboard
          </span>
          <span>&gt;</span>
          <span>Sales</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">
            {mode === 'list' && 'Sales Invoice'}
            {mode === 'edit' && 'Invoice Edit'}
            {mode === 'returnCreate' && 'Return Create'}
            {mode === 'returnList' && 'Sales Return'}
          </span>
        </div>
      </div>

      {/* Mode 1: Sales Invoice List (matching image_7a3a44c4.png) */}
      {mode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              {/* Header Box */}
              <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
                <span className="uppercase tracking-wide">SALES RECORD</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportCSV}
                    className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs px-2.5 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
                  >
                    <i className="fa fa-file-excel-o"></i>
                    <span>EXP-&gt;CSV</span>
                  </button>
                  <button
                    onClick={() => setCurrentRoute('sel_sinvcteate.php')}
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
                  >
                    <i className="fa fa-plus"></i>
                    <span>CREATE SALES</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-semibold">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-semibold">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                  />
                </div>
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search invoice no, customer name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded pl-7 pr-2 py-1 bg-white"
                  />
                  <i className="fa fa-search absolute left-2 top-2 text-gray-400"></i>
                </div>
              </div>

              {/* Sales Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">SN</th>
                      <th className="py-2 px-3 w-24">Date</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3 w-32">Invoice</th>
                      <th className="py-2 px-3 w-28 text-right">Total</th>
                      <th className="py-2 px-3">Note</th>
                      <th className="py-2 px-3 w-28 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {filteredInvoices.map((inv: SalesInvoice, idx: number) => (
                      <tr key={inv.id} className="hover:bg-sky-50/50 transition">
                        <td className="py-2 px-3 text-center font-bold text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium">{inv.date}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-[#00305d] flex items-center space-x-1.5">
                            <span>{inv.customerName}</span>
                            <span className="bg-sky-100 text-[#00305d] text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                              ABA/SU/001
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {inv.customerPhone || '01711223344'} &bull; {inv.district || 'Dhaka'}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#0084bf]">{inv.invoiceNo}</td>
                        <td className="py-2 px-3 text-right font-bold text-gray-900">{formatBDT(inv.grandTotal)}</td>
                        <td className="py-2 px-3 text-gray-500 text-[11px] truncate max-w-[150px]">
                          {inv.notes || '-'}
                        </td>
                        <td className="py-2 px-3 text-center space-x-1.5 whitespace-nowrap">
                          {/* Print / View */}
                          <button
                            onClick={() => setInvoiceToPrint(inv)}
                            className="text-[#0084bf] hover:text-sky-800 p-1"
                            title="View / Print Invoice"
                          >
                            <i className="fa fa-print"></i>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="text-amber-600 hover:text-amber-800 p-1"
                            title="Edit Invoice"
                          >
                            <i className="fa fa-pencil"></i>
                          </button>
                          {/* Return */}
                          <button
                            onClick={() => handleOpenReturn(inv)}
                            className="text-purple-600 hover:text-purple-800 p-1"
                            title="Create Return"
                          >
                            <i className="fa fa-undo"></i>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoiceNo}?`)) {
                                alert('Invoice deleted from system.');
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right History Sidebar matching image_7a3a44c4.png */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-3 py-2 font-bold text-xs uppercase flex items-center justify-between">
                <span>History</span>
                <i className="fa fa-history"></i>
              </div>
              <div className="p-3 divide-y divide-gray-100 text-[11px] space-y-2 max-h-[500px] overflow-y-auto">
                <div className="pt-1.5 first:pt-0">
                  <div className="text-gray-400 font-medium">23 Oct 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">New Sale Invoice has been Created - SEL231026102</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">22 Oct 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">New Sale Invoice has been Created - SEL221026101</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">20 Oct 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Sales Return processed for invoice SEL151026099</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">19 Sep 2025: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Sale Invoice SEL190925101 generated for corporate client</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Invoice Edit (matching image_d65a5747.png & image_6466a687.png) */}
      {mode === 'edit' && selectedInvoice && (
        <div className="space-y-4 bg-white p-4 rounded border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Invoice Edit ( Invoice No: <span className="text-[#0084bf]">{selectedInvoice.invoiceNo}</span> )
              </h2>
              <div className="text-xs text-gray-500 mt-0.5">
                Customer: <strong className="text-gray-700">{selectedInvoice.customerName}</strong> &bull; Date: {selectedInvoice.date}
              </div>
            </div>
            <button
              onClick={() => setMode('list')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <i className="fa fa-arrow-left"></i>
              <span>Back to Invoice List</span>
            </button>
          </div>

          {/* Cart Table */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#00305d] text-white text-[11px] uppercase">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 w-16 text-center">Qty</th>
                  <th className="py-2 px-3 w-24 text-right">Price</th>
                  <th className="py-2 px-3 w-20 text-right">Dis.</th>
                  <th className="py-2 px-3 w-28 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{item.qty}</td>
                    <td className="py-2 px-3 text-right">{formatBDT(item.price)}</td>
                    <td className="py-2 px-3 text-right text-gray-500">{formatBDT(item.discount)}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900">{formatBDT(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* IMEI / Serial Assignment Section (matching image_d65a5747.png) */}
          <div className="mt-4 border border-sky-100 bg-sky-50/40 p-4 rounded-sm space-y-3">
            <h3 className="font-bold text-xs uppercase text-[#00305d] flex items-center space-x-1.5">
              <i className="fa fa-barcode text-[#0084bf]"></i>
              <span>Assign IMEI / Serial Numbers for Invoice Verification</span>
            </h3>

            <div className="overflow-x-auto bg-white rounded border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 text-[10px] uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-1.5 px-3 w-10 text-center">#</th>
                    <th className="py-1.5 px-3">Product Name</th>
                    <th className="py-1.5 px-3 w-64">IMEI / Serial Number</th>
                    <th className="py-1.5 px-3 w-28 text-center">Warranty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={editSerials[`prod-${idx}`] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditSerials(prev => ({ ...prev, [`prod-${idx}`]: val }));
                          }}
                          placeholder="e.g. TD-5CD22734GT"
                          className="w-full border border-sky-300 rounded px-2 py-1 text-xs font-mono font-bold text-[#0084bf]"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.warranty || '1 Year'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setMode('list')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveInvoiceEdit}
              className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold text-xs uppercase rounded shadow-xs flex items-center space-x-1.5"
            >
              <i className="fa fa-save"></i>
              <span>UPDATE INVOICE</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Return Create (matching image_4e13277f.png) */}
      {mode === 'returnCreate' && selectedInvoice && (
        <div className="space-y-4 bg-white p-4 rounded border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Sales Return Create ( Against: <span className="text-[#0084bf]">{selectedInvoice.invoiceNo}</span> )
              </h2>
              <div className="text-xs text-gray-500 mt-0.5">
                Customer: <strong className="text-gray-700">{selectedInvoice.customerName}</strong> &bull; Invoice Date: {selectedInvoice.date}
              </div>
            </div>
            <button
              onClick={() => setMode('list')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <i className="fa fa-arrow-left"></i>
              <span>Back to Invoice List</span>
            </button>
          </div>

          {/* Return items table */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#00305d] text-white text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-2 w-14 text-center">Qty</th>
                  <th className="py-2 px-2 w-20 text-right">Price</th>
                  <th className="py-2 px-2 w-16 text-right">Dis(%)</th>
                  <th className="py-2 px-2 w-16 text-right">Dis(F)</th>
                  <th className="py-2 px-2 w-16 text-center">Re.Qty</th>
                  <th className="py-2 px-2 w-20 text-center">R.Qty</th>
                  <th className="py-2 px-3 w-24 text-right">SubTotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {selectedInvoice.items.map((item, idx) => {
                  const key = `${item.productId}-${idx}`;
                  const rQty = returnQtys[key] !== undefined ? returnQtys[key] : 1;
                  const itemSubTotal = rQty * item.price;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-center text-gray-400 font-bold">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="py-2 px-2 text-center text-gray-600">{item.qty}</td>
                      <td className="py-2 px-2 text-right">{formatBDT(item.price)}</td>
                      <td className="py-2 px-2 text-right text-gray-500">0.00</td>
                      <td className="py-2 px-2 text-right text-gray-500">{formatBDT(item.discount)}</td>
                      <td className="py-2 px-2 text-center text-gray-400">0</td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max={item.qty}
                          value={rQty}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setReturnQtys(prev => ({ ...prev, [key]: val }));
                          }}
                          className="w-14 border border-rose-300 rounded text-center text-xs py-1 bg-rose-50/40 font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">
                        {formatBDT(itemSubTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Serial Checkboxes to return */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2 text-xs">
            <h4 className="font-bold text-gray-800">Return Serials:</h4>
            <div className="flex flex-wrap gap-4">
              {['TD-5CD22734GT', '5CG9453QN4', 'DL5420-SN9821'].map(sn => (
                <label key={sn} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnSelectedSerials[sn] || false}
                    onChange={e =>
                      setReturnSelectedSerials(prev => ({ ...prev, [sn]: e.target.checked }))
                    }
                    className="rounded text-purple-600"
                  />
                  <span className="font-mono font-bold text-gray-700">{sn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Return Reason Note */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Return Reason / Note:</label>
            <textarea
              rows={2}
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded p-2"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setMode('list')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReturn}
              className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold text-xs uppercase rounded shadow-xs flex items-center space-x-1.5"
            >
              <i className="fa fa-undo"></i>
              <span>CONFIRM RETURN</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 4: Sales Return Record List (matching image_38484f68.png) */}
      {mode === 'returnList' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SALES RETURN RECORD</span>
            <button
              onClick={() => setMode('list')}
              className="bg-sky-800 hover:bg-sky-900 text-white text-xs px-3 py-1 rounded font-bold uppercase transition"
            >
              View Sales Invoices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">SN</th>
                  <th className="py-2 px-3 w-24">Date</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3 w-32">Invoice</th>
                  <th className="py-2 px-3 w-32">Against</th>
                  <th className="py-2 px-3 w-28 text-right">Total</th>
                  <th className="py-2 px-3">Note</th>
                  <th className="py-2 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {returns.map((ret, idx) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-3">{ret.date}</td>
                    <td className="py-2 px-3 font-bold text-[#00305d]">
                      {ret.customerName}
                      <span className="text-gray-500 text-[10px] block">{ret.customerPhone}</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600">{ret.invoiceNo}</td>
                    <td className="py-2 px-3 font-mono text-[#0084bf]">{ret.againstInvoice}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900">{formatBDT(ret.total)}</td>
                    <td className="py-2 px-3 text-gray-600 text-[11px]">{ret.note}</td>
                    <td className="py-2 px-3 text-center space-x-1">
                      <button
                        onClick={() => alert(`Printing Return slip for ${ret.invoiceNo}`)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
                      >
                        <i className="fa fa-print"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete return record ${ret.invoiceNo}?`)) {
                            setReturns(prev => prev.filter(r => r.id !== ret.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
