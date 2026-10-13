import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', action: 'Focus barcode scanner input' },
    { key: 'Ctrl + K', action: 'Focus product catalog search' },
    { key: 'F9', action: 'Open checkout / payment modal' },
    { key: 'Esc', action: 'Close active modal / cancel' },
    { key: 'F1', action: 'Open keyboard shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">POS Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">{s.action}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
