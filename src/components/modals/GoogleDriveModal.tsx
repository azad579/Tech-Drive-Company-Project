import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FolderPlus,
  Search,
  Lock,
  Cloud,
  Database,
  ArrowRight,
  LogOut,
  Folder,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from '../../services/googleDriveAuth';
import {
  listDriveFiles,
  uploadFileToDrive,
  deleteDriveFile,
  getOrCreateFolder,
  getDriveAbout,
  downloadDriveFileContent,
  DriveFileItem,
  DriveStorageInfo,
} from '../../services/googleDriveApi';
import { playClickSound } from '../../utils/sound';
import { Product, Customer } from '../../types/pos';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  cashierName: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  cashierName,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [storageInfo, setStorageInfo] = useState<DriveStorageInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Destructive Action Confirmation State
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When access token is available, load Drive files and storage info
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveData();
    }
  }, [isOpen, accessToken]);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadDriveData = async () => {
    if (!accessToken) return;
    setLoadingFiles(true);
    try {
      const [files, about] = await Promise.all([
        listDriveFiles(accessToken, { searchTerm: searchTerm.trim() || undefined, pageSize: 30 }),
        getDriveAbout(accessToken).catch(() => null),
      ]);
      setDriveFiles(files);
      if (about) setStorageInfo(about);
    } catch (err: any) {
      console.error('Error fetching Google Drive data:', err);
      showNotify('error', err.message || 'Failed to load Google Drive files.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleGoogleLogin = async () => {
    playClickSound();
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        showNotify('success', `Signed in as ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      showNotify('error', err.message || 'Google Sign-In failed or popup was closed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    playClickSound();
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setDriveFiles([]);
      setStorageInfo(null);
      showNotify('success', 'Logged out of Google Drive.');
    } catch (err: any) {
      showNotify('error', 'Logout failed: ' + err.message);
    }
  };

  // 1-Click Complete System Backup to Google Drive
  const handleBackupNow = async () => {
    if (!accessToken) return;
    playClickSound();
    setIsBackingUp(true);
    try {
      // 1. Get or create dedicated folder
      const folderId = await getOrCreateFolder(accessToken, 'POS & ERP Cloud Backups');

      // 2. Prepare comprehensive backup payload
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPayload = {
        app: 'POS & ERP System',
        backupVersion: '2.4.0',
        createdAt: new Date().toISOString(),
        cashier: cashierName,
        data: {
          productsCount: products.length,
          customersCount: customers.length,
          products,
          customers,
          invoices: JSON.parse(localStorage.getItem('erp_sales_invoices') || '[]'),
          vouchers: JSON.parse(localStorage.getItem('erp_finance_transactions') || '[]'),
        },
      };

      const fileName = `POS_Backup_${timestamp}.json`;
      const uploaded = await uploadFileToDrive(accessToken, {
        name: fileName,
        mimeType: 'application/json',
        content: JSON.stringify(backupPayload, null, 2),
        folderId,
      });

      showNotify('success', `Successfully backed up database to Google Drive (${uploaded.name})`);
      loadDriveData();
    } catch (err: any) {
      console.error('Backup error:', err);
      showNotify('error', 'Backup failed: ' + err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Export inventory CSV to Drive
  const handleExportInventoryCsv = async () => {
    if (!accessToken) return;
    playClickSound();
    setIsBackingUp(true);
    try {
      const folderId = await getOrCreateFolder(accessToken, 'POS & ERP Cloud Backups');
      const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Barcode'];
      const rows = products.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        p.category,
        p.price,
        p.stock,
        p.barcode,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const fileName = `Inventory_Stock_${new Date().toISOString().slice(0, 10)}.csv`;

      await uploadFileToDrive(accessToken, {
        name: fileName,
        mimeType: 'text/csv',
        content: csvContent,
        folderId,
      });

      showNotify('success', `Inventory CSV uploaded to Google Drive (${fileName})`);
      loadDriveData();
    } catch (err: any) {
      showNotify('error', 'CSV Export failed: ' + err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Custom File Upload
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsBackingUp(true);
        const folderId = await getOrCreateFolder(accessToken, 'POS & ERP Cloud Backups');
        await uploadFileToDrive(accessToken, {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          content: file,
          folderId,
        });
        showNotify('success', `Uploaded "${file.name}" to Google Drive`);
        loadDriveData();
      } catch (err: any) {
        showNotify('error', 'File upload failed: ' + err.message);
      } finally {
        setIsBackingUp(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download File
  const handleDownload = async (file: DriveFileItem) => {
    if (!accessToken) return;
    playClickSound();
    try {
      const text = await downloadDriveFileContent(accessToken, file.id);
      const blob = new Blob([text], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showNotify('error', 'Download failed: ' + err.message);
    }
  };

  // Execute Destructive Delete after user confirmation
  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    playClickSound();
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showNotify('success', `File "${fileToDelete.name}" deleted from Google Drive.`);
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      showNotify('error', 'Delete failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Google Drive Cloud Sync & Backups
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Securely store invoices, product catalogs, and transaction records on Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications Bar */}
        {notification && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!currentUser ? (
            /* Unauthenticated View: Sign in with Google */
            <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                <Cloud className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Connect Google Drive with permission to safely sync and back up daily POS sales invoices, customer ledgers, and inventory snapshots.
                </p>
              </div>

              {/* Official Google Sign-In Button (gsi-material-button style) */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-100 font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-left">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <Database className="w-4 h-4 text-blue-500 mb-1.5" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">1-Click Backups</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Archive all transactions to Drive anytime.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 mb-1.5" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Excel / CSV Sync</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Export product and sales tables directly.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <Lock className="w-4 h-4 text-purple-500 mb-1.5" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Secure & Private</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Stored inside your personal Google Account.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Authenticated View */
            <div className="space-y-5">
              {/* Connected Account & Drive Storage Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {currentUser.displayName || 'Google Drive User'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-2.5 h-2.5" /> Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDriveData}
                    disabled={loadingFiles}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Refresh file list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Cloud Actions Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleBackupNow}
                  disabled={isBackingUp}
                  className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Database className="w-5 h-5 text-blue-200 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Backup Full System</p>
                      <p className="text-[11px] text-blue-100 font-normal">
                        Sales, Stock & Ledgers
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </button>

                <button
                  type="button"
                  onClick={handleExportInventoryCsv}
                  disabled={isBackingUp}
                  className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-200 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Export Stock CSV</p>
                      <p className="text-[11px] text-emerald-100 font-normal">
                        {products.length} catalog items
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                </button>

                <label className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5 text-left">
                    <Upload className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Upload File</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        Upload invoice / sheet
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleCustomFileUpload}
                    className="hidden"
                  />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </label>
              </div>

              {/* Files in Google Drive Header & Search */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <div className="p-3.5 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Files & Backups on Google Drive
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({driveFiles.length} file{driveFiles.length !== 1 ? 's' : ''})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadDriveData()}
                        placeholder="Search files in Drive..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={loadDriveData}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Filter
                    </button>
                  </div>
                </div>

                {/* Table of Drive files */}
                <div className="overflow-x-auto max-h-80">
                  {loadingFiles ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                      <p className="text-xs">Fetching Google Drive files...</p>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <HardDrive className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        No files found in Google Drive
                      </p>
                      <p className="text-[11px]">
                        Click "Backup Full System" or "Export Stock CSV" above to save your first snapshot.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">File Name</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Modified</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {driveFiles.map((file) => {
                          const isJson = file.mimeType.includes('json') || file.name.endsWith('.json');
                          const isCsv = file.mimeType.includes('csv') || file.name.endsWith('.csv');
                          const isFolder = file.mimeType.includes('folder');
                          const sizeKb = file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : '—';

                          return (
                            <tr
                              key={file.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 min-w-[200px]">
                                {isFolder ? (
                                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                                ) : isJson ? (
                                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                ) : isCsv ? (
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="truncate max-w-xs" title={file.name}>
                                  {file.name}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                                {isFolder ? 'Folder' : isJson ? 'JSON Backup' : isCsv ? 'CSV Sheet' : file.mimeType.split('/').pop()}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] tabular-nums">
                                {sizeKb}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px] tabular-nums">
                                {new Date(file.modifiedTime).toLocaleDateString()}{' '}
                                <span className="text-slate-400 text-[10px]">
                                  {new Date(file.modifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {file.webViewLink && (
                                    <a
                                      href={file.webViewLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                                      title="Open in Google Drive"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {!isFolder && (
                                    <button
                                      type="button"
                                      onClick={() => handleDownload(file)}
                                      className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                      title="Download file"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setFileToDelete(file)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                    title="Delete from Google Drive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Encrypted cloud connection via Google OAuth 2.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* MANDATORY Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Delete File from Google Drive?
                </h3>
                <p className="text-xs text-slate-500">This action will remove the file from your Drive.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {fileToDelete.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {fileToDelete.id}
              </p>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
