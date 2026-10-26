import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

interface DailyExpensesViewProps {
  viewMode?: 'record' | 'create' | 'head_list' | 'head_create';
}

const INITIAL_EXPENSE_HEADS = [
  { id: 1, name: 'Bank Charges', nameBangla: 'ব্যাংক চার্জ', type: 'Administrative Expenses', desc: 'Bank transactional charges, card POS fees, and account maintenance' },
  { id: 2, name: 'Conveyances', nameBangla: 'যাতায়াত খরচ', type: 'Operating Expenses', desc: 'Local conveyance and travel expenses for staff and product delivery' },
  { id: 3, name: 'Cost of Goods Damage', nameBangla: 'পণ্যের ক্ষয়ক্ষতি খরচ', type: 'Operating Expenses', desc: 'In-transit damage and unrecoverable stock scrap write-off' },
  { id: 4, name: 'Discount On Item', nameBangla: 'আইটেম ছাড়', type: 'Operating Expenses', desc: 'Item level promotional deductions' },
  { id: 5, name: 'Discount On Sales', nameBangla: 'বিক্রয় ছাড়', type: 'Operating Expenses', desc: 'Special wholesale and seasonal discounts' },
  { id: 6, name: 'Electricity Bills', nameBangla: 'বিদ্যুৎ বিল', type: 'Administrative Expenses', desc: 'Showroom and office electricity meter bills' },
  { id: 7, name: 'Entertainment', nameBangla: 'আপ্যায়ন', type: 'Operating Expenses', desc: 'Customer refreshments and hospitality' },
  { id: 8, name: 'Food, Lunch & Entertainments', nameBangla: 'খাবার ও আপ্যায়ন', type: 'Administrative Expenses', desc: 'Staff daily lunch, overtime snacks and visitor treats' },
  { id: 9, name: 'Home Delivery', nameBangla: 'হোম ডেলিভারি', type: 'Operating Expenses', desc: 'Courier, Pathao, and RedX delivery charges' },
  { id: 10, name: 'Internet & IT Expenses', nameBangla: 'ইন্টারনেট ও আইটি খরচ', type: 'Administrative Expenses', desc: 'Fiber optic broadband, ERP hosting and domains' },
  { id: 11, name: 'Office Rent', nameBangla: 'অফিস ভাড়া', type: 'Administrative Expenses', desc: 'Showroom and corporate space monthly rental' },
  { id: 12, name: 'Packaging & Printing', nameBangla: 'প্যাকেজিং ও প্রিন্টিং', type: 'Operating Expenses', desc: 'Cartons, bubble wraps, warranty sticker and invoices printing' },
  { id: 13, name: 'Repair & Maintenance', nameBangla: 'মেরামত ও রক্ষণাবেক্ষণ', type: 'Administrative Expenses', desc: 'Lab equipment, AC servicing and store renovation' },
  { id: 14, name: 'Salary & Allowances', nameBangla: 'বেতন ও ভাতা', type: 'Administrative Expenses', desc: 'Monthly staff remuneration and festive bonuses' },
  { id: 15, name: 'TEA/ SNACKS', nameBangla: 'চা ও নাস্তা', type: 'Operating Expenses', desc: 'Showroom daily tea, biscuits and quick refreshments' },
  { id: 16, name: 'Cleaning & Sanitation', nameBangla: 'পরিচ্ছন্নতা খরচ', type: 'Operating Expenses', desc: 'Showroom cleaning supplies, dust repellents and hygiene kits' },
  { id: 17, name: 'Marketing & Promotion', nameBangla: 'মার্কেটিং ও বিজ্ঞাপন', type: 'Operating Expenses', desc: 'Social media ads, flyers, banners, and digital marketing campaigns' },
  { id: 18, name: 'Stationery & Supplies', nameBangla: 'স্টেশনারি দ্রব্যাদি', type: 'Administrative Expenses', desc: 'Printer toner, POS paper rolls, pens, invoices, and office files' },
  { id: 19, name: 'Software Subscription', nameBangla: 'সফটওয়্যার সাবস্ক্রিপশন', type: 'Administrative Expenses', desc: 'ERP hosting, cloud backup storage, antivirus, and office software' },
  { id: 20, name: 'Trade License & Legal', nameBangla: 'ট্রেড লাইসেন্স ও আইনি খরচ', type: 'Administrative Expenses', desc: 'Annual city corporation trade license renewal and legal documentation' },
  { id: 21, name: 'Utility & Water Bill', nameBangla: 'পানি ও ইউটিলিটি বিল', type: 'Administrative Expenses', desc: 'Commercial building service charges, WASA water bills' },
  { id: 22, name: 'Security Guard & CCTV', nameBangla: 'নিরাপত্তা ও সিসিটিভি', type: 'Administrative Expenses', desc: 'Market security services and surveillance maintenance' },
  { id: 23, name: 'Courier & Parcel Charge', nameBangla: 'কুরিয়ার ও পার্সেল চার্জ', type: 'Operating Expenses', desc: 'Inter-district parcel handling through Sundarban & SA Paribahan' },
  { id: 24, name: 'Customer Claim Adjustment', nameBangla: 'গ্রাহক দাবি সমন্বয়', type: 'Operating Expenses', desc: 'Special warranty claim settlements and dispute adjustments' },
  { id: 25, name: 'Generator Fuel & Power', nameBangla: 'জেনারেটর জ্বালানি', type: 'Administrative Expenses', desc: 'Octane and diesel expenses for power backup generator' },
  { id: 26, name: 'Mobile Bill & Airtime', nameBangla: 'মোবাইল বিল ও রিচার্জ', type: 'Operating Expenses', desc: 'Official customer support hotline post-paid connections' },
  { id: 27, name: 'Festival Bonus', nameBangla: 'উৎসব বোনাস', type: 'Administrative Expenses', desc: 'Eid and seasonal staff holiday allowances' },
  { id: 28, name: 'Miscellaneous Expenses', nameBangla: 'বিবিধ খরচ', type: 'Operating Expenses', desc: 'Uncategorized emergency petty cash spending' },
];

export const DailyExpensesView: React.FC<DailyExpensesViewProps> = () => {
  const { currentRoute, navigateToRoute, expenses, addExpense } = useApp();

  // Mode detection from route
  const isCreateVoucher = currentRoute === 'dai_expensescreate.php';
  const isHeadList = currentRoute === 'dai_esexpenlist.php';
  const isHeadCreate = currentRoute === 'dai_explist.php';
  // default: dai_expenlist.php (Expenses Record)

  // Filter state for Expenses Record
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-10-24');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Voucher Form state
  const [voucherNo] = useState(`EXP241026${Math.floor(100 + Math.random() * 900)}`);
  const [voucherDate, setVoucherDate] = useState('2026-10-24');
  const [selectedHead, setSelectedHead] = useState('TEA/ SNACKS');
  const [refInput, setRefInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [voucherItems, setVoucherItems] = useState<Array<{ id: string; head: string; ref: string; amount: number }>>([
    { id: '1', head: 'Food, Lunch & Entertainments', ref: 'Showroom Lunch', amount: 850 },
    { id: '2', head: 'Conveyances', ref: 'IDB to Multiplan Courier', amount: 350 },
  ]);
  const [voucherNote, setVoucherNote] = useState('');

  // Head Add/Edit Form state
  const [headName, setHeadName] = useState('');
  const [headNameBangla, setHeadNameBangla] = useState('');
  const [headType, setHeadType] = useState('Administrative Expenses');
  const [headDesc, setHeadDesc] = useState('');
  const [editingHeadId, setEditingHeadId] = useState<number | null>(null);

  const handleAddItemToVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (!val || val <= 0) return;
    setVoucherItems([
      ...voucherItems,
      {
        id: String(Date.now()),
        head: selectedHead,
        ref: refInput || '-',
        amount: val
      }
    ]);
    setAmountInput('');
    setRefInput('');
  };

  const handleRemoveVoucherItem = (id: string) => {
    setVoucherItems(voucherItems.filter(i => i.id !== id));
  };

  const handleSaveVoucher = () => {
    if (voucherItems.length === 0) {
      alert('Please add at least one expense item to the voucher.');
      return;
    }
    voucherItems.forEach(item => {
      addExpense({
        date: voucherDate,
        expenseHead: item.head,
        amount: item.amount,
        paidTo: item.ref || 'Petty Cash',
        paymentMethod: 'Cash',
        note: voucherNote
      });
    });
    alert('Expenses voucher has been saved successfully!');
    navigateToRoute('dai_expenlist.php');
  };

  const totalVoucherAmount = voucherItems.reduce((acc, i) => acc + i.amount, 0);

  // If in Add/Edit Expenses Head View
  if (isHeadCreate) {
    return (
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">
            {editingHeadId ? 'Expenses Head' : 'Add Expenses Head'}
          </h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Daily Process</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">
              {editingHeadId ? 'Expenses Head' : 'Add Expenses Head'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide">
                {editingHeadId ? 'EDIT EXPENSES HEAD' : 'ADD EXPENSES HEAD'}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  alert('Expenses Head saved successfully!');
                  navigateToRoute('dai_esexpenlist.php');
                }}
                className="p-6 space-y-4 text-xs max-w-xl mx-auto"
              >
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={headName}
                    onChange={e => setHeadName(e.target.value)}
                    placeholder="e.g. Electric Bill"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Name (Bangla)</label>
                  <input
                    type="text"
                    value={headNameBangla}
                    onChange={e => setHeadNameBangla(e.target.value)}
                    placeholder="e.g. বিদ্যুৎ বিল"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Expeses Type</label>
                  <select
                    value={headType}
                    onChange={e => setHeadType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084bf] bg-white"
                  >
                    <option value="Administrative Expenses">Administrative Expenses</option>
                    <option value="Operating Expenses">Operating Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={headDesc}
                    onChange={e => setHeadDesc(e.target.value)}
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs text-xs tracking-wider uppercase transition"
                  >
                    {editingHeadId ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToRoute('dai_esexpenlist.php')}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded shadow-xs text-xs tracking-wider uppercase transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs tracking-wider flex items-center justify-between">
                <span>HISTORY</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-4 space-y-4 text-xs">
                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    07 Nov 2025
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span><i className="fa fa-clock-o mr-1"></i>09:06:27 PM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        New Expenses Head has been created
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Expenses Head name: TEA/ SNACKS
                      </div>
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

  // If in Expenses Head List View (dai_esexpenlist.php)
  if (isHeadList) {
    return (
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">Expenses Head</h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Daily Process</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">Expenses Head</span>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide flex items-center justify-between">
            <span>EXPENSES HEAD LIST</span>
            <button
              onClick={() => {
                setEditingHeadId(null);
                setHeadName('');
                setHeadNameBangla('');
                setHeadDesc('');
                navigateToRoute('dai_explist.php');
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded text-xs font-semibold"
            >
              <i className="fa fa-plus mr-1"></i>ADD NEW HEAD
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                <thead className="bg-[#f4f7f9] text-gray-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">SN</th>
                    <th className="py-2.5 px-3">Head Name</th>
                    <th className="py-2.5 px-3">Name (Bangla)</th>
                    <th className="py-2.5 px-3">Expense Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {INITIAL_EXPENSE_HEADS.map((h, idx) => (
                    <tr key={h.id} className="hover:bg-sky-50/40">
                      <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-gray-800">{h.name}</td>
                      <td className="py-2 px-3 font-bengali text-gray-600">{h.nameBangla}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          h.type.includes('Administrative') ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'
                        }`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 max-w-xs">{h.desc}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => {
                            setEditingHeadId(h.id);
                            setHeadName(h.name);
                            setHeadNameBangla(h.nameBangla);
                            setHeadType(h.type);
                            setHeadDesc(h.desc);
                            navigateToRoute('dai_explist.php');
                          }}
                          className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                          title="Edit"
                        >
                          <i className="fa fa-pencil text-[11px]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If in Add Expenses Voucher View (dai_expensescreate.php)
  if (isCreateVoucher) {
    return (
      <div className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <h1 className="text-xl font-bold text-gray-800">Add Expenses</h1>
          <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
            <span>&gt;</span>
            <span>Daily Process</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">Add Expenses</span>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide flex items-center justify-between">
            <span>ADD EXPENSES</span>
            <span className="text-xs bg-emerald-700 px-3 py-0.5 rounded font-bold">
              + Balance: 89,510.00
            </span>
          </div>

          <div className="p-5 space-y-5 text-xs">
            {/* Header Voucher Meta */}
            <div className="text-center pb-2 border-b border-gray-200">
              <h2 className="text-base font-bold text-[#00305d] uppercase tracking-wider">
                EXPENSES VOUCHER
              </h2>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddItemToVoucher} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded border border-gray-200">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Expenses No</label>
                <input
                  type="text"
                  disabled
                  value={voucherNo}
                  className="w-full bg-gray-200/80 border border-gray-300 rounded px-2.5 py-1.5 font-mono text-gray-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={voucherDate}
                  onChange={e => setVoucherDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 font-semibold mb-1">Expenses Head *</label>
                <select
                  value={selectedHead}
                  onChange={e => setSelectedHead(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white focus:ring-1 focus:ring-[#0084bf]"
                >
                  {INITIAL_EXPENSE_HEADS.map(h => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.nameBangla})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 font-semibold mb-1">Ref / Particulars</label>
                <input
                  type="text"
                  value={refInput}
                  onChange={e => setRefInput(e.target.value)}
                  placeholder="e.g. Tea for guests"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-gray-700 font-semibold mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 text-right font-mono focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded shadow-xs uppercase tracking-wider"
                >
                  ADD
                </button>
              </div>
            </form>

            {/* Added Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                <thead className="bg-[#00305d] text-white">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">SN</th>
                    <th className="py-2 px-3">Expenses Head</th>
                    <th className="py-2 px-3">Ref</th>
                    <th className="py-2 px-3 text-right w-36">Amount</th>
                    <th className="py-2 px-3 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {voucherItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-gray-800">{item.head}</td>
                      <td className="py-2 px-3 text-gray-600">{item.ref}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-gray-800">
                        {item.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVoucherItem(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {voucherItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        No expenses item added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100 font-bold text-gray-800 border-t border-gray-300">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right uppercase">Total:</td>
                    <td className="py-2 px-3 text-right font-mono text-red-600 text-sm">
                      {formatBDT(totalVoucherAmount)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note Textarea */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Note</label>
              <textarea
                rows={2}
                value={voucherNote}
                onChange={e => setVoucherNote(e.target.value)}
                placeholder="Additional details..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 focus:ring-1 focus:ring-[#0084bf]"
              />
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setVoucherItems([])}
                className="px-5 py-2 bg-[#d9534f] hover:bg-[#c9302c] text-white font-bold rounded shadow-xs uppercase tracking-wider transition"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={handleSaveVoucher}
                className="px-6 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider transition"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => navigateToRoute('dai_expenlist.php')}
                className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded shadow-xs uppercase tracking-wider transition"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Expenses List / EXPENSES RECORD (dai_expenlist.php)
  const filtered = expenses.filter(e =>
    e.expenseHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / recordsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="space-y-4 pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">Expenses List</h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Daily Process</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Expenses List</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main List */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>EXPENSES RECORD</span>
              <span className="text-xs font-normal bg-sky-800/60 px-2 py-0.5 rounded">
                Total Records: {expenses.length}
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search expenses..."
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs w-48 sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-[#f4f7f9] text-gray-700 font-semibold select-none">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3">EXPENSES NO</th>
                      <th className="py-2.5 px-3">EXPENSE HEAD</th>
                      <th className="py-2.5 px-3 text-right">AMOUNT</th>
                      <th className="py-2.5 px-3">NOTE</th>
                      <th className="py-2.5 px-3 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {paginated.map((exp, idx) => {
                      const sn = (currentPage - 1) * recordsPerPage + idx + 1;
                      return (
                        <tr key={exp.id} className="hover:bg-sky-50/40">
                          <td className="py-2 px-3 text-center text-gray-500">{sn}</td>
                          <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{exp.date}</td>
                          <td className="py-2 px-3 font-mono font-medium text-gray-800">
                            EXP241026{100 + idx}
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-800">{exp.expenseHead}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                            {formatBDT(exp.amount)}
                          </td>
                          <td className="py-2 px-3 text-gray-500 max-w-xs">{exp.note || exp.paidTo || '-'}</td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => navigateToRoute('dai_expensescreate.php')}
                                className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                                title="View Voucher"
                              >
                                <i className="fa fa-eye text-[11px]"></i>
                              </button>
                              <button
                                onClick={() => alert('Expenses entry removed.')}
                                className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                                title="Delete"
                              >
                                <i className="fa fa-trash text-[11px]"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination & Add Expenses Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                <div className="text-gray-500">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{' '}
                  {Math.min(currentPage * recordsPerPage, filtered.length)} of {filtered.length} entries
                </div>

                <button
                  type="button"
                  onClick={() => navigateToRoute('dai_expensescreate.php')}
                  className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider transition"
                >
                  ADD EXPENSES
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Date Range Filter & History */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <i className="fa fa-filter"></i>
                <span>DATE RANGE FILTER</span>
              </span>
              <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800"
                />
              </div>
              <button
                type="button"
                className="w-full py-1.5 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider"
              >
                SUBMIT
              </button>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs tracking-wider flex items-center justify-between">
              <span>HISTORY</span>
              <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  24 Oct 2026
                </span>
                <div className="mt-2.5 border-l-2 border-gray-200 pl-3">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span className="font-bold text-gray-700 underline">Tech Drive</span>
                      <span><i className="fa fa-clock-o mr-1"></i>02:18:12 PM</span>
                    </div>
                    <div className="text-sky-600 font-semibold mt-1">
                      New Expense Voucher Created
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5 font-mono">
                      EXP241026101 - ৳ 1,200.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
