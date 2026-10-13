import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Tag,
  Layers,
  Percent,
  CreditCard,
  Building,
  MapPin,
  FileText,
  Calendar,
  Save,
  Check,
  CheckCircle,
  Smartphone,
  Banknote,
  Receipt,
  Globe,
  Phone,
  Mail,
} from 'lucide-react';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface MasterSetupViewProps {
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
  onOpenLetterhead?: () => void;
  onOpenInvoiceSettings?: () => void;
}

export const MasterSetupView: React.FC<MasterSetupViewProps> = ({
  activeSubItem = '8.1',
  onSelectSubItem,
  onOpenLetterhead,
  onOpenInvoiceSettings,
}) => {
  // Tabs 8.1 through 8.7
  const [activeTab, setActiveTab] = useState<string>(activeSubItem || '8.1');

  useEffect(() => {
    if (activeSubItem) {
      if (activeSubItem.startsWith('8.5')) {
        setActiveTab('8.5');
      } else {
        setActiveTab(activeSubItem);
      }
    }
  }, [activeSubItem]);

  // 8.1 Company Setup state
  const [companyName, setCompanyName] = useState('NextGen IT Systems Ltd.');
  const [companyPhone, setCompanyPhone] = useState('+880 1711-000000');
  const [companyEmail, setCompanyEmail] = useState('sales@nextgenit.com.bd');
  const [companyAddress, setCompanyAddress] = useState('Level 4, Multiplan Center, New Elephant Road, Dhaka-1205');
  const [companyBin, setCompanyBin] = useState('BIN-003928192-0101');
  const [companySaved, setCompanySaved] = useState(false);

  // 8.2 Branches / Warehouses
  const [branches, setBranches] = useState([
    { id: 'br-1', name: 'Main Headquarters & Showroom', code: 'HQ-DHK-01', location: 'Elephant Road, Dhaka', isCentral: true },
    { id: 'br-2', name: 'Dhanmondi Retail Branch', code: 'BR-DHN-02', location: 'Road 7, Dhanmondi, Dhaka', isCentral: false },
    { id: 'br-3', name: 'Gulshan Corporate Office', code: 'BR-GLS-03', location: 'Gulshan-2, Dhaka', isCentral: false },
    { id: 'br-4', name: 'Central Logistics Warehouse', code: 'WH-CTG-01', location: 'Tejgaon I/A, Dhaka', isCentral: false },
  ]);

  // 8.3 Categories & Brands
  const [categories, setCategories] = useState(['Laptops', 'Components', 'Accessories', 'Services', 'Networking', 'Printers']);
  const [brands, setBrands] = useState(['Lenovo', 'HP', 'Dell', 'Apple', 'Asus', 'Logitech', 'Samsung', 'Anker', 'Microsoft']);

  // 8.4 Units & Tax
  const [units, setUnits] = useState(['Unit', 'Pcs', 'Box', 'Set', 'Pack', 'Roll', 'Kg']);
  const [taxRates, setTaxRates] = useState([
    { name: 'Standard IT VAT', rate: 5 },
    { name: 'Zero-rated Tech Export', rate: 0 },
    { name: 'Commercial Hardware VAT', rate: 7.5 },
    { name: 'Import Surcharge VAT', rate: 10 },
  ]);

  // 8.5 Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm-1', name: 'Cash in Register', type: 'Cash', account: 'Main Cash Drawer #01', fee: '0%' },
    { id: 'pm-2', name: 'Brac Bank POS Terminal', type: 'Bank', account: 'Brac Bank Current A/C #1501204899', fee: '1.5%' },
    { id: 'pm-3', name: 'City Bank Credit Card POS', type: 'Card', account: 'City Bank Business A/C #2102938475', fee: '1.8%' },
    { id: 'pm-4', name: 'bKash Merchant QR Payment', type: 'Mobile / Online Payment', account: 'bKash Merchant 01700998877', fee: '1.2%' },
    { id: 'pm-5', name: 'Nagad Business Wallet', type: 'Mobile / Online Payment', account: 'Nagad Business 01899112233', fee: '1.0%' },
    { id: 'pm-6', name: 'Cheque Clearance (Crossed)', type: 'Cheque', account: 'Clearing House Settlement', fee: '0%' },
  ]);

  // 8.6 Invoice & Document Settings
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [poPrefix, setPoPrefix] = useState('PO-2026-');
  const [challanPrefix, setChallanPrefix] = useState('CH-2026-');
  const [footerTerms, setFooterTerms] = useState('Official 1-Year NextGen IT Warranty applies. Goods once sold can be returned within 15 days in original pack.');

  // 8.7 Financial Year & General Settings
  const [fiscalYear, setFiscalYear] = useState('2026-2027 (01 July 2026 – 30 June 2027)');
  const [baseCurrency, setBaseCurrency] = useState('BDT (৳)');
  const [autoBackupGoogleDrive, setAutoBackupGoogleDrive] = useState(true);

  const [newItem, setNewItem] = useState('');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ERP</span>
            <span>›</span>
            <span>Reporting &amp; Admin</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              8. Master Setup — মাস্টার সেটিংস
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-teal-600" />
            <span>Master Configuration &amp; Business Rules</span>
          </h1>
        </div>
      </div>

      {/* Subtabs Bar (8.1 to 8.7) */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '8.1', label: '8.1 Company Setup', icon: Building },
          { id: '8.2', label: '8.2 Branch / Warehouse', icon: MapPin },
          { id: '8.3', label: '8.3 Products & Categories', icon: Layers },
          { id: '8.4', label: '8.4 Units & Tax / VAT', icon: Percent },
          { id: '8.5', label: '8.5 Payment Methods', icon: CreditCard },
          { id: '8.6', label: '8.6 Invoice & Document Settings', icon: FileText },
          { id: '8.7', label: '8.7 Financial Year & General', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* ======================================================== */}
        {/* 8.1 COMPANY / BUSINESS SETUP                             */}
        {/* ======================================================== */}
        {activeTab === '8.1' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" />
                  <span>Company Profile &amp; Letterhead Identity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Legal company identity printed on all sales invoices, delivery challans, and salary slips
                </p>
              </div>
              {companySaved && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved Successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCompany} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Company Trade Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Official VAT / BIN Registration</label>
                <input
                  type="text"
                  value={companyBin}
                  onChange={(e) => setCompanyBin(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Primary Hotline / Phone</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Official Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Registered Business Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Company Details</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.2 BRANCH / WAREHOUSE                                   */}
        {/* ======================================================== */}
        {activeTab === '8.2' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  <span>Branch &amp; Warehouse Inventory Locations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-branch inventory stores for real-time stock allocation and inter-branch transfers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                      {b.isCentral && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.2 rounded font-mono">
                          Central HQ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{b.location}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                    {b.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.3 PRODUCTS & CATEGORIES                                */}
        {/* ======================================================== */}
        {activeTab === '8.3' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Product Categories</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Authorized Brands &amp; Manufacturers</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {brands.map((br) => (
                  <span
                    key={br}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-xs font-semibold"
                  >
                    {br}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.4 UNITS & TAX / VAT                                    */}
        {/* ======================================================== */}
        {activeTab === '8.4' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Tax &amp; VAT Rates</span>
              </h3>
              <div className="space-y-2 text-xs">
                {taxRates.map((t) => (
                  <div
                    key={t.name}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {t.rate}% VAT
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Units of Measurement (UoM)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {units.map((u) => (
                  <span
                    key={u}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.5 PAYMENT METHODS                                      */}
        {/* ======================================================== */}
        {activeTab === '8.5' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Registered Payment Methods &amp; Gateways</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cash, Bank, Cheque, Card, and Mobile/Online payment modes accepted at counter and billing
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Payment Mode</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Settlement Ledger</th>
                    <th className="px-3 py-2 text-right">Gateway Surcharge</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paymentMethods.map((pm) => (
                    <tr key={pm.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                        {pm.name}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-medium">
                          {pm.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 font-mono">{pm.account}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {pm.fee}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.6 INVOICE & DOCUMENT SETTINGS                          */}
        {/* ======================================================== */}
        {activeTab === '8.6' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Invoice, PO &amp; Challan Numbering Format</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Sales Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Purchase Order Prefix</label>
                <input
                  type="text"
                  value={poPrefix}
                  onChange={(e) => setPoPrefix(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Delivery Challan Prefix</label>
                <input
                  type="text"
                  value={challanPrefix}
                  onChange={(e) => setChallanPrefix(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Invoice Footer Terms &amp; Policy</label>
                <textarea
                  rows={3}
                  value={footerTerms}
                  onChange={(e) => setFooterTerms(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8.7 FINANCIAL YEAR & GENERAL SETTINGS                    */}
        {/* ======================================================== */}
        {activeTab === '8.7' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Financial Year &amp; System Defaults</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Active Financial Year</label>
                <input
                  type="text"
                  disabled
                  value={fiscalYear}
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Base Currency Symbol</label>
                <input
                  type="text"
                  disabled
                  value={baseCurrency}
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="md:col-span-2 p-3 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-950 dark:text-blue-200">Google Drive Automatic Cloud Backup</span>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    Synchronize daily sales, purchase logs, and customer ledgers to Google Drive
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBackupGoogleDrive}
                  onChange={(e) => setAutoBackupGoogleDrive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
