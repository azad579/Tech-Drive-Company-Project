import React, { useState } from 'react';
import { formatBDT } from '../utils/banglaDate';

interface LoanAccount {
  id: string;
  code: string;
  name: string;
  nameBangla: string;
  number: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
  address?: string;
}

export const LoanManagementView: React.FC = () => {
  const [accounts, setAccounts] = useState<LoanAccount[]>([
    {
      id: '1',
      code: 'LON001P',
      name: 'Md Suman',
      nameBangla: 'মোঃ সুমন',
      number: '01711000111',
      type: 'Person',
      debit: 50000.0,
      credit: 0.0,
      balance: -50000.0,
      address: 'Elephant Road, Dhaka'
    },
    {
      id: '2',
      code: 'LON002P',
      name: 'Tarek Ahmed',
      nameBangla: 'তারেক আহমেদ',
      number: '01822000222',
      type: 'Person',
      debit: 20000.0,
      credit: 10000.0,
      balance: -10000.0,
      address: 'Multiplan Center, New Market'
    }
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameBangla, setFormNameBangla] = useState('');
  const [formCode, setFormCode] = useState(`LON00${accounts.length + 1}P`);
  const [formType, setFormType] = useState('Person');
  const [formMobile, setFormMobile] = useState('');
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    setAccounts([
      ...accounts,
      {
        id: String(Date.now()),
        code: formCode || `LON00${accounts.length + 1}P`,
        name: formName,
        nameBangla: formNameBangla,
        number: formMobile || formAccountNo || '-',
        type: formType,
        debit: 0,
        credit: 0,
        balance: 0,
        address: formAddress
      }
    ]);

    setIsDrawerOpen(false);
    setFormName('');
    setFormNameBangla('');
    setFormMobile('');
    setFormAccountNo('');
    setFormAddress('');
  };

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">All Loan Account</h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Installment &amp; Loan</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">All Loan Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Accounts Table */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide">
              ALL ACCOUNT
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
                  </select>
                  <span className="text-gray-600">records per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search account..."
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs w-48 sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-[#f4f7f9] text-gray-700 font-semibold select-none">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">SN</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Number</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Debit</th>
                      <th className="py-2.5 px-3 text-right">Credit</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {filtered.map((acc, idx) => (
                      <tr key={acc.id} className="hover:bg-sky-50/40">
                        <td className="py-2.5 px-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-800">{acc.code}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-gray-800">{acc.name}</div>
                          {acc.nameBangla && (
                            <div className="text-[11px] text-gray-500 font-bengali">{acc.nameBangla}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{acc.number}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-[#0084bf]">
                            {acc.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatBDT(acc.debit)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatBDT(acc.credit)}</td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                          acc.balance < 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {formatBDT(acc.balance)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => alert(`View ledger for ${acc.name}`)}
                            className="w-6 h-6 rounded bg-[#605ca8] text-white hover:bg-[#504c96] inline-flex items-center justify-center shadow-xs"
                            title="View"
                          >
                            <i className="fa fa-eye text-[11px]"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-gray-400">
                          No data available in table
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-gray-500 text-xs">
                  Showing 1 to {filtered.length} of {filtered.length} entries
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(true);
                    setFormCode(`LON00${accounts.length + 1}P`);
                  }}
                  className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs transition"
                >
                  ADD NEW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Drawer or History Panel */}
        <div className="lg:col-span-3 space-y-4">
          {isDrawerOpen ? (
            /* Add Loan Account Drawer */
            <div className="bg-white rounded border border-gray-200 shadow-lg overflow-hidden animate-in fade-in duration-200 text-xs">
              <div className="bg-[#d9534f] text-white px-3.5 py-2 font-bold flex items-center justify-between">
                <span>ADD LOAN ACCOUNT</span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-white hover:text-gray-200 font-bold text-base"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveAccount} className="p-4 space-y-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Md Suman"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Name (Bangla)</label>
                  <input
                    type="text"
                    value={formNameBangla}
                    onChange={e => setFormNameBangla(e.target.value)}
                    placeholder="e.g. মোঃ সুমন"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white text-gray-800"
                  >
                    <option value="Person">Person</option>
                    <option value="Organization">Organization</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={formMobile}
                    onChange={e => setFormMobile(e.target.value)}
                    placeholder="e.g. 01711000111"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formAccountNo}
                    onChange={e => setFormAccountNo(e.target.value)}
                    placeholder="e.g. 1029384756"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="Address details"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs uppercase tracking-wider text-xs"
                  >
                    SAVE
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* History Panel */
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold tracking-wider flex items-center justify-between">
                <span>HISTORY</span>
                <button className="text-white hover:text-gray-200"><i className="fa fa-bars"></i></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    24 Oct 2026
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span>04:00:15 AM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        Loan accounts synchronized
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
