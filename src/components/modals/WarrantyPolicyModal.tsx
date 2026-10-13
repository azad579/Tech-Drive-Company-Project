import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Settings,
  Sparkles,
  Wrench,
  Check,
  RotateCcw,
  DollarSign,
  AlertCircle,
  HelpCircle,
  FileText,
  Building,
} from 'lucide-react';
import { WarrantyPolicySettings, DEFAULT_WARRANTY_POLICY } from '../../types/warranty';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { formatCurrency } from '../../utils/format';

interface WarrantyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: WarrantyPolicySettings;
  onSavePolicy: (newPolicy: WarrantyPolicySettings) => void;
}

export const WarrantyPolicyModal: React.FC<WarrantyPolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  onSavePolicy,
}) => {
  const [formData, setFormData] = useState<WarrantyPolicySettings>(policy);
  const [activeTab, setActiveTab] = useState<'policy' | 'simulation'>('policy');

  if (!isOpen) return null;

  const handleReset = () => {
    playClickSound();
    setFormData(DEFAULT_WARRANTY_POLICY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    onSavePolicy({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  // Example simulation values
  const simComponentCost = 2500;
  const simLaborFee = 800;

  // Under Guarantee calculation:
  const guaranteeCustPay =
    (formData.isGuaranteeComponentsFree ? 0 : simComponentCost) + 0;
  const guaranteeExpense = formData.isGuaranteeAddToExpense
    ? simComponentCost
    : 0;

  // Under Service Warranty calculation:
  const serviceCustPay =
    (formData.isServiceComponentPaidByCustomer ? simComponentCost : 0) +
    (formData.isServiceLaborFree ? 0 : simLaborFee);
  const serviceExpense = formData.isServiceComponentPaidByCustomer
    ? 0
    : simComponentCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-emerald-100">
                  Daily Process · Configuration
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                Warranty & Guarantee Policy Settings
              </h2>
              <p className="text-xs text-emerald-100/90">
                Configure 30-Day Guarantee (Free Parts &gt; Expense) and 5-Year Free Service Warranty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'policy'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Policy & Change Options
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Live Rules Simulation Preview</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {activeTab === 'policy' ? (
            <>
              {/* SECTION 1: GUARANTEE POLICY (30 DAYS) */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                        Guarantee Policy (Free Replacement Period)
                      </h3>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        All components are free for customer & cost is added to company expenses
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono">
                    Active Guarantee
                  </span>
                </div>

                {/* Days Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Guarantee Duration (Days) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={formData.guaranteeDays}
                        onChange={(e) =>
                          setFormData({ ...formData, guaranteeDays: Math.max(1, Number(e.target.value) || 1) })
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-700 rounded-lg p-2.5 font-mono font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs">Days</span>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400">Presets:</span>
                      {[15, 30, 45, 60, 90].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormData({ ...formData, guaranteeDays: d })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            formData.guaranteeDays === d
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                          }`}
                        >
                          {d}D
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expense Category Mapping */}
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Auto-Post Expense Category
                    </label>
                    <select
                      value={formData.guaranteeExpenseCategory}
                      onChange={(e) =>
                        setFormData({ ...formData, guaranteeExpenseCategory: e.target.value })
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Warranty & Replacement Expense">
                        Warranty & Replacement Expense
                      </option>
                      <option value="RMA & Defective Parts">RMA & Defective Parts</option>
                      <option value="Customer Goodwill / Guarantee">Customer Goodwill / Guarantee</option>
                      <option value="General Operating Expense">General Operating Expense</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Posted directly to Finance Record when claim is approved.
                    </span>
                  </div>
                </div>

                {/* Toggles for Guarantee */}
                <div className="pt-2 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-emerald-300 dark:border-emerald-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGuaranteeComponentsFree}
                      onChange={(e) =>
                        setFormData({ ...formData, isGuaranteeComponentsFree: e.target.checked })
                      }
                      className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        Components Free for Customer
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Customer pays 0 ৳ for any replacement hardware during the guarantee window.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-emerald-300 dark:border-emerald-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGuaranteeAddToExpense}
                      onChange={(e) =>
                        setFormData({ ...formData, isGuaranteeAddToExpense: e.target.checked })
                      }
                      className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        Add to Company Expense
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Automatically record replacement component cost in shop expenses.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION 2: SERVICE WARRANTY POLICY (5 YEARS) */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                        Service Warranty Policy (Long-Term Free Labor)
                      </h3>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                        No repair fee for customer; components cost will be paid by customer
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono">
                    Service Warranty
                  </span>
                </div>

                {/* Years Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Service Warranty Duration (Years) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={formData.serviceWarrantyYears}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceWarrantyYears: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-indigo-400 dark:border-indigo-700 rounded-lg p-2.5 font-mono font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs">Years</span>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400">Presets:</span>
                      {[1, 2, 3, 5, 10].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setFormData({ ...formData, serviceWarrantyYears: y })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            formData.serviceWarrantyYears === y
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-950'
                          }`}
                        >
                          {y}Y
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="p-3 rounded-lg bg-indigo-100/60 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-[11px] text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                        Technician Labor Rule
                      </p>
                      Service fee is waived (0 ৳ repair fee). When a new physical component or motherboard chip is installed, invoice line item reflects component cost payable by client.
                    </div>
                  </div>
                </div>

                {/* Toggles for Service Warranty */}
                <div className="pt-2 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-indigo-300 dark:border-indigo-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isServiceLaborFree}
                      onChange={(e) =>
                        setFormData({ ...formData, isServiceLaborFree: e.target.checked })
                      }
                      className="mt-0.5 accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        No Repair Fee (0 ৳ Labor)
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Diagnostics, assembly, disassembly & servicing labor fee is completely free.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-indigo-300 dark:border-indigo-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isServiceComponentPaidByCustomer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isServiceComponentPaidByCustomer: e.target.checked,
                        })
                      }
                      className="mt-0.5 accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        Components Cost Paid by Customer
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Customer pays the purchase cost of any required hardware replacement part.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Policy Terms & Notice Text */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>Customer Printed Invoice Terms & Notice</span>
                  <span className="text-[10px] text-slate-400 font-normal">Appears on receipts & warranty slips</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.policyTermsNote}
                  onChange={(e) => setFormData({ ...formData, policyTermsNote: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter policy statement shown to customers..."
                />
              </div>
            </>
          ) : (
            /* SIMULATION / PREVIEW TAB */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Live Policy Calculation Simulator
                </div>
                See below how a replacement claim (Component: ৳{formatCurrency(simComponentCost)}, Labor: ৳{formatCurrency(simLaborFee)}) is automatically handled based on your configured policy:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario A: Within Guarantee */}
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider">
                      Scenario A: Day 1 to {formData.guaranteeDays}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      {formData.guaranteeDays}-Day Guarantee
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-200/50">
                      <span className="text-slate-600 dark:text-slate-400">Customer Pays Component:</span>
                      <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        {formData.isGuaranteeComponentsFree ? '৳0 (100% Free)' : formatCurrency(simComponentCost)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/50">
                      <span className="text-slate-600 dark:text-slate-400">Customer Pays Labor:</span>
                      <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        ৳0 (Free)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-200/50 font-bold">
                      <span className="text-slate-900 dark:text-white">Customer Total Payable:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                        {formatCurrency(guaranteeCustPay)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 font-bold text-rose-600 dark:text-rose-400">
                      <span>Added to Company Expenses:</span>
                      <span className="font-mono text-sm">
                        {formatCurrency(guaranteeExpense)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenario B: Service Warranty */}
                <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 text-xs uppercase tracking-wider">
                      Scenario B: After {formData.guaranteeDays}D up to {formData.serviceWarrantyYears}Y
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                      {formData.serviceWarrantyYears}-Year Service
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-indigo-200/50">
                      <span className="text-slate-600 dark:text-slate-400">Customer Pays Component:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {formData.isServiceComponentPaidByCustomer ? formatCurrency(simComponentCost) : '৳0'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-200/50">
                      <span className="text-slate-600 dark:text-slate-400">Customer Pays Labor:</span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {formData.isServiceLaborFree ? '৳0 (No Repair Fee)' : formatCurrency(simLaborFee)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-200/50 font-bold">
                      <span className="text-slate-900 dark:text-white">Customer Total Payable:</span>
                      <span className="font-mono text-indigo-700 dark:text-indigo-300 text-sm">
                        {formatCurrency(serviceCustPay)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 pt-2 font-bold text-slate-500">
                      <span>Added to Company Expenses:</span>
                      <span className="font-mono text-sm">
                        {formatCurrency(serviceExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults (30D / 5Y)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Apply Policy</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
