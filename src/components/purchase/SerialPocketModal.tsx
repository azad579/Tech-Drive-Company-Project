import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  X,
  Check,
  Sparkles,
  ClipboardList,
  AlertCircle,
  Hash,
  Trash2,
  Barcode,
} from 'lucide-react';
import { Product } from '../../types/pos';
import { playClickSound, playBarcodeBeep } from '../../utils/sound';

interface SerialPocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  currentSerials: string[];
  onSaveSerials: (serials: string[]) => void;
}

export const SerialPocketModal: React.FC<SerialPocketModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity,
  currentSerials,
  onSaveSerials,
}) => {
  // Enforce strictly 'quantity' slots
  const [serials, setSerials] = useState<string[]>([]);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize array of length 'quantity'
      const initial = Array.from({ length: quantity }, (_, idx) => currentSerials[idx] || '');
      setSerials(initial);
      setShowPasteArea(false);
      setPasteText('');
      setPasteNotice(null);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, quantity, currentSerials]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string) => {
    const updated = [...serials];
    updated[index] = value;
    setSerials(updated);
  };

  const handleAutoGenerate = () => {
    playClickSound();
    const prefix = product.sku ? product.sku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() : 'SN';
    const timestamp = Date.now().toString().slice(-4);
    const generated = Array.from({ length: quantity }, (_, idx) => {
      return `SN-${prefix}-${timestamp}-${String(idx + 1).padStart(2, '0')}`;
    });
    setSerials(generated);
  };

  const handleApplyPaste = () => {
    if (!pasteText.trim()) return;
    playBarcodeBeep();
    // Split by newlines, commas, tabs, spaces
    const tokens = pasteText
      .split(/[\r\n,;\t]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const newSerials = [...serials];
    const takeCount = Math.min(tokens.length, quantity);
    for (let i = 0; i < takeCount; i++) {
      newSerials[i] = tokens[i];
    }
    setSerials(newSerials);

    if (tokens.length > quantity) {
      setPasteNotice(`Accepted first ${quantity} serials (truncated ${tokens.length - quantity} excess items).`);
    } else {
      setPasteNotice(`Successfully assigned ${takeCount} serials.`);
    }
    setShowPasteArea(false);
    setPasteText('');
  };

  const handleClearAll = () => {
    playClickSound();
    setSerials(Array.from({ length: quantity }, () => ''));
    setPasteNotice(null);
  };

  const handleSave = () => {
    playBarcodeBeep();
    const cleaned = serials.map((s) => s.trim()).filter(Boolean);
    onSaveSerials(cleaned);
    onClose();
  };

  const filledCount = serials.filter((s) => s.trim().length > 0).length;
  const isAllFilled = filledCount === quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150">
      {/* Small Pocket Card */}
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Pocket Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-tight">Add Serial Numbers</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                  Qty: {quantity} {quantity === 1 ? 'unit' : 'units'}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 line-clamp-1 mt-0.5 font-medium">
                {product.name} ({product.sku})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pocket Subbar & Quick Actions */}
        <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAllFilled
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : filledCount > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {isAllFilled ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>
                {filledCount} of {quantity} assigned
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Automatically generate serial numbers for all slots"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Fill</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Paste multiple serials at once"
            >
              <ClipboardList className="w-3 h-3" />
              <span>Bulk Paste</span>
            </button>
          </div>
        </div>

        {/* Paste helper drawer */}
        {showPasteArea && (
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-[11px] text-indigo-900 dark:text-indigo-200 font-semibold">
              <span>Paste serials (one per line, comma, or space):</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                Will take only {quantity} {quantity === 1 ? 'serial' : 'serials'}
              </span>
            </div>
            <textarea
              rows={2}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="SN-1001&#10;SN-1002&#10;SN-1003"
              className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteArea(false)}
                className="px-2.5 py-1 text-[11px] rounded text-slate-600 hover:bg-slate-200/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                className="px-3 py-1 text-[11px] font-bold rounded bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
              >
                Apply to {quantity} Slots
              </button>
            </div>
          </div>
        )}

        {pasteNotice && (
          <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center justify-between">
            <span>{pasteNotice}</span>
            <button onClick={() => setPasteNotice(null)} className="text-blue-500 hover:text-blue-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Scrollable Slots (Strictly 'quantity' slots) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            This purchase request contains <strong>{quantity} units</strong>. Fill or scan each serial number below:
          </p>

          {Array.from({ length: quantity }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                #{index + 1}
              </div>
              <div className="relative flex-1">
                <input
                  ref={index === 0 ? firstInputRef : undefined}
                  type="text"
                  value={serials[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Enter serial number #${index + 1}`}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              {serials[index] && (
                <button
                  type="button"
                  onClick={() => handleInputChange(index, '')}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                  title="Clear this slot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pocket Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Serials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
