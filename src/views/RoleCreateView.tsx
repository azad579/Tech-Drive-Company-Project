import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HistoryWidget } from '../components/HistoryWidget';
import { ERP_MODULE_SECTIONS, ERP_MODULE_TOGGLES } from '../data/mockData';
import { RoleItem } from '../types';

export const RoleCreateView: React.FC = () => {
  const { addRole, updateRole, editingRole, setEditingRole, setCurrentRoute } = useApp();

  const [roleName, setRoleName] = useState(editingRole ? editingRole.name : '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(editingRole ? editingRole.status : 'Active');
  const [description, setDescription] = useState(editingRole ? editingRole.description : '');

  // Module Access Toggles
  const [moduleAccess, setModuleAccess] = useState<Record<string, boolean>>(() => {
    if (editingRole?.moduleAccess) {
      return { ...editingRole.moduleAccess };
    }
    return ERP_MODULE_TOGGLES.reduce((acc, m) => ({ ...acc, [m]: true }), {});
  });

  // Granular Matrix
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, { read: boolean; write: boolean; edit: boolean; delete: boolean; print: boolean }>>
  >(() => {
    if (editingRole?.permissions) {
      return JSON.parse(JSON.stringify(editingRole.permissions));
    }
    return ERP_MODULE_SECTIONS.reduce((acc, sec) => {
      acc[sec.name] = sec.items.reduce((secAcc, item) => {
        secAcc[item] = { read: true, write: true, edit: true, delete: true, print: true };
        return secAcc;
      }, {} as any);
      return acc;
    }, {} as any);
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name);
      setStatus(editingRole.status);
      setDescription(editingRole.description);
      if (editingRole.moduleAccess) setModuleAccess({ ...editingRole.moduleAccess });
      if (editingRole.permissions) setPermissions(JSON.parse(JSON.stringify(editingRole.permissions)));
    }
  }, [editingRole]);

  const toggleModuleAccess = (mod: string) => {
    const newVal = !moduleAccess[mod];
    setModuleAccess(prev => ({ ...prev, [mod]: newVal }));

    // Also toggle corresponding sub items if section exists
    if (permissions[mod]) {
      setPermissions(prev => {
        const updatedSection = { ...prev[mod] };
        Object.keys(updatedSection).forEach(itemKey => {
          updatedSection[itemKey] = {
            read: newVal,
            write: newVal,
            edit: newVal,
            delete: newVal,
            print: newVal
          };
        });
        return { ...prev, [mod]: updatedSection };
      });
    }
  };

  const toggleCell = (section: string, item: string, col: 'read' | 'write' | 'edit' | 'delete' | 'print') => {
    setPermissions(prev => {
      const secData = prev[section] || {};
      const itemData = secData[item] || { read: true, write: true, edit: true, delete: true, print: true };
      return {
        ...prev,
        [section]: {
          ...secData,
          [item]: {
            ...itemData,
            [col]: !itemData[col]
          }
        }
      };
    });
  };

  const toggleColumnAll = (section: string, col: 'read' | 'write' | 'edit' | 'delete' | 'print') => {
    const sec = ERP_MODULE_SECTIONS.find(s => s.name === section);
    if (!sec) return;
    const currentValues = sec.items.map(it => permissions[section]?.[it]?.[col] ?? false);
    const anyChecked = currentValues.some(v => v);
    const targetVal = !anyChecked;

    setPermissions(prev => {
      const secData = { ...(prev[section] || {}) };
      sec.items.forEach(it => {
        const itemData = secData[it] || { read: true, write: true, edit: true, delete: true, print: true };
        secData[it] = {
          ...itemData,
          [col]: targetVal
        };
      });
      return {
        ...prev,
        [section]: secData
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('Please enter Role Name');
      return;
    }

    if (editingRole) {
      updateRole(editingRole.id, {
        name: roleName.trim(),
        status,
        description: description.trim(),
        moduleAccess,
        permissions
      });
      setFeedbackMsg('Role has been updated successfully!');
    } else {
      addRole({
        name: roleName.trim(),
        status,
        description: description.trim(),
        moduleAccess,
        permissions
      });
      setFeedbackMsg('New Role has been created successfully!');
    }

    setTimeout(() => {
      setEditingRole(null);
      setCurrentRoute('rou_rolelist.php', 'Role List');
    }, 900);
  };

  const handleClose = () => {
    setEditingRole(null);
    setCurrentRoute('rou_rolelist.php', 'Role List');
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-normal text-gray-700">Role Create</h1>
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
          <span className="text-gray-700 font-medium">Role Create</span>
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
              {editingRole ? 'EDIT ROLE' : 'ASSIGN NEW ROLE'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-6">
            {/* Top Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="Role Name"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#0084bf]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Role description..."
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#0084bf]"
                ></textarea>
              </div>
            </div>

            {/* Module Access Switch Section */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Module Access</h3>
              <div className="flex flex-wrap gap-4 sm:gap-6 bg-gray-50/70 p-3.5 rounded border border-gray-200">
                {ERP_MODULE_TOGGLES.map(mod => {
                  const isChecked = !!moduleAccess[mod];
                  return (
                    <label
                      key={mod}
                      className="inline-flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none group"
                    >
                      {/* Styled switch pill matching screenshots */}
                      <div
                        onClick={() => toggleModuleAccess(mod)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          isChecked ? 'bg-[#0084bf]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isChecked ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                      <span className="group-hover:text-[#0084bf] transition">{mod}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Granular Permission Tables */}
            <div className="border-t border-gray-200 pt-4 space-y-5">
              <div className="text-xs text-gray-500 font-normal">
                Configure granular permissions for every sub-feature. You can click column headers to toggle all rows in that section.
              </div>

              <div className="space-y-6">
                {ERP_MODULE_SECTIONS.map(sec => (
                  <div key={sec.name} className="border border-gray-200 rounded-sm overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#cbd5e1] text-gray-800 font-semibold select-none border-b border-gray-300">
                          <th className="py-2 px-3 border-r border-gray-300 w-1/3">
                            {sec.name}
                          </th>
                          <th
                            onClick={() => toggleColumnAll(sec.name, 'read')}
                            className="py-2 px-3 text-center border-r border-gray-300 cursor-pointer hover:bg-slate-300 transition w-24"
                            title="Click to toggle all Read"
                          >
                            Read
                          </th>
                          <th
                            onClick={() => toggleColumnAll(sec.name, 'write')}
                            className="py-2 px-3 text-center border-r border-gray-300 cursor-pointer hover:bg-slate-300 transition w-24"
                            title="Click to toggle all Write"
                          >
                            Write
                          </th>
                          <th
                            onClick={() => toggleColumnAll(sec.name, 'edit')}
                            className="py-2 px-3 text-center border-r border-gray-300 cursor-pointer hover:bg-slate-300 transition w-24"
                            title="Click to toggle all Edit"
                          >
                            Edit
                          </th>
                          <th
                            onClick={() => toggleColumnAll(sec.name, 'delete')}
                            className="py-2 px-3 text-center border-r border-gray-300 cursor-pointer hover:bg-slate-300 transition w-24"
                            title="Click to toggle all Delete"
                          >
                            Delete
                          </th>
                          <th
                            onClick={() => toggleColumnAll(sec.name, 'print')}
                            className="py-2 px-3 text-center cursor-pointer hover:bg-slate-300 transition w-24"
                            title="Click to toggle all Print"
                          >
                            Print
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sec.items.map(item => {
                          const itemPerms = permissions[sec.name]?.[item] || {
                            read: true,
                            write: true,
                            edit: true,
                            delete: true,
                            print: true
                          };
                          return (
                            <tr key={item} className="hover:bg-sky-50/40 transition">
                              <td className="py-2 px-3 border-r border-gray-200 text-gray-700 font-medium">
                                {item}
                              </td>
                              {(['read', 'write', 'edit', 'delete', 'print'] as const).map(col => (
                                <td
                                  key={col}
                                  className={`py-2 px-3 text-center ${col !== 'print' ? 'border-r border-gray-200' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!itemPerms[col]}
                                    onChange={() => toggleCell(sec.name, item, col)}
                                    className="w-4 h-4 text-[#0084bf] rounded border-gray-300 focus:ring-0 cursor-pointer accent-[#0084bf]"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
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
