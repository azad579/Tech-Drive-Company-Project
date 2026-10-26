import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

export const ChequeManagementView: React.FC = () => {
  const { cheques, updateChequeStatus, bankAccounts } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'Receive' | 'Given'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending' | 'Cleared' | 'Bounced'>('ALL');

  const filtered = cheques.filter(c => {
    const matchType = filterType === 'ALL' || c.type === filterType;
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>Cheque Management</span>
            <span className="text-xs font-normal text-gray-500">Banking, Clearance &amp; Deposits</span>
          </h1>
        </div>
      </div>

      {/* Bank Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bankAccounts.map(b => (
          <div key={b.id} className="bg-white p-3 rounded shadow-xs border border-gray-200">
            <div className="text-[10px] uppercase font-bold text-gray-400">{b.bankName}</div>
            <div className="text-sm font-bold text-[#00305d] mt-1">{formatBDT(b.balance)}</div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">{b.accountNo}</div>
          </div>
        ))}
      </div>

      {/* Cheque Filters */}
      <div className="bg-white p-3 rounded shadow-xs border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <label className="font-semibold text-gray-700">Direction:</label>
          <div className="inline-flex rounded border border-gray-300">
            {(['ALL', 'Receive', 'Given'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 font-medium ${
                  filterType === t ? 'bg-[#0084bf] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="font-semibold text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1 bg-white focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Cleared">Cleared</option>
            <option value="Bounced">Bounced</option>
          </select>
        </div>
      </div>

      {/* Cheque Table */}
      <div className="bg-white rounded shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00305d] text-white">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">SN</th>
                <th className="py-2.5 px-3">Cheque No</th>
                <th className="py-2.5 px-3">Bank Name</th>
                <th className="py-2.5 px-3">Party Name</th>
                <th className="py-2.5 px-3">Cheque Date</th>
                <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((chk, idx) => (
                <tr key={chk.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{chk.chequeNo}</td>
                  <td className="py-2.5 px-3 text-gray-700">{chk.bankName}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">{chk.partyName}</td>
                  <td className="py-2.5 px-3 text-gray-500">{chk.date}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatBDT(chk.amount)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        chk.type === 'Receive' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {chk.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        chk.status === 'Cleared'
                          ? 'bg-emerald-100 text-emerald-800'
                          : chk.status === 'Bounced'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {chk.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center space-x-1">
                    {chk.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => updateChequeStatus(chk.id, 'Cleared')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold transition"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => updateChequeStatus(chk.id, 'Bounced')}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold transition"
                        >
                          Bounce
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateChequeStatus(chk.id, 'Pending')}
                        className="text-gray-500 hover:text-gray-700 underline text-[10px]"
                      >
                        Reset
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
  );
};
