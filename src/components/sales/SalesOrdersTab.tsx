import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Download,
  X,
  Clock,
  Building,
} from 'lucide-react';
import { INITIAL_SALES_ORDERS, SalesOrderRecord } from '../../data/mockErpData';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';
import { Customer } from '../../types/pos';

interface SalesOrdersTabProps {
  customers?: Customer[];
  onOpenChallans?: () => void;
}

export const SalesOrdersTab: React.FC<SalesOrdersTabProps> = ({ customers = [], onOpenChallans }) => {
  const [orders, setOrders] = useState<SalesOrderRecord[]>(INITIAL_SALES_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Processing' | 'Delivered'>('All');
  const [viewingOrder, setViewingOrder] = useState<SalesOrderRecord | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order form state
  const [customerName, setCustomerName] = useState(customers[0]?.name || 'Apex Data Systems Ltd');
  const [companyName, setCompanyName] = useState('Apex Data Systems Ltd');
  const [customerPhone, setCustomerPhone] = useState('01819-876543');
  const [deliveryAddress, setDeliveryAddress] = useState('Floor 7, Bilquis Tower, Gulshan-2, Dhaka');
  const [deliveryDate, setDeliveryDate] = useState('2026-10-15');
  const [itemName, setItemName] = useState('Dell Latitude 5540 Business Laptop');
  const [itemSku, setItemSku] = useState('DELL-LAT-5540');
  const [qty, setQty] = useState(2);
  const [unitPrice, setUnitPrice] = useState(88000);
  const [advancePaid, setAdvancePaid] = useState(50000);
  const [paymentTerms, setPaymentTerms] = useState('Advance paid, balance upon delivery');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.orderNo.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchComp = o.companyName?.toLowerCase().includes(q);
      const matchItem = o.itemsList.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNo && !matchCust && !matchComp && !matchItem) return false;
    }
    return true;
  });

  const totalOrderValue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();
    const total = qty * unitPrice;

    const newRecord: SalesOrderRecord = {
      id: `so-${Date.now()}`,
      orderNo: `SO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      deliveryDate,
      customerName: customerName.trim(),
      companyName: companyName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      itemsList: [
        {
          name: itemName.trim(),
          sku: itemSku.trim(),
          qty,
          unitPrice,
          total,
        },
      ],
      grandTotal: total,
      advancePaid,
      dueAmount: Math.max(0, total - advancePaid),
      status: 'Confirmed',
      paymentTerms: paymentTerms.trim(),
      createdBy: 'Forhad (Admin)',
    };

    setOrders([newRecord, ...orders]);
    setIsNewOrderModalOpen(false);
  };

  const handleDeleteOrder = (id: string) => {
    playClickSound();
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      setOrders(orders.filter((o) => o.id !== id));
      if (viewingOrder?.id === id) setViewingOrder(null);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    const headers = ['Order No,Date,Delivery Date,Customer,Company,Grand Total,Advance Paid,Due,Status\n'];
    const rows = filteredOrders.map(
      (o) => `"${o.orderNo}","${o.date}","${o.deliveryDate}","${o.customerName}","${o.companyName || ''}","${o.grandTotal}","${o.advancePaid}","${o.dueAmount}","${o.status}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_orders_${new Date().toISOString().slice(0, 10)}.csv`;
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
              placeholder="Search order #, customer, company, item..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            {(['All', 'Confirmed', 'Processing', 'Delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
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
              setIsNewOrderModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Orders</p>
            <p className="text-lg font-black text-white font-mono mt-0.5">{orders.length}</p>
            <p className="text-[10px] text-indigo-400">Booked sales orders</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Order Value</p>
            <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatCurrency(totalOrderValue)}</p>
            <p className="text-[10px] text-slate-400">Committed orders</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">In Processing</p>
            <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
              {orders.filter((o) => o.status === 'Processing' || o.status === 'Confirmed').length}
            </p>
            <p className="text-[10px] text-amber-400">Ready for dispatch</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Delivered</p>
            <p className="text-lg font-black text-teal-400 font-mono mt-0.5">
              {orders.filter((o) => o.status === 'Delivered').length}
            </p>
            <p className="text-[10px] text-teal-400">Fulfilled &amp; delivered</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Client / Company</th>
              <th className="p-3">Items Summary</th>
              <th className="p-3 text-right">Grand Total</th>
              <th className="p-3 text-right">Advance Paid</th>
              <th className="p-3 text-right">Balance Due</th>
              <th className="p-3 text-center">Delivery Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-400">{ord.orderNo}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{ord.date}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{ord.companyName || ord.customerName}</div>
                    <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    {ord.itemsList.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">
                    {formatCurrency(ord.grandTotal)}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400">
                    {formatCurrency(ord.advancePaid)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">
                    {formatCurrency(ord.dueAmount)}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-300">{ord.deliveryDate}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-teal-500/20 text-teal-300'
                          : ord.status === 'Processing'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          playClickSound();
                          setViewingOrder(ord);
                        }}
                        className="px-2 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View & Print Sales Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-rose-400 transition-colors cursor-pointer"
                        title="Delete sales order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-500">
                  No sales orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: VIEW / PRINT SALES ORDER */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Official Sales Order Document</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingOrder.orderNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-750">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Client &amp; Destination</span>
                  <div className="text-sm font-bold text-white mt-1">{viewingOrder.companyName || viewingOrder.customerName}</div>
                  <div className="text-slate-300">Contact: {viewingOrder.customerName} ({viewingOrder.customerPhone})</div>
                  <div className="text-slate-400 mt-1">Delivery Address: {viewingOrder.deliveryAddress}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Schedule &amp; Terms</span>
                  <div className="text-white mt-1">Order Date: <strong className="font-mono">{viewingOrder.date}</strong></div>
                  <div className="text-indigo-400 font-medium">Expected Delivery: <strong className="font-mono">{viewingOrder.deliveryDate}</strong></div>
                  <div className="text-slate-300 mt-1">Terms: {viewingOrder.paymentTerms}</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingOrder.itemsList.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-white">{i.name}</td>
                        <td className="p-2.5 font-mono text-slate-400">{i.sku}</td>
                        <td className="p-2.5 text-center font-mono">{i.qty}</td>
                        <td className="p-2.5 text-right font-mono">{formatCurrency(i.unitPrice)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">{formatCurrency(i.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 bg-slate-850 p-3 rounded-xl border border-slate-750 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatCurrency(viewingOrder.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Advance Received:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(viewingOrder.advancePaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-400 border-t border-slate-700 pt-1.5 text-sm">
                    <span>Remaining Due:</span>
                    <span className="font-mono">{formatCurrency(viewingOrder.dueAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteOrder(viewingOrder.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sales Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW SALES ORDER */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>Book New Sales Order</span>
              </h3>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Company / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white cursor-pointer"
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

              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Product Description *</label>
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
                    <label className="block text-slate-400 font-medium mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Unit Price ৳</label>
                    <input
                      type="number"
                      min={0}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Advance Deposit ৳</label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Total Order:</span>{' '}
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {formatCurrency(qty * unitPrice)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewOrderModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Book Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
