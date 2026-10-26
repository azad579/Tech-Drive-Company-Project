import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ReportRoleCreateView: React.FC = () => {
  const { roles, addHistoryLog, setCurrentRoute } = useApp();
  const [selectedRole, setSelectedRole] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    addHistoryLog('Role has been updated', `Report Role assigned to: ${selectedRole}`);
    setFeedback(`Report role successfully assigned to "${selectedRole}"`);

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-700">Report Role Create</h1>
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
          <span className="text-gray-700 font-medium">Report Role Create</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center space-x-2 animate-in fade-in">
          <i className="fa fa-check-circle text-base text-emerald-600"></i>
          <span className="font-semibold">{feedback}</span>
        </div>
      )}

      {/* Main Card matching image_9535f9f0.png */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 relative">
        <div className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer p-1">
          <i className="fa fa-bars text-sm"></i>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div className="flex flex-1">
            <span className="inline-flex items-center px-4 py-2 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-700 text-xs font-semibold rounded-l-sm">
              Role
            </span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              required
              className="flex-1 border border-gray-300 rounded-r-sm px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
            >
              <option value="">-Select-</option>
              {roles.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#605ca8] hover:bg-[#524e94] text-white font-bold text-xs uppercase px-6 py-2.5 rounded-sm shadow transition tracking-wider flex-shrink-0"
          >
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};
