import React, { useState } from 'react';
import { X, Lock, Unlock, DollarSign, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { CashDrawerState } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playCashDrawerDing } from '../../utils/sound';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawerState: CashDrawerState;
  onUpdateDrawer: (newState: CashDrawerState) => void;
}

export const CashDrawerModal: React.FC<CashDrawerModalProps> = ({
  isOpen,
  onClose,
  drawerState,
  onUpdateDrawer,
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [cashReason, setCashReason] = useState('');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');

  if (!isOpen) return null;

  const currentTotalInDrawer =
    drawerState.startingFloat +
    drawerState.cashSales +
    drawerState.cashIn -
    drawerState.cashOut;

  const handleToggleDrawer = () => {
    playCashDrawerDing();
    onUpdateDrawer({
      ...drawerState,
      isOpen: !drawerState.isOpen,
      openedAt: !drawerState.isOpen ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : drawerState.openedAt,
    });
  };

  const handleCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cashAmount);
    if (!val || val <= 0) return;

    if (actionType === 'in') {
      onUpdateDrawer({
        ...drawerState,
        cashIn: drawerState.cashIn + val,
      });
    } else {
      onUpdateDrawer({
        ...drawerState,
        cashOut: drawerState.cashOut + val,
      });
    }
    setCashAmount('');
    setCashReason('');
    playCashDrawerDing();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${drawerState.isOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700'}`}>
              {drawerState.isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cash Drawer Management</h3>
              <p className="text-[11px] text-slate-400">Terminal #02 • Hardware Drawer Port RJ12</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status & Balance Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Drawer Status:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${drawerState.isOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'}`}>
                {drawerState.isOpen ? `Open (since ${drawerState.openedAt})` : 'Closed'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expected Physical Cash:</span>
              <span className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(currentTotalInDrawer)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
              <div>Opening Float: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{formatCurrency(drawerState.startingFloat)}</span></div>
              <div>Today Cash Sales: <span className="font-mono text-emerald-600 font-semibold">{formatCurrency(drawerState.cashSales)}</span></div>
              <div>Paid In: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{formatCurrency(drawerState.cashIn)}</span></div>
              <div>Paid Out: <span className="font-mono text-rose-600 font-semibold">{formatCurrency(drawerState.cashOut)}</span></div>
            </div>
          </div>

          {/* Quick Drawer Open Kick pulse */}
          <button
            onClick={handleToggleDrawer}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              drawerState.isOpen
                ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {drawerState.isOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{drawerState.isOpen ? 'Lock Drawer' : 'Kick Drawer Open (Electronic Solenoid)'}</span>
          </button>

          {/* Cash In / Out Form */}
          <form onSubmit={handleCashMovement} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-850 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Cash Entry / Drop</span>
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActionType('in')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${actionType === 'in' ? 'bg-white dark:bg-slate-900 text-emerald-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Paid In
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('out')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${actionType === 'out' ? 'bg-white dark:bg-slate-900 text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Paid Out
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount (৳)"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Petty cash / change)"
                value={cashReason}
                onChange={(e) => setCashReason(e.target.value)}
                className="w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!cashAmount}
              className="w-full py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Record Movement
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
