import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Printer,
  Download,
  Calendar,
  FileText,
  Landmark,
  Scale,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound } from '../../utils/sound';

export const FinancialReportsTab: React.FC = () => {
  const [reportType, setReportType] = useState<'pnl' | 'balance_sheet' | 'cash_flow'>('pnl');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Top Selector Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {[
            { id: 'pnl', label: 'Profit & Loss Statement (P&L)' },
            { id: 'balance_sheet', label: 'Balance Sheet (Assets & Liabilities)' },
            { id: 'cash_flow', label: 'Cash Flow Statement' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => {
                playClickSound();
                setReportType(r.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                reportType === r.id ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* Report Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Financial Accounting Standard
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {reportType === 'pnl'
                  ? 'STATEMENT OF PROFIT & LOSS'
                  : reportType === 'balance_sheet'
                  ? 'CONSOLIDATED BALANCE SHEET'
                  : 'CASH FLOW STATEMENT'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">NextGen IT Systems Ltd. · FY 2026-2027</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Period: <strong>01 Oct 2026 – 08 Oct 2026</strong></div>
              <div>Currency: <strong>BDT (৳)</strong></div>
            </div>
          </div>

          {/* 1. PROFIT & LOSS */}
          {reportType === 'pnl' && (
            <div className="space-y-4 text-xs">
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-850 font-bold text-white uppercase text-[11px] tracking-wider">
                  Revenue / Operating Incomes
                </div>
                <div className="divide-y divide-slate-800/60 p-3 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Retail &amp; POS Counter Laptop Sales</span>
                    <span className="font-mono font-bold text-white">৳1,485,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Corporate B2B Computer Infrastructure Contracts</span>
                    <span className="font-mono font-bold text-white">৳2,150,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Hardware Upgrades, RAM/SSD Installation &amp; Service Fees</span>
                    <span className="font-mono font-bold text-white">৳124,500</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-emerald-400 text-sm">
                    <span>Total Operating Revenue (Gross Turnover)</span>
                    <span className="font-mono">৳3,759,500</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-850 font-bold text-white uppercase text-[11px] tracking-wider">
                  Cost of Goods Sold (COGS)
                </div>
                <div className="divide-y divide-slate-800/60 p-3 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Direct Hardware Procurement &amp; Vendor Shipments</span>
                    <span className="font-mono font-bold text-white">৳2,820,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Inward Freight &amp; Customs Duty / Port Handling</span>
                    <span className="font-mono font-bold text-white">৳48,000</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-rose-400 text-sm">
                    <span>Total Cost of Goods Sold (COGS)</span>
                    <span className="font-mono">৳2,868,000</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex justify-between items-center text-sm font-bold text-emerald-300">
                <span>GROSS PROFIT (GP)</span>
                <span className="font-mono text-base">৳891,500 (23.7% Margin)</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-850 font-bold text-white uppercase text-[11px] tracking-wider">
                  Operating &amp; Administrative Expenses
                </div>
                <div className="divide-y divide-slate-800/60 p-3 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Staff Salaries &amp; Team Allowances</span>
                    <span className="font-mono font-bold text-white">৳133,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Showroom Commercial Rent (Multiplan Center)</span>
                    <span className="font-mono font-bold text-white">৳45,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Commercial Electricity &amp; Showroom Power</span>
                    <span className="font-mono font-bold text-white">৳14,500</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2">
                    <span>Office Refreshment, Logistics &amp; Consumables</span>
                    <span className="font-mono font-bold text-white">৳12,850</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-rose-400 text-sm">
                    <span>Total Operating Overhead Expenses</span>
                    <span className="font-mono">৳205,350</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 border border-emerald-700 rounded-xl flex justify-between items-center text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                    Bottom Line Realized Earnings
                  </span>
                  <span className="text-base font-bold">NET OPERATING PROFIT (EBIT)</span>
                </div>
                <span className="text-2xl font-mono font-black text-emerald-200">
                  ৳686,150
                </span>
              </div>
            </div>
          )}

          {/* 2. BALANCE SHEET */}
          {reportType === 'balance_sheet' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assets */}
                <div className="border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4 bg-slate-850">
                  <h3 className="font-bold text-white uppercase text-xs flex items-center justify-between border-b border-slate-700 pb-2">
                    <span>Total Assets (সম্পত্তি)</span>
                    <span className="text-emerald-400">৳3,452,700</span>
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Cash &amp; Bank Liquidity</span>
                      <span className="font-mono font-bold text-white">৳902,700</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physical Inventory Valuation (Stock)</span>
                      <span className="font-mono font-bold text-white">৳2,275,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts Receivable (Customer Due)</span>
                      <span className="font-mono font-bold text-white">৳275,000</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4 bg-slate-850">
                  <h3 className="font-bold text-white uppercase text-xs flex items-center justify-between border-b border-slate-700 pb-2">
                    <span>Liabilities &amp; Equity (দায় ও মালিকানাস্বত্ব)</span>
                    <span className="text-rose-400">৳3,452,700</span>
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Accounts Payable (Supplier Payables)</span>
                      <span className="font-mono font-bold text-rose-400">৳958,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accrued Expenses &amp; Staff Salaries Due</span>
                      <span className="font-mono font-bold text-amber-400">৳43,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Owner Capital &amp; Retained Earnings</span>
                      <span className="font-mono font-bold text-emerald-400">৳2,450,900</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CASH FLOW */}
          {reportType === 'cash_flow' && (
            <div className="space-y-3 text-xs">
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-850 space-y-2">
                <h4 className="font-bold text-white uppercase text-xs border-b border-slate-700 pb-2">
                  Cash Flow from Operating Activities
                </h4>
                <div className="flex justify-between text-slate-300">
                  <span>Customer Collections &amp; Sales Cash Inflow</span>
                  <span className="font-mono font-bold text-emerald-400">+৳1,520,000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Supplier Bill Settlements &amp; Inventory Outflow</span>
                  <span className="font-mono font-bold text-rose-400">-৳950,000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Staff Salaries &amp; Operational Overhead Paid</span>
                  <span className="font-mono font-bold text-rose-400">-৳205,350</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-emerald-300">
                  <span>Net Cash from Operating Activities</span>
                  <span className="font-mono">+৳364,650</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
