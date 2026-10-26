import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForDetail, setSelectedProductForDetail, setCurrentRoute } = useApp();

  if (!selectedProductForDetail) return null;

  const p = selectedProductForDetail;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-5 border border-gray-300 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="bg-[#00305d] text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              {p.sku}
            </span>
            <h3 className="font-bold text-base text-gray-800 line-clamp-1">{p.name}</h3>
          </div>
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="text-gray-400 hover:text-gray-600 text-base"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Category</span>
              <span className="font-semibold text-gray-800">{p.category}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Brand</span>
              <span className="font-semibold text-gray-800">{p.brand}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Current Stock</span>
              <span className={`font-bold ${p.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {p.stock} {p.unit}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Warranty</span>
              <span className="font-semibold text-gray-700">{p.warranty}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-sky-50 p-3 rounded border border-sky-100">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Purchase Cost</span>
              <span className="font-bold text-gray-700">{formatBDT(p.purchasePrice)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Retail Sale Price</span>
              <span className="font-bold text-[#0084bf] text-sm">{formatBDT(p.salePrice)}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setSelectedProductForDetail(null)}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProductForDetail(null);
                setCurrentRoute('pur_pinvcteate.php', 'Purchase Invoice Create');
              }}
              className="btn btn-flat bg-purple text-white font-bold"
            >
              Reorder Purchase
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProductForDetail(null);
                setCurrentRoute('sel_sinvcteate.php', 'Sales Invoice Create');
              }}
              className="btn btn-flat bg-[#00305d] text-white font-bold"
            >
              Sell in POS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
