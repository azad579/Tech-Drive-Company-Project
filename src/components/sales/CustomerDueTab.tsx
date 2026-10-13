import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Phone,
  Wallet,
  X,
  CreditCard,
} from 'lucide-react';
import { Customer } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface CustomerDueTabProps {
  customers?: Customer[];
  onUpdateCustomer?: (customer: Customer) => void;
}

export const CustomerDueTab: React.FC<CustomerDueTabProps> = ({ customers = [], onUpdateCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dueList, setDueList] = useState<Customer[]>(() => {
    // Return all customers who have positive due balance, or all customers with balance initialized
    return customers.map((c, idx) => ({
      ...c,
      balance: c.balance !== undefined ? c.balance : idx === 0 ? 0 : idx === 1 ? 42500 : 85000,
      creditLimit: c.creditLimit || (c.companyName ? 200000 : 50000),
    }));
  });

  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Wire (Brac Bank)');
  const [paymentNote, setPaymentNote] = useState<string>('Customer dues collection settlement');
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  const filtered = dueList.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchComp = c.companyName?.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchPhone) return false;
    }
    return true;
  });

  const totalOutstandingDue = dueList.reduce((acc, c) => acc + (c.balance || 0), 0);
  const totalCreditLimit = dueList.reduce((acc, c) => acc + (c.creditLimit || 0), 0);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment || paymentAmount <= 0) return;
    playCashDrawerDing();

    const currentBal = selectedCustomerForPayment.balance || 0;
    const newBal = Math.max(0, currentBal - paymentAmount);

    const updatedCustomer: Customer = {
      ...selectedCustomerForPayment,
      balance: newBal,
    };

    setDueList((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );

    if (onUpdateCustomer) {
      onUpdateCustomer(updatedCustomer);
    }

    setSelectedCustomerForPayment(null);
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Customer Name,Company,Phone,Credit Limit,Current Due Balance,Available Credit\n'];
    const rows = filtered.map(
      (c) =>
        `"${c.name}","${c.companyName || ''}","${c.phone}","${c.creditLimit || 0}","${c.balance || 0}","${Math.max(0, (c.creditLimit || 0) - (c.balance || 0))}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_dues_report_${new Date().toISOString().slice(0, 10)}.csv`;
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
              placeholder="Search customer, corporate company, phone..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dues Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding Dues</p>
            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{formatCurrency(totalOutstandingDue)}</p>
            <p className="text-[10px] text-amber-400">Total active receivables</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Credit Ceiling</p>
            <p className="text-xl font-black text-cyan-400 font-mono mt-0.5">{formatCurrency(totalCreditLimit)}</p>
            <p className="text-[10px] text-slate-400">Allocated approved limits</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Customers with Due</p>
            <p className="text-xl font-black text-white font-mono mt-0.5">
              {dueList.filter((c) => (c.balance || 0) > 0).length} of {dueList.length}
            </p>
            <p className="text-[10px] text-emerald-400">Credit utilization tracked</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Customer / Organization</th>
              <th className="p-3">Type</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-right">Credit Limit</th>
              <th className="p-3 text-right">Outstanding Due ৳</th>
              <th className="p-3 text-right">Available Credit</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const bal = c.balance || 0;
                const limit = c.creditLimit || 50000;
                const avail = Math.max(0, limit - bal);
                const hasDue = bal > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-900/70 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{c.name}</div>
                      {c.companyName && (
                        <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{c.companyName}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">{c.customerType || 'Regular'}</td>
                    <td className="p-3 text-slate-300 font-mono">{c.phone}</td>
                    <td className="p-3 text-right font-mono text-slate-300">{formatCurrency(limit)}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(bal)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">{formatCurrency(avail)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasDue
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {hasDue ? 'Due Pending' : 'Clear / Settled'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasDue && (
                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedCustomerForPayment(c);
                              setPaymentAmount(bal);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Collect cash or bank payment against dues"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>Collect ৳</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            playClickSound();
                            setStatementCustomer(c);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Print customer due ledger statement"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Statement</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No customers found matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: COLLECT / SETTLE DUE PAYMENT */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Receive Customer Due Collection</span>
              </h3>
              <button onClick={() => setSelectedCustomerForPayment(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                <div className="text-white font-bold text-sm">{selectedCustomerForPayment.name}</div>
                <div className="text-slate-400 font-mono mt-0.5">{selectedCustomerForPayment.phone}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Total Outstanding Balance:</span>
                  <span className="text-amber-400 font-mono font-bold text-base">
                    {formatCurrency(selectedCustomerForPayment.balance || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Collection Amount ৳ *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedCustomerForPayment.balance || 999999}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Receiving Account / Gateway *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Main POS Cash Drawer">Main POS Cash Register</option>
                  <option value="Bank Wire (Brac Bank)">Brac Bank Current A/C #1501204899</option>
                  <option value="City Bank Business Account">City Bank A/C #2102938475</option>
                  <option value="bKash Merchant QR">bKash Merchant 01700998877</option>
                  <option value="Nagad Business Wallet">Nagad Business 01899112233</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Collection Note</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Remaining Balance:</span>{' '}
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(Math.max(0, (selectedCustomerForPayment.balance || 0) - paymentAmount))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerForPayment(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                  >
                    Confirm Collection
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT STATEMENT */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Customer Receivable Statement</h3>
              <button onClick={() => setStatementCustomer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-200">
              <div className="border-b border-slate-800 pb-3">
                <div className="font-bold text-base text-white">{statementCustomer.name}</div>
                <div className="text-slate-400">{statementCustomer.companyName}</div>
                <div className="font-mono text-slate-400 mt-1">Contact: {statementCustomer.phone}</div>
                <div className="text-slate-400">{statementCustomer.address}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-850 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Approved Limit:</span>
                  <span className="text-white font-mono font-bold">{formatCurrency(statementCustomer.creditLimit || 50000)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Outstanding Due:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {formatCurrency(statementCustomer.balance || 0)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Official statement generated as on {new Date().toLocaleDateString('en-GB')}. Payment terms:{' '}
                {statementCustomer.paymentTerms || 'Net 30 Days'}.
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setStatementCustomer(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
