import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

const RED_BAG_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="20,95 80,95 72,30 28,30" fill="%23d92525"/><polygon points="20,95 28,30 38,30 30,95" fill="%23ba1c1c"/><path d="M38,30 C38,12 62,12 62,30" fill="none" stroke="%23c2a649" stroke-width="4" stroke-linecap="round"/><polygon points="46,45 54,45 60,75 52,75 50,62 44,62 42,75 34,75" fill="white"/></svg>';

export const PurchaseInvoiceView: React.FC = () => {
  const { currentRoute, navigateToRoute, products, suppliers, purchases, addPurchaseInvoice, setInvoiceToPrint } = useApp();

  // Route sub-views
  const isOrderList = currentRoute === 'pur_porderlist.php';
  const isOrderCreate = currentRoute === 'pur_pordercreate.php';
  const isPurchaseCreate = currentRoute === 'pur_pinvcteate.php';
  const isReturnList = currentRoute === 'pur_preturnlist.php';
  const isReturnCreate = currentRoute === 'pur_preturncreate.php';
  // default: pur_pinvlist.php (Purchase Invoice List)

  // Search, Pagination & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-24');

  // Edit Serial Drawer state (matching image_e81ee08b.png)
  const [isEditSerialOpen, setIsEditSerialOpen] = useState(false);
  const [serialSearch, setSerialSearch] = useState('');
  const [activeSerialVal, setActiveSerialVal] = useState('AXE-456-123');
  const [newSerialVal, setNewSerialVal] = useState('');

  // Return Voucher Modal preview state (matching image_54ddc64b.png)
  const [selectedReturnVoucher, setSelectedReturnVoucher] = useState<{
    returnNo: string;
    invoiceNo: string;
    date: string;
    vendor: string;
    amount: number;
    amountInWords: string;
  } | null>(null);

  // POS / Order Create Cart state
  const [activeAlphabet, setActiveAlphabet] = useState('ALL');
  const [selectedSupplierCode, setSelectedSupplierCode] = useState('ABA/SU/008');
  const [productSearch, setProductSearch] = useState('');
  const [activeRightTab, setActiveRightTab] = useState<'Categories' | 'Sub Categories' | 'Brands'>('Brands');
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL BRANDS');

  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    code: string;
    name: string;
    eQty: number;
    qty: number;
    cost: number;
    serial: string;
  }>>([
    {
      id: '1',
      code: 'ABA223P',
      name: 'Catblack Laptop Cooling Fan Stand',
      eQty: 0,
      qty: 1,
      cost: 250,
      serial: 'TD-PF-1X7TKX'
    }
  ]);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [othersCost, setOthersCost] = useState<number>(0);
  const [speedMoney, setSpeedMoney] = useState<number>(0);
  const [freight, setFreight] = useState<number>(0);
  const [fractionalDiscount, setFractionalDiscount] = useState<number>(0);

  // Alphabet list for filter
  const alphabets = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const brandsList = [
    'ALL BRANDS', 'A4TECH', 'ACER', 'DELL', 'HP', 'LENOVO',
    'MICROSOFT', 'PREMIUM MOUSE PAD', 'SAMSUNG', 'SAMSUNG | SK HINEX | TOSHIBA | INTEL',
    'SONY', 'TECH DRIVE'
  ];

  const categoriesList = ['All Categories', 'Accessories', 'Laptop', 'Desktop', 'Components', 'Networking'];
  const subCategoriesList = ['All Sub Categories', 'Cooling Pad', 'Mouse', 'Keyboard', 'EliteBook', 'Latitude', 'Storage'];

  // Add product to cart
  const handleAddToCart = (product: any) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          code: product.code || product.sku,
          name: product.name,
          eQty: 0,
          qty: 1,
          cost: product.costPrice || product.purchasePrice || 250,
          serial: `TD-PF-${Math.floor(1000 + Math.random() * 9000)}`
        }
      ]);
    }
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(cartItems.filter(i => i.id !== id));
  };

  // Calculations
  const subtotalCart = cartItems.reduce((acc, i) => acc + (i.qty * i.cost), 0);
  const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const discountAmount = (subtotalCart * discountPercent) / 100;
  const vatAmount = (subtotalCart * vatPercent) / 100;
  const grandTotal = Math.max(0, subtotalCart - discountAmount + vatAmount + Number(othersCost) + Number(speedMoney) + Number(freight) - Number(fractionalDiscount));

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Please add products.');
      return;
    }
    const supp = suppliers.find(s => s.code === selectedSupplierCode) || suppliers[0];
    const newInvNo = `PUR241026${Math.floor(100 + Math.random() * 900)}`;

    addPurchaseInvoice({
      supplierId: supp.id,
      supplierName: supp.name,
      date: new Date().toISOString().split('T')[0],
      total: grandTotal,
      paid: grandTotal,
      due: 0,
      status: 'Paid'
    });

    alert(`Purchase Invoice ${newInvNo} generated successfully!`);
    setCartItems([]);
    navigateToRoute('pur_pinvlist.php');
  };

  // Filter catalog products for POS grid
  const filteredCatalog = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.code || p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchAlpha = activeAlphabet === 'ALL' ? true : p.name.toUpperCase().startsWith(activeAlphabet);
    const matchBrand = selectedBrand === 'ALL BRANDS' ? true : (p.brand?.toUpperCase() === selectedBrand);
    return matchSearch && matchAlpha && matchBrand;
  });

  // 1. PURCHASE ORDER LIST (pur_porderlist.php - image_3d2d19e3.png)
  if (isOrderList) {
    return (
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">Purchase Order</h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Purchase</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">Purchase Order</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide">
                PURCHASE RECORD
              </div>
              <div className="p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <span className="text-gray-600">records per page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Search:</span>
                    <input
                      type="text"
                      placeholder="Search order..."
                      className="border border-gray-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-200">
                    <thead className="bg-[#f4f7f9] text-gray-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">SN</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">Order No</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center">isInvoice</th>
                        <th className="py-2.5 px-3">Note</th>
                        <th className="py-2.5 px-3 text-center">Approve</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                      <tr>
                        <td className="py-2.5 px-3">1</td>
                        <td className="py-2.5 px-3">26 Sep 2026</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">Best Laptop Gallery</td>
                        <td className="py-2.5 px-3 font-mono">POR260926102</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">৳ 65,000.00</td>
                        <td className="py-2.5 px-3 text-center"><span className="text-emerald-600 font-bold">Yes</span></td>
                        <td className="py-2.5 px-3 text-gray-500">Urgent delivery</td>
                        <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold">Approved</span></td>
                        <td className="py-2.5 px-3 text-center">
                          <button className="w-6 h-6 rounded bg-[#605ca8] text-white inline-flex items-center justify-center">
                            <i className="fa fa-eye text-[11px]"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-gray-500">Showing 1 to 1 of 1 entries</div>
                  <button
                    onClick={() => navigateToRoute('pur_pordercreate.php')}
                    className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                  >
                    CREATE ORDER
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>DATE RANGE FILTER</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Date From</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Date To</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5" />
                </div>
                <button className="w-full py-1.5 bg-[#605ca8] text-white font-bold rounded">SUBMIT</button>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>HISTORY</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">26 Sep 2026</span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span>01:04:17 AM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">New Purchase Order has been Created</div>
                      <div className="text-gray-500 font-mono mt-0.5">Order Invoice: POR260926102</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PURCHASE RETURN PREVIEW MODAL (image_54ddc64b.png)
  if (selectedReturnVoucher) {
    return (
      <div className="space-y-4 pb-12">
        <div className="bg-[#2c3b41] text-white p-2.5 rounded-t flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button onClick={() => window.print()} className="w-7 h-7 rounded bg-[#00c0ef] text-white flex items-center justify-center">
              <i className="fa fa-print"></i>
            </button>
            <button className="w-7 h-7 rounded bg-[#0073b7] text-white flex items-center justify-center">
              <i className="fa fa-envelope"></i>
            </button>
            <button className="w-7 h-7 rounded bg-[#605ca8] text-white flex items-center justify-center">
              <i className="fa fa-file-pdf-o"></i>
            </button>
            <select className="border border-gray-500 bg-[#34495e] text-white rounded px-2 py-1">
              <option>A4 [210mm × 297mm]</option>
            </select>
            <select className="border border-gray-500 bg-[#34495e] text-white rounded px-2 py-1">
              <option>Portrait</option>
            </select>
            <select className="border border-gray-500 bg-[#34495e] text-white rounded px-2 py-1">
              <option>Invoice Only</option>
            </select>
          </div>
          <button
            onClick={() => setSelectedReturnVoucher(null)}
            className="w-7 h-7 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded flex items-center justify-center font-bold text-sm"
          >
            &times;
          </button>
        </div>

        <div className="bg-white p-8 rounded-b shadow-lg border border-gray-200 text-xs font-sans max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">TECH DRIVE</h2>
              <p className="text-gray-500">Your trusted Laptop &amp; IT partner</p>
              <p className="text-gray-500">Elephant Road, Dhaka, Bangladesh</p>
            </div>
            <div className="text-right">
              <h3 className="text-base font-bold text-red-600 uppercase">Purchase Return Voucher</h3>
              <p className="font-mono font-bold text-gray-800">Return No: {selectedReturnVoucher.returnNo}</p>
              <p className="text-gray-500">Against Invoice: {selectedReturnVoucher.invoiceNo}</p>
              <p className="text-gray-500">Date: {selectedReturnVoucher.date}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-3 bg-gray-50">
            <span className="font-semibold text-gray-700">Vendor: </span>
            <span className="font-bold text-gray-900">{selectedReturnVoucher.vendor}</span>
          </div>

          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100 font-bold text-gray-700 border-b">
              <tr>
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-3 text-right">Sub Total</th>
                <th className="py-2 px-3 text-right">Return Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-3">Warranty and replacement return items against original invoice</td>
                <td className="py-3 px-3 text-right font-mono font-bold">{selectedReturnVoucher.amount.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-red-600">{selectedReturnVoucher.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="font-semibold text-gray-800 uppercase tracking-wide">
            Amount in words: <span className="font-bold">{selectedReturnVoucher.amountInWords}</span>
          </div>

          <div className="grid grid-cols-2 pt-16 text-center text-xs text-gray-600">
            <div>
              <div className="w-48 mx-auto border-t border-gray-400 pt-1 font-semibold">Vendor Singnature</div>
            </div>
            <div>
              <div className="w-48 mx-auto border-t border-gray-400 pt-1 font-semibold">Authorized Singnature</div>
            </div>
          </div>

          <div className="text-center text-[11px] text-gray-400 pt-6 border-t border-gray-200">
            TECH DRIVE. &copy; 2020
          </div>
        </div>
      </div>
    );
  }

  // 3. PURCHASE RETURN LIST (pur_preturnlist.php - image_6726a7c7.png)
  if (isReturnList) {
    const returnRows = [
      { sn: 1, date: '20 Oct 2026', vendor: 'Best Laptop Gallery', inv: 'PRE201026105', against: 'PUR161026101', total: 53500, words: 'FIFTY-THREE THOUSAND FIVE HUNDRED TAKA ONLY' },
      { sn: 2, date: '20 Oct 2026', vendor: 'Abdul Ahad Enterprise', inv: 'PRE201026104', against: 'PUR021026101', total: 39500, words: 'THIRTY-NINE THOUSAND FIVE HUNDRED TAKA ONLY' },
      { sn: 3, date: '20 Oct 2026', vendor: 'Best Laptop Gallery', inv: 'PRE201026103', against: 'PUR111026101', total: 48000, words: 'FORTY-EIGHT THOUSAND TAKA ONLY' },
      { sn: 4, date: '20 Oct 2026', vendor: 'Abdul Ahad Enterprise', inv: 'PRE201026102', against: 'PUR280826101', total: 38000, words: 'THIRTY-EIGHT THOUSAND TAKA ONLY' },
      { sn: 5, date: '20 Oct 2026', vendor: 'Best Laptop Gallery', inv: 'PRE201026101', against: 'PUR010826101', total: 33000, words: 'THIRTY-THREE THOUSAND TAKA ONLY' },
      { sn: 6, date: '15 Oct 2026', vendor: 'Best Laptop Gallery', inv: 'PRE161026101', against: 'PUR220926101', total: 60000, words: 'SIXTY THOUSAND TAKA ONLY' },
    ];

    return (
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">Purchase Return</h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Purchase</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">Purchase Return</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide">
                RETURN RECORD
              </div>
              <div className="p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <span className="text-gray-600">records per page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Search:</span>
                    <input type="text" placeholder="Search return..." className="border border-gray-300 rounded px-2.5 py-1 text-xs" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-200">
                    <thead className="bg-[#f4f7f9] text-gray-700 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">SN</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Against</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3">Note</th>
                        <th className="py-2.5 px-3 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {returnRows.map(r => (
                        <tr key={r.sn} className="hover:bg-sky-50/40">
                          <td className="py-2 px-3 text-gray-500">{r.sn}</td>
                          <td className="py-2 px-3">{r.date}</td>
                          <td className="py-2 px-3 font-semibold text-gray-800">{r.vendor}</td>
                          <td className="py-2 px-3 font-mono text-gray-800">{r.inv}</td>
                          <td className="py-2 px-3 font-mono text-gray-500">{r.against}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">৳ {r.total.toLocaleString()}.00</td>
                          <td className="py-2 px-3 text-gray-400">-</td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => setSelectedReturnVoucher({
                                  returnNo: r.inv,
                                  invoiceNo: r.against,
                                  date: r.date,
                                  vendor: r.vendor,
                                  amount: r.total,
                                  amountInWords: r.words
                                })}
                                className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                                title="View Return Voucher"
                              >
                                <i className="fa fa-eye text-[11px]"></i>
                              </button>
                              <button
                                onClick={() => alert('Return record deleted.')}
                                className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                                title="Delete"
                              >
                                <i className="fa fa-trash text-[11px]"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-gray-500">Showing 1 to 6 of 6 entries</div>
                  <button
                    onClick={() => navigateToRoute('pur_preturncreate.php')}
                    className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                  >
                    CREATE RETURN
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>DATE RANGE FILTER</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Date From</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Date To</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5" />
                </div>
                <button className="w-full py-1.5 bg-[#605ca8] text-white font-bold rounded">SUBMIT</button>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>HISTORY</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">20 Oct 2026</span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span>08:45:42 PM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">New return invoice has been Created</div>
                      <div className="text-gray-500 font-mono mt-0.5">Return Invoice: PRE201026105</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ORDER CREATE & PURCHASE CREATE (pur_pordercreate.php & pur_pinvcteate.php - image_4b8079c5.png, image_9295d7dc.png, image_9bc9aed2.png)
  if (isOrderCreate || isPurchaseCreate) {
    return (
      <div className="space-y-4 pb-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">
            {isOrderCreate ? 'Order Create' : 'Purchase Create'}
          </h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Purchase</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">
              {isOrderCreate ? 'Order Create' : 'Purchase Create'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: POS Red Shopping Bag Grid with Alphabet Filter */}
          <div className="lg:col-span-7 bg-white p-3 rounded border border-gray-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <i className="fa fa-search absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="e.g. Product Code or Name"
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
              />
            </div>

            {/* Alphabet Filter Bar */}
            <div className="flex flex-wrap gap-1 text-[11px] select-none border-b border-gray-200 pb-2">
              {alphabets.map(alpha => (
                <button
                  key={alpha}
                  onClick={() => setActiveAlphabet(alpha)}
                  className={`px-2 py-0.5 rounded font-semibold transition ${
                    activeAlphabet === alpha
                      ? 'bg-[#00305d] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {alpha}
                </button>
              ))}
            </div>

            {/* Red Shopping Bag Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredCatalog.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="group relative border border-red-300 rounded overflow-hidden bg-white hover:border-red-500 cursor-pointer shadow-xs transition transform hover:-translate-y-0.5"
                >
                  {/* Top SKU Tag */}
                  <div className="bg-[#111] text-white text-[10px] font-mono text-center py-0.5 font-bold tracking-wider">
                    {p.code || p.sku}
                  </div>

                  {/* Red Bag Icon / Graphic */}
                  <div className="p-2 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white h-24">
                    <img
                      src={RED_BAG_ICON}
                      alt={p.name}
                      className="h-20 w-auto object-contain drop-shadow"
                    />
                  </div>

                  {/* Hover Overlay with stock count & Welcome */}
                  <div className="absolute inset-0 bg-black/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-1 text-center">
                    <span className="text-lg font-bold text-amber-400 font-mono">290</span>
                    <span className="text-[10px] text-gray-300">Welcome</span>
                    <span className="text-[9px] text-sky-300 font-mono mt-1">{p.code || p.sku}</span>
                  </div>

                  {/* Bottom Black Name Banner */}
                  <div className="bg-[#111] text-white text-[10px] px-1.5 py-1 text-center font-medium line-clamp-2 leading-tight h-8 flex items-center justify-center">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: POS Cart, Supplier Selector & Category Tabs */}
          <div className="lg:col-span-5 flex relative">
            <div className="flex-1 bg-white p-3.5 rounded-l border border-gray-200 shadow-xs space-y-3 text-xs overflow-hidden flex flex-col justify-between">
              {/* Top Form Selectors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center space-x-1.5">
                    <i className="fa fa-user text-gray-500"></i>
                    <select
                      value={selectedSupplierCode}
                      onChange={e => setSelectedSupplierCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-800"
                    >
                      <option value="ABA/SU/008">ABA/SU/008-City Laptop Zone</option>
                      <option value="ABA/SU/001">ABA/SU/001-Best Laptop Gallery</option>
                      <option value="ABA/SU/010">ABA/SU/010-Dubai-Sajid</option>
                    </select>
                    <button className="w-6 h-6 bg-[#0084bf] text-white rounded font-bold flex items-center justify-center text-xs">+</button>
                  </div>
                  <div className="ml-3 font-bold text-sm text-red-600 whitespace-nowrap">
                    Bal.: 0.00
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-1">
                    <input
                      type="text"
                      placeholder="e.g. Product Code or Name"
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                    <button className="w-6 h-6 bg-[#0084bf] text-white rounded font-bold flex items-center justify-center text-xs">+</button>
                  </div>
                  <div className="flex-1 flex items-center space-x-1">
                    <i className="fa fa-barcode text-gray-500"></i>
                    <input
                      type="text"
                      placeholder="e.g. Barcode"
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-600">C</span>
                    <select className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                      <option>-Select-</option>
                      {categoriesList.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button className="w-5 h-5 bg-[#0084bf] text-white rounded font-bold text-xs">+</button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-600">S</span>
                    <select className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                      <option>-Select-</option>
                      {subCategoriesList.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button className="w-5 h-5 bg-[#0084bf] text-white rounded font-bold text-xs">+</button>
                  </div>
                </div>
              </div>

              {/* Cart Items Table */}
              <div className="my-2 border border-gray-200 rounded max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px] divide-y divide-gray-200">
                  <thead className="bg-gray-100 font-semibold text-gray-700 sticky top-0">
                    <tr>
                      <th className="py-1 px-1.5 w-6 text-center">SN</th>
                      <th className="py-1 px-2">Item</th>
                      <th className="py-1 px-1 text-center w-12">E.Qty</th>
                      <th className="py-1 px-1 text-center w-12">Qty</th>
                      <th className="py-1 px-1 text-right w-14">Cost</th>
                      <th className="py-1 px-1 text-right w-14">SubTotal</th>
                      <th className="py-1 px-1 text-center w-6"><i className="fa fa-trash"></i></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {cartItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-1.5 px-1.5 text-center text-gray-500">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-medium text-gray-800 leading-tight">
                          {item.name}
                        </td>
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            value={item.eQty}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              setCartItems(cartItems.map(c => c.id === item.id ? { ...c, eQty: val } : c));
                            }}
                            className="w-10 border border-gray-300 rounded px-1 py-0.5 text-center"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 1;
                              setCartItems(cartItems.map(c => c.id === item.id ? { ...c, qty: val } : c));
                            }}
                            className="w-10 border border-gray-300 rounded px-1 py-0.5 text-center font-bold text-sky-800"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-right font-mono">{item.cost.toFixed(0)}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold">{(item.qty * item.cost).toFixed(0)}</td>
                        <td className="py-1.5 px-1 text-center">
                          <button
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cartItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-400">
                          There are no Purchase Item!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cart Footer Calculations matching image_4b8079c5.png */}
              <div className="space-y-1 text-[11px] border-t border-gray-200 pt-2 font-medium text-gray-700">
                <div className="flex justify-between items-center py-0.5">
                  <span>-Total-</span>
                  <div className="flex space-x-4 font-mono font-bold">
                    <span>{cartItems.reduce((a, b) => a + b.eQty, 0)}</span>
                    <span>{totalQty}</span>
                    <span>{subtotalCart}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Discount (%)</span>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>VAT (%)</span>
                  <input
                    type="number"
                    value={vatPercent}
                    onChange={e => setVatPercent(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>TAX (%)</span>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>&gt; Others:</span>
                  <input
                    type="number"
                    value={othersCost}
                    onChange={e => setOthersCost(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>Speed Money:</span>
                  <input
                    type="number"
                    value={speedMoney}
                    onChange={e => setSpeedMoney(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>Freight:</span>
                  <input
                    type="number"
                    value={freight}
                    onChange={e => setFreight(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>Fractional Discount:</span>
                  <input
                    type="number"
                    value={fractionalDiscount}
                    onChange={e => setFractionalDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-1.5 py-0.5 text-right font-mono"
                  />
                </div>

                <div className="flex justify-between items-center py-1 font-bold text-xs text-gray-900 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-sm text-sky-900">{grandTotal}</span>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="px-4 py-1.5 bg-[#d9534f] hover:bg-[#c9302c] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                >
                  EMPTY
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="px-5 py-1.5 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                >
                  CHECKOUT
                </button>
              </div>
            </div>

            {/* Vertical Colored Side Tabs: Categories (Blue), Sub Categories (Orange), Brands (Cyan) */}
            <div className="flex flex-col justify-start space-y-1 ml-1 select-none text-[11px] font-bold">
              <button
                onClick={() => setActiveRightTab('Categories')}
                className={`py-3 px-1 rounded-r writing-vertical flex items-center justify-center transition ${
                  activeRightTab === 'Categories' ? 'bg-[#0084bf] text-white shadow-md' : 'bg-sky-700 text-sky-100 hover:bg-sky-600'
                }`}
                style={{ writingMode: 'vertical-rl' }}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveRightTab('Sub Categories')}
                className={`py-3 px-1 rounded-r writing-vertical flex items-center justify-center transition ${
                  activeRightTab === 'Sub Categories' ? 'bg-[#f39c12] text-white shadow-md' : 'bg-amber-600 text-amber-100 hover:bg-amber-500'
                }`}
                style={{ writingMode: 'vertical-rl' }}
              >
                Sub Categories
              </button>
              <button
                onClick={() => setActiveRightTab('Brands')}
                className={`py-3 px-1 rounded-r writing-vertical flex items-center justify-center transition ${
                  activeRightTab === 'Brands' ? 'bg-[#00c0ef] text-white shadow-md' : 'bg-cyan-700 text-cyan-100 hover:bg-cyan-600'
                }`}
                style={{ writingMode: 'vertical-rl' }}
              >
                Brands
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. DEFAULT: PURCHASE INVOICE LIST (pur_pinvlist.php - image_0652ecfd.png, image_7c3b2ed2.png)
  const realPurchaseInvoices = [
    {
      sn: 1,
      date: '23 Oct 2026',
      supplierName: 'City Laptop Zone',
      supplierPhone: '01916593269',
      supplierEmail: 'citylaptopzone@gmail.com',
      supplierCode: 'ABA/SU/008',
      invoice: 'PUR231026102',
      total: 22000.0,
      note: 'Bashir mamas Product'
    },
    {
      sn: 2,
      date: '22 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR231026101',
      total: 54500.0,
      note: ''
    },
    {
      sn: 3,
      date: '21 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR221026102',
      total: 156500.0,
      note: 'SEL211026102'
    },
    {
      sn: 4,
      date: '20 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR221026103',
      total: 29500.0,
      note: 'Paid'
    },
    {
      sn: 5,
      date: '20 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR221026101',
      total: 198500.0,
      note: 'SEL201026101 |'
    },
    {
      sn: 6,
      date: '20 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR201026102',
      total: 154500.0,
      note: 'to adjust the ram'
    },
    {
      sn: 7,
      date: '18 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR181026101',
      total: 230000.0,
      note: 'Recived by Abu Siam Lenovo ThinkPad X13 Yoga Gen 3 Intel Core i5 12th Gen | 16GB RAM | 256GB SSD | 13.3" WUXGA 1920x1200 Touch | Intel Iris Xe Gr'
    },
    {
      sn: 8,
      date: '15 Oct 2026',
      supplierName: 'City Laptop Zone',
      supplierPhone: '01916593269',
      supplierEmail: 'citylaptopzone@gmail.com',
      supplierCode: 'ABA/SU/008',
      invoice: 'PUR161026103',
      total: 67500.0,
      note: ''
    },
    {
      sn: 9,
      date: '15 Oct 2026',
      supplierName: 'Dubai-Sajid',
      supplierPhone: '+099999999999',
      supplierEmail: '',
      supplierCode: 'ABA/SU/010',
      invoice: 'PUR161026102',
      total: 229246.0,
      note: ''
    },
    {
      sn: 10,
      date: '15 Oct 2026',
      supplierName: 'Best Laptop Gallery',
      supplierPhone: '01830515157',
      supplierEmail: 'bestlaptopgallery234@gmail.com',
      supplierCode: 'ABA/SU/001',
      invoice: 'PUR161026101',
      total: 291500.0,
      note: 'SEL151026103 | 15 Oct 2026'
    }
  ];

  return (
    <div className="space-y-4 pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">Purchase Invoice</h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Purchase</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Purchase Invoice</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Invoices Table */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide">
              PURCHASE RECORD
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <select
                    value={recordsPerPage}
                    onChange={e => {
                      setRecordsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-gray-600">records per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search invoices..."
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs w-48 sm:w-64"
                  />
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-[#f4f7f9] text-gray-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">SN</th>
                      <th className="py-2.5 px-3 w-24">Date</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {realPurchaseInvoices.map(p => (
                      <tr key={p.sn} className="hover:bg-sky-50/40">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">{p.sn}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">{p.date}</td>
                        <td className="py-2.5 px-3 space-y-0.5">
                          <div className="font-bold text-gray-800">{p.supplierName}</div>
                          {p.supplierPhone && (
                            <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                              <i className="fa fa-phone text-orange-500"></i>
                              <span>{p.supplierPhone}</span>
                            </div>
                          )}
                          {p.supplierEmail && (
                            <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                              <i className="fa fa-envelope text-orange-500"></i>
                              <span>{p.supplierEmail}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-amber-700 font-mono flex items-center space-x-1">
                            <i className="fa fa-id-card-o"></i>
                            <span>{p.supplierCode}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{p.invoice}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                          {formatBDT(p.total)}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 max-w-xs">{p.note || '-'}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setInvoiceToPrint({
                                  id: `pur-inv-${p.sn}`,
                                  invoiceNo: p.invoice,
                                  customerId: p.supplierCode || 'SUP-001',
                                  customerName: p.supplierName,
                                  customerPhone: p.supplierPhone || '0171561395',
                                  district: 'Mirpur, Dhaka',
                                  date: p.date,
                                  items: [
                                    {
                                      productId: 'pur-1',
                                      name: 'Catblack Laptop Cooling Fan Stand',
                                      sku: 'ABA223P',
                                      price: p.total,
                                      qty: 1,
                                      discount: 0,
                                      total: p.total,
                                      warranty: '1 Year Warranty'
                                    }
                                  ],
                                  subtotal: p.total,
                                  discount: 0,
                                  taxVat: 0,
                                  grandTotal: p.total,
                                  paidAmount: p.total,
                                  dueAmount: 0,
                                  paymentMethod: 'Cash',
                                  status: 'Paid',
                                  notes: p.note || 'Official Purchase Record'
                                });
                              }}
                              className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                              title="View / Print Invoice"
                            >
                              <i className="fa fa-print text-[11px]"></i>
                            </button>
                            <button
                              onClick={() => navigateToRoute('pur_pinvcteate.php')}
                              className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                              title="Edit Invoice"
                            >
                              <i className="fa fa-pencil text-[11px]"></i>
                            </button>
                            <button
                              onClick={() => navigateToRoute('pur_preturncreate.php')}
                              className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                              title="Purchase Return"
                            >
                              <i className="fa fa-reply text-[11px]"></i>
                            </button>
                            <button
                              onClick={() => alert(`Invoice ${p.invoice} deleted.`)}
                              className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                              title="Delete"
                            >
                              <i className="fa fa-trash text-[11px]"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions matching image_7c3b2ed2.png */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <div className="text-gray-500 text-xs">
                  Showing 1 to 10 of 216 entries (filtered from 207 total entries)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditSerialOpen(true)}
                    className="px-4 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs transition"
                  >
                    EDIT SERIAL
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToRoute('pur_pinvcteate.php')}
                    className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs transition"
                  >
                    CREATE PURCHASE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right History or Edit Serial Drawer */}
        <div className="lg:col-span-3 space-y-4">
          {isEditSerialOpen ? (
            /* Edit Serial Drawer matching image_e81ee08b.png */
            <div className="bg-white rounded border border-gray-200 shadow-lg overflow-hidden animate-in fade-in duration-200 text-xs">
              <div className="bg-[#d9534f] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>EDIT SERIAL</span>
                <button
                  type="button"
                  onClick={() => setIsEditSerialOpen(false)}
                  className="text-white hover:text-gray-200 font-bold text-base"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={serialSearch}
                    onChange={e => setSerialSearch(e.target.value)}
                    placeholder="e.g. Type Product Serial"
                    className="w-full pr-8 pl-3 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <i className="fa fa-search absolute right-2.5 top-2.5 text-gray-400"></i>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Serial</label>
                  <input
                    type="text"
                    disabled
                    value={activeSerialVal}
                    className="w-full bg-gray-100 border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Type New Serial</label>
                  <input
                    type="text"
                    value={newSerialVal}
                    onChange={e => setNewSerialVal(e.target.value)}
                    placeholder="e.g. AXE-456-123"
                    className="w-full border border-sky-400 rounded px-2.5 py-1.5 font-mono text-gray-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSerialVal) return;
                      setActiveSerialVal(newSerialVal);
                      alert(`Serial updated to ${newSerialVal}`);
                      setIsEditSerialOpen(false);
                      setNewSerialVal('');
                    }}
                    className="w-full py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                  >
                    UPDATE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* History Panel matching image_0652ecfd.png */
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold tracking-wider flex items-center justify-between">
                <span>HISTORY</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    23 Oct 2026
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span>02:50:10 AM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        New purchase invoice has been Created
                      </div>
                      <div className="text-gray-500 font-mono mt-0.5">
                        Purchase Invoice: PUR231026102
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span>02:35:38 AM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        New purchase invoice has been Created
                      </div>
                      <div className="text-gray-500 font-mono mt-0.5">
                        Purchase Invoice: PUR231026101
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
