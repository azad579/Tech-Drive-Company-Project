import React, { useState } from 'react';
import {
  History,
  Search,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Receipt,
  RotateCcw,
  Truck,
  Wallet,
  FileText,
  User,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound } from '../../utils/sound';

interface SalesLogItem {
  id: string;
  timestamp: string;
  action: 'Sale Invoice' | 'POS Counter' | 'Sales Return' | 'Quotation' | 'Sales Order' | 'Challan Dispatched' | 'Due Collection';
  refNo: string;
  customer: string;
  amount: number;
  cashier: string;
  details: string;
}

const INITIAL_SALES_LOGS: SalesLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-08 17:45:12',
    action: 'Sale Invoice',
    refNo: 'INV-2026-9048',
    customer: 'Apex Data Systems Ltd',
    amount: 85000,
    cashier: 'Forhad (Admin)',
    details: 'Corporate sales invoice generated with 5% VAT',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-08 16:30:00',
    action: 'POS Counter',
    refNo: 'SAL0015',
    customer: 'MD. Shamim',
    amount: 35500,
    cashier: 'Sadia Rahman',
    details: 'Surface Pro 7 sold over retail counter with barcode scan',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-08 15:10:45',
    action: 'Challan Dispatched',
    refNo: 'CH-2026-0313',
    customer: 'Apex Data Systems Ltd',
    amount: 354900,
    cashier: 'Kamrul Hasan',
    details: 'Company Delivery Van dispatched with 3 laptops and 6 SSDs',
  },
  {
    id: 'log-4',
    timestamp: '2026-10-08 14:00:20',
    action: 'Due Collection',
    refNo: 'COL-2026-0091',
    customer: 'Vertex Technologies Ltd',
    amount: 42500,
    cashier: 'Forhad (Admin)',
    details: 'Customer outstanding settled via Brac Bank transfer',
  },
  {
    id: 'log-5',
    timestamp: '2026-10-07 18:20:00',
    action: 'Sales Return',
    refNo: 'SR-2026-0012',
    customer: 'MD. Shamim',
    amount: 35500,
    cashier: 'Forhad (Admin)',
    details: 'Product returned and credit note voucher issued',
  },
  {
    id: 'log-6',
    timestamp: '2026-10-06 11:30:15',
    action: 'Quotation',
    refNo: 'QT-2026-0045',
    customer: 'Vertex Technologies Ltd',
    amount: 569625,
    cashier: 'Forhad (Admin)',
    details: 'Official 3-year warranty price estimate sent to procurement',
  },
  {
    id: 'log-7',
    timestamp: '2026-10-05 10:15:00',
    action: 'Sales Order',
    refNo: 'SO-2026-0105',
    customer: 'Mohammad Forhad',
    amount: 35500,
    cashier: 'Sadia Rahman',
    details: 'Online reservation confirmed with full advance',
  },
];

export const SalesHistoryTab: React.FC = () => {
  const [logs] = useState<SalesLogItem[]>(INITIAL_SALES_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'All' && l.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = l.refNo.toLowerCase().includes(q);
      const matchCust = l.customer.toLowerCase().includes(q);
      const matchCashier = l.cashier.toLowerCase().includes(q);
      const matchDet = l.details.toLowerCase().includes(q);
      if (!matchRef && !matchCust && !matchCashier && !matchDet) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Timestamp,Action,Reference,Customer,Amount,Cashier,Details\n'];
    const rows = filtered.map(
      (l) => `"${l.timestamp}","${l.action}","${l.refNo}","${l.customer}","${l.amount}","${l.cashier}","${l.details}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_audit_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans select-none">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference #, customer, cashier, details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
          >
            <option value="All">All Operations</option>
            <option value="Sale Invoice">Sale Invoices</option>
            <option value="POS Counter">POS Counter Sales</option>
            <option value="Sales Return">Sales Returns</option>
            <option value="Quotation">Quotations</option>
            <option value="Sales Order">Sales Orders</option>
            <option value="Challan Dispatched">Challans Dispatched</option>
            <option value="Due Collection">Due Collections</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              window.print();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/30 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Operation / Event</th>
              <th className="p-3">Reference #</th>
              <th className="p-3">Party / Customer</th>
              <th className="p-3 text-right">Transaction Value</th>
              <th className="p-3">Operator / Cashier</th>
              <th className="p-3">Activity Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((log) => {
                const getBadge = () => {
                  switch (log.action) {
                    case 'Sale Invoice':
                      return 'bg-blue-500/20 text-blue-300';
                    case 'POS Counter':
                      return 'bg-emerald-500/20 text-emerald-300';
                    case 'Sales Return':
                      return 'bg-rose-500/20 text-rose-300';
                    case 'Quotation':
                      return 'bg-amber-500/20 text-amber-300';
                    case 'Sales Order':
                      return 'bg-indigo-500/20 text-indigo-300';
                    case 'Challan Dispatched':
                      return 'bg-teal-500/20 text-teal-300';
                    case 'Due Collection':
                      return 'bg-cyan-500/20 text-cyan-300';
                    default:
                      return 'bg-slate-700 text-slate-300';
                  }
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getBadge()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{log.refNo}</td>
                    <td className="p-3 text-slate-200 font-semibold">{log.customer}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(log.amount)}
                    </td>
                    <td className="p-3 text-slate-300">{log.cashier}</td>
                    <td className="p-3 text-slate-400 max-w-sm truncate">{log.details}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No sales history records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
