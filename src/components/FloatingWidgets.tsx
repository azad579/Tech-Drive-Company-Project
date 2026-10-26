import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

export const FloatingWidgets: React.FC = () => {
  const {
    products,
    sales,
    purchases,
    setCurrentRoute,
    isQuickSearchOpen,
    setIsQuickSearchOpen,
    isChatOpen,
    setIsChatOpen,
    isProductDrawerOpen,
    setIsProductDrawerOpen,
    isQuickMenuOpen,
    setIsQuickMenuOpen,
    setSelectedProductForDetail,
    user
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [glSearch, setGlSearch] = useState('');

  // Internal team chat messages
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Saymon', text: 'Good morning team. Please check the Dell Latitude 5420 inventory.', time: '10:15 AM' },
    { sender: 'Inventory Desk', text: 'Checked. 4 Pcs in stock ready for showroom display.', time: '10:22 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsQuickSearchOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        sender: user.name,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  // Quick action items matching real site
  const quickLinks = [
    { name: 'Sales', icon: '/img/quick/axe_sales.png', route: 'sel_sinvcteate.php', title: 'Sales Invoice Create' },
    { name: 'Service', icon: '/img/quick/axe_service.png', route: 'ser_servicelist.php', title: 'Service List' },
    { name: 'Sales Return', icon: '/img/quick/axe_sreturn.png', route: 'sel_sreturncteate.php', title: 'Sales Return Create' },
    { name: 'Purchase', icon: '/img/quick/axe_purchase.png', route: 'pur_pinvcteate.php', title: 'Purchase Invoice Create' },
    { name: 'Purchase Return', icon: '/img/quick/axe_preturn.png', route: 'pur_preturncteate.php', title: 'Purchase Return Create' },
    { name: 'Add Product', icon: '/img/quick/axe_addpro.png', route: 'pro_productcreate.php', title: 'Add New Product' },
    { name: 'Expenses', icon: '/img/quick/axe_expenses.png', route: 'dai_expensescreate.php', title: 'Create Expenses' },
    { name: 'Cash Received', icon: '/img/quick/axe_cash.png', route: 'acc_reccreate.php', title: 'Receive Voucher Create' },
    { name: 'Cash Payment', icon: '/img/quick/axe_payment.png', route: 'acc_paycreate.php', title: 'Payment Voucher Create' },
    { name: 'Cash Statement', icon: '/img/quick/axe_cashst.png', route: 'rep_dailycashst.php', title: 'Daily Cash Statement' },
    { name: 'Warranty Claim', icon: '/img/quick/axe_warranty.png', route: 'war_claim.php', title: 'Warranty Claim' },
    { name: 'Inventory', icon: '/img/quick/axe_inventory.png', route: 'inv_brstocklist.php', title: 'Branch Stock' },
  ];

  // Search Results
  const matchedProducts = products.filter(p =>
    searchQuery && (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const matchedSales = sales.filter(s =>
    searchQuery && (
      s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const matchedPurchases = purchases.filter(p =>
    searchQuery && (
      p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const glFilteredProducts = products.filter(p =>
    glSearch === '' ||
    p.name.toLowerCase().includes(glSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(glSearch.toLowerCase())
  );

  return (
    <>
      {/* 1. Floating Quick Menu Drawer on Left */}
      <div className="fixed top-24 left-0 z-30 no-print flex items-start">
        {/* Toggle Button */}
        <button
          onClick={() => setIsQuickMenuOpen(prev => !prev)}
          className="bg-[#00305d] hover:bg-[#0084bf] text-white p-2.5 rounded-r shadow-lg border-y border-r border-[#0093d0] transition text-sm flex items-center justify-center font-bold"
          title="Quick Navigation"
        >
          <span className="text-base">&#9776;</span>
        </button>

        {/* Quick Menu Popout */}
        {isQuickMenuOpen && (
          <div className="ml-1 bg-[#00305d] text-white p-3 rounded-r-lg shadow-2xl border border-sky-600/30 max-w-xs animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-sky-800 pb-2 mb-2">
              <span className="font-bold text-xs text-[#f39c12]">Quick Shortcuts</span>
              <button
                onClick={() => setIsQuickMenuOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentRoute(link.route, link.title);
                    setIsQuickMenuOpen(false);
                  }}
                  className="p-2 rounded bg-[#002447] hover:bg-[#0084bf] flex flex-col items-center justify-center text-center space-y-1 transition group"
                >
                  <img
                    src={link.icon}
                    alt={link.name}
                    className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src = '/img/techdrive_fav.png';
                    }}
                  />
                  <span className="text-[10px] leading-tight text-sky-100">{link.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Right-edge Vertical Tabs: Product (Red) and Chat (Orange) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-1 select-none no-print">
        {/* Product Tab (Red) */}
        <button
          onClick={() => {
            setIsProductDrawerOpen(prev => !prev);
            setIsChatOpen(false);
          }}
          title="Product Quick Lookup"
          className="bg-[#e74c3c] hover:bg-[#c0392b] text-white text-[11px] font-bold py-2.5 px-1.5 rounded-l-sm shadow-md transition-colors [writing-mode:vertical-rl] rotate-180 flex items-center justify-center tracking-wider"
        >
          Product
        </button>

        {/* Chat Tab (Orange) */}
        <button
          onClick={() => {
            setIsChatOpen(prev => !prev);
            setIsProductDrawerOpen(false);
          }}
          title="Team Chat"
          className="bg-[#f39c12] hover:bg-[#d68910] text-white text-[11px] font-bold py-2.5 px-1.5 rounded-l-sm shadow-md transition-colors [writing-mode:vertical-rl] rotate-180 flex items-center justify-center tracking-wider"
        >
          Chat
        </button>
      </div>

      {/* Product Drawer Panel */}
      {isProductDrawerOpen && (
        <div className="fixed right-8 top-1/3 z-50 w-80 bg-[#00305d] text-white rounded-lg shadow-2xl border border-sky-600/40 p-3 text-xs animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-sky-700 pb-2 mb-2">
            <span className="font-bold text-sky-200">Instant Product &amp; Stock Lookup</span>
            <button onClick={() => setIsProductDrawerOpen(false)} className="text-gray-300 hover:text-white">
              &times;
            </button>
          </div>

          <input
            type="text"
            value={glSearch}
            onChange={e => setGlSearch(e.target.value)}
            placeholder="Search product code or name..."
            className="w-full px-2 py-1 text-xs bg-[#001f3f] text-white border border-sky-700 rounded mb-2 focus:outline-none"
          />

          <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-sky-900/60 pr-1">
            {glFilteredProducts.slice(0, 15).map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProductForDetail(p)}
                className="pt-1.5 flex items-center justify-between text-[11px] cursor-pointer hover:bg-sky-900/50 p-1 rounded"
              >
                <div>
                  <div className="font-semibold text-white line-clamp-1">{p.name}</div>
                  <span className="font-mono text-[10px] text-sky-300">{p.sku}</span>
                </div>
                <div className="text-right">
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    p.stock > 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {p.stock} {p.unit}
                  </span>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">{formatBDT(p.salePrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Team Chat Drawer */}
      {isChatOpen && (
        <div className="fixed right-8 top-1/4 z-50 w-80 bg-[#00305d] text-white rounded-lg shadow-2xl border border-sky-600/40 p-3 text-xs flex flex-col h-96 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-sky-700 pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-white">Internal Team Chat</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-300 hover:text-white">
              &times;
            </button>
          </div>

            {/* Message feed */}
            <div className="flex-1 overflow-y-auto space-y-2 p-1 bg-[#1a2b3c] rounded mb-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-[11px] ${
                    m.sender === user.name
                      ? 'bg-[#0084bf] ml-4 text-white'
                      : 'bg-[#22364a] mr-4 text-sky-100'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] text-sky-200 mb-0.5">
                    <span className="font-bold">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-1">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-2 py-1 bg-[#001f3f] text-white border border-sky-700 rounded text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#0084bf] hover:bg-[#006fa3] text-white font-bold rounded text-xs"
              >
                Send
              </button>
            </form>
          </div>
        )}

      {/* 4. Global Search Modal (Ctrl+K) */}
      {isQuickSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full border border-gray-300 overflow-hidden text-xs">
            <div className="p-3 border-b border-gray-200 flex items-center space-x-2 bg-gray-50">
              <i className="fa fa-search text-[#0084bf] text-base"></i>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across Tech Drive (e.g. SEL, PUR, Dell, Stand, Infosystem)..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => setIsQuickSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded border"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {!searchQuery && (
                <div className="text-center py-6 text-gray-400">
                  <p>Type any keyword to search products, sales invoices, or supplier bills.</p>
                </div>
              )}

              {/* Matched Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                    Products ({matchedProducts.length})
                  </div>
                  <div className="space-y-1">
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setCurrentRoute('pro_productlist.php', 'Product List');
                          setIsQuickSearchOpen(false);
                        }}
                        className="p-2 hover:bg-sky-50 rounded cursor-pointer flex justify-between items-center border border-transparent hover:border-sky-200"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{p.name}</div>
                          <span className="font-mono text-[10px] text-gray-500">{p.sku} &bull; {p.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#0084bf]">{formatBDT(p.salePrice)}</span>
                          <span className="text-[10px] block text-gray-400">Stock: {p.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Sales */}
              {matchedSales.length > 0 && (
                <div>
                  <div className="font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                    Sales Invoices ({matchedSales.length})
                  </div>
                  <div className="space-y-1">
                    {matchedSales.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setCurrentRoute('sel_sinvlist.php', 'Sales Invoice');
                          setIsQuickSearchOpen(false);
                        }}
                        className="p-2 hover:bg-emerald-50 rounded cursor-pointer flex justify-between items-center border border-transparent hover:border-emerald-200"
                      >
                        <div>
                          <div className="font-semibold text-[#0084bf]">{s.invoiceNo}</div>
                          <span className="text-gray-600">{s.customerName} &bull; {s.date}</span>
                        </div>
                        <div className="text-right font-bold text-gray-800">
                          {formatBDT(s.grandTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Purchases */}
              {matchedPurchases.length > 0 && (
                <div>
                  <div className="font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
                    Purchase Invoices ({matchedPurchases.length})
                  </div>
                  <div className="space-y-1">
                    {matchedPurchases.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setCurrentRoute('pur_pinvlist.php', 'Purchase Invoice');
                          setIsQuickSearchOpen(false);
                        }}
                        className="p-2 hover:bg-amber-50 rounded cursor-pointer flex justify-between items-center border border-transparent hover:border-amber-200"
                      >
                        <div>
                          <div className="font-semibold text-[#0084bf]">{p.invoiceNo}</div>
                          <span className="text-gray-600">{p.supplierName} &bull; {p.date}</span>
                        </div>
                        <div className="text-right font-bold text-gray-800">
                          {formatBDT(p.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
