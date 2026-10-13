import React, { useState, useEffect } from 'react';
import {
  PanelLeft,
  Search,
  Moon,
  Sun,
  Bell,
  MessageSquare,
  Grid,
  Zap,
  ChevronDown,
  Volume2,
  VolumeX,
  Lock,
  HardDrive,
} from 'lucide-react';
import { CashDrawerState } from '../types/pos';
import { formatDateTime } from '../utils/format';
import { toggleMuteSound, getMuteState } from '../utils/sound';
import { ERPModule } from './navigation/ErpSidebar';

interface TopNavProps {
  onSearchGlobal: (query: string) => void;
  globalSearchQuery: string;
  drawerState: CashDrawerState;
  onOpenDrawerModal: () => void;
  onOpenQuickActions: () => void;
  onOpenNotifications: () => void;
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  cashierName: string;
  onOpenShortcuts: () => void;
  activeModule: ERPModule;
  onSelectModule: (module: ERPModule) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  pendingPOCount?: number;
  onOpenGoogleDrive?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSearchGlobal,
  globalSearchQuery,
  drawerState,
  onOpenDrawerModal,
  onOpenQuickActions,
  onOpenNotifications,
  heldOrdersCount,
  onOpenHeldOrders,
  isDarkMode,
  onToggleDarkMode,
  cashierName,
  onOpenShortcuts,
  activeModule,
  onSelectModule,
  isSidebarOpen,
  onToggleSidebar,
  pendingPOCount = 0,
  onOpenGoogleDrive,
}) => {
  const [currentTime, setCurrentTime] = useState<string>(formatDateTime(new Date()));
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMuteToggle = () => {
    const state = toggleMuteSound();
    setIsMuted(state);
  };

  return (
    <header className="h-14 bg-slate-900 text-slate-100 flex items-center justify-between px-3 md:px-4 border-b border-slate-800 shrink-0 select-none">
      {/* Left: Sidebar Toggle & ERP Module Shortcut Switcher */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Close ERP Menu' : 'Open ERP Menu'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            isSidebarOpen
              ? 'text-blue-400 bg-slate-800 ring-1 ring-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PanelLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">ERP Menu</span>
        </button>

        {/* Active Module Indicator & Breadcrumb */}
        <div
          onClick={onToggleSidebar}
          title="Click to open ERP menu"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-semibold cursor-pointer hover:bg-slate-800/80 hover:text-white transition-all shadow-2xs"
        >
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
            {['sales', 'purchase', 'inventory'].includes(activeModule)
              ? 'Core Operations'
              : ['clients', 'payroll', 'accounts', 'finance'].includes(activeModule)
              ? 'Management'
              : ['reports', 'master_setup', 'users', 'company_settings'].includes(activeModule)
              ? 'Reporting & Admin'
              : 'Specialized Tools'}
          </span>
          <span className="text-slate-600">›</span>
          <span className="text-slate-100 font-bold">
            {activeModule === 'sales'
              ? '1. Sales — বিক্রয়'
              : activeModule === 'purchase'
              ? '2. Purchase — ক্রয়'
              : activeModule === 'inventory' || activeModule === 'product_setup'
              ? '3. Inventory — মজুদ স্টক ও পণ্য'
              : activeModule === 'clients'
              ? '4. Client Setup — গ্রাহক ও সাপ্লায়ার'
              : activeModule === 'payroll'
              ? '5. Staff Payroll & Slips — কর্মচারীদের বেতন'
              : activeModule === 'accounts' || activeModule === 'finance'
              ? '6. Accounts & Finance — হিসাব ও অর্থ লেনদেন'
              : activeModule === 'reports'
              ? '7. Report — প্রতিবেদন'
              : activeModule === 'master_setup' || activeModule === 'company_settings'
              ? '8. Master Setup — মাস্টার সেটিংস'
              : activeModule === 'users'
              ? '9. User & Role — ব্যবহারকারী ও অনুমতি'
              : activeModule === 'service'
              ? '🔧 Service Management'
              : '🛡️ Warranty Policy'}
          </span>
          {activeModule === 'sales' && heldOrdersCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
              {heldOrdersCount} Held
            </span>
          )}
          {activeModule === 'purchase' && pendingPOCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
              {pendingPOCount} Pending
            </span>
          )}
        </div>

        {/* Quick Module Switcher Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onSelectModule('sales')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'sales'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span>🛒 Sales</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectModule('purchase')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'purchase'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span>📦 Purchase</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectModule('reports')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'reports'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-1 ring-emerald-400'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-850'
            }`}
          >
            <span>📊 7. Reports</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => onSelectModule('finance')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeModule === 'finance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span>💳 Finance</span>
          </button>
        </div>
      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden lg:flex items-center w-80 xl:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => onSearchGlobal(e.target.value)}
          placeholder="Search pages, products, orders..."
          className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg pl-9 pr-14 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 text-slate-400 rounded px-1.5 py-0.5 text-[10px] font-mono pointer-events-none">
          Ctrl K
        </kbd>
      </div>

      {/* Right: Drawer Status, Clock, Controls & Profile */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Cash Drawer Pill */}
        <button
          onClick={onOpenDrawerModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            drawerState.isOpen
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
          }`}
          title="Click to manage cash drawer"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              drawerState.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="hidden sm:inline">
            {drawerState.isOpen ? `Drawer Open Since ${drawerState.openedAt}` : 'Drawer Closed'}
          </span>
          <span className="sm:hidden">{drawerState.isOpen ? 'Open' : 'Closed'}</span>
        </button>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center text-xs font-mono font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 tabular-nums">
          {currentTime}
        </div>

        {/* Mute/Unmute Beep Sound */}
        <button
          onClick={handleMuteToggle}
          title={isMuted ? 'Unmute scanner & POS beeps' : 'Mute sound effects'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title="Toggle light / dark mode"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifications & low stock alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-bold px-1 rounded-full border border-slate-900">
            9+
          </span>
        </button>

        {/* Messages */}
        <button
          onClick={onOpenNotifications}
          className="hidden sm:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Store chat & handover notes"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Apps Grid */}
        <button
          onClick={onOpenQuickActions}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="App modules"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Lightning Quick Actions */}
        <button
          onClick={onOpenQuickActions}
          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Quick actions & POS tools"
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Google Drive Cloud Sync */}
        <button
          onClick={onOpenGoogleDrive}
          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Google Drive Cloud Sync & Backups"
        >
          <HardDrive className="w-4 h-4" />
          <span className="hidden xl:inline text-xs font-semibold text-slate-300 hover:text-white">Google Drive</span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800" />

        {/* Cashier Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white">
              {cashierName.charAt(0)}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-200">{cashierName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <p className="font-semibold text-white">{cashierName}</p>
                <p className="text-[11px] text-slate-400">Terminal #02 • Counter Cashier</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Shift Active (08:13 AM)</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenGoogleDrive?.();
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Google Drive Cloud Sync
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenDrawerModal();
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Close Current Shift
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenShortcuts();
                }}
                className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Keyboard Shortcuts (F1)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
