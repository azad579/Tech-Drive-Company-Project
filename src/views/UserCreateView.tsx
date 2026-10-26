import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HistoryWidget } from '../components/HistoryWidget';

export const UserCreateView: React.FC = () => {
  const { roles, addUser, updateUser, editingUser, setEditingUser, setCurrentRoute } = useApp();

  const [email, setEmail] = useState(editingUser ? editingUser.email : 'alehsantradinglimited@gmail.com');
  const [nameEn, setNameEn] = useState(editingUser ? editingUser.name : '');
  const [nameBn, setNameBn] = useState(editingUser ? (editingUser.nameBn || '') : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessLevel, setAccessLevel] = useState(editingUser ? editingUser.role : '');
  const [branch, setBranch] = useState(editingUser ? editingUser.branch : '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(editingUser ? editingUser.status : 'Active');
  const [avatarPreview, setAvatarPreview] = useState<string>(editingUser?.avatar || '');
  const [fileNameText, setFileNameText] = useState('NO FILE CHOSEN');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingUser) {
      setEmail(editingUser.email);
      setNameEn(editingUser.name);
      setNameBn(editingUser.nameBn || '');
      setAccessLevel(editingUser.role);
      setBranch(editingUser.branch);
      setStatus(editingUser.status);
      setAvatarPreview(editingUser.avatar || '');
    }
  }, [editingUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNameText(file.name);
      const reader = new FileReader();
      reader.onload = evt => {
        setAvatarPreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      alert('Please enter Name (English)');
      return;
    }
    if (!email.trim()) {
      alert('Please enter Email');
      return;
    }
    if (!editingUser && password && password !== confirmPassword) {
      alert('Password confirmation does not match');
      return;
    }

    const assignedRole = accessLevel || (roles[0] ? roles[0].name : 'Administration');
    const assignedBranch = branch || 'Main Branch';

    if (editingUser) {
      updateUser(editingUser.id, {
        name: nameEn.trim(),
        nameBn: nameBn.trim(),
        email: email.trim(),
        role: assignedRole,
        branch: assignedBranch,
        status,
        avatar: avatarPreview
      });
      setFeedbackMsg('User has been updated successfully!');
    } else {
      addUser({
        name: nameEn.trim(),
        nameBn: nameBn.trim(),
        email: email.trim(),
        role: assignedRole,
        branch: assignedBranch,
        status,
        avatar: avatarPreview
      });
      setFeedbackMsg('New User has been created successfully!');
    }

    setTimeout(() => {
      setEditingUser(null);
      setCurrentRoute('rou_userlist.php', 'All User');
    }, 900);
  };

  const handleClose = () => {
    setEditingUser(null);
    setCurrentRoute('rou_userlist.php', 'All User');
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-700">User Create</h1>
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
          <span className="text-gray-700 font-medium">User Create</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center space-x-2 animate-in fade-in">
          <i className="fa fa-check-circle text-base text-emerald-600"></i>
          <span className="font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Main Grid: Form + Right History Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Form Box */}
        <div className="flex-1 w-full bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#0084bf] text-white px-4 py-2.5 flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-wider uppercase">
              {editingUser ? 'EDIT USER' : 'ADD NEW USER'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Input Fields (md:col-span-8) */}
              <div className="md:col-span-8 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      E
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="e.g. info@techdrivebd.com"
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Name English */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name (English)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      N
                    </span>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={e => setNameEn(e.target.value)}
                      required
                      placeholder="e. g Sumon"
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Name Bangla */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name (বাংলা)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      N
                    </span>
                    <input
                      type="text"
                      value={nameBn}
                      onChange={e => setNameBn(e.target.value)}
                      placeholder="e. g সুমন"
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                        P
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                    <div className="flex">
                      <span className="inline-flex items-center px-2 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                        CP
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm"
                        className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                  </div>
                </div>

                {/* Access Lavel */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Access Lavel</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      AL
                    </span>
                    <select
                      value={accessLevel}
                      onChange={e => setAccessLevel(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="">-Select-</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      BR
                    </span>
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="">-Select-</option>
                      <option value="Main Branch">Main Branch</option>
                      <option value="Elephant Road Branch">Elephant Road Branch</option>
                      <option value="IDB Bhaban Branch">IDB Bhaban Branch</option>
                      <option value="Multiplan Branch">Multiplan Branch</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2 py-1.5 bg-[#f4f4f4] border border-r-0 border-gray-300 text-gray-600 text-xs font-bold rounded-l-sm">
                      ST
                    </span>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                      className="flex-1 border border-gray-300 rounded-r-sm px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Image Preview (md:col-span-4) */}
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Image</label>
                <div className="w-48 h-48 bg-[#e9ecef] border border-gray-300 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      className="w-36 h-36 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>

                {/* Hidden File Input & Choose File Purple Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#605ca8] hover:bg-[#524e94] text-white text-[11px] font-semibold py-1.5 px-3 rounded-sm shadow-xs transition"
                  >
                    Choose File
                  </button>
                  <span className="text-[10px] text-gray-500 font-mono uppercase truncate max-w-[130px]">
                    {fileNameText}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-6 border-t border-gray-200 mt-6">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#524e94] text-white font-bold text-xs uppercase px-5 py-2 rounded-sm shadow transition"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="bg-[#d2d6de] hover:bg-gray-300 text-gray-800 font-bold text-xs uppercase px-5 py-2 rounded-sm border border-gray-400 transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>

        {/* Right History Widget */}
        <HistoryWidget />
      </div>
    </div>
  );
};
