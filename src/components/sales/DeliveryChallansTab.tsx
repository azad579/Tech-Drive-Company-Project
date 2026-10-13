import React, { useState } from 'react';
import {
  Truck,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  CheckCircle2,
  Download,
  X,
  Package,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';
import { INITIAL_DELIVERY_CHALLANS, DeliveryChallanRecord } from '../../data/mockErpData';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { Customer } from '../../types/pos';

interface DeliveryChallansTabProps {
  customers?: Customer[];
}

export const DeliveryChallansTab: React.FC<DeliveryChallansTabProps> = ({ customers = [] }) => {
  const [challans, setChallans] = useState<DeliveryChallanRecord[]>(INITIAL_DELIVERY_CHALLANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Dispatched' | 'Delivered' | 'Pending'>('All');
  const [viewingChallan, setViewingChallan] = useState<DeliveryChallanRecord | null>(null);
  const [isNewChallanModalOpen, setIsNewChallanModalOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState(customers[0]?.name || 'Mohammad Forhad');
  const [contactPhone, setContactPhone] = useState('01712-345678');
  const [deliveryAddress, setDeliveryAddress] = useState('House 14, Road 7, Dhanmondi, Dhaka');
  const [orderOrInvoiceRef, setOrderOrInvoiceRef] = useState('SO-2026-0105');
  const [vehicleOrCourier, setVehicleOrCourier] = useState('Pathao Parcel Logistics');
  const [driverOrTracking, setDriverOrTracking] = useState('TRACK-PTH-88912');
  const [itemName, setItemName] = useState('Surface Pro 7 (i5, 8GB, 256GB)');
  const [itemSku, setItemSku] = useState('MS-SP7-02');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('Unit');

  const filteredChallans = challans.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = c.challanNo.toLowerCase().includes(q);
      const matchRef = c.orderOrInvoiceRef.toLowerCase().includes(q);
      const matchCust = c.customerName.toLowerCase().includes(q);
      const matchTrack = c.driverOrTracking.toLowerCase().includes(q);
      if (!matchNo && !matchRef && !matchCust && !matchTrack) return false;
    }
    return true;
  });

  const handleCreateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: DeliveryChallanRecord = {
      id: `ch-${Date.now()}`,
      challanNo: `CH-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      orderOrInvoiceRef: orderOrInvoiceRef.trim() || 'MANUAL-DISPATCH',
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      contactPhone: contactPhone.trim(),
      vehicleOrCourier: vehicleOrCourier.trim(),
      driverOrTracking: driverOrTracking.trim(),
      itemsList: [
        {
          name: itemName.trim(),
          sku: itemSku.trim(),
          qty,
          unit: unit.trim() || 'Pcs',
        },
      ],
      status: 'Dispatched',
      dispatchedBy: 'Kamrul Hasan (Dispatch Supervisor)',
    };

    setChallans([newRecord, ...challans]);
    setIsNewChallanModalOpen(false);
  };

  const handleDeleteChallan = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this delivery challan?')) {
      setChallans(challans.filter((c) => c.id !== id));
      if (viewingChallan?.id === id) setViewingChallan(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Challan No,Order Ref,Date,Customer,Address,Vehicle/Courier,Tracking,Status\n'];
    const rows = filteredChallans.map(
      (c) => `"${c.challanNo}","${c.orderOrInvoiceRef}","${c.date}","${c.customerName}","${c.deliveryAddress}","${c.vehicleOrCourier}","${c.driverOrTracking}","${c.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery_challans_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans select-none">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challan #, reference, customer, tracking..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['All', 'Dispatched', 'Delivered', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsNewChallanModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-teal-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery Challan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Challans</p>
            <p className="text-lg font-black text-white font-mono mt-0.5">{challans.length}</p>
            <p className="text-[10px] text-teal-400">Dispatch gate passes</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">In Transit</p>
            <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
              {challans.filter((c) => c.status === 'Dispatched').length}
            </p>
            <p className="text-[10px] text-amber-400">On the way to destination</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Delivered &amp; Signed</p>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
              {challans.filter((c) => c.status === 'Delivered').length}
            </p>
            <p className="text-[10px] text-emerald-400">Proof of delivery verified</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Challan #</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Date</th>
              <th className="p-3">Recipient / Customer</th>
              <th className="p-3">Vehicle / Courier</th>
              <th className="p-3">Tracking / Driver</th>
              <th className="p-3">Dispatched Items</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredChallans.length > 0 ? (
              filteredChallans.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-400">{c.challanNo}</td>
                  <td className="p-3 font-mono text-blue-400">{c.orderOrInvoiceRef}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{c.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{c.customerName}</div>
                    <div className="text-[10px] text-slate-400">{c.contactPhone}</div>
                  </td>
                  <td className="p-3 text-slate-300">{c.vehicleOrCourier}</td>
                  <td className="p-3 font-mono text-slate-400">{c.driverOrTracking}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    {c.itemsList.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : c.status === 'Dispatched'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingChallan(c);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View & Print Challan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDeleteChallan(c.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete delivery challan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No delivery challans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VIEW / PRINT DELIVERY CHALLAN */}
      {viewingChallan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Official Delivery Challan / Gate Pass</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingChallan.challanNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingChallan(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-750">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Consignee / Recipient</span>
                  <div className="text-sm font-bold text-white mt-1">{viewingChallan.customerName}</div>
                  <div className="text-slate-300 font-mono">Phone: {viewingChallan.contactPhone}</div>
                  <div className="text-slate-400 mt-1">Address: {viewingChallan.deliveryAddress}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Dispatch Credentials</span>
                  <div className="text-white mt-1">Order/Invoice Ref: <strong className="font-mono text-blue-400">{viewingChallan.orderOrInvoiceRef}</strong></div>
                  <div className="text-slate-300">Carrier: {viewingChallan.vehicleOrCourier}</div>
                  <div className="text-slate-400 font-mono">Tracking / Reg: {viewingChallan.driverOrTracking}</div>
                  <div className="text-teal-400 mt-1 font-semibold">Status: {viewingChallan.status}</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5">SL</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">SKU / Code</th>
                      <th className="p-2.5 text-center">Quantity</th>
                      <th className="p-2.5 text-center">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingChallan.itemsList.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-white">{i.name}</td>
                        <td className="p-2.5 font-mono text-slate-400">{i.sku}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-teal-400">{i.qty}</td>
                        <td className="p-2.5 text-center text-slate-400">{i.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800">
                <div className="text-center border-t border-dashed border-slate-700 pt-2">
                  <div className="text-[11px] text-slate-400">Dispatched By</div>
                  <div className="text-xs font-bold text-white mt-1">{viewingChallan.dispatchedBy}</div>
                </div>
                <div className="text-center border-t border-dashed border-slate-700 pt-2">
                  <div className="text-[11px] text-slate-400">Receiver's Signature &amp; Seal</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {viewingChallan.receivedBySignature || '(Signature upon physical delivery)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteChallan(viewingChallan.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingChallan(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Challan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW DELIVERY CHALLAN */}
      {isNewChallanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>Generate Delivery Challan</span>
              </h3>
              <button onClick={() => setIsNewChallanModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Order / Invoice Reference *</label>
                  <input
                    type="text"
                    required
                    value={orderOrInvoiceRef}
                    onChange={(e) => setOrderOrInvoiceRef(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Customer / Recipient *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Recipient Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Carrier / Vehicle</label>
                  <input
                    type="text"
                    value={vehicleOrCourier}
                    onChange={(e) => setVehicleOrCourier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Delivery Destination Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Driver Name / Courier Tracking #</label>
                <input
                  type="text"
                  value={driverOrTracking}
                  onChange={(e) => setDriverOrTracking(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Item Description *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">SKU</label>
                    <input
                      type="text"
                      value={itemSku}
                      onChange={(e) => setItemSku(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewChallanModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                >
                  Issue Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
