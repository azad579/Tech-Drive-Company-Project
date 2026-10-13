import React from 'react';
import { X, Play, Trash2, Clock, ShoppingBag } from 'lucide-react';
import { HeldOrder } from '../../types/pos';
import { formatCurrency } from '../../utils/format';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onResumeOrder: (order: HeldOrder) => void;
  onDeleteHeldOrder: (orderId: string) => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  isOpen,
  onClose,
  heldOrders,
  onResumeOrder,
  onDeleteHeldOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Held Orders ({heldOrders.length})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {heldOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No orders on hold</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When you click "Hold" on an active cart, it will be safely saved here so you can serve the next customer.
              </p>
            </div>
          ) : (
            heldOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between gap-3 hover:border-blue-400 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {order.customer.name}
                    </span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-mono">
                      {order.mode.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items · Held at {order.heldAt}
                  </div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">
                    {formatCurrency(order.grandTotal)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onResumeOrder(order);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={() => onDeleteHeldOrder(order.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Discard order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
