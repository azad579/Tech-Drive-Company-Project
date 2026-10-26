import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/banglaDate';
import { Product } from '../types';

export type ProductSubTab =
  | 'productList'
  | 'productCreate'
  | 'categoryList'
  | 'categoryCreate'
  | 'subCategoryList'
  | 'subCategoryCreate'
  | 'parentList'
  | 'parentCreate';

interface ParentItem {
  id: string;
  name: string;
  description: string;
}

interface CategoryItem {
  id: string;
  name: string;
  parent: string;
  description: string;
}

interface SubCategoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const ProductListView: React.FC<{ initialSubTab?: ProductSubTab }> = ({ initialSubTab }) => {
  const { products, addProduct, currentRoute, setCurrentRoute, setSelectedProductForDetail } = useApp();

  // Resolve sub-tab
  const [activeSubTab, setActiveSubTab] = useState<ProductSubTab>(() => {
    if (initialSubTab) return initialSubTab;
    if (currentRoute === 'pro_parentlist.php') return 'parentList';
    if (currentRoute === 'pro_parentcreate.php') return 'parentCreate';
    if (currentRoute === 'pro_categorylist.php') return 'categoryList';
    if (currentRoute === 'pro_categorycreate.php') return 'categoryCreate';
    if (currentRoute === 'pro_subcategorylist.php') return 'subCategoryList';
    if (currentRoute === 'pro_subcategorycreate.php') return 'subCategoryCreate';
    if (currentRoute === 'pro_productcreate.php') return 'productCreate';
    return 'productList';
  });

  // Persistent Parent List matching image_80651ad1.png
  const [parents, setParents] = useState<ParentItem[]>(() => {
    const saved = localStorage.getItem('techdrive_product_parents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'pr-1', name: 'Laptop', description: 'Business & Ultrabooks' },
      { id: 'pr-2', name: 'Lenovo', description: 'ThinkPad line' },
      { id: 'pr-3', name: 'Laptop Bag', description: 'Carrying cases & sleeves' },
      { id: 'pr-4', name: 'Adaptor', description: 'Original Type-C & barrel chargers' },
      { id: 'pr-5', name: 'Power Cord', description: 'Three-pin power cable' },
      { id: 'pr-6', name: 'Ram', description: 'SODIMM & Desktop memories' },
      { id: 'pr-7', name: 'SSD', description: 'NVMe & SATA solid state drives' },
      { id: 'pr-8', name: 'Mouse Pad', description: 'Gaming & desk mats' },
      { id: 'pr-9', name: 'Battery', description: 'Internal replacement batteries' },
      { id: 'pr-10', name: 'Display', description: 'Replacement LCD/OLED panels' }
    ];
  });

  // Persistent Categories matching image_97efe68b.png
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('techdrive_product_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'cat-1', name: 'AMD Ryzen 7 Pro 6850U', parent: 'Laptop', description: 'AMD Ryzen 7 Pro 6850U' },
      { id: 'cat-2', name: 'AMD Ryzen™ 7 7735U', parent: 'Laptop', description: 'AMD Zen 3+ 8-Core' },
      { id: 'cat-3', name: '1TB NVMe SSD', parent: 'SSD', description: 'PCIe Gen 4.0' },
      { id: 'cat-4', name: '256GB NVMe', parent: 'SSD', description: 'PCIe Gen 3.0' },
      { id: 'cat-5', name: '512GB PCIe NVMe', parent: 'SSD', description: 'High speed M.2' },
      { id: 'cat-6', name: 'A4TECH Wireless Mouse', parent: 'Mouse', description: 'A4TECH Wireless Mouse' },
      { id: 'cat-7', name: 'Intel Core i5 12th Gen', parent: 'Laptop', description: 'Alder Lake platform' },
      { id: 'cat-8', name: 'Intel Core i7 13th Gen', parent: 'Laptop', description: 'Raptor Lake' }
    ];
  });

  // Persistent Sub-Categories matching image_f878a433.png
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>(() => {
    const saved = localStorage.getItem('techdrive_product_subcategories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'sub-1', name: '10th Gen', category: 'Intel Core i5', description: '10th Generation' },
      { id: 'sub-2', name: '11th Gen', category: 'Intel Core i7', description: '11th Generation' },
      { id: 'sub-3', name: '12th Generation', category: 'Core i5', description: '12th Generation' },
      { id: 'sub-4', name: '13th Generation', category: 'Intel Core i5', description: 'i5 Raptor Lake' },
      { id: 'sub-5', name: '6000 Series', category: 'AMD Ryzen 7 Pro 6850U', description: 'Zen 3+' },
      { id: 'sub-6', name: '1 Year Warranty', category: 'Laptop', description: 'Hardware warranty' }
    ];
  });

  // Notice banner
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Parent form state
  const [editingParent, setEditingParent] = useState<ParentItem | null>(null);
  const [parentName, setParentName] = useState('');
  const [parentDesc, setParentDesc] = useState('');

  // Category form state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catParent, setCatParent] = useState('Laptop');
  const [catDesc, setCatDesc] = useState('');

  // Sub-Category form state
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryItem | null>(null);
  const [subName, setSubName] = useState('');
  const [subCatParent, setSubCatParent] = useState('Intel Core i5');
  const [subDesc, setSubDesc] = useState('');

  // Product form state matching image_d9612613.png
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCode, setProdCode] = useState('ABA223P');
  const [prodParent, setProdParent] = useState('Laptop');
  const [prodCategory, setProdCategory] = useState('AMD Ryzen 7 Pro 6850U');
  const [prodSubCategory, setProdSubCategory] = useState('6000 Series');
  const [prodBrand, setProdBrand] = useState('HP');
  const [prodRam, setProdRam] = useState('16 GB DDR4');
  const [prodSsd, setProdSsd] = useState('512 GB M.2 NVMe');
  const [prodManufacturer, setProdManufacturer] = useState('Foxconn Electronics');
  const [prodUnit, setProdUnit] = useState('Pcs');
  const [prodPurchaseScan, setProdPurchaseScan] = useState('Barcode');
  const [prodCountry, setProdCountry] = useState('Bangladesh');
  const [prodStatus, setProdStatus] = useState('Active');
  const [prodMinStock, setProdMinStock] = useState('2');
  const [prodCertificate, setProdCertificate] = useState('ISO:9901');
  const [prodModelNo, setProdModelNo] = useState('845 G9');
  const [prodBrandNo, setProdBrandNo] = useState('HP-ELITE');
  const [prodCost, setProdCost] = useState('45000');
  const [prodPrice, setProdPrice] = useState('55000');
  const [prodWarranty, setProdWarranty] = useState('365');
  const [prodBarcode, setProdBarcode] = useState('8809123456789');
  const [prodDesc, setProdDesc] = useState('');

  // Parent handlers
  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) return;

    if (editingParent) {
      const updated = parents.map(p =>
        p.id === editingParent.id ? { ...p, name: parentName.trim(), description: parentDesc.trim() } : p
      );
      setParents(updated);
      localStorage.setItem('techdrive_product_parents', JSON.stringify(updated));
      showNotice(`Parent "${parentName}" updated.`);
    } else {
      const newItem: ParentItem = {
        id: `pr-${Date.now()}`,
        name: parentName.trim(),
        description: parentDesc.trim()
      };
      const updated = [newItem, ...parents];
      setParents(updated);
      localStorage.setItem('techdrive_product_parents', JSON.stringify(updated));
      showNotice(`Parent "${parentName}" added.`);
    }
    setParentName('');
    setParentDesc('');
    setEditingParent(null);
    setActiveSubTab('parentList');
  };

  // Category handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      const updated = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, name: catName.trim(), parent: catParent, description: catDesc.trim() }
          : c
      );
      setCategories(updated);
      localStorage.setItem('techdrive_product_categories', JSON.stringify(updated));
      showNotice(`Category "${catName}" updated.`);
    } else {
      const newItem: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: catName.trim(),
        parent: catParent,
        description: catDesc.trim()
      };
      const updated = [newItem, ...categories];
      setCategories(updated);
      localStorage.setItem('techdrive_product_categories', JSON.stringify(updated));
      showNotice(`Category "${catName}" added.`);
    }
    setCatName('');
    setCatDesc('');
    setEditingCategory(null);
    setActiveSubTab('categoryList');
  };

  // Sub-Category handlers
  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    if (editingSubCategory) {
      const updated = subCategories.map(s =>
        s.id === editingSubCategory.id
          ? { ...s, name: subName.trim(), category: subCatParent, description: subDesc.trim() }
          : s
      );
      setSubCategories(updated);
      localStorage.setItem('techdrive_product_subcategories', JSON.stringify(updated));
      showNotice(`Sub-Category "${subName}" updated.`);
    } else {
      const newItem: SubCategoryItem = {
        id: `sub-${Date.now()}`,
        name: subName.trim(),
        category: subCatParent,
        description: subDesc.trim()
      };
      const updated = [newItem, ...subCategories];
      setSubCategories(updated);
      localStorage.setItem('techdrive_product_subcategories', JSON.stringify(updated));
      showNotice(`Sub-Category "${subName}" added.`);
    }
    setSubName('');
    setSubDesc('');
    setEditingSubCategory(null);
    setActiveSubTab('subCategoryList');
  };

  // Product Add / Edit handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCode(`ABA${Math.floor(200 + Math.random() * 800)}P`);
    setProdParent('Laptop');
    setProdCategory('AMD Ryzen 7 Pro 6850U');
    setProdSubCategory('6000 Series');
    setProdBrand('HP');
    setProdRam('16 GB DDR4');
    setProdSsd('512 GB M.2 NVMe');
    setProdManufacturer('Foxconn Electronics');
    setProdUnit('Pcs');
    setProdPurchaseScan('Barcode');
    setProdCountry('Bangladesh');
    setProdStatus('Active');
    setProdMinStock('2');
    setProdCertificate('ISO:9901');
    setProdModelNo('EliteBook 845');
    setProdBrandNo('HP-845');
    setProdCost('45000');
    setProdPrice('55000');
    setProdWarranty('365');
    setProdBarcode('8809123456789');
    setProdDesc('');
    setActiveSubTab('productCreate');
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCode(p.sku);
    setProdParent('Laptop');
    setProdCategory(p.category);
    setProdSubCategory('Standard');
    setProdBrand(p.brand);
    setProdRam('16 GB DDR4');
    setProdSsd('512 GB M.2 NVMe');
    setProdManufacturer('Foxconn Electronics');
    setProdUnit(p.unit || 'Pcs');
    setProdPurchaseScan('Barcode');
    setProdCountry('Bangladesh');
    setProdStatus('Active');
    setProdMinStock(String(p.minStockAlert));
    setProdCertificate('ISO:9901');
    setProdModelNo('ThinkPad / EliteBook');
    setProdBrandNo(p.brand.toUpperCase());
    setProdCost(String(p.purchasePrice));
    setProdPrice(String(p.salePrice));
    setProdWarranty(p.warranty || '365');
    setProdBarcode('8809123456789');
    setProdDesc('High performance commercial laptop.');
    setActiveSubTab('productCreate');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showNotice('Please enter product name.');
      return;
    }

    if (editingProduct) {
      const updatedProd: Product = {
        ...editingProduct,
        name: prodName,
        sku: prodCode,
        category: prodCategory,
        brand: prodBrand,
        purchasePrice: Number(prodCost),
        salePrice: Number(prodPrice),
        unit: prodUnit,
        warranty: `${prodWarranty} Days`,
        minStockAlert: Number(prodMinStock)
      };
      const stored = JSON.parse(localStorage.getItem('techdrive_products') || '[]');
      const list = stored.length ? stored : products;
      const updated = list.map((item: Product) => (item.id === editingProduct.id ? updatedProd : item));
      localStorage.setItem('techdrive_products', JSON.stringify(updated));
      showNotice(`Product "${prodName}" updated.`);
    } else {
      addProduct({
        name: prodName,
        sku: prodCode,
        category: prodCategory,
        brand: prodBrand,
        purchasePrice: Number(prodCost),
        salePrice: Number(prodPrice),
        stock: 5,
        minStockAlert: Number(prodMinStock),
        unit: prodUnit,
        warranty: `${prodWarranty} Days`
      });
      showNotice(`Product "${prodName}" created.`);
    }

    setActiveSubTab('productList');
  };

  // Filtered product items
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );
  const prodPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notice */}
      {notice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded text-xs shadow-md flex items-center justify-between no-print animate-fade-in">
          <div className="flex items-center space-x-2">
            <i className="fa fa-check-circle text-sm"></i>
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-white hover:text-emerald-200 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-normal text-gray-800">
            {activeSubTab === 'parentList' && 'Parent List'}
            {activeSubTab === 'parentCreate' && (editingParent ? 'Edit Parent' : 'Parent Create')}
            {activeSubTab === 'categoryList' && 'Category List'}
            {activeSubTab === 'categoryCreate' && (editingCategory ? 'Edit Category' : 'Category Create')}
            {activeSubTab === 'subCategoryList' && 'Subcategory List'}
            {activeSubTab === 'subCategoryCreate' && (editingSubCategory ? 'Edit Subcategory' : 'Subcategory Create')}
            {activeSubTab === 'productList' && 'Product List'}
            {activeSubTab === 'productCreate' && (editingProduct ? 'Edit Product' : 'Add New Product')}
            <small className="text-xs text-gray-500 font-normal ml-2">Product Setup</small>
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
          <li className="text-gray-500">Product Process</li>
          <li>/</li>
          <li className="text-gray-700 font-medium">
            {activeSubTab.includes('parent') ? 'Parent' : activeSubTab.includes('category') ? 'Category' : 'Product'}
          </li>
        </ol>
      </section>

      {/* Sub-Tabs Nav */}
      <div className="bg-white p-2 border border-gray-200 shadow-2xs overflow-x-auto flex items-center space-x-1 text-xs">
        {[
          { key: 'parentList', label: 'Parent List' },
          { key: 'parentCreate', label: 'Parent Create' },
          { key: 'categoryList', label: 'Category List' },
          { key: 'categoryCreate', label: 'Category Create' },
          { key: 'subCategoryList', label: 'Sub-Category List' },
          { key: 'subCategoryCreate', label: 'Sub-Category Create' },
          { key: 'productList', label: 'Product List' },
          { key: 'productCreate', label: 'Add New Product' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => {
              if (item.key === 'parentCreate') setEditingParent(null);
              if (item.key === 'categoryCreate') setEditingCategory(null);
              if (item.key === 'subCategoryCreate') setEditingSubCategory(null);
              if (item.key === 'productCreate') setEditingProduct(null);
              setActiveSubTab(item.key as ProductSubTab);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold transition rounded-xs whitespace-nowrap uppercase tracking-tight ${
              activeSubTab === item.key
                ? 'bg-[#0084bf] text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Content (col-span-3) + Right History (col-span-1) matching image_80651ad1.png, image_ee555d49.png */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* =========================================================================
              1. PARENT LIST (image_80651ad1.png)
              ========================================================================= */}
          {activeSubTab === 'parentList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>PRODUCT PARENT LIST</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">NAME</th>
                      <th className="p-2.5 border-r border-gray-200">DESCRIPTION</th>
                      <th className="p-2.5 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {parents.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">{p.name}</td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{p.description}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingParent(p);
                                setParentName(p.name);
                                setParentDesc(p.description);
                                setActiveSubTab('parentCreate');
                              }}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const updated = parents.filter(x => x.id !== p.id);
                                setParents(updated);
                                localStorage.setItem('techdrive_product_parents', JSON.stringify(updated));
                                showNotice(`Parent "${p.name}" removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setEditingParent(null);
                    setParentName('');
                    setParentDesc('');
                    setActiveSubTab('parentCreate');
                  }}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                >
                  ADD PARENT
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. PARENT CREATE / EDIT (image_c62056ad.png & image_87e8f4e5.png)
              ========================================================================= */}
          {activeSubTab === 'parentCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingParent ? 'EDIT PARENT' : 'CREATE PARENT'}</span>
              </div>
              <form onSubmit={handleSaveParent} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="e.g. Laptop"
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={parentDesc}
                    onChange={e => setParentDesc(e.target.value)}
                    placeholder="Parent description..."
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingParent ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('parentList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              3. CATEGORY LIST (image_97efe68b.png)
              ========================================================================= */}
          {activeSubTab === 'categoryList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>CATEGORY LIST</span>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">NAME</th>
                      <th className="p-2.5 border-r border-gray-200">PARENT</th>
                      <th className="p-2.5 border-r border-gray-200">DESCRIPTION</th>
                      <th className="p-2.5 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {categories.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">{c.name}</td>
                        <td className="p-2.5 text-sky-800 font-semibold border-r border-gray-100">{c.parent}</td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{c.description}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingCategory(c);
                                setCatName(c.name);
                                setCatParent(c.parent);
                                setCatDesc(c.description);
                                setActiveSubTab('categoryCreate');
                              }}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const updated = categories.filter(x => x.id !== c.id);
                                setCategories(updated);
                                localStorage.setItem('techdrive_product_categories', JSON.stringify(updated));
                                showNotice(`Category "${c.name}" removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatDesc('');
                    setActiveSubTab('categoryCreate');
                  }}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                >
                  ADD CATEGORY
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. CATEGORY CREATE / EDIT (image_2aba84eb.png & image_e0d11e84.png)
              ========================================================================= */}
          {activeSubTab === 'categoryCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingCategory ? 'EDIT CATEGORY' : 'CREATE CATEGORY'}</span>
              </div>
              <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    placeholder="e.g. AMD Ryzen 7 Pro 6850U"
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Parent (Optional)</label>
                  <select
                    value={catParent}
                    onChange={e => setCatParent(e.target.value)}
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  >
                    {parents.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={e => setCatDesc(e.target.value)}
                    placeholder="Category notes..."
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingCategory ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('categoryList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              5. SUB-CATEGORY LIST (image_f878a433.png)
              ========================================================================= */}
          {activeSubTab === 'subCategoryList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>SUB-CATEGORY LIST</span>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">CATEGORY</th>
                      <th className="p-2.5 border-r border-gray-200">NAME</th>
                      <th className="p-2.5 border-r border-gray-200">DESCRIPTION</th>
                      <th className="p-2.5 text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {subCategories.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">{idx + 1}</td>
                        <td className="p-2.5 text-sky-800 font-semibold border-r border-gray-100">{s.category}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">{s.name}</td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{s.description}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                setEditingSubCategory(s);
                                setSubName(s.name);
                                setSubCatParent(s.category);
                                setSubDesc(s.description);
                                setActiveSubTab('subCategoryCreate');
                              }}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const updated = subCategories.filter(x => x.id !== s.id);
                                setSubCategories(updated);
                                localStorage.setItem('techdrive_product_subcategories', JSON.stringify(updated));
                                showNotice(`Sub-Category "${s.name}" removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setEditingSubCategory(null);
                    setSubName('');
                    setSubDesc('');
                    setActiveSubTab('subCategoryCreate');
                  }}
                  className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                >
                  ADD SUB-CATEGORY
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. SUB-CATEGORY CREATE / EDIT (image_f63c1098.png & image_ec19b754.png)
              ========================================================================= */}
          {activeSubTab === 'subCategoryCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingSubCategory ? 'EDIT SUB-CATEGORY' : 'CREATE SUB-CATEGORY'}</span>
              </div>
              <form onSubmit={handleSaveSubCategory} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Select Category</label>
                  <select
                    value={subCatParent}
                    onChange={e => setSubCatParent(e.target.value)}
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Subcategory Name</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    placeholder="e.g. 12th Generation"
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={subDesc}
                    onChange={e => setSubDesc(e.target.value)}
                    placeholder="Subcategory notes..."
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingSubCategory ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('subCategoryList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              7. PRODUCT LIST (image_ee555d49.png)
              ========================================================================= */}
          {activeSubTab === 'productList' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                <span>PRODUCT LIST</span>
                <span className="text-[11px] font-normal lowercase">({filteredProducts.length} items cataloged)</span>
              </div>

              {/* Search Bar */}
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
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search title, SKU, brand..."
                    className="border border-gray-300 rounded-xs px-2 py-1 bg-white focus:outline-none focus:border-[#0084bf] w-48 sm:w-64"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f6f9] text-gray-700 font-bold uppercase text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 border-r border-gray-200 w-12 text-center">SN</th>
                      <th className="p-2.5 border-r border-gray-200">Code / SKU</th>
                      <th className="p-2.5 border-r border-gray-200">Product Title</th>
                      <th className="p-2.5 border-r border-gray-200">Category</th>
                      <th className="p-2.5 border-r border-gray-200">Brand</th>
                      <th className="p-2.5 border-r border-gray-200 text-right">Cost (৳)</th>
                      <th className="p-2.5 border-r border-gray-200 text-right">Price (৳)</th>
                      <th className="p-2.5 border-r border-gray-200 text-center">Stock</th>
                      <th className="p-2.5 text-center w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {paginatedProducts.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-2.5 text-center text-gray-500 border-r border-gray-100">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-2.5 font-mono text-[#0084bf] font-bold border-r border-gray-100">{p.sku}</td>
                        <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100 max-w-xs truncate">
                          {p.name}
                        </td>
                        <td className="p-2.5 text-gray-600 border-r border-gray-100">{p.category}</td>
                        <td className="p-2.5 font-semibold text-gray-700 border-r border-gray-100">{p.brand}</td>
                        <td className="p-2.5 text-right font-mono border-r border-gray-100">{formatBDT(p.purchasePrice)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-gray-900 border-r border-gray-100">
                          {formatBDT(p.salePrice)}
                        </td>
                        <td className="p-2.5 text-center border-r border-gray-100 font-mono font-bold text-emerald-800">
                          {p.stock}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setSelectedProductForDetail(p)}
                              className="w-6 h-6 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="View Details"
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="w-6 h-6 bg-[#3c8dbc] hover:bg-[#367fa9] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Edit Product"
                            >
                              <i className="fa fa-pencil"></i>
                            </button>
                            <button
                              onClick={() => {
                                const stored = JSON.parse(localStorage.getItem('techdrive_products') || '[]');
                                const list = stored.length ? stored : products;
                                const updated = list.filter((item: Product) => item.id !== p.id);
                                localStorage.setItem('techdrive_products', JSON.stringify(updated));
                                showNotice(`Product "${p.name}" removed.`);
                              }}
                              className="w-6 h-6 bg-[#dd4b39] hover:bg-[#d73925] text-white rounded-xs flex items-center justify-center text-[10px] transition shadow-2xs"
                              title="Delete Product"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    {Array.from({ length: prodPages }).map((_, i) => (
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
                      disabled={currentPage >= prodPages}
                      onClick={() => setCurrentPage(p => Math.min(prodPages, p + 1))}
                      className="px-2.5 py-1 border border-gray-300 rounded-xs disabled:opacity-40 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-4 py-1.5 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    ADD PRODUCT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              8. PRODUCT CREATE / EDIT (image_d9612613.png & image_07ddcd23.png)
              ========================================================================= */}
          {activeSubTab === 'productCreate' && (
            <div className="bg-white border border-gray-200 shadow-2xs rounded-none overflow-hidden">
              <div className="bg-[#0084bf] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
                <span>{editingProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</span>
              </div>

              <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
                {/* Row 1: Name & Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={e => setProdName(e.target.value)}
                      placeholder="e.g. Catblack Laptop Cooling Fan Stand"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Code</label>
                    <input
                      type="text"
                      required
                      value={prodCode}
                      onChange={e => setProdCode(e.target.value)}
                      placeholder="ABA223P"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white font-mono focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 2: Parent, Category, Sub-Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Parent (Optional)</label>
                    <select
                      value={prodParent}
                      onChange={e => setProdParent(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {parents.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      value={prodCategory}
                      onChange={e => setProdCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Sub-Category</label>
                    <select
                      value={prodSubCategory}
                      onChange={e => setProdSubCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {subCategories.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Brand, RAM, SSD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Brand</label>
                    <select
                      value={prodBrand}
                      onChange={e => setProdBrand(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {['HP', 'DELL', 'LENOVO', 'ACER', 'A4TECH', 'TECH DRIVE', 'MICROSOFT'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">RAM</label>
                    <select
                      value={prodRam}
                      onChange={e => setProdRam(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {['4 GB DDR4', '8 GB DDR4', '16 GB DDR4', '16 GB DDR5', '32 GB DDR5'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">SSD</label>
                    <select
                      value={prodSsd}
                      onChange={e => setProdSsd(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      {['128 GB M.2 NVMe', '256 GB M.2 NVMe', '512 GB M.2 NVMe', '1 TB M.2 NVMe'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Manufacturer, Unit, Purchase Scan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Manufacturer</label>
                    <select
                      value={prodManufacturer}
                      onChange={e => setProdManufacturer(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Foxconn Electronics">Foxconn Electronics</option>
                      <option value="Compal Broadband">Compal Broadband</option>
                      <option value="Quanta Computer">Quanta Computer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Unit</label>
                    <select
                      value={prodUnit}
                      onChange={e => setProdUnit(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Purchase Scan</label>
                    <select
                      value={prodPurchaseScan}
                      onChange={e => setProdPurchaseScan(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Barcode">Barcode</option>
                      <option value="IMEI / Serial">IMEI / Serial</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Country, Status, Minimum Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Country</label>
                    <select
                      value={prodCountry}
                      onChange={e => setProdCountry(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="China">China</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Status</label>
                    <select
                      value={prodStatus}
                      onChange={e => setProdStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Minimum Stock</label>
                    <input
                      type="number"
                      value={prodMinStock}
                      onChange={e => setProdMinStock(e.target.value)}
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 6: Certificate, Model No, Brand No */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Certificate</label>
                    <input
                      type="text"
                      value={prodCertificate}
                      onChange={e => setProdCertificate(e.target.value)}
                      placeholder="e.g. ISO:9901"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Model No</label>
                    <input
                      type="text"
                      value={prodModelNo}
                      onChange={e => setProdModelNo(e.target.value)}
                      placeholder="Model No"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Brand No</label>
                    <input
                      type="text"
                      value={prodBrandNo}
                      onChange={e => setProdBrandNo(e.target.value)}
                      placeholder="Brand No"
                      className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                    />
                  </div>
                </div>

                {/* Row 7: Cost, Price, Warranty Days, Barcode & Shopping Bag Widget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Cost (৳)</label>
                      <input
                        type="number"
                        value={prodCost}
                        onChange={e => setProdCost(e.target.value)}
                        className="w-full border border-gray-300 rounded-xs p-2 bg-white font-mono focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Warranty Days</label>
                      <input
                        type="number"
                        value={prodWarranty}
                        onChange={e => setProdWarranty(e.target.value)}
                        placeholder="365"
                        className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Price (৳)</label>
                      <input
                        type="number"
                        value={prodPrice}
                        onChange={e => setProdPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-xs p-2 bg-white font-mono focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Barcode (Optional)</label>
                      <input
                        type="text"
                        value={prodBarcode}
                        onChange={e => setProdBarcode(e.target.value)}
                        placeholder="Barcode (Optional)"
                        className="w-full border border-gray-300 rounded-xs p-2 bg-white font-mono focus:outline-none focus:border-[#0084bf]"
                      />
                    </div>
                  </div>

                  {/* Red Tech Drive Shopping Bag Widget matching image_d9612613.png */}
                  <div className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xs bg-gray-50/50">
                    <span className="text-gray-700 font-semibold mb-2 text-xs">Image Preview</span>
                    <div className="w-28 h-32 relative flex items-center justify-center mb-2">
                      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
                        {/* Bag Handles */}
                        <path d="M 35 35 C 35 15, 65 15, 65 35" fill="none" stroke="#a3a3a3" strokeWidth="4" />
                        {/* Bag Body */}
                        <path d="M 20 35 L 80 35 L 88 110 L 12 110 Z" fill="#c9302c" />
                        {/* Tech Drive Logo Letter A */}
                        <path d="M 50 55 L 35 95 L 65 95 Z" fill="white" />
                        <path d="M 50 68 L 42 90 L 58 90 Z" fill="#c9302c" />
                        <rect x="30" y="85" width="40" height="3" fill="white" />
                      </svg>
                    </div>
                    <label className="cursor-pointer bg-[#605ca8] hover:bg-[#504c96] text-white px-3 py-1 text-[11px] font-bold rounded-xs transition shadow-2xs">
                      Choose File
                      <input type="file" className="hidden" />
                    </label>
                    <span className="text-[10px] text-gray-400 mt-1">No file chosen</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={e => setProdDesc(e.target.value)}
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded-xs p-2 bg-white focus:outline-none focus:border-[#0084bf]"
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="bg-[#605ca8] hover:bg-[#504c96] text-white px-5 py-2 rounded-xs font-bold uppercase tracking-wide transition shadow-2xs"
                  >
                    {editingProduct ? 'UPDATE' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('productList')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-xs font-semibold uppercase tracking-wide transition"
                  >
                    CLOSE
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right History Widget matching image_ee555d49.png & image_d9612613.png */}
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
                23 Oct 2026
              </span>
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Tech Drive <span className="text-[10px] text-gray-400 font-normal">02:46:45 AM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">Product has been updated</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2">ThinkPad T495 AMD Ryzen 5 PRO 3500U | 8GB RAM | 256GB SSD</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start space-x-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] flex-shrink-0">
                  <i className="fa fa-chevron-right text-[8px]"></i>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Tech Drive <span className="text-[10px] text-gray-400 font-normal">02:44:50 AM</span></div>
                  <p className="text-[11px] text-sky-700 mt-0.5">New product has been created</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2">HP EliteBook 845 G9 AMD Ryzen 7 PRO 6850U</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
