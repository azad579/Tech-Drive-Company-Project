import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  INITIAL_WARRANTY_CLAIMS,
  INITIAL_SERVICE_CENTERS,
  INITIAL_WARRANTY_STOCKS,
  INITIAL_BAD_STOCK_CLAIMS
} from '../data/mockServiceWarranty';
import {
  WarrantyClaim,
  ServiceCenter,
  WarrantyStockItem,
  SupplierBadStockClaim
} from '../types';

interface WarrantyViewProps {
  initialTab?: 'claim' | 'checking' | 'manage' | 'delivered' | 'stock' | 'supplier' | 'serviceCenter';
}

export const WarrantyView: React.FC<WarrantyViewProps> = ({ initialTab = 'claim' }) => {
  const { setCurrentRoute } = useApp();

  const [activeTab, setActiveTab] = useState<'claim' | 'checking' | 'manage' | 'delivered' | 'stock' | 'supplier' | 'serviceCenter'>(initialTab);

  // Data States
  const [claims, setClaims] = useState<WarrantyClaim[]>(INITIAL_WARRANTY_CLAIMS);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>(INITIAL_SERVICE_CENTERS);
  const [stocks] = useState<WarrantyStockItem[]>(INITIAL_WARRANTY_STOCKS);
  const [badClaims, setBadClaims] = useState<SupplierBadStockClaim[]>(INITIAL_BAD_STOCK_CLAIMS);

  // Drawers & Modals
  const [selectedClaimForReceipt, setSelectedClaimForReceipt] = useState<WarrantyClaim | null>(null);
  const [editingClaim, setEditingClaim] = useState<WarrantyClaim | null>(null);
  const [isClaimDrawerOpen, setIsClaimDrawerOpen] = useState(false);
  const [isCheckingDrawerOpen, setIsCheckingDrawerOpen] = useState(false);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [isServiceCenterDrawerOpen, setIsServiceCenterDrawerOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);

  // Form states
  const [claimForm, setClaimForm] = useState({
    productName: '',
    serial: '',
    invoiceNo: 'SEL231026102',
    salesDate: '23 Oct 2026',
    warrantyExpired: '22 Oct 2027',
    status: 'Checking' as WarrantyClaim['status'],
    claimNote: '',
    checkingNote: '',
    serviceCenter: 'City Laptop Zone'
  });

  const [checkingForm, setCheckingForm] = useState({
    claimNo: '',
    serial: '',
    claimNote: '',
    checkingNote: '',
    status: 'Send for Warranty' as WarrantyClaim['status']
  });

  const [manageForm, setManageForm] = useState({
    claimNo: '',
    product: '',
    serial: '',
    status: 'Received & Replaced',
    receivedDetails: 'Motherboard IC replaced and firmware updated',
    replacedSerial: ''
  });

  const [centerForm, setCenterForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive',
    remarks: ''
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Open Claim Edit Drawer
  const handleOpenClaimDrawer = (claim?: WarrantyClaim) => {
    if (claim) {
      setEditingClaim(claim);
      setClaimForm({
        productName: claim.productName,
        serial: claim.serial,
        invoiceNo: claim.invoiceNo,
        salesDate: claim.salesDate,
        warrantyExpired: claim.warrantyExpired,
        status: claim.status,
        claimNote: claim.claimNote || '',
        checkingNote: claim.checkingNote || '',
        serviceCenter: claim.serviceCenter || 'City Laptop Zone'
      });
    } else {
      setEditingClaim(null);
      setClaimForm({
        productName: '',
        serial: '',
        invoiceNo: `SEL${Date.now().toString().slice(-6)}`,
        salesDate: '24 Oct 2026',
        warrantyExpired: '23 Oct 2027',
        status: 'Checking',
        claimNote: '',
        checkingNote: '',
        serviceCenter: 'City Laptop Zone'
      });
    }
    setIsClaimDrawerOpen(true);
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClaim) {
      setClaims(prev =>
        prev.map(c =>
          c.id === editingClaim.id
            ? {
                ...c,
                ...claimForm
              }
            : c
        )
      );
      setToastMessage(`Warranty claim ${editingClaim.claimNo} updated!`);
    } else {
      const claimNo = `CLA${Date.now().toString().slice(-6)}`;
      const newClaim: WarrantyClaim = {
        id: `war-${Date.now()}`,
        sn: claims.length + 1,
        date: '24 Oct 2026',
        claimNo,
        ...claimForm
      };
      setClaims([newClaim, ...claims]);
      setToastMessage(`New Warranty Claim ${claimNo} filed!`);
    }
    setIsClaimDrawerOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Checking Drawer (matching image_f9025164.png)
  const handleOpenCheckingDrawer = (claim: WarrantyClaim) => {
    setEditingClaim(claim);
    setCheckingForm({
      claimNo: claim.claimNo,
      serial: claim.serial,
      claimNote: claim.claimNote || '',
      checkingNote: claim.checkingNote || '',
      status: claim.status
    });
    setIsCheckingDrawerOpen(true);
  };

  const handleSaveChecking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim) return;

    setClaims(prev =>
      prev.map(c =>
        c.id === editingClaim.id
          ? {
              ...c,
              checkingNote: checkingForm.checkingNote,
              status: checkingForm.status
            }
          : c
      )
    );
    setToastMessage(`Inspection status updated for ${editingClaim.claimNo}`);
    setIsCheckingDrawerOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Manage Drawer (matching image_f07abf24.png)
  const handleOpenManageDrawer = (claim: WarrantyClaim) => {
    setEditingClaim(claim);
    setManageForm({
      claimNo: claim.claimNo,
      product: claim.productName,
      serial: claim.serial,
      status: 'Received & Replaced',
      receivedDetails: 'Motherboard IC replaced by authorized repair facility',
      replacedSerial: claim.serial + '-R'
    });
    setIsManageDrawerOpen(true);
  };

  const handleSaveManage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim) return;

    setClaims(prev =>
      prev.map(c =>
        c.id === editingClaim.id
          ? {
              ...c,
              status: 'Product Successfully Delivered!!!',
              checkingNote: `${c.checkingNote || ''} | Replacement Serial: ${manageForm.replacedSerial}`
            }
          : c
      )
    );
    setToastMessage(`Replacement details recorded for ${editingClaim.claimNo}`);
    setIsManageDrawerOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Service Center Drawer (matching image_a38626d1.png)
  const handleOpenCenterDrawer = (center?: ServiceCenter) => {
    if (center) {
      setEditingCenter(center);
      setCenterForm({
        name: center.name,
        contactPerson: center.contactPerson,
        phone: center.phone,
        address: center.address,
        status: center.status,
        remarks: center.remarks || ''
      });
    } else {
      setEditingCenter(null);
      setCenterForm({
        name: '',
        contactPerson: '',
        phone: '',
        address: '',
        status: 'Active',
        remarks: ''
      });
    }
    setIsServiceCenterDrawerOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerForm.name.trim()) return;

    if (editingCenter) {
      setServiceCenters(prev =>
        prev.map(sc => (sc.id === editingCenter.id ? { ...sc, ...centerForm } : sc))
      );
      setToastMessage(`Service Center "${centerForm.name}" updated!`);
    } else {
      const newSC: ServiceCenter = {
        id: `sc-${Date.now()}`,
        sn: serviceCenters.length + 1,
        ...centerForm
      };
      setServiceCenters([...serviceCenters, newSC]);
      setToastMessage(`Service Center "${centerForm.name}" added!`);
    }
    setIsServiceCenterDrawerOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#00a65a] text-white px-4 py-2.5 rounded shadow-lg flex items-center space-x-2 text-xs font-bold">
          <i className="fa fa-check-circle"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">
          {activeTab === 'claim' && 'Warranty Claim'}
          {activeTab === 'checking' && 'Product Checking'}
          {activeTab === 'manage' && 'Manage Warranty Product'}
          {activeTab === 'delivered' && 'Warranty Delivered Products'}
          {activeTab === 'stock' && 'Warranty Stock Status'}
          {activeTab === 'supplier' && 'Claim To Supplier'}
          {activeTab === 'serviceCenter' && 'Service Centers'}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span className="cursor-pointer hover:underline" onClick={() => setCurrentRoute('home.php')}>Dashboard</span>
          <span>&gt;</span>
          <span>Warranty Management</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">
            {activeTab === 'claim' && 'Warranty Claim'}
            {activeTab === 'checking' && 'Checking'}
            {activeTab === 'manage' && 'Manage Product'}
            {activeTab === 'delivered' && 'Delivered'}
            {activeTab === 'stock' && 'Stock'}
            {activeTab === 'supplier' && 'Supplier RMA'}
            {activeTab === 'serviceCenter' && 'Service Center'}
          </span>
        </div>
      </div>

      {/* Tab Navigation Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded border border-gray-200 text-xs">
        <button
          onClick={() => setActiveTab('claim')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'claim'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-shield"></i>
          <span>Warranty Claim ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('checking')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'checking'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-stethoscope"></i>
          <span>Product Checking</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'manage'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-tasks"></i>
          <span>Manage Product</span>
        </button>

        <button
          onClick={() => setActiveTab('delivered')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'delivered'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-truck"></i>
          <span>Warranty Delivered</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'stock'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-archive"></i>
          <span>Warranty Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('supplier')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'supplier'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-paper-plane"></i>
          <span>Claim To Supplier</span>
        </button>

        <button
          onClick={() => setActiveTab('serviceCenter')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'serviceCenter'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-hospital-o"></i>
          <span>Service Center</span>
        </button>
      </div>

      {/* ---------------- 1. WARRANTY CLAIM LIST (matching image_28ac5bc9.png) ---------------- */}
      {activeTab === 'claim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
                <span className="uppercase tracking-wide">WARRANTY CLAIM RECORD</span>
                <button
                  onClick={() => handleOpenClaimDrawer()}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
                >
                  <i className="fa fa-plus"></i>
                  <span>ADD NEW CLAIM</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">SN</th>
                      <th className="py-2.5 px-3 w-24">Date</th>
                      <th className="py-2.5 px-3 w-28">Claim No</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 w-32 font-mono">Serial</th>
                      <th className="py-2.5 px-3 w-28">Inv No</th>
                      <th className="py-2.5 px-3 w-24">Sales Date</th>
                      <th className="py-2.5 px-3 w-24">Warranty Exp</th>
                      <th className="py-2.5 px-3 w-36 text-center">Status</th>
                      <th className="py-2.5 px-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {claims.map((claim, idx) => (
                      <tr key={claim.id} className="hover:bg-sky-50/50 transition">
                        <td className="py-2 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium">{claim.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#0084bf]">{claim.claimNo}</td>
                        <td className="py-2 px-3 font-semibold text-gray-900">{claim.productName}</td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-800">{claim.serial}</td>
                        <td className="py-2 px-3 font-mono text-gray-600">{claim.invoiceNo}</td>
                        <td className="py-2 px-3 text-gray-500">{claim.salesDate}</td>
                        <td className="py-2 px-3 text-gray-500">{claim.warrantyExpired}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded block truncate ${
                              claim.status === 'Product Successfully Delivered!!!'
                                ? 'bg-emerald-100 text-emerald-800'
                                : claim.status === 'Warranty Denied & Send To Delivery'
                                ? 'bg-rose-100 text-rose-800'
                                : claim.status === 'Send for Warranty'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center space-x-1.5 whitespace-nowrap">
                          {/* Print Receipt Modal */}
                          <button
                            onClick={() => setSelectedClaimForReceipt(claim)}
                            className="text-[#0084bf] hover:text-sky-800 p-1"
                            title="Print Warranty Receipt"
                          >
                            <i className="fa fa-print"></i>
                          </button>
                          {/* Edit / Drawer */}
                          <button
                            onClick={() => handleOpenClaimDrawer(claim)}
                            className="text-amber-600 hover:text-amber-800 p-1"
                            title="Edit Claim"
                          >
                            <i className="fa fa-pencil"></i>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete claim ${claim.claimNo}?`)) {
                                setClaims(prev => prev.filter(c => c.id !== claim.id));
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right History Sidebar matching image_28ac5bc9.png */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-[#0084bf] text-white px-3 py-2 font-bold text-xs uppercase flex items-center justify-between">
                <span>History</span>
                <i className="fa fa-history"></i>
              </div>
              <div className="p-3 divide-y divide-gray-100 text-[11px] space-y-2 max-h-[500px] overflow-y-auto">
                <div className="pt-1.5 first:pt-0">
                  <div className="text-gray-400 font-medium">27 Aug 2026: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Warranty claim has been deleted</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">01 Oct 2025: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">New warranty claim CLA011025101 created</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">28 Sep 2025: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Warranty claim CLA280925102 dispatched to Service Hub</div>
                </div>
                <div className="pt-2">
                  <div className="text-gray-400 font-medium">14 Sep 2025: Tech Drive</div>
                  <div className="text-gray-700 font-semibold">Warranty item for CLA140925103 successfully delivered to customer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. PRODUCT CHECKING (matching image_8d3ad0bc.png) ---------------- */}
      {activeTab === 'checking' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">PRODUCT CHECKING BENCH</span>
            <span className="text-xs bg-sky-800 px-2 py-0.5 rounded">
              {claims.filter(c => c.status === 'Checking').length} Pending Inspection
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-32">Claim No</th>
                  <th className="py-2.5 px-3 w-36 font-mono">Serial</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Claim Note</th>
                  <th className="py-2.5 px-3">Checking Note</th>
                  <th className="py-2.5 px-3 w-40 text-center">Status</th>
                  <th className="py-2.5 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {claims.map((claim, idx) => (
                  <tr key={claim.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{claim.claimNo}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{claim.serial}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{claim.productName}</td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">{claim.claimNote || '-'}</td>
                    <td className="py-2.5 px-3 text-sky-900 font-medium text-[11px]">{claim.checkingNote || 'Pending testing...'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded block truncate ${
                          claim.status === 'Product Successfully Delivered!!!'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'Warranty Denied & Send To Delivery'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenCheckingDrawer(claim)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
                        title="Update Inspection Note & Status"
                      >
                        <i className="fa fa-stethoscope text-sm"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 3. MANAGE PRODUCT (matching image_a3bb1182.png) ---------------- */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">WARRANTY PRODUCT MANAGEMENT</span>
            <span className="text-xs font-normal">Tracking service center replacements &amp; deliveries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-32">Claim No</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 w-32 font-mono">Original Serial</th>
                  <th className="py-2.5 px-3 w-36">Assigned Center</th>
                  <th className="py-2.5 px-3 w-32 text-center">Status</th>
                  <th className="py-2.5 px-3 w-28 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {claims.map((claim, idx) => (
                  <tr key={claim.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{claim.claimNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{claim.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-700">{claim.serial}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-medium">{claim.serviceCenter || 'City Laptop Zone'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Waiting For Received
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenManageDrawer(claim)}
                        className="bg-[#605ca8] hover:bg-[#504c96] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center space-x-1 mx-auto"
                      >
                        <i className="fa fa-refresh"></i>
                        <span>Replace Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 4. WARRANTY DELIVERED (matching image_1ddf46d6.png) ---------------- */}
      {activeTab === 'delivered' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">WARRANTY DELIVERED RECORD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-28">Claim No</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 w-28 font-mono">Serial</th>
                  <th className="py-2.5 px-3">D.Product</th>
                  <th className="py-2.5 px-3 w-28 font-mono">D.Serial</th>
                  <th className="py-2.5 px-3 w-24">Settlement</th>
                  <th className="py-2.5 px-3">Delivery Note</th>
                  <th className="py-2.5 px-3 w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {claims
                  .filter(c => c.status.includes('Delivered'))
                  .map((c, idx) => (
                    <tr key={c.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{c.claimNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{c.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{c.serial}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">{c.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{c.serial}-REP</td>
                      <td className="py-2.5 px-3 text-gray-700">Replaced Fan</td>
                      <td className="py-2.5 px-3 text-gray-500 text-[11px]">{c.checkingNote}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 5. WARRANTY STOCK STATUS (matching image_4f09d48c.png) ---------------- */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">WARRANTY PRODUCT STOCK STATUS</span>
            <span className="text-xs bg-sky-800 px-2.5 py-0.5 rounded">Current Real-Time Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th rowSpan={2} className="py-2 px-3 w-10 text-center border-r border-[#002447]">SN</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-[#002447]">Product Name</th>
                  <th colSpan={4} className="py-1 px-3 text-center border-r border-[#002447] bg-[#053d71]">
                    Stock Details
                  </th>
                  <th colSpan={3} className="py-1 px-3 text-center bg-rose-900/60">
                    Bad Stock Details
                  </th>
                </tr>
                <tr className="bg-[#002447] text-[10px]">
                  <th className="py-1 px-2 text-center border-r border-gray-600">IN</th>
                  <th className="py-1 px-2 text-center border-r border-gray-600">OUT</th>
                  <th className="py-1 px-2 text-center border-r border-gray-600">DELIVERED</th>
                  <th className="py-1 px-2 text-center border-r border-[#002447] text-emerald-300 font-bold">AVAILABLE</th>
                  <th className="py-1 px-2 text-center border-r border-gray-600 text-rose-300">IN</th>
                  <th className="py-1 px-2 text-center border-r border-gray-600 text-rose-300">OUT</th>
                  <th className="py-1 px-2 text-center text-rose-300 font-bold">AVAILABLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {stocks.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 text-center font-bold text-gray-400 border-r">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-gray-800 border-r">{item.productName}</td>
                    <td className="py-2 px-2 text-center border-r text-gray-700">{item.inQty}</td>
                    <td className="py-2 px-2 text-center border-r text-gray-700">{item.outQty}</td>
                    <td className="py-2 px-2 text-center border-r text-gray-700">{item.deliveredQty}</td>
                    <td className="py-2 px-2 text-center border-r font-bold text-emerald-700 bg-emerald-50/40">
                      {item.availableQty}
                    </td>
                    <td className="py-2 px-2 text-center border-r text-rose-700">{item.badStockIn}</td>
                    <td className="py-2 px-2 text-center border-r text-rose-700">{item.badStockOut}</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-800 bg-rose-50/40">
                      {item.badStockAvailable}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 6. CLAIM TO SUPPLIER (matching image_db3585fd.png) ---------------- */}
      {activeTab === 'supplier' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SUPPLIER BAD STOCK CLAIM (RMA)</span>
            <button
              onClick={() => {
                const claimNo = `BSC-${Date.now().toString().slice(-6)}`;
                const newBad: SupplierBadStockClaim = {
                  id: `bsc-${Date.now()}`,
                  sn: badClaims.length + 1,
                  date: '24 Oct 2026',
                  claimNo,
                  supplierName: 'Global Brand Pvt Ltd',
                  product: 'Dell Latitude 5420 Display Cable',
                  serial: 'CN-0N1X87-DC991',
                  problem: 'Flickering backlight trace',
                  status: 'Sent to Supplier',
                  note: 'Awaiting vendor replacement'
                };
                setBadClaims([newBad, ...badClaims]);
                setToastMessage(`Supplier claim ${claimNo} filed!`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
            >
              <i className="fa fa-plus"></i>
              <span>CREATE SUPPLIER CLAIM</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-24">Date</th>
                  <th className="py-2.5 px-3 w-32">Claim No</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 w-32 font-mono">Serial</th>
                  <th className="py-2.5 px-3">Reported Defect</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {badClaims.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">{item.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{item.claimNo}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-800">{item.supplierName}</td>
                    <td className="py-2.5 px-3 font-medium">{item.product}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-600">{item.serial}</td>
                    <td className="py-2.5 px-3 text-rose-700 text-[11px]">{item.problem}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 7. SERVICE CENTER (matching image_beba0b49.png) ---------------- */}
      {activeTab === 'serviceCenter' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">AUTHORIZED SERVICE CENTERS</span>
            <button
              onClick={() => handleOpenCenterDrawer()}
              className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
            >
              <i className="fa fa-plus"></i>
              <span>ADD SERVICE CENTER</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3">Service Center Name</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3 w-32">Phone</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3 w-20 text-center">Status</th>
                  <th className="py-2.5 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {serviceCenters.map((sc, idx) => (
                  <tr key={sc.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{sc.name}</td>
                    <td className="py-2.5 px-3 text-gray-700">{sc.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#0084bf]">{sc.phone}</td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px]">{sc.address}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {sc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1">
                      <button
                        onClick={() => handleOpenCenterDrawer(sc)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- WARRANTY CLAIM RECEIPT MODAL (matching image_a2dfe039.png) ---------------- */}
      {selectedClaimForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded shadow-2xl max-w-xl w-full p-6 border border-gray-300 relative text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 no-print">
              <span className="font-bold text-gray-800 uppercase tracking-wide">
                WARRANTY CLAIM RECEIPT
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded flex items-center space-x-1"
                >
                  <i className="fa fa-print"></i>
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedClaimForReceipt(null)}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="border border-gray-300 p-4 rounded space-y-3 print:border-none">
              <div className="text-center border-b pb-2">
                <h2 className="text-base font-black text-[#00305d]">TECH DRIVE</h2>
                <p className="text-[10px] text-gray-500">Multiplan Center, Level 4, Shop #412, Dhaka &bull; Hotline: +880 1700-112233</p>
                <div className="mt-1 font-bold text-xs uppercase bg-gray-100 py-0.5 inline-block px-3 rounded">
                  Warranty Claim Acknowledgment Slip
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded">
                <div>
                  <span className="text-gray-500 block">Claim No:</span>
                  <span className="font-mono font-bold text-[#0084bf] text-xs">{selectedClaimForReceipt.claimNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date of Claim:</span>
                  <span className="font-bold text-gray-800">{selectedClaimForReceipt.date}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sales Invoice:</span>
                  <span className="font-mono font-bold text-gray-700">{selectedClaimForReceipt.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Warranty Until:</span>
                  <span className="font-bold text-gray-800">{selectedClaimForReceipt.warrantyExpired}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <strong className="text-gray-600">Product: </strong>
                  <span className="font-bold text-gray-900">{selectedClaimForReceipt.productName}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Serial Number: </strong>
                  <span className="font-mono font-bold text-[#0084bf]">{selectedClaimForReceipt.serial}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Reported Problem: </strong>
                  <span className="text-rose-700 font-medium">{selectedClaimForReceipt.claimNote || 'Inspection requested'}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Technician Remarks: </strong>
                  <span className="text-gray-800">{selectedClaimForReceipt.checkingNote || 'Assigned to lab workbench'}</span>
                </div>
              </div>

              <div className="border-t pt-3 text-[9px] text-gray-500 space-y-1">
                <p>1. Please present this claim acknowledgment slip when receiving your serviced/replaced product.</p>
                <p>2. Hardware turnaround time is typically 7-14 working days depending on parts availability.</p>
              </div>

              <div className="grid grid-cols-2 pt-6 text-center text-xs text-gray-600">
                <div className="border-t border-gray-300 w-32 mx-auto pt-1 font-medium">Customer Sign</div>
                <div className="border-t border-gray-300 w-32 mx-auto pt-1 font-medium">Authorized Seal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SLIDE DRAWER FOR CLAIM EDIT (matching image_cb93406f.png) ---------------- */}
      {isClaimDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-300">
            <div className="bg-[#0084bf] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
              <span>{editingClaim ? `EDIT CLAIM (${editingClaim.claimNo})` : 'NEW WARRANTY CLAIM'}</span>
              <button
                onClick={() => setIsClaimDrawerOpen(false)}
                className="text-white hover:text-sky-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form id="claimDrawerForm" onSubmit={handleSaveClaim} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Optiplex 7070 Micro Core i5"
                  value={claimForm.productName}
                  onChange={e => setClaimForm({ ...claimForm, productName: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Hardware Serial / IMEI *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5CG9453QN4"
                  value={claimForm.serial}
                  onChange={e => setClaimForm({ ...claimForm, serial: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#0084bf]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Sales Invoice No</label>
                <input
                  type="text"
                  placeholder="e.g. SEL190925101"
                  value={claimForm.invoiceNo}
                  onChange={e => setClaimForm({ ...claimForm, invoiceNo: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Sales Date</label>
                  <input
                    type="text"
                    value={claimForm.salesDate}
                    onChange={e => setClaimForm({ ...claimForm, salesDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Warranty Expired</label>
                  <input
                    type="text"
                    value={claimForm.warrantyExpired}
                    onChange={e => setClaimForm({ ...claimForm, warrantyExpired: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Claim Note / Problem Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe fault reported by customer..."
                  value={claimForm.claimNote}
                  onChange={e => setClaimForm({ ...claimForm, claimNote: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Service Center</label>
                <select
                  value={claimForm.serviceCenter}
                  onChange={e => setClaimForm({ ...claimForm, serviceCenter: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                >
                  {serviceCenters.map(sc => (
                    <option key={sc.id} value={sc.name}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Status</label>
                <select
                  value={claimForm.status}
                  onChange={e => setClaimForm({ ...claimForm, status: e.target.value as WarrantyClaim['status'] })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="Checking">Checking</option>
                  <option value="Send for Warranty">Send for Warranty</option>
                  <option value="Product Successfully Delivered!!!">Product Successfully Delivered!!!</option>
                  <option value="Warranty Denied & Send To Delivery">Warranty Denied & Send To Delivery</option>
                </select>
              </div>
            </form>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsClaimDrawerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                form="claimDrawerForm"
                className="px-5 py-2 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded shadow-xs text-xs uppercase"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SLIDE DRAWER FOR PRODUCT CHECKING (matching image_f9025164.png) ---------------- */}
      {isCheckingDrawerOpen && editingClaim && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-300">
            <div className="bg-[#0084bf] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
              <span>CHECKING INSPECTION: {checkingForm.claimNo}</span>
              <button
                onClick={() => setIsCheckingDrawerOpen(false)}
                className="text-white hover:text-sky-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form id="checkingDrawerForm" onSubmit={handleSaveChecking} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Hardware Serial</label>
                <input
                  type="text"
                  readOnly
                  value={checkingForm.serial}
                  className="w-full border border-gray-200 bg-gray-50 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Customer Claim Note</label>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-600 text-xs">
                  {checkingForm.claimNote || 'No claim notes recorded'}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Lab Testing &amp; Checking Note *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record testing bench results, diagnosis, component verification..."
                  value={checkingForm.checkingNote}
                  onChange={e => setCheckingForm({ ...checkingForm, checkingNote: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Updated Inspection Status *</label>
                <select
                  value={checkingForm.status}
                  onChange={e => setCheckingForm({ ...checkingForm, status: e.target.value as WarrantyClaim['status'] })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="Send for Warranty">Send for Warranty</option>
                  <option value="Warranty Denied & Send To Delivery">Warranty Denied & Send To Delivery</option>
                  <option value="Product Successfully Delivered!!!">Testing Passed - Deliver to Customer</option>
                </select>
              </div>
            </form>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCheckingDrawerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                form="checkingDrawerForm"
                className="px-5 py-2 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded shadow-xs text-xs uppercase"
              >
                SAVE INSPECTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SLIDE DRAWER FOR MANAGE / REPLACE (matching image_f07abf24.png) ---------------- */}
      {isManageDrawerOpen && editingClaim && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-300">
            <div className="bg-[#0084bf] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
              <span>RECEIVED OR REPLACE DETAILS</span>
              <button
                onClick={() => setIsManageDrawerOpen(false)}
                className="text-white hover:text-sky-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form id="manageDrawerForm" onSubmit={handleSaveManage} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Claim No</label>
                <input
                  type="text"
                  readOnly
                  value={manageForm.claimNo}
                  className="w-full border border-gray-200 bg-gray-50 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#0084bf]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Product</label>
                <input
                  type="text"
                  readOnly
                  value={manageForm.product}
                  className="w-full border border-gray-200 bg-gray-50 rounded px-2.5 py-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Replacement Serial Number</label>
                <input
                  type="text"
                  placeholder="New replaced part / unit serial"
                  value={manageForm.replacedSerial}
                  onChange={e => setManageForm({ ...manageForm, replacedSerial: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Received / Repair Details</label>
                <textarea
                  rows={3}
                  value={manageForm.receivedDetails}
                  onChange={e => setManageForm({ ...manageForm, receivedDetails: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </form>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsManageDrawerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                form="manageDrawerForm"
                className="px-5 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs text-xs uppercase"
              >
                COMPLETE REPLACEMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SLIDE DRAWER FOR SERVICE CENTER (matching image_a38626d1.png) ---------------- */}
      {isServiceCenterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-300">
            <div className="bg-[#0084bf] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
              <span>{editingCenter ? 'EDIT SERVICE CENTER' : 'ADD SERVICE CENTER'}</span>
              <button
                onClick={() => setIsServiceCenterDrawerOpen(false)}
                className="text-white hover:text-sky-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form id="scDrawerForm" onSubmit={handleSaveCenter} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Service Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Laptop Zone"
                  value={centerForm.name}
                  onChange={e => setCenterForm({ ...centerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Md. Monirul Islam"
                  value={centerForm.contactPerson}
                  onChange={e => setCenterForm({ ...centerForm, contactPerson: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 01712-987654"
                  value={centerForm.phone}
                  onChange={e => setCenterForm({ ...centerForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Address</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shop #304, Multiplan Center, Elephant Road, Dhaka"
                  value={centerForm.address}
                  onChange={e => setCenterForm({ ...centerForm, address: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Status</label>
                <select
                  value={centerForm.status}
                  onChange={e => setCenterForm({ ...centerForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsServiceCenterDrawerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                form="scDrawerForm"
                className="px-5 py-2 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded shadow-xs text-xs uppercase"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
