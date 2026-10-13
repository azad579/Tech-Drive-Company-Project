import React from 'react';
import { X, Zap, RefreshCw, Tag, DollarSign, ShieldCheck, Printer, Users } from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDrawer: () => void;
  onOpenHeldOrders: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onOpenDrawer,
  onOpenHeldOrders,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      title: 'Cash Drawer Float',
      desc: 'Check drawer balance & cash drops',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      onClick: () => {
        onClose();
        onOpenDrawer();
      },
    },
    {
      title: 'Resume Held Carts',
      desc: 'View active suspended sales',
      icon: RefreshCw,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      onClick: () => {
        onClose();
        onOpenHeldOrders();
      },
    },
    {
      title: 'Price & Stock Lookup',
      desc: 'Instant inventory checker',
      icon: Tag,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      onClick: () => {
        onClose();
      },
    },
    {
      title: 'Reprint Last Invoice',
      desc: 'Duplicate copy for warranty',
      icon: Printer,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      onClick: () => {
        onClose();
        window.print();
      },
    },
    {
      title: 'Switch Cashier Shift',
      desc: 'Log terminal handover',
      icon: Users,
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      onClick: () => {
        onClose();
        onOpenDrawer();
      },
    },
    {
      title: 'Tax Compliance Check',
      desc: 'NBR VAT rate 5% verified',
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      onClick: () => {
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">POS Quick Actions</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={act.onClick}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 text-left transition-all flex items-start gap-3 group"
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
