import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Low Stock Warning: Microsoft Surface Pro 4',
      time: '12 mins ago',
      desc: 'Only 4 units left in shelf storage. Automatic re-order proposal generated.',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      id: '2',
      title: 'Drawer Solenoid Kick Confirmed',
      time: '08:13 AM',
      desc: 'Drawer #02 opened by cashier Forhad with float ৳10,000.',
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: '3',
      title: 'New Stock Received: Corsair DDR4 RAM',
      time: '1 hour ago',
      desc: 'Batch #COR-8819 arrived. +35 units logged into database.',
      icon: Package,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      id: '4',
      title: 'Fiscal Tax Rate Synchronized',
      time: 'Today 08:00 AM',
      desc: 'NBR VAT regulations validated. Standard VAT at 5.0%.',
      icon: CheckCircle,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Store Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg shrink-0 ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    {n.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
