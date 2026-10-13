import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Search,
  Plus,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Filter,
  User,
  Building,
} from 'lucide-react';
import { INITIAL_ATTENDANCE, AttendanceRecord } from '../../data/mockErpData';
import { playClickSound, playCashDrawerDing } from '../../utils/sound';

export const AttendanceTab: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Late' | 'Absent' | 'On Leave'>('All');
  const [selectedDate, setSelectedDate] = useState('2026-10-08');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [employeeName, setEmployeeName] = useState('Abdur Rahim');
  const [department, setDepartment] = useState('Sales');
  const [designation, setDesignation] = useState('Senior Sales Executive');
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('06:00 PM');
  const [status, setStatus] = useState<'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day'>('Present');
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [notes, setNotes] = useState('Regular working hours completed');

  const filtered = records.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmp = r.employeeName.toLowerCase().includes(q);
      const matchDept = r.department.toLowerCase().includes(q);
      const matchDes = r.designation.toLowerCase().includes(q);
      if (!matchEmp && !matchDept && !matchDes) return false;
    }
    return true;
  });

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const leaveCount = records.filter((r) => r.status === 'On Leave' || r.status === 'Absent').length;
  const totalOt = records.reduce((acc, r) => acc + r.overtimeHours, 0);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    playCashDrawerDing();

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: selectedDate,
      employeeId: `staff-${Date.now()}`,
      employeeName: employeeName.trim(),
      designation: designation.trim(),
      department: department.trim(),
      checkIn,
      checkOut,
      status,
      overtimeHours,
      notes: notes.trim(),
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/50">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, department, designation..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            {['All', 'Present', 'Late', 'Leave'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Clock In / Mark</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/40 border-b border-slate-800 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Present Today</span>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{presentCount} Staff</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Late Arrivals</span>
          <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{lateCount} Staff</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">On Leave / Absent</span>
          <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">{leaveCount} Staff</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Overtime</span>
          <div className="text-lg font-mono font-bold text-teal-400 mt-0.5">{totalOt} Hours</div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Date</th>
              <th className="p-3">Check-In</th>
              <th className="p-3">Check-Out</th>
              <th className="p-3 text-center">Overtime</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3">Notes / Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/70 transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    {r.employeeName.charAt(0)}
                  </div>
                  <span>{r.employeeName}</span>
                </td>
                <td className="p-3 text-slate-300">{r.department}</td>
                <td className="p-3 text-slate-400">{r.designation}</td>
                <td className="p-3 font-mono text-slate-400">{r.date}</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">{r.checkIn}</td>
                <td className="p-3 font-mono text-blue-400 font-bold">{r.checkOut}</td>
                <td className="p-3 font-mono text-center text-amber-300 font-bold">
                  {r.overtimeHours > 0 ? `+${r.overtimeHours} hrs` : '—'}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : r.status === 'Late'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-slate-400 max-w-xs truncate">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MARK ATTENDANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-200" />
                <span>Mark Staff Attendance</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Employee Name *</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Service">Service</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Check-In Time</label>
                  <input
                    type="text"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Check-Out Time</label>
                  <input
                    type="text"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Overtime Hours (if any)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Remarks / Shift Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
