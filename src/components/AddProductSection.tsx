import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, Image, Sparkles, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { Product, ProductCategory } from '../types/pos';
import { playClickSound, playBarcodeBeep } from '../utils/sound';

interface AddProductSectionProps {
  onAddProduct: (product: Product) => void;
  existingProductsCount: number;
}

// Helper to auto-generate a unique code (e.g., AB001, LPT-102)
function generateAutoCode(category: string, count: number): string {
  const prefixMap: Record<string, string> = {
    Laptops: 'LPT',
    Components: 'CMP',
    Accessories: 'ACC',
    Services: 'SRV',
  };
  const prefix = prefixMap[category] || 'AB';
  const num = String(count + 1).padStart(3, '0');
  return `${prefix}${num}`;
}

export const AddProductSection: React.FC<AddProductSectionProps> = ({
  onAddProduct,
  existingProductsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // The 6 exact fields requested:
  // 1. Name
  const [name, setName] = useState('');
  // 2. Code/SKU (auto-generated)
  const [code, setCode] = useState(() => generateAutoCode('Laptops', existingProductsCount));
  // 3. Category
  const [category, setCategory] = useState<'Laptops' | 'Components' | 'Accessories' | 'Services'>('Laptops');
  // 4. Unit
  const [unit, setUnit] = useState<string>('Unit');
  // 5. Warranty Days
  const [warrantyDays, setWarrantyDays] = useState<number>(15);
  // 6. Image URL (Optional)
  const [imageUrl, setImageUrl] = useState<string>('');

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Auto-regenerate code if category changes and user hasn't typed custom code
  useEffect(() => {
    setCode(generateAutoCode(category, existingProductsCount));
  }, [category, existingProductsCount]);

  const handleRegenerateCode = () => {
    playClickSound();
    setCode(generateAutoCode(category, existingProductsCount + Math.floor(Math.random() * 90) + 1));
  };

  const handleClear = () => {
    playClickSound();
    setName('');
    setCode(generateAutoCode(category, existingProductsCount));
    setCategory('Laptops');
    setUnit('Unit');
    setWarrantyDays(15);
    setImageUrl('');
    setFeedbackMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const finalCode = code.trim() || generateAutoCode(category, existingProductsCount);

    // Pick icon based on category
    let iconType: 'laptop' | 'cpu' | 'mouse' | 'wrench' | 'disk' | 'charger' = 'laptop';
    if (category === 'Components') iconType = 'cpu';
    else if (category === 'Accessories') iconType = 'mouse';
    else if (category === 'Services') iconType = 'wrench';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      specs: `${unit} · ${warrantyDays} Days Warranty`,
      price: 0, // Default price if not set
      costPrice: 0,
      sku: finalCode,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      stock: 50, // Initial stock available for POS and purchasing
      iconType,
      unit,
      warrantyDays,
      imageUrl: imageUrl.trim() || undefined,
    };

    playBarcodeBeep();
    onAddProduct(newProduct);

    setFeedbackMsg(`Product "${name.trim()}" (${finalCode}) added successfully!`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    // Reset fields for next entry
    setName('');
    setImageUrl('');
    setCode(generateAutoCode(category, existingProductsCount + 1));
  };

  return (
    <div className="border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md shrink-0 font-sans transition-all">
      {/* Cyan / Teal Top Banner (Matching Screenshot exactly) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span className="font-bold text-xs tracking-wider uppercase">ADD PRODUCT</span>
          <span className="text-[11px] opacity-80 font-normal hidden sm:inline">
            (Add new item to inventory below product list)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {feedbackMsg && (
            <span className="text-[11px] bg-emerald-500 text-white px-2 py-0.5 rounded font-semibold animate-pulse flex items-center gap-1">
              <Check className="w-3 h-3" /> Added!
            </span>
          )}
          <button
            type="button"
            className="p-0.5 rounded hover:bg-white/20 text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Form Content - Only the 6 exact requested fields */}
      {isExpanded && (
        <form onSubmit={handleSave} className="p-3.5 space-y-3 bg-slate-50/70 dark:bg-slate-900/90 text-xs">
          {/* Row 1: Name & Code/SKU (auto generate) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Field 1: Name */}
            <div className="md:col-span-8">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lenovo ThinkPad L15 Gen 2 – AMD Ryzen 5 Processor | 16GB DDR4 RAM..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Field 2: Code/SKU (will auto generate) */}
            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  Code / SKU
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-[10px] text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Generate new random code"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Regenerate</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="(auto: ex: AB001)"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Category, Unit, Warranty Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Field 3: Category */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Laptops">Laptop</option>
                <option value="Components">Components</option>
                <option value="Accessories">Accessories</option>
                <option value="Services">Services</option>
              </select>
            </div>

            {/* Field 4: Unit */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Unit">Unit</option>
                <option value="Pcs">Pcs</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
                <option value="Pack">Pack</option>
              </select>
            </div>

            {/* Field 5: Warranty Days */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                Warranty Days
              </label>
              <input
                type="number"
                min={0}
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value) || 0)}
                placeholder="15"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Image URL (Optional) & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Field 6: Image URL (Optional) */}
            <div className="md:col-span-8">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                Image URL (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                {imageUrl && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded overflow-hidden border border-slate-300">
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Clear & SAVE (Matching screenshot positioning) */}
            <div className="md:col-span-4 flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg bg-[#3b5998] hover:bg-[#2d4373] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>SAVE</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
