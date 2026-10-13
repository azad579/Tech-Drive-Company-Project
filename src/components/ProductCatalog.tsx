import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  LayoutGrid,
  List as ListIcon,
  Laptop,
  Cpu,
  Mouse,
  Wrench,
  HardDrive,
  Zap,
  Plus,
  Check,
} from 'lucide-react';
import { Product, ProductCategory } from '../types/pos';
import { formatCurrency } from '../utils/format';
import { playBarcodeBeep, playClickSound } from '../utils/sound';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keydown handler for F2 (barcode focus) and Ctrl+K (search focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Search by barcode or SKU
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === query.toLowerCase() ||
        p.sku.toLowerCase() === query.toLowerCase()
    );

    if (match) {
      playBarcodeBeep();
      onAddToCart(match);
      setLastScannedId(match.id);
      setBarcodeInput('');
      setTimeout(() => setLastScannedId(null), 1200);
    } else {
      // If not exact barcode, search by name match
      const fallback = products.find((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      if (fallback) {
        playBarcodeBeep();
        onAddToCart(fallback);
        setLastScannedId(fallback.id);
        setBarcodeInput('');
        setTimeout(() => setLastScannedId(null), 1200);
      }
    }
  };

  const handleProductClick = (product: Product) => {
    playClickSound();
    onAddToCart(product);
  };

  const categories: ProductCategory[] = ['All', 'Laptops', 'Components', 'Accessories', 'Services'];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const renderIcon = (type: Product['iconType']) => {
    const className = "w-5 h-5 text-sky-500";
    switch (type) {
      case 'laptop':
        return <Laptop className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'mouse':
        return <Mouse className={className} />;
      case 'wrench':
        return <Wrench className={className} />;
      case 'charger':
        return <Zap className={className} />;
      case 'disk':
      default:
        return <HardDrive className={className} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Top Search & Barcode Bar */}
      <div className="p-3 md:p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Main search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, SKU, or code (Ctrl+K)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Barcode scanner */}
          <form
            onSubmit={handleBarcodeSubmit}
            className="relative w-full sm:w-64 flex items-center"
          >
            <Barcode className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode (F2)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-10 py-2 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono pointer-events-none">
              F2
            </kbd>
          </form>
        </div>

        {/* Categories Bar & View Mode Toggle */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view (as in screenshot)"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Items List / Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No products found</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Try adjusting your search query or switch category tab to find inventory.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* List Mode (Matches Screenshot) */
          <div className="space-y-2">
            {filteredProducts.map((product) => {
              const isRecentlyScanned = lastScannedId === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isRecentlyScanned
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40 dark:border-blue-400'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs'
                  }`}
                >
                  {/* Left: Device Icon / Image + Title + Category Tag + Specs */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        renderIcon(product.iconType)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm md:text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {product.specs}
                      </div>
                    </div>
                  </div>

                  {/* Right: Tabular Price & Quick Add */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base md:text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {product.stock > 900 ? 'In Stock' : `${product.stock} available`}
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Add to cart"
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                    >
                      {isRecentlyScanned ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-xs cursor-pointer flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        renderIcon(product.iconType)
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {product.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{product.specs}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-[10px] text-slate-400">SKU: {product.sku}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick barcode simulation helper chips at bottom */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs flex items-center gap-2 overflow-x-auto text-slate-500 shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase shrink-0">Quick Scan Demo:</span>
        <button
          onClick={() => {
            setBarcodeInput('889842718901');
            const match = products.find((p) => p.barcode === '889842718901');
            if (match) {
              playBarcodeBeep();
              onAddToCart(match);
            }
          }}
          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 hover:text-white transition-colors"
        >
          Surface L4
        </button>
        <button
          onClick={() => {
            const match = products.find((p) => p.barcode === '889842718902');
            if (match) {
              playBarcodeBeep();
              onAddToCart(match);
            }
          }}
          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 hover:text-white transition-colors"
        >
          Surface Pro 7
        </button>
        <button
          onClick={() => {
            const match = products.find((p) => p.barcode === '889842718908');
            if (match) {
              playBarcodeBeep();
              onAddToCart(match);
            }
          }}
          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 hover:text-white transition-colors"
        >
          MX Master 3S
        </button>
      </div>
    </div>
  );
};
