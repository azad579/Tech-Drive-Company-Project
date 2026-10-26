import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

interface EstimateItem {
  id: string;
  sn: number;
  date: string;
  customerName: string;
  customerPhone: string;
  customerCode: string;
  invoiceNo: string;
  total: number;
  note: string;
  isInvoice: 'Yes' | 'No';
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
}

const INITIAL_ESTIMATES: EstimateItem[] = [
  {
    id: 'est-1',
    sn: 1,
    date: '03 Feb 2026',
    customerName: 'Siam Electronics',
    customerPhone: '01719876543',
    customerCode: 'ABA/CL/004',
    invoiceNo: 'EST030226101',
    total: 99500,
    note: 'Preliminary laptop bundle cost estimate',
    isInvoice: 'No',
    items: [
      {
        productId: 'prod-1',
        name: 'HP EliteBook 840 G7 Core i5 10th Gen',
        sku: 'LAP-HP-840G7',
        qty: 1,
        price: 53000,
        subtotal: 53000
      },
      {
        productId: 'prod-6',
        name: 'Dell Latitude 5420 Core i5 11th Gen',
        sku: 'LAP-DELL-5420',
        qty: 1,
        price: 46500,
        subtotal: 46500
      }
    ]
  },
  {
    id: 'est-2',
    sn: 2,
    date: '29 Jan 2026',
    customerName: 'Walid Khan',
    customerPhone: '01811224466',
    customerCode: 'ABA/CL/009',
    invoiceNo: 'EST290126100',
    total: 82000,
    note: 'MacBook Air M1 price estimate with VAT',
    isInvoice: 'Yes',
    items: [
      {
        productId: 'prod-4',
        name: 'Apple MacBook Air M1 8GB/256GB SSD',
        sku: 'LAP-APP-M1',
        qty: 1,
        price: 82000,
        subtotal: 82000
      }
    ]
  }
];

export const SalesEstimateView: React.FC<{ initialCreateMode?: boolean }> = ({ initialCreateMode = false }) => {
  const { products, customers, setCurrentRoute, addSalesInvoice } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'create'>(initialCreateMode ? 'create' : 'list');
  const [estimates, setEstimates] = useState<EstimateItem[]>(INITIAL_ESTIMATES);

  // Filters for Estimate List
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-02-28');
  const [listSearch, setListSearch] = useState('');

  // Create Mode States
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 'cus-1');
  const [aslChecked, setAslChecked] = useState(false);

  // Cart
  const [cart, setCart] = useState<Array<{
    productId: string;
    name: string;
    sku: string;
    price: number;
    qty: number;
    subtotal: number;
  }>>([
    {
      productId: 'prod-1',
      name: 'HP EliteBook 840 G7 Core i5 10th Gen',
      sku: 'LAP-HP-840G7',
      price: 53000,
      qty: 1,
      subtotal: 53000
    }
  ]);

  // Calculations
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [aitPercent, setAitPercent] = useState<number>(0);
  const [freight, setFreight] = useState<number>(0);
  const [noteText, setNoteText] = useState('Estimate valid for 5 days.');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const alphabets = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        catalogSearch === '' ||
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesLetter =
        selectedLetter === 'ALL' ||
        p.name.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesLetter;
    });
  }, [products, catalogSearch, selectedLetter]);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.salePrice,
          qty: 1,
          subtotal: product.salePrice
        }
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setCart(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, qty: newQty, subtotal: newQty * i.price }
          : i
      )
    );
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
  const aitAmount = useMemo(() => ((subtotal - discountAmount) * aitPercent) / 100, [subtotal, discountAmount, aitPercent]);
  const grandTotal = useMemo(() => subtotal - discountAmount + aitAmount + freight, [subtotal, discountAmount, aitAmount, freight]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Estimate cart is empty.');
      return;
    }

    const estNo = `EST${Date.now().toString().slice(-6)}`;
    const newEst: EstimateItem = {
      id: `est-${Date.now()}`,
      sn: estimates.length + 1,
      date: '24 Oct 2026',
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-In Customer',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '01700000000',
      customerCode: selectedCustomer ? selectedCustomer.code : 'ABA/CL/001',
      invoiceNo: estNo,
      total: grandTotal,
      note: noteText,
      isInvoice: 'No',
      items: cart.map(c => ({
        productId: c.productId,
        name: c.name,
        sku: c.sku,
        qty: c.qty,
        price: c.price,
        subtotal: c.subtotal
      }))
    };

    setEstimates([newEst, ...estimates]);
    setToastMessage(`Estimate ${estNo} created successfully!`);
    setTimeout(() => {
      setToastMessage(null);
      setViewMode('list');
    }, 1500);
  };

  const handleConvertToInvoice = (est: EstimateItem) => {
    addSalesInvoice({
      customerId: 'cus-1',
      customerName: est.customerName,
      customerPhone: est.customerPhone,
      district: 'Dhaka',
      date: '24 Oct 2026',
      items: est.items.map(item => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        qty: item.qty,
        discount: 0,
        warranty: '1 Year',
        total: item.subtotal
      })),
      subtotal: est.total,
      discount: 0,
      taxVat: 0,
      grandTotal: est.total,
      paidAmount: est.total,
      dueAmount: 0,
      paymentMethod: 'Cash',
      status: 'Paid',
      notes: `Converted from Estimate ${est.invoiceNo}`
    });

    setEstimates(prev =>
      prev.map(e => (e.id === est.id ? { ...e, isInvoice: 'Yes' } : e))
    );

    setToastMessage(`Estimate ${est.invoiceNo} successfully converted to official Sales Invoice!`);
    setTimeout(() => setToastMessage(null), 3500);
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

      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">
          {viewMode === 'list' ? 'Sales Estimate' : 'Sales Estimate Create'}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span className="cursor-pointer hover:underline" onClick={() => setCurrentRoute('home.php')}>Dashboard</span>
          <span>&gt;</span>
          <span>Sales</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">
            {viewMode === 'list' ? 'Sales Estimate' : 'Sales Estimate Create'}
          </span>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* ================= LIST MODE (matching image_75c7dfab.png) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              {/* Header Box */}
              <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
                <span className="uppercase tracking-wide">ESTIMATE RECORD</span>
                <button
                  onClick={() => setViewMode('create')}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
                >
                  <i className="fa fa-plus"></i>
                  <span>CREATE ESTIMATE</span>
                </button>
              </div>

              {/* Filter Row */}
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
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="text"
                    placeholder="Search customer, invoice no..."
                    value={listSearch}
                    onChange={e => setListSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded pl-7 pr-2 py-1 bg-white"
                  />
                  <i className="fa fa-search absolute left-2 top-2 text-gray-400"></i>
                </div>
              </div>

              {/* Estimate Record Table */}
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
                      <th className="py-2 px-3 w-20 text-center">isInvoice</th>
                      <th className="py-2 px-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {estimates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                          No estimate records found.
                        </td>
                      </tr>
                    ) : (
                      estimates.map((est, idx) => (
                        <tr key={est.id} className="hover:bg-sky-50/50 transition">
                          <td className="py-2 px-3 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium">{est.date}</td>
                          <td className="py-2 px-3">
                            <div className="font-bold text-[#00305d]">{est.customerName}</div>
                            <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                              <span>Code: {est.customerCode}</span>
                              <span>&bull;</span>
                              <span>{est.customerPhone}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-[#0084bf]">{est.invoiceNo}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900">{formatBDT(est.total)}</td>
                          <td className="py-2 px-3 text-gray-600 text-[11px] truncate max-w-[200px]" title={est.note}>
                            {est.note || '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {est.isInvoice === 'Yes' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Converted
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center space-x-1.5">
                            {est.isInvoice !== 'Yes' && (
                              <button
                                onClick={() => handleConvertToInvoice(est)}
                                className="text-purple-600 hover:text-purple-900 p-1"
                                title="Convert to Official Invoice"
                              >
                                <i className="fa fa-exchange"></i>
                              </button>
                            )}
                            <button
                              onClick={() => alert(`Printing estimate receipt ${est.invoiceNo}`)}
                              className="text-[#0084bf] hover:text-sky-800 p-1"
                              title="Print Estimate"
                            >
                              <i className="fa fa-print"></i>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete estimate ${est.invoiceNo}?`)) {
                                  setEstimates(prev => prev.filter(e => e.id !== est.id));
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right History Sidebar matching image_75c7dfab.png */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-3 py-2 font-bold text-xs uppercase flex items-center justify-between">
                <span>History</span>
                <i className="fa fa-history"></i>
              </div>
              <div className="p-3 divide-y divide-gray-100 text-[11px] space-y-2 max-h-[500px] overflow-y-auto">
                <div className="pt-1.5 first:pt-0">
                  <div className="text-gray-400 font-medium">03 Feb 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Estimate EST030226101 created for Siam Electronics</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">29 Jan 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Estimate EST290126100 converted to invoice</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">20 Jan 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">New Sales Estimate created - EST200126098</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CREATE MODE (matching image_3d5cd7f3.png & image_a1ac59db.png) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Product Catalog Column */}
          <div className="lg:col-span-7 bg-white p-3 rounded border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200">
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <i className="fa fa-arrow-left"></i>
                  <span>Back to List</span>
                </button>
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full text-xs pl-7 pr-2 py-1 border border-gray-300 rounded focus:outline-none"
                  />
                  <i className="fa fa-search absolute left-2 top-2 text-gray-400 text-xs"></i>
                </div>
              </div>

              {/* Alphabets */}
              <div className="flex flex-wrap gap-1 mb-3">
                {alphabets.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      selectedLetter === letter
                        ? 'bg-[#0084bf] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[520px] overflow-y-auto p-1">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="cursor-pointer border border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 rounded-md p-2 flex flex-col items-center text-center transition group shadow-2xs relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mb-1 group-hover:scale-105 transition">
                      <i className="fa fa-shopping-bag text-2xl"></i>
                    </div>
                    <div className="text-[10px] font-bold font-mono text-rose-700 line-clamp-1">
                      {prod.sku}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-800 line-clamp-2 h-7 leading-tight mt-0.5">
                      {prod.name}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-gray-900">
                      {formatBDT(prod.salePrice)}
                    </div>
                    <div className="text-[9px] text-gray-400">
                      Cost: {formatBDT(prod.purchasePrice || 0)} &bull; Stock: {prod.stock}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 text-right mt-2 pt-1 border-t border-gray-100">
              Showing {filteredProducts.length} items
            </div>
          </div>

          {/* Right Estimate Cart Column */}
          <div className="lg:col-span-5 bg-white p-3 rounded border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              {/* Customer Selector */}
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Customer:</label>
                  <span className="font-bold text-rose-600">
                    Bal.: {formatBDT(selectedCustomer?.balance || 0)}
                  </span>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-xs font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in Estimate Cart */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#00305d] text-white text-[10px] uppercase">
                    <tr>
                      <th className="py-1 px-1.5 w-6 text-center">SN</th>
                      <th className="py-1 px-1.5">Item</th>
                      <th className="py-1 px-1 w-12 text-center">Qty</th>
                      <th className="py-1 px-1 w-16 text-right">Price</th>
                      <th className="py-1 px-1.5 w-18 text-right">SubTotal</th>
                      <th className="py-1 px-1 w-6 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {cart.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="py-1 px-1 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-1 px-1.5">
                          <div className="font-semibold text-gray-900 line-clamp-1 leading-tight">{item.name}</div>
                          <div className="text-[9px] text-gray-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => updateCartQty(item.productId, parseInt(e.target.value) || 1)}
                            className="w-10 border border-gray-300 rounded text-center text-xs py-0.5"
                          />
                        </td>
                        <td className="py-1 px-1 text-right font-medium">
                          {formatBDT(item.price)}
                        </td>
                        <td className="py-1 px-1.5 text-right font-bold text-gray-800 text-[11px]">
                          {formatBDT(item.subtotal)}
                        </td>
                        <td className="py-1 px-1 text-center">
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Estimate Calculations Block matching image_3d5cd7f3.png */}
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-[11px] space-y-1.5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sub Total:</span>
                  <span className="font-bold text-gray-800">{formatBDT(subtotal)}</span>
                </div>

                <div className="flex items-center space-x-2 py-0.5 border-y border-gray-200">
                  <input
                    type="checkbox"
                    id="aslCheck"
                    checked={aslChecked}
                    onChange={e => setAslChecked(e.target.checked)}
                    className="rounded text-[#0084bf]"
                  />
                  <label htmlFor="aslCheck" className="text-gray-700 font-semibold cursor-pointer">
                    Apply ASL Standard Pricing
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discount (%):</span>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-14 border border-gray-300 rounded text-right px-1 py-0.5 bg-white text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AIT (%):</span>
                    <input
                      type="number"
                      value={aitPercent}
                      onChange={e => setAitPercent(parseFloat(e.target.value) || 0)}
                      className="w-14 border border-gray-300 rounded text-right px-1 py-0.5 bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Freight / Delivery:</span>
                  <input
                    type="number"
                    value={freight}
                    onChange={e => setFreight(parseFloat(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded text-right px-1 py-0.5 bg-white text-xs"
                  />
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-[#00305d] pt-1 border-t border-gray-300">
                  <span>Grand Total:</span>
                  <span className="text-base text-[#0084bf]">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Note / estimate terms..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                />
              </div>
            </div>

            {/* Purple Checkout Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-2.5 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold text-sm uppercase rounded shadow-xs transition flex items-center justify-center space-x-2"
              >
                <i className="fa fa-calculator"></i>
                <span>SAVE ESTIMATE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
