import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Plus,
  Key,
  Check,
  X,
  Mail,
  Phone,
  Lock,
  History,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Sliders,
} from 'lucide-react';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Manager' | 'Cashier' | 'Technician';
  phone: string;
  status: 'Active' | 'Suspended';
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'usr-1', name: 'Forhad Hossain', email: 'forhadhossaen@gmail.com', role: 'Administrator', phone: '01710000000', status: 'Active' },
  { id: 'usr-2', name: 'Kamrul Hasan', email: 'kamrul@nextgen.com', role: 'Technician', phone: '01822334455', status: 'Active' },
  { id: 'usr-3', name: 'Sadia Rahman', email: 'sadia@nextgen.com', role: 'Cashier', phone: '01933445566', status: 'Active' },
  { id: 'usr-4', name: 'Arif Mahmud', email: 'arif@nextgen.com', role: 'Manager', phone: '01644556677', status: 'Active' },
];

interface UsersRoleViewProps {
  activeSubItem?: string;
  onSelectSubItem?: (subId: string) => void;
}

export const UsersRoleView: React.FC<UsersRoleViewProps> = ({
  activeSubItem = '9.1',
  onSelectSubItem,
}) => {
  // Tabs: 9.1 Users | 9.2 Roles & Permissions | 9.3 User Access / Module Access | 9.4 Login & Security | 9.5 Activity / Audit Log
  const [activeTab, setActiveTab] = useState<string>(activeSubItem || '9.1');

  useEffect(() => {
    if (activeSubItem) {
      setActiveTab(activeSubItem);
    }
  }, [activeSubItem]);

  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Manager' | 'Cashier' | 'Technician'>('Cashier');
  const [phone, setPhone] = useState('');

  // 9.5 Audit Log Seed
  const [auditLogs] = useState([
    { id: 'log-1', timestamp: '2026-10-08 17:45', user: 'Forhad (Admin)', module: '1. SALES', action: 'Created Sales Invoice INV-2026-9048 for Tk 85,000', ip: '192.168.1.101' },
    { id: 'log-2', timestamp: '2026-10-08 16:30', user: 'Sadia (Cashier)', module: '1. SALES', action: 'POS Counter Checkout Sale (Walk-in Retail)', ip: '192.168.1.105' },
    { id: 'log-3', timestamp: '2026-10-08 14:15', user: 'Forhad (Admin)', module: '4. CLIENT SETUP', action: 'Updated Credit Limit for Vertex Technologies to ৳200,000', ip: '192.168.1.101' },
    { id: 'log-4', timestamp: '2026-10-08 11:20', user: 'Arif (Manager)', module: '2. PURCHASE', action: 'Processed Goods Received for PO-2026-4412 (10 Laptops)', ip: '192.168.1.103' },
    { id: 'log-5', timestamp: '2026-10-08 09:10', user: 'Kamrul (Tech)', module: 'SPECIALIZED', action: 'Created Service Ticket #SRV-1029 (Thermal Servicing)', ip: '192.168.1.108' },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playClickSound();

    setUsers([
      ...users,
      {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || 'user@nextgen.com',
        role,
        phone: phone.trim() || 'N/A',
        status: 'Active',
      },
    ]);

    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-y-auto font-sans select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>ERP</span>
            <span>›</span>
            <span>Reporting &amp; Admin</span>
            <span>›</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              9. User &amp; Role — ব্যবহারকারী ও অনুমতি
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-violet-600" />
            <span>User Access, Roles &amp; Security</span>
          </h1>
        </div>

        {activeTab === '9.1' && (
          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs md:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        )}
      </div>

      {/* Sub-tabs Navigation Bar (9.1 to 9.5) */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: '9.1', label: '9.1 Users', icon: UserCheck },
          { id: '9.2', label: '9.2 Roles & Permissions', icon: Shield },
          { id: '9.3', label: '9.3 User Access / Module Access', icon: Key },
          { id: '9.4', label: '9.4 Login & Security', icon: Lock },
          { id: '9.5', label: '9.5 Activity / Audit Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
                if (onSelectSubItem) onSelectSubItem(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
        {/* ======================================================== */}
        {/* 9.1 USERS                                                */}
        {/* ======================================================== */}
        {activeTab === '9.1' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Active System Accounts</h2>
              <span className="text-xs bg-violet-500/20 text-violet-300 font-mono font-bold px-2 py-0.5 rounded">
                {users.length} Users
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email &amp; Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{u.email}</div>
                      <div className="font-mono text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9.2 ROLES & PERMISSIONS                                  */}
        {/* ======================================================== */}
        {activeTab === '9.2' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: 'Administrator', desc: 'Full uncontrolled access to financial, sales, inventory, accounting and settings modules.', level: 'Super Admin' },
              { role: 'Manager', desc: 'Can manage sales, purchase orders, approvals, inventory adjustments, and view business reports.', level: 'Level 2' },
              { role: 'Cashier', desc: 'Restricted to POS counter billing, receipt printing, held orders, and shift drawer float.', level: 'Level 3' },
              { role: 'Technician', desc: 'Restricted to Service tickets, warranty status lookup, repair parts requisition.', level: 'Level 4' },
            ].map((r) => (
              <div
                key={r.role}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-violet-500" />
                    {r.role}
                  </span>
                  <span className="text-[10px] font-mono bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded font-bold">
                    {r.level}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* 9.3 USER ACCESS / MODULE ACCESS                          */}
        {/* ======================================================== */}
        {activeTab === '9.3' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">ERP 9-Module Permission Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Role-based granular permissions per module</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">ERP Module</th>
                    <th className="px-4 py-3 text-center">Administrator</th>
                    <th className="px-4 py-3 text-center">Manager</th>
                    <th className="px-4 py-3 text-center">Cashier</th>
                    <th className="px-4 py-3 text-center">Technician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-center">
                  {[
                    '1. SALES (বিক্রয়)',
                    '2. PURCHASE (ক্রয়)',
                    '3. INVENTORY (মজুদ স্টক)',
                    '4. CLIENT SETUP (গ্রাহক ও সাপ্লায়ার)',
                    '5. STAFF PAYROLL & SLIPS (বেতন)',
                    '6. ACCOUNTS & FINANCE (হিসাব)',
                    '7. REPORT (প্রতিবেদন)',
                    '8. MASTER SETUP (মাস্টার সেটিংস)',
                    '9. USER & ROLE (অনুমতি)',
                  ].map((modName, idx) => (
                    <tr key={modName} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white text-left">
                        {modName}
                      </td>
                      <td className="px-4 py-2.5 text-emerald-500 font-bold">Full Access</td>
                      <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
                        {idx <= 3 || idx === 6 ? 'Full' : 'Read Only'}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-500">
                        {idx === 0 ? 'Create / POS' : 'No Access'}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-500">
                        {idx === 2 ? 'Read Stock' : 'No Access'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9.4 LOGIN & SECURITY                                     */}
        {/* ======================================================== */}
        {activeTab === '9.4' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Authentication &amp; Session Security</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Require 2-Factor Authentication (2FA)</span>
                  <p className="text-[11px] text-slate-500">Enforce OTP verification on Cashier and Manager login</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Enabled</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Auto Session Lock on Inactivity</span>
                  <p className="text-[11px] text-slate-500">Lock POS register after 15 minutes of idle time</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">15 Minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9.5 ACTIVITY / AUDIT LOG                                 */}
        {/* ======================================================== */}
        {activeTab === '9.5' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  <span>Immutable System Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Chronological record of ERP actions and financial events</p>
              </div>
              <span className="text-xs font-mono text-emerald-500 font-bold">Live Log</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.user}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-mono">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{log.action}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono block">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: New User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-violet-600" />
                <span>Create System User Account</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariqul Islam"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                >
                  <option value="Administrator">Administrator (Super Admin)</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@nextgen.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01711-000000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
