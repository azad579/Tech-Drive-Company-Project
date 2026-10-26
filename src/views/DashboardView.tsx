import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { Product } from '../types';

export const DashboardView: React.FC = () => {
  const {
    purchases,
    sales,
    expenses,
    products,
    cheques,
    setCurrentRoute,
    collectSalesPayment,
    payPurchaseDue,
    setInvoiceToPrint
  } = useApp();

  // Date filters matching exact form fields in home.php
  const [fromDate, setFromDate] = useState('2026-10-24');
  const [toDate, setToDate] = useState('2026-10-24');
  const [activePreset, setActivePreset] = useState<'custom' | 'today' | 'week' | 'month' | 'year'>('month');

  // Pay/Collect Modal
  const [payModalInvoice, setPayModalInvoice] = useState<{ id: string; invoiceNo: string; due: number; type: 'sale' | 'purchase' } | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  // In-line expanded product details row (matching axe_prodet.php)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const handlePresetClick = (preset: 'today' | 'week' | 'month' | 'year') => {
    setActivePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'week') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePreset('custom');
  };

  const totalPurchase = purchases.reduce((acc, p) => acc + p.total, 0);
  const totalSales = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - (totalPurchase * 0.75) - totalExpense;

  const lowStockProducts = products.filter(p => p.stock <= p.minStockAlert);

  const handleOpenPayModal = (id: string, invoiceNo: string, due: number, type: 'sale' | 'purchase') => {
    setPayModalInvoice({ id, invoiceNo, due, type });
    setPayAmount(due);
  };

  const handleConfirmPayment = () => {
    if (!payModalInvoice || payAmount <= 0) return;
    if (payModalInvoice.type === 'sale') {
      collectSalesPayment(payModalInvoice.id, payAmount);
    } else {
      payPurchaseDue(payModalInvoice.id, payAmount);
    }
    setPayModalInvoice(null);
  };

  const toggleProductExpand = (id: string) => {
    setExpandedProductId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Content Header matching BGD ERP */}
      <section className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h1 className="text-xl font-normal text-gray-800">
          Dashboard <small className="text-xs text-gray-500 font-normal">Control panel</small>
        </h1>
        <ol className="flex items-center space-x-1.5 text-xs text-gray-500">
          <li>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                setCurrentRoute('home.php', 'Dashboard');
              }}
              className="text-[#0084bf] hover:underline flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Home</span>
            </a>
          </li>
          <li>/</li>
          <li className="text-gray-700">Dashboard</li>
        </ol>
      </section>

      {/* Main Row 1: Notifications (col-md-4) | Due Purchase Cost (col-md-4) | Due Sales Cost (col-md-4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Notifications Box */}
        <div className="box h-[458px] flex flex-col border border-gray-200 shadow-sm">
          <div className="box-header flex items-center space-x-2 bg-white">
            <i className="fa fa-bell text-[#0084bf]"></i>
            <h3 className="box-title">Notifications</h3>
          </div>
          <div className="box-body flex-1 overflow-y-auto p-0 db-notification-container">
            <table className="table w-full notification_table text-xs">
              <tbody>
                {purchases.slice(0, 3).map((pur, idx) => (
                  <tr key={`pur-${idx}`} className="hover:bg-gray-50">
                    <td className="w-8 db-noti-icons pl-2 text-center">
                      <i className="fa fa-shopping-cart text-[#0084bf]"></i>
                    </td>
                    <td className="py-2 text-[11px] leading-snug">
                      Purchase{' '}
                      <span className="bg-[#605ca8] text-white font-mono font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {pur.invoiceNo}
                      </span>{' '}
                      &nbsp; <strong className="text-gray-800">{pur.supplierName}</strong>
                      <br />
                      <strong>DT: {pur.date}</strong> &nbsp;
                      <span className="font-bold text-red-600">Total: {formatBDT(pur.total)}</span>
                    </td>
                    <td className="db-noti-action-links pr-2 text-right">
                      <button
                        onClick={() => setCurrentRoute('pur_pinvlist.php', 'Purchase Invoice')}
                        className="btn btn-flat bg-purple btn-xs text-white text-[10px] px-2 py-0.5 rounded shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.slice(0, 2).map((sal, idx) => (
                  <tr key={`sal-${idx}`} className="hover:bg-gray-50">
                    <td className="w-8 db-noti-icons pl-2 text-center">
                      <i className="fa fa-sun-o text-amber-500"></i>
                    </td>
                    <td className="py-2 text-[11px] leading-snug">
                      Sales{' '}
                      <span className="bg-emerald-600 text-white font-mono font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {sal.invoiceNo}
                      </span>{' '}
                      &nbsp; <strong className="text-gray-800">{sal.customerName}</strong>
                      <br />
                      <strong>DT: {sal.date}</strong> &nbsp;
                      <span className="font-bold text-emerald-700">Total: {formatBDT(sal.grandTotal)}</span>
                    </td>
                    <td className="db-noti-action-links pr-2 text-right">
                      <button
                        onClick={() => setInvoiceToPrint(sal)}
                        className="btn btn-flat bg-purple btn-xs text-white text-[10px] px-2 py-0.5 rounded shadow-xs"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
                {cheques.slice(0, 3).map((chk, idx) => (
                  <tr key={`chk-${idx}`} className="hover:bg-gray-50">
                    <td className="w-8 db-noti-icons pl-2 text-center">
                      <i className="fa fa-money text-emerald-600"></i>
                    </td>
                    <td className="py-2 text-[11px] leading-snug">
                      Cheque No{' '}
                      <span className="bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {chk.chequeNo}
                      </span>{' '}
                      &nbsp; {chk.partyName}
                      <br />
                      <strong>DT: {chk.date}</strong> &nbsp;
                      <span className="font-bold text-sky-800">{chk.type}</span> &bull; {formatBDT(chk.amount)}
                    </td>
                    <td className="db-noti-action-links pr-2 text-right">
                      <button
                        onClick={() => setCurrentRoute('ban_checkman.php', 'Cheque Management')}
                        className="btn btn-flat bg-purple btn-xs text-white text-[10px] px-2 py-0.5 rounded shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Due Purchase Cost Box */}
        <div className="box box-solid flex flex-col border border-gray-200 shadow-sm">
          <div className="box-header flex items-center justify-between bg-white border-b border-gray-100">
            <h3 className="box-title">Due Purchase Cost</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Latest 5 Bills</span>
          </div>
          <div className="box-body p-0 flex-1 overflow-x-auto">
            <table className="table table-bordered table-striped w-full text-xs text-left" id="datarec">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="w-10 text-center py-2">SN</th>
                  <th className="py-2 px-2">Invoice</th>
                  <th className="py-2 px-2 text-center">Total</th>
                  <th className="py-2 px-2 text-right">Due</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 5).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-sky-50/40">
                    <td className="text-center py-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono font-bold text-[#0084bf]">
                      <button
                        onClick={() => setCurrentRoute('pur_pinvlist.php', 'Purchase Invoice')}
                        className="hover:underline text-left"
                      >
                        {p.invoiceNo}
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center font-medium">{formatBDT(p.total)}</td>
                    <td className="py-2 px-2 text-right font-bold text-red-600">
                      {p.due > 0 ? p.due : 0}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {p.due > 0 ? (
                        <button
                          onClick={() => handleOpenPayModal(p.id, p.invoiceNo, p.due, 'purchase')}
                          className="btn btn-flat bg-purple btn-xs text-[10px] px-1.5 py-0.5"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[10px] font-bold">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Due Sales Cost Box */}
        <div className="box box-solid flex flex-col border border-gray-200 shadow-sm">
          <div className="box-header flex items-center justify-between bg-white border-b border-gray-100">
            <h3 className="box-title">Due Sales Cost</h3>
            <span className="text-[10px] text-gray-400 font-semibold">Latest 5 Invoices</span>
          </div>
          <div className="box-body p-0 flex-1 overflow-x-auto">
            <table className="table table-bordered table-striped w-full text-xs text-left" id="datarec">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="w-10 text-center py-2">SN</th>
                  <th className="py-2 px-2">Invoice</th>
                  <th className="py-2 px-2 text-center">Total</th>
                  <th className="py-2 px-2 text-right">Due</th>
                  <th className="py-2 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-sky-50/40">
                    <td className="text-center py-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono font-bold text-[#0084bf]">
                      <button
                        onClick={() => setInvoiceToPrint(s)}
                        className="hover:underline text-left"
                      >
                        {s.invoiceNo}
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center font-medium">{formatBDT(s.grandTotal)}</td>
                    <td className="py-2 px-2 text-right font-bold text-red-600">
                      {s.dueAmount > 0 ? s.dueAmount : 0}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {s.dueAmount > 0 ? (
                        <button
                          onClick={() => handleOpenPayModal(s.id, s.invoiceNo, s.dueAmount, 'sale')}
                          className="btn btn-flat bg-purple btn-xs text-[10px] px-1.5 py-0.5"
                        >
                          Collect
                        </button>
                      ) : (
                        <button
                          onClick={() => setInvoiceToPrint(s)}
                          className="text-gray-600 hover:text-black text-xs"
                          title="Print Invoice"
                        >
                          <i className="fa fa-print"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Row 2: Date Filter Bar & 4 Small Boxes (.shortcuts) */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 shortcuts space-y-4">
        {/* Date Filter Bar matching real HTML form */}
        <div className="overflow-x-auto pb-1">
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-2 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Date From</label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                <span className="bg-gray-100 px-2.5 py-1 text-gray-500 border-r border-gray-300">
                  <i className="fa fa-calendar"></i>
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="px-2 py-1 text-xs focus:outline-none text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Date To</label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                <span className="bg-gray-100 px-2.5 py-1 text-gray-500 border-r border-gray-300">
                  <i className="fa fa-calendar"></i>
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="px-2 py-1 text-xs focus:outline-none text-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-flat bg-purple text-white uppercase text-xs font-bold px-4 py-1.5 shadow-xs"
            >
              Submit
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick('today')}
              className={`btn btn-flat ${activePreset === 'today' ? 'bg-[#00305d]' : 'bg-purple'} text-white uppercase text-xs font-bold px-3 py-1.5 shadow-xs`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick('week')}
              className={`btn btn-flat ${activePreset === 'week' ? 'bg-[#00305d]' : 'bg-purple'} text-white uppercase text-xs font-bold px-3 py-1.5 shadow-xs`}
            >
              This Week
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick('month')}
              className={`btn btn-flat ${activePreset === 'month' ? 'bg-[#00305d]' : 'bg-purple'} text-white uppercase text-xs font-bold px-3 py-1.5 shadow-xs`}
            >
              This Month
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick('year')}
              className={`btn btn-flat ${activePreset === 'year' ? 'bg-[#00305d]' : 'bg-purple'} text-white uppercase text-xs font-bold px-3 py-1.5 shadow-xs`}
            >
              This Year
            </button>
          </form>
        </div>

        {/* 4 Small Boxes with the green folded ribbon "Overall" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* 1. Overall Purchase */}
          <div
            onClick={() => setCurrentRoute('pur_pinvlist.php', 'Purchase Invoice')}
            className="small-box cursor-pointer"
          >
            <div className="ribbon"><span>Overall</span></div>
            <div className="icon"><i className="fa fa-handshake-o"></i></div>
            <div className="inner">
              <h4>{formatBDT(totalPurchase)}</h4>
              <p>Purchase</p>
            </div>
          </div>

          {/* 2. Overall Sales */}
          <div
            onClick={() => setCurrentRoute('sel_sinvlist.php', 'Sales Invoice')}
            className="small-box cursor-pointer"
          >
            <div className="ribbon"><span>Overall</span></div>
            <div className="icon"><i className="fa fa-sun-o"></i></div>
            <div className="inner">
              <h4>{formatBDT(totalSales)}</h4>
              <p>Sales</p>
            </div>
          </div>

          {/* 3. Overall Expense */}
          <div
            onClick={() => setCurrentRoute('dai_expenlist.php', 'Expenses Record')}
            className="small-box cursor-pointer"
          >
            <div className="ribbon"><span>Overall</span></div>
            <div className="icon"><i className="fa fa-rocket"></i></div>
            <div className="inner">
              <h4>{formatBDT(totalExpense)}</h4>
              <p>Expense</p>
            </div>
          </div>

          {/* 4. Overall Profit & Loss */}
          <div
            onClick={() => setCurrentRoute('fin_proandlos.php', 'Profit And Loss')}
            className="small-box cursor-pointer"
          >
            <div className="ribbon"><span>Overall</span></div>
            <div className="icon"><i className="fa fa-shopping-cart"></i></div>
            <div className="inner">
              <h4>{formatBDT(netProfit)}</h4>
              <p>Profit &amp; Loss</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row 3: Low Stock Product Box (with axe_prodet inline expanding details) */}
      <div className="box box-solid border border-gray-200 shadow-sm">
        <div className="box-header flex items-center justify-between bg-white border-b border-gray-100">
          <h3 className="box-title">Low Stock Product</h3>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
            {lowStockProducts.length} Items Below Minimum Level
          </span>
        </div>
        <div className="box-body p-0 overflow-x-auto">
          <table className="table table-bordered table-striped w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="w-12 text-center py-2">SN</th>
                <th className="py-2 px-3">Name (Click for details)</th>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3 text-center">In-Stock</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p, idx) => (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-red-50/30">
                    <td className="text-center py-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">
                      <b
                        className="prodetail cursor-pointer text-[#0084bf] hover:underline"
                        onClick={() => toggleProductExpand(p.id)}
                        title="Click to view full specification & location"
                      >
                        {p.name}
                      </b>
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-600">{p.sku}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center space-x-1">
                      <button
                        onClick={() => setCurrentRoute('pur_pinvcteate.php', 'Purchase Invoice Create')}
                        className="btn btn-flat bg-purple btn-xs text-[10px] px-2 py-0.5"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => toggleProductExpand(p.id)}
                        className="btn btn-flat bg-[#00305d] btn-xs text-[10px] px-2 py-0.5"
                      >
                        {expandedProductId === p.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>

                  {/* Inline Expanded Row matching axe_prodet.php */}
                  {expandedProductId === p.id && (
                    <tr className="details_tr bg-sky-50/80">
                      <td colSpan={5} className="p-3 border">
                        <div className="flex justify-between items-center mb-2 pb-1 border-b border-sky-200">
                          <span className="font-bold text-sm text-[#00305d]">
                            Product Details &bull; <span className="font-mono text-[#0084bf]">{p.sku}</span>
                          </span>
                          <button
                            onClick={() => setExpandedProductId(null)}
                            className="btn btn-flat bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-0.5"
                          >
                            Close
                          </button>
                        </div>

                        <table className="table table-bordered table-striped w-full bg-white text-xs mb-0">
                          <tbody>
                            <tr>
                              <td width="150" className="font-bold text-gray-700">Name:</td>
                              <td colSpan={3} className="font-bold text-gray-900">{p.name}</td>
                            </tr>
                            <tr>
                              <td width="150" className="font-bold text-gray-700">Brand:</td>
                              <td colSpan={3}>{p.brand}</td>
                            </tr>
                            <tr>
                              <td width="150" className="font-bold text-gray-700">Model No / SKU:</td>
                              <td colSpan={3} className="font-mono text-[#0084bf] font-bold">{p.sku}</td>
                            </tr>
                            <tr>
                              <td width="150" className="font-bold text-gray-700">Warranty Days:</td>
                              <td colSpan={3}>{p.warranty}</td>
                            </tr>
                            <tr>
                              <td width="150" className="font-bold text-gray-700">Location:</td>
                              <td colSpan={3} className="p-0">
                                <table className="table table-bordered table-striped w-full m-0 text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th colSpan={2}>Name</th>
                                      <th>Quantity</th>
                                      <th>Purchase</th>
                                      <th>Sale</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td colSpan={2}>Main Branch Showroom (Dhaka)</td>
                                      <td className="font-bold text-red-600">{p.stock} Pcs</td>
                                      <td>{formatBDT(p.purchasePrice)}</td>
                                      <td className="font-bold text-[#0084bf]">{formatBDT(p.salePrice)}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={2}>Central Warehouse (Tejgaon)</td>
                                      <td>0 Pcs</td>
                                      <td>{formatBDT(p.purchasePrice)}</td>
                                      <td>{formatBDT(p.salePrice)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-center font-bold text-gray-700 bg-gray-50" colSpan={4}>Description</td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="text-gray-600">
                                High performance computing product supplied by verified vendors. Low stock threshold alert active.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Due Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-4 border border-gray-300 text-xs">
            <h3 className="font-bold text-base text-gray-800 mb-2">
              {payModalInvoice.type === 'sale' ? 'Collect Customer Due' : 'Pay Supplier Due'}
            </h3>
            <p className="text-gray-600 mb-3">
              Invoice: <strong className="text-[#0084bf]">{payModalInvoice.invoiceNo}</strong>
              <br />
              Outstanding: <strong className="text-red-600">{formatBDT(payModalInvoice.due)}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Amount (৳)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  max={payModalInvoice.due}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-bold focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="btn btn-flat bg-purple text-white font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
