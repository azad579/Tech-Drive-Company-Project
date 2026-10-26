import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import {
  Branch,
  Warehouse,
  SalesDeliveryRecord,
  PurchaseReceiveRecord,
  StockStatusItem,
  TransferRecord,
  DisposalRecord,
  INITIAL_BRANCHES,
  INITIAL_WAREHOUSES,
  INITIAL_DELIVERY_RECORDS,
  INITIAL_RECEIVE_RECORDS,
  INITIAL_STOCK_STATUS_ITEMS,
  INITIAL_TRANSFERS,
  INITIAL_DISPOSALS,
  INVENTORY_HISTORY_LOGS,
  TransferCartItem,
  DisposalCartItem
} from '../data/mockInventoryData';

export type InventoryTab =
  | 'branchList'
  | 'branchCreate'
  | 'warehouseList'
  | 'warehouseCreate'
  | 'salesDelivery'
  | 'salesDeliveryCreate'
  | 'purchaseReceive'
  | 'purchaseReceiveCreate'
  | 'branchStock'
  | 'warehouseStock'
  | 'combinedStock'
  | 'branchTransfer'
  | 'branchTransferCreate'
  | 'warehouseTransfer'
  | 'warehouseTransferCreate'
  | 'productDisposal'
  | 'productDisposalCreate';

interface InventoryModuleViewProps {
  initialTab?: InventoryTab;
}

export const InventoryModuleView: React.FC<InventoryModuleViewProps> = ({
  initialTab = 'branchList'
}) => {
  const { setCurrentRoute } = useApp();
  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);

  // Core Data
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [deliveries, setDeliveries] = useState<SalesDeliveryRecord[]>(INITIAL_DELIVERY_RECORDS);
  const [receives, setReceives] = useState<PurchaseReceiveRecord[]>(INITIAL_RECEIVE_RECORDS);
  const [stockItems, setStockItems] = useState<StockStatusItem[]>(INITIAL_STOCK_STATUS_ITEMS);
  const [transfers, setTransfers] = useState<TransferRecord[]>(INITIAL_TRANSFERS);
  const [disposals, setDisposals] = useState<DisposalRecord[]>(INITIAL_DISPOSALS);
  const [historyLogs, setHistoryLogs] = useState(INVENTORY_HISTORY_LOGS);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('MIRPUR 11');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Branch drawer & form state
  const [isBranchDrawerOpen, setIsBranchDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    nameBn: '',
    phone: '',
    email: '',
    addressEn: '',
    addressBn: ''
  });

  // Warehouse drawer & form state
  const [isWarehouseDrawerOpen, setIsWarehouseDrawerOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    nameBn: '',
    phone: '',
    email: '',
    addressEn: '',
    addressBn: ''
  });

  // Delivery Create Form State
  const [deliveryInvoice, setDeliveryInvoice] = useState('SEL231026102');
  const [deliveryDate, setDeliveryDate] = useState('24-10-2026');
  const [deliveryChallanNo, setDeliveryChallanNo] = useState(`DLI241026${Math.floor(100 + Math.random() * 900)}`);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryItemsForm, setDeliveryItemsForm] = useState([
    {
      productId: 'prod-1',
      name: 'Catblack Laptop Cooling Fan Stand',
      code: 'ABA223P',
      sold: 5,
      delivered: 2,
      restQty: 3,
      now: 3
    },
    {
      productId: 'prod-6',
      name: 'Dell Latitude 5420 Core i5 11th Gen',
      code: 'LAP-DELL-5420',
      sold: 2,
      delivered: 1,
      restQty: 1,
      now: 1
    }
  ]);

  // Receive Create Form State
  const [receivePurchaseNo, setReceivePurchaseNo] = useState('PINV241026101');
  const [receiveDate, setReceiveDate] = useState('24-10-2026');
  const [receiveChallanNo, setReceiveChallanNo] = useState(`RCI241026${Math.floor(100 + Math.random() * 900)}`);
  const [receiveNote, setReceiveNote] = useState('');
  const [receiveItemsForm, setReceiveItemsForm] = useState([
    {
      productId: 'prod-10',
      name: 'Samsung 980 Pro NVMe M.2 SSD 500GB',
      code: 'SSD-SAM-980-500',
      purchase: 10,
      received: 4,
      restQty: 6,
      now: 6
    },
    {
      productId: 'prod-11',
      name: 'Kingston NV2 PCIe 4.0 NVMe SSD 1TB',
      code: 'SSD-KIN-1TB',
      purchase: 15,
      received: 10,
      restQty: 5,
      now: 5
    }
  ]);

  // Branch / Warehouse Transfer State
  const [transferFrom, setTransferFrom] = useState('Taltola');
  const [transferTo, setTransferTo] = useState('Mirpur 11');
  const [transferDate, setTransferDate] = useState('24 Oct 2026');
  const [transferNo, setTransferNo] = useState(`TRN241026${Math.floor(100 + Math.random() * 900)}`);
  const [transferNote, setTransferNote] = useState('');
  const [transferCart, setTransferCart] = useState<TransferCartItem[]>([
    {
      productId: 'prod-1',
      name: 'Catblack Laptop Cooling Fan Stand',
      sku: 'ABA223P',
      cost: 480,
      qty: 5,
      hasSerial: false,
      serials: []
    }
  ]);
  const [transferSearch, setTransferSearch] = useState('');

  // Product Disposal State
  const [disposalFrom, setDisposalFrom] = useState('Taltola');
  const [disposalDate, setDisposalDate] = useState('24 Oct 2026');
  const [disposalNo, setDisposalNo] = useState(`PDR241026${Math.floor(100 + Math.random() * 900)}`);
  const [disposalNote, setDisposalNote] = useState('');
  const [disposalRecover, setDisposalRecover] = useState(0);
  const [disposalCart, setDisposalCart] = useState<DisposalCartItem[]>([
    {
      productId: 'prod-d1',
      name: 'Speaker Mini Bluetooth ABA076PB1014',
      sku: 'ABA076PB1014',
      cost: 1200,
      qty: 2,
      price: 1200,
      subtotal: 2400,
      serials: ['SPK-88123-A', 'SPK-88123-B']
    }
  ]);
  const [disposalSearch, setDisposalSearch] = useState('');
  const [newDisposalSerialInput, setNewDisposalSerialInput] = useState('');

  // Printable Challan / Slip Modal
  const [viewingDeliveryChallan, setViewingDeliveryChallan] = useState<SalesDeliveryRecord | null>(null);
  const [viewingReceiveSlip, setViewingReceiveSlip] = useState<PurchaseReceiveRecord | null>(null);
  const [viewingDisposalSlip, setViewingDisposalSlip] = useState<DisposalRecord | null>(null);

  // Handlers for Branch
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      nameBn: '',
      phone: '',
      email: '',
      addressEn: '',
      addressBn: ''
    });
    setIsBranchDrawerOpen(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      nameBn: branch.nameBn || '',
      phone: branch.phone,
      email: branch.email,
      addressEn: branch.addressEn,
      addressBn: branch.addressBn || ''
    });
    setIsBranchDrawerOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;

    if (editingBranch) {
      setBranches(prev =>
        prev.map(b =>
          b.id === editingBranch.id
            ? { ...b, ...branchForm }
            : b
        )
      );
      setHistoryLogs(prev => [
        {
          id: `h-${Date.now()}`,
          date: '24 Oct 2026',
          title: `Staff access - Branch updated - ${branchForm.name}`,
          user: 'Ferdous Ahmed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } else {
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        sn: branches.length + 1,
        ...branchForm
      };
      setBranches(prev => [...prev, newBranch]);
      setHistoryLogs(prev => [
        {
          id: `h-${Date.now()}`,
          date: '24 Oct 2026',
          title: `Staff access - Branch added - ${branchForm.name}`,
          user: 'Ferdous Ahmed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    }
    setIsBranchDrawerOpen(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete branch "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  // Handlers for Warehouse
  const handleOpenAddWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      name: '',
      nameBn: '',
      phone: '',
      email: '',
      addressEn: '',
      addressBn: ''
    });
    setIsWarehouseDrawerOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      name: warehouse.name,
      nameBn: warehouse.nameBn || '',
      phone: warehouse.phone,
      email: warehouse.email,
      addressEn: warehouse.addressEn,
      addressBn: warehouse.addressBn || ''
    });
    setIsWarehouseDrawerOpen(true);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseForm.name.trim()) return;

    if (editingWarehouse) {
      setWarehouses(prev =>
        prev.map(w =>
          w.id === editingWarehouse.id
            ? { ...w, ...warehouseForm }
            : w
        )
      );
    } else {
      const newWh: Warehouse = {
        id: `wh-${Date.now()}`,
        sn: warehouses.length + 1,
        ...warehouseForm
      };
      setWarehouses(prev => [...prev, newWh]);
      setHistoryLogs(prev => [
        {
          id: `h-${Date.now()}`,
          date: '24 Oct 2026',
          title: `Staff access - Warehouse added - ${warehouseForm.name}`,
          user: 'Ferdous Ahmed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    }
    setIsWarehouseDrawerOpen(false);
  };

  const handleDeleteWarehouse = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
      setWarehouses(prev => prev.filter(w => w.id !== id));
    }
  };

  // Handlers for Delivery
  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SalesDeliveryRecord = {
      id: `del-${Date.now()}`,
      sn: deliveries.length + 1,
      date: deliveryDate,
      challanNo: deliveryChallanNo,
      invoiceNo: deliveryInvoice,
      customerName: 'Customer Invoice Order',
      from: 'Taltola',
      note: deliveryNote || 'Delivered to customer',
      status: deliveryItemsForm.some(i => i.restQty - (i.now || 0) > 0) ? 'Partial' : 'Delivered',
      items: deliveryItemsForm.map(i => ({
        ...i,
        delivered: i.delivered + (i.now || 0),
        restQty: Math.max(0, i.restQty - (i.now || 0))
      }))
    };
    setDeliveries(prev => [newRecord, ...prev]);
    setHistoryLogs(prev => [
      {
        id: `h-${Date.now()}`,
        date: '24 Oct 2026',
        title: `Staff access - Delivery Challan ${deliveryChallanNo} created`,
        user: 'Ferdous Ahmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
    setActiveTab('salesDelivery');
  };

  // Handlers for Purchase Receive
  const handleSaveReceive = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PurchaseReceiveRecord = {
      id: `rec-${Date.now()}`,
      sn: receives.length + 1,
      date: receiveDate,
      challanNo: receiveChallanNo,
      purchaseNo: receivePurchaseNo,
      supplierName: 'Direct Supplier Receive',
      from: 'Vendor Warehouse Hub',
      note: receiveNote || 'Products inspected & accepted',
      status: receiveItemsForm.some(i => i.restQty - (i.now || 0) > 0) ? 'Partial' : 'Received',
      items: receiveItemsForm.map(i => ({
        ...i,
        received: i.received + (i.now || 0),
        restQty: Math.max(0, i.restQty - (i.now || 0))
      }))
    };
    setReceives(prev => [newRecord, ...prev]);
    setHistoryLogs(prev => [
      {
        id: `h-${Date.now()}`,
        date: '24 Oct 2026',
        title: `Staff access - Purchase Receive ${receiveChallanNo} created`,
        user: 'Ferdous Ahmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
    setActiveTab('purchaseReceive');
  };

  // Handlers for Transfer
  const handleAddTransferItem = (item: StockStatusItem) => {
    const existing = transferCart.find(c => c.productId === item.id);
    if (existing) {
      setTransferCart(prev =>
        prev.map(c =>
          c.productId === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      const hasSerial = item.sku.startsWith('LAP-') || item.sku.startsWith('SSD-');
      setTransferCart(prev => [
        ...prev,
        {
          productId: item.id,
          name: item.name,
          sku: item.sku,
          cost: 1000,
          qty: 1,
          hasSerial,
          serials: hasSerial ? [`SN-${item.sku}-001`] : []
        }
      ]);
    }
  };

  const handleExecuteTransfer = () => {
    if (transferCart.length === 0) return;
    const newTransfer: TransferRecord = {
      id: `tr-${Date.now()}`,
      sn: transfers.length + 1,
      date: transferDate,
      transferNo: transferNo,
      from: transferFrom,
      to: transferTo,
      note: transferNote || 'Inventory transfer dispatch',
      type: activeTab === 'branchTransferCreate' ? 'branch' : 'warehouse',
      items: transferCart
    };
    setTransfers(prev => [newTransfer, ...prev]);
    setHistoryLogs(prev => [
      {
        id: `h-${Date.now()}`,
        date: '24 Oct 2026',
        title: `Staff access - Transfer ${transferNo} created (${transferFrom} -> ${transferTo})`,
        user: 'Ferdous Ahmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
    setActiveTab(activeTab === 'branchTransferCreate' ? 'branchTransfer' : 'warehouseTransfer');
    setTransferCart([]);
  };

  // Handlers for Disposal
  const handleAddDisposalItem = (item: StockStatusItem) => {
    const existing = disposalCart.find(c => c.productId === item.id);
    if (existing) {
      setDisposalCart(prev =>
        prev.map(c =>
          c.productId === item.id
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.cost }
            : c
        )
      );
    } else {
      const cost = 1200;
      setDisposalCart(prev => [
        ...prev,
        {
          productId: item.id,
          name: item.name,
          sku: item.sku,
          cost,
          qty: 1,
          price: cost,
          subtotal: cost,
          serials: []
        }
      ]);
    }
  };

  const handleAddDisposalSerial = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newDisposalSerialInput.trim()) {
      e.preventDefault();
      if (disposalCart.length > 0) {
        setDisposalCart(prev => {
          const updated = [...prev];
          updated[0].serials = [...updated[0].serials, newDisposalSerialInput.trim()];
          return updated;
        });
        setNewDisposalSerialInput('');
      }
    }
  };

  const handleExecuteDisposal = () => {
    if (disposalCart.length === 0) return;
    const totalCost = disposalCart.reduce((acc, c) => acc + c.subtotal, 0);
    const newDisposal: DisposalRecord = {
      id: `dsp-${Date.now()}`,
      sn: disposals.length + 1,
      date: disposalDate,
      disposalNo: disposalNo,
      from: disposalFrom,
      cost: totalCost,
      recover: disposalRecover,
      note: disposalNote || 'Product scrapped / written off',
      items: disposalCart
    };
    setDisposals(prev => [newDisposal, ...prev]);
    setHistoryLogs(prev => [
      {
        id: `h-${Date.now()}`,
        date: '24 Oct 2026',
        title: `Staff access - Product disposal ${disposalNo} recorded`,
        user: 'Ferdous Ahmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);
    setActiveTab('productDisposal');
    setDisposalCart([]);
  };

  return (
    <div className="space-y-4 font-sans text-gray-800">
      {/* Submodule Navigation Bar matching Tech Drive ERP */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <i className="fa fa-cubes text-[#0084bf] text-lg"></i>
            <h1 className="text-base font-bold text-gray-800 uppercase tracking-wide">
              Inventory Management
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Tech Drive ERP &bull; Real-time Stock Matrix & Multibranch Hub
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-1 text-xs">
          <button
            onClick={() => setActiveTab('branchList')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'branchList' || activeTab === 'branchCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-building mr-1.5"></i> Branch
          </button>
          <button
            onClick={() => setActiveTab('warehouseList')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'warehouseList' || activeTab === 'warehouseCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-archive mr-1.5"></i> Warehouse
          </button>
          <button
            onClick={() => setActiveTab('salesDelivery')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'salesDelivery' || activeTab === 'salesDeliveryCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-truck mr-1.5"></i> Sales Delivery
          </button>
          <button
            onClick={() => setActiveTab('purchaseReceive')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'purchaseReceive' || activeTab === 'purchaseReceiveCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-inbox mr-1.5"></i> Purchase Receive
          </button>
          <button
            onClick={() => setActiveTab('branchStock')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'branchStock'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-table mr-1.5"></i> Branch Stock Status
          </button>
          <button
            onClick={() => setActiveTab('warehouseStock')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'warehouseStock'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-database mr-1.5"></i> Warehouse Stock
          </button>
          <button
            onClick={() => setActiveTab('combinedStock')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'combinedStock'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-clone mr-1.5"></i> Combined Stock
          </button>
          <button
            onClick={() => setActiveTab('branchTransfer')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'branchTransfer' || activeTab === 'branchTransferCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-exchange mr-1.5"></i> Branch Transfer
          </button>
          <button
            onClick={() => setActiveTab('warehouseTransfer')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'warehouseTransfer' || activeTab === 'warehouseTransferCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-arrows-h mr-1.5"></i> Warehouse Transfer
          </button>
          <button
            onClick={() => setActiveTab('productDisposal')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'productDisposal' || activeTab === 'productDisposalCreate'
                ? 'bg-[#0084bf] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fa fa-trash-o mr-1.5"></i> Product Disposal
          </button>
        </div>
      </div>

      {/* Main Content Layout with Optional Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Work Area (3 cols or 4 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* ========================================================= */}
          {/* 1. BRANCH LIST (matching image_bcd896b8.png)              */}
          {/* ========================================================= */}
          {activeTab === 'branchList' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084bf]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    BRANCH LIST
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenAddBranch}
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                  >
                    <i className="fa fa-plus mr-1.5"></i> ADD BRANCH
                  </button>
                </div>
              </div>

              {/* Table Filter Top Bar */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <select
                    value={recordsPerPage}
                    onChange={e => setRecordsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>records</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search branch name, phone..."
                    className="border border-gray-300 rounded px-3 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf] w-56"
                  />
                </div>
              </div>

              {/* Branch Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3">PHONE</th>
                      <th className="py-2.5 px-3">EMAIL</th>
                      <th className="py-2.5 px-3">ADDRESS</th>
                      <th className="py-2.5 px-3 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {branches
                      .filter(
                        b =>
                          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone.includes(searchQuery) ||
                          b.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((branch, idx) => (
                        <tr key={branch.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-800">
                            <div>{branch.name}</div>
                            {branch.nameBn && (
                              <div className="text-[11px] text-gray-400 font-normal">
                                {branch.nameBn}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">
                            {branch.phone}
                          </td>
                          <td className="py-2.5 px-3 text-blue-600">
                            {branch.email}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">
                            {branch.addressEn}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleEditBranch(branch)}
                                className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white p-1.5 rounded text-xs transition-colors"
                                title="Edit Branch"
                              >
                                <i className="fa fa-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                className="bg-[#dd4b39] hover:bg-[#c23321] text-white p-1.5 rounded text-xs transition-colors"
                                title="Delete Branch"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500">
                <div>Showing 1 to {branches.length} of {branches.length} entries</div>
                <div className="flex items-center space-x-1">
                  <button className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-2.5 py-1 bg-[#0084bf] text-white rounded font-medium">
                    1
                  </button>
                  <button className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. WAREHOUSE LIST (matching image_bbb0bf72.png)           */}
          {/* ========================================================= */}
          {activeTab === 'warehouseList' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084bf]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    WAREHOUSE LIST
                  </h2>
                </div>
                <button
                  onClick={handleOpenAddWarehouse}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> ADD WAREHOUSE
                </button>
              </div>

              {/* Table Filter Top Bar */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <select
                    value={recordsPerPage}
                    onChange={e => setRecordsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                  <span>records</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search warehouse..."
                    className="border border-gray-300 rounded px-3 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf] w-56"
                  />
                </div>
              </div>

              {/* Warehouse Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">NAME</th>
                      <th className="py-2.5 px-3">PHONE</th>
                      <th className="py-2.5 px-3">EMAIL</th>
                      <th className="py-2.5 px-3">ADDRESS</th>
                      <th className="py-2.5 px-3 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {warehouses
                      .filter(
                        w =>
                          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.phone.includes(searchQuery) ||
                          w.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((wh, idx) => (
                        <tr key={wh.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-800">
                            <div>{wh.name}</div>
                            {wh.nameBn && (
                              <div className="text-[11px] text-gray-400 font-normal">
                                {wh.nameBn}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">
                            {wh.phone}
                          </td>
                          <td className="py-2.5 px-3 text-blue-600">
                            {wh.email}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">
                            {wh.addressEn}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleEditWarehouse(wh)}
                                className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white p-1.5 rounded text-xs transition-colors"
                                title="Edit Warehouse"
                              >
                                <i className="fa fa-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                                className="bg-[#dd4b39] hover:bg-[#c23321] text-white p-1.5 rounded text-xs transition-colors"
                                title="Delete Warehouse"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                Showing 1 to {warehouses.length} of {warehouses.length} entries
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. SALES DELIVERY LIST (matching image_efd5f124.png)      */}
          {/* ========================================================= */}
          {activeTab === 'salesDelivery' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00a65a]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    DELIVERED RECORD
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('salesDeliveryCreate')}
                  className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> CREATE DELIVERY
                </button>
              </div>

              {/* Delivery Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Challan No</th>
                      <th className="py-2.5 px-3">Invoice No</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveries.map((del, idx) => (
                      <tr key={del.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-mono">
                          {del.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700 font-mono">
                          {del.challanNo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-800">
                          {del.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {del.from}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {del.note}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setViewingDeliveryChallan(del)}
                            className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            <i className="fa fa-print mr-1"></i> Challan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3b. SALES DELIVERY CREATE (matching image_c3f21f27.png)   */}
          {/* ========================================================= */}
          {activeTab === 'salesDeliveryCreate' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-truck text-[#00a65a] text-lg"></i>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    SALES PRODUCT DELIVERY
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('salesDelivery')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                >
                  Back to List
                </button>
              </div>

              {/* Form Controls Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Select Invoice <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryInvoice}
                    onChange={e => setDeliveryInvoice(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs focus:ring-1 focus:ring-[#0084bf]"
                  >
                    <option value="SEL231026102">SEL231026102 - Walk-In Customer (23 Oct 2026)</option>
                    <option value="SEL231026101">SEL231026101 - Al-Amin Computers (23 Oct 2026)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Challan No & Date
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={deliveryChallanNo}
                      onChange={e => setDeliveryChallanNo(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-mono font-bold text-blue-700"
                    />
                    <input
                      type="text"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Challan Note
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    placeholder="Enter dispatch note or driver detail..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Delivery Line Items Table */}
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3 text-center">Sold</th>
                      <th className="py-2.5 px-3 text-center">Delivered</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">Rest Qty</th>
                      <th className="py-2.5 px-3 text-center w-28 bg-emerald-50 text-emerald-800 font-bold">
                        Deliver Now
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveryItemsForm.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-700">
                          {item.sold}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">
                          {item.delivered}
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-700 font-bold">
                          {item.restQty}
                        </td>
                        <td className="py-2 px-3 text-center bg-emerald-50/50">
                          <input
                            type="number"
                            min="0"
                            max={item.restQty}
                            value={item.now}
                            onChange={e => {
                              const val = Math.min(item.restQty, Math.max(0, Number(e.target.value)));
                              setDeliveryItemsForm(prev =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, now: val } : it
                                )
                              );
                            }}
                            className="w-20 text-center border border-emerald-400 rounded px-2 py-1 text-xs font-bold text-emerald-900 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('salesDelivery')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-xs font-semibold"
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  onClick={handleSaveDelivery}
                  className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm"
                >
                  DELIVER
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. PURCHASE RECEIVE LIST (matching image_5d29c026.png)    */}
          {/* ========================================================= */}
          {activeTab === 'purchaseReceive' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084bf]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    RECEIVE RECORD
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('purchaseReceiveCreate')}
                  className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> CREATE RECEIVE
                </button>
              </div>

              {/* Receive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Challan No</th>
                      <th className="py-2.5 px-3">Purchase No</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receives.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-mono">
                          {rec.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700 font-mono">
                          {rec.challanNo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-800">
                          {rec.purchaseNo}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {rec.from}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {rec.note}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setViewingReceiveSlip(rec)}
                            className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            <i className="fa fa-print mr-1"></i> Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4b. PURCHASE RECEIVE CREATE (matching image_02e28821.png) */}
          {/* ========================================================= */}
          {activeTab === 'purchaseReceiveCreate' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-inbox text-[#0084bf] text-lg"></i>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    PURCHASE PRODUCT RECEIVE
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('purchaseReceive')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                >
                  Back to List
                </button>
              </div>

              {/* Form Controls Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Select Purchase Invoice <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={receivePurchaseNo}
                    onChange={e => setReceivePurchaseNo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs focus:ring-1 focus:ring-[#0084bf]"
                  >
                    <option value="PINV241026101">PINV241026101 - City Laptop Zone (24 Oct 2026)</option>
                    <option value="PINV221026105">PINV221026105 - Smart Technologies BD (22 Oct 2026)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Challan No & Date
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={receiveChallanNo}
                      onChange={e => setReceiveChallanNo(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-mono font-bold text-blue-700"
                    />
                    <input
                      type="text"
                      value={receiveDate}
                      onChange={e => setReceiveDate(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Note / Warehouse Remark
                  </label>
                  <input
                    type="text"
                    value={receiveNote}
                    onChange={e => setReceiveNote(e.target.value)}
                    placeholder="Enter goods condition or batch tag..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Receive Line Items Table */}
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3 text-center">Purchase</th>
                      <th className="py-2.5 px-3 text-center">Received</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">Rest Qty</th>
                      <th className="py-2.5 px-3 text-center w-28 bg-blue-50 text-blue-800 font-bold">
                        Receive Now
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receiveItemsForm.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-700">
                          {item.purchase}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">
                          {item.received}
                        </td>
                        <td className="py-2.5 px-3 text-center text-amber-700 font-bold">
                          {item.restQty}
                        </td>
                        <td className="py-2 px-3 text-center bg-blue-50/50">
                          <input
                            type="number"
                            min="0"
                            max={item.restQty}
                            value={item.now}
                            onChange={e => {
                              const val = Math.min(item.restQty, Math.max(0, Number(e.target.value)));
                              setReceiveItemsForm(prev =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, now: val } : it
                                )
                              );
                            }}
                            className="w-20 text-center border border-blue-400 rounded px-2 py-1 text-xs font-bold text-blue-900 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('purchaseReceive')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-xs font-semibold"
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  onClick={handleSaveReceive}
                  className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm"
                >
                  RECEIVE
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. BRANCH STOCK STATUS (image_b8061c43.png & e92e5002)    */}
          {/* ========================================================= */}
          {activeTab === 'branchStock' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden space-y-2">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-cubes text-[#0084bf]"></i>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    BRANCH STOCK STATUS
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300 font-medium"
                  >
                    <i className="fa fa-print mr-1"></i> Print
                  </button>
                  <button
                    onClick={() => {
                      alert('Exporting Branch Stock Matrix to Excel / CSV format.');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium shadow-sm"
                  >
                    <i className="fa fa-file-excel-o mr-1"></i> CSV Export
                  </button>
                </div>
              </div>

              {/* Branch Filter & Search Bar */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-gray-600">Branch:</span>
                    <select
                      value={selectedBranchFilter}
                      onChange={e => setSelectedBranchFilter(e.target.value)}
                      className="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:ring-1 focus:ring-[#0084bf]"
                    >
                      <option value="All">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-gray-600">Category:</span>
                    <select
                      value={selectedCategoryFilter}
                      onChange={e => setSelectedCategoryFilter(e.target.value)}
                      className="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:ring-1 focus:ring-[#0084bf]"
                    >
                      <option value="All">All Categories</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Laptop Accessories">Laptop Accessories</option>
                      <option value="Laptop">Laptop</option>
                      <option value="SSD">SSD</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by SKU or Item Name..."
                    className="border border-gray-300 rounded px-3 py-1 text-xs bg-white focus:ring-1 focus:ring-[#0084bf] w-56"
                  />
                </div>
              </div>

              {/* Complex Multi-Tier Matrix Table */}
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 text-center">
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 w-8">SN</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-3 text-left min-w-[160px]">NAME</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2">COLOR</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2">SIZE</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 font-mono">SKU</th>

                      {/* PURCHASE DETAILS */}
                      <th colSpan={4} className="border border-gray-300 py-1.5 px-2 bg-blue-50 text-blue-900">
                        PURCHASE DETAILS
                      </th>

                      {/* TRANSACTION DETAILS */}
                      <th colSpan={3} className="border border-gray-300 py-1.5 px-2 bg-indigo-50 text-indigo-900">
                        TRANSACTION DETAILS
                      </th>

                      {/* SOLD DETAILS */}
                      <th colSpan={5} className="border border-gray-300 py-1.5 px-2 bg-amber-50 text-amber-900">
                        SOLD DETAILS
                      </th>

                      {/* WARRANTY */}
                      <th colSpan={3} className="border border-gray-300 py-1.5 px-2 bg-purple-50 text-purple-900">
                        WARRANTY
                      </th>

                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 bg-red-50 text-red-800">
                        DP.QTY
                      </th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 bg-green-100 text-green-900 font-extrabold">
                        IN-STOCK
                      </th>

                      {/* SOLD SUMMARY */}
                      <th colSpan={2} className="border border-gray-300 py-1.5 px-2 bg-teal-50 text-teal-900">
                        SOLD SUMMARY
                      </th>
                    </tr>

                    {/* Subheaders Row 2 */}
                    <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300 text-center text-[10px]">
                      {/* Under Purchase */}
                      <th className="border border-gray-300 py-1 px-1.5 bg-blue-50/60">Purchase</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-blue-50/60">Received</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-blue-50/60">Return</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-blue-100 font-bold text-blue-900">Balance</th>

                      {/* Under Transaction */}
                      <th className="border border-gray-300 py-1 px-1.5 bg-indigo-50/60">Received</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-indigo-50/60">Send</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-indigo-100 font-bold text-indigo-900">Balance</th>

                      {/* Under Sold */}
                      <th className="border border-gray-300 py-1 px-1.5 bg-amber-50/60">Sold</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-amber-50/60">Deli</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-amber-50/60">Ad.Bal</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-amber-50/60">Return</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-amber-100 font-bold text-amber-900">Balance</th>

                      {/* Under Warranty */}
                      <th className="border border-gray-300 py-1 px-1.5 bg-purple-50/60">Replace</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-purple-50/60">Sup.Rec</th>
                      <th className="border border-gray-300 py-1 px-1.5 bg-purple-100 font-bold text-purple-900">Balance</th>

                      {/* Under Sold Summary */}
                      <th className="border border-gray-300 py-1 px-1.5 bg-teal-50/60 text-red-600 font-bold">Undeli</th>
                      <th className="border border-gray-300 py-1 px-2 bg-teal-100 font-bold text-teal-900">Net.Sale$</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-center font-mono text-[11px]">
                    {stockItems
                      .filter(
                        stk =>
                          stk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stk.sku.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, idx) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="border border-gray-200 py-1.5 px-2 text-gray-500 font-sans">
                            {idx + 1}
                          </td>
                          <td className="border border-gray-200 py-1.5 px-3 text-left font-sans font-semibold text-gray-800">
                            {item.name}
                          </td>
                          <td className="border border-gray-200 py-1.5 px-2 text-gray-600 font-sans">
                            {item.color}
                          </td>
                          <td className="border border-gray-200 py-1.5 px-2 text-gray-600 font-sans">
                            {item.size}
                          </td>
                          <td className="border border-gray-200 py-1.5 px-2 font-bold text-gray-700">
                            {item.sku}
                          </td>

                          {/* Purchase */}
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.purchase}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.pReceived}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-500">{item.pReturn}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 bg-blue-50/50 font-bold text-blue-900">{item.pBalance}</td>

                          {/* Transaction */}
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.tReceived}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.tSend}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 bg-indigo-50/50 font-bold text-indigo-900">{item.tBalance}</td>

                          {/* Sold */}
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.sold}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.deli}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-700">{item.adBal}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-500">{item.sReturn}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 bg-amber-50/50 font-bold text-amber-900">{item.sBalance}</td>

                          {/* Warranty */}
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-600">{item.wReplace}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 text-gray-600">{item.wSupRec}</td>
                          <td className="border border-gray-200 py-1.5 px-1.5 bg-purple-50/50 font-bold text-purple-900">{item.wBalance}</td>

                          {/* DP.QTY */}
                          <td className="border border-gray-200 py-1.5 px-2 bg-red-50/60 font-bold text-red-700">
                            {item.dpQty}
                          </td>

                          {/* IN-STOCK */}
                          <td className="border border-gray-200 py-1.5 px-2 bg-green-100 font-extrabold text-green-900 text-xs">
                            {item.inStock}
                          </td>

                          {/* Sold Summary */}
                          <td className="border border-gray-200 py-1.5 px-2 font-bold text-red-600">
                            {item.undeli}
                          </td>
                          <td className="border border-gray-200 py-1.5 px-2 bg-teal-50/50 font-bold text-teal-900 text-right pr-2">
                            {formatBDT(item.netSaleAmount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Exact Red Legend from Screenshot image_b8061c43.png */}
              <div className="p-3 bg-red-50/80 border-t border-red-200 text-[11px] text-red-700 font-medium leading-relaxed">
                <span className="font-bold underline mr-1">NOTE:</span>
                DELI: Delivered, AD.BAL: Balance after Delivered, SUP.REC: Warrany Received from Supplier, DP.QTY: Disposal or Adjust Product, UNDELI: Undelivered Product after Sold.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. WAREHOUSE STOCK (image_13a9d203.png)                   */}
          {/* ========================================================= */}
          {activeTab === 'warehouseStock' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden space-y-2">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-database text-[#0084bf]"></i>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    WAREHOUSE STOCK STATUS
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-gray-600">Select Warehouse:</span>
                  <select
                    value={selectedWarehouseFilter}
                    onChange={e => setSelectedWarehouseFilter(e.target.value)}
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:ring-1 focus:ring-[#0084bf] font-bold text-blue-700"
                  >
                    <option value="MIRPUR 11">MIRPUR 11</option>
                    <option value="IDB Central Hub">IDB CENTRAL HUB</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 text-center">
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 w-8">SN</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-3 text-left">NAME</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 font-mono">SKU</th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 text-purple-700">WAREHOUSE</th>
                      <th colSpan={2} className="border border-gray-300 py-1.5 px-2 bg-blue-50 text-blue-900">
                        PURCHASE DETAILS
                      </th>
                      <th colSpan={2} className="border border-gray-300 py-1.5 px-2 bg-indigo-50 text-indigo-900">
                        TRANSACTION DETAILS
                      </th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-2 bg-red-50 text-red-800">
                        ADJUST
                      </th>
                      <th rowSpan={2} className="border border-gray-300 py-2 px-3 bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                        AVAILABLE
                      </th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300 text-center text-[10px]">
                      <th className="border border-gray-300 py-1 px-2 bg-blue-50/60">Purchase</th>
                      <th className="border border-gray-300 py-1 px-2 bg-blue-100 font-bold text-blue-900">Received</th>
                      <th className="border border-gray-300 py-1 px-2 bg-indigo-50/60">Received</th>
                      <th className="border border-gray-300 py-1 px-2 bg-indigo-100 font-bold text-indigo-900">Send</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-center font-mono text-[11px]">
                    {stockItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="border border-gray-200 py-2 px-2 text-gray-500 font-sans">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 py-2 px-3 text-left font-sans font-semibold text-gray-800">
                          {item.name}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 font-bold text-gray-700">
                          {item.sku}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 font-bold text-purple-700 font-sans">
                          {selectedWarehouseFilter}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 text-gray-700">{item.purchase}</td>
                        <td className="border border-gray-200 py-2 px-2 bg-blue-50 font-bold text-blue-900">{item.pReceived}</td>
                        <td className="border border-gray-200 py-2 px-2 text-gray-700">{item.tReceived}</td>
                        <td className="border border-gray-200 py-2 px-2 bg-indigo-50 font-bold text-indigo-900">{item.tSend}</td>
                        <td className="border border-gray-200 py-2 px-2 bg-red-50 text-red-700 font-bold">{item.dpQty}</td>
                        <td className="border border-gray-200 py-2 px-3 bg-emerald-100 font-extrabold text-emerald-900 text-xs">
                          {item.inStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. COMBINED STOCK (image_c9442d8f.png)                    */}
          {/* ========================================================= */}
          {activeTab === 'combinedStock' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden space-y-2">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-clone text-[#0084bf]"></i>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    ALL OVER STOCK STATUS (WAREHOUSE + BRANCH)
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300 font-medium"
                  >
                    <i className="fa fa-print mr-1"></i> Print All
                  </button>
                </div>
              </div>

              {/* Aggregated Overview */}
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 text-center">
                      <th className="border border-gray-300 py-2 px-2 w-8">SN</th>
                      <th className="border border-gray-300 py-2 px-3 text-left">ITEM NAME</th>
                      <th className="border border-gray-300 py-2 px-2">SKU</th>
                      <th className="border border-gray-300 py-2 px-2 bg-blue-50 text-blue-900">Total Purchase</th>
                      <th className="border border-gray-300 py-2 px-2 bg-amber-50 text-amber-900">Total Sold</th>
                      <th className="border border-gray-300 py-2 px-2 bg-red-50 text-red-800">Disposed</th>
                      <th className="border border-gray-300 py-2 px-3 bg-green-100 text-green-900 font-bold">Total In-Stock</th>
                      <th className="border border-gray-300 py-2 px-3 bg-teal-50 text-teal-900">Total Sales Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-center font-mono text-[11px]">
                    {stockItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="border border-gray-200 py-2 px-2 text-gray-500 font-sans">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 py-2 px-3 text-left font-sans font-semibold text-gray-800">
                          {item.name}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 font-bold text-gray-700">
                          {item.sku}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 bg-blue-50 font-bold text-blue-900">
                          {item.purchase}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 bg-amber-50 font-bold text-amber-900">
                          {item.sold}
                        </td>
                        <td className="border border-gray-200 py-2 px-2 bg-red-50 text-red-700 font-bold">
                          {item.dpQty}
                        </td>
                        <td className="border border-gray-200 py-2 px-3 bg-green-100 font-extrabold text-green-900">
                          {item.inStock}
                        </td>
                        <td className="border border-gray-200 py-2 px-3 bg-teal-50 font-bold text-teal-900 text-right pr-3">
                          {formatBDT(item.netSaleAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold text-gray-800 border-t-2 border-gray-300 text-center text-xs">
                      <td colSpan={3} className="py-2.5 px-3 text-right uppercase">
                        Consolidated Totals:
                      </td>
                      <td className="py-2.5 px-2 bg-blue-100 text-blue-900 font-mono">
                        {stockItems.reduce((acc, i) => acc + i.purchase, 0)}
                      </td>
                      <td className="py-2.5 px-2 bg-amber-100 text-amber-900 font-mono">
                        {stockItems.reduce((acc, i) => acc + i.sold, 0)}
                      </td>
                      <td className="py-2.5 px-2 bg-red-100 text-red-900 font-mono">
                        {stockItems.reduce((acc, i) => acc + i.dpQty, 0)}
                      </td>
                      <td className="py-2.5 px-3 bg-green-200 text-green-950 font-extrabold font-mono">
                        {stockItems.reduce((acc, i) => acc + i.inStock, 0)}
                      </td>
                      <td className="py-2.5 px-3 bg-teal-100 text-teal-950 font-mono text-right pr-3 font-bold">
                        {formatBDT(stockItems.reduce((acc, i) => acc + i.netSaleAmount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. BRANCH TRANSFER LIST (image_75cca7a4.png)              */}
          {/* ========================================================= */}
          {activeTab === 'branchTransfer' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084bf]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    TRANSFER RECORD
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('branchTransferCreate')}
                  className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> CREATE TRANSFER
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Transfer No</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3">To</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transfers
                      .filter(t => t.type === 'branch')
                      .map((t, idx) => (
                        <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">
                            {t.date}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-blue-700 font-mono">
                            {t.transferNo}
                          </td>
                          <td className="py-2.5 px-3 text-gray-800 font-medium">
                            {t.from}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                            {t.to}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {t.note}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                alert(`Transfer ${t.transferNo} Challan view`);
                              }}
                              className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-2 py-1 rounded text-[11px]"
                            >
                              <i className="fa fa-print"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8b. BRANCH TRANSFER CREATE (image_34955291.png)           */}
          {/* ========================================================= */}
          {activeTab === 'branchTransferCreate' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-exchange text-[#0084bf] text-lg"></i>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    TRANSFER FROM BRANCH
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('branchTransfer')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                >
                  Back to List
                </button>
              </div>

              {/* Transfer Header Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Branch</label>
                  <select
                    value={transferFrom}
                    onChange={e => setTransferFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-semibold text-blue-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">To Branch / Warehouse</label>
                  <select
                    value={transferTo}
                    onChange={e => setTransferTo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-semibold text-emerald-800"
                  >
                    <option value="Mirpur 11">Mirpur 11 (Warehouse)</option>
                    <option value="IDB Central Hub">IDB Central Hub (Warehouse)</option>
                    <option value="Mirpur 10">Mirpur 10 (Branch)</option>
                    <option value="Uttara Branch">Uttara Branch (Branch)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transfer No & Date</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={transferNo}
                      onChange={e => setTransferNo(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={transferDate}
                      onChange={e => setTransferDate(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transfer Note</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={e => setTransferNote(e.target.value)}
                    placeholder="Stock replenishment note..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Split View: Products on Left, Transfer Cart on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Product Picker */}
                <div className="border border-gray-200 rounded p-3 space-y-2 bg-gray-50/50">
                  <div className="flex items-center space-x-2">
                    <i className="fa fa-search text-gray-400 text-xs"></i>
                    <input
                      type="text"
                      value={transferSearch}
                      onChange={e => setTransferSearch(e.target.value)}
                      placeholder="Search product by name or SKU..."
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 divide-y divide-gray-100">
                    {stockItems
                      .filter(
                        i =>
                          i.name.toLowerCase().includes(transferSearch.toLowerCase()) ||
                          i.sku.toLowerCase().includes(transferSearch.toLowerCase())
                      )
                      .map(item => (
                        <div
                          key={item.id}
                          className="pt-1.5 flex items-center justify-between text-xs hover:bg-blue-50/60 p-1.5 rounded transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              SKU: {item.sku} &bull; Stock: <span className="font-bold text-emerald-700">{item.inStock}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddTransferItem(item)}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm"
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right: Transfer Cart */}
                <div className="border border-gray-200 rounded p-3 space-y-3 bg-white">
                  <div className="font-bold text-xs text-gray-700 uppercase border-b border-gray-100 pb-1.5 flex justify-between items-center">
                    <span>Transfer Items Cart</span>
                    <span className="text-blue-600 font-mono font-semibold">
                      {transferCart.length} item(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <th className="py-1.5 px-2">SN</th>
                          <th className="py-1.5 px-2">Item</th>
                          <th className="py-1.5 px-2 text-center w-16">Qty</th>
                          <th className="py-1.5 px-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transferCart.map((cartItem, idx) => (
                          <tr key={cartItem.productId}>
                            <td className="py-1.5 px-2 text-gray-500">{idx + 1}</td>
                            <td className="py-1.5 px-2">
                              <div className="font-semibold text-gray-800">{cartItem.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{cartItem.sku}</div>
                              {!cartItem.hasSerial && (
                                <div className="text-[10px] text-amber-700 font-medium">
                                  No IMEI or Product Serial!
                                </div>
                              )}
                              {cartItem.hasSerial && cartItem.serials.length > 0 && (
                                <div className="text-[10px] text-blue-600 font-mono">
                                  SN: {cartItem.serials.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={cartItem.qty}
                                onChange={e => {
                                  const val = Math.max(1, Number(e.target.value));
                                  setTransferCart(prev =>
                                    prev.map((c, i) =>
                                      i === idx ? { ...c, qty: val } : c
                                    )
                                  );
                                }}
                                className="w-14 text-center border border-gray-300 rounded px-1.5 py-0.5 text-xs font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() =>
                                  setTransferCart(prev =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                      onClick={handleExecuteTransfer}
                      disabled={transferCart.length === 0}
                      className="bg-[#0084bf] hover:bg-[#006e9f] disabled:opacity-50 text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm"
                    >
                      TRANSFER
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. WAREHOUSE TRANSFER (image_eabfd365.png & 7f3c3ee6)     */}
          {/* ========================================================= */}
          {activeTab === 'warehouseTransfer' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#605ca8]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    WAREHOUSE TRANSFER RECORD
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('warehouseTransferCreate')}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> CREATE WAREHOUSE TRANSFER
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Transfer No</th>
                      <th className="py-2.5 px-3">From Warehouse</th>
                      <th className="py-2.5 px-3">To Branch</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transfers
                      .filter(t => t.type === 'warehouse')
                      .map((t, idx) => (
                        <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 font-mono">
                            {t.date}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-purple-700 font-mono">
                            {t.transferNo}
                          </td>
                          <td className="py-2.5 px-3 text-gray-800 font-semibold">
                            {t.from}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                            {t.to}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {t.note}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                alert(`Warehouse Transfer ${t.transferNo} slip view`);
                              }}
                              className="bg-[#605ca8] hover:bg-[#504c96] text-white px-2 py-1 rounded text-[11px]"
                            >
                              <i className="fa fa-print"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'warehouseTransferCreate' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-arrows-h text-[#605ca8] text-lg"></i>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    TRANSFER FROM WAREHOUSE
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('warehouseTransfer')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                >
                  Back to List
                </button>
              </div>

              {/* Warehouse Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">From Warehouse</label>
                  <select
                    value={transferFrom}
                    onChange={e => setTransferFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-semibold text-purple-800"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">To Branch</label>
                  <select
                    value={transferTo}
                    onChange={e => setTransferTo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-semibold text-blue-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transfer No & Date</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={transferNo}
                      onChange={e => setTransferNo(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={transferDate}
                      onChange={e => setTransferDate(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Dispatch Remark</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={e => setTransferNote(e.target.value)}
                    placeholder="Courier or driver slip no..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActiveTab('warehouseTransfer')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-xs font-semibold"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm"
                >
                  TRANSFER NOW
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. PRODUCT DISPOSAL LIST (image_fba9767a.png)            */}
          {/* ========================================================= */}
          {activeTab === 'productDisposal' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dd4b39]"></span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    DISPOSAL RECORD
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('productDisposalCreate')}
                  className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center shadow-sm transition-colors"
                >
                  <i className="fa fa-plus mr-1.5"></i> CREATE DISPOSAL
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-12 text-center">SN</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Disposal No</th>
                      <th className="py-2.5 px-3">From</th>
                      <th className="py-2.5 px-3 text-right">Dispos (Cost)</th>
                      <th className="py-2.5 px-3 text-right">Recover</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {disposals.map((dsp, idx) => (
                      <tr key={dsp.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 font-mono">
                          {dsp.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-red-700 font-mono">
                          {dsp.disposalNo}
                        </td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium">
                          {dsp.from}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-red-700 font-mono">
                          {formatBDT(dsp.cost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                          {formatBDT(dsp.recover)}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {dsp.note}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setViewingDisposalSlip(dsp)}
                            className="bg-[#0084bf] hover:bg-[#006e9f] text-white px-2 py-1 rounded text-[11px]"
                          >
                            <i className="fa fa-print mr-1"></i> Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10b. PRODUCT DISPOSAL CREATE (image_e0a97b8d & 0d7fa46d)  */}
          {/* ========================================================= */}
          {activeTab === 'productDisposalCreate' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fa fa-trash-o text-[#dd4b39] text-lg"></i>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    DISPOSAL CREATE
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('productDisposal')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                >
                  Back to List
                </button>
              </div>

              {/* Disposal Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Select Branch / Warehouse
                  </label>
                  <select
                    value={disposalFrom}
                    onChange={e => setDisposalFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-semibold text-red-700"
                  >
                    <option value="No Branch">No Branch (Direct Central)</option>
                    <option value="Taltola">Taltola Branch</option>
                    <option value="Mirpur 11">Mirpur 11 (Warehouse)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Disposal No & Date</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={disposalNo}
                      onChange={e => setDisposalNo(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs font-mono font-bold text-red-700"
                    />
                    <input
                      type="text"
                      value={disposalDate}
                      onChange={e => setDisposalDate(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded px-2 py-1.5 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Recover Amount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={disposalRecover}
                    onChange={e => setDisposalRecover(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reason / Note</label>
                  <input
                    type="text"
                    value={disposalNote}
                    onChange={e => setDisposalNote(e.target.value)}
                    placeholder="Water damaged, motherboard burnout..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Two Column Layout: Product selection & Disposal Cart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Search & Catalog on Left */}
                <div className="border border-gray-200 rounded p-3 space-y-2 bg-gray-50/50">
                  <div className="flex items-center space-x-2">
                    <i className="fa fa-search text-gray-400 text-xs"></i>
                    <input
                      type="text"
                      value={disposalSearch}
                      onChange={e => setDisposalSearch(e.target.value)}
                      placeholder="Search items for disposal..."
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs bg-white"
                    />
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 divide-y divide-gray-100">
                    {stockItems
                      .filter(
                        i =>
                          i.name.toLowerCase().includes(disposalSearch.toLowerCase()) ||
                          i.sku.toLowerCase().includes(disposalSearch.toLowerCase())
                      )
                      .map(item => (
                        <div
                          key={item.id}
                          className="pt-1.5 flex items-center justify-between text-xs hover:bg-red-50/60 p-1.5 rounded transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              SKU: {item.sku} &bull; Cost: ৳1,200
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddDisposalItem(item)}
                            className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm"
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Disposal Cart on Right */}
                <div className="border border-gray-200 rounded p-3 space-y-3 bg-white">
                  <div className="font-bold text-xs text-gray-700 uppercase border-b border-gray-100 pb-1.5 flex justify-between items-center">
                    <span>Disposal Cart</span>
                    <span className="text-red-700 font-mono font-bold">
                      Total Cost: {formatBDT(disposalCart.reduce((acc, c) => acc + c.subtotal, 0))}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <th className="py-1.5 px-2">SN</th>
                          <th className="py-1.5 px-2">Item</th>
                          <th className="py-1.5 px-2 text-right">Cost</th>
                          <th className="py-1.5 px-2 text-center w-14">Qty</th>
                          <th className="py-1.5 px-2 text-right">SubTotal</th>
                          <th className="py-1.5 px-2 text-center w-10">Act</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {disposalCart.map((cartItem, idx) => (
                          <tr key={cartItem.productId}>
                            <td className="py-1.5 px-2 text-gray-500">{idx + 1}</td>
                            <td className="py-1.5 px-2">
                              <div className="font-semibold text-gray-800">{cartItem.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{cartItem.sku}</div>
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono">
                              {cartItem.cost}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={cartItem.qty}
                                onChange={e => {
                                  const val = Math.max(1, Number(e.target.value));
                                  setDisposalCart(prev =>
                                    prev.map((c, i) =>
                                      i === idx
                                        ? { ...c, qty: val, subtotal: val * c.cost }
                                        : c
                                    )
                                  );
                                }}
                                className="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-xs font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold text-red-700 font-mono">
                              {cartItem.subtotal}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() =>
                                  setDisposalCart(prev =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Serial Number Barcode input for Disposed Items */}
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs space-y-1.5">
                    <label className="font-semibold text-gray-700 flex items-center justify-between">
                      <span>Input IMEI / Serial for Disposed Units:</span>
                      <span className="text-[10px] text-gray-400">Press Enter to add</span>
                    </label>
                    <input
                      type="text"
                      value={newDisposalSerialInput}
                      onChange={e => setNewDisposalSerialInput(e.target.value)}
                      onKeyDown={handleAddDisposalSerial}
                      placeholder="e.g. SPK-88123-A or scan barcode..."
                      className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs font-mono bg-white"
                    />
                    {disposalCart.length > 0 && disposalCart[0].serials.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {disposalCart[0].serials.map((sn, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-red-100 text-red-800 text-[10px] font-mono px-2 py-0.5 rounded flex items-center"
                          >
                            {sn}
                            <button
                              onClick={() => {
                                setDisposalCart(prev => {
                                  const updated = [...prev];
                                  updated[0].serials = updated[0].serials.filter((_, i) => i !== sIdx);
                                  return updated;
                                });
                              }}
                              className="ml-1 text-red-600 font-bold"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Buttons matching image_0d7fa46d.png: EMPTY & DISPOSED */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setDisposalCart([])}
                      className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-4 py-1.5 rounded text-xs font-bold"
                    >
                      EMPTY
                    </button>
                    <button
                      onClick={handleExecuteDisposal}
                      disabled={disposalCart.length === 0}
                      className="bg-[#605ca8] hover:bg-[#504c96] disabled:opacity-50 text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm"
                    >
                      DISPOSED
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: HISTORY Log matching Tech Drive ERP screenshots */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#f9fafb] px-3.5 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <i className="fa fa-history text-gray-500 text-xs"></i>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  HISTORY
                </h3>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                {historyLogs.length} events
              </span>
            </div>

            <div className="p-3 text-xs space-y-3 max-h-[560px] overflow-y-auto">
              {historyLogs.map(log => (
                <div
                  key={log.id}
                  className="relative pl-4 border-l-2 border-[#0084bf] py-1 text-gray-600"
                >
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#0084bf]"></span>
                  <div className="font-semibold text-gray-800 text-[11px] leading-tight">
                    {log.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>{log.user}</span>
                    <span className="font-mono">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded p-3 text-xs space-y-1.5 text-blue-900">
            <div className="font-bold flex items-center">
              <i className="fa fa-info-circle mr-1.5 text-[#0084bf]"></i>
              Inventory Note
            </div>
            <p className="text-[11px] text-blue-800 leading-normal">
              Deliveries and transfer dispatches directly adjust the live stock matrix. Use "Combined Stock" for aggregate audits across branches & central warehouses.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DRAWER: BRANCH CREATE / EDIT (matching image_7cb419ff.png) */}
      {/* ========================================================= */}
      {isBranchDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-left">
            {/* Header */}
            <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {editingBranch ? 'BRANCH EDIT' : 'BRANCH CREATE'}
              </h3>
              <button
                onClick={() => setIsBranchDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBranch} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="e.g. Taltola"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name (Bangla)
                </label>
                <input
                  type="text"
                  value={branchForm.nameBn}
                  onChange={e => setBranchForm({ ...branchForm, nameBn: e.target.value })}
                  placeholder="e.g. তালতলা"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branchForm.phone}
                  onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                  placeholder="e.g. 01618070088"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={branchForm.email}
                  onChange={e => setBranchForm({ ...branchForm, email: e.target.value })}
                  placeholder="e.g. info@axesgl.com"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Address (English)
                </label>
                <textarea
                  rows={2}
                  value={branchForm.addressEn}
                  onChange={e => setBranchForm({ ...branchForm, addressEn: e.target.value })}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Address (Bengoli)
                </label>
                <textarea
                  rows={2}
                  value={branchForm.addressBn}
                  onChange={e => setBranchForm({ ...branchForm, addressBn: e.target.value })}
                  placeholder="e.g. ঢাকা, বাংলাদেশ"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBranchDrawerOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded font-semibold text-xs transition-colors"
                >
                  CLOSE
                </button>
                <button
                  type="submit"
                  className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-1.5 rounded font-bold text-xs shadow-sm transition-colors"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: WAREHOUSE CREATE / EDIT (matching image_00dbdf23) */}
      {/* ========================================================= */}
      {isWarehouseDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {editingWarehouse ? 'WAREHOUSE EDIT' : 'WAREHOUSE CREATE'}
              </h3>
              <button
                onClick={() => setIsWarehouseDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={warehouseForm.name}
                  onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  placeholder="e.g. Mirpur 11"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Name (Bangla)
                </label>
                <input
                  type="text"
                  value={warehouseForm.nameBn}
                  onChange={e => setWarehouseForm({ ...warehouseForm, nameBn: e.target.value })}
                  placeholder="e.g. মিরপুর ১১"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={warehouseForm.phone}
                  onChange={e => setWarehouseForm({ ...warehouseForm, phone: e.target.value })}
                  placeholder="e.g. 01972379494"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={warehouseForm.email}
                  onChange={e => setWarehouseForm({ ...warehouseForm, email: e.target.value })}
                  placeholder="e.g. axes.mirpur11@gmail.com"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Address (English)
                </label>
                <textarea
                  rows={2}
                  value={warehouseForm.addressEn}
                  onChange={e => setWarehouseForm({ ...warehouseForm, addressEn: e.target.value })}
                  placeholder="e.g. Paris road, Mirpur 11, Dhaka"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Address (Bengoli)
                </label>
                <textarea
                  rows={2}
                  value={warehouseForm.addressBn}
                  onChange={e => setWarehouseForm({ ...warehouseForm, addressBn: e.target.value })}
                  placeholder="e.g. প্যারিস রোড, মিরপুর ১১, ঢাকা"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseDrawerOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded font-semibold text-xs"
                >
                  CLOSE
                </button>
                <button
                  type="submit"
                  className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-1.5 rounded font-bold text-xs shadow-sm"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELIVERY CHALLAN PRINT PREVIEW                     */}
      {/* ========================================================= */}
      {viewingDeliveryChallan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  DELIVERY CHALLAN &bull; TECH DRIVE ERP
                </h3>
                <p className="text-xs text-gray-500">
                  Challan No: <span className="font-mono font-bold text-blue-700">{viewingDeliveryChallan.challanNo}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingDeliveryChallan(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded border">
              <div>
                <p className="text-gray-500">Invoice No: <span className="font-bold text-gray-800">{viewingDeliveryChallan.invoiceNo}</span></p>
                <p className="text-gray-500">Customer: <span className="font-bold text-gray-800">{viewingDeliveryChallan.customerName || 'Direct'}</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Date: <span className="font-bold text-gray-800">{viewingDeliveryChallan.date}</span></p>
                <p className="text-gray-500">From: <span className="font-bold text-gray-800">{viewingDeliveryChallan.from}</span></p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b">
                  <th className="py-2 px-3 w-10 text-center">SN</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3 text-center">Delivered Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {viewingDeliveryChallan.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">{it.name}</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{it.code}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-700">{it.delivered}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs text-gray-500 italic">
              Note: {viewingDeliveryChallan.note}
            </div>

            <div className="pt-8 flex justify-between text-xs border-t border-gray-200">
              <div className="text-center">
                <div className="border-t border-gray-400 w-36 pt-1 font-semibold">Receiver's Signature</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-36 pt-1 font-semibold">Authorized Dispatcher</div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-[#0084bf] text-white px-4 py-1.5 rounded text-xs font-bold"
              >
                <i className="fa fa-print mr-1"></i> Print Challan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DISPOSAL SLIP PREVIEW                              */}
      {/* ========================================================= */}
      {viewingDisposalSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-red-700">
                  PRODUCT DISPOSAL SLIP &bull; TECH DRIVE ERP
                </h3>
                <p className="text-xs text-gray-500">
                  Disposal No: <span className="font-mono font-bold">{viewingDisposalSlip.disposalNo}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingDisposalSlip(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-red-50/50 p-3 rounded border border-red-200">
              <div>
                <p className="text-gray-600">Location: <span className="font-bold text-gray-900">{viewingDisposalSlip.from}</span></p>
                <p className="text-gray-600">Disposal Date: <span className="font-bold text-gray-900">{viewingDisposalSlip.date}</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Total Scrapped Cost: <span className="font-bold text-red-700 font-mono">{formatBDT(viewingDisposalSlip.cost)}</span></p>
                <p className="text-gray-600">Recovered Value: <span className="font-bold text-emerald-700 font-mono">{formatBDT(viewingDisposalSlip.recover)}</span></p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b">
                  <th className="py-2 px-3 w-10 text-center">SN</th>
                  <th className="py-2 px-3">Item Disposed</th>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Cost (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {viewingDisposalSlip.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">
                      <div>{it.name}</div>
                      {it.serials && it.serials.length > 0 && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          Serials: {it.serials.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-gray-600">{it.sku}</td>
                    <td className="py-2 px-3 text-center font-bold text-gray-700">{it.qty}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-red-700">{formatBDT(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs text-gray-500">
              Reason / Remark: <span className="font-semibold text-gray-700">{viewingDisposalSlip.note}</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-[#dd4b39] text-white px-4 py-1.5 rounded text-xs font-bold"
              >
                <i className="fa fa-print mr-1"></i> Print Disposal Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
