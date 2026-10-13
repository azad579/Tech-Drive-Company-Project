import React, { useState } from 'react';
import {
  TrendingUp,
  Boxes,
  DollarSign,
  AlertTriangle,
  Printer,
  Download,
  Search,
  Filter,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound } from '../../utils/sound';

interface StockValuationReportTabProps {
  products: Product[];
}

export const StockValuationReportTab: React.FC<StockValuationReportTabProps> = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'LowStock' | 'FastMoving'>('All');

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.stock * (p.costPrice || p.basePurchaseCost || Math.round(p.price * 0.8)), 0);
  const totalPotentialProfit = totalValuation - totalCostValuation;

  const lowStockItems = products.filter((p) => p.stock < 10);

  const filteredProducts = products.filter((p) => {
    if (filterType === 'LowStock' && p.stock >= 10) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['SKU,Category,Product Name,Stock Qty,Unit Cost,Unit Selling Price,Total Cost Value,Total Retail Value\n'];
    const rows = filteredProducts.map((p) => {
      const cost = p.costPrice || p.basePurchaseCost || Math.round(p.price * 0.8);
      return `"${p.sku}","${p.category}","${p.name}","${p.stock}","${cost}","${p.price}","${p.stock * cost}","${p.stock * p.price}"`;
    });
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_valuation_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 font-sans select-none">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Physical Units</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {totalUnits} <span className="text-xs text-slate-400 font-normal">items</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all warehouses &amp; branches</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Cost Capital Invested</span>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(totalCostValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Original purchase cost basis</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Retail Valuation</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalValuation)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(totalPotentialProfit)} Projected Margin
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Low Stock Alerts</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{lowStockItems.length} Products</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Stock count under 10 units</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report items..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'LowStock'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  filterType === ft ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {ft === 'All' ? 'All Catalog Valuation' : `Low Stock Warnings (${lowStockItems.length})`}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              window.print();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Product Name</th>
              <th className="p-3 text-center">In-Stock Qty</th>
              <th className="p-3 text-right">Cost Price</th>
              <th className="p-3 text-right">Retail Price</th>
              <th className="p-3 text-right">Total Cost Asset</th>
              <th className="p-3 text-right">Total Retail Value</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProducts.map((p) => {
              const cost = p.costPrice || p.basePurchaseCost || Math.round(p.price * 0.8);
              const costTotal = p.stock * cost;
              const retailTotal = p.stock * p.price;
              const isLow = p.stock < 10;

              return (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{p.sku}</td>
                  <td className="p-3 text-slate-500">{p.category}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {p.stock}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {formatCurrency(cost)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="p-3 text-right font-mono text-purple-600 dark:text-purple-400">
                    {formatCurrency(costTotal)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(retailTotal)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isLow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
