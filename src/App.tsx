import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { ErpSidebar, ERPModule } from './components/navigation/ErpSidebar';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomerAndCartPanel } from './components/CustomerAndCartPanel';
import { PurchaseOrderPanel } from './components/purchase/PurchaseOrderPanel';
import { DirectPurchaseInvoicePanel } from './components/purchase/DirectPurchaseInvoicePanel';
import { PurchaseOrdersListModal } from './components/purchase/PurchaseOrdersListModal';
import { PurchaseInvoiceReceiptModal } from './components/purchase/PurchaseInvoiceReceiptModal';
import { ProductManagementView } from './components/products/ProductManagementView';
import { PurchaseManagementView } from './components/purchase/PurchaseManagementView';

// Module Views
import { ServiceManagementView } from './components/modules/ServiceManagementView';
import { WarrantyManagementView } from './components/modules/WarrantyManagementView';
import { InventoryStockView } from './components/modules/InventoryStockView';
import { ClientSetupView } from './components/modules/ClientSetupView';
import { MasterSetupView } from './components/modules/MasterSetupView';
import { AccountsSetupView } from './components/modules/AccountsSetupView';
import { FinanceRecordView } from './components/modules/FinanceRecordView';
import { PayrollView } from './components/modules/PayrollView';
import { ReportsView } from './components/modules/ReportsView';
import { UsersRoleView } from './components/modules/UsersRoleView';
import { CompanySettingsView } from './components/modules/CompanySettingsView';
import { SalesInvoicesView } from './components/modules/SalesInvoicesView';

import { SalesInvoiceSettingsModal } from './components/modals/SalesInvoiceSettingsModal';
import { PurchaseSettingsModal } from './components/modals/PurchaseSettingsModal';
import { CompanyLetterheadModal } from './components/modals/CompanyLetterheadModal';
import { GoogleDriveModal } from './components/modals/GoogleDriveModal';

import { CheckoutModal } from './components/modals/CheckoutModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { CashDrawerModal } from './components/modals/CashDrawerModal';
import { HeldOrdersModal } from './components/modals/HeldOrdersModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { QuickActionsModal } from './components/modals/QuickActionsModal';
import { WarrantyPolicyModal } from './components/modals/WarrantyPolicyModal';
import { WarrantyPolicySettings, DEFAULT_WARRANTY_POLICY } from './types/warranty';

import {
  Product,
  CartItem,
  GiftItem,
  Customer,
  HeldOrder,
  Transaction,
  CashDrawerState,
  ProductCategory,
} from './types/pos';
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseInvoice,
} from './types/purchase';

import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS } from './data/mockProducts';
import { INITIAL_SUPPLIERS } from './data/mockSuppliers';
import {
  loadStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  executeReceiveTransaction,
  executeDirectPurchaseTransaction,
} from './utils/purchaseService';
import { createQuotation } from './utils/quotationService';
import { playClickSound, playBarcodeBeep, playCashDrawerDing } from './utils/sound';
import { recordSaleTransaction } from './services/salesApi';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Cashier & Register
  const cashierName = 'Forhad';

  // Master ERP Module Navigation & Sidebar
  const [activeModule, setActiveModule] = useState<ERPModule>(() => {
    return (localStorage.getItem('nextgen_active_module') as ERPModule) || 'reports';
  });
  const [salesSubTab, setSalesSubTab] = useState<'pos' | 'invoice'>('pos');
  const [purchaseSubTab, setPurchaseSubTab] = useState<'direct' | 'po' | 'list'>('list');
  const [activeSubItem, setActiveSubItem] = useState<string>('7.1');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSalesInvoiceSettingsOpen, setIsSalesInvoiceSettingsOpen] = useState(false);
  const [isPurchaseSettingsOpen, setIsPurchaseSettingsOpen] = useState(false);
  const [isCompanyLetterheadOpen, setIsCompanyLetterheadOpen] = useState(false);

  const handleNewSaleShortcut = () => {
    setActiveModule('sales');
    setSalesSubTab('pos');
    setActiveSubItem('1.1');
    playClickSound();
  };

  const handleNewPurchaseShortcut = () => {
    setActiveModule('purchase');
    setPurchaseSubTab('direct');
    setActiveSubItem('1.2');
    playClickSound();
  };

  const handleCashReceiveShortcut = () => {
    setActiveModule('finance');
    setActiveSubItem('1.3');
    playCashDrawerDing();
  };

  const handleCashPayShortcut = () => {
    setActiveModule('finance');
    setActiveSubItem('1.4');
    playClickSound();
  };

  // Central Inventory & Product Catalog State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');

  // Sales POS State
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [orderMode, setOrderMode] = useState<'sale' | 'quote'>('sale');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0], // Microsoft Surface Laptop 4
      quantity: 1,
      discountType: 'percent',
      discountValue: 0,
    },
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const vatRate = 5; // 5% VAT rate
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  // Drawer State
  const [drawerState, setDrawerState] = useState<CashDrawerState>({
    isOpen: true,
    openedAt: '08:13',
    startingFloat: 10000,
    cashSales: 65000,
    cashIn: 0,
    cashOut: 0,
  });

  // Purchasing State
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier>(INITIAL_SUPPLIERS[0]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadStoredPurchaseOrders());
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [isReceiveMode, setIsReceiveMode] = useState<boolean>(false);
  const [isPOListOpen, setIsPOListOpen] = useState<boolean>(false);

  // Direct Purchase State
  const [directPurchaseItems, setDirectPurchaseItems] = useState<{
    product: Product;
    unitCost: number;
    quantity: number;
    taxRate: number;
    serials?: string[];
  }[]>([]);
  const [activePurchaseInvoice, setActivePurchaseInvoice] = useState<PurchaseInvoice | null>(null);
  const [isPurchaseInvoiceModalOpen, setIsPurchaseInvoiceModalOpen] = useState<boolean>(false);

  // Modals
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  // Warranty & Guarantee Policy State (Global)
  const [warrantyPolicy, setWarrantyPolicy] = useState<WarrantyPolicySettings>(() => {
    const saved = localStorage.getItem('nextgen_warranty_policy');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse warranty policy', e);
      }
    }
    return DEFAULT_WARRANTY_POLICY;
  });
  const [isWarrantyPolicyModalOpen, setIsWarrantyPolicyModalOpen] = useState<boolean>(false);

  const handleSaveWarrantyPolicy = (newPolicy: WarrantyPolicySettings) => {
    setWarrantyPolicy(newPolicy);
    localStorage.setItem('nextgen_warranty_policy', JSON.stringify(newPolicy));
  };

  // Sync Dark mode with HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist purchase orders
  useEffect(() => {
    saveStoredPurchaseOrders(purchaseOrders);
  }, [purchaseOrders]);

  // Persist active module
  useEffect(() => {
    localStorage.setItem('nextgen_active_module', activeModule);
  }, [activeModule]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (activeModule === 'sales' && cartItems.length > 0) {
          setIsCheckoutOpen(true);
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
        setIsReceiptOpen(false);
        setIsDrawerModalOpen(false);
        setIsHeldOrdersModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsNotificationsModalOpen(false);
        setIsQuickActionsModalOpen(false);
        setIsPOListOpen(false);
        setIsPurchaseInvoiceModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, activeModule]);

  // --------------------------------------------------------------------------
  // SALES CART HANDLERS
  // --------------------------------------------------------------------------
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            discountType: 'percent',
            discountValue: 0,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    playClickSound();
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, customPrice: newPrice } : item
      )
    );
  };

  const handleUpdateSerials = (productId: string, serials: string[]) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, selectedSerials: serials } : item
      )
    );
  };

  const handleUpdateGifts = (productId: string, gifts: GiftItem[]) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, selectedGifts: gifts } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    playClickSound();
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    playClickSound();
    setCartItems([]);
  };

  const handleCreateCustomer = (data: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  // Hold / Resume Order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;
    playClickSound();
    const newHeld: HeldOrder = {
      id: `hold-${Date.now()}`,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: selectedCustomer,
      items: [...cartItems],
      mode: orderMode,
      subtotal,
      discountTotal,
      tax: vatAmount,
      grandTotal,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    setCartItems([]);
  };

  const handleResumeOrder = (heldOrder: HeldOrder) => {
    playClickSound();
    setSelectedCustomer(heldOrder.customer);
    setCartItems(heldOrder.items);
    setOrderMode(heldOrder.mode);
    setHeldOrders((prev) => prev.filter((o) => o.id !== heldOrder.id));
    setIsHeldOrdersModalOpen(false);
  };

  const handleDeleteHeldOrder = (orderId: string) => {
    playClickSound();
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Calculations for checkout
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.customPrice ?? item.product.price) * item.quantity,
    0
  );
  const discountTotal = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const vatAmount = (taxableAmount * vatRate) / 100;
  const grandTotal = taxableAmount + vatAmount;

  // Checkout Completion
  const handleCompleteSale = (transaction: Transaction) => {
    setActiveTransaction(transaction);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);

    if (transaction.mode === 'sale') {
      console.log('[Data Flow -> App.tsx] Completing POS Sale. Recording to Database via API:', transaction.invoiceNumber);
      recordSaleTransaction({
        invoiceNumber: transaction.invoiceNumber,
        customerId: transaction.customer.id,
        customerName: transaction.customer.name,
        customerPhone: transaction.customer.phone,
        saleDate: transaction.date || new Date().toISOString(),
        orderMode: 'sale',
        paymentMethod: transaction.paymentMethod,
        paymentStatus: 'Paid',
        subtotal: transaction.subtotal,
        discountAmount: transaction.discountTotal,
        discountPercent: transaction.subtotal > 0 ? (transaction.discountTotal / transaction.subtotal) * 100 : 0,
        taxAmount: transaction.vatAmount,
        taxRate: transaction.vatRate,
        grandTotal: transaction.grandTotal,
        paidAmount: transaction.grandTotal,
        dueAmount: 0,
        notes: transaction.publicInvoiceNote || 'POS Counter Sale',
        createdBy: transaction.cashierName || cashierName,
        items: transaction.items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          sku: it.product.sku,
          category: it.product.category,
          unitPrice: it.customPrice ?? it.product.price,
          costPrice: it.product.costPrice || Math.round((it.customPrice ?? it.product.price) * 0.8),
          quantity: it.quantity,
          discountAmount: it.discountValue || 0,
          totalPrice: (it.customPrice ?? it.product.price) * it.quantity,
          serialNumbers: it.selectedSerials,
        })),
      }).catch((err) => console.error('[Data Flow -> App.tsx] Error recording sale to API:', err));

      // Decrease physical stock upon sale completion
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const soldItem = transaction.items.find((i) => i.product.id === p.id);
          if (soldItem) {
            return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
          }
          return p;
        })
      );

      // Update drawer cash sales if cash was used
      if (transaction.paymentMethod === 'Cash') {
        setDrawerState((prev) => ({
          ...prev,
          cashSales: prev.cashSales + transaction.grandTotal,
        }));
      }
    } else {
      // It's a quotation: register in Quotations system
      createQuotation({
        quoteNumber: transaction.invoiceNumber,
        date: transaction.date.split(',')[0] || new Date().toLocaleDateString('en-GB'),
        validUntil: new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-GB'),
        partyName: transaction.customer.name,
        partyCompany: transaction.customer.companyName,
        partyPhone: transaction.customer.phone,
        partyEmail: transaction.customer.email,
        partyAddress: transaction.customer.address,
        subject: 'POS Counter Generated Price Estimate',
        itemsList: transaction.items.map((it, idx) => ({
          id: `qi-pos-${Date.now()}-${idx}`,
          name: it.product.name,
          sku: it.product.sku,
          specs: it.product.category,
          warranty: it.product.warranty || '1 Year Official Warranty',
          qty: it.quantity,
          unitPrice: it.customPrice ?? it.product.price,
          total: (it.customPrice ?? it.product.price) * it.quantity,
        })),
        grossAmount: transaction.subtotal,
        discountAmount: transaction.discountTotal,
        vatRate: transaction.vatRate,
        taxAmount: transaction.vatAmount,
        grandTotal: transaction.grandTotal,
        status: 'Sent',
        paymentTerms: transaction.paymentMethod,
        deliveryLeadTime: 'Stock ready for immediate delivery',
        warrantyTerms: 'Official manufacturer warranty included',
        notes: transaction.publicInvoiceNote,
        createdBy: transaction.cashierName,
      });
    }
  };

  const handleNewSale = () => {
    setIsReceiptOpen(false);
    setActiveTransaction(null);
    setCartItems([]);
    setDiscountPercent(0);
  };

  // --------------------------------------------------------------------------
  // PURCHASE ORDER (PO) & PARTIAL RECEIVE HANDLERS
  // --------------------------------------------------------------------------
  const handleAddToPO = (product: Product) => {
    playBarcodeBeep();
    setPoItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantityOrdered + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantityOrdered: newQty,
          totalCost: newQty * updated[existingIdx].unitCost,
        };
        return updated;
      }
      const defaultCost = product.price > 0 ? Math.round(product.price * 0.8) : 5000;
      const newItem: PurchaseOrderItem = {
        id: `poi-${Date.now()}-${prev.length}`,
        productId: product.id,
        product,
        unitCost: defaultCost,
        quantityOrdered: 1,
        quantityReceived: 0,
        quantityReceivingNow: 0,
        taxRate: 5,
        totalCost: defaultCost,
      };
      return [newItem, ...prev];
    });
  };

  const handleUpdatePOQuantity = (productId: string, delta: number) => {
    playClickSound();
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantityOrdered + delta);
          return {
            ...item,
            quantityOrdered: newQty,
            totalCost: newQty * item.unitCost,
          };
        }
        return item;
      })
    );
  };

  const handleSetPOQuantity = (productId: string, qty: number) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantityOrdered: qty,
            totalCost: qty * item.unitCost,
          };
        }
        return item;
      })
    );
  };

  const handleUpdatePOUnitCost = (productId: string, cost: number) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            unitCost: cost,
            totalCost: item.quantityOrdered * cost,
          };
        }
        return item;
      })
    );
  };

  const handleUpdatePOReceivingNow = (productId: string, qty: number) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantityReceivingNow: qty,
          };
        }
        return item;
      })
    );
  };

  const handleRemovePOItem = (productId: string) => {
    playClickSound();
    setPoItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearPOItems = () => {
    playClickSound();
    setPoItems([]);
    setActivePO(null);
  };

  // Save new PO (Status: Pending)
  const handleSaveNewPO = (poData: {
    expectedDeliveryDate: string;
    notes: string;
    internalNotes: string;
  }) => {
    const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const orderDate = new Date().toISOString().split('T')[0];

    const subtotal = poItems.reduce((acc, i) => acc + i.unitCost * i.quantityOrdered, 0);
    const taxAmount = poItems.reduce((acc, i) => acc + i.unitCost * i.quantityOrdered * (i.taxRate / 100), 0);
    const grandTotal = subtotal + taxAmount;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: selectedSupplier.id,
      supplier: selectedSupplier,
      orderDate,
      expectedDeliveryDate: poData.expectedDeliveryDate,
      status: 'Pending',
      items: [...poItems],
      subtotal,
      taxAmount,
      grandTotal,
      notes: poData.notes,
      internalNotes: poData.internalNotes,
      createdBy: cashierName,
      receiveHistory: [],
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    setActivePO(newPO);
    setIsReceiveMode(true);
  };

  // Process Goods Receive (Partial or Complete)
  const handleProcessReceive = (referenceNote: string) => {
    if (!activePO) return;

    const receiveMap: Record<string, number> = {};
    poItems.forEach((item) => {
      if (item.quantityReceivingNow && item.quantityReceivingNow > 0) {
        receiveMap[item.productId] = item.quantityReceivingNow;
      }
    });

    if (Object.keys(receiveMap).length === 0) {
      alert('Please enter receiving quantities greater than 0.');
      return;
    }

    const result = executeReceiveTransaction(
      activePO,
      receiveMap,
      products,
      cashierName,
      referenceNote
    );

    // 1. Immediately increase physical product inventory in database
    setProducts(result.updatedProducts);

    // 2. Update PO status & history
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === result.updatedPO.id ? result.updatedPO : p))
    );
    setActivePO(result.updatedPO);
    setPoItems(result.updatedPO.items);

    const receivedCount = result.receivedSummary.reduce((sum, i) => sum + i.quantity, 0);
    alert(
      result.isCompleted
        ? `Purchase Order ${result.updatedPO.poNumber} completed! ${receivedCount} units added to physical stock.`
        : `Partial goods received (${receivedCount} units)! Purchase Order ${result.updatedPO.poNumber} status updated to Partial Receive. Stock increased immediately.`
    );
  };

  // Select PO from list to load into Receive Mode
  const handleSelectPOToReceive = (po: PurchaseOrder) => {
    setActivePO(po);
    setSelectedSupplier(po.supplier);
    setPoItems(po.items);
    setIsReceiveMode(true);
    setActiveModule('purchase');
    setPurchaseSubTab('po');
  };

  // --------------------------------------------------------------------------
  // DIRECT PURCHASE INVOICE HANDLERS
  // --------------------------------------------------------------------------
  const handleAddToDirectPurchase = (product: Product) => {
    playBarcodeBeep();
    setDirectPurchaseItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.product.id === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      const defaultCost = product.price > 0 ? Math.round(product.price * 0.8) : 5000;
      return [
        {
          product,
          unitCost: defaultCost,
          quantity: 1,
          taxRate: 5,
        },
        ...prev,
      ];
    });
  };

  const handleUpdateDirectPurchaseQuantity = (productId: string, delta: number) => {
    playClickSound();
    setDirectPurchaseItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            };
          }
          return item;
        })
    );
  };

  const handleSetDirectPurchaseQuantity = (productId: string, qty: number) => {
    setDirectPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleUpdateDirectPurchaseCost = (productId: string, cost: number) => {
    setDirectPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, unitCost: cost };
        }
        return item;
      })
    );
  };

  const handleUpdateDirectPurchaseSerials = (productId: string, serials: string[]) => {
    setDirectPurchaseItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, serials } : item
      )
    );
  };

  const handleRemoveDirectPurchaseItem = (productId: string) => {
    playClickSound();
    setDirectPurchaseItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearDirectPurchaseItems = () => {
    playClickSound();
    setDirectPurchaseItems([]);
  };

  const handleCompletePurchaseInvoice = (invoiceData: {
    paymentMethod: 'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Credit / Due';
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    notes: string;
    internalNotes: string;
  }) => {
    const result = executeDirectPurchaseTransaction(
      selectedSupplier,
      directPurchaseItems,
      products,
      invoiceData.paymentMethod,
      invoiceData.paymentStatus,
      invoiceData.notes,
      invoiceData.internalNotes,
      cashierName
    );

    // Immediately increases physical stock in central catalog
    setProducts(result.updatedProducts);
    setActivePurchaseInvoice(result.newInvoice);
    setIsPurchaseInvoiceModalOpen(true);
    setDirectPurchaseItems([]);
  };

  const handleCreateSupplier = (data: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  // Add & Delete Product handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  // Sync global search to product search
  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setSearchQuery(query);
  };

  // Count pending/partial purchase orders
  const pendingPOCount = purchaseOrders.filter(
    (p) => p.status === 'Pending' || p.status === 'Partial Receive'
  ).length;

  const handleAddFinanceRecord = (record: {
    type?: 'Income' | 'Expense';
    description: string;
    category: string;
    amount: number;
    paymentMode: string;
    date: string;
    recordedBy: string;
  }) => {
    try {
      const existingRaw = localStorage.getItem('nextgen_finance_records');
      const existingFinance = existingRaw ? JSON.parse(existingRaw) : [];
      const newRecord = {
        id: `fn-${Date.now()}`,
        type: record.type || 'Expense',
        description: record.description,
        category: record.category,
        amount: record.amount,
        paymentMode: record.paymentMode,
        date: record.date,
        recordedBy: record.recordedBy,
      };
      localStorage.setItem('nextgen_finance_records', JSON.stringify([newRecord, ...existingFinance]));
    } catch (e) {
      console.error('Failed to save finance record', e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Bar with Module Navigation & ERP Controls */}
      <TopNav
        onSearchGlobal={handleGlobalSearch}
        globalSearchQuery={globalSearchQuery}
        drawerState={drawerState}
        onOpenDrawerModal={() => setIsDrawerModalOpen(true)}
        onOpenQuickActions={() => setIsQuickActionsModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        heldOrdersCount={heldOrders.length}
        onOpenHeldOrders={() => setIsHeldOrdersModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        cashierName={cashierName}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pendingPOCount={pendingPOCount}
        onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
      />

      {/* 2. Main Workspace Layout with Master ERP Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Master ERP Sidebar */}
        <ErpSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          activeSubItem={activeSubItem}
          onSelectSubItem={(mod, subId, subTab) => {
            setActiveModule(mod);
            setActiveSubItem(subId);
            if (mod === 'sales') {
              if (subTab === 'pos' || subId === '1.1') setSalesSubTab('pos');
              else setSalesSubTab('invoice');
            }
            if (mod === 'purchase') {
              if (subTab === 'direct' || subId === '2.1') setPurchaseSubTab('direct');
              else setPurchaseSubTab('list');
            }
          }}
          heldOrdersCount={heldOrders.length}
          pendingPOCount={pendingPOCount}
          warrantyPolicy={warrantyPolicy}
          onOpenWarrantyPolicyModal={() => setIsWarrantyPolicyModalOpen(true)}
          salesSubTab={salesSubTab}
          onSelectSalesSubTab={setSalesSubTab}
          onOpenSalesInvoiceSettings={() => setIsSalesInvoiceSettingsOpen(true)}
          purchaseSubTab={purchaseSubTab}
          onSelectPurchaseSubTab={setPurchaseSubTab}
          onOpenPurchaseSettings={() => setIsPurchaseSettingsOpen(true)}
          onOpenLetterheadSettings={() => setIsCompanyLetterheadOpen(true)}
          onNewSaleShortcut={handleNewSaleShortcut}
          onNewPurchaseShortcut={handleNewPurchaseShortcut}
          onCashReceiveShortcut={handleCashReceiveShortcut}
          onCashPayShortcut={handleCashPayShortcut}
          onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
        />

        {/* Dynamic Workspace Container */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeModule === 'sales' ? (
            salesSubTab === 'invoice' ? (
              <SalesInvoicesView
                onOpenPOS={() => setSalesSubTab('pos')}
                onOpenSettings={() => setIsSalesInvoiceSettingsOpen(true)}
                onOpenLetterhead={() => setIsCompanyLetterheadOpen(true)}
                customers={customers}
                products={products}
                activeSubItem={activeSubItem}
                onSelectSubItem={setActiveSubItem}
              />
            ) : (
              /* Daily Process -> Sales POS Workspace */
              <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                <section className="flex-1 h-full min-h-0 overflow-hidden" aria-label="Product Catalog">
                <ProductCatalog
                  products={products}
                  onAddToCart={handleAddToCart}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </section>

              <section
                className="w-full md:w-[420px] lg:w-[480px] xl:w-[520px] h-full min-h-0 shrink-0 border-l border-slate-200 dark:border-slate-800"
                aria-label="Sales Cart Panel"
              >
                <CustomerAndCartPanel
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={setSelectedCustomer}
                  onCreateCustomer={handleCreateCustomer}
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onUpdatePrice={handleUpdatePrice}
                  onUpdateSerials={handleUpdateSerials}
                  onUpdateGifts={handleUpdateGifts}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onHoldOrder={handleHoldOrder}
                  onCheckout={() => setIsCheckoutOpen(true)}
                  orderMode={orderMode}
                  onSetOrderMode={setOrderMode}
                  discountPercent={discountPercent}
                  onSetDiscountPercent={setDiscountPercent}
                  vatRate={vatRate}
                />
              </section>
            </main>
            )
          ) : activeModule === 'purchase' ? (
            purchaseSubTab === 'direct' ? (
              /* Daily Process -> Purchase Workspace (Direct Purchase) */
              <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                <section className="flex-1 h-full min-h-0 overflow-hidden" aria-label="Product Catalog">
                  <ProductCatalog
                    products={products}
                    onAddToCart={(prod) => handleAddToDirectPurchase(prod)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                </section>

                <section
                  className="w-full md:w-[420px] lg:w-[480px] xl:w-[520px] h-full min-h-0 shrink-0 border-l border-slate-200 dark:border-slate-800 flex flex-col"
                  aria-label="Purchasing Workflow Panel"
                >
                  <div className="bg-slate-100 dark:bg-slate-850 p-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>🧾 2.1 Direct Purchase Terminal</span>
                    </span>
                    <button
                      onClick={() => setPurchaseSubTab('list')}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Bills &amp; Registry ›
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DirectPurchaseInvoicePanel
                      suppliers={suppliers}
                      selectedSupplier={selectedSupplier}
                      onSelectSupplier={setSelectedSupplier}
                      onCreateSupplier={handleCreateSupplier}
                      items={directPurchaseItems}
                      onUpdateQuantity={handleUpdateDirectPurchaseQuantity}
                      onSetQuantity={handleSetDirectPurchaseQuantity}
                      onUpdateUnitCost={handleUpdateDirectPurchaseCost}
                      onUpdateSerials={handleUpdateDirectPurchaseSerials}
                      onRemoveItem={handleRemoveDirectPurchaseItem}
                      onClearItems={handleClearDirectPurchaseItems}
                      onCompletePurchaseInvoice={handleCompletePurchaseInvoice}
                    />
                  </div>
                </section>
              </main>
            ) : (
              <PurchaseManagementView
                onOpenDirectPurchase={() => setPurchaseSubTab('direct')}
                onOpenPOBuilder={() => {
                  setPurchaseSubTab('direct');
                }}
                suppliers={suppliers}
                products={products}
                activeSubItem={activeSubItem}
                onSelectSubItem={setActiveSubItem}
                purchaseOrders={purchaseOrders}
              />
            )
          ) : activeModule === 'service' ? (
            /* Daily Process -> Service & Repair */
            <ServiceManagementView />
          ) : activeModule === 'warranty' ? (
            /* Daily Process -> 4. Warranty & Guarantee Policy */
            <WarrantyManagementView
              policy={warrantyPolicy}
              onUpdatePolicy={handleSaveWarrantyPolicy}
              onOpenPolicyModal={() => setIsWarrantyPolicyModalOpen(true)}
              onAddExpenseRecord={handleAddFinanceRecord}
            />
          ) : activeModule === 'inventory' ? (
            /* Inventory */
            <InventoryStockView
              products={products}
              onUpdateProductStock={handleUpdateProductStock}
              onUpdateProduct={(updated) => {
                setProducts((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                );
              }}
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : activeModule === 'clients' ? (
            /* Client Setup */
            <ClientSetupView
              customers={customers}
              onCreateCustomer={handleCreateCustomer}
              onUpdateCustomer={(updated) => {
                setCustomers((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                );
              }}
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : activeModule === 'product_setup' ? (
            /* Product Setup (Add Product + Product List) */
            <ProductManagementView
              products={products}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          ) : activeModule === 'master_setup' ? (
            /* Master Setup */
            <MasterSetupView
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
              onOpenLetterhead={() => setIsCompanyLetterheadOpen(true)}
              onOpenInvoiceSettings={() => setIsSalesInvoiceSettingsOpen(true)}
            />
          ) : activeModule === 'accounts' ? (
            /* Accounts Setup */
            <AccountsSetupView
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : activeModule === 'finance' ? (
            /* Finance Record */
            <FinanceRecordView />
          ) : activeModule === 'payroll' ? (
            /* Staff Payroll, Salary Ledger & Pay Slips */
            <PayrollView
              onAddFinanceRecord={handleAddFinanceRecord}
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : activeModule === 'reports' ? (
            /* Report */
            <ReportsView
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : activeModule === 'users' ? (
            /* User & Role */
            <UsersRoleView
              activeSubItem={activeSubItem}
              onSelectSubItem={setActiveSubItem}
            />
          ) : (
            /* Company & Setting */
            <CompanySettingsView />
          )}
        </div>
      </div>

      {/* 3. Sales POS Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customer={selectedCustomer}
        orderMode={orderMode}
        subtotal={subtotal}
        discountTotal={discountTotal}
        vatRate={vatRate}
        vatAmount={vatAmount}
        grandTotal={grandTotal}
        cashierName={cashierName}
        onCompleteSale={handleCompleteSale}
      />

      <ReceiptModal
        transaction={activeTransaction}
        onClose={() => setIsReceiptOpen(false)}
        onNewSale={handleNewSale}
      />

      <CashDrawerModal
        isOpen={isDrawerModalOpen}
        onClose={() => setIsDrawerModalOpen(false)}
        drawerState={drawerState}
        onUpdateDrawer={setDrawerState}
      />

      <HeldOrdersModal
        isOpen={isHeldOrdersModalOpen}
        onClose={() => setIsHeldOrdersModalOpen(false)}
        heldOrders={heldOrders}
        onResumeOrder={handleResumeOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      <QuickActionsModal
        isOpen={isQuickActionsModalOpen}
        onClose={() => setIsQuickActionsModalOpen(false)}
        onOpenDrawer={() => setIsDrawerModalOpen(true)}
        onOpenHeldOrders={() => setIsHeldOrdersModalOpen(true)}
      />

      {/* 4. Purchasing Modals */}
      <PurchaseOrdersListModal
        isOpen={isPOListOpen}
        onClose={() => setIsPOListOpen(false)}
        purchaseOrders={purchaseOrders}
        onSelectPOToReceive={handleSelectPOToReceive}
      />

      <PurchaseInvoiceReceiptModal
        invoice={activePurchaseInvoice}
        onClose={() => setIsPurchaseInvoiceModalOpen(false)}
        onNewPurchase={() => {
          setIsPurchaseInvoiceModalOpen(false);
          setActivePurchaseInvoice(null);
        }}
      />

      {/* 5. Warranty & Guarantee Policy Modal */}
      <WarrantyPolicyModal
        isOpen={isWarrantyPolicyModalOpen}
        onClose={() => setIsWarrantyPolicyModalOpen(false)}
        policy={warrantyPolicy}
        onSavePolicy={handleSaveWarrantyPolicy}
      />

      {/* 2.3 Sales Invoice Settings Modal */}
      <SalesInvoiceSettingsModal
        isOpen={isSalesInvoiceSettingsOpen}
        onClose={() => setIsSalesInvoiceSettingsOpen(false)}
      />

      {/* 3.3 Purchase Settings Modal */}
      <PurchaseSettingsModal
        isOpen={isPurchaseSettingsOpen}
        onClose={() => setIsPurchaseSettingsOpen(false)}
      />

      {/* Official Company Letterhead Designer Modal */}
      <CompanyLetterheadModal
        isOpen={isCompanyLetterheadOpen}
        onClose={() => setIsCompanyLetterheadOpen(false)}
      />

      {/* Google Drive Cloud Sync & Backup Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        products={products}
        customers={customers}
        cashierName={cashierName}
      />
    </div>
  );
}
