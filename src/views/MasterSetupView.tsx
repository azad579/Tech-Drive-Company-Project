import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export type MasterTabType =
  | 'brand'
  | 'manufacturer'
  | 'unit'
  | 'ram'
  | 'ssd'
  | 'currency'
  | 'country'
  | 'transporter'
  | 'color'
  | 'size'
  | 'district'
  | 'zone';

interface MasterItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  extra?: string; // e.g. color hex '#06e013', district's country, currency symbol
}

interface MasterSetupViewProps {
  initialTab?: MasterTabType;
  initialCreateMode?: boolean;
}

export const MasterSetupView: React.FC<MasterSetupViewProps> = ({
  initialTab = 'brand',
  initialCreateMode = false
}) => {
  const { currentRoute, setCurrentRoute } = useApp();

  // Resolve active tab from current route or initialTab
  const [activeTab, setActiveTab] = useState<MasterTabType>(() => {
    if (currentRoute.includes('brand')) return 'brand';
    if (currentRoute.includes('man')) return 'manufacturer';
    if (currentRoute.includes('unit')) return 'unit';
    if (currentRoute.includes('ram')) return 'ram';
    if (currentRoute.includes('ssd')) return 'ssd';
    if (currentRoute.includes('currency')) return 'currency';
    if (currentRoute.includes('country')) return 'country';
    if (currentRoute.includes('ship')) return 'transporter';
    if (currentRoute.includes('color')) return 'color';
    if (currentRoute.includes('size')) return 'size';
    if (currentRoute.includes('district')) return 'district';
    if (currentRoute.includes('zone')) return 'zone';
    return initialTab;
  });

  // State for all Master Data with local storage persistence
  const [masterData, setMasterData] = useState<Record<MasterTabType, MasterItem[]>>(() => {
    const saved = localStorage.getItem('techdrive_master_setup');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fall through
      }
    }
    return {
      brand: [
        { id: 'b1', name: 'A4TECH', description: 'Peripherals & Keyboards' },
        { id: 'b2', name: 'ACER', description: 'Laptops & Monitors' },
        { id: 'b3', name: 'DELL', description: 'Latitude & Inspiron Laptops' },
        { id: 'b4', name: 'HP', description: 'EliteBook & ProBook' },
        { id: 'b5', name: 'LENOVO', description: 'ThinkPad & IdeaPad' },
        { id: 'b6', name: 'MICROSOFT', description: 'Surface & Accessories' },
        { id: 'b7', name: 'TECH DRIVE', description: 'In-House Quality Accessories' }
      ],
      manufacturer: [
        { id: 'm1', name: 'Foxconn Electronics', description: 'OEM Assembler' },
        { id: 'm2', name: 'Compal Broadband', description: 'Notebook ODM' },
        { id: 'm3', name: 'Quanta Computer', description: 'Laptop ODM' },
        { id: 'm4', name: 'Wistron InfoComm', description: 'Component Fabricator' }
      ],
      unit: [
        { id: 'u1', name: 'Pcs', description: 'Pieces' },
        { id: 'u2', name: 'Box', description: 'Retail Box' },
        { id: 'u3', name: 'Set', description: 'Combo Set' },
        { id: 'u4', name: 'Kg', description: 'Kilogram' }
      ],
      ram: [
        { id: 'r1', name: '4 GB DDR4', description: '2400MHz / 2666MHz' },
        { id: 'r2', name: '8 GB DDR4', description: '3200MHz SODIMM' },
        { id: 'r3', name: '16 GB DDR4', description: 'High Performance' },
        { id: 'r4', name: '16 GB DDR5', description: '4800MHz / 5600MHz' },
        { id: 'r5', name: '32 GB DDR5', description: 'Workstation Grade' }
      ],
      ssd: [
        { id: 's1', name: '128 GB M.2 NVMe', description: 'Fast boot drive' },
        { id: 's2', name: '256 GB M.2 NVMe', description: 'PCIe Gen 3x4' },
        { id: 's3', name: '512 GB M.2 NVMe', description: 'PCIe Gen 4x4' },
        { id: 's4', name: '1 TB M.2 NVMe', description: 'High Speed 3500MB/s' },
        { id: 's5', name: '2 TB M.2 NVMe', description: 'Enterprise Grade' }
      ],
      currency: [
        { id: 'c1', name: 'BDT', code: 'BDT', extra: '৳', description: 'Bangladeshi Taka' },
        { id: 'c2', name: 'USD', code: 'USD', extra: '$', description: 'United States Dollar' },
        { id: 'c3', name: 'EUR', code: 'EUR', extra: '€', description: 'Euro' },
        { id: 'c4', name: 'RMB', code: 'CNY', extra: '¥', description: 'Chinese Yuan' }
      ],
      country: [
        { id: 'co1', name: 'Bangladesh', code: 'BD', description: 'South Asia' },
        { id: 'co2', name: 'China', code: 'CN', description: 'East Asia' },
        { id: 'co3', name: 'United States', code: 'US', description: 'North America' },
        { id: 'co4', name: 'Taiwan', code: 'TW', description: 'East Asia' },
        { id: 'co5', name: 'Malaysia', code: 'MY', description: 'Southeast Asia' }
      ],
      transporter: [
        { id: 't1', name: 'Sundarban Courier Service', extra: '01711000001', description: 'Nationwide parcel' },
        { id: 't2', name: 'SA Paribahan', extra: '01811000002', description: 'Inter-district delivery' },
        { id: 't3', name: 'Steadfast Courier', extra: '01911000003', description: 'Doorstep cash on delivery' },
        { id: 't4', name: 'Pathao Courier', extra: '01611000004', description: 'Express delivery' }
      ],
      color: [
        { id: 'cl1', name: 'Matte Black', extra: '#1a1a1a', description: 'Sleek dark finish' },
        { id: 'cl2', name: 'Silver Grey', extra: '#c0c0c0', description: 'Aluminum anodized' },
        { id: 'cl3', name: 'Green', extra: '#06e013', description: 'Accent green' },
        { id: 'cl4', name: 'Midnight Blue', extra: '#1e3a8a', description: 'Corporate navy' }
      ],
      size: [
        { id: 'sz1', name: '13.3 Inch', description: 'Compact ultrabook' },
        { id: 'sz2', name: '14.0 Inch', description: 'Standard business' },
        { id: 'sz3', name: '15.6 Inch', description: 'Full size with numpad' },
        { id: 'sz4', name: '17.3 Inch', description: 'Mobile workstation' }
      ],
      district: [
        { id: 'd1', name: 'Bagerhat', extra: 'Bangladesh', description: 'Khulna Division' },
        { id: 'd2', name: 'Bandarban', extra: 'Bangladesh', description: 'Chittagong Division' },
        { id: 'd3', name: 'Barguna', extra: 'Bangladesh', description: 'Barisal Division' },
        { id: 'd4', name: 'Barisal', extra: 'Bangladesh', description: 'Barisal Division' },
        { id: 'd5', name: 'Bhola', extra: 'Bangladesh', description: 'Barisal Division' },
        { id: 'd6', name: 'Bogra', extra: 'Bangladesh', description: 'Rajshahi Division' },
        { id: 'd7', name: 'Brahmanbaria', extra: 'Bangladesh', description: 'Chittagong Division' },
        { id: 'd8', name: 'Chandpur', extra: 'Bangladesh', description: 'Chittagong Division' },
        { id: 'd9', name: 'Chapainawabganj', extra: 'Bangladesh', description: 'Rajshahi Division' },
        { id: 'd10', name: 'Chittagong', extra: 'Bangladesh', description: 'Chittagong Division' },
        { id: 'd11', name: 'Dhaka', extra: 'Bangladesh', description: 'Capital Division' },
        { id: 'd12', name: 'Gazipur', extra: 'Bangladesh', description: 'Dhaka Division' },
        { id: 'd13', name: 'Narayanganj', extra: 'Bangladesh', description: 'Dhaka Division' }
      ],
      zone: [
        { id: 'z1', name: 'Mirpur Zone', extra: 'Dhaka', description: 'Covering Mirpur 1-14' },
        { id: 'z2', name: 'Elephant Road Zone', extra: 'Dhaka', description: 'Multiplan & BCS City' },
        { id: 'z3', name: 'Uttara Zone', extra: 'Dhaka', description: 'Sectors 1-18' },
        { id: 'z4', name: 'Motijheel Commercial Zone', extra: 'Dhaka', description: 'Financial district' },
        { id: 'z5', name: 'Agrabad Zone', extra: 'Chittagong', description: 'Commercial port area' }
      ]
    };
  });

  const saveMasterData = (updated: Record<MasterTabType, MasterItem[]>) => {
    setMasterData(updated);
    localStorage.setItem('techdrive_master_setup', JSON.stringify(updated));
  };

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form & Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(initialCreateMode);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formExtra, setFormExtra] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // Active Tab configuration labels
  const getTabLabel = (t: MasterTabType) => {
    switch (t) {
      case 'brand': return 'Brand';
      case 'manufacturer': return 'Manufacturer';
      case 'unit': return 'Unit';
      case 'ram': return 'RAM';
      case 'ssd': return 'SSD';
      case 'currency': return 'Currency';
      case 'country': return 'Country';
      case 'transporter': return 'Transporter';
      case 'color': return 'Color';
      case 'size': return 'Size';
      case 'district': return 'District';
      case 'zone': return 'Zone';
    }
  };

  // List of items for current tab
  const currentList = masterData[activeTab] || [];
  const filteredList = currentList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.extra && item.extra.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormExtra(activeTab === 'color' ? '#06e013' : activeTab === 'district' ? 'Bangladesh' : '');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description || '');
    setFormExtra(item.extra || '');
    setIsDrawerOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    const updatedTabList = currentList.filter(item => item.id !== id);
    const updatedAll = { ...masterData, [activeTab]: updatedTabList };
    saveMasterData(updatedAll);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      // Update existing
      const updatedList = currentList.map(item =>
        item.id === editingItem.id
          ? { ...item, name: formName.trim(), description: formDesc.trim(), extra: formExtra.trim() }
          : item
      );
      saveMasterData({ ...masterData, [activeTab]: updatedList });
    } else {
      // Create new
      const newItem: MasterItem = {
        id: `${activeTab}-${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim(),
        extra: formExtra.trim() || undefined
      };
      saveMasterData({ ...masterData, [activeTab]: [newItem, ...currentList] });
    }

    setIsDrawerOpen(false);
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormExtra('');
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Top Breadcrumb */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-normal text-gray-800">
            {getTabLabel(activeTab)} List <small className="text-xs text-gray-500 font-normal">Master Setup</small>
          </h1>
        </div>
        <ol className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1 sm:mt-0">
          <li>
            <button
              onClick={() => setCurrentRoute('home.php', 'Dashboard')}
              className="text-[#0084bf] hover:underline flex items-center space-x-1"
            >
              <i className="fa fa-dashboard"></i>
              <span>Dashboard</span>
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-500">Master Setup</li>
          <li>/</li>
          <li className="text-gray-700 font-medium">{getTabLabel(activeTab)}</li>
        </ol>
      </section>

      {/* Sub-Tabs Selector for Quick Navigation */}
      <div className="bg-white p-2 border border-gray-200 shadow-2xs overflow-x-auto flex items-center space-x-1 text-xs">
        {(
          [
            'brand',
            'manufacturer',
            'unit',
            'ram',
            'ssd',
            'currency',
            'country',
            'transporter',
            'color',
            'size',
            'district',
            'zone'
          ] as MasterTabType[]
        ).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => {
              setActiveTab(tabKey);
              setCurrentPage(1);
              setIsDrawerOpen(false);
            }}
            className={`px-3 py-1.5 font-bold transition rounded-xs whitespace-nowrap uppercase tracking-tight ${
              activeTab === tabKey
                ? 'bg-[#0084bf] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {getTabLabel(tabKey)}
          </button>
        ))}
      </div>

      {/* Main Grid: Table (col-span-3) + Right History (col-span-1) matching image_cae33bb3.png & image_aba5d751.png */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Table Box */}
        <div className="lg:col-span-3 bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header Box in AdminLTE Cyan/Blue */}
            <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
              <span>ALL {getTabLabel(activeTab).toUpperCase()}</span>
              <span className="text-[11px] font-normal lowercase">({filteredList.length} total entries)</span>
            </div>

            {/* Controls Bar: records per page & Search */}
            <div className="p-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-600">records per page</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf] w-48 sm:w-56"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                    <th className="p-2.5 border-r border-gray-200">Name</th>
                    {activeTab === 'color' && <th className="p-2.5 border-r border-gray-200">Color Swatch</th>}
                    {activeTab === 'currency' && <th className="p-2.5 border-r border-gray-200">Symbol / Code</th>}
                    {activeTab === 'district' && <th className="p-2.5 border-r border-gray-200">Country</th>}
                    {activeTab === 'zone' && <th className="p-2.5 border-r border-gray-200">District</th>}
                    <th className="p-2.5 border-r border-gray-200">Description</th>
                    <th className="p-2.5 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">
                          {item.name}
                        </td>
                        {activeTab === 'color' && (
                          <td className="p-2.5 border-r border-gray-100">
                            <div className="flex items-center space-x-2">
                              <span
                                className="w-5 h-5 rounded-xs border border-gray-300 shadow-2xs inline-block"
                                style={{ backgroundColor: item.extra || '#06e013' }}
                              ></span>
                              <span className="font-mono text-[11px] text-gray-500">{item.extra || '#06e013'}</span>
                            </div>
                          </td>
                        )}
                        {activeTab === 'currency' && (
                          <td className="p-2.5 font-mono font-bold text-[#0084bf] border-r border-gray-100">
                            {item.extra} ({item.code || item.name})
                          </td>
                        )}
                        {activeTab === 'district' && (
                          <td className="p-2.5 border-r border-gray-100 text-gray-600">
                            {item.extra || 'Bangladesh'}
                          </td>
                        )}
                        {activeTab === 'zone' && (
                          <td className="p-2.5 border-r border-gray-100 text-gray-600">
                            {item.extra || 'Dhaka'}
                          </td>
                        )}
                        <td className="p-2.5 text-gray-500 border-r border-gray-100">
                          {item.description || '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit item"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete item"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Bar: Showing X of Y and ADD BUTTON in Purple */}
          <div className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} entries
            </div>

            <div className="flex items-center space-x-3">
              {/* Pagination */}
              <div className="flex items-center space-x-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center border text-xs font-semibold rounded-xs ${
                      currentPage === i + 1
                        ? 'bg-[#0084bf] text-white border-[#0084bf]'
                        : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>

              {/* Purple Add Button matching screenshots image_cae33bb3.png, image_f2a8ba6c.png */}
              <button
                onClick={handleOpenAdd}
                className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold text-xs uppercase tracking-wide transition shadow-2xs flex items-center space-x-1"
              >
                <span>ADD {getTabLabel(activeTab).toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right History Widget matching screenshots image_cae33bb3.png, image_aba5d751.png */}
        <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden h-fit">
          <div className="bg-[#0084bf] text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fa fa-history"></i>
              <span>HISTORY</span>
            </div>
          </div>
          <div className="p-3 text-xs divide-y divide-gray-100 space-y-3">
            <div>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                25 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Tech Drive <span className="text-[10px] text-gray-400 font-normal">10:45 AM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">Master settings synced</p>
                  <p className="text-[11px] text-gray-500">Auto audit active</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                24 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Staff access <span className="text-[10px] text-gray-400 font-normal">06:52 PM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">{getTabLabel(activeTab)} catalog updated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer / Modal matching image_371aed2a.png & image_21611170.png & image_acc86daf.png */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left">
            <div>
              {/* Dark Header with red X matching image_371aed2a.png */}
              <div className="bg-[#555] text-white px-4 py-3 flex items-center justify-between font-bold text-xs uppercase tracking-wide">
                <span>
                  {editingItem ? `Edit ${getTabLabel(activeTab)}` : `Add ${getTabLabel(activeTab)}`}
                </span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="bg-[#dd4b39] hover:bg-[#c9302c] text-white w-6 h-6 rounded-xs flex items-center justify-center text-sm font-black transition"
                >
                  &times;
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
                {activeTab === 'district' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Select Country</label>
                    <select
                      value={formExtra || 'Bangladesh'}
                      onChange={e => setFormExtra(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="China">China</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                )}

                {activeTab === 'zone' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Select District</label>
                    <select
                      value={formExtra || 'Dhaka'}
                      onChange={e => setFormExtra(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Narayanganj">Narayanganj</option>
                      <option value="Sylhet">Sylhet</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    {getTabLabel(activeTab)} Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder={`e.g. ${activeTab === 'brand' ? 'Asus' : activeTab === 'ram' ? '16 GB DDR4' : 'Name'}`}
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  />
                </div>

                {activeTab === 'color' && (
                  <div className="relative">
                    <label className="block text-gray-700 font-semibold mb-1">Color Palette Swatch:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setColorPickerOpen(!colorPickerOpen)}
                        className="flex items-center space-x-2 border border-gray-300 rounded-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100"
                      >
                        <span
                          className="w-5 h-5 rounded-xs border border-gray-400"
                          style={{ backgroundColor: formExtra || '#06e013' }}
                        ></span>
                        <span className="font-mono text-xs">{formExtra || '#06e013'}</span>
                        <span className="text-[10px] text-gray-500">&#9660;</span>
                      </button>
                    </div>

                    {/* Spectrum Color Picker Popup matching image_acc86daf.png */}
                    {colorPickerOpen && (
                      <div className="absolute left-0 top-12 z-50 bg-white border border-gray-300 shadow-xl p-3 w-64 rounded-xs space-y-2">
                        <div className="text-[11px] font-bold text-gray-700 uppercase">Choose Swatch</div>
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            '#1a1a1a', '#4b5563', '#9ca3af', '#c0c0c0', '#ffffff',
                            '#ef4444', '#dc2626', '#b91c1c', '#f97316', '#ea580c',
                            '#eab308', '#ca8a04', '#06e013', '#16a34a', '#15803d',
                            '#06b6d4', '#0284c7', '#2563eb', '#1e3a8a', '#9333ea',
                            '#7e22ce', '#c026d3', '#db2777', '#be185d'
                          ].map(hex => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => {
                                setFormExtra(hex);
                                setColorPickerOpen(false);
                              }}
                              className="w-8 h-8 rounded-xs border border-gray-300 hover:scale-110 transition shadow-2xs"
                              style={{ backgroundColor: hex }}
                            ></button>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                          <input
                            type="text"
                            value={formExtra || '#06e013'}
                            onChange={e => setFormExtra(e.target.value)}
                            className="border border-gray-300 rounded-xs px-2 py-1 text-xs font-mono w-24"
                          />
                          <button
                            type="button"
                            onClick={() => setColorPickerOpen(false)}
                            className="bg-[#605ca8] text-white px-2 py-1 text-xs rounded-xs font-bold"
                          >
                            Choose
                          </button>
                          <button
                            type="button"
                            onClick={() => setColorPickerOpen(false)}
                            className="text-gray-500 hover:text-gray-800 text-xs px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'currency' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Currency Symbol:</label>
                    <input
                      type="text"
                      value={formExtra}
                      onChange={e => setFormExtra(e.target.value)}
                      placeholder="e.g. ৳ or $"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description / Notes:</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingItem ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
