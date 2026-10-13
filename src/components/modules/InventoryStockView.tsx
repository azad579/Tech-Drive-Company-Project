import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  SlidersHorizontal,
  Edit2,
  Hash,
  Cpu,
  HardDrive,
  CheckCircle,
  X,
  Package,
  Sparkles,
  ShieldCheck,
  Tag,
  DollarSign,
  Layers,
  Lock,
  ArrowRight,
  Info,
  Printer,
  Receipt,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Product, ProductCategory, InstalledComponent } from '../../types/pos';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from '../../utils/sound';
import {
  ERPTransactionRecord,
  getStoredSalesInvoices,
  saveStoredSalesInvoices,
  getStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  getStoredPurchaseInvoices,
  saveStoredPurchaseInvoices,
  filterRecordsForProduct,
} from '../../data/mockTransactions';
import { EditInvoiceModal } from '../modals/EditInvoiceModal';
import { StockInOutTab } from '../inventory/StockInOutTab';
import { StockTransferTab } from '../inventory/StockTransferTab';
import { StockAdjustmentTab } from '../inventory/StockAdjustmentTab';
import { StockValuationReportTab } from '../inventory/StockValuationReportTab';

interface InventoryStockViewProps {
  products: Product[];
  onUpdateProductStock?: (productId: string, newStock: number) => void;
  onUpdateProduct?: (product: Product) => void;
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const InventoryStockView: React.FC<InventoryStockViewProps> = ({
  products,
  onUpdateProductStock,
  onUpdateProduct,
  activeSubItem = '3.1',
  onSelectSubItem,
}) => {
  const [currentInvTab, setCurrentInvTab] = useState<string>(activeSubItem || '3.1');

  useEffect(() => {
    if (activeSubItem) {
      setCurrentInvTab(activeSubItem);
    }
  }, [activeSubItem]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [serialProduct, setSerialProduct] = useState<Product | null>(null);
  const [upgradingProduct, setUpgradingProduct] = useState<Product | null>(null);

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<'Laptops' | 'Components' | 'Accessories' | 'Services'>('Laptops');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editWarranty, setEditWarranty] = useState<number>(15);
  const [editSpecs, setEditSpecs] = useState('');
  const [editUnit, setEditUnit] = useState('Unit');

  // Serial Numbers Form State
  const [serialInput, setSerialInput] = useState('');
  const [currentSerials, setCurrentSerials] = useState<string[]>([]);

  // Add Additional Components (RAM / SSD) Form State
  const [upgradeType, setUpgradeType] = useState<'RAM' | 'SSD' | 'CUSTOM'>('RAM');
  const [componentDescription, setComponentDescription] = useState('+16GB DDR4 3200MHz RAM');
  const [additionalCost, setAdditionalCost] = useState<number>(4500);
  const [targetSerial, setTargetSerial] = useState<string>('ALL');

  // Print Option State
  const [printItem, setPrintItem] = useState<Product | null>(null);

  // Sales Invoice, Purchase Order, Purchase Invoice State beside familiar row
  const [salesInvoices, setSalesInvoices] = useState<ERPTransactionRecord[]>(() => getStoredSalesInvoices());
  const [purchaseOrders, setPurchaseOrders] = useState<ERPTransactionRecord[]>(() => getStoredPurchaseOrders());
  const [purchaseInvoices, setPurchaseInvoices] = useState<ERPTransactionRecord[]>(() => getStoredPurchaseInvoices());

  // Expandable row tracking
  const [expandedTxProductId, setExpandedTxProductId] = useState<string | null>(null);
  const [activeTxTab, setActiveTxTab] = useState<'sales_invoice' | 'purchase_order' | 'purchase_invoice'>('sales_invoice');

  // Modals for See, Edit, Delete
  const [viewingTxRecord, setViewingTxRecord] = useState<ERPTransactionRecord | null>(null);
  const [editingTxRecord, setEditingTxRecord] = useState<ERPTransactionRecord | null>(null);
  const [deletingTxRecord, setDeletingTxRecord] = useState<ERPTransactionRecord | null>(null);

  // Edit form state
  const [editTxRefNo, setEditTxRefNo] = useState('');
  const [editTxPartyName, setEditTxPartyName] = useState('');
  const [editTxDateTime, setEditTxDateTime] = useState('');
  const [editTxGrandTotal, setEditTxGrandTotal] = useState<number>(0);
  const [editTxStatus, setEditTxStatus] = useState<'Paid' | 'Partial' | 'Unpaid' | 'Completed' | 'Pending'>('Paid');
  const [editTxPaymentMethod, setEditTxPaymentMethod] = useState('');
  const [editTxNotes, setEditTxNotes] = useState('');

  // Cross-component sync
  useEffect(() => {
    saveStoredSalesInvoices(salesInvoices);
  }, [salesInvoices]);

  useEffect(() => {
    saveStoredPurchaseOrders(purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    saveStoredPurchaseInvoices(purchaseInvoices);
  }, [purchaseInvoices]);

  useEffect(() => {
    const handleSync = () => {
      setSalesInvoices(getStoredSalesInvoices());
      setPurchaseOrders(getStoredPurchaseOrders());
      setPurchaseInvoices(getStoredPurchaseInvoices());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('erp_transactions_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('erp_transactions_updated', handleSync);
    };
  }, []);

  // Helper to get or auto-link records for any product
  const getProductTransactions = (product: Product) => {
    let prodSales = filterRecordsForProduct(salesInvoices, product);
    let prodPO = filterRecordsForProduct(purchaseOrders, product);
    let prodPI = filterRecordsForProduct(purchaseInvoices, product);

    const cost = product.costPrice || product.basePurchaseCost || Math.round(product.price * 0.8);

    if (prodSales.length === 0) {
      prodSales = [
        {
          id: `gen-sinv-${product.id}`,
          type: 'sales_invoice',
          refNo: `INV-${product.sku.replace(/[^a-zA-Z0-9]/g, '')}-901`,
          dateTime: '2026-10-04 14:10',
          partyName: 'Counter Customer (Walk-in)',
          partyType: 'Customer',
          relatedSku: product.sku,
          relatedProductId: product.id,
          itemsCount: 1,
          itemsList: [{ name: product.name, qty: 1, unitPrice: product.price, total: product.price, sku: product.sku }],
          grossAmount: product.price,
          taxAmount: Math.round(product.price * 0.05),
          grandTotal: Math.round(product.price * 1.05),
          status: 'Paid',
          paymentMethod: 'Cash',
          notes: `Sales invoice for ${product.name}`,
          createdBy: 'Forhad',
        },
      ];
    }

    if (prodPO.length === 0) {
      prodPO = [
        {
          id: `gen-po-${product.id}`,
          type: 'purchase_order',
          refNo: `PO-${product.sku.replace(/[^a-zA-Z0-9]/g, '')}-101`,
          dateTime: '2026-09-25 11:00',
          partyName: 'Central Hardware Distributor',
          partyType: 'Supplier',
          relatedSku: product.sku,
          relatedProductId: product.id,
          itemsCount: 1,
          itemsList: [{ name: product.name, qty: 5, unitPrice: cost, total: cost * 5, sku: product.sku }],
          grossAmount: cost * 5,
          taxAmount: Math.round(cost * 5 * 0.05),
          grandTotal: Math.round(cost * 5 * 1.05),
          status: 'Pending',
          paymentMethod: 'Bank Transfer',
          notes: `Standard PO replenishment for ${product.sku}`,
          createdBy: 'Forhad',
        },
      ];
    }

    if (prodPI.length === 0) {
      prodPI = [
        {
          id: `gen-pinv-${product.id}`,
          type: 'purchase_invoice',
          refNo: `PINV-${product.sku.replace(/[^a-zA-Z0-9]/g, '')}-201`,
          dateTime: '2026-09-28 16:30',
          partyName: 'Global Supplier Imports BD',
          partyType: 'Supplier',
          relatedSku: product.sku,
          relatedProductId: product.id,
          itemsCount: 1,
          itemsList: [{ name: product.name, qty: 4, unitPrice: cost, total: cost * 4, sku: product.sku }],
          grossAmount: cost * 4,
          taxAmount: Math.round(cost * 4 * 0.05),
          grandTotal: Math.round(cost * 4 * 1.05),
          status: 'Paid',
          paymentMethod: 'Cash on Delivery',
          notes: `Direct purchase invoice received for ${product.name}`,
          createdBy: 'Forhad',
        },
      ];
    }

    return {
      sales: prodSales,
      po: prodPO,
      pi: prodPI,
      totalCount: prodSales.length + prodPO.length + prodPI.length,
    };
  };

  // --- SEE TRANSACTION HANDLER ---
  const handleSeeTransaction = (rec: ERPTransactionRecord) => {
    playClickSound();
    setViewingTxRecord(rec);
  };

  // --- PRINT TRANSACTION HANDLER ---
  const handlePrintTransaction = (rec: ERPTransactionRecord) => {
    playClickSound();
    setViewingTxRecord(rec);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // --- EDIT TRANSACTION HANDLERS ---
  const handleOpenEditTransaction = (rec: ERPTransactionRecord) => {
    playClickSound();
    setEditingTxRecord(rec);
  };

  const handleSaveUpdatedTxRecord = (updated: ERPTransactionRecord) => {
    playCashDrawerDing();

    if (updated.type === 'sales_invoice') {
      setSalesInvoices((prev) => {
        const exists = prev.some((r) => r.id === updated.id);
        const next = exists ? prev.map((r) => (r.id === updated.id ? updated : r)) : [updated, ...prev];
        saveStoredSalesInvoices(next);
        return next;
      });
    } else if (updated.type === 'purchase_order') {
      setPurchaseOrders((prev) => {
        const exists = prev.some((r) => r.id === updated.id);
        const next = exists ? prev.map((r) => (r.id === updated.id ? updated : r)) : [updated, ...prev];
        saveStoredPurchaseOrders(next);
        return next;
      });
    } else if (updated.type === 'purchase_invoice') {
      setPurchaseInvoices((prev) => {
        const exists = prev.some((r) => r.id === updated.id);
        const next = exists ? prev.map((r) => (r.id === updated.id ? updated : r)) : [updated, ...prev];
        saveStoredPurchaseInvoices(next);
        return next;
      });
    }

    window.dispatchEvent(new Event('erp_transactions_updated'));
    setEditingTxRecord(null);
  };

  // --- DELETE TRANSACTION HANDLERS ---
  const handleOpenDeleteTransaction = (rec: ERPTransactionRecord) => {
    playClickSound();
    setDeletingTxRecord(rec);
  };

  const handleConfirmDeleteTransaction = () => {
    if (!deletingTxRecord) return;
    playBarcodeBeep();

    if (deletingTxRecord.type === 'sales_invoice') {
      setSalesInvoices((prev) => {
        const next = prev.filter((r) => r.id !== deletingTxRecord.id);
        saveStoredSalesInvoices(next);
        return next;
      });
    } else if (deletingTxRecord.type === 'purchase_order') {
      setPurchaseOrders((prev) => {
        const next = prev.filter((r) => r.id !== deletingTxRecord.id);
        saveStoredPurchaseOrders(next);
        return next;
      });
    } else if (deletingTxRecord.type === 'purchase_invoice') {
      setPurchaseInvoices((prev) => {
        const next = prev.filter((r) => r.id !== deletingTxRecord.id);
        saveStoredPurchaseInvoices(next);
        return next;
      });
    }

    window.dispatchEvent(new Event('erp_transactions_updated'));
    setDeletingTxRecord(null);
  };

  const handlePrintStockReport = () => {
    playClickSound();
    setPrintItem(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintSingleItem = (p: Product) => {
    playClickSound();
    setPrintItem(p);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  const filtered = products.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.specs && p.specs.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // --- 1. Edit Product Details Handlers ---
  const handleOpenEditModal = (p: Product) => {
    playClickSound();
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditPrice(p.price);
    setEditWarranty(p.warrantyDays !== undefined ? p.warrantyDays : 15);
    setEditSpecs(p.specs || '');
    setEditUnit(p.unit || 'Unit');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    playBarcodeBeep();
    const updated: Product = {
      ...editingProduct,
      name: editName.trim(),
      category: editCategory,
      price: editPrice,
      warrantyDays: editWarranty,
      specs: editSpecs.trim(),
      unit: editUnit.trim() || 'Unit',
      // Stock quantity remains untouched
    };

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setEditingProduct(null);
  };

  // --- 2. Update Serial Numbers Handlers ---
  const handleOpenSerialsModal = (p: Product) => {
    playClickSound();
    setSerialProduct(p);
    setCurrentSerials(p.serials ? [...p.serials] : []);
    setSerialInput('');
  };

  const handleAddSerial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serialInput.trim()) return;

    playBarcodeBeep();
    const newItems = serialInput
      .split(/[\n,]/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0 && !currentSerials.includes(s));

    setCurrentSerials((prev) => [...prev, ...newItems]);
    setSerialInput('');
  };

  const handleRemoveSerial = (index: number) => {
    playClickSound();
    setCurrentSerials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAutoGenerateSerials = () => {
    if (!serialProduct) return;
    playBarcodeBeep();
    const needed = Math.max(0, serialProduct.stock - currentSerials.length);
    if (needed === 0) return;

    const prefix = serialProduct.sku || 'SN';
    const generated: string[] = [];
    for (let i = 0; i < needed; i++) {
      generated.push(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setCurrentSerials((prev) => [...prev, ...generated]);
  };

  const handleSaveSerials = () => {
    if (!serialProduct) return;
    playCashDrawerDing();

    const updated: Product = {
      ...serialProduct,
      serials: currentSerials,
      // Physical stock quantity remains unchanged
    };

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setSerialProduct(null);
  };

  // --- 3. Add Additional Components (RAM & SSD Upgrade) Handlers ---
  const handleOpenUpgradeModal = (p: Product) => {
    playClickSound();
    setUpgradingProduct(p);
    setUpgradeType('RAM');
    setComponentDescription('+16GB DDR4 3200MHz RAM');
    setAdditionalCost(4500);
    setTargetSerial(p.serials && p.serials.length > 0 ? p.serials[0] : 'ALL');
  };

  const handleSelectUpgradePreset = (type: 'RAM' | 'SSD' | 'CUSTOM', desc: string, cost: number) => {
    playClickSound();
    setUpgradeType(type);
    setComponentDescription(desc);
    setAdditionalCost(cost);
  };

  const handleApplyComponentUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradingProduct || !componentDescription.trim() || additionalCost < 0) return;

    playCashDrawerDing();

    // 1. The cost of the existing component under the same SKU WILL NOT CHANGE:
    const basePurchaseCost =
      upgradingProduct.basePurchaseCost !== undefined
        ? upgradingProduct.basePurchaseCost
        : (upgradingProduct.costPrice || Math.round(upgradingProduct.price * 0.8));

    // 2. Instead, the new component's cost will be added to the total purchase cost:
    const newAdditionalComponentsCost =
      (upgradingProduct.additionalComponentsCost || 0) + additionalCost;
    const newTotalPurchaseCost = basePurchaseCost + newAdditionalComponentsCost;

    // 3. Selling price adjustment (reflecting the extra component's market value)
    const newSellingPrice = upgradingProduct.price + additionalCost;

    // 4. Append component upgrade detail to specifications
    const serialInfo = targetSerial && targetSerial !== 'ALL' ? ` [Serial: ${targetSerial}]` : '';
    const upgradeTag = `[Component Added: ${componentDescription.trim()}${serialInfo} (+৳${additionalCost.toLocaleString()} Cost)]`;
    const updatedSpecs = upgradingProduct.specs
      ? `${upgradingProduct.specs} · ${upgradeTag}`
      : upgradeTag;

    const newInstalledComp: InstalledComponent = {
      id: `comp-${Date.now()}`,
      name: componentDescription.trim(),
      type: upgradeType,
      cost: additionalCost,
      serialNo: targetSerial !== 'ALL' ? targetSerial : undefined,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updated: Product = {
      ...upgradingProduct,
      // Existing component base cost under same SKU WILL NOT CHANGE:
      basePurchaseCost,
      // New component cost is ADDED to the total purchase cost:
      costPrice: newTotalPurchaseCost,
      additionalComponentsCost: newAdditionalComponentsCost,
      price: newSellingPrice,
      specs: updatedSpecs,
      installedComponents: [
        ...(upgradingProduct.installedComponents || []),
        newInstalledComp,
      ],
      // REST ALL QUANTITY WILL REMAIN STRICTLY THE SAME:
      stock: upgradingProduct.stock,
    };

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }

    setUpgradingProduct(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ERP</span>
            <span>›</span>
            <span>Core Operations</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              3. INVENTORY — মজুদ স্টক ও পণ্য
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            <span>Master Inventory &amp; Products</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Refresh Stock"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtabs Bar (3.1 to 3.5) */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '3.1', label: '3.1 Products', badge: `${products.length} items` },
          { id: '3.2', label: '3.2 Stock In / Out', badge: 'Movement' },
          { id: '3.3', label: '3.3 Stock Transfer', badge: 'Warehouse' },
          { id: '3.4', label: '3.4 Stock Adjustment', badge: 'Adjust' },
          { id: '3.5', label: '3.5 Stock Report', badge: 'Valuation' },
        ].map((tab) => {
          const isActive = currentInvTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setCurrentInvTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {currentInvTab === '3.2' ? (
        <StockInOutTab products={products} />
      ) : currentInvTab === '3.3' ? (
        <StockTransferTab products={products} />
      ) : currentInvTab === '3.4' ? (
        <StockAdjustmentTab products={products} onUpdateProductStock={onUpdateProductStock} />
      ) : currentInvTab === '3.5' ? (
        <StockValuationReportTab products={products} />
      ) : (
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Physical Units</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {totalUnits} <span className="text-xs text-slate-400 font-normal">items</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Stock quantity remains strictly unchanged during component upgrades</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Inventory Value</span>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrency(totalValuation)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dynamically updated upon extra component additions</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Low Stock Alerts (&lt;10)</span>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{lowStockCount} Products</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Reorder recommendations</p>
          </div>
        </div>

        {/* Search & Filter & Print Option */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product inventory, SKU, specs, upgrades..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Laptops', 'Components', 'Accessories', 'Services'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Print Option in Controls */}
            <button
              type="button"
              onClick={handlePrintStockReport}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
              title="Print Stock Report with SKU, Catagory, Item, Serial Numbers, QTY, Unit Price, and Total Price"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Products Stock Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
                  {/* Selector 1: th:nth-of-type(1) -> SKU */}
                  <th className="py-3 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>SKU</span>
                    </div>
                  </th>

                  {/* Selector 2: th:nth-of-type(2) -> Catagory */}
                  <th className="py-3 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Catagory</span>
                    </div>
                  </th>

                  {/* Selector 3: th:nth-of-type(3) -> Item */}
                  <th className="py-3 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Item</span>
                    </div>
                  </th>

                  {/* Selector 4: th:nth-of-type(4) -> Serial Numbers */}
                  <th className="py-3 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span>Serial Numbers</span>
                    </div>
                  </th>

                  {/* Selector 5: th:nth-of-type(5) -> QTY */}
                  <th className="py-3 px-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>QTY</span>
                    </div>
                  </th>

                  {/* Selector 6: th:nth-of-type(6) -> Unit Price */}
                  <th className="py-3 px-3.5 font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Unit Price</span>
                    </div>
                  </th>

                  {/* Column 7: Total Price */}
                  <th className="py-3 px-3.5 text-right font-bold text-slate-700 dark:text-slate-200">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Total Price</span>
                    </div>
                  </th>

                  {/* Column 8: Actions */}
                  <th className="py-3 px-3.5 text-center font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 border-l border-indigo-100 dark:border-indigo-900">
                    <div className="flex items-center justify-center gap-1.5 px-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => {
                  const lineValue = p.stock * p.price;
                  const isLow = p.stock < 10;
                  const serialCount = p.serials?.length || 0;
                  const baseCost = p.basePurchaseCost ?? (p.costPrice || Math.round(p.price * 0.8));
                  const totalPurchaseCost = p.costPrice || baseCost;
                  const isLaptop =
                    (p.category && p.category.toLowerCase().includes('laptop')) ||
                    p.iconType === 'laptop' ||
                    p.name.toLowerCase().includes('laptop') ||
                    p.name.toLowerCase().includes('surface') ||
                    p.name.toLowerCase().includes('macbook') ||
                    p.name.toLowerCase().includes('notebook') ||
                    p.name.toLowerCase().includes('thinkpad');
                  const tx = getProductTransactions(p);
                  const isExpanded = expandedTxProductId === p.id;
                  const currentTabList =
                    activeTxTab === 'sales_invoice'
                      ? tx.sales
                      : activeTxTab === 'purchase_order'
                      ? tx.po
                      : tx.pi;

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                        {/* 1. SKU */}
                        <td className="py-3 px-3.5 font-mono">
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            {p.sku}
                          </div>
                        {p.barcode && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {p.barcode}
                          </div>
                        )}
                      </td>

                      {/* 2. Catagory */}
                      <td className="py-3 px-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* 3. Item */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {p.name}
                        </div>
                        {p.specs && (
                          <div
                            className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]"
                            title={p.specs}
                          >
                            {p.specs}
                          </div>
                        )}
                        {p.installedComponents && p.installedComponents.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {p.installedComponents.map((comp) => (
                              <span
                                key={comp.id}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                title={`Component: ${comp.name} · Added to purchase cost: +৳${comp.cost.toLocaleString()}${comp.serialNo ? ` · Serial: ${comp.serialNo}` : ''}`}
                              >
                                ⚡ {comp.name} {comp.serialNo ? `(${comp.serialNo})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 4. Serial Numbers */}
                      <td className="py-3 px-3.5">
                        {p.serials && p.serials.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                                {p.serials.length} Tracked
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenSerialsModal(p)}
                                className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer font-semibold"
                                title="Click to view and manage all serial numbers"
                              >
                                View all
                              </button>
                            </div>
                            <div
                              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]"
                              title={p.serials.join(', ')}
                            >
                              {p.serials.slice(0, 2).join(', ')}
                              {p.serials.length > 2 ? ` (+${p.serials.length - 2} more)` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Non-serialized</span>
                        )}
                      </td>

                      {/* 5. QTY */}
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {p.stock} {p.unit || 'Units'}
                        </span>
                      </td>

                      {/* 6. Unit Price */}
                      <td className="py-3 px-3.5 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {formatCurrency(p.price)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Cost:</span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {formatCurrency(totalPurchaseCost)}
                          </strong>
                          {p.additionalComponentsCost ? (
                            <span
                              className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                              title={`Base SKU Cost: ৳${baseCost.toLocaleString()} (Unchanged) + Added Component: ৳${p.additionalComponentsCost.toLocaleString()}`}
                            >
                              +৳{p.additionalComponentsCost.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* 7. Total Price */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        <div>{formatCurrency(lineValue)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Valuation
                        </div>
                      </td>

                      {/* 8. Actions (Edit for all items; Serial and RAM+SSD upgrade only for laptops) */}
                      <td className="py-3 px-3.5 text-center border-l border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* 1. Edit Product Details (For all items) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                            title="Edit product details, name, category, and base price"
                          >
                            <Edit2 className="w-3 h-3 text-blue-500" />
                            <span>Edit</span>
                          </button>

                          {/* 2. Update Serial Number (Only for Laptops) */}
                          {isLaptop && (
                            <button
                              type="button"
                              onClick={() => handleOpenSerialsModal(p)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                              title="Update and manage serial numbers for this laptop"
                            >
                              <Hash className="w-3 h-3 text-violet-500" />
                              <span>Serials ({serialCount})</span>
                            </button>
                          )}

                          {/* 3. Add Additional Components - RAM & SSD Upgrade (Only for Laptops) */}
                          {isLaptop && (
                            <button
                              type="button"
                              onClick={() => handleOpenUpgradeModal(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/90 dark:border-emerald-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                              title="RAM & SSD component upgrade for this laptop"
                            >
                              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                              <span className="font-extrabold text-[11px] tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 dark:from-emerald-300 dark:via-teal-200 dark:to-emerald-400 bg-clip-text text-transparent group-hover:from-emerald-950 group-hover:to-teal-950 dark:group-hover:from-white dark:group-hover:to-emerald-200 transition-all drop-shadow-2xs select-none">
                                + RAM / SSD Upgrade
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      )}

      {/* 1. EDIT PRODUCT DETAILS MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-200" />
                <span>Edit Product Details</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as 'Laptops' | 'Components' | 'Accessories' | 'Services')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Components">Components</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Services">Services</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Base Unit Price (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Warranty Days
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="Unit / Pcs / Set"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Specifications &amp; Features
                </label>
                <textarea
                  rows={2}
                  value={editSpecs}
                  onChange={(e) => setEditSpecs(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>Current Stock: <strong>{editingProduct.stock} {editingProduct.unit || 'Units'}</strong></span>
                <span className="font-semibold text-slate-500">Quantity will remain unchanged</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPDATE SERIAL NUMBERS MODAL */}
      {serialProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-violet-600 text-white p-4 flex items-center justify-between font-bold text-sm shrink-0">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-violet-200" />
                <span>Update Serial Numbers · {serialProduct.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSerialProduct(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-[11px] text-violet-900 dark:text-violet-200">
                <div>
                  Physical Stock: <strong>{serialProduct.stock} Units</strong> · SKU: <span className="font-mono">{serialProduct.sku}</span>
                </div>
                <div className="font-mono font-bold">
                  {currentSerials.length} / {serialProduct.stock} Registered
                </div>
              </div>

              {/* Add New Serial Form */}
              <form onSubmit={handleAddSerial} className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Add Serial Number (Single or Comma-separated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="e.g. SN-882190, SN-882191..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-xs uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Auto Generate Button */}
              {currentSerials.length < serialProduct.stock && (
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500">
                    Missing {serialProduct.stock - currentSerials.length} serials for available inventory stock.
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSerials}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded font-semibold text-[11px] cursor-pointer"
                  >
                    Auto-Fill Remaining
                  </button>
                </div>
              )}

              {/* Registered Serials Chips */}
              <div>
                <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Registered Serial Numbers ({currentSerials.length}):
                </span>
                {currentSerials.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    No individual serial numbers tracked yet. Add one above.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                    {currentSerials.map((sn, idx) => {
                      const attachedComponents = (serialProduct.installedComponents || []).filter(
                        (c) => c.serialNo === sn
                      );
                      const baseCost = serialProduct.basePurchaseCost ?? (serialProduct.costPrice || Math.round(serialProduct.price * 0.8));
                      const totalExtraCost = attachedComponents.reduce((acc, c) => acc + c.cost, 0);

                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 shadow-2xs"
                        >
                          <span className="font-semibold">{sn}</span>
                          {attachedComponents.map((comp) => (
                            <span
                              key={comp.id}
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                              title={`Existing SKU base cost: ৳${baseCost.toLocaleString()} (Unchanged) + ${comp.name}: ৳${comp.cost.toLocaleString()} = Total Purchase Cost: ৳${(baseCost + totalExtraCost).toLocaleString()}`}
                            >
                              ⚡ {comp.name} (+৳{comp.cost.toLocaleString()})
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleRemoveSerial(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                            title="Remove Serial"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSerialProduct(null)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSerials}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Serial Numbers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD ADDITIONAL COMPONENTS (RAM & SSD UPGRADE) MODAL */}
      {upgradingProduct && (() => {
        const baseCost =
          upgradingProduct.basePurchaseCost !== undefined
            ? upgradingProduct.basePurchaseCost
            : (upgradingProduct.costPrice || Math.round(upgradingProduct.price * 0.8));
        const prevAdditionalCost = upgradingProduct.additionalComponentsCost || 0;
        const totalPurchaseCost = baseCost + prevAdditionalCost + additionalCost;
        const adjustedSellingPrice = upgradingProduct.price + additionalCost;
        const serialsList = upgradingProduct.serials || [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-emerald-600 text-white p-4 flex items-center justify-between font-bold text-sm shrink-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-200" />
                  <span>Add Extra Component · {upgradingProduct.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUpgradingProduct(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyComponentUpgrade} className="p-5 space-y-4 text-xs">
                {/* Product Context Banner */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {upgradingProduct.name}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      SKU: {upgradingProduct.sku}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>
                      Stock Quantity: <strong>{upgradingProduct.stock} {upgradingProduct.unit || 'Units'}</strong> (Will remain unchanged)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {serialsList.length > 0 ? `${serialsList.length} Serials Tracked` : 'Non-Serialized'}
                    </span>
                  </div>
                </div>

                {/* Serial-Tracked Unit Target Selector */}
                {serialsList.length > 0 && (
                  <div className="p-3 bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Serial-Tracked Unit (SKU: {upgradingProduct.sku})</span>
                      </label>
                      <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700">
                        {serialsList.length} Serials Tracked
                      </span>
                    </div>
                    <select
                      value={targetSerial}
                      onChange={(e) => setTargetSerial(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 rounded-lg p-2 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="ALL">Apply to Entire SKU Batch (All {upgradingProduct.stock} Units)</option>
                      {serialsList.map((sn) => (
                        <option key={sn} value={sn}>
                          Serial: {sn} (Single Tracked Unit)
                        </option>
                      ))}
                    </select>
                    <p className="text-[10.5px] text-violet-800 dark:text-violet-300 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>The cost of the existing component under SKU <strong>{upgradingProduct.sku}</strong> will not change; instead, the new component's cost is added to total purchase cost.</span>
                    </p>
                  </div>
                )}

                {/* Component Category Selector */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Select Component Upgrade Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectUpgradePreset('RAM', '+16GB DDR4 3200MHz RAM', 4500)}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                        upgradeType === 'RAM'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Additional RAM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectUpgradePreset('SSD', '+512GB NVMe M.2 High-Speed SSD', 3800)}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                        upgradeType === 'SSD'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Additional SSD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectUpgradePreset('CUSTOM', 'Custom Component Upgrade', 3000)}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                        upgradeType === 'CUSTOM'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Custom</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets Chips */}
                {upgradeType === 'RAM' ? (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 mb-1 block">RAM Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '+8GB DDR4 (৳2,500)', desc: '+8GB DDR4 3200MHz RAM', cost: 2500 },
                        { label: '+16GB DDR4 (৳4,500)', desc: '+16GB DDR4 3200MHz RAM', cost: 4500 },
                        { label: '+16GB DDR5 (৳6,500)', desc: '+16GB DDR5 4800MHz RAM', cost: 6500 },
                        { label: '+32GB DDR5 (৳12,500)', desc: '+32GB DDR5 5600MHz RAM', cost: 12500 },
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectUpgradePreset('RAM', preset.desc, preset.cost)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                            componentDescription === preset.desc && additionalCost === preset.cost
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : upgradeType === 'SSD' ? (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 mb-1 block">SSD Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '+256GB NVMe (৳2,200)', desc: '+256GB NVMe M.2 Gen3 SSD', cost: 2200 },
                        { label: '+512GB NVMe (৳3,800)', desc: '+512GB NVMe M.2 Gen4 SSD', cost: 3800 },
                        { label: '+1TB NVMe (৳6,800)', desc: '+1TB Kingston NVMe M.2 SSD', cost: 6800 },
                        { label: '+2TB NVMe (৳13,500)', desc: '+2TB Samsung 980 Pro NVMe SSD', cost: 13500 },
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectUpgradePreset('SSD', preset.desc, preset.cost)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                            componentDescription === preset.desc && additionalCost === preset.cost
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Component Name / Description */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Component Upgrade Description *
                  </label>
                  <input
                    type="text"
                    value={componentDescription}
                    onChange={(e) => setComponentDescription(e.target.value)}
                    placeholder="e.g. +16GB DDR4 RAM or +512GB NVMe SSD"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
                    required
                  />
                </div>

                {/* Additional Cost Input */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    New Component Cost to Add to Total Purchase Cost (৳) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 rounded-lg p-2 font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    The existing component cost will remain unchanged; this new component's cost is added directly to total purchase cost.
                  </span>
                </div>

                {/* Dynamic Accounting & Valuation Breakdown Card */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Component Cost &amp; Total Purchase Cost Adjustment:</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-300 text-emerald-700 dark:text-emerald-400">
                      SKU: {upgradingProduct.sku}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-emerald-200 dark:border-emerald-800/80">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                        <span>Existing Component Cost</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                        {formatCurrency(baseCost)}
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        ✓ Will NOT change under same SKU
                      </span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      <span className="text-[10px] text-emerald-600 font-bold block uppercase">
                        + New Component Cost
                      </span>
                      <div className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                        +{formatCurrency(additionalCost)}
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Added to Total Purchase Cost
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        New Total Purchase Cost:
                      </span>
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(totalPurchaseCost)}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Base SKU Cost: {formatCurrency(baseCost)} (Unchanged) + Components: {formatCurrency(prevAdditionalCost + additionalCost)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase block">
                        Adjusted Selling Price:
                      </span>
                      <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                        {formatCurrency(adjustedSellingPrice)}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        (Inventory Valuation: {formatCurrency(adjustedSellingPrice * upgradingProduct.stock)})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span>Physical Inventory Stock:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {upgradingProduct.stock} {upgradingProduct.unit || 'Units'} (Rest all quantity remains strictly same)
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setUpgradingProduct(null)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Apply Upgrade &amp; Add to Purchase Cost</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      {/* 4. SEE TRANSACTION DETAILS MODAL (FULL PRINTABLE COMMERCIAL VOUCHER) */}
      {viewingTxRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none animate-in fade-in-50 duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {viewingTxRecord.type === 'sales_invoice'
                    ? 'Sales Invoice Document'
                    : viewingTxRecord.type === 'purchase_order'
                    ? 'Purchase Order Specification'
                    : 'Purchase Invoice Voucher'} · {viewingTxRecord.refNo}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. VIEW */}
                <button
                  type="button"
                  onClick={() => playClickSound()}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="View full voucher document"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {/* 2. EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingTxRecord;
                    setViewingTxRecord(null);
                    handleOpenEditTransaction(rec);
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit this record"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* 3. PRINT */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Print this voucher"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* 4. DELETE */}
                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingTxRecord;
                    setViewingTxRecord(null);
                    handleOpenDeleteTransaction(rec);
                  }}
                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete this record permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingTxRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">NextGen Computers ERP &amp; POS</h4>
                  <p className="text-[11px] text-slate-500">Multi-Branch Retail &amp; Enterprise IT Distribution</p>
                  <p className="text-[10px] text-slate-400">Dhaka Central Hub · Support: +880 1700-123456</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">VOUCHER NUMBER</div>
                  <div className="font-bold text-sm text-blue-600 dark:text-sky-400">{viewingTxRecord.refNo}</div>
                  <div className="text-[11px] text-slate-500">{viewingTxRecord.dateTime}</div>
                </div>
              </div>

              {/* Party Information */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {viewingTxRecord.partyType === 'Customer' ? 'Customer Details' : 'Supplier / Vendor Details'}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{viewingTxRecord.partyName}</div>
                  {viewingTxRecord.partyPhone && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{viewingTxRecord.partyPhone}</div>
                  )}
                  {viewingTxRecord.relatedSku && (
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-1 font-bold">
                      SKU: {viewingTxRecord.relatedSku}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment &amp; Status</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Method: {viewingTxRecord.paymentMethod}
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      {viewingTxRecord.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewingTxRecord.itemsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{item.qty}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Gross Amount:</span>
                    <span className="font-mono">{formatCurrency(viewingTxRecord.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax / VAT (5%):</span>
                    <span className="font-mono">{formatCurrency(viewingTxRecord.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blue-600 dark:text-sky-400">
                      {formatCurrency(viewingTxRecord.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remaining Balance Section (Calculated after this transaction) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50/50 dark:from-slate-850 dark:to-amber-950/20 border border-amber-300 dark:border-amber-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Previous Account Balance:</span>
                  <span className="font-mono font-bold">{formatCurrency(viewingTxRecord.partyType === 'Customer' ? 15000 : 45000)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Transaction Amount:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(viewingTxRecord.grandTotal)}</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200 dark:border-amber-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                      REMAINING BALANCE / OUTSTANDING DUE (অবশিষ্ট বকেয়া)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Party balance calculated right after this transaction
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                      {formatCurrency((viewingTxRecord.partyType === 'Customer' ? 15000 : 45000) + (viewingTxRecord.status === 'Paid' ? 0 : viewingTxRecord.grandTotal))}
                    </span>
                  </div>
                </div>
              </div>

              {viewingTxRecord.notes && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">Notes &amp; Particulars:</strong>
                  {viewingTxRecord.notes}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{viewingTxRecord.refNo}</span>
                <span>•</span>
                <span>{viewingTxRecord.dateTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingTxRecord;
                    setViewingTxRecord(null);
                    handleOpenDeleteTransaction(rec);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const rec = viewingTxRecord;
                    setViewingTxRecord(null);
                    handleOpenEditTransaction(rec);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingTxRecord(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Close Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EDIT TRANSACTION RECORD MODAL (ASKS WHICH PART TO MODIFY) */}
      {editingTxRecord && (
        <EditInvoiceModal
          invoice={editingTxRecord}
          isOpen={!!editingTxRecord}
          onClose={() => setEditingTxRecord(null)}
          onSave={handleSaveUpdatedTxRecord}
        />
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingTxRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Delete Transaction Record?</h4>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-1">
              <div className="font-mono font-bold text-rose-700 dark:text-rose-400">
                {deletingTxRecord.refNo}
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                Party: <strong>{deletingTxRecord.partyName}</strong>
              </div>
              <div className="font-mono text-slate-600 dark:text-slate-400 font-bold">
                Grand Total: {formatCurrency(deletingTxRecord.grandTotal)}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingTxRecord(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTransaction}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 7. PRINT ISOLATION REPORT DOCUMENT */}
      <div id="inventory-report-print-area" className="hidden print:block printable-document">
        {printItem ? (
          /* Single Item Stock & Serial Slip */
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase text-slate-900">
                  PRODUCT STOCK &amp; SERIAL SPECIFICATION SLIP
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">ERP Master Catalog Item Record</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <div><strong>Printed:</strong> {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</div>
                <div><strong>SKU:</strong> {printItem.sku}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border border-slate-300 rounded-lg text-xs mb-4">
              <div>
                <div className="text-slate-500 font-bold uppercase text-[10px]">Product Name:</div>
                <div className="text-sm font-bold">{printItem.name}</div>
                <div className="text-slate-500 font-bold uppercase text-[10px] mt-2">Category:</div>
                <div>{printItem.category}</div>
                <div className="text-slate-500 font-bold uppercase text-[10px] mt-2">Specifications:</div>
                <div>{printItem.specs || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold uppercase text-[10px]">Current Physical Stock:</div>
                <div className="text-sm font-bold font-mono">{printItem.stock} {printItem.unit || 'Units'}</div>
                <div className="text-slate-500 font-bold uppercase text-[10px] mt-2">Unit Selling Price:</div>
                <div className="text-sm font-bold font-mono text-indigo-700">{formatCurrency(printItem.price)}</div>
                <div className="text-slate-500 font-bold uppercase text-[10px] mt-2">Total Line Valuation:</div>
                <div className="text-sm font-bold font-mono">{formatCurrency(printItem.stock * printItem.price)}</div>
              </div>
            </div>

            {printItem.installedComponents && printItem.installedComponents.length > 0 && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Installed Additional Components:</span>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                  {printItem.installedComponents.map((c) => (
                    <li key={c.id}>
                      {c.name} {c.serialNo ? `[Serial: ${c.serialNo}]` : ''} - Cost: +৳{c.cost.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="font-bold text-xs block mb-1.5">Registered Serial Numbers ({printItem.serials?.length || 0}):</span>
              {printItem.serials && printItem.serials.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-xs font-mono p-2 border border-slate-300 rounded">
                  {printItem.serials.map((sn, idx) => (
                    <div key={idx} className="p-1 bg-slate-100 border border-slate-200 rounded">
                      {idx + 1}. {sn}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No individual serial numbers tracked for this SKU.</p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 text-center text-xs text-slate-500">
              <div className="border-t border-slate-400 pt-1 mt-6">Inventory Store Keeper</div>
              <div className="border-t border-slate-400 pt-1 mt-6">Authorised Signatory</div>
            </div>
          </div>
        ) : (
          /* Full Inventory Stock Valuation Report */
          <div>
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  INVENTORY VALUATION &amp; STOCK REPORT
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  ERP Master Stock, Serial Numbers &amp; Cost Audit Statement
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Category:</strong> {categoryFilter}</div>
                <div><strong>Total SKUs:</strong> {filtered.length}</div>
              </div>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-100 border border-slate-300 rounded text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Product Lines:</span>
                <div className="text-base font-bold font-mono">{filtered.length} SKUs</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Physical Stock:</span>
                <div className="text-base font-bold font-mono">{totalUnits} Units</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Stock Valuation:</span>
                <div className="text-base font-bold font-mono">{formatCurrency(totalValuation)}</div>
              </div>
            </div>

            {/* Print Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-900 uppercase font-bold text-[10px] border-b border-slate-300">
                  <th className="py-2 px-2 border-r border-slate-300">SKU</th>
                  <th className="py-2 px-2 border-r border-slate-300">Catagory</th>
                  <th className="py-2 px-2 border-r border-slate-300">Item</th>
                  <th className="py-2 px-2 border-r border-slate-300">Serial Numbers</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">QTY</th>
                  <th className="py-2 px-2 text-right border-r border-slate-300">Unit Price</th>
                  <th className="py-2 px-2 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((p) => {
                  const lineVal = p.stock * p.price;
                  return (
                    <tr key={p.id}>
                      <td className="py-2 px-2 font-mono font-bold text-[11px] border-r border-slate-200">{p.sku}</td>
                      <td className="py-2 px-2 text-[11px] border-r border-slate-200">{p.category}</td>
                      <td className="py-2 px-2 border-r border-slate-200">
                        <div className="font-bold text-[11px]">{p.name}</div>
                        {p.specs && <div className="text-[10px] text-slate-600">{p.specs}</div>}
                        {p.installedComponents && p.installedComponents.length > 0 && (
                          <div className="text-[9px] text-emerald-800 mt-0.5">
                            ⚡ {p.installedComponents.map((c) => `${c.name} (+৳${c.cost.toLocaleString()})`).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px] border-r border-slate-200">
                        {p.serials && p.serials.length > 0 ? (
                          <div>
                            <div>{p.serials.slice(0, 3).join(', ')}{p.serials.length > 3 ? ` (+${p.serials.length - 3} more)` : ''}</div>
                            <span className="text-[9px] text-slate-500">({p.serials.length} registered)</span>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">{p.stock} {p.unit || 'Units'}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-slate-200">{formatCurrency(p.price)}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">{formatCurrency(lineVal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Print Signatures */}
            <div className="mt-8 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
              <div>
                <div className="border-t border-slate-400 pt-1 mt-6">Prepared By (Inventory Officer)</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 mt-6">Verified By (Store Manager)</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 mt-6">Approved By (Audit &amp; Finance)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
