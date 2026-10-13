import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  FileText,
  DollarSign,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Briefcase,
  Layers,
  Calendar,
  X,
  Wallet,
} from 'lucide-react';
import { Customer, CustomerType } from '../../types/pos';
import { Supplier, PaymentTerms } from '../../types/purchase';
import { INITIAL_SUPPLIERS } from '../../data/mockSuppliers';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';
import { ClientLedgerModal } from './ClientLedgerModal';
import { ClientLedgerEntry } from '../../types/clientLedger';
import { INITIAL_CLIENT_LEDGERS } from '../../data/mockClientLedgers';

interface ClientSetupViewProps {
  customers: Customer[];
  onCreateCustomer: (customer: Omit<Customer, 'id' | 'points' | 'balance'>) => Customer;
  onUpdateCustomer?: (customer: Customer) => void;
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const ClientSetupView: React.FC<ClientSetupViewProps> = ({
  customers,
  onCreateCustomer,
  onUpdateCustomer,
  activeSubItem = '4.1',
  onSelectSubItem,
}) => {
  // Navigation tabs for 4. CLIENT SETUP
  // 4.1 Customers (Retail & B2B) | 4.2 Suppliers | 4.3 Customer/Supplier Groups | 4.4 Opening Balance
  const [activeTab, setActiveTab] = useState<'4.1' | '4.2' | '4.3' | '4.4'>('4.1');
  const [customerSubFilter, setCustomerSubFilter] = useState<'All' | 'Retail' | 'B2B'>('All');

  useEffect(() => {
    if (activeSubItem) {
      if (activeSubItem.startsWith('4.1')) {
        setActiveTab('4.1');
        if (activeSubItem === '4.1.b2b') setCustomerSubFilter('B2B');
        else if (activeSubItem === '4.1.retail') setCustomerSubFilter('Retail');
      } else if (activeSubItem === '4.2') {
        setActiveTab('4.2');
      } else if (activeSubItem === '4.3') {
        setActiveTab('4.3');
      } else if (activeSubItem === '4.4') {
        setActiveTab('4.4');
      }
    }
  }, [activeSubItem]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('nextgen_suppliers_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUPPLIERS;
  });

  // Client Ledger Modal State
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Client Ledgers local cache
  const [clientLedgers, setClientLedgers] = useState<ClientLedgerEntry[]>(() => {
    const saved = localStorage.getItem('nextgen_client_ledgers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse client ledgers', e);
      }
    }
    return INITIAL_CLIENT_LEDGERS;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('nextgen_client_ledgers');
      if (saved) {
        try {
          setClientLedgers(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Form state for New Client (supports complete B2B fields)
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('B2B');
  const [creditLimit, setCreditLimit] = useState(100000);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [openingBalance, setOpeningBalance] = useState(0);

  // New Supplier Form State
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supTerms, setSupTerms] = useState('Net 30');
  const [supOpeningBalance, setSupOpeningBalance] = useState(0);

  // Financial stats calculation
  const getCustomerFinancialStats = (cust: Customer) => {
    const baseLimit = cust.creditLimit || 50000;
    const entries = clientLedgers.filter((l) => l.customerId === cust.id);
    if (entries.length === 0) {
      const bal = cust.balance || 0;
      return {
        balance: bal,
        availableCredit: Math.max(0, baseLimit - bal),
        txCount: 0,
        utilization: Math.min(100, Math.round((bal / baseLimit) * 100)),
      };
    }
    const totalDebit = entries.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = entries.reduce((sum, l) => sum + (l.credit || 0), 0);
    const outstanding = Math.max(0, totalDebit - totalCredit);
    const available = Math.max(0, baseLimit - outstanding);
    const util = Math.min(100, Math.round((outstanding / baseLimit) * 100));

    return {
      balance: outstanding,
      availableCredit: available,
      txCount: entries.length,
      utilization: util,
    };
  };

  const handleOpenClientLedger = (client: Customer) => {
    playClickSound();
    setSelectedLedgerCustomer(client);
    setIsLedgerModalOpen(true);
  };

  const handleCustomerBalanceUpdate = (
    customerId: string,
    newBalance: number,
    newCreditLimit?: number
  ) => {
    const saved = localStorage.getItem('nextgen_client_ledgers');
    if (saved) {
      try {
        setClientLedgers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    if (onUpdateCustomer) {
      const target = customers.find((c) => c.id === customerId);
      if (target) {
        onUpdateCustomer({
          ...target,
          balance: newBalance,
          creditLimit: newCreditLimit || target.creditLimit || 50000,
        });
      }
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playBarcodeBeep();
    const created = onCreateCustomer({
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || 'N/A',
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      customerType,
      creditLimit,
      paymentTerms,
    });

    setIsModalOpen(false);
    setName('');
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setOpeningBalance(0);

    handleOpenClientLedger(created);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    playCashDrawerDing();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName.trim(),
      code: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      contactPerson: supContact.trim() || 'N/A',
      phone: supPhone.trim() || 'N/A',
      email: supEmail.trim() || 'vendor@nextgen.com',
      address: supAddress.trim() || 'Dhaka, Bangladesh',
      supplierType: 'Distributor',
      paymentTerms: supTerms as PaymentTerms,
      balance: supOpeningBalance,
    };

    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('nextgen_suppliers_list', JSON.stringify(updated));

    setIsSupplierModalOpen(false);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupOpeningBalance(0);
  };

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    const isB2B = c.customerType === 'B2B';
    const isRetail = c.customerType === 'Regular';

    if (customerSubFilter === 'B2B' && !isB2B) return false;
    if (customerSubFilter === 'Retail' && !isRetail) return false;

    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ERP</span>
            <span>›</span>
            <span>Management</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              4. Client Setup — গ্রাহক ও সাপ্লায়ার সেটিংস
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-600" />
            <span>Client &amp; Supplier Management</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === '4.2' ? (
            <button
              onClick={() => {
                playClickSound();
                setIsSupplierModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Supplier</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playClickSound();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs md:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation Bar (4.1 to 4.4) */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        {[
          { id: '4.1', label: '4.1 Customers', icon: Users, badge: `${customers.length} clients` },
          { id: '4.2', label: '4.2 Suppliers', icon: Briefcase, badge: `${suppliers.length} vendors` },
          { id: '4.3', label: '4.3 Customer / Supplier Groups', icon: Layers, badge: 'Tiers' },
          { id: '4.4', label: '4.4 Opening Balance', icon: Wallet, badge: 'Ledgers' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* ======================================================== */}
        {/* TAB 4.1: CUSTOMERS (RETAIL & B2B / CORPORATE)            */}
        {/* ======================================================== */}
        {activeTab === '4.1' && (
          <div className="space-y-4">
            {/* Search & Sub-Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company, client name, phone, email, or address..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Retail vs B2B / Corporate Client Toggle */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                {[
                  { id: 'All', label: 'All Customers' },
                  { id: 'Retail', label: 'Retail Customers' },
                  { id: 'B2B', label: 'B2B / Corporate Clients' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      playClickSound();
                      setCustomerSubFilter(f.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                      customerSubFilter === f.id
                        ? 'bg-cyan-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* B2B Clients Dedicated Structured Table (Prompt Requirement) */}
            {customerSubFilter === 'B2B' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-cyan-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-cyan-600" />
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                        B2B / Corporate Clients Directory
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Formal corporate accounts with credit limits, payment terms &amp; live dues
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                    {filteredCustomers.length} Corporate Accounts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Company Name</th>
                        <th className="px-4 py-3">Contact Person</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Address</th>
                        <th className="px-4 py-3 text-right">Credit Limit</th>
                        <th className="px-4 py-3">Payment Terms</th>
                        <th className="px-4 py-3 text-right">Due Balance</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredCustomers.map((cust) => {
                        const stats = getCustomerFinancialStats(cust);
                        return (
                          <tr
                            key={cust.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                <span>{cust.companyName || cust.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {cust.contactPerson || cust.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                              {cust.phone}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {cust.email || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                              {cust.address || 'Dhaka, Bangladesh'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(cust.creditLimit || 100000)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-700">
                                {cust.paymentTerms || 'Net 30 Days'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold">
                              {stats.balance > 0 ? (
                                <span className="text-amber-500 dark:text-amber-400">
                                  {formatCurrency(stats.balance)}
                                </span>
                              ) : (
                                <span className="text-emerald-500">৳0 (Clear)</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleOpenClientLedger(cust)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                View Ledger
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid Cards for All / Retail Customers */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((cust) => {
                  const stats = getCustomerFinancialStats(cust);
                  const isB2B = cust.customerType === 'B2B';

                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleOpenClientLedger(cust)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-cyan-500 transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {cust.companyName || cust.name}
                            </h3>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                isB2B
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {isB2B ? 'B2B Corp' : 'Retail'}
                            </span>
                          </div>
                          {isB2B && cust.contactPerson && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Attn: {cust.contactPerson}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {cust.loyaltyPoints || 0} pts
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{cust.phone}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{cust.email}</span>
                          </div>
                        )}
                        {cust.address && (
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{cust.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Financial Bar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Due Balance</span>
                          <span
                            className={`font-mono font-bold ${
                              stats.balance > 0 ? 'text-amber-500' : 'text-emerald-500'
                            }`}
                          >
                            {formatCurrency(stats.balance)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Credit Limit</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {formatCurrency(cust.creditLimit || 50000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4.2: SUPPLIERS (VENDOR DIRECTORY & PAYABLES)         */}
        {/* ======================================================== */}
        {activeTab === '4.2' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search suppliers by company, contact person, phone..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-bold font-mono">
                {filteredSuppliers.length} Verified Suppliers
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Supplier Name &amp; Code</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3">Phone &amp; Email</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Type &amp; Terms</th>
                    <th className="px-4 py-3 text-right">Payable Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{sup.name}</div>
                        <div className="text-[10px] text-teal-600 font-mono">{sup.code}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {sup.contactPerson}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <div className="font-mono">{sup.phone}</div>
                        <div className="text-[10px] text-slate-400 truncate">{sup.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {sup.address}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                          {sup.supplierType || 'Distributor'} • {sup.paymentTerms}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-500">
                        {formatCurrency(sup.balance || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
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
        {/* TAB 4.3: CUSTOMER & SUPPLIER GROUPS                      */}
        {/* ======================================================== */}
        {activeTab === '4.3' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Customer Pricing Tiers</span>
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Retail Walk-in Counter', discount: '0%', credit: 'Cash Only', members: '1,420 customers' },
                  { name: 'Regular Retail Customers', discount: '2%', credit: '7 Days', members: '85 customers' },
                  { name: 'B2B Corporate Clients', discount: '5% - 8%', credit: '15 - 30 Days', members: '24 accounts' },
                  { name: 'VIP Enterprise Accounts', discount: '10%', credit: '45 Days', members: '6 contracts' },
                ].map((g) => (
                  <div
                    key={g.name}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{g.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Discount: {g.discount} • Credit: {g.credit}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500 font-bold">{g.members}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>Supplier / Vendor Categories</span>
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Authorised Distributors', terms: 'Net 30 Days', count: '4 vendors' },
                  { name: 'Component Importers', terms: 'LC / Net 15', count: '2 vendors' },
                  { name: 'Local Peripherals Hub', terms: 'Weekly Settlement', count: '8 vendors' },
                  { name: 'Direct OEM Partners', terms: 'Annual Contract', count: '3 partners' },
                ].map((sg) => (
                  <div
                    key={sg.name}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sg.name}</div>
                      <div className="text-[10px] text-slate-500">Payment Terms: {sg.terms}</div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-500 font-bold">{sg.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4.4: OPENING BALANCE                                 */}
        {/* ======================================================== */}
        {activeTab === '4.4' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Opening Balance Master Register</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initial balances carried forward at commencement of the current financial year
                </p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
                FY 2026-2027
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Party Name</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Effective Date</th>
                    <th className="px-3 py-2 text-right">Debit (Receivable)</th>
                    <th className="px-3 py-2 text-right">Credit (Payable)</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Vertex Technologies Ltd</td>
                    <td className="px-3 py-2 text-slate-500">B2B Client</td>
                    <td className="px-3 py-2 font-mono">2026-07-01</td>
                    <td className="px-3 py-2 text-right font-mono text-amber-500 font-bold">৳42,500</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-400">৳0</td>
                    <td className="px-3 py-2 text-center text-emerald-500 font-bold">Reconciled</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Apex Data Systems Ltd</td>
                    <td className="px-3 py-2 text-slate-500">B2B Client</td>
                    <td className="px-3 py-2 font-mono">2026-07-01</td>
                    <td className="px-3 py-2 text-right font-mono text-amber-500 font-bold">৳85,000</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-400">৳0</td>
                    <td className="px-3 py-2 text-center text-emerald-500 font-bold">Reconciled</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">Global Tech Distribution Ltd</td>
                    <td className="px-3 py-2 text-slate-500">Supplier</td>
                    <td className="px-3 py-2 font-mono">2026-07-01</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-400">৳0</td>
                    <td className="px-3 py-2 text-right font-mono text-rose-500 font-bold">৳450,000</td>
                    <td className="px-3 py-2 text-center text-emerald-500 font-bold">Reconciled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New Client (Supports Full B2B Fields) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Create New Customer Account</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  >
                    <option value="B2B">B2B / Corporate Client</option>
                    <option value="Regular">Regular Retail Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Forhad Hossain"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {customerType === 'B2B' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. NextGen Solutions Ltd"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. IT Procurement Manager"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01711-000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot #, Road #, Sector, Area, City"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              {customerType === 'B2B' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Approved Credit Limit (৳)
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    >
                      <option value="Net 7 Days">Net 7 Days</option>
                      <option value="Net 15 Days">Net 15 Days</option>
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                      <option value="Immediate">Immediate / Cash</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                >
                  Save &amp; Open Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Supplier */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>Add Vendor / Supplier</span>
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Star Tech Distributors"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Zahid Hasan"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="01811-000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  placeholder="orders@vendor.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Elephant Road, Multiplan Center"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Ledger Modal */}
      {isLedgerModalOpen && selectedLedgerCustomer && (
        <ClientLedgerModal
          customer={selectedLedgerCustomer}
          isOpen={isLedgerModalOpen}
          onClose={() => {
            setIsLedgerModalOpen(false);
            setSelectedLedgerCustomer(null);
          }}
          onUpdateCustomerBalance={handleCustomerBalanceUpdate}
        />
      )}
    </div>
  );
};
