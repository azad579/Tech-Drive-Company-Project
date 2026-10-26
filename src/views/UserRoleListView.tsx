import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HistoryWidget } from '../components/HistoryWidget';
import { RoleItem } from '../types';

export const UserRoleListView: React.FC = () => {
  const { roles, deleteRole, setCurrentRoute, setEditingRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'sn' | 'name' | 'description'>('sn');
  const [sortAsc, setSortAsc] = useState(true);

  // Delete modal state
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  // Filter and sort
  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'sn') cmp = a.sn - b.sn;
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'description') cmp = a.description.localeCompare(b.description);
    return sortAsc ? cmp : -cmp;
  });

  const totalEntries = sortedRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRoles = sortedRoles.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: 'sn' | 'name' | 'description') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setCurrentRoute('rou_rolecreate.php', 'Role Create');
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id);
      setRoleToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-700">User Role</h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard text-gray-400"></i>
          <button
            onClick={() => setCurrentRoute('home.php', 'Dashboard')}
            className="hover:text-[#0084bf] transition"
          >
            Dashboard
          </button>
          <span>&gt;</span>
          <span>User &amp; Role</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-medium">User Role</span>
        </div>
      </div>

      {/* Main Grid: Role Table + Right History Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Card: ALL ROLE Table */}
        <div className="flex-1 w-full bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0084bf] text-white px-4 py-2.5">
            <h2 className="font-bold text-sm tracking-wider uppercase">ALL ROLE</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Datatable Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>records per page</span>
              </div>

              <div className="flex items-center space-x-2">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#0084bf] w-48"
                  placeholder=""
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f4f4] text-gray-700 border-b border-gray-200 font-semibold select-none">
                    <th
                      onClick={() => handleSort('sn')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition w-16"
                    >
                      <div className="flex items-center justify-between">
                        <span>SN</span>
                        <i className={`fa ${sortField === 'sn' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>Access</span>
                        <i className={`fa ${sortField === 'name' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('description')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>Description</span>
                        <i className={`fa ${sortField === 'description' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center w-28">
                      <div className="flex items-center justify-center space-x-1">
                        <span>Action</span>
                        <i className="fa fa-sort text-gray-400"></i>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">
                        No matching roles found
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((role, idx) => (
                      <tr key={role.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2.5 px-3 border-r border-gray-200 font-medium text-gray-700">
                          {startIndex + idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-200 font-semibold text-gray-800">
                          {role.name}
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-200 text-gray-600">
                          {role.description || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Purple Edit Button */}
                            <button
                              onClick={() => handleEditRole(role)}
                              title="Edit Role"
                              className="w-7 h-7 bg-[#605ca8] hover:bg-[#524e94] text-white rounded flex items-center justify-center shadow-xs transition"
                            >
                              <i className="fa fa-pencil text-xs"></i>
                            </button>
                            {/* Purple Delete Button */}
                            <button
                              onClick={() => setRoleToDelete(role)}
                              title="Delete Role"
                              className="w-7 h-7 bg-[#605ca8] hover:bg-[#524e94] text-white rounded flex items-center justify-center shadow-xs transition"
                            >
                              <i className="fa fa-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600 pt-1">
              <div>
                Showing {totalEntries > 0 ? startIndex + 1 : 0} to{' '}
                {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} entries
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border border-gray-300 rounded ${
                    currentPage === 1
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded font-semibold ${
                      currentPage === i + 1
                        ? 'bg-[#0084bf] text-white border-[#0084bf]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border border-gray-300 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Bottom Purple ADD ROLE Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setEditingRole(null);
                  setCurrentRoute('rou_rolecreate.php', 'Role Create');
                }}
                className="bg-[#605ca8] hover:bg-[#524e94] text-white font-bold text-xs uppercase px-5 py-2.5 rounded shadow transition flex items-center space-x-1.5"
              >
                <span>ADD ROLE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right History Widget */}
        <HistoryWidget />
      </div>

      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fa fa-exclamation-triangle text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Delete User Role?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
              Are you sure you want to delete role <strong className="text-red-700">{roleToDelete.name}</strong>?
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRoleToDelete(null)}
                className="px-3.5 py-1.5 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
