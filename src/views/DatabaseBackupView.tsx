import React, { useState, useEffect } from 'react';
import { generateTechDriveMySQLDump } from '../utils/sqlBackupGenerator';

export const DatabaseBackupView: React.FC = () => {
  const [downloadNotification, setDownloadNotification] = useState<{
    filename: string;
    size: string;
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const triggerDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dump = generateTechDriveMySQLDump();
      const blob = new Blob([dump.sql], { type: 'application/x-sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dump.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadNotification({
        filename: dump.filename,
        size: '876 KB'
      });
      setIsGenerating(false);
    }, 600);
  };

  // Auto trigger download on initial visit to mimic live ERP behavior if desired
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!downloadNotification) {
        // Show notification badge of latest download matching live ERP screenshot
        setDownloadNotification({
          filename: 'ebgderp_techdrive_backup_1792838651.sql',
          size: '876 KB'
        });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setRestoreStatus('Verifying SQL schemas and data tables...');
    setTimeout(() => {
      setRestoreStatus('Restoring tables: tbl_products, tbl_purchase, tbl_sales, tbl_expense_heads...');
      setTimeout(() => {
        setRestoreStatus('Database successfully restored to current session!');
        setTimeout(() => setRestoreStatus(''), 4000);
      }, 1200);
    }, 800);
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Browser Download Popover matching image_bc70bd11.png */}
      {downloadNotification && (
        <div className="fixed top-3 right-4 z-50 bg-[#2d3238] text-white rounded-md shadow-2xl p-3 border border-gray-700 flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded bg-[#1e2227] flex items-center justify-center text-rose-400">
            <i className="fa fa-database text-sm"></i>
          </div>
          <div>
            <div className="font-semibold text-gray-100 flex items-center space-x-1">
              <span>{downloadNotification.filename}</span>
            </div>
            <div className="text-[11px] text-gray-400">
              {downloadNotification.size} &bull; <span className="text-emerald-400 font-medium">Done</span>
            </div>
          </div>
          <button
            onClick={() => setDownloadNotification(null)}
            className="text-gray-400 hover:text-white ml-2 text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">Database Backup</h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Daily Process</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Database Backup</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Backup Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>DATABASE BACKUP</span>
              <span className="text-xs font-normal bg-sky-800/60 px-2 py-0.5 rounded">
                Live Host: localhost
              </span>
            </div>

            <div className="p-5 space-y-6">
              {/* Server DB Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded border border-gray-200 text-xs">
                <div>
                  <div className="text-gray-500 font-medium">Database Name</div>
                  <div className="font-bold text-[#00305d] mt-0.5">ebgderp_techdrive</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">DB Engine</div>
                  <div className="font-bold text-gray-800 mt-0.5">MySQL 8.0 (InnoDB)</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">Total Tables</div>
                  <div className="font-bold text-[#0084bf] mt-0.5">42 Tables</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">Estimated Dump Size</div>
                  <div className="font-bold text-emerald-600 mt-0.5">~876 KB</div>
                </div>
              </div>

              {/* Instant Backup Download Button */}
              <div className="border border-sky-100 bg-sky-50/60 p-4 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5">
                    <i className="fa fa-cloud-download text-[#0084bf]"></i>
                    <span>Generate Immediate SQL Dump</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Exports complete schema (DDL) and rows (DML) for all inventory, invoices, ledgers, accounts, and payroll records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerDownload}
                  disabled={isGenerating}
                  className="px-4 py-2.5 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs flex items-center justify-center space-x-2 transition shrink-0"
                >
                  <i className={`fa ${isGenerating ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                  <span>{isGenerating ? 'GENERATING DUMP...' : 'DOWNLOAD DATABASE BACKUP'}</span>
                </button>
              </div>

              {/* Restore Section */}
              <div className="border-t border-gray-200 pt-5 text-xs">
                <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-1.5 mb-2">
                  <i className="fa fa-upload text-gray-600"></i>
                  <span>Restore Database from SQL File</span>
                </h3>
                <p className="text-gray-500 mb-3">
                  Select a valid <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">.sql</code> or <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">.json</code> dump generated by BGD ERP to restore records.
                </p>

                <form onSubmit={handleRestore} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept=".sql,.json"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[#0084bf] hover:file:bg-sky-100 cursor-pointer w-full sm:w-auto"
                  />
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className="px-4 py-1.5 bg-[#0084bf] hover:bg-[#006fa3] disabled:bg-gray-300 text-white font-bold rounded shadow-xs text-xs whitespace-nowrap transition"
                  >
                    RESTORE NOW
                  </button>
                </form>

                {restoreStatus && (
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium">
                    <i className="fa fa-info-circle mr-1"></i>
                    {restoreStatus}
                  </div>
                )}
              </div>

              {/* Recent Backups Table */}
              <div className="border-t border-gray-200 pt-5 text-xs">
                <h4 className="font-bold text-gray-700 mb-2.5">Available Backup Archives on Server</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Archive File Name</th>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Created At</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium text-gray-800">
                          ebgderp_techdrive_backup_1792838651.sql
                        </td>
                        <td className="py-2 px-3">876 KB</td>
                        <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">Daily Cron</span></td>
                        <td className="py-2 px-3">24 Oct 2026 03:15 AM</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={triggerDownload}
                            className="text-[#0084bf] hover:underline font-semibold"
                          >
                            <i className="fa fa-download mr-1"></i>Download
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium text-gray-800">
                          ebgderp_techdrive_backup_1792752251.sql
                        </td>
                        <td className="py-2 px-3">872 KB</td>
                        <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">Daily Cron</span></td>
                        <td className="py-2 px-3">23 Oct 2026 03:15 AM</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={triggerDownload}
                            className="text-[#0084bf] hover:underline font-semibold"
                          >
                            <i className="fa fa-download mr-1"></i>Download
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-medium text-gray-800">
                          ebgderp_techdrive_backup_1792665851.sql
                        </td>
                        <td className="py-2 px-3">868 KB</td>
                        <td className="py-2 px-3"><span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-medium">Manual</span></td>
                        <td className="py-2 px-3">22 Oct 2026 08:45 PM</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={triggerDownload}
                            className="text-[#0084bf] hover:underline font-semibold"
                          >
                            <i className="fa fa-download mr-1"></i>Download
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right History Column */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs tracking-wider flex items-center justify-between">
              <span>HISTORY</span>
              <button className="text-white hover:text-gray-200">
                <i className="fa fa-bars"></i>
              </button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  24 Oct 2026
                </span>
                <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span className="font-bold text-gray-700 underline">Tech Drive</span>
                      <span><i className="fa fa-clock-o mr-1"></i>04:12:00 AM</span>
                    </div>
                    <div className="text-sky-600 font-semibold mt-1">
                      Full Database Backup generated
                    </div>
                    <div className="text-gray-500 text-[11px] font-mono mt-0.5">
                      ebgderp_techdrive_backup_1792838651.sql (876 KB)
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  23 Oct 2026
                </span>
                <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span className="font-bold text-gray-700 underline">Noon, Saymon</span>
                      <span><i className="fa fa-clock-o mr-1"></i>03:15:22 AM</span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      Automated Cron Backup saved to disk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
