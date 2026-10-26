import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import {
  INITIAL_SERVICES,
  INITIAL_SERVICE_RECEIVED,
  INITIAL_SERVICE_SALES
} from '../data/mockServiceWarranty';
import { ServiceItem, ServiceReceived, ServiceSale } from '../types';

interface ServiceViewProps {
  initialSubTab?: 'list' | 'receivedList' | 'receivedCreate' | 'salesList' | 'salesCreate';
}

export const ServiceView: React.FC<ServiceViewProps> = ({ initialSubTab = 'list' }) => {
  const { customers, setCurrentRoute } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'receivedList' | 'receivedCreate' | 'salesList' | 'salesCreate'>(initialSubTab);

  // 1. Services Catalog & Drawer State (matching image_e8bb843c.png & image_c2b66196.png)
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    code: '',
    category: 'Service',
    cost: 0,
    price: 0,
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // 2. Service Received List & Intake (matching image_27919eb8.png & image_faf6bf2e.png)
  const [receivedList, setReceivedList] = useState<ServiceReceived[]>(INITIAL_SERVICE_RECEIVED);
  const [receivedForm, setReceivedForm] = useState({
    customerName: '',
    invoiceNo: `SR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-80003`,
    deliveryDate: '2026-10-30',
    phone: '',
    address: '',
    productName: '',
    productModel: '',
    problem: '',
    remarks: ''
  });

  // 3. Service Sales POS (matching image_e3b624a9.png, image_77a0ac03.png & image_c94a1940.png)
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>(INITIAL_SERVICE_SALES);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 'cus-1');
  const [serviceCart, setServiceCart] = useState<Array<{
    serviceId: string;
    code: string;
    name: string;
    price: number;
    qty: number;
    discount: number;
    subtotal: number;
  }>>([
    {
      serviceId: 'ser-1',
      code: 'ABA007S',
      name: 'Battery Service',
      price: 500,
      qty: 1,
      discount: 0,
      subtotal: 500
    }
  ]);
  const [serviceDiscount, setServiceDiscount] = useState<number>(0);
  const [serviceVat, setServiceVat] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Handle open add / edit service drawer
  const handleOpenServiceDrawer = (item?: ServiceItem) => {
    if (item) {
      setEditingService(item);
      setServiceForm({
        name: item.name,
        code: item.code,
        category: item.category,
        cost: item.cost,
        price: item.price,
        description: item.description,
        status: item.status
      });
    } else {
      setEditingService(null);
      const nextCode = `ABA0${(services.length + 7).toString().padStart(2, '0')}S`;
      setServiceForm({
        name: '',
        code: nextCode,
        category: 'Service',
        cost: 0,
        price: 0,
        description: '',
        status: 'Active'
      });
    }
    setIsServiceDrawerOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      alert('Please enter service name.');
      return;
    }

    if (editingService) {
      setServices(prev =>
        prev.map(s =>
          s.id === editingService.id
            ? {
                ...s,
                ...serviceForm
              }
            : s
        )
      );
      setToastMessage(`Service ${serviceForm.code} updated successfully!`);
    } else {
      const newService: ServiceItem = {
        id: `ser-${Date.now()}`,
        sn: services.length + 1,
        ...serviceForm
      };
      setServices([...services, newService]);
      setToastMessage(`New Service ${serviceForm.name} added!`);
    }

    setIsServiceDrawerOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete service "${name}"?`)) {
      setServices(prev => prev.filter(s => s.id !== id));
      setToastMessage(`Service "${name}" deleted.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Service Received Save
  const handleSaveServiceReceived = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedForm.customerName.trim() || !receivedForm.productName.trim()) {
      alert('Please fill customer name and product name.');
      return;
    }

    const newRec: ServiceReceived = {
      id: `srec-${Date.now()}`,
      sn: receivedList.length + 1,
      date: '24 Oct 2026',
      invoiceNo: receivedForm.invoiceNo,
      customerName: receivedForm.customerName,
      phone: receivedForm.phone,
      address: receivedForm.address,
      productName: receivedForm.productName,
      productModel: receivedForm.productModel,
      problem: receivedForm.problem,
      deliveryDate: receivedForm.deliveryDate,
      status: 'Received',
      remarks: receivedForm.remarks
    };

    setReceivedList([newRec, ...receivedList]);
    setToastMessage(`Service Job ${receivedForm.invoiceNo} booked successfully!`);
    setTimeout(() => {
      setToastMessage(null);
      setActiveTab('receivedList');
    }, 1500);
  };

  // Service POS cart
  const addToServiceCart = (service: ServiceItem) => {
    setServiceCart(prev => {
      const exist = prev.find(item => item.serviceId === service.id);
      if (exist) {
        return prev.map(item =>
          item.serviceId === service.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          code: service.code,
          name: service.name,
          price: service.price,
          qty: 1,
          discount: 0,
          subtotal: service.price
        }
      ];
    });
  };

  const removeFromServiceCart = (id: string) => {
    setServiceCart(prev => prev.filter(item => item.serviceId !== id));
  };

  const serviceSubtotal = useMemo(
    () => serviceCart.reduce((sum, item) => sum + item.subtotal, 0),
    [serviceCart]
  );
  const serviceGrandTotal = useMemo(
    () => Math.max(0, serviceSubtotal - serviceDiscount + serviceVat),
    [serviceSubtotal, serviceDiscount, serviceVat]
  );

  const handleCheckoutServiceSale = () => {
    if (serviceCart.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    const invNo = `SINV-${Date.now().toString().slice(-6)}`;
    const newSale: ServiceSale = {
      id: `ssale-${Date.now()}`,
      sn: serviceSales.length + 1,
      date: '24 Oct 2026',
      invoiceNo: invNo,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-In Customer',
      phone: selectedCustomer?.phone,
      total: serviceSubtotal,
      discount: serviceDiscount,
      vat: serviceVat,
      grandTotal: serviceGrandTotal,
      paidAmount: serviceGrandTotal,
      dueAmount: 0,
      status: 'Paid',
      items: serviceCart.map(i => ({
        id: i.serviceId,
        code: i.code,
        name: i.name,
        price: i.price,
        qty: i.qty,
        discount: i.discount,
        subtotal: i.subtotal
      }))
    };

    setServiceSales([newSale, ...serviceSales]);
    setToastMessage(`Service Invoice ${invNo} generated successfully!`);
    setTimeout(() => {
      setToastMessage(null);
      setActiveTab('salesList');
    }, 1500);
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
          {activeTab === 'list' && 'Service Management'}
          {activeTab === 'receivedList' && 'Service Received List'}
          {activeTab === 'receivedCreate' && 'Service Job Intake'}
          {activeTab === 'salesList' && 'Service Sales Record'}
          {activeTab === 'salesCreate' && 'Service Sales POS'}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span className="cursor-pointer hover:underline" onClick={() => setCurrentRoute('home.php')}>Dashboard</span>
          <span>&gt;</span>
          <span>Service</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">
            {activeTab === 'list' && 'Service List'}
            {activeTab === 'receivedList' && 'Received List'}
            {activeTab === 'receivedCreate' && 'Received Create'}
            {activeTab === 'salesList' && 'Service Invoices'}
            {activeTab === 'salesCreate' && 'Service Sales'}
          </span>
        </div>
      </div>

      {/* Secondary Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded border border-gray-200 text-xs">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'list'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-wrench"></i>
          <span>Service Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('receivedList')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'receivedList'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-inbox"></i>
          <span>Service Received ({receivedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receivedCreate')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'receivedCreate'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-plus-circle"></i>
          <span>New Service Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('salesList')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'salesList'
              ? 'bg-[#0084bf] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-file-text-o"></i>
          <span>Service Sales ({serviceSales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('salesCreate')}
          className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'salesCreate'
              ? 'bg-[#605ca8] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fa fa-shopping-cart"></i>
          <span>POS Service Sales</span>
        </button>
      </div>

      {/* ---------------- 1. SERVICE CATALOG LIST (matching image_e8bb843c.png) ---------------- */}
      {activeTab === 'list' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SERVICE LIST</span>
            <button
              onClick={() => handleOpenServiceDrawer()}
              className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
            >
              <i className="fa fa-plus"></i>
              <span>ADD NEW</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3 w-28">Code</th>
                  <th className="py-2.5 px-3 w-28">Category</th>
                  <th className="py-2.5 px-3 w-24 text-right">Cost</th>
                  <th className="py-2.5 px-3 w-24 text-right">Price</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 w-20 text-center">Status</th>
                  <th className="py-2.5 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {services.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{item.name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{item.code}</td>
                    <td className="py-2.5 px-3 text-gray-600">{item.category}</td>
                    <td className="py-2.5 px-3 text-right text-gray-500">{formatBDT(item.cost)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatBDT(item.price)}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px] truncate max-w-xs">{item.description}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1.5">
                      <button
                        onClick={() => handleOpenServiceDrawer(item)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
                        title="Edit Service"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteService(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Service"
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
      )}

      {/* ---------------- 2. SERVICE RECEIVED LIST (matching image_27919eb8.png) ---------------- */}
      {activeTab === 'receivedList' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SERVICE RECEIVED RECORD</span>
            <button
              onClick={() => setActiveTab('receivedCreate')}
              className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
            >
              <i className="fa fa-plus"></i>
              <span>ADD NEW INTAKE</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-24">Date</th>
                  <th className="py-2.5 px-3 w-36">Job / Inv No</th>
                  <th className="py-2.5 px-3">Customer Details</th>
                  <th className="py-2.5 px-3">Device / Model</th>
                  <th className="py-2.5 px-3">Reported Problem</th>
                  <th className="py-2.5 px-3 w-28">Est. Delivery</th>
                  <th className="py-2.5 px-3 w-24 text-center">Status</th>
                  <th className="py-2.5 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {receivedList.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">{rec.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{rec.invoiceNo}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#00305d]">{rec.customerName}</div>
                      <div className="text-[10px] text-gray-500">{rec.phone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{rec.productName}</div>
                      <div className="text-[10px] text-gray-500">{rec.productModel}</div>
                    </td>
                    <td className="py-2.5 px-3 text-rose-700 text-[11px] font-medium max-w-xs">{rec.problem}</td>
                    <td className="py-2.5 px-3 text-gray-600">{rec.deliveryDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rec.status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'In Service'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1">
                      <button
                        onClick={() => alert(`Service Slip for ${rec.invoiceNo}`)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
                        title="Print Slip"
                      >
                        <i className="fa fa-print"></i>
                      </button>
                      <button
                        onClick={() => {
                          setReceivedList(prev =>
                            prev.map(r =>
                              r.id === rec.id
                                ? { ...r, status: r.status === 'Received' ? 'In Service' : 'Ready' }
                                : r
                            )
                          );
                        }}
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                        title="Advance Status"
                      >
                        <i className="fa fa-forward"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 3. SERVICE INTAKE FORM (matching image_faf6bf2e.png) ---------------- */}
      {activeTab === 'receivedCreate' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs max-w-4xl mx-auto overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SERVICE JOB RECEIVE / INTAKE</span>
            <button
              onClick={() => setActiveTab('receivedList')}
              className="text-sky-100 hover:text-white text-xs font-semibold"
            >
              &times; Close
            </button>
          </div>

          <form onSubmit={handleSaveServiceReceived} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Rafiqul Islam"
                  value={receivedForm.customerName}
                  onChange={e => setReceivedForm({ ...receivedForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Job / Invoice No</label>
                <input
                  type="text"
                  readOnly
                  value={receivedForm.invoiceNo}
                  className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-1.5 text-xs font-mono font-bold text-[#0084bf]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Customer Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711223344"
                  value={receivedForm.phone}
                  onChange={e => setReceivedForm({ ...receivedForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={receivedForm.deliveryDate}
                  onChange={e => setReceivedForm({ ...receivedForm, deliveryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Product / Device Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HP ProBook 450 G8"
                  value={receivedForm.productName}
                  onChange={e => setReceivedForm({ ...receivedForm, productName: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Model & Specs</label>
                <input
                  type="text"
                  placeholder="e.g. Core i5 11th Gen / 16GB RAM"
                  value={receivedForm.productModel}
                  onChange={e => setReceivedForm({ ...receivedForm, productModel: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Customer Address</label>
              <input
                type="text"
                placeholder="e.g. Multiplan Center Level 4, Dhaka"
                value={receivedForm.address}
                onChange={e => setReceivedForm({ ...receivedForm, address: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Product Problem / Fault Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe fault: No power, blinking LED, broken hinge, overheating, bios password..."
                value={receivedForm.problem}
                onChange={e => setReceivedForm({ ...receivedForm, problem: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Accessories Received / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Power adapter included, no bag"
                value={receivedForm.remarks}
                onChange={e => setReceivedForm({ ...receivedForm, remarks: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('receivedList')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded shadow-xs text-xs uppercase flex items-center space-x-1.5"
              >
                <i className="fa fa-save"></i>
                <span>SAVE &amp; ISSUE SLIP</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- 4. SERVICE SALES RECORD (matching image_e3b624a9.png) ---------------- */}
      {activeTab === 'salesList' && (
        <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2 flex items-center justify-between font-bold text-sm">
            <span className="uppercase tracking-wide">SERVICE INVOICE RECORD</span>
            <button
              onClick={() => setActiveTab('salesCreate')}
              className="bg-[#605ca8] hover:bg-[#504c96] text-white text-xs px-3 py-1 rounded font-bold uppercase transition flex items-center space-x-1"
            >
              <i className="fa fa-plus"></i>
              <span>CREATE SERVICE SALES</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#00305d] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">SN</th>
                  <th className="py-2.5 px-3 w-24">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 w-36">Service Inv</th>
                  <th className="py-2.5 px-3 w-28 text-right">Total</th>
                  <th className="py-2.5 px-3 w-20 text-center">Status</th>
                  <th className="py-2.5 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {serviceSales.map((sale, idx) => (
                  <tr key={sale.id} className="hover:bg-sky-50/50 transition">
                    <td className="py-2.5 px-3 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">{sale.date}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#00305d]">{sale.customerName}</div>
                      <div className="text-[10px] text-gray-500">{sale.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{sale.invoiceNo}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatBDT(sale.grandTotal)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1">
                      <button
                        onClick={() => alert(`Printing service receipt ${sale.invoiceNo}`)}
                        className="text-[#0084bf] hover:text-sky-800 p-1"
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

      {/* ---------------- 5. SERVICE SALES POS (matching image_77a0ac03.png & image_c94a1940.png) ---------------- */}
      {activeTab === 'salesCreate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Service Cards Catalog Grid */}
          <div className="lg:col-span-7 bg-white p-3 rounded border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-xs uppercase flex items-center space-x-1.5">
                  <i className="fa fa-wrench text-[#0084bf]"></i>
                  <span>Available Workshop Services</span>
                </span>
                <span className="text-[11px] text-gray-500">Click a card to add to billing cart</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
                {services.map(srv => (
                  <div
                    key={srv.id}
                    onClick={() => addToServiceCart(srv)}
                    className="cursor-pointer border border-sky-200 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50 rounded-md p-3 flex flex-col items-center text-center transition group shadow-2xs"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0084bf]/10 text-[#0084bf] flex items-center justify-center mb-1 group-hover:scale-110 transition">
                      <i className="fa fa-cogs text-xl"></i>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-sky-800">{srv.code}</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5 line-clamp-1">{srv.name}</div>
                    <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{srv.description}</div>
                    <div className="mt-1.5 font-bold text-sm text-[#00305d]">
                      {formatBDT(srv.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-right mt-3 pt-2 border-t border-gray-100">
              Showing {services.length} active service repair modules
            </div>
          </div>

          {/* Service Billing Cart */}
          <div className="lg:col-span-5 bg-white p-3 rounded border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              {/* Customer selection */}
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Customer:</label>
                  <span className="font-bold text-rose-600">
                    Bal.: {formatBDT(selectedCustomer?.balance || 0)}
                  </span>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-xs font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Table */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#00305d] text-white text-[10px] uppercase">
                    <tr>
                      <th className="py-1 px-1.5 w-6 text-center">#</th>
                      <th className="py-1 px-1.5">Service</th>
                      <th className="py-1 px-1 w-10 text-center">Qty</th>
                      <th className="py-1 px-1 w-14 text-right">Price</th>
                      <th className="py-1 px-1.5 w-16 text-right">Subtotal</th>
                      <th className="py-1 px-1 w-6 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {serviceCart.map((item, idx) => (
                      <tr key={item.serviceId} className="hover:bg-gray-50">
                        <td className="py-1 px-1 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-1 px-1.5">
                          <div className="font-semibold text-gray-900 line-clamp-1">{item.name}</div>
                          <div className="text-[9px] text-sky-700 font-mono">{item.code}</div>
                        </td>
                        <td className="py-1 px-1 text-center font-bold">{item.qty}</td>
                        <td className="py-1 px-1 text-right">{formatBDT(item.price)}</td>
                        <td className="py-1 px-1.5 text-right font-bold text-gray-900">{formatBDT(item.subtotal)}</td>
                        <td className="py-1 px-1 text-center">
                          <button
                            onClick={() => removeFromServiceCart(item.serviceId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations */}
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-[11px] space-y-1.5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sub Total:</span>
                  <span className="font-bold text-gray-800">{formatBDT(serviceSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Special Discount:</span>
                  <input
                    type="number"
                    value={serviceDiscount}
                    onChange={e => setServiceDiscount(parseFloat(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded text-right px-1 py-0.5 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>VAT (৳):</span>
                  <input
                    type="number"
                    value={serviceVat}
                    onChange={e => setServiceVat(parseFloat(e.target.value) || 0)}
                    className="w-16 border border-gray-300 rounded text-right px-1 py-0.5 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#00305d] pt-1.5 border-t border-gray-300">
                  <span>Net Payable:</span>
                  <span className="text-base text-[#0084bf]">{formatBDT(serviceGrandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Purple Checkout Button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCheckoutServiceSale}
                className="w-full py-2.5 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold text-sm uppercase rounded shadow-xs transition flex items-center justify-center space-x-2"
              >
                <i className="fa fa-check-circle"></i>
                <span>COMPLETE SERVICE BILLING</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SLIDE-OUT SERVICE DRAWER (matching image_c2b66196.png) ---------------- */}
      {isServiceDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-300">
            {/* Header */}
            <div className="bg-[#0084bf] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
              <span>{editingService ? 'EDIT SERVICE' : 'ADD NEW SERVICE'}</span>
              <button
                onClick={() => setIsServiceDrawerOpen(false)}
                className="text-white hover:text-sky-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Drawer Body Form */}
            <form id="serviceDrawerForm" onSubmit={handleSaveService} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery Service"
                  value={serviceForm.name}
                  onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Service Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABA007S"
                  value={serviceForm.code}
                  onChange={e => setServiceForm({ ...serviceForm, code: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-[#0084bf] focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Category</label>
                <input
                  type="text"
                  value={serviceForm.category}
                  onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Cost Price (৳)</label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={e => setServiceForm({ ...serviceForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-right font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Selling Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-right font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe service scope and parts..."
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Status</label>
                <select
                  value={serviceForm.status}
                  onChange={e => setServiceForm({ ...serviceForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsServiceDrawerOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold text-xs"
              >
                CLOSE
              </button>
              <button
                type="submit"
                form="serviceDrawerForm"
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
