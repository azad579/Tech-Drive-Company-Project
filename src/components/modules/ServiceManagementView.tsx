import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { playClickSound, playBarcodeBeep } from '../../utils/sound';

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  serialNumber: string;
  issueDescription: string;
  estimatedCost: number;
  advancePaid: number;
  technician: string;
  createdAt: string;
  deliveryDate: string;
  status: 'Pending' | 'Diagnosing' | 'Repaired' | 'Delivered' | 'Cancelled';
}

const INITIAL_TICKETS: ServiceTicket[] = [
  {
    id: 'srv-1',
    ticketNumber: 'SRV-2026-104',
    customerName: 'Tanvir Ahmed',
    phone: '01711223344',
    deviceModel: 'ThinkPad T14 Gen 2',
    serialNumber: 'SN-TP-8921',
    issueDescription: 'Display flickering and thermal throttling under load.',
    estimatedCost: 4500,
    advancePaid: 1000,
    technician: 'Kamrul Hasan',
    createdAt: '2026-10-01',
    deliveryDate: '2026-10-05',
    status: 'Diagnosing',
  },
  {
    id: 'srv-2',
    ticketNumber: 'SRV-2026-105',
    customerName: 'Nusrat Jahan',
    phone: '01899887766',
    deviceModel: 'Dell Latitude 5420',
    serialNumber: 'SN-DL-4301',
    issueDescription: 'Battery not charging, swollen trackpad.',
    estimatedCost: 6500,
    advancePaid: 2000,
    technician: 'Sazzad Hossain',
    createdAt: '2026-09-28',
    deliveryDate: '2026-10-02',
    status: 'Repaired',
  },
  {
    id: 'srv-3',
    ticketNumber: 'SRV-2026-106',
    customerName: 'Rahim Chowdhury',
    phone: '01912345678',
    deviceModel: 'MacBook Air M1',
    serialNumber: 'SN-AP-9902',
    issueDescription: 'Water spill on keyboard, spacebar sticking.',
    estimatedCost: 12000,
    advancePaid: 5000,
    technician: 'Kamrul Hasan',
    createdAt: '2026-10-02',
    deliveryDate: '2026-10-08',
    status: 'Pending',
  },
];

export const ServiceManagementView: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(2500);
  const [advancePaid, setAdvancePaid] = useState(500);
  const [technician, setTechnician] = useState('Kamrul Hasan');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !deviceModel.trim()) return;

    playBarcodeBeep();
    const newTicket: ServiceTicket = {
      id: `srv-${Date.now()}`,
      ticketNumber: `SRV-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      customerName: customerName.trim(),
      phone: phone.trim() || 'N/A',
      deviceModel: deviceModel.trim(),
      serialNumber: serialNumber.trim() || 'N/A',
      issueDescription: issueDescription.trim() || 'Device hardware checkup',
      estimatedCost,
      advancePaid,
      technician,
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
    };

    setTickets([newTicket, ...tickets]);
    setIsNewTicketOpen(false);
    setCustomerName('');
    setPhone('');
    setDeviceModel('');
    setSerialNumber('');
    setIssueDescription('');
  };

  const handleStatusChange = (id: string, newStatus: ServiceTicket['status']) => {
    playClickSound();
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Daily Process</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">Service & Repair Management</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-sky-600" />
            <span>Service & RMA Tickets</span>
          </h1>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(!isNewTicketOpen)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs md:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Ticket</span>
        </button>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* New Ticket Form Accordion */}
        {isNewTicketOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-sky-600 text-white px-5 py-2.5 flex items-center justify-between font-bold text-xs uppercase tracking-wider">
              <span>Create Device Service Intake Ticket</span>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Shakil Khan"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Device Model *</label>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. HP EliteBook 840 G7"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-HP-8821"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Issue / Defect Description</label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe hardware symptoms, diagnostics requested, or physical damage..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Estimated Cost (৳)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Advance Paid (৳)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 text-white rounded-lg font-bold shadow-xs hover:bg-sky-700"
                  >
                    Issue Service Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, customer, device, serial..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            {['All', 'Pending', 'Diagnosing', 'Repaired', 'Delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid / Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Ticket & Date</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">Device & Serial</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4 text-right">Estimate & Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((t) => {
                  const due = t.estimatedCost - t.advancePaid;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sky-600 dark:text-sky-400">{t.ticketNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.createdAt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{t.customerName}</div>
                        <div className="text-[11px] text-slate-400">{t.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{t.deviceModel}</div>
                        <div className="font-mono text-[10px] text-slate-400">{t.serialNumber}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300 truncate" title={t.issueDescription}>
                        {t.issueDescription}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(t.estimatedCost)}</div>
                        <div className="text-[10px] text-emerald-600">Advance: {formatCurrency(t.advancePaid)}</div>
                        {due > 0 && <div className="text-[10px] text-rose-500 font-semibold">Due: {formatCurrency(due)}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            t.status === 'Repaired'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : t.status === 'Diagnosing'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                              : t.status === 'Delivered'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <option value="Pending">● Pending</option>
                          <option value="Diagnosing">● Diagnosing</option>
                          <option value="Repaired">● Repaired</option>
                          <option value="Delivered">● Delivered</option>
                          <option value="Cancelled">● Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
