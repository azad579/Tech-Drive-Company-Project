import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface GenericModuleViewProps {
  title: string;
  categoryName: string;
  href: string;
}

interface ModuleRecord {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  status: string;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({
  title,
  categoryName,
  href
}) => {
  const { setCurrentRoute } = useApp();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<ModuleRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ModuleRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ModuleRecord | null>(null);

  const [formData, setFormData] = useState<{ [key: string]: string }>({
    name: '',
    code: '',
    description: '',
    status: 'Active'
  });

  // Dynamic sample rows tailored to the module title
  const [records, setRecords] = useState<ModuleRecord[]>(() => {
    if (title.toLowerCase().includes('brand')) {
      return [
        { id: '1', col1: 'Dell', col2: 'BRD-001', col3: 'USA', col4: 'Laptops, Desktops, Monitors', status: 'Active' },
        { id: '2', col1: 'HP', col2: 'BRD-002', col3: 'USA', col4: 'EliteBook, ProBook, Pavilion', status: 'Active' },
        { id: '3', col1: 'Lenovo', col2: 'BRD-003', col3: 'China', col4: 'ThinkPad, IdeaPad, Legion', status: 'Active' },
        { id: '4', col1: 'Apple', col2: 'BRD-004', col3: 'USA', col4: 'MacBook Air, MacBook Pro', status: 'Active' },
        { id: '5', col1: 'Asus', col2: 'BRD-005', col3: 'Taiwan', col4: 'ZenBook, ROG, VivoBook', status: 'Active' }
      ];
    }
    if (title.toLowerCase().includes('ram')) {
      return [
        { id: '1', col1: 'DDR4 8GB 3200MHz', col2: 'RAM-08-32', col3: 'Corsair / Kingston', col4: 'SODIMM Laptop RAM', status: 'Active' },
        { id: '2', col1: 'DDR4 16GB 3200MHz', col2: 'RAM-16-32', col3: 'Corsair / Crucial', col4: 'SODIMM Laptop RAM', status: 'Active' },
        { id: '3', col1: 'DDR5 16GB 4800MHz', col2: 'RAM-16-48', col3: 'Kingston Fury', col4: 'DDR5 Gaming SODIMM', status: 'Active' },
        { id: '4', col1: 'DDR3L 8GB 1600MHz', col2: 'RAM-08-16', col3: 'Samsung OEM', col4: '1.35V Low Voltage', status: 'Active' }
      ];
    }
    if (title.toLowerCase().includes('ssd')) {
      return [
        { id: '1', col1: 'NVMe M.2 256GB PCIe', col2: 'SSD-256-NV', col3: 'Samsung / Kingston', col4: 'Gen 3x4 High Speed', status: 'Active' },
        { id: '2', col1: 'NVMe M.2 512GB PCIe', col2: 'SSD-512-NV', col3: 'Kingston NV2', col4: 'Gen 4x4 NVMe', status: 'Active' },
        { id: '3', col1: 'NVMe M.2 1TB PCIe', col2: 'SSD-100-NV', col3: 'Samsung 980 Pro', col4: '7000 MB/s Read', status: 'Active' },
        { id: '4', col1: 'SATA 2.5" 240GB', col2: 'SSD-240-SA', col3: 'Western Digital Green', col4: 'Internal 2.5 Inch', status: 'Active' }
      ];
    }
    if (title.toLowerCase().includes('branch') || title.toLowerCase().includes('warehouse')) {
      return [
        { id: '1', col1: 'Main Branch Showroom', col2: 'BR-01', col3: 'Multiplan Center, Level 4, Dhaka', col4: '01700-112233', status: 'Active' },
        { id: '2', col1: 'IDB Bhaban Branch', col2: 'BR-02', col3: 'BCS Computer City, Agargaon, Dhaka', col4: '01700-445566', status: 'Active' },
        { id: '3', col1: 'Chittagong Hub', col2: 'BR-03', col3: 'Agrabad Commercial Area, Chittagong', col4: '01800-778899', status: 'Active' },
        { id: '4', col1: 'Central Warehouse', col2: 'WH-01', col3: 'Tejgaon Industrial Area, Dhaka', col4: '01900-123456', status: 'Active' }
      ];
    }
    if (title.toLowerCase().includes('employee') || title.toLowerCase().includes('payroll')) {
      return [
        { id: '1', col1: 'Saymon Azad', col2: 'EMP-001', col3: 'Managing Director / IT Head', col4: '01700-000000', status: 'Active' },
        { id: '2', col1: 'Kamrul Hasan', col2: 'EMP-002', col3: 'Senior Sales Executive', col4: '01711-223344', status: 'Active' },
        { id: '3', col1: 'Mahmudur Rahman', col2: 'EMP-003', col3: 'Hardware Engineer & Service', col4: '01819-556677', status: 'Active' },
        { id: '4', col1: 'Tanvir Ahmed', col2: 'EMP-004', col3: 'Accountant & Cashier', col4: '01912-889900', status: 'Active' }
      ];
    }
    if (title.toLowerCase().includes('warranty') || title.toLowerCase().includes('service')) {
      return [
        { id: '1', col1: 'Dell Latitude 5420 No Display', col2: 'WAR-891', col3: 'Customer: Al-Amin Computers', col4: 'Received: 20 Oct 2026', status: 'In Service' },
        { id: '2', col1: 'HP 840 G7 Battery Issue', col2: 'WAR-892', col3: 'Customer: Tech Park BD', col4: 'Sent to HP Center', status: 'Pending' },
        { id: '3', col1: 'Kingston 1TB SSD Read Error', col2: 'WAR-893', col3: 'Customer: Silicon Tech', col4: 'Replaced with New', status: 'Delivered' }
      ];
    }
    if (title.toLowerCase().includes('bank') || title.toLowerCase().includes('account')) {
      return [
        { id: '1', col1: 'Dutch-Bangla Bank Limited', col2: '105.120.45892', col3: 'Elephant Road Branch', col4: 'Current Account', status: 'Active' },
        { id: '2', col1: 'Islami Bank Bangladesh Ltd', col2: '205.018.99124', col3: 'New Market Branch', col4: 'Current Account', status: 'Active' },
        { id: '3', col1: 'bKash Merchant Wallet', col2: '01755-123456', col3: 'Merchant Gateway', col4: 'Mobile Banking', status: 'Active' },
        { id: '4', col1: 'Nagad Merchant Wallet', col2: '01811-987654', col3: 'Merchant Gateway', col4: 'Mobile Banking', status: 'Active' }
      ];
    }

    // Default business records
    return [
      { id: '1', col1: `${title} Entry #1`, col2: 'TD-101', col3: 'Main Branch (Dhaka)', col4: '2026-10-24', status: 'Active' },
      { id: '2', col1: `${title} Entry #2`, col2: 'TD-102', col3: 'IDB Bhaban Branch', col4: '2026-10-23', status: 'Active' },
      { id: '3', col1: `${title} Entry #3`, col2: 'TD-103', col3: 'Chittagong Hub', col4: '2026-10-22', status: 'Pending' },
      { id: '4', col1: `${title} Entry #4`, col2: 'TD-104', col3: 'Head Office', col4: '2026-10-20', status: 'Active' }
    ];
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setRecords(prev => [
      {
        id: String(Date.now()),
        col1: formData.name,
        col2: formData.code || `REF-${Math.floor(100 + Math.random() * 900)}`,
        col3: formData.description || 'Main Branch',
        col4: new Date().toISOString().split('T')[0],
        status: formData.status || 'Active'
      },
      ...prev
    ]);
    setIsAddOpen(false);
    setFormData({ name: '', code: '', description: '', status: 'Active' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setRecords(prev => prev.map(r => (r.id === editingRecord.id ? editingRecord : r)));
    setEditingRecord(null);
  };

  const confirmDeleteRecord = () => {
    if (!recordToDelete) return;
    setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
    setRecordToDelete(null);
  };

  const exportCSV = () => {
    const rows = [
      ['SN', 'Title / Name', 'Code / Ref', 'Details / Location', 'Date / Contact', 'Status'],
      ...filtered.map((r, idx) => [
        String(idx + 1),
        `"${r.col1}"`,
        `"${r.col2}"`,
        `"${r.col3}"`,
        `"${r.col4}"`,
        r.status
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = records.filter(r =>
    search === '' ||
    r.col1.toLowerCase().includes(search.toLowerCase()) ||
    r.col2.toLowerCase().includes(search.toLowerCase()) ||
    r.col3.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Content Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-normal text-gray-800">
            {title} <small className="text-xs text-gray-500 font-normal">Management &amp; Records</small>
          </h1>
        </div>
        <ol className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1 sm:mt-0">
          <li>
            <button
              onClick={() => setCurrentRoute('home.php', 'Dashboard')}
              className="text-[#0084bf] hover:underline flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Home</span>
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-500">{categoryName}</li>
          <li>/</li>
          <li className="text-gray-700 font-medium">{title}</li>
        </ol>
      </section>

      {/* Main Container Box */}
      <div className="box box-solid border border-gray-200 shadow-sm bg-white">
        <div className="box-header flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <h3 className="box-title">{title} List</h3>
            <span className="text-[11px] text-gray-400 font-mono">({href})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="btn btn-flat bg-purple text-white uppercase text-xs font-bold px-3 py-1 flex items-center space-x-1 shadow-xs"
            >
              <i className="fa fa-plus"></i>
              <span>Add {title.replace('List', '').trim() || 'New Entry'}</span>
            </button>
            <button
              onClick={exportCSV}
              className="btn btn-flat bg-[#00305d] text-white uppercase text-xs font-bold px-3 py-1 flex items-center space-x-1 shadow-xs"
              title="Export as CSV"
            >
              <i className="fa fa-file-excel-o"></i>
              <span>CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-flat bg-gray-700 hover:bg-gray-800 text-white uppercase text-xs font-bold px-3 py-1 flex items-center space-x-1 shadow-xs"
            >
              <i className="fa fa-print"></i>
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
          <div className="relative w-72">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${title}...`}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:border-[#0084bf] focus:outline-none"
            />
            <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-400"></i>
          </div>

          <div className="text-gray-500 text-xs">
            Showing <strong className="text-gray-800">{filtered.length}</strong> entries
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="table table-bordered table-striped w-full text-xs text-left">
            <thead className="bg-[#00305d] text-white">
              <tr>
                <th className="w-12 text-center py-2.5">SN</th>
                <th className="py-2.5 px-3">Title / Name</th>
                <th className="py-2.5 px-3">Code / Ref No</th>
                <th className="py-2.5 px-3">Details / Location</th>
                <th className="py-2.5 px-3">Date / Contact</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No records found for {title}. Click "Add New" above to record entries.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="text-center py-2.5 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      <span
                        className="cursor-pointer text-[#0084bf] hover:underline"
                        onClick={() => setViewingRecord(r)}
                      >
                        {r.col1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0084bf]">{r.col2}</td>
                    <td className="py-2.5 px-3 text-gray-600">{r.col3}</td>
                    <td className="py-2.5 px-3 text-gray-500">{r.col4}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Active' || r.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewingRecord(r)}
                        className="btn btn-flat bg-sky-600 hover:bg-sky-700 text-white text-[11px] px-2 py-0.5"
                        title="View Details"
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                      <button
                        onClick={() => setEditingRecord({ ...r })}
                        className="btn btn-flat bg-purple text-white text-[11px] px-2 py-0.5"
                        title="Edit Record"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        onClick={() => setRecordToDelete(r)}
                        className="btn btn-flat bg-red-600 hover:bg-red-700 text-white text-[11px] px-2 py-0.5"
                        title="Delete Record"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Record Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-5 border border-gray-300 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-800 flex items-center space-x-2">
                <i className="fa fa-info-circle text-[#0084bf]"></i>
                <span>Record Details</span>
              </h3>
              <button onClick={() => setViewingRecord(null)} className="text-gray-400 hover:text-gray-600 font-bold text-base">
                &times;
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex border-b pb-2">
                <span className="w-32 font-bold text-gray-600">Module:</span>
                <span className="font-semibold text-gray-900">{title}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="w-32 font-bold text-gray-600">Title / Name:</span>
                <span className="font-bold text-gray-900">{viewingRecord.col1}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="w-32 font-bold text-gray-600">Code / ID:</span>
                <span className="font-mono font-bold text-[#0084bf]">{viewingRecord.col2}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="w-32 font-bold text-gray-600">Details / Spec:</span>
                <span className="text-gray-800">{viewingRecord.col3}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="w-32 font-bold text-gray-600">Date / Contact:</span>
                <span className="text-gray-700">{viewingRecord.col4}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-bold text-gray-600">Status:</span>
                <span className="font-bold text-emerald-700">{viewingRecord.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="btn btn-flat bg-gray-600 text-white font-bold px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-5 border border-gray-300 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-800">Edit Record</h3>
              <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 pt-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.col1}
                  onChange={e => setEditingRecord({ ...editingRecord, col1: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Code / Reference ID</label>
                <input
                  type="text"
                  value={editingRecord.col2}
                  onChange={e => setEditingRecord({ ...editingRecord, col2: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Details / Specification</label>
                <textarea
                  value={editingRecord.col3}
                  onChange={e => setEditingRecord({ ...editingRecord, col3: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editingRecord.status}
                  onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-flat bg-purple text-white font-bold"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-sm w-full p-4 border border-gray-300 text-xs">
            <h3 className="font-bold text-base text-gray-800 mb-2 flex items-center space-x-1.5 text-red-600">
              <i className="fa fa-trash"></i>
              <span>Delete Confirmation</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove <strong>{recordToDelete.col1}</strong> ({recordToDelete.col2})?
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecord}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-5 border border-gray-300 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-800">Add to {title}</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name or title..."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0084bf]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Code / Reference ID</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. TD-901"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Details / Specification</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Description or branch details..."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-flat bg-purple text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
