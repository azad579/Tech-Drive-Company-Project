import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { BD_DISTRICTS } from '../data/mockData';
import { Customer, Supplier } from '../types';

export type ClientSubTab =
  | 'customerList'
  | 'customerCreate'
  | 'supplierList'
  | 'supplierCreate'
  | 'groupList'
  | 'groupCreate'
  | 'promoSms'
  | 'indivSms';

interface ClientGroup {
  id: string;
  name: string;
  description: string;
}

interface SMSLog {
  id: string;
  recipient: string;
  message: string;
  date: string;
  time: string;
  status: string;
}

export const ClientSetupView: React.FC<{ initialSubTab?: ClientSubTab; defaultTab?: string }> = ({
  initialSubTab,
  defaultTab
}) => {
  const { customers, suppliers, addCustomer, setCurrentRoute } = useApp();

  // Resolve active sub-tab from initial prop or context
  const [activeSubTab, setActiveSubTab] = useState<ClientSubTab>(() => {
    if (initialSubTab) return initialSubTab;
    if (defaultTab === 'suppliers') return 'supplierList';
    return 'customerList';
  });

  // Client Groups state with local storage persistence
  const [groups, setGroups] = useState<ClientGroup[]>(() => {
    const saved = localStorage.getItem('techdrive_client_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'g1', name: 'Retail Customers', description: 'Walk-in showroom customers' },
      { id: 'g2', name: 'Corporate & Wholesale', description: 'Institutional and bulk buyers' },
      { id: 'g3', name: 'Dealer Partners', description: 'Sub-distributors and resellers' }
    ];
  });

  // SMS Logs state
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([
    {
      id: 'sms-1',
      recipient: 'All Customers (125 contacts)',
      message: 'New HP EliteBook 845 G9 arrived with AMD Ryzen 7 PRO! Visit Tech Drive today.',
      date: '24 Oct 2026',
      time: '04:15 PM',
      status: 'Delivered'
    }
  ]);

  // Alert/notification state
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertNotice(msg);
    setTimeout(() => setAlertNotice(null), 3500);
  };

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Customer Form State (for both Add and Edit)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [cName, setCName] = useState('');
  const [cStatus, setCStatus] = useState('Active');
  const [cCode, setCCode] = useState('ABA/CU/033');
  const [cFather, setCFather] = useState('');
  const [cMother, setCMother] = useState('');
  const [cNid, setCNid] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cContactPhone, setCContactPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cShippingAddress, setCShippingAddress] = useState('');
  const [cDistrict, setCDistrict] = useState('Dhaka');
  const [cZone, setCZone] = useState('Elephant Road Zone');
  const [cCreditLimit, setCCreditLimit] = useState('0');
  const [cRanking, setCRanking] = useState('100');
  const [cGroup, setCGroup] = useState('Retail Customers');

  // Supplier Form State
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [sName, setSName] = useState('');
  const [sCode, setSCode] = useState('SUP-401');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sBalance, setSBalance] = useState('0');

  // Group Form State
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');

  // Promotional SMS State
  const [bulkSmsText, setBulkSmsText] = useState('');

  // Individual SMS State
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [individualRecipients, setIndividualRecipients] = useState<{ id: string; name: string; number: string }[]>([
    { id: '1', name: 'S.M Milon', number: '01711223344' },
    { id: '2', name: 'Ferdous Ahmed', number: '01819556677' }
  ]);
  const [individualSmsText, setIndividualSmsText] = useState('');

  // Handlers for Customer
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCName('');
    setCStatus('Active');
    setCCode(`ABA/CU/0${customers.length + 10}`);
    setCFather('');
    setCMother('');
    setCNid('');
    setCPhone('');
    setCContactPhone('');
    setCEmail('');
    setCAddress('');
    setCShippingAddress('');
    setCDistrict('Dhaka');
    setCZone('Elephant Road Zone');
    setCCreditLimit('0');
    setCRanking('100');
    setCGroup('Retail Customers');
    setActiveSubTab('customerCreate');
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCName(c.name);
    setCStatus('Active');
    setCCode(c.code);
    setCFather('Md.Rahman Sumon(CEO)');
    setCMother('Begum Anowera');
    setCNid('1982145678956');
    setCPhone(c.phone);
    setCContactPhone(c.phone);
    setCEmail('info@techdrivebd.com');
    setCAddress(c.address || '');
    setCShippingAddress(c.address || '');
    setCDistrict(c.district || 'Dhaka');
    setCZone('Elephant Road Zone');
    setCCreditLimit('50000');
    setCRanking('127');
    setCGroup('Retail Customers');
    setActiveSubTab('customerCreate');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cPhone) {
      showAlert('Please enter customer name and contact phone.');
      return;
    }

    if (editingCustomer) {
      // Update existing
      const updatedCust: Customer = {
        ...editingCustomer,
        name: cName,
        phone: cPhone,
        district: cDistrict,
        address: cAddress
      };
      const stored = JSON.parse(localStorage.getItem('techdrive_customers') || '[]');
      const list = stored.length ? stored : customers;
      const updated = list.map((item: Customer) => (item.id === editingCustomer.id ? updatedCust : item));
      localStorage.setItem('techdrive_customers', JSON.stringify(updated));
      showAlert(`Customer ${cName} updated successfully.`);
    } else {
      // Add new
      addCustomer({
        name: cName,
        phone: cPhone,
        district: cDistrict,
        address: cAddress,
        balance: 0
      });
      showAlert(`Customer ${cName} created successfully.`);
    }

    setActiveSubTab('customerList');
  };

  // Handlers for Supplier
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSName('');
    setSCode(`SUP-${Math.floor(100 + Math.random() * 900)}`);
    setSPhone('');
    setSEmail('');
    setSAddress('');
    setSBalance('0');
    setActiveSubTab('supplierCreate');
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSName(s.name);
    setSCode(s.code);
    setSPhone(s.phone);
    setSEmail('vendor@techdrive.com');
    setSAddress(s.address);
    setSBalance(String(s.balance));
    setActiveSubTab('supplierCreate');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sPhone) {
      showAlert('Please enter supplier name and phone number.');
      return;
    }

    const stored = JSON.parse(localStorage.getItem('techdrive_suppliers') || '[]');
    const list = stored.length ? stored : suppliers;

    if (editingSupplier) {
      const updated = list.map((item: Supplier) =>
        item.id === editingSupplier.id
          ? { ...item, name: sName, phone: sPhone, address: sAddress, balance: Number(sBalance) }
          : item
      );
      localStorage.setItem('techdrive_suppliers', JSON.stringify(updated));
      showAlert(`Supplier ${sName} updated successfully.`);
    } else {
      const newSupp: Supplier = {
        id: `supp-${Date.now()}`,
        code: sCode,
        name: sName,
        phone: sPhone,
        address: sAddress || 'Dhaka, Bangladesh',
        balance: Number(sBalance)
      };
      localStorage.setItem('techdrive_suppliers', JSON.stringify([newSupp, ...list]));
      showAlert(`Supplier ${sName} created successfully.`);
    }

    setActiveSubTab('supplierList');
  };

  // Handlers for Group
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;

    const newGroup: ClientGroup = {
      id: `grp-${Date.now()}`,
      name: gName.trim(),
      description: gDesc.trim() || 'General Group'
    };
    const updated = [newGroup, ...groups];
    setGroups(updated);
    localStorage.setItem('techdrive_client_groups', JSON.stringify(updated));
    setGName('');
    setGDesc('');
    showAlert(`Group "${newGroup.name}" created.`);
    setActiveSubTab('groupList');
  };

  const handleDeleteGroup = (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    localStorage.setItem('techdrive_client_groups', JSON.stringify(updated));
  };

  // Promotional SMS send handler
  const handleSendBulkSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSmsText.trim()) {
      showAlert('Please enter SMS text.');
      return;
    }
    const newLog: SMSLog = {
      id: `sms-${Date.now()}`,
      recipient: `All Customers (${customers.length} contacts)`,
      message: bulkSmsText,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent (Gateway Confirmed)'
    };
    setSmsLogs([newLog, ...smsLogs]);
    setBulkSmsText('');
    showAlert('Promotional SMS queued and dispatched to all customer contacts successfully!');
  };

  // Individual SMS send handler
  const handleAddIndividualNumber = () => {
    if (!selectedRecipientId) return;
    const match = customers.find(c => c.id === selectedRecipientId);
    if (match && !individualRecipients.some(r => r.id === match.id)) {
      setIndividualRecipients([
        ...individualRecipients,
        { id: match.id, name: match.name, number: match.phone }
      ]);
    }
  };

  const handleSendIndividualSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualSmsText.trim() || individualRecipients.length === 0) {
      showAlert('Please specify recipient and SMS content.');
      return;
    }
    const newLog: SMSLog = {
      id: `sms-${Date.now()}`,
      recipient: `${individualRecipients.length} Selected Parties`,
      message: individualSmsText,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent'
    };
    setSmsLogs([newLog, ...smsLogs]);
    setIndividualSmsText('');
    showAlert('Individual SMS sent successfully.');
  };

  // CSV Export for Customers / Suppliers
  const handleExportCSV = () => {
    const rows =
      activeSubTab === 'customerList'
        ? [
            ['SN', 'Code', 'Customer Name', 'Phone', 'District', 'Address', 'Balance (BDT)'],
            ...customers.map((c, idx) => [
              String(idx + 1),
              c.code,
              `"${c.name}"`,
              c.phone,
              c.district,
              `"${c.address}"`,
              String(c.balance)
            ])
          ]
        : [
            ['SN', 'Code', 'Supplier Name', 'Phone', 'Address', 'Payable Due (BDT)'],
            ...suppliers.map((s, idx) => [
              String(idx + 1),
              s.code,
              `"${s.name}"`,
              s.phone,
              `"${s.address}"`,
              String(s.balance)
            ])
          ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `TechDrive_${activeSubTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showAlert('Exported to CSV successfully.');
  };

  // Filtered customer list
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const custPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filtered supplier list
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );
  const suppPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert Notice */}
      {alertNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded text-xs shadow-md flex items-center justify-between no-print animate-fade-in">
          <div className="flex items-center space-x-2">
            <i className="fa fa-check-circle text-sm"></i>
            <span>{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-white hover:text-emerald-200 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-normal text-gray-800">
            {activeSubTab === 'customerList' && 'Customer List'}
            {activeSubTab === 'customerCreate' && (editingCustomer ? 'Edit Customer' : 'Add Customer')}
            {activeSubTab === 'supplierList' && 'Supplier List'}
            {activeSubTab === 'supplierCreate' && (editingSupplier ? 'Edit Supplier' : 'Add Supplier')}
            {activeSubTab === 'groupList' && 'Group List'}
            {activeSubTab === 'groupCreate' && 'Create Group'}
            {activeSubTab === 'promoSms' && 'Promotional SMS'}
            {activeSubTab === 'indivSms' && 'Indivisual Promotional SMS'}
            <small className="text-xs text-gray-500 font-normal ml-2">Client Setup</small>
          </h1>
        </div>
        <ol className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1 sm:mt-0">
          <li>
            <button
              onClick={() => setCurrentRoute('home.php', 'Dashboard')}
              className="text-[#0084bf] hover:underline flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Dashboard</span>
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-500">Client</li>
          <li>/</li>
          <li className="text-gray-700 font-medium">
            {activeSubTab.includes('customer') ? 'Customer' : activeSubTab.includes('supplier') ? 'Supplier' : 'Client Setup'}
          </li>
        </ol>
      </section>

      {/* Sub-Menu Navigation Pills / Bar */}
      <div className="bg-white p-2 border border-gray-200 shadow-2xs overflow-x-auto flex items-center space-x-1 text-xs">
        {[
          { key: 'customerList', label: 'Customer List' },
          { key: 'customerCreate', label: 'Add Customer' },
          { key: 'supplierList', label: 'Supplier List' },
          { key: 'supplierCreate', label: 'Add Supplier' },
          { key: 'groupList', label: 'All Group' },
          { key: 'groupCreate', label: 'Group Create' },
          { key: 'promoSms', label: 'Promotional SMS' },
          { key: 'indivSms', label: 'Indivisual Promotional SMS' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => {
              if (item.key === 'customerCreate') setEditingCustomer(null);
              if (item.key === 'supplierCreate') setEditingSupplier(null);
              setActiveSubTab(item.key as ClientSubTab);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold transition rounded-xs whitespace-nowrap uppercase tracking-tight ${
              activeSubTab === item.key
                ? 'bg-[#0084bf] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Content (col-span-3) + Right History (col-span-1) matching image_8dcde8fc.png */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* =========================================================================
              1. CUSTOMER LIST (image_8dcde8fc.png)
              ========================================================================= */}
          {activeSubTab === 'customerList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                <span>CUSTOMER LIST</span>
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded-xs text-[11px] font-bold"
                >
                  Export CSV
                </button>
              </div>

              {/* Records per page & Search */}
              <div className="p-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-gray-600">records per page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Search:</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf] w-48 sm:w-56"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">Name &amp; Phone</th>
                      <th className="p-2.5 border-r border-gray-200 text-center">Status</th>
                      <th className="p-2.5 border-r border-gray-200 text-center">Ranking</th>
                      <th className="p-2.5 border-r border-gray-200">Code</th>
                      <th className="p-2.5 border-r border-gray-200 text-right">Credit Limit</th>
                      <th className="p-2.5 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {paginatedCustomers.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-2.5 border-r border-gray-100">
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{c.phone}</div>
                        </td>
                        <td className="p-2.5 text-center border-r border-gray-100">
                          <span className="text-[11px] text-emerald-700 font-semibold">Active</span>
                        </td>
                        <td className="p-2.5 text-center font-mono text-gray-600 border-r border-gray-100">
                          {100 + idx}
                        </td>
                        <td className="p-2.5 font-mono text-[#0084bf] font-semibold border-r border-gray-100">
                          {c.code}
                        </td>
                        <td className="p-2.5 text-right font-mono text-gray-800 border-r border-gray-100">
                          {formatBDT(50000)}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditCustomer(c)}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit Customer"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const stored = JSON.parse(localStorage.getItem('techdrive_customers') || '[]');
                                const list = stored.length ? stored : customers;
                                const updated = list.filter((item: Customer) => item.id !== c.id);
                                localStorage.setItem('techdrive_customers', JSON.stringify(updated));
                                showAlert(`Customer ${c.name} removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete Customer"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Purple ADD CUSTOMER button */}
              <div className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} entries
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    {Array.from({ length: custPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center border text-xs font-semibold rounded-xs ${
                          currentPage === i + 1
                            ? 'bg-[#0084bf] text-white border-[#0084bf]'
                            : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= custPages}
                      onClick={() => setCurrentPage(p => Math.min(custPages, p + 1))}
                      className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                  <button
                    onClick={handleOpenAddCustomer}
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    ADD CUSTOMER
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. CUSTOMER CREATE & EDIT (image_cbc76d08.png & image_5f1ed813.png)
              ========================================================================= */}
          {activeSubTab === 'customerCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingCustomer ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'}</span>
              </div>

              <form onSubmit={handleSaveCustomer} className="p-5 space-y-4 text-xs">
                {/* Row 1: Name, Status, Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={cName}
                      onChange={e => setCName(e.target.value)}
                      placeholder="e.g. ABDUL AHAD"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Status</label>
                    <select
                      value={cStatus}
                      onChange={e => setCStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Code</label>
                    <input
                      type="text"
                      readOnly
                      value={cCode}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-gray-100 font-mono text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Father Name, Mother Name, NID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Father / Contact Name</label>
                    <input
                      type="text"
                      value={cFather}
                      onChange={e => setCFather(e.target.value)}
                      placeholder="e.g. Md.Rahman Sumon(CEO)"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Mother Name</label>
                    <input
                      type="text"
                      value={cMother}
                      onChange={e => setCMother(e.target.value)}
                      placeholder="e.g. Begum Anowera"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">National ID (NID)</label>
                    <input
                      type="text"
                      value={cNid}
                      onChange={e => setCNid(e.target.value)}
                      placeholder="e.g. 1982145678956"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 3: Contact Number, Contact Phone, Contact Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={cPhone}
                      onChange={e => setCPhone(e.target.value)}
                      placeholder="01581505471"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={cContactPhone}
                      onChange={e => setCContactPhone(e.target.value)}
                      placeholder="e.g. +88-02-721xxx1"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={cEmail}
                      onChange={e => setCEmail(e.target.value)}
                      placeholder="e.g. info@axesgl.com"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 4: Address & Shipping Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Address</label>
                    <textarea
                      rows={3}
                      value={cAddress}
                      onChange={e => setCAddress(e.target.value)}
                      placeholder="Narayanganj, Bangladesh"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Shipping Address</label>
                    <textarea
                      rows={3}
                      value={cShippingAddress}
                      onChange={e => setCShippingAddress(e.target.value)}
                      placeholder="Shipping Address"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    ></textarea>
                  </div>
                </div>

                {/* Row 5: Select District, Select Zone, Credit Limit, Ranking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Select District</label>
                    <select
                      value={cDistrict}
                      onChange={e => setCDistrict(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {BD_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Select Zone</label>
                    <select
                      value={cZone}
                      onChange={e => setCZone(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Elephant Road Zone">Elephant Road Zone</option>
                      <option value="Mirpur Zone">Mirpur Zone</option>
                      <option value="Uttara Zone">Uttara Zone</option>
                      <option value="Motijheel Zone">Motijheel Zone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Credit Limit</label>
                    <input
                      type="number"
                      value={cCreditLimit}
                      onChange={e => setCCreditLimit(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Ranking</label>
                    <input
                      type="text"
                      value={cRanking}
                      onChange={e => setCRanking(e.target.value)}
                      placeholder="e.g. 127"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 6: Select Group */}
                <div className="w-full sm:w-1/3">
                  <label className="block text-gray-700 font-semibold mb-1">Select Group</label>
                  <select
                    value={cGroup}
                    onChange={e => setCGroup(e.target.value)}
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Bottom Buttons matching image_cbc76d08.png */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingCustomer ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('customerList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              3. SUPPLIER LIST
              ========================================================================= */}
          {activeSubTab === 'supplierList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                <span>SUPPLIER LIST</span>
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded-xs text-[11px] font-bold"
                >
                  Export CSV
                </button>
              </div>

              <div className="p-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                  <span className="text-gray-600">records per page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Search:</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf] w-48 sm:w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">Code</th>
                      <th className="p-2.5 border-r border-gray-200">Supplier Name</th>
                      <th className="p-2.5 border-r border-gray-200">Phone</th>
                      <th className="p-2.5 border-r border-gray-200">Address</th>
                      <th className="p-2.5 border-r border-gray-200 text-right">Payable Balance</th>
                      <th className="p-2.5 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {paginatedSuppliers.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-2.5 font-mono text-[#0084bf] font-semibold border-r border-gray-100">{s.code}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">{s.name}</td>
                        <td className="p-2.5 font-mono text-gray-700 border-r border-gray-100">{s.phone}</td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{s.address}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-800 border-r border-gray-100">
                          {formatBDT(s.balance)}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditSupplier(s)}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit Supplier"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const stored = JSON.parse(localStorage.getItem('techdrive_suppliers') || '[]');
                                const list = stored.length ? stored : suppliers;
                                const updated = list.filter((item: Supplier) => item.id !== s.id);
                                localStorage.setItem('techdrive_suppliers', JSON.stringify(updated));
                                showAlert(`Supplier ${s.name} removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete Supplier"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredSuppliers.length)} of {filteredSuppliers.length} entries
                </div>
                <button
                  onClick={handleOpenAddSupplier}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                >
                  ADD SUPPLIER
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. SUPPLIER CREATE & EDIT (image_4d91d2a4.png & image_5c12c8d4.png)
              ========================================================================= */}
          {activeSubTab === 'supplierCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingSupplier ? 'EDIT SUPPLIER' : 'ADD SUPPLIER'}</span>
              </div>

              <form onSubmit={handleSaveSupplier} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Supplier / Vendor Name</label>
                    <input
                      type="text"
                      required
                      value={sName}
                      onChange={e => setSName(e.target.value)}
                      placeholder="e.g. Smart Technologies (BD) Ltd"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Supplier Code</label>
                    <input
                      type="text"
                      readOnly
                      value={sCode}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-gray-100 font-mono text-gray-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={sPhone}
                      onChange={e => setSPhone(e.target.value)}
                      placeholder="01711223344"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={sEmail}
                      onChange={e => setSEmail(e.target.value)}
                      placeholder="vendor@axesgl.com"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Office Address</label>
                    <textarea
                      rows={3}
                      value={sAddress}
                      onChange={e => setSAddress(e.target.value)}
                      placeholder="Elephant Road, Dhaka, Bangladesh"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Opening Payable Balance (৳)</label>
                    <input
                      type="number"
                      value={sBalance}
                      onChange={e => setSBalance(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingSupplier ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('supplierList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              5. GROUP LIST (image_bfa317bc.png)
              ========================================================================= */}
          {activeSubTab === 'groupList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>GROUP LIST</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">NAME</th>
                      <th className="p-2.5 border-r border-gray-200">DESCRIPTION</th>
                      <th className="p-2.5 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {groups.map((g, idx) => (
                      <tr key={g.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">{g.name}</td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{g.description}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteGroup(g.id)}
                            className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs inline-flex items-center justify-center text-[10px] transition shadow-2xs"
                            title="Delete Group"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setActiveSubTab('groupCreate')}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                >
                  ADD GROUP
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. GROUP CREATE (image_01df74a3.png)
              ========================================================================= */}
          {activeSubTab === 'groupCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>CREATE GROUP</span>
              </div>
              <form onSubmit={handleSaveGroup} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={gName}
                    onChange={e => setGName(e.target.value)}
                    placeholder="e.g. VIP Retailers"
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={gDesc}
                    onChange={e => setGDesc(e.target.value)}
                    placeholder="Group notes..."
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('groupList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              7. PROMOTIONAL SMS (image_46928aa2.png)
              ========================================================================= */}
          {activeSubTab === 'promoSms' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>SEND SMS</span>
              </div>
              <form onSubmit={handleSendBulkSMS} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">SMS Content (All Customers)</label>
                  <textarea
                    rows={5}
                    required
                    value={bulkSmsText}
                    onChange={e => setBulkSmsText(e.target.value)}
                    placeholder="SMS"
                    className="w-full border border-gray-300 rounded-xs p-3 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Characters: {bulkSmsText.length} | SMS Count: {Math.ceil(bulkSmsText.length / 160) || 1}
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-6 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    SEND
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSmsText('')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              8. INDIVISUAL PROMOTIONAL SMS (image_9f5555f1.png)
              ========================================================================= */}
          {activeSubTab === 'indivSms' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>INDIVISUAL PROMOTIONAL SMS</span>
              </div>
              <form onSubmit={handleSendIndividualSMS} className="p-5 space-y-5 text-xs">
                <div className="text-center font-bold text-sm text-gray-800">
                  Indivisual Promotional SMS
                </div>

                {/* Sender Dropdown & Add Button matching image_9f5555f1.png */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-1.5">
                    <span className="text-gray-700 font-semibold whitespace-nowrap">Sender:</span>
                    <select
                      value={selectedRecipientId}
                      onChange={e => setSelectedRecipientId(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-xs p-1.5 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="">-Select-</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIndividualNumber}
                    className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-3 py-1.5 rounded-xs font-bold text-xs uppercase tracking-wide transition shadow-2xs"
                  >
                    ADD
                  </button>
                </div>

                {/* Recipients Table */}
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-left">
                    <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                      <tr>
                        <th className="p-2 border-r border-gray-200 w-12 text-center">SN</th>
                        <th className="p-2 border-r border-gray-200">Customer</th>
                        <th className="p-2 border-r border-gray-200">Number</th>
                        <th className="p-2 text-center w-12 text-gray-400">
                          <i className="fa fa-trash"></i>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {individualRecipients.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-400">
                            There are no number in your sms list!
                          </td>
                        </tr>
                      ) : (
                        individualRecipients.map((rec, idx) => (
                          <tr key={rec.id} className="hover:bg-gray-50">
                            <td className="p-2 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                            <td className="p-2 font-bold text-gray-900 border-r border-gray-100">{rec.name}</td>
                            <td className="p-2 font-mono text-gray-700 border-r border-gray-100">{rec.number}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setIndividualRecipients(individualRecipients.filter(r => r.id !== rec.id))}
                                className="text-rose-600 hover:text-rose-800"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={individualSmsText}
                    onChange={e => setIndividualSmsText(e.target.value)}
                    placeholder="e.g. Note"
                    className="w-full border border-gray-300 rounded-xs p-2.5 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-6 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    SEND
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndividualSmsText('')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* =========================================================================
            RIGHT HISTORY WIDGET (image_8dcde8fc.png, image_cbc76d08.png)
            ========================================================================= */}
        <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden h-fit">
          <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fa fa-history"></i>
              <span>HISTORY</span>
            </div>
          </div>
          <div className="p-3 text-xs divide-y divide-gray-100 space-y-3">
            <div>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                24 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Tech Drive <span className="text-[10px] text-gray-400 font-normal">07:42:29 PM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">New customer has been Added</p>
                  <p className="text-[11px] text-gray-500">Customer name: S.M Milon</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                23 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Staff access <span className="text-[10px] text-gray-400 font-normal">06:52:26 PM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">New customer has been Added</p>
                  <p className="text-[11px] text-gray-500">Customer name: Ferdous Ahmed</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                22 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Tech Drive <span className="text-[10px] text-gray-400 font-normal">09:00:01 PM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">New customer has been Added</p>
                  <p className="text-[11px] text-gray-500">Customer name: K M Amjad Hossain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
