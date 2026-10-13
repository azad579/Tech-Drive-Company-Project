import React, { useState } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Search,
  Check,
  Package,
  Trash2,
  Tag,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep } from '../../utils/sound';

interface ProductManagementViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

// Helper to auto-generate a unique code (e.g. AB001, LPT009)
function generateAutoCode(category: string, count: number): string {
  const prefixMap: Record<string, string> = {
    Laptops: 'LPT',
    Laptop: 'LPT',
    Components: 'CMP',
    Accessories: 'ACC',
    Services: 'SRV',
  };
  const prefix = prefixMap[category] || 'AB';
  const num = String(count + 1).padStart(3, '0');
  return `${prefix}${num}`;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  onAddProduct,
  onDeleteProduct,
}) => {
  // Form state - strictly the 6 requested fields:
  // 1. Name
  const [name, setName] = useState('');
  // 2. Code/SKU (auto-generated)
  const [code, setCode] = useState(() => generateAutoCode('Laptops', products.length));
  // 3. Category
  const [category, setCategory] = useState<'Laptops' | 'Components' | 'Accessories' | 'Services'>('Laptops');
  // 4. Unit
  const [unit, setUnit] = useState<string>('Unit');
  // 5. Warranty Days (default 15 from screenshot)
  const [warrantyDays, setWarrantyDays] = useState<number>(15);
  // 6. Image URL (Optional)
  const [imageUrl, setImageUrl] = useState<string>('');

  // Notification feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Search option for the Product List below
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Auto regenerate code when category changes
  const handleCategoryChange = (newCat: 'Laptops' | 'Components' | 'Accessories' | 'Services') => {
    setCategory(newCat);
    setCode(generateAutoCode(newCat, products.length));
  };

  const handleRegenerateCode = () => {
    playClickSound();
    setCode(generateAutoCode(category, products.length + Math.floor(Math.random() * 90) + 1));
  };

  const handleClear = () => {
    playClickSound();
    setName('');
    setCode(generateAutoCode(category, products.length));
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

    const finalCode = code.trim() || generateAutoCode(category, products.length);

    let iconType: 'laptop' | 'cpu' | 'mouse' | 'wrench' | 'disk' | 'charger' = 'laptop';
    if (category === 'Components') iconType = 'cpu';
    else if (category === 'Accessories') iconType = 'mouse';
    else if (category === 'Services') iconType = 'wrench';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      specs: `${unit} · ${warrantyDays} Days Warranty`,
      price: 0,
      costPrice: 0,
      sku: finalCode,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      stock: 50,
      iconType,
      unit,
      warrantyDays,
      imageUrl: imageUrl.trim() || undefined,
    };

    playBarcodeBeep();
    onAddProduct(newProduct);

    setFeedbackMsg(`Product "${name.trim()}" (${finalCode}) successfully saved!`);
    setTimeout(() => setFeedbackMsg(null), 3500);

    // Reset for next product
    setName('');
    setImageUrl('');
    setCode(generateAutoCode(category, products.length + 1));
  };

  // Filtered products for the Product List below
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.unit && p.unit.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* 1. TOP HEADER & BREADCRUMB (Matching user reference layout) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          {/* Breadcrumb matching user screenshot */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="hover:text-slate-800 cursor-pointer flex items-center gap-0.5">
              Dashboard <ChevronDown className="w-3 h-3 opacity-60" />
            </span>
            <span>›</span>
            <span className="hover:text-slate-800 cursor-pointer flex items-center gap-0.5">
              Inventory <ChevronDown className="w-3 h-3 opacity-60" />
            </span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">Add Product</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add Product & Master Catalog
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium">
            Total Master Items: <strong className="text-slate-900 dark:text-white">{products.length}</strong>
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 2. ADD PRODUCT CARD (Cyan banner matching user screenshot) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          {/* Cyan banner */}
          <div className="bg-[#0284c7] text-white px-5 py-2.5 flex items-center justify-between select-none">
            <h2 className="font-bold text-xs md:text-sm tracking-wider uppercase flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>ADD PRODUCT</span>
            </h2>
            {feedbackMsg && (
              <span className="text-xs bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {feedbackMsg}
              </span>
            )}
          </div>

          {/* Form with strictly the 6 requested fields */}
          <form onSubmit={handleSave} className="p-5 space-y-4">
            {/* Row 1: Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Field 1: Name */}
              <div className="md:col-span-8">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lenovo ThinkPad L15 Gen 2 – AMD Ryzen 5 Processor | 16GB DDR4 RAM | 512GB SSD..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Field 2: Code / SKU (will auto generate) */}
              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    Code (auto: ex: AB001)
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="text-[11px] text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Generate new random code"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="(auto: ex: AB001)"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-2 text-xs md:text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Category, Unit, Warranty Days */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Field 3: Category */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Laptops">Laptop</option>
                  <option value="Components">Components</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              {/* Field 4: Unit */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Warranty Days
                </label>
                <input
                  type="number"
                  min={0}
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(Number(e.target.value) || 0)}
                  placeholder="15"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg px-3 py-2 text-xs md:text-sm font-mono font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: Image URL (Optional) & Clear / Save Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1">
              {/* Field 6: Image URL (Optional) */}
              <div className="md:col-span-8">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">
                  Image URL (Optional)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-[#0284c7] rounded-lg pl-3 pr-10 py-2 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                  {imageUrl && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded overflow-hidden border border-slate-300 dark:border-slate-600 bg-white">
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

              {/* Action Buttons: Clear & SAVE (Matching screenshot placement) */}
              <div className="md:col-span-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs md:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#3b5998] hover:bg-[#2d4373] active:bg-[#203155] text-white text-xs md:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>SAVE</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 3. PRODUCT LIST WITH SEARCH OPTION (Separate below the form) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          {/* Header & Search Option */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Product Inventory List
                </h3>
                <p className="text-[11px] text-slate-400">
                  Separate master catalog items ({filteredProducts.length} items shown)
                </p>
              </div>
            </div>

            {/* Search Option */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs">
                {['All', 'Laptops', 'Components', 'Accessories', 'Services'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {cat === 'Laptops' ? 'Laptops' : cat}
                  </button>
                ))}
              </div>

              {/* Search Input with icon */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, SKU, category..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table of Products */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-4">Item & SKU</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Unit</th>
                  <th className="py-2.5 px-4">Warranty</th>
                  <th className="py-2.5 px-4 text-right">Physical Stock</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No products found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-sky-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {p.name}
                            </div>
                            <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                              {p.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {p.category}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {p.unit || 'Unit'}
                      </td>

                      {/* Warranty */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{p.warrantyDays !== undefined ? `${p.warrantyDays} Days` : '15 Days'}</span>
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {p.stock} units
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete product "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
