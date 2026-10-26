import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

export const ReportsView: React.FC<{ reportType?: 'cash' | 'general' | 'hub' }> = ({
  reportType = 'general'
}) => {
  const { sales, purchases, expenses, setInvoiceToPrint, setCurrentRoute } = useApp();
  const [activeTab, setActiveTab] = useState<string>(
    reportType === 'cash' ? 'cash' : reportType === 'hub' ? 'hub' : 'sales'
  );

  const [dateFrom, setDateFrom] = useState('2024-01-28');
  const [dateTo, setDateTo] = useState('2026-10-24');
  const [searchReportText, setSearchReportText] = useState('');

  const totalSales = sales.reduce((a, b) => a + b.grandTotal, 0);
  const totalSalesPaid = sales.reduce((a, b) => a + b.paidAmount, 0);
  const totalSalesDue = sales.reduce((a, b) => a + b.dueAmount, 0);

  const totalPurchases = purchases.reduce((a, b) => a + b.total, 0);
  const totalPurchasesPaid = purchases.reduce((a, b) => a + b.paid, 0);
  const totalPurchasesDue = purchases.reduce((a, b) => a + b.due, 0);

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);

  // Cash Statement figures
  const openingCash = 125000;
  const cashSalesInflow = sales.filter(s => s.paymentMethod === 'Cash').reduce((a, b) => a + b.paidAmount, 0);
  const cashExpenseOutflow = expenses.filter(e => e.paymentMethod === 'Cash').reduce((a, b) => a + b.amount, 0);
  const closingCash = openingCash + cashSalesInflow - cashExpenseOutflow;

  // Real CSV export
  const exportCSV = (filename: string, rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSalesCSV = () => {
    const rows = [
      ['SN', 'Date', 'Customer', 'Invoice', 'Total', 'Paid', 'Due'],
      ...sales.map((s, idx) => [
        String(idx + 1),
        s.date,
        `"${s.customerName}"`,
        s.invoiceNo,
        String(s.grandTotal),
        String(s.paidAmount),
        String(s.dueAmount)
      ])
    ];
    exportCSV('TechDrive_Sales_Report', rows);
  };

  const handlePrint = () => {
    window.print();
  };

  // Structured menu items matching axe_report.php from real site
  const reportCategories = [
    {
      title: 'Daily Report',
      icon: 'fa-exchange',
      items: [
        { name: 'Purchase', tab: 'purchases' },
        { name: 'Sales', tab: 'sales' },
        { name: 'Expenses', tab: 'expenses' },
        { name: 'Daily Cash Statement', tab: 'cash' },
        { name: 'Profit & Loss (Invoice)', tab: 'pnl' },
        { name: 'Overview', tab: 'overview' }
      ]
    },
    {
      title: 'Sales Reports',
      icon: 'fa-puzzle-piece',
      items: [
        { name: 'Sales Record (Invoice)', tab: 'sales' },
        { name: 'Customer Wise (Invoice)', tab: 'sales' },
        { name: 'Item Wise Statement', tab: 'sales' },
        { name: 'Periodic Sales Record', tab: 'sales' }
      ]
    },
    {
      title: 'Account Reports',
      icon: 'fa-sticky-note',
      items: [
        { name: 'Ledger Statement', tab: 'pnl' },
        { name: 'Cash Statement', tab: 'cash' },
        { name: 'Bank Statement', tab: 'cash' },
        { name: 'Trial Balance', tab: 'pnl' },
        { name: 'Balance Sheet', tab: 'pnl' }
      ]
    },
    {
      title: 'Purchase Reports',
      icon: 'fa-shopping-basket',
      items: [
        { name: 'Purchase Record (Invoice)', tab: 'purchases' },
        { name: 'Supplier Wise (Invoice)', tab: 'purchases' },
        { name: 'Item Wise Purchase', tab: 'purchases' }
      ]
    },
    {
      title: 'Receivables & Payables',
      icon: 'fa-handshake-o',
      items: [
        { name: 'Customer Due List', tab: 'sales' },
        { name: 'Supplier Due List', tab: 'purchases' },
        { name: 'Due Collection History', tab: 'sales' }
      ]
    },
    {
      title: 'Inventory Reports',
      icon: 'fa-barcode',
      items: [
        { name: 'Product Valuation Report', tab: 'overview' },
        { name: 'Serial & Warranty Summary', tab: 'overview' },
        { name: 'Branch Stock Movement', tab: 'overview' }
      ]
    }
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Breadcrumb Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-normal text-gray-800">
            Reports &amp; Analytics <small className="text-xs text-gray-500 font-normal">Business intelligence &amp; audit statements</small>
          </h1>
        </div>
        <ol className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1 sm:mt-0">
          <li>
            <button
              onClick={() => setCurrentRoute('home.php', 'Dashboard')}
              className="text-[#0084bf] hover:underline flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Home</span>
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-700 font-medium">Reports</li>
        </ol>
      </section>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto text-xs bg-white p-1 rounded-t shadow-xs">
        <button
          onClick={() => setActiveTab('sales')}
          className={`py-2 px-4 font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'sales'
              ? 'border-[#0084bf] text-[#0084bf]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sales Invoices ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`py-2 px-4 font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'purchases'
              ? 'border-[#0084bf] text-[#0084bf]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Purchase Records ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('cash')}
          className={`py-2 px-4 font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'cash'
              ? 'border-[#0084bf] text-[#0084bf]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Daily Cash Statement
        </button>
        <button
          onClick={() => setActiveTab('pnl')}
          className={`py-2 px-4 font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'pnl'
              ? 'border-[#0084bf] text-[#0084bf]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Profit &amp; Loss
        </button>
        <button
          onClick={() => setActiveTab('hub')}
          className={`py-2 px-4 font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'hub'
              ? 'border-[#0084bf] text-[#0084bf]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fa fa-th-large mr-1"></i>
          All Reports Directory (axe_report.php)
        </button>
      </div>

      {/* 1. SALES INVOICES LIST (Matching exact 2-column layout of sel_sinvlist.php) */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 9 Cols: Sales Table */}
          <div className="lg:col-span-9 space-y-3">
            <div className="box box-solid border border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="box-header flex items-center justify-between border-b border-gray-100 bg-gray-50">
                <h3 className="box-title">Sales Invoice Records</h3>
                <button
                  onClick={() => setCurrentRoute('sel_sinvcteate.php', 'Sales Invoice Create')}
                  className="btn btn-flat bg-purple text-white text-xs font-bold px-3 py-1"
                >
                  Create Sales
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-bordered table-striped w-full text-left text-xs" id="datarec">
                  <thead className="bg-[#00305d] text-white">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3 text-right">Total (৳)</th>
                      <th className="py-2.5 px-3 text-right">Paid (৳)</th>
                      <th className="py-2.5 px-3 text-right">Due (৳)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-gray-500">{s.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{s.customerName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{s.invoiceNo}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatBDT(s.grandTotal)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700">{formatBDT(s.paidAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-red-600">
                          {s.dueAmount > 0 ? formatBDT(s.dueAmount) : '0'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setInvoiceToPrint(s)}
                            className="btn btn-flat bg-purple text-white px-2 py-1 text-xs"
                            title="Print / View Invoice"
                          >
                            <i className="fa fa-print"></i>
                          </button>
                          <button
                            onClick={() => setCurrentRoute('sel_sinvcteate.php', 'Sales Invoice Create')}
                            className="btn btn-flat bg-[#00305d] text-white px-2 py-1 text-xs"
                            title="Edit / Re-Invoice"
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 3 Cols: Date Range Filter Box (Matching sel_sinvlist.php) */}
          <div className="lg:col-span-3">
            <div className="box box-solid border border-gray-200 shadow-sm bg-white">
              <div className="box-header bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
                <i className="fa fa-filter text-[#0084bf]"></i>
                <h3 className="box-title">Date Range Filter</h3>
              </div>
              <div className="box-body p-4 space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date From</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <span className="bg-gray-100 px-2 py-1.5 text-gray-500 border-r">
                      <i className="fa fa-calendar"></i>
                    </span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full px-2 py-1 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date To</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <span className="bg-gray-100 px-2 py-1.5 text-gray-500 border-r">
                      <i className="fa fa-calendar"></i>
                    </span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full px-2 py-1 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Filter Export Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleExportSalesCSV}
                    className="w-full btn btn-flat bg-purple text-white text-xs font-bold py-1.5 shadow-xs flex items-center justify-center space-x-1"
                  >
                    <i className="fa fa-file-text-o"></i>
                    <span>Exp -&gt; CSV</span>
                  </button>

                  <button
                    onClick={handleExportSalesCSV}
                    className="w-full btn btn-flat bg-[#00305d] text-white text-xs font-bold py-1.5 shadow-xs flex items-center justify-center space-x-1"
                  >
                    <i className="fa fa-file-excel-o"></i>
                    <span>Exp -&gt; Excel</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full btn btn-flat bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold py-1.5 shadow-xs flex items-center justify-center space-x-1"
                  >
                    <i className="fa fa-print"></i>
                    <span>Print Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PURCHASES TAB */}
      {activeTab === 'purchases' && (
        <div className="box box-solid border border-gray-200 shadow-sm bg-white overflow-hidden">
          <div className="box-header flex items-center justify-between border-b border-gray-100 bg-gray-50">
            <h3 className="box-title">Procurement Ledger</h3>
            <button
              onClick={() => setCurrentRoute('pur_pinvcteate.php', 'Purchase Invoice Create')}
              className="btn btn-flat bg-purple text-white text-xs font-bold px-3 py-1"
            >
              Create Purchase
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-bordered table-striped w-full text-left text-xs">
              <thead className="bg-[#00305d] text-white">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3 text-right">Total (৳)</th>
                  <th className="py-2.5 px-3 text-right">Paid (৳)</th>
                  <th className="py-2.5 px-3 text-right">Due (৳)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-gray-500">{p.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{p.supplierName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{p.invoiceNo}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatBDT(p.total)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">{formatBDT(p.paid)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-600">
                      {p.due > 0 ? formatBDT(p.due) : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CASH STATEMENT TAB */}
      {activeTab === 'cash' && (
        <div className="box box-solid border border-gray-200 shadow-sm bg-white max-w-xl mx-auto p-5 text-xs">
          <div className="text-center pb-3 border-b">
            <h2 className="text-base font-bold text-[#00305d]">TECH DRIVE - Daily Cash Statement</h2>
            <p className="text-[11px] text-gray-500">As on {new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex justify-between py-1.5 border-b">
              <span className="font-semibold text-gray-700">1. Opening Drawer Cash:</span>
              <span className="font-bold">{formatBDT(openingCash)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b text-emerald-700">
              <span className="font-semibold">(+) Cash Counter Sales:</span>
              <span className="font-bold">+{formatBDT(cashSalesInflow)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b text-red-600">
              <span className="font-semibold">(-) Petty Expenses:</span>
              <span className="font-bold">-{formatBDT(cashExpenseOutflow)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-gray-800 text-sm font-extrabold text-[#00305d]">
              <span>Closing Cash in Hand:</span>
              <span>{formatBDT(closingCash)}</span>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button onClick={handlePrint} className="btn btn-flat bg-[#00305d] text-white">
                <i className="fa fa-print mr-1"></i> Print Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFIT & LOSS */}
      {activeTab === 'pnl' && (
        <div className="box box-solid border border-gray-200 shadow-sm bg-white max-w-xl mx-auto p-5 text-xs">
          <div className="text-center pb-3 border-b">
            <h2 className="text-base font-bold text-[#00305d]">TECH DRIVE - Profit and Loss Account</h2>
            <p className="text-[11px] text-gray-500">Operating Summary</p>
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex justify-between py-1.5 border-b">
              <span className="font-bold text-gray-800">Gross Sales Revenue:</span>
              <span className="font-bold text-emerald-700">{formatBDT(totalSales)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b text-gray-600">
              <span>(-) Cost of Goods Sold (70%):</span>
              <span className="font-semibold text-red-600">-{formatBDT(totalSales * 0.7)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b font-bold text-[#0084bf]">
              <span>Gross Profit:</span>
              <span>{formatBDT(totalSales * 0.3)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b text-gray-600">
              <span>(-) Total Operating Expenses:</span>
              <span className="font-semibold text-red-600">-{formatBDT(totalExpenses)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-gray-800 text-sm font-extrabold text-emerald-700">
              <span>Net Operating Profit:</span>
              <span>+{formatBDT(Math.max(0, (totalSales * 0.3) - totalExpenses))}</span>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button onClick={handlePrint} className="btn btn-flat bg-[#00305d] text-white">
                <i className="fa fa-print mr-1"></i> Print P&amp;L
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ALL REPORTS DIRECTORY HUB (Matching exact axe_report.php from real website) */}
      {activeTab === 'hub' && (
        <div className="box box-solid border border-gray-200 shadow-sm bg-white p-5 text-xs">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 mb-4 gap-2">
            <h2 className="text-base font-bold text-[#00305d] flex items-center space-x-2">
              <i className="fa fa-folder-open text-[#0084bf]"></i>
              <span>Report Navigation Hub (axe_report.php)</span>
            </h2>

            <div className="relative w-64">
              <input
                type="text"
                value={searchReportText}
                onChange={e => setSearchReportText(e.target.value)}
                placeholder="Search report names..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none"
              />
              <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-400"></i>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCategories.map((cat, idx) => (
              <div key={idx} className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-[#00305d] text-white px-3 py-2 font-bold flex items-center space-x-2">
                  <i className={`fa ${cat.icon} text-sky-300`}></i>
                  <span>{cat.title}</span>
                </div>
                <ul className="divide-y divide-gray-100 bg-white">
                  {cat.items
                    .filter(i => searchReportText === '' || i.name.toLowerCase().includes(searchReportText.toLowerCase()))
                    .map((item, iIdx) => (
                      <li key={iIdx}>
                        <button
                          onClick={() => setActiveTab(item.tab)}
                          className="w-full px-3 py-2 text-left hover:bg-sky-50 flex items-center justify-between text-gray-700 transition"
                        >
                          <span className="flex items-center space-x-2">
                            <i className="fa fa-caret-right text-sky-500"></i>
                            <span>{item.name}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">View</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
