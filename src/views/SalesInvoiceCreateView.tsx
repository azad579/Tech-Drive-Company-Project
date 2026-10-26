import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { BD_DISTRICTS } from '../data/mockData';
import { InvoiceItem } from '../types';

export const SalesInvoiceCreateView: React.FC = () => {
  const {
    products,
    customers,
    addSalesInvoice,
    setInvoiceToPrint,
    setCurrentRoute
  } = useApp();

  // Left Product Panel Filters
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Right Billing State
  const [isWalkIn, setIsWalkIn] = useState<boolean>(true);
  const [walkInName, setWalkInName] = useState<string>('Walk-In Customer');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cus-1');

  // Cart / Line Items
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([
    {
      productId: 'prod-6',
      name: 'Dell Latitude 5420 Core i5 11th Gen 16GB/512GB SSD',
      sku: 'LAP-DELL-5420',
      price: 46500,
      qty: 1,
      discount: 1500,
      warranty: '2 Years',
      serialNumber: 'DL5420-SN9821',
      total: 45000
    }
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(45000);
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Alphabets array
  const alphabets = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Categories
  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Filtered Products for Left Panel
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLetter =
        selectedLetter === 'ALL' ||
        p.name.toUpperCase().startsWith(selectedLetter);

      const matchesCat =
        selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesLetter && matchesCat;
    });
  }, [products, searchQuery, selectedLetter, selectedCategory]);

  const addToCart = (product: typeof products[0]) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price - i.discount }
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
          discount: 0,
          warranty: product.warranty,
          total: product.salePrice
        }
      ];
    });
  };

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const found = products.find(
      p => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );
    if (found) {
      addToCart(found);
      setBarcodeInput('');
      setNoticeMessage(null);
    } else {
      setNoticeMessage(`Product with SKU/Barcode "${barcodeInput}" not found!`);
      setTimeout(() => setNoticeMessage(null), 4000);
    }
  };

  const updateItemQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? {
              ...item,
              qty: newQty,
              total: newQty * item.price - item.discount
            }
          : item
      )
    );
  };

  const updateItemDiscount = (productId: string, disc: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? {
              ...item,
              discount: disc,
              total: Math.max(0, item.qty * item.price - disc)
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const totalItemDiscount = cartItems.reduce((acc, i) => acc + i.discount, 0);
  const grandTotal = Math.max(0, subtotal - totalItemDiscount);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Selected customer
  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      setNoticeMessage('Please add at least one product to the invoice!');
      setTimeout(() => setNoticeMessage(null), 4000);
      return;
    }

    const created = addSalesInvoice({
      customerId: isWalkIn ? 'cus-1' : currentCustomer.id,
      customerName: isWalkIn ? walkInName : currentCustomer.name,
      customerPhone: isWalkIn ? '' : currentCustomer.phone,
      district: isWalkIn ? selectedDistrict : currentCustomer.district,
      date: new Date().toISOString().split('T')[0],
      items: cartItems,
      subtotal,
      discount: totalItemDiscount,
      taxVat: 0,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod,
      status: dueAmount <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due'
    });

    setInvoiceToPrint(created);
  };

  return (
    <div className="space-y-3 pb-12">
      {noticeMessage && (
        <div className="bg-amber-500 text-white px-4 py-2 rounded text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <i className="fa fa-exclamation-triangle"></i>
            <span>{noticeMessage}</span>
          </div>
          <button onClick={() => setNoticeMessage(null)} className="text-white hover:text-amber-100 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Header breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>Invoice Create</span>
            <span className="text-xs font-normal text-gray-500">(Sales Billing Terminal)</span>
          </h1>
        </div>
        <ol className="flex items-center space-x-2 text-xs text-gray-500">
          <li>
            <button onClick={() => setCurrentRoute('home.php', 'Dashboard')} className="hover:text-[#0084bf]">
              Dashboard
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-700 font-medium">Sales Invoice Create</li>
        </ol>
      </div>

      {/* Split Screen POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left 5 Cols: Product Directory & Fast Picker */}
        <div className="lg:col-span-5 bg-white rounded shadow-xs border border-gray-200 flex flex-col h-[750px]">
          {/* Alphabet Tabs */}
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto">
              {alphabets.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition ${
                    selectedLetter === letter
                      ? 'bg-[#0084bf] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="mt-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Product Code, SKU, or Name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-[#0084bf] focus:ring-1 focus:ring-[#0084bf] focus:outline-none"
              />
              <span className="fa fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1 mt-2 overflow-x-auto pb-1 text-[11px]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 whitespace-nowrap rounded font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#00305d] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 p-2 overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No products found matching filters.
              </div>
            ) : (
              filteredProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-2 border border-gray-200 rounded hover:border-[#0084bf] hover:bg-sky-50/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-xs text-gray-800 line-clamp-1">{p.name}</div>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                      <span className="bg-gray-100 px-1 py-0.2 rounded font-mono text-gray-700">{p.sku}</span>
                      <span>&bull;</span>
                      <span>{p.warranty}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs text-[#0084bf]">{formatBDT(p.salePrice)}</div>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold inline-block mt-0.5 ${
                        p.stock > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 7 Cols: Invoice Details & Line Items */}
        <div className="lg:col-span-7 bg-white rounded shadow-xs border border-gray-200 flex flex-col h-[750px]">
          {/* Customer Selection Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWalkIn(!isWalkIn)}
                  className={`px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                    isWalkIn
                      ? 'bg-[#0084bf] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <i className="fa fa-user-circle"></i>
                  <span>Walk-In Customer</span>
                </button>

                {!isWalkIn && (
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - {c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Balance */}
              <div className="text-xs">
                <span className="text-gray-500 font-medium">Customer Due: </span>
                <span className="font-bold text-red-600">
                  {formatBDT(isWalkIn ? 0 : currentCustomer.balance)}
                </span>
              </div>
            </div>

            {/* Walk-in extra fields */}
            {isWalkIn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <input
                    type="text"
                    value={walkInName}
                    onChange={e => setWalkInName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none"
                  >
                    {BD_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Barcode Fast Scanner */}
            <form onSubmit={handleBarcodeSubmit} className="pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  placeholder="Scan Barcode / Type SKU and press Enter..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-gray-300 rounded focus:border-emerald-500 focus:outline-none font-mono"
                />
                <span className="fa fa-barcode absolute left-2.5 top-2 text-emerald-600 text-xs"></span>
              </div>
            </form>
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#00305d] text-white sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-2.5">Item Name</th>
                  <th className="py-2 px-2 w-20 text-right">Price</th>
                  <th className="py-2 px-2 w-24 text-center">Qty</th>
                  <th className="py-2 px-2 w-20 text-right">Disc.</th>
                  <th className="py-2 px-2.5 w-24 text-right">Total</th>
                  <th className="py-2 px-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No items in this invoice. Select products on the left to add.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-gray-800 line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center space-x-2">
                          <span>SKU: {item.sku}</span>
                          <span>&bull;</span>
                          <span>{item.warranty}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-medium">{formatBDT(item.price)}</td>
                      <td className="py-2 px-2 text-center">
                        <div className="inline-flex items-center border border-gray-300 rounded">
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.productId, item.qty - 1)}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-xs">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.productId, item.qty + 1)}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={e => updateItemDiscount(item.productId, Number(e.target.value))}
                          className="w-16 px-1 py-0.5 text-xs text-right border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-gray-800">
                        {formatBDT(item.total)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove item"
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

          {/* Bottom Billing Summary & Actions */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Subtotal</span>
                <span className="font-bold text-gray-800">{formatBDT(subtotal)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Item Discount</span>
                <span className="font-bold text-red-600">{formatBDT(totalItemDiscount)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Net Payable</span>
                <span className="font-bold text-[#0084bf]">{formatBDT(grandTotal)}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Remaining Due</span>
                <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatBDT(dueAmount)}
                </span>
              </div>
            </div>

            {/* Payment Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-gray-700">Payment:</label>
                {(['Cash', 'Bank', 'bKash', 'Nagad', 'Rocket'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-2 py-1 text-xs rounded font-medium transition ${
                      paymentMethod === method
                        ? 'bg-[#00305d] text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-gray-700">Paid (৳):</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  className="w-28 border border-gray-300 rounded px-2 py-1 text-xs font-bold text-right text-emerald-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPaidAmount(grandTotal)}
                  className="text-[10px] text-sky-600 underline font-semibold"
                >
                  Full Paid
                </button>
              </div>
            </div>

            {/* Submit & Print Button */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCartItems([])}
                className="px-3 py-2 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
              >
                Clear Cart
              </button>
              <button
                type="button"
                onClick={handleCompleteSale}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0084bf] to-[#006fa3] hover:from-[#006fa3] hover:to-[#005a85] rounded shadow-sm flex items-center space-x-2 transition"
              >
                <i className="fa fa-print"></i>
                <span>Complete Sale &amp; Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
