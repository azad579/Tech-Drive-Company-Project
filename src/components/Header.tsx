import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getFormattedHeaderDate } from '../utils/banglaDate';

export const Header: React.FC = () => {
  const {
    user,
    logout,
    sidebarCollapsed,
    setSidebarCollapsed,
    calculatorInput,
    setCalculatorInput,
    calculatorResult,
    evaluateCalculator,
    cheques,
    setCurrentRoute,
    setIsQuickSearchOpen,
    setIsProfileModalOpen
  } = useApp();

  const [dateString, setDateString] = useState<string>(getFormattedHeaderDate());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateString(getFormattedHeaderDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) return 'Midnight';
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const pendingCheques = cheques.filter(c => c.status === 'Pending');

  return (
    <header className="sticky top-0 z-40 flex items-stretch h-14 bg-[#00284d] text-white shadow-md border-b border-[#00386c] select-none no-print">
      {/* Brand Logo & Title */}
      <div
        className={`flex items-center px-3 bg-[#00284d] transition-all duration-300 ${
          sidebarCollapsed ? 'w-16 justify-center' : 'w-64 justify-start space-x-2'
        }`}
      >
        <button
          onClick={() => setCurrentRoute('home.php', 'Dashboard')}
          className="flex items-center space-x-2 text-left focus:outline-none"
        >
          <img
            src="/img/techdrive.png"
            alt="Tech Drive"
            className="h-10 object-contain max-w-[120px]"
            onError={e => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          {!sidebarCollapsed && (
            <div className="hidden sm:block leading-tight">
              <span className="font-extrabold text-sm tracking-wide text-[#f39c12]">TECH DRIVE</span>
              <p className="text-[10px] text-sky-200 truncate max-w-[110px]">Your IT Partner</p>
            </div>
          )}
        </button>
      </div>

      {/* Main Top Nav Bar */}
      <div className="flex-1 flex items-center justify-between px-3">
        {/* Left: Sidebar Toggle & Subtitle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="p-1.5 rounded hover:bg-white/10 text-white transition focus:outline-none"
            title="Toggle Sidebar"
          >
            <i className="fa fa-bars text-lg"></i>
          </button>

          <div className="hidden lg:block leading-tight">
            <span className="font-bold text-xs text-[#f39c12] tracking-wider">TECH DRIVE</span>
            <span className="text-[11px] text-blue-200 block">Your trusted Laptop &amp; it partner</span>
          </div>

          {/* Quick Search Shortcut */}
          <button
            onClick={() => setIsQuickSearchOpen(true)}
            className="hidden md:flex items-center space-x-2 bg-[#053d71]/80 hover:bg-[#053d71] px-2.5 py-1 rounded text-xs text-sky-200 border border-sky-600/30 transition"
          >
            <i className="fa fa-search text-sky-400"></i>
            <span>Search Invoice, Code, Customer...</span>
            <kbd className="bg-black/30 text-[10px] px-1 rounded border border-white/20">Ctrl+K</kbd>
          </button>
        </div>

        {/* Right Controls: Calculator, Bangla Date, Notifications, User */}
        <div className="flex items-center space-x-3">
          {/* Working Calculator in Navbar */}
          <div className="hidden md:flex items-center space-x-1 bg-[#053d71]/80 p-0.5 rounded border border-sky-700/40">
            <div className="relative">
              <input
                type="text"
                value={calculatorInput}
                onChange={e => {
                  setCalculatorInput(e.target.value);
                  evaluateCalculator(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') evaluateCalculator();
                }}
                placeholder="Calculator (e.g. 2500*3)"
                className="w-36 px-2 py-0.5 text-xs bg-transparent text-white placeholder-sky-300/60 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={calculatorResult ? `= ${calculatorResult}` : ''}
              readOnly
              placeholder="= 0"
              className="w-20 px-1 py-0.5 text-xs font-semibold bg-[#001f3f] text-emerald-400 rounded text-right focus:outline-none"
            />
          </div>

          {/* Date & Bangla Date */}
          <div className="hidden xl:flex flex-col text-right leading-tight text-[11px] text-sky-100 pr-1">
            <div className="font-medium text-[#ffd166]">
              {getGreeting()}, <span className="font-bold text-white">{user.name}</span>
            </div>
            <div className="text-[10px] text-sky-200 opacity-90">{dateString}</div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotiOpen(prev => !prev);
                setIsUserMenuOpen(false);
              }}
              className="relative p-1.5 rounded hover:bg-white/10 text-white focus:outline-none"
              title="Notifications"
            >
              <i className="fa fa-bell text-base shake_bell text-amber-300"></i>
              {pendingCheques.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-bold text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                  {pendingCheques.length}
                </span>
              )}
            </button>

            {isNotiOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50 text-xs py-2">
                <div className="px-3 py-1.5 font-bold border-b border-gray-100 flex items-center justify-between bg-sky-50 text-[#00305d]">
                  <span>Pending Cheques &amp; Alerts ({pendingCheques.length})</span>
                  <button
                    onClick={() => {
                      setCurrentRoute('ban_checkman.php', 'Cheque Management');
                      setIsNotiOpen(false);
                    }}
                    className="text-[11px] text-[#0084bf] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {pendingCheques.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">No pending notifications</div>
                  ) : (
                    pendingCheques.map(chk => (
                      <div
                        key={chk.id}
                        className="p-2.5 hover:bg-gray-50 flex items-start justify-between cursor-pointer"
                        onClick={() => {
                          setCurrentRoute('ban_checkman.php', 'Cheque Management');
                          setIsNotiOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-semibold text-gray-800">
                            Cheque <span className="text-emerald-700 bg-emerald-100 px-1 rounded">{chk.chequeNo}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 truncate max-w-[180px]">{chk.partyName}</div>
                          <div className="text-[10px] text-gray-400">Date: {chk.date}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          chk.type === 'Receive' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {chk.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(prev => !prev);
                setIsNotiOpen(false);
              }}
              className="flex items-center space-x-2 p-1 rounded hover:bg-white/10 text-white focus:outline-none"
            >
              <img
                src="/img/techdrive_fav.png"
                alt="Saymon"
                className="w-7 h-7 rounded-full border border-sky-400 object-cover bg-white"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Saymon&background=0084bf&color=fff';
                }}
              />
              <span className="hidden sm:inline font-medium text-xs">{user.name}</span>
              <i className="fa fa-caret-down text-xs text-sky-300"></i>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded shadow-2xl border border-gray-200 z-50 text-xs overflow-hidden">
                <div className="bg-[#00305d] text-white p-3 text-center">
                  <div className="w-12 h-12 rounded-full mx-auto bg-white p-1 mb-1 border-2 border-[#0093d0]">
                    <img
                      src="/img/techdrive_fav.png"
                      alt="Saymon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-bold text-sm text-[#ffd166]">{user.name}</div>
                  <div className="text-[11px] text-sky-200">{user.email}</div>
                  <div className="text-[10px] text-sky-300 mt-1 bg-black/20 px-2 py-0.5 rounded-full inline-block">
                    {user.role} - {user.branch}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                  >
                    <i className="fa fa-user-circle text-sky-600"></i>
                    <span>Profile Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center space-x-2 text-gray-700"
                  >
                    <i className="fa fa-key text-amber-600"></i>
                    <span>Change Password</span>
                  </button>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 font-semibold flex items-center space-x-2"
                    >
                      <i className="fa fa-sign-out"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
