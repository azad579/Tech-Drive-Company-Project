import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HistoryWidget } from '../components/HistoryWidget';
import { UserItem } from '../types';

export const UserListView: React.FC = () => {
  const { users, deleteUser, resetUserPassword, setEditingUser, setCurrentRoute } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'sn' | 'name' | 'email' | 'role'>('sn');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [userForPasswordReset, setUserForPasswordReset] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(false);

  // Filter and sort
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'sn') cmp = a.sn - b.sn;
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'email') cmp = a.email.localeCompare(b.email);
    else if (sortField === 'role') cmp = a.role.localeCompare(b.role);
    return sortAsc ? cmp : -cmp;
  });

  const totalEntries = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: 'sn' | 'name' | 'email' | 'role') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleEdit = (u: UserItem) => {
    setEditingUser(u);
    setCurrentRoute('rou_usercreate.php', 'User Create');
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or are empty');
      return;
    }
    if (userForPasswordReset) {
      resetUserPassword(userForPasswordReset.id, newPassword);
      setPasswordSuccessMsg(true);
      setTimeout(() => {
        setPasswordSuccessMsg(false);
        setUserForPasswordReset(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-700">All User</h1>
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
          <span className="text-gray-700 font-medium">All User</span>
        </div>
      </div>

      {/* Main Grid: Users Table + Right History Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Card: USER LIST */}
        <div className="flex-1 w-full bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0084bf] text-white px-4 py-2.5">
            <h2 className="font-bold text-sm tracking-wider uppercase">USER LIST</h2>
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
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition w-14"
                    >
                      <div className="flex items-center justify-between">
                        <span>SN</span>
                        <i className={`fa ${sortField === 'sn' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 border-r border-gray-200 w-16 text-center">
                      <span>Image</span>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>Name</span>
                        <i className={`fa ${sortField === 'name' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>Email</span>
                        <i className={`fa ${sortField === 'email' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('role')}
                      className="py-2.5 px-3 border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>Access</span>
                        <i className={`fa ${sortField === 'role' ? (sortAsc ? 'fa-sort-asc text-[#0084bf]' : 'fa-sort-desc text-[#0084bf]') : 'fa-sort text-gray-400'}`}></i>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 border-r border-gray-200 text-center w-20">
                      <span>Status</span>
                    </th>
                    <th className="py-2.5 px-3 text-center w-28">
                      <span>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-700">
                          {startIndex + idx + 1}
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">
                          <div className="w-8 h-8 mx-auto rounded bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <i className="fa fa-user text-gray-400 text-sm"></i>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 font-medium text-gray-800">
                          {u.name}
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 text-gray-600">
                          {u.email}
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                          {u.role}
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">
                          <span className="inline-block bg-[#00c0ef] text-white font-semibold text-[10px] px-2 py-0.5 rounded-sm shadow-xs">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Super-admin row 1 (Tech Drive) only has Key button in screenshot, others have Edit, Key, Delete */}
                            {u.id !== 'usr-1' && (
                              <button
                                onClick={() => handleEdit(u)}
                                title="Edit User"
                                className="w-6 h-6 bg-[#605ca8] hover:bg-[#524e94] text-white rounded-xs flex items-center justify-center shadow-xs transition"
                              >
                                <i className="fa fa-pencil text-[10px]"></i>
                              </button>
                            )}

                            {/* Purple Key Password Button */}
                            <button
                              onClick={() => {
                                setUserForPasswordReset(u);
                                setNewPassword('');
                                setConfirmPassword('');
                                setPasswordSuccessMsg(false);
                              }}
                              title="Reset Password"
                              className="w-6 h-6 bg-[#605ca8] hover:bg-[#524e94] text-white rounded-xs flex items-center justify-center shadow-xs transition"
                            >
                              <i className="fa fa-key text-[10px]"></i>
                            </button>

                            {u.id !== 'usr-1' && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                title="Delete User"
                                className="w-6 h-6 bg-[#605ca8] hover:bg-[#524e94] text-white rounded-xs flex items-center justify-center shadow-xs transition"
                              >
                                <i className="fa fa-trash text-[10px]"></i>
                              </button>
                            )}
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

            {/* Bottom Purple CREATE USER Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setCurrentRoute('rou_usercreate.php', 'User Create');
                }}
                className="bg-[#605ca8] hover:bg-[#524e94] text-white font-bold text-xs uppercase px-5 py-2.5 rounded shadow transition flex items-center space-x-1.5"
              >
                <span>CREATE USER</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right History Widget */}
        <HistoryWidget />
      </div>

      {/* Password Reset Modal */}
      {userForPasswordReset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#0084bf] text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-bold text-xs tracking-wider uppercase">Reset User Password</h3>
              <button
                onClick={() => setUserForPasswordReset(null)}
                className="text-white hover:text-sky-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-4 space-y-3 text-xs">
              {passwordSuccessMsg ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-300 text-center font-bold">
                  Password updated successfully!
                </div>
              ) : (
                <>
                  <div className="text-gray-700">
                    Resetting password for: <strong>{userForPasswordReset.name}</strong> ({userForPasswordReset.email})
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setUserForPasswordReset(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#605ca8] hover:bg-[#524e94] text-white font-bold rounded shadow"
                    >
                      Save Password
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fa fa-exclamation-triangle text-lg"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Delete User?</h3>
                <p className="text-xs text-gray-500">This user will permanently lose access.</p>
              </div>
            </div>

            <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
              Are you sure you want to delete user <strong className="text-red-700">{userToDelete.name}</strong> ({userToDelete.email})?
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
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
