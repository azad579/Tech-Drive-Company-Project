import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { HistoryWidget } from '../components/HistoryWidget';
import { Employee, Department, Designation, LeaveType, LeaveRecord, AttendanceRecord, PayslipItem } from '../types';

export const PayrollModuleView: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    departments,
    addDepartment,
    deleteDepartment,
    designations,
    addDesignation,
    deleteDesignation,
    employees,
    addEmployee,
    deleteEmployee,
    leaveTypes,
    addLeaveType,
    deleteLeaveType,
    leaveRecords,
    addLeaveRecord,
    updateLeaveStatus,
    attendanceRecords,
    updateAttendanceRecord,
    payslips,
    generatePayslips,
    payPayslip
  } = useApp();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState('10');

  // Department Form
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Designation Form
  const [desigName, setDesigName] = useState('');
  const [desigDesc, setDesigDesc] = useState('');

  // Employee Form matching image_76d576a9.png & image_88f2bafe.png
  const [empForm, setEmpForm] = useState<{
    employeeId: string;
    department: string;
    designation: string;
    name: string;
    fatherName: string;
    motherName: string;
    mobile: string;
    phone: string;
    email: string;
    nid: string;
    dob: string;
    joiningDate: string;
    salary: number;
    status: 'Active' | 'Inactive';
    branch: string;
    address: string;
    permanentAddress: string;
  }>({
    employeeId: `EM-${Math.floor(10000 + Math.random() * 90000)}`,
    department: 'Sales & Marketing Department',
    designation: 'Sales Executive',
    name: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    phone: '',
    email: '',
    nid: '',
    dob: '1995-01-01',
    joiningDate: '2026-01-01',
    salary: 20000,
    status: 'Active',
    branch: 'No-Branch',
    address: '',
    permanentAddress: ''
  });

  // Leave Type Form
  const [leaveTypeName, setLeaveTypeName] = useState('');
  const [leaveTypeDays, setLeaveTypeDays] = useState(14);
  const [leaveTypeStatus, setLeaveTypeStatus] = useState<'Active' | 'Inactive'>('Active');
  const [leaveTypeDesc, setLeaveTypeDesc] = useState('');

  // Leave Application Form matching image_84b73090.png
  const [leaveAppForm, setLeaveAppForm] = useState({
    employeeId: employees[0]?.employeeId || 'EM-10013',
    leaveType: leaveTypes[0]?.name || 'Weekly Day off',
    applyDate: '2026-09-26',
    leaveFrom: '2026-09-24',
    leaveTo: '2026-09-28',
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected',
    reason: '',
    note: ''
  });

  // Attendance / Salary Month Controls matching image_fb635a24.png
  const [salaryYear, setSalaryYear] = useState('2026');
  const [salaryMonth, setSalaryMonth] = useState('September');
  const [salaryBranch, setSalaryBranch] = useState('No-Branch');

  // Selected Payslip for Printing Modal
  const [selectedPayslipToPrint, setSelectedPayslipToPrint] = useState<PayslipItem | null>(null);

  // Submit Department
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    addDepartment({
      name: deptName.trim(),
      code: deptName.slice(0, 3).toUpperCase(),
      description: deptDesc.trim(),
      employeeCount: 0
    });
    setDeptName('');
    setDeptDesc('');
    setCurrentRoute('payr_deplist.php', 'Department');
  };

  // Submit Designation
  const handleSaveDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigName.trim()) return;
    addDesignation({
      name: desigName.trim(),
      department: 'Sales & Marketing Department',
      description: desigDesc.trim()
    });
    setDesigName('');
    setDesigDesc('');
    setCurrentRoute('payr_desiglist.php', 'Designation');
  };

  // Submit Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim()) return;

    addEmployee({
      employeeId: empForm.employeeId,
      name: empForm.name.trim(),
      fatherName: empForm.fatherName,
      motherName: empForm.motherName,
      dob: empForm.dob,
      department: empForm.department,
      designation: empForm.designation,
      joiningDate: empForm.joiningDate,
      branch: empForm.branch,
      mobile: empForm.mobile,
      phone: empForm.phone,
      email: empForm.email,
      nid: empForm.nid,
      basicSalary: Number(empForm.salary) * 0.7,
      salary: Number(empForm.salary),
      status: empForm.status,
      address: empForm.address,
      permanentAddress: empForm.permanentAddress
    });

    setCurrentRoute('payr_emplist.php', 'Employee List');
  };

  // Submit Leave Type
  const handleSaveLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTypeName.trim()) return;
    addLeaveType({
      name: leaveTypeName.trim(),
      days: Number(leaveTypeDays) || 1,
      isPaid: true
    });
    setLeaveTypeName('');
    setLeaveTypeDesc('');
    setCurrentRoute('payr_levlist.php', 'Leave Type');
  };

  // Submit Leave Application
  const handleSaveLeaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(x => x.employeeId === leaveAppForm.employeeId) || employees[0];
    addLeaveRecord({
      employeeId: emp.employeeId,
      employeeName: `${emp.name} (${emp.designation})`,
      leaveType: leaveAppForm.leaveType,
      fromDate: leaveAppForm.leaveFrom,
      toDate: leaveAppForm.leaveTo,
      totalDays: 5,
      reason: leaveAppForm.reason || 'Weekly designated off days adjustment',
      status: leaveAppForm.status === 'Approved' ? 'Approved' : 'Pending',
      appliedDate: leaveAppForm.applyDate
    });
    setCurrentRoute('payr_levaplist.php', 'Leave Record');
  };

  // Filtered lists
  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDesigs = designations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.mobile.includes(searchTerm)
  );

  const filteredLeaveTypes = leaveTypes.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // RENDER CONTENT BASED ON ROUTE
  const renderContent = () => {
    // -------------------------------------------------------------------------------------
    // 1. DEPARTMENT LIST (payr_deplist.php) matching screenshot image_d6afa64e.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_deplist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
            {/* Header matching image_d6afa64e.png banner "DEPARTMET" */}
            <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider">DEPARTMET</h2>
            </div>

            <div className="p-4 space-y-3">
              {/* Controls bar: Show records per page and Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Show</span>
                  <select
                    value={perPage}
                    onChange={e => setPerPage(e.target.value)}
                    className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>records per page</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#605ca8]"
                  />
                </div>
              </div>

              {/* Department Table matching image_d6afa64e.png */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200">
                  <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300">
                    <tr>
                      <th className="py-2.5 px-3 w-14 text-center border-r border-gray-200">SN</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">Name</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">Description</th>
                      <th className="py-2.5 px-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDepts.map((dept, idx) => (
                      <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900 border-r border-gray-200">{dept.name}</td>
                        <td className="py-2.5 px-3 text-gray-600 border-r border-gray-200">{dept.description || ''}</td>
                        <td className="py-2.5 px-3 text-center space-x-1.5 whitespace-nowrap">
                          {/* Purple square action buttons matching screenshot */}
                          <button
                            onClick={() => setCurrentRoute('payr_deplcre.php', 'Department Create')}
                            className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                            title="Edit"
                          >
                            <i className="fa fa-pencil text-[11px]"></i>
                          </button>
                          <button
                            onClick={() => deleteDepartment(dept.id)}
                            className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                            title="Delete"
                          >
                            <i className="fa fa-trash text-[11px]"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer with Showing count and ADD DEPARTMENT purple button */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
                <div className="text-xs text-gray-600">
                  Showing 1 to {filteredDepts.length} of {departments.length} entries
                </div>

                <div className="flex items-center space-x-3">
                  <div className="inline-flex rounded-xs shadow-xs text-xs">
                    <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-l-xs hover:bg-gray-50">Previous</button>
                    <button className="px-3 py-1 border-t border-b border-gray-300 bg-[#605ca8] text-white font-bold">1</button>
                    <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-r-xs hover:bg-gray-50">Next</button>
                  </div>

                  <button
                    onClick={() => setCurrentRoute('payr_deplcre.php', 'Department Create')}
                    className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-4 py-1.5 rounded-xs text-xs tracking-wider uppercase transition shadow-xs flex items-center space-x-1"
                  >
                    <span>ADD DEPARTMENT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right History Widget */}
          <HistoryWidget />
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 2. DEPARTMENT CREATE (payr_deplcre.php) matching screenshot image_aa16e0e8.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_deplcre.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden max-w-4xl">
          {/* Header matching image_aa16e0e8.png banner "ADD DEPARTMENT" */}
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">ADD DEPARTMENT</h2>
          </div>

          <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs text-gray-800">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                placeholder="e.g Security"
                className="w-full border border-gray-300 rounded-xs px-3 py-2 text-xs focus:border-[#605ca8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={deptDesc}
                onChange={e => setDeptDesc(e.target.value)}
                placeholder="Description"
                className="w-full border border-gray-300 rounded-xs p-3 text-xs focus:border-[#605ca8] focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-6 py-2 rounded-xs text-xs uppercase transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('payr_deplist.php', 'Department')}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-6 py-2 rounded-xs text-xs uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 3. DESIGNATION LIST (payr_desiglist.php) matching screenshot image_e42d6b25.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_desiglist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
            {/* Header banner matching image_e42d6b25.png "DESIGNATION" */}
            <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider">DESIGNATION</h2>
            </div>

            <div className="p-4 space-y-3">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
                <div className="flex items-center space-x-1">
                  <span>Show</span>
                  <select
                    value={perPage}
                    onChange={e => setPerPage(e.target.value)}
                    className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                  </select>
                  <span>records per page</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span>Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#605ca8]"
                  />
                </div>
              </div>

              {/* Designation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200">
                  <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300">
                    <tr>
                      <th className="py-2.5 px-3 w-14 text-center border-r border-gray-200">SN</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">Name</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">Description</th>
                      <th className="py-2.5 px-3 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDesigs.map((desig, idx) => (
                      <tr key={desig.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900 border-r border-gray-200">{desig.name}</td>
                        <td className="py-2.5 px-3 text-gray-600 border-r border-gray-200">{desig.description || ''}</td>
                        <td className="py-2.5 px-3 text-center space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setCurrentRoute('payr_desigcreate.php', 'Designation Create')}
                            className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                            title="Edit"
                          >
                            <i className="fa fa-pencil text-[11px]"></i>
                          </button>
                          <button
                            onClick={() => deleteDesignation(desig.id)}
                            className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                            title="Delete"
                          >
                            <i className="fa fa-trash text-[11px]"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
                <div className="text-xs text-gray-600">
                  Showing 1 to {filteredDesigs.length} of {designations.length} entries
                </div>

                <div className="flex items-center space-x-3">
                  <div className="inline-flex rounded-xs shadow-xs text-xs">
                    <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-l-xs">Previous</button>
                    <button className="px-3 py-1 border-t border-b border-gray-300 bg-[#605ca8] text-white font-bold">1</button>
                    <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-r-xs">Next</button>
                  </div>

                  <button
                    onClick={() => setCurrentRoute('payr_desigcreate.php', 'Designation Create')}
                    className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-4 py-1.5 rounded-xs text-xs tracking-wider uppercase transition shadow-xs flex items-center space-x-1"
                  >
                    <span>ADD DESIGNATION</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <HistoryWidget />
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 4. DESIGNATION CREATE (payr_desigcreate.php) matching screenshot image_ff6a3914.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_desigcreate.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden max-w-4xl">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">ADD NEW DESIGNATION</h2>
          </div>

          <form onSubmit={handleSaveDesignation} className="p-6 space-y-4 text-xs text-gray-800">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={desigName}
                onChange={e => setDesigName(e.target.value)}
                placeholder="e.g Manager"
                className="w-full border border-gray-300 rounded-xs px-3 py-2 text-xs focus:border-[#605ca8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={desigDesc}
                onChange={e => setDesigDesc(e.target.value)}
                placeholder="Description"
                className="w-full border border-gray-300 rounded-xs p-3 text-xs focus:border-[#605ca8] focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-6 py-2 rounded-xs text-xs uppercase transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('payr_desiglist.php', 'Designation')}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-6 py-2 rounded-xs text-xs uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 5. EMPLOYEE LIST (payr_emplist.php) matching screenshot image_c9d82347.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_emplist.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
          {/* Header banner matching image_c9d82347.png "EMPLOYEE LIST" */}
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">EMPLOYEE LIST</h2>
          </div>

          <div className="p-4 space-y-3">
            {/* Table controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
              <div className="flex items-center space-x-1">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={e => setPerPage(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <span>records per page</span>
              </div>

              <div className="flex items-center space-x-1">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#605ca8]"
                />
              </div>
            </div>

            {/* Employee Table matching image_c9d82347.png */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center border-r border-gray-200">SN</th>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-gray-200">Image</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Id No</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Name</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Designation</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Department</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Work Place</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Mobile</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Email</th>
                    <th className="py-2.5 px-3 text-right border-r border-gray-200">Salary</th>
                    <th className="py-2.5 px-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp, idx) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        {/* Avatar silhouette matching screenshot */}
                        <div className="w-7 h-7 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <i className="fa fa-user text-xs"></i>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-gray-800 border-r border-gray-200">{emp.employeeId}</td>
                      <td className="py-2 px-3 font-semibold text-gray-900 border-r border-gray-200">{emp.name}</td>
                      <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{emp.designation}</td>
                      <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{emp.department}</td>
                      <td className="py-2 px-3 text-gray-600 border-r border-gray-200">{emp.branch || 'No-Branch'}</td>
                      <td className="py-2 px-3 font-mono text-gray-800 border-r border-gray-200">{emp.mobile}</td>
                      <td className="py-2 px-3 text-gray-500 border-r border-gray-200">{emp.email || ''}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-gray-900 border-r border-gray-200">
                        {emp.salary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setCurrentRoute('payr_empcreate.php', 'Add Employee')}
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Edit"
                        >
                          <i className="fa fa-pencil text-[11px]"></i>
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Delete"
                        >
                          <i className="fa fa-trash text-[11px]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
              <div className="text-xs text-gray-600">
                Showing 1 to {filteredEmployees.length} of {employees.length} entries
              </div>

              <div className="flex items-center space-x-3">
                <div className="inline-flex rounded-xs shadow-xs text-xs">
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-l-xs">Previous</button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-[#605ca8] text-white font-bold">1</button>
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-r-xs">Next</button>
                </div>

                <button
                  onClick={() => setCurrentRoute('payr_empcreate.php', 'Add Employee')}
                  className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-4 py-1.5 rounded-xs text-xs tracking-wider uppercase transition shadow-xs flex items-center space-x-1"
                >
                  <span>ADD EMPLOYEE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 6. EMPLOYEE ADD (payr_empcreate.php) matching screenshot image_76d576a9.png & image_88f2bafe.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_empcreate.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
          {/* Header banner matching image_76d576a9.png "ADD NEW EMPLOYEE" */}
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">ADD NEW EMPLOYEE</h2>
          </div>

          <form onSubmit={handleSaveEmployee} className="p-6 text-xs text-gray-800">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Form Input Grid with exact two-letter badges DP, DS, N, FN, MN, MO, PH, EM, NI, DOB, JOB, SA, ST, BR, RA, PA */}
              <div className="flex-1 space-y-3">
                {/* Row 1: Department & Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      DP
                    </span>
                    <select
                      value={empForm.department}
                      onChange={e => setEmpForm(prev => ({ ...prev, department: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      DS
                    </span>
                    <select
                      value={empForm.designation}
                      onChange={e => setEmpForm(prev => ({ ...prev, designation: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
                    >
                      <option value="">Select Designation</option>
                      {designations.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Name & Father Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      N
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sumon"
                      value={empForm.name}
                      onChange={e => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      FN
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Abul Kalam"
                      value={empForm.fatherName}
                      onChange={e => setEmpForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Mother Name & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      MN
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Begum Feroza"
                      value={empForm.motherName}
                      onChange={e => setEmpForm(prev => ({ ...prev, motherName: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      MO
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. 0161xx700xx"
                      value={empForm.mobile}
                      onChange={e => setEmpForm(prev => ({ ...prev, mobile: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 4: Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      PH
                    </span>
                    <input
                      type="text"
                      placeholder="Phone No:"
                      value={empForm.phone}
                      onChange={e => setEmpForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      EM
                    </span>
                    <input
                      type="email"
                      placeholder="e.g. info@axesgl.com"
                      value={empForm.email}
                      onChange={e => setEmpForm(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 5: NID & DOB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      NI
                    </span>
                    <input
                      type="text"
                      placeholder="NID No:"
                      value={empForm.nid}
                      onChange={e => setEmpForm(prev => ({ ...prev, nid: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      DOB
                    </span>
                    <input
                      type="date"
                      value={empForm.dob}
                      onChange={e => setEmpForm(prev => ({ ...prev, dob: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 6: Joining Date & Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      JOB
                    </span>
                    <input
                      type="date"
                      value={empForm.joiningDate}
                      onChange={e => setEmpForm(prev => ({ ...prev, joiningDate: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      SA
                    </span>
                    <input
                      type="number"
                      placeholder="Salary:"
                      value={empForm.salary}
                      onChange={e => setEmpForm(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 text-xs focus:outline-none font-bold"
                    />
                  </div>
                </div>

                {/* Row 7: Status & Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      ST
                    </span>
                    <select
                      value={empForm.status}
                      onChange={e => setEmpForm(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      BR
                    </span>
                    <select
                      value={empForm.branch}
                      onChange={e => setEmpForm(prev => ({ ...prev, branch: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
                    >
                      <option value="No-Branch">Select Branch (No-Branch)</option>
                      <option value="Main Branch">Main Branch</option>
                      <option value="Elephant Road Branch">Elephant Road Branch</option>
                      <option value="Mirpur 10 Branch">Mirpur 10 Branch</option>
                    </select>
                  </div>
                </div>

                {/* Row 8: Residential & Permanent Address Textareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      RA
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Residential Address"
                      value={empForm.address}
                      onChange={e => setEmpForm(prev => ({ ...prev, address: e.target.value }))}
                      className="flex-1 p-2 text-xs focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                    <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                      PA
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Permanent Address"
                      value={empForm.permanentAddress}
                      onChange={e => setEmpForm(prev => ({ ...prev, permanentAddress: e.target.value }))}
                      className="flex-1 p-2 text-xs focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Photo Box Section on the right matching screenshot image_88f2bafe.png */}
              <div className="w-full lg:w-56 flex flex-col items-center">
                <div className="w-44 h-48 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-2">
                    <i className="fa fa-user text-4xl"></i>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">Employee Photo</span>
                </div>

                <div className="mt-3 w-44">
                  <label className="block w-full bg-[#605ca8] hover:bg-[#504c98] text-white text-[11px] font-bold text-center py-2 rounded-xs cursor-pointer shadow-xs uppercase">
                    Choose File
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  <span className="block text-[10px] text-gray-400 text-center mt-1 uppercase font-semibold">
                    NO FILE CHOSEN
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="pt-6 border-t border-gray-200 mt-6 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-8 py-2 rounded-xs text-xs uppercase transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('payr_emplist.php', 'Employee List')}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-8 py-2 rounded-xs text-xs uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 7. LEAVE TYPE LIST (payr_levlist.php) matching screenshot image_aed135ed.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_levlist.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">LEAVE TYPE</h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
              <div className="flex items-center space-x-1">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={e => setPerPage(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <span>records per page</span>
              </div>

              <div className="flex items-center space-x-1">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#605ca8]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300">
                  <tr>
                    <th className="py-2.5 px-3 w-14 text-center border-r border-gray-200">SN</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Name</th>
                    <th className="py-2.5 px-3 w-20 text-center border-r border-gray-200">Days</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Description</th>
                    <th className="py-2.5 px-3 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeaveTypes.map((lt, idx) => (
                    <tr key={lt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900 border-r border-gray-200">{lt.name}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800 border-r border-gray-200">{lt.days}</td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-gray-200">
                        {lt.name === 'Weekly Day off' ? 'Weekly 1 monthly 4' : lt.isPaid ? 'Paid leave allowance' : 'Unpaid'}
                      </td>
                      <td className="py-2.5 px-3 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setCurrentRoute('payr_levcreate.php', 'Leave Create')}
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Edit"
                        >
                          <i className="fa fa-pencil text-[11px]"></i>
                        </button>
                        <button
                          onClick={() => deleteLeaveType(lt.id)}
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Delete"
                        >
                          <i className="fa fa-trash text-[11px]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
              <div className="text-xs text-gray-600">
                Showing 1 to {filteredLeaveTypes.length} of {leaveTypes.length} entries
              </div>

              <div className="flex items-center space-x-3">
                <div className="inline-flex rounded-xs shadow-xs text-xs">
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-l-xs">Previous</button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-[#605ca8] text-white font-bold">1</button>
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-r-xs">Next</button>
                </div>

                <button
                  onClick={() => setCurrentRoute('payr_levcreate.php', 'Leave Create')}
                  className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-4 py-1.5 rounded-xs text-xs tracking-wider uppercase transition shadow-xs flex items-center space-x-1"
                >
                  <span>ADD LEAVE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 8. LEAVE CREATE (payr_levcreate.php) matching screenshot image_b7e4cb87.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_levcreate.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden max-w-4xl">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">ADD LEAVE</h2>
          </div>

          <form onSubmit={handleSaveLeaveType} className="p-6 space-y-4 text-xs text-gray-800">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={leaveTypeName}
                onChange={e => setLeaveTypeName(e.target.value)}
                placeholder="e.g Casual Leave"
                className="w-full border border-gray-300 rounded-xs px-3 py-2 text-xs focus:border-[#605ca8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Days</label>
              <input
                type="number"
                value={leaveTypeDays}
                onChange={e => setLeaveTypeDays(parseInt(e.target.value) || 0)}
                placeholder="e.g 15"
                className="w-full border border-gray-300 rounded-xs px-3 py-2 text-xs focus:border-[#605ca8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={leaveTypeStatus}
                onChange={e => setLeaveTypeStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full border border-gray-300 rounded-xs px-3 py-2 text-xs bg-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={leaveTypeDesc}
                onChange={e => setLeaveTypeDesc(e.target.value)}
                placeholder="Description"
                className="w-full border border-gray-300 rounded-xs p-3 text-xs focus:border-[#605ca8] focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-6 py-2 rounded-xs text-xs uppercase transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('payr_levlist.php', 'Leave Type')}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-6 py-2 rounded-xs text-xs uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 9. LEAVE RECORD (payr_levaplist.php) matching screenshot image_197b6012.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_levaplist.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">LEAVE RECORD</h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-700">
              <div className="flex items-center space-x-1">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={e => setPerPage(e.target.value)}
                  className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
                <span>records per page</span>
              </div>

              <div className="flex items-center space-x-1">
                <span>Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#605ca8]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-gray-200">SN</th>
                    <th className="py-2.5 px-3 w-28 border-r border-gray-200">Date</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Employee</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Leave</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Details</th>
                    <th className="py-2.5 px-3 w-24 text-center border-r border-gray-200">Status</th>
                    <th className="py-2.5 px-3 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaveRecords.map((lr, idx) => (
                    <tr key={lr.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-gray-700 border-r border-gray-200">{lr.appliedDate || '26 Sep 2026'}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900 border-r border-gray-200">
                        {lr.employeeName || 'Abdul Ahad (Marketing Manger)'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-800 border-r border-gray-200">{lr.leaveType}</td>
                      <td className="py-2.5 px-3 text-gray-600 border-r border-gray-200">
                        From ( {lr.fromDate} ) To ( {lr.toDate} ) Total Days ( {lr.totalDays} )
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-200">
                        <span className="bg-[#5cb85c] text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                          {lr.status === 'Approved' ? 'Approve' : lr.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setCurrentRoute('payr_levapcreate.php', 'Leave Application')}
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Edit"
                        >
                          <i className="fa fa-pencil text-[11px]"></i>
                        </button>
                        <button
                          className="w-6 h-6 bg-[#605ca8] text-white rounded-xs inline-flex items-center justify-center hover:bg-[#504c98] transition shadow-xs"
                          title="Delete"
                        >
                          <i className="fa fa-trash text-[11px]"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
              <div className="text-xs text-gray-600">
                Showing 1 to {leaveRecords.length} of {leaveRecords.length} entries
              </div>

              <div className="flex items-center space-x-3">
                <div className="inline-flex rounded-xs shadow-xs text-xs">
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-l-xs">Previous</button>
                  <button className="px-3 py-1 border-t border-b border-gray-300 bg-[#605ca8] text-white font-bold">1</button>
                  <button className="px-2.5 py-1 border border-gray-300 bg-white text-gray-500 rounded-r-xs">Next</button>
                </div>

                <button
                  onClick={() => setCurrentRoute('payr_levapcreate.php', 'Leave Application')}
                  className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-4 py-1.5 rounded-xs text-xs tracking-wider uppercase transition shadow-xs flex items-center space-x-1"
                >
                  <span>ADD LEAVE REQUEST</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 10. LEAVE APPLICATION (payr_levapcreate.php) matching screenshot image_84b73090.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_levapcreate.php') {
      return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden max-w-4xl">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">ADD LEAVE REQUEST</h2>
          </div>

          <form onSubmit={handleSaveLeaveApp} className="p-6 space-y-4 text-xs text-gray-800">
            {/* Employee dropdown with EM badge */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                EM
              </span>
              <select
                value={leaveAppForm.employeeId}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, employeeId: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.employeeId}>
                    {e.name} ({e.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-24 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none text-[11px]">
                Leave Type
              </span>
              <select
                value={leaveAppForm.leaveType}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, leaveType: e.target.value }))}
                className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
              >
                {leaveTypes.map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Apply Date */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-24 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none text-[11px]">
                Apply Date
              </span>
              <input
                type="date"
                value={leaveAppForm.applyDate}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, applyDate: e.target.value }))}
                className="flex-1 px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            {/* Leave From (LVF) and Leave To (LVT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                  LVF
                </span>
                <input
                  type="date"
                  value={leaveAppForm.leaveFrom}
                  onChange={e => setLeaveAppForm(prev => ({ ...prev, leaveFrom: e.target.value }))}
                  className="flex-1 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
                <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                  LVT
                </span>
                <input
                  type="date"
                  value={leaveAppForm.leaveTo}
                  onChange={e => setLeaveAppForm(prev => ({ ...prev, leaveTo: e.target.value }))}
                  className="flex-1 px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Status (ST) */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                ST
              </span>
              <select
                value={leaveAppForm.status}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, status: e.target.value as any }))}
                className="flex-1 px-3 py-2 bg-white text-xs focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
            </div>

            {/* Reason (RE) */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                RE
              </span>
              <textarea
                rows={3}
                placeholder="Reason"
                value={leaveAppForm.reason}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, reason: e.target.value }))}
                className="flex-1 p-2 text-xs focus:outline-none"
              ></textarea>
            </div>

            {/* Note (PA) */}
            <div className="flex rounded-xs border border-gray-300 overflow-hidden focus-within:border-[#605ca8]">
              <span className="w-12 bg-gray-100 text-gray-600 font-bold flex items-center justify-center border-r border-gray-300 select-none">
                PA
              </span>
              <textarea
                rows={3}
                placeholder="Note"
                value={leaveAppForm.note}
                onChange={e => setLeaveAppForm(prev => ({ ...prev, note: e.target.value }))}
                className="flex-1 p-2 text-xs focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-6 py-2 rounded-xs text-xs uppercase transition shadow-xs"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setCurrentRoute('payr_levaplist.php', 'Leave Record')}
                className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-6 py-2 rounded-xs text-xs uppercase transition"
              >
                CLOSE
              </button>
            </div>
          </form>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 11. ATTENDANCE RECORD (payr_attreclist.php) matching screenshot image_fb635a24.png
    // -------------------------------------------------------------------------------------
    if (currentRoute === 'payr_attreclist.php') {
      return (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Main Attendance Table Panel */}
          <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden w-full">
            <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider">ATTENDANCE RECORD</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200">
                  <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300 text-[11px]">
                    <tr>
                      <th className="py-2 px-2 w-8 text-center border-r border-gray-200">#</th>
                      <th className="py-2 px-2.5 border-r border-gray-200">Name</th>
                      <th className="py-2 px-2.5 border-r border-gray-200">Designation</th>
                      <th className="py-2 px-2 text-right border-r border-gray-200">G.Salary</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">Absent</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">Late</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">Leave</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">P.Day</th>
                      <th className="py-2 px-2 text-right border-r border-gray-200">P.Amo</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">M.W.days</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">W.Hr.P.D</th>
                      <th className="py-2 px-2 text-right border-r border-gray-200">P.Hr.O.R</th>
                      <th className="py-2 px-2 text-center border-r border-gray-200">T.O.Hr</th>
                      <th className="py-2 px-2 text-right">T.O.Am</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-[11px]">
                    {attendanceRecords.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-gray-50">
                        <td className="py-2 px-2 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-200 whitespace-nowrap">{att.employeeName}</td>
                        <td className="py-2 px-2.5 text-gray-700 border-r border-gray-200 whitespace-nowrap">{att.designation}</td>
                        <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(att.grossSalary || 20000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-2 text-center border-r border-gray-200">{att.absentDays}</td>
                        <td className="py-2 px-2 text-center border-r border-gray-200">{att.lateDays}</td>
                        <td className="py-2 px-2 text-center border-r border-gray-200">{att.leaveDays}</td>
                        <td className="py-2 px-2 text-center font-bold text-gray-900 border-r border-gray-200">{att.presentDays}</td>
                        <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(att.presentAmount || 20000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-2 text-center border-r border-gray-200">{att.monthWorkingDays || 26}</td>
                        <td className="py-2 px-2 text-center border-r border-gray-200">{att.workingHourPerDay || 9}</td>
                        <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(att.perHourOvertimeRate || 85.47).toFixed(2)}</td>
                        <td className="py-2 px-2 text-center font-mono border-r border-gray-200">{att.overtimeHours}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">{(att.totalOvertimeAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Red Legend and Save/Reset buttons matching image_fb635a24.png */}
              <div className="pt-3 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="text-[11px] text-red-600 font-medium space-y-0.5">
                  <div>* M.W.days = Month Working Days</div>
                  <div>* W.Hr.P.D = Working Hour Per Day</div>
                  <div>* P.Hr.O.R = Per Hour Overtime Rate</div>
                  <div>* T.O.Hr = Total Overtime Hour</div>
                  <div>* T.O.Am = Total Overtime Amount</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert('Attendance record successfully saved!')}
                    className="bg-[#605ca8] hover:bg-[#504c98] text-white font-bold px-6 py-1.5 rounded-xs text-xs uppercase transition shadow-xs"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    className="bg-[#e6e6e6] hover:bg-[#d4d4d4] text-[#333] border border-[#ccc] font-semibold px-6 py-1.5 rounded-xs text-xs uppercase transition"
                  >
                    RESET
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right SALARY MONTH Filter Panel matching image_fb635a24.png */}
          <div className="w-full lg:w-72 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden flex-shrink-0">
            <div className="bg-[#605ca8] text-white px-4 py-2">
              <h3 className="font-bold text-xs uppercase tracking-wider">SALARY MONTH</h3>
            </div>

            <div className="p-4 space-y-3 text-xs text-gray-800">
              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Year</label>
                <select
                  value={salaryYear}
                  onChange={e => setSalaryYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Salary Month</label>
                <select
                  value={salaryMonth}
                  onChange={e => setSalaryMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="August">August</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-semibold">Branch</label>
                <select
                  value={salaryBranch}
                  onChange={e => setSalaryBranch(e.target.value)}
                  className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
                >
                  <option value="No-Branch">No-Branch</option>
                  <option value="Main Branch">Main Branch</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  className="flex-1 bg-[#dd4b39] hover:bg-[#c9302c] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
                >
                  RESET
                </button>
                <button
                  type="button"
                  className="flex-1 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------------------
    // 12. PAYSLIP GENERATE (payr_payslip.php) matching screenshot image_e138d514.png & image_b172fbbf.png
    // -------------------------------------------------------------------------------------
    return (
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Main Payslip Table */}
        <div className="flex-1 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden w-full">
          <div className="bg-[#605ca8] text-white px-4 py-2 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">PAYSLIP GENERATE</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#f9f9f9] text-gray-700 font-bold border-b border-gray-300 text-[11px]">
                  <tr>
                    <th className="py-2 px-2 w-8 text-center border-r border-gray-200">#</th>
                    <th className="py-2 px-2.5 border-r border-gray-200">Name</th>
                    <th className="py-2 px-2.5 border-r border-gray-200">Designation</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">G.Salary</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">D.Absent</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">D.Late</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">A.Leave</th>
                    <th className="py-2 px-2 text-center border-r border-gray-200">P.Day</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">P.Amo</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200 font-bold text-gray-900">Net.Pay</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">P.Hr.O.R</th>
                    <th className="py-2 px-2 text-center border-r border-gray-200">T.O.Hr</th>
                    <th className="py-2 px-2 text-right border-r border-gray-200">T.O.Am</th>
                    <th className="py-2 px-2 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  {payslips.map((ps, idx) => (
                    <tr key={ps.id} className="hover:bg-gray-50">
                      <td className="py-2 px-2 text-center text-gray-600 border-r border-gray-200">{idx + 1}</td>
                      <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-200 whitespace-nowrap">{ps.employeeName}</td>
                      <td className="py-2 px-2.5 text-gray-700 border-r border-gray-200 whitespace-nowrap">{ps.designation}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{ps.grossSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono text-rose-600 border-r border-gray-200">{(ps.deductAbsent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(ps.deductLate || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(ps.allowLeave || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-center border-r border-gray-200">{ps.presentDays || 26}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(ps.presentAmount || ps.grossSalary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700 border-r border-gray-200">{ps.netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(ps.perHourOvertimeRate || 85.47).toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-mono border-r border-gray-200">{ps.overtimeHours || 0}</td>
                      <td className="py-2 px-2 text-right font-mono border-r border-gray-200">{(ps.totalOvertimeAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPayslipToPrint(ps)}
                          className="bg-[#605ca8] hover:bg-[#504c98] text-white px-2 py-0.5 rounded-xs text-[10px] font-bold shadow-xs transition"
                          title="Print Payslip Voucher"
                        >
                          <i className="fa fa-print mr-1"></i> Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right SALARY MONTH Filter Panel */}
        <div className="w-full lg:w-72 bg-white rounded-xs shadow-xs border border-gray-300 overflow-hidden flex-shrink-0">
          <div className="bg-[#605ca8] text-white px-4 py-2">
            <h3 className="font-bold text-xs uppercase tracking-wider">SALARY MONTH</h3>
          </div>

          <div className="p-4 space-y-3 text-xs text-gray-800">
            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Year</label>
              <select
                value={salaryYear}
                onChange={e => setSalaryYear(e.target.value)}
                className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Salary Month</label>
              <select
                value={salaryMonth}
                onChange={e => setSalaryMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="August">August</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Branch</label>
              <select
                value={salaryBranch}
                onChange={e => setSalaryBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-xs px-2.5 py-1.5 bg-white focus:outline-none"
              >
                <option value="No-Branch">No-Branch</option>
                <option value="Main Branch">Main Branch</option>
              </select>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                className="flex-1 bg-[#dd4b39] hover:bg-[#c9302c] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
              >
                RESET
              </button>
              <button
                type="button"
                className="flex-1 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-bold py-1.5 rounded-xs text-xs uppercase transition shadow-xs text-center"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Payslip Print Modal */}
        {selectedPayslipToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded shadow-2xl border border-gray-300 w-full max-w-lg p-6 text-xs text-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="leading-tight">
                  <h2 className="font-extrabold text-base text-[#00284d]">TECH DRIVE</h2>
                  <p className="text-[11px] text-gray-500">Your trusted Laptop &amp; IT partner</p>
                  <p className="text-[10px] text-gray-400">Monthly Salary Payslip - {selectedPayslipToPrint.salaryMonth}</p>
                </div>
                <button
                  onClick={() => setSelectedPayslipToPrint(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border text-[11px]">
                <div>
                  <span className="text-gray-500">Employee ID:</span>{' '}
                  <strong className="font-mono text-sky-800">{selectedPayslipToPrint.employeeId}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Name:</span> <strong>{selectedPayslipToPrint.employeeName}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span> <strong>{selectedPayslipToPrint.department}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Designation:</span> <strong>{selectedPayslipToPrint.designation}</strong>
                </div>
              </div>

              <table className="w-full text-xs border border-gray-200">
                <thead className="bg-[#605ca8] text-white">
                  <tr>
                    <th className="p-2">Component</th>
                    <th className="p-2 text-right">Amount (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2">Gross Salary</td>
                    <td className="p-2 text-right">{formatBDT(selectedPayslipToPrint.grossSalary)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-rose-600">Absent / Penalty Deductions</td>
                    <td className="p-2 text-right text-rose-600">-{formatBDT(selectedPayslipToPrint.deductAbsent || 0)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-sky-700">Total Overtime Pay</td>
                    <td className="p-2 text-right font-mono">+{formatBDT(selectedPayslipToPrint.totalOvertimeAmount || 0)}</td>
                  </tr>
                  <tr className="bg-sky-50 font-extrabold text-[#00305d] text-sm">
                    <td className="p-2.5">Net Disbursed Amount</td>
                    <td className="p-2.5 text-right text-emerald-700">{formatBDT(selectedPayslipToPrint.netPayable)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center justify-between pt-4 border-t text-[11px] text-gray-500">
                <div>
                  Payment Status: <strong className="text-emerald-700">{selectedPayslipToPrint.status}</strong>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-[#605ca8] text-white px-4 py-1.5 rounded font-bold hover:bg-[#504c98]"
                  >
                    <i className="fa fa-print mr-1"></i> Print
                  </button>
                  <button
                    onClick={() => setSelectedPayslipToPrint(null)}
                    className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Title and Breadcrumbs helper
  const getBreadcrumbInfo = () => {
    switch (currentRoute) {
      case 'payr_deplist.php':
        return { title: 'Department', sub: 'Department' };
      case 'payr_deplcre.php':
        return { title: 'Department Create', sub: 'Department Create' };
      case 'payr_desiglist.php':
        return { title: 'Designation', sub: 'Designation' };
      case 'payr_desigcreate.php':
        return { title: 'Designation Create', sub: 'Designation Create' };
      case 'payr_emplist.php':
        return { title: 'Employee List', sub: 'Employee List' };
      case 'payr_empcreate.php':
        return { title: 'Employee Add', sub: 'Employee Add' };
      case 'payr_levlist.php':
        return { title: 'Leave Type', sub: 'Leave Type' };
      case 'payr_levcreate.php':
        return { title: 'Leave Create', sub: 'Leave Create' };
      case 'payr_levaplist.php':
        return { title: 'Leave Record', sub: 'Leave Record' };
      case 'payr_levapcreate.php':
        return { title: 'Leave Application', sub: 'Leave Application' };
      case 'payr_attreclist.php':
        return { title: 'Attendance Record', sub: 'Attendance Record' };
      case 'payr_payslip.php':
        return { title: 'Payslip Generate', sub: 'Payslip Generate' };
      default:
        return { title: 'Payroll', sub: 'Payroll' };
    }
  };

  const breadcrumb = getBreadcrumbInfo();

  return (
    <div className="space-y-4">
      {/* Top Header / Breadcrumbs matching live BGD ERP layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-300 gap-2 select-none">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">
            {breadcrumb.title}
          </h1>
        </div>

        {/* Breadcrumb line matching Dashboard > Payroll > ... */}
        <div className="text-xs text-gray-500 flex items-center space-x-1.5">
          <span
            onClick={() => setCurrentRoute('home.php', 'Dashboard')}
            className="cursor-pointer hover:text-[#0084bf] flex items-center space-x-1"
          >
            <i className="fa fa-dashboard"></i>
            <span>Dashboard</span>
          </span>
          <span>&gt;</span>
          <span className="text-gray-600 font-medium">Payroll</span>
          <span>&gt;</span>
          <span className="text-gray-800 font-bold">{breadcrumb.sub}</span>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
