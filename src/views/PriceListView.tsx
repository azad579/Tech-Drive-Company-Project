import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

interface PriceListViewProps {
  isBulkUpdate?: boolean;
}

export const PriceListView: React.FC<PriceListViewProps> = ({ isBulkUpdate = false }) => {
  const { products, updateProductPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer state for single item update
  const [activeEditProduct, setActiveEditProduct] = useState<any | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');
  const [editDaysInput, setEditDaysInput] = useState<string>('');

  // Barcode sticker preview drawer state
  const [barcodePreviewProduct, setBarcodePreviewProduct] = useState<any | null>(null);

  // Bulk update prices state
  const [bulkPrices, setBulkPrices] = useState<{ [productId: string]: string }>({});

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code || p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / recordsPerPage) || 1;
  const paginated = filteredProducts.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleOpenEdit = (prod: any) => {
    setActiveEditProduct(prod);
    setEditPriceInput(String(prod.currentPrice || prod.salePrice || 0));
    setEditDaysInput(String(prod.warrantyDays || 365));
    setBarcodePreviewProduct(null);
  };

  const handleSaveSingleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditProduct) return;
    const newPrice = parseFloat(editPriceInput) || 0;
    const newDays = parseInt(editDaysInput) || 30;
    updateProductPrice(activeEditProduct.id, newPrice, newDays);
    setActiveEditProduct(null);
  };

  const handleOpenBarcode = (prod: any) => {
    setBarcodePreviewProduct(prod);
    setActiveEditProduct(null);
  };

  const handleBulkUpdateSubmit = () => {
    Object.entries(bulkPrices).forEach(([id, val]) => {
      const p = parseFloat(val);
      if (!isNaN(p) && p > 0) {
        updateProductPrice(id, p);
      }
    });
    alert('Prices have been updated successfully!');
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <h1 className="text-xl font-bold text-gray-800">
          {isBulkUpdate ? 'Update Price List' : 'Price List'}
        </h1>
        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-1 sm:mt-0">
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Daily process</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">
            {isBulkUpdate ? 'Update Price List' : 'Price List'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Price Table Column */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-[#0084bf] text-white px-4 py-2 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>{isBulkUpdate ? 'ADD OR UPDATE PRICE' : 'PRICE LIST'}</span>
              <span className="text-xs font-normal bg-sky-800/60 px-2 py-0.5 rounded">
                Total Products: {products.length}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Table Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <select
                    value={recordsPerPage}
                    onChange={e => {
                      setRecordsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#0084bf]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-gray-600">records per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Search:</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search name or code..."
                    className="border border-gray-300 rounded px-2.5 py-1 text-xs w-48 sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-[#f4f7f9] text-gray-700 font-semibold select-none">
                    <tr>
                      <th className="py-2 px-2.5 w-10 text-center">SN</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Code</th>
                      <th className="py-2 px-2.5 text-center whitespace-nowrap">Available Qty</th>
                      {!isBulkUpdate && (
                        <th className="py-2 px-2.5 text-right whitespace-nowrap">Cost</th>
                      )}
                      <th className="py-2 px-2.5 text-right whitespace-nowrap">Old Price</th>
                      <th className="py-2 px-2.5 text-right whitespace-nowrap">Current Price</th>
                      {!isBulkUpdate && (
                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Warranty</th>
                      )}
                      {!isBulkUpdate && (
                        <th className="py-2 px-2.5 whitespace-nowrap">Last Update</th>
                      )}
                      {isBulkUpdate && (
                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Currency</th>
                      )}
                      {isBulkUpdate && (
                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Update Price</th>
                      )}
                      {!isBulkUpdate && (
                        <th className="py-2 px-2.5 text-center whitespace-nowrap">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {paginated.map((p, idx) => {
                      const sn = (currentPage - 1) * recordsPerPage + idx + 1;
                      return (
                        <tr key={p.id} className="hover:bg-sky-50/40 transition">
                          <td className="py-2.5 px-2.5 text-center text-gray-500 font-medium">{sn}</td>
                          <td className="py-2.5 px-3 font-normal max-w-sm leading-snug">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-gray-600 whitespace-nowrap">{p.code || p.sku}</td>
                          <td className="py-2.5 px-2.5 text-center font-bold text-gray-800">{p.stock ?? 1}</td>
                          {!isBulkUpdate && (
                            <td className="py-2.5 px-2.5 text-right font-mono text-gray-600">
                              {(p.costPrice || p.purchasePrice || 0).toFixed(2)}
                            </td>
                          )}
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-400">
                            ৳ {(p.oldPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                            {formatBDT(p.currentPrice || p.salePrice || 0)}
                          </td>
                          {!isBulkUpdate && (
                            <td className="py-2.5 px-2.5 text-center text-gray-500 whitespace-nowrap">
                              {p.warrantyDays ? `${p.warrantyDays} Days` : p.warranty || ''}
                            </td>
                          )}
                          {!isBulkUpdate && (
                            <td className="py-2.5 px-2.5 text-gray-400 text-[11px] whitespace-nowrap">
                              {p.lastUpdated || '24 Oct 2026'}
                            </td>
                          )}

                          {/* Bulk Update Controls */}
                          {isBulkUpdate && (
                            <td className="py-2 px-2.5 text-center">
                              <select className="border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                                <option value="BDT">Taka (৳)</option>
                              </select>
                            </td>
                          )}
                          {isBulkUpdate && (
                            <td className="py-2 px-2.5 text-center">
                              <input
                                type="number"
                                value={bulkPrices[p.id] ?? ''}
                                onChange={e => setBulkPrices({ ...bulkPrices, [p.id]: e.target.value })}
                                placeholder="0.00"
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-xs text-right font-mono focus:ring-1 focus:ring-[#0084bf]"
                              />
                            </td>
                          )}

                          {/* Single Actions */}
                          {!isBulkUpdate && (
                            <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="w-6 h-6 rounded bg-[#605ca8] hover:bg-[#504c96] text-white flex items-center justify-center shadow-xs"
                                  title="Edit / Update Price"
                                >
                                  <i className="fa fa-pencil text-[11px]"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenBarcode(p)}
                                  className="w-6 h-6 rounded bg-[#605ca8] hover:bg-[#504c96] text-white flex items-center justify-center shadow-xs"
                                  title="Print Barcode Sticker"
                                >
                                  <i className="fa fa-barcode text-[12px]"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="w-6 h-6 rounded bg-[#605ca8] hover:bg-[#504c96] text-white flex items-center justify-center shadow-xs"
                                  title="Price Tag"
                                >
                                  <i className="fa fa-tag text-[11px]"></i>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination or Bulk Update Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                <div className="text-gray-500">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{' '}
                  {Math.min(currentPage * recordsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} entries
                </div>

                {isBulkUpdate ? (
                  <button
                    type="button"
                    onClick={handleBulkUpdateSubmit}
                    className="px-6 py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs text-xs tracking-wider uppercase transition"
                  >
                    UPDATE
                  </button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`px-2.5 py-1 border rounded font-semibold ${
                          currentPage === n
                            ? 'bg-[#0084bf] text-white border-[#0084bf]'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
                    {totalPages > 5 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-2.5 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 border border-gray-300 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Drawer or History Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Edit Drawer Modal when activeEditProduct is open */}
          {activeEditProduct ? (
            <div className="bg-white rounded border border-gray-200 shadow-lg overflow-hidden animate-in fade-in duration-200">
              <div className="bg-[#d9534f] text-white px-3.5 py-2 font-bold text-xs flex items-center justify-between">
                <span>UPDATE PRICE &amp; WARRANTY</span>
                <button
                  type="button"
                  onClick={() => setActiveEditProduct(null)}
                  className="text-white hover:text-gray-200 font-bold text-base"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSaveSingleEdit} className="p-4 space-y-3.5 text-xs">
                <div className="font-semibold text-gray-800 pb-2 border-b border-gray-100">
                  <div className="text-[11px] text-gray-400 font-mono">{activeEditProduct.code}</div>
                  <div className="text-gray-800 text-xs mt-0.5 line-clamp-2">{activeEditProduct.name}</div>
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Old Price</label>
                  <input
                    type="text"
                    disabled
                    value={`৳ ${(activeEditProduct.oldPrice || 0).toFixed(2)}`}
                    className="w-full bg-gray-100 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Current Price</label>
                  <input
                    type="text"
                    disabled
                    value={formatBDT(activeEditProduct.currentPrice || activeEditProduct.price || 0)}
                    className="w-full bg-gray-100 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">Cost</label>
                  <input
                    type="text"
                    disabled
                    value={`৳ ${(activeEditProduct.costPrice || 0).toFixed(2)}`}
                    className="w-full bg-gray-100 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Update Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPriceInput}
                    onChange={e => setEditPriceInput(e.target.value)}
                    className="w-full border border-sky-400 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Update Days (Warranty) *</label>
                  <input
                    type="number"
                    required
                    value={editDaysInput}
                    onChange={e => setEditDaysInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0084bf]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#605ca8] hover:bg-[#504c96] text-white font-bold rounded shadow-xs text-xs tracking-wider uppercase transition"
                  >
                    UPDATE
                  </button>
                </div>
              </form>
            </div>
          ) : barcodePreviewProduct ? (
            /* Barcode sticker preview matching image_fc6356c9.png */
            <div className="bg-white rounded border border-gray-200 shadow-lg overflow-hidden animate-in fade-in duration-200">
              <div className="bg-[#d9534f] text-white px-3.5 py-2 font-bold text-xs flex items-center justify-between">
                <span>BARCODE STICKER</span>
                <button
                  type="button"
                  onClick={() => setBarcodePreviewProduct(null)}
                  className="text-white hover:text-gray-200 font-bold text-base"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-9 h-9 rounded bg-[#00c0ef] hover:bg-[#00a7d0] text-white flex items-center justify-center shadow-xs shrink-0"
                  title="Print Sticker"
                >
                  <i className="fa fa-print text-sm"></i>
                </button>

                <div className="flex-1 bg-white border border-dashed border-gray-300 p-3 rounded text-center select-none">
                  <div className="text-[11px] font-bold text-gray-800">
                    {barcodePreviewProduct.code} - {barcodePreviewProduct.brand || 'Tech Drive'}
                  </div>
                  <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                    {barcodePreviewProduct.name}
                  </div>
                  {/* Visual Barcode Graphic */}
                  <div className="my-2 flex justify-center items-end h-8 space-x-0.5">
                    {[3, 1, 4, 1, 5, 2, 1, 3, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-black inline-block h-full"
                        style={{ width: `${w * 1.4}px` }}
                      ></span>
                    ))}
                  </div>
                  <div className="text-xs font-mono font-bold tracking-wider text-gray-900">
                    MRP:{(barcodePreviewProduct.currentPrice || barcodePreviewProduct.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* History Panel matching image_b26e2ffc.png */
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
                    07 Oct 2026
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Azad shah</span>
                        <span><i className="fa fa-clock-o mr-1"></i>10:15:20 PM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        Price list has been Update
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Product Price Update
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    25 Sep 2026
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3 space-y-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span><i className="fa fa-clock-o mr-1"></i>12:47:09 PM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        Price list has been Update
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Product Price Update
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span><i className="fa fa-clock-o mr-1"></i>12:46:48 PM</span>
                      </div>
                      <div className="text-sky-600 font-semibold mt-1">
                        Price list has been Update
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Product Price Update
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    17 Jan 2026
                  </span>
                  <div className="mt-2.5 border-l-2 border-gray-200 pl-3">
                    <div className="relative">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></div>
                      <div className="flex items-center justify-between text-gray-400 text-[11px]">
                        <span className="font-bold text-gray-700 underline">Tech Drive</span>
                        <span><i className="fa fa-clock-o mr-1"></i>08:23:09 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
