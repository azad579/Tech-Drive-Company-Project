import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, setIsProfileModalOpen } = useApp();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');

  if (!isProfileModalOpen) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMessage('New passwords do not match!');
      return;
    }
    if (newPass.length < 4) {
      setMessage('Password must be at least 4 characters.');
      return;
    }
    setMessage('Password changed successfully!');
    setTimeout(() => {
      setMessage('');
      setIsProfileModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 border border-gray-300 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h3 className="font-bold text-base text-gray-800">User Profile &amp; Company Account</h3>
          <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="space-y-4 pt-3">
          {/* User & Company Identity Card */}
          <div className="bg-[#00284d] text-white p-4 rounded flex items-center space-x-3">
            <img
              src="/img/techdrive_fav.png"
              alt="Logo"
              className="w-12 h-12 rounded-full bg-white p-1 object-contain"
            />
            <div>
              <div className="text-base font-bold text-[#f39c12]">Al-Ehsan Trading Limited</div>
              <div className="text-[11px] text-sky-200">Authorized Operator: <strong>Saymon</strong> ({user.role})</div>
              <div className="text-[10px] text-sky-300 font-mono mt-0.5">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">Assigned Branch</span>
              <span className="font-semibold text-gray-800">{user.branch}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold block">System Access Level</span>
              <span className="font-semibold text-emerald-700">Super Administrator (All Rights)</span>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2 border-t border-gray-200">
            <h4 className="font-bold text-gray-700 text-xs">Change Password</h4>

            {message && (
              <div className={`p-2 rounded text-xs ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <div>
              <label className="block text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
                placeholder="Current Password (e.g. 123456789)"
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New Password"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0084bf] text-white font-semibold rounded hover:bg-[#006fa3]"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
