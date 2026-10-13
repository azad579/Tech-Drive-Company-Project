import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Printer,
  Download,
  AlertTriangle,
  Building,
  User,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound } from '../../utils/sound';

export const ReceivablePayableTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'all' | 'receivables' | 'payables'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const customerReceivables = [
    { id: 'c-1', name: 'Apex Data Systems Ltd', contact: '01712-334455', type: 'B2B Corporate', amount: 140000, days30: 90000, days60: 50000, days90: 0, status: 'Overdue' },
    { id: 'c-2', name: 'TechVision Solutions', contact: '01819-445566', type: 'B2B Corporate', amount: 85000, days30: 85000, days60: 0, days90: 0, status: 'Current' },
    { id: 'c-3', name: 'Mohammad Faruk Hossain', contact: '01911-223344', type: 'Retail Customer', amount: 35000, days30: 0, days60: 35000, days90: 0, status: 'Pending' },
    { id: 'c-4', name: 'Tanvir Ahmed', contact: '01677-889900', type: 'Retail Customer', amount: 15000, days30: 15000, days60: 0, days90: 0, status: 'Current' },
  ];

  const supplierPayables = [
    { id: 's-1', name: 'Global Tech Distribution Ltd', contact: '01711-445566', terms: 'Net 30', amount: 225000, days30: 150000, days60: 75000, days90: 0, status: 'Pending' },
    { id: 's-2', name: 'Flora Limited BD', contact: '01811-998877', terms: 'Net 45', amount: 688800, days30: 688800, days60: 0, days90: 0, status: 'Current' },
    { id: 's-3', name: 'Star Tech Enterprise Wholesale', contact: '01912-334455', terms: 'Net 15', amount: 45000, days30: 0, days60: 45000, days90: 0, status: 'Due Soon' },
  ];

  const totalReceivables = customerReceivables.reduce((acc, c) => acc + c.amount, 0);
  const totalPayables = supplierPayables.reduce((acc, s) => acc + s.amount, 0);
  const netWorkingCapital = totalReceivables - totalPayables;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {['all', 'receivables', 'payables'].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                playClickSound();
                setActiveSection(sec as any);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                activeSection === sec
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sec === 'all' ? 'All (Net Position)' : sec === 'receivables' ? 'Customer Receivables' : 'Supplier Payables'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Aging Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accounts Receivable (Customer Due)</span>
            </span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {formatCurrency(totalReceivables)}
            </div>
            <span className="text-[11px] text-slate-500">{customerReceivables.length} Active debtor accounts</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Accounts Payable (Vendor Due)</span>
            </span>
            <div className="text-xl font-mono font-bold text-rose-400 mt-1">
              {formatCurrency(totalPayables)}
            </div>
            <span className="text-[11px] text-slate-500">{supplierPayables.length} Active creditor accounts</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Net Liquidity Gap (AR - AP)
            </span>
            <div
              className={`text-xl font-mono font-bold mt-1 ${
                netWorkingCapital >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netWorkingCapital)}
            </div>
            <span className="text-[11px] text-slate-500">
              {netWorkingCapital >= 0 ? 'Positive working capital' : 'Payables exceed receivables'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Tables */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Customer Receivables Section */}
        {(activeSection === 'all' || activeSection === 'receivables') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-850 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Customer Accounts Receivable (Due from Clients)</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalReceivables)}</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Client Type</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">0 - 30 Days</th>
                  <th className="p-3 text-right">31 - 60 Days</th>
                  <th className="p-3 text-right">Total Due ৳</th>
                  <th className="p-3 text-center">Aging Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerReceivables.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3 text-slate-400">{c.type}</td>
                    <td className="p-3 font-mono text-slate-300">{c.contact}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{formatCurrency(c.days30)}</td>
                    <td className="p-3 text-right font-mono text-amber-400">{formatCurrency(c.days60)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Current'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.status === 'Overdue'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Supplier Payables Section */}
        {(activeSection === 'all' || activeSection === 'payables') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-850 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Supplier Accounts Payable (Due to Vendors)</span>
              </span>
              <span className="font-mono font-bold text-rose-400">{formatCurrency(totalPayables)}</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Vendor / Supplier</th>
                  <th className="p-3">Payment Terms</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">0 - 30 Days</th>
                  <th className="p-3 text-right">31 - 60 Days</th>
                  <th className="p-3 text-right">Total Payable ৳</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {supplierPayables.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{s.name}</td>
                    <td className="p-3 text-slate-400">{s.terms}</td>
                    <td className="p-3 font-mono text-slate-300">{s.contact}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{formatCurrency(s.days30)}</td>
                    <td className="p-3 text-right font-mono text-rose-400">{formatCurrency(s.days60)}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400 text-sm">
                      {formatCurrency(s.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'Current'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
