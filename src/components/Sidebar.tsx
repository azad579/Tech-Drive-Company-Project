import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ERP_MENU_TREE } from '../data/fullMenuData';

export const Sidebar: React.FC = () => {
  const { currentRoute, setCurrentRoute, sidebarCollapsed } = useApp();
  
  // Track open accordion menus
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    'Daily Process': false,
    'Purchase': false,
    'Sales': true,
    'Service': false,
    'Warranty Management': false,
    'Inventory': false,
    'Client Setup': false,
    'Product Setup': false,
    'Master Setup': false,
    'Accounts Setup': false,
    'Installment & Loan Setup': false,
    'Finance Record': false,
    'Payroll': false,
    'Bank': false,
    'Personal': false,
    'User & Role': false,
    'Report': false
  });

  const [menuFilter, setMenuFilter] = useState('');

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <aside
      className={`relative flex min-h-[calc(100vh-3.5rem)] select-none transition-all duration-300 no-print ${
        sidebarCollapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Authentic axesba ribbon on the left border */}
      <section className="axesba hidden sm:block">
        <div className="axesba-contain">
          <p className="axesba-title">Tech Drive ERP</p>
        </div>
      </section>

      {/* Main navigation list */}
      <div className="flex-1 bg-[#00305d] text-[#b8c7ce] text-xs overflow-y-auto flex flex-col justify-between">
        <div className="py-1">
          {/* Menu live filter when expanded */}
          {!sidebarCollapsed && (
            <div className="px-2.5 py-1.5 border-b border-[#053d71]">
              <div className="relative">
                <input
                  type="text"
                  value={menuFilter}
                  onChange={e => setMenuFilter(e.target.value)}
                  placeholder="Filter menus..."
                  className="w-full pl-6 pr-2 py-1 text-[11px] bg-[#002244] text-white placeholder-sky-300/50 rounded border border-sky-800/60 focus:outline-none"
                />
                <i className="fa fa-filter absolute left-2 top-2 text-[10px] text-sky-400"></i>
                {menuFilter && (
                  <button
                    onClick={() => setMenuFilter('')}
                    className="absolute right-2 top-1.5 text-gray-400 hover:text-white text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}

          {ERP_MENU_TREE.map((item, idx) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.title] || (menuFilter !== '' && item.subItems.some(s => s.title.toLowerCase().includes(menuFilter.toLowerCase())));
            const isDirectActive = currentRoute === item.href;

            // If filtering, check if parent or any sub matches
            if (menuFilter) {
              const matchesTitle = item.title.toLowerCase().includes(menuFilter.toLowerCase());
              const matchesSub = item.subItems.some(s => s.title.toLowerCase().includes(menuFilter.toLowerCase()));
              if (!matchesTitle && !matchesSub) return null;
            }

            return (
              <div key={idx} className="relative border-b border-[#053d71]/40">
                {hasSub ? (
                  <div>
                    <button
                      onClick={() => {
                        toggleMenu(item.title);
                        if (item.href && item.href !== '#') {
                          setCurrentRoute(item.href, item.title);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 transition text-left hover:bg-[#002447] hover:text-white ${
                        isOpen ? 'text-white bg-[#00284d]' : 'text-sky-100'
                      }`}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center space-x-2.5">
                        <i className={`fa ${item.icon} w-4 text-center text-sky-400`}></i>
                        {!sidebarCollapsed && (
                          <span className="font-medium text-[11.5px] truncate">
                            {item.title}
                          </span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] bg-black/30 text-sky-300 px-1 rounded">
                            {item.subItems.length}
                          </span>
                          <i
                            className={`fa fa-angle-left transition-transform duration-200 text-sky-300 text-xs ${
                              isOpen ? '-rotate-90' : ''
                            }`}
                          ></i>
                        </div>
                      )}
                    </button>

                    {/* Submenu List */}
                    {isOpen && !sidebarCollapsed && (
                      <div className="bg-[#00203f] py-1 pl-3 pr-1 space-y-0.5 border-l-2 border-[#0093d0] ml-2">
                        {item.subItems.map((sub, sIdx) => {
                          const isSubActive = currentRoute === sub.href;
                          if (menuFilter && !sub.title.toLowerCase().includes(menuFilter.toLowerCase()) && !item.title.toLowerCase().includes(menuFilter.toLowerCase())) {
                            return null;
                          }

                          return (
                            <button
                              key={sIdx}
                              onClick={() => setCurrentRoute(sub.href, sub.title)}
                              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left transition ${
                                isSubActive
                                  ? 'text-white font-bold bg-[#0084bf]'
                                  : 'text-sky-200 hover:text-white hover:bg-sky-900/40'
                              }`}
                            >
                              <i className="fa fa-caret-right text-[10px] text-sky-400"></i>
                              <span className="truncate text-[11px]">{sub.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentRoute(item.href, item.title)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 transition text-left hover:bg-[#002447] hover:text-white ${
                      isDirectActive ? 'text-white font-bold bg-[#0084bf]' : 'text-sky-100'
                    }`}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <i className={`fa ${item.icon} w-4 text-center text-sky-400`}></i>
                    {!sidebarCollapsed && (
                      <span className="truncate text-[11.5px] font-medium">{item.title}</span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Bottom Tag */}
        {!sidebarCollapsed && (
          <div className="p-2 border-t border-[#053d71] text-[10px] text-sky-300/70 text-center">
            Tech Drive v1.0 &bull; BGD ERP
          </div>
        )}
      </div>
    </aside>
  );
};
