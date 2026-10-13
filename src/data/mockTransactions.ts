export interface ERPTransactionItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  sku?: string;
}

export interface ERPTransactionRecord {
  id: string;
  type: 'sales_invoice' | 'purchase_order' | 'purchase_invoice';
  refNo: string;
  dateTime: string;
  partyName: string;
  partyPhone?: string;
  partyType: 'Customer' | 'Supplier';
  itemsCount: number;
  itemsList: ERPTransactionItem[];
  grossAmount: number;
  discountAmount?: number;
  discountPercent?: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount?: number;
  dueAmount?: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Completed' | 'Pending';
  paymentMethod: string;
  notes?: string;
  createdBy?: string;
  relatedSku?: string;
  relatedProductId?: string;
}

export const INITIAL_SALES_INVOICES: ERPTransactionRecord[] = [
  {
    id: 'rec-sal-0015',
    type: 'sales_invoice',
    refNo: 'SAL0015',
    dateTime: '03/10/2026, 10:16 pm',
    partyName: 'MD.Shamim',
    partyPhone: '+880 1712-987654',
    partyType: 'Customer',
    relatedSku: 'MS-SP7-02',
    itemsCount: 1,
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', qty: 1, unitPrice: 33810, total: 33810, sku: 'MS-SP7-02' },
    ],
    grossAmount: 33810,
    taxAmount: 1690,
    grandTotal: 35500,
    paidAmount: 35500,
    dueAmount: 0,
    status: 'Completed',
    paymentMethod: 'Cash',
    notes: 'In-store sales invoice',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-sal-0012',
    type: 'sales_invoice',
    refNo: 'SAL0012',
    dateTime: '03/10/2026, 06:41 pm',
    partyName: 'Test',
    partyPhone: '+880 1819-112233',
    partyType: 'Customer',
    relatedSku: 'SAM-NVME-1TB',
    itemsCount: 2,
    itemsList: [
      { name: 'Samsung 980 Pro 1TB NVMe SSD', qty: 2, unitPrice: 13571, total: 27142, sku: 'SAM-NVME-1TB' },
    ],
    grossAmount: 27142,
    taxAmount: 1358,
    grandTotal: 28500,
    paidAmount: 28500,
    dueAmount: 0,
    status: 'Completed',
    paymentMethod: 'Card (City Bank)',
    notes: 'POS checkout verified',
    createdBy: 'Sadia Rahman',
  },
  {
    id: 'rec-sal-0011',
    type: 'sales_invoice',
    refNo: 'SAL0011',
    dateTime: '03/10/2026, 05:04 pm',
    partyName: 'waking customer',
    partyPhone: 'N/A',
    partyType: 'Customer',
    relatedSku: 'FURY-DDR4-16G',
    itemsCount: 2,
    itemsList: [
      { name: '16GB DDR4 3200MHz RAM Kit', qty: 2, unitPrice: 13571, total: 27142, sku: 'FURY-DDR4-16G' },
    ],
    grossAmount: 27142,
    discountAmount: 500,
    taxAmount: 1358,
    grandTotal: 28000,
    paidAmount: 28500,
    dueAmount: 0,
    status: 'Completed',
    paymentMethod: 'bKash / MFS',
    notes: 'Customer discount ৳500 applied',
    createdBy: 'Rahim',
  },
  {
    id: 'rec-sinv-01',
    type: 'sales_invoice',
    refNo: 'INV-2026-9048',
    dateTime: '2026-10-04 11:20',
    partyName: 'Tanvir Ahmed',
    partyPhone: '+880 1711-234567',
    partyType: 'Customer',
    relatedSku: 'MS-SL4-01',
    relatedProductId: 'prod-1',
    itemsCount: 2,
    itemsList: [
      { name: 'Surface Laptop 4 (Core i7, 16GB)', qty: 1, unitPrice: 65000, total: 65000, sku: 'MS-SL4-01' },
      { name: 'Logitech MX Master 3S Mouse', qty: 1, unitPrice: 7000, total: 7000, sku: 'LOG-MX3S-01' },
    ],
    grossAmount: 72000,
    taxAmount: 3600,
    grandTotal: 75600,
    status: 'Paid',
    paymentMethod: 'Cash',
    notes: 'In-store counter checkout. 30-day warranty slip attached.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-sinv-02',
    type: 'sales_invoice',
    refNo: 'INV-2026-9047',
    dateTime: '2026-10-04 10:45',
    partyName: 'Walk-in Customer',
    partyPhone: 'N/A',
    partyType: 'Customer',
    relatedSku: 'FURY-DDR4-16G',
    relatedProductId: 'prod-7',
    itemsCount: 1,
    itemsList: [
      { name: '16GB DDR4 3200MHz RAM Kit', qty: 1, unitPrice: 11500, total: 11500, sku: 'FURY-DDR4-16G' },
    ],
    grossAmount: 11500,
    taxAmount: 575,
    grandTotal: 12075,
    status: 'Paid',
    paymentMethod: 'bKash / MFS',
    notes: 'Paid via bKash Merchant TrxID #BK882190',
    createdBy: 'Sadia Rahman',
  },
  {
    id: 'rec-sinv-03',
    type: 'sales_invoice',
    refNo: 'INV-2026-9046',
    dateTime: '2026-10-03 17:10',
    partyName: 'Apex Technologies Ltd',
    partyPhone: '+880 1819-876543',
    partyType: 'Customer',
    relatedSku: 'MS-SP7-02',
    relatedProductId: 'prod-2',
    itemsCount: 4,
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', qty: 2, unitPrice: 45000, total: 90000, sku: 'MS-SP7-02' },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', qty: 2, unitPrice: 77500, total: 155000, sku: 'SAM-NVME-1TB' },
    ],
    grossAmount: 245000,
    taxAmount: 12250,
    grandTotal: 257250,
    status: 'Partial',
    paymentMethod: 'Bank Transfer',
    notes: 'Corporate delivery PO #APX-441. Partial paid ৳150,000. Balance due: ৳107,250.',
    createdBy: 'Rahim',
  },
  {
    id: 'rec-sinv-04',
    type: 'sales_invoice',
    refNo: 'INV-2026-9045',
    dateTime: '2026-10-03 14:30',
    partyName: 'Prime IT Solutions',
    partyPhone: '+880 1912-345678',
    partyType: 'Customer',
    relatedSku: 'MS-SL4-01',
    relatedProductId: 'prod-1',
    itemsCount: 1,
    itemsList: [
      { name: 'Surface Laptop 4 (Core i7, 16GB)', qty: 1, unitPrice: 65000, total: 65000, sku: 'MS-SL4-01' },
    ],
    grossAmount: 65000,
    taxAmount: 3250,
    grandTotal: 68250,
    status: 'Paid',
    paymentMethod: 'Card (City Bank)',
    notes: 'POS Card Swipe Auth #99104.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-sinv-05',
    type: 'sales_invoice',
    refNo: 'INV-2026-9044',
    dateTime: '2026-10-02 16:50',
    partyName: 'Nusrat Jahan',
    partyPhone: '+880 1678-901234',
    partyType: 'Customer',
    relatedSku: 'MS-SLG-04',
    relatedProductId: 'prod-4',
    itemsCount: 1,
    itemsList: [
      { name: 'Microsoft Surface Laptop Go', qty: 1, unitPrice: 65000, total: 65000, sku: 'MS-SLG-04' },
    ],
    grossAmount: 65000,
    taxAmount: 3250,
    grandTotal: 68250,
    status: 'Paid',
    paymentMethod: 'Cash',
    notes: 'Regular retail customer. Standard warranty card issued.',
    createdBy: 'Nusrat Jahan',
  },
  {
    id: 'rec-sinv-06',
    type: 'sales_invoice',
    refNo: 'INV-2026-9043',
    dateTime: '2026-10-01 12:15',
    partyName: 'Vertex Technologies Ltd',
    partyPhone: '+880 1713-998877',
    partyType: 'Customer',
    relatedSku: 'MS-SP4-03',
    relatedProductId: 'prod-3',
    itemsCount: 2,
    itemsList: [
      { name: 'Surface Book 3 Performance Edition', qty: 1, unitPrice: 120000, total: 120000, sku: 'MS-SP4-03' },
      { name: 'Microsoft Docking Station Hub', qty: 1, unitPrice: 5000, total: 5000, sku: 'MS-DOCK-01' },
    ],
    grossAmount: 125000,
    taxAmount: 6250,
    grandTotal: 131250,
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'B2B Client account ledger settlement completed.',
    createdBy: 'Rahim',
  },
  {
    id: 'rec-sinv-07',
    type: 'sales_invoice',
    refNo: 'INV-2026-9042',
    dateTime: '2026-09-30 15:40',
    partyName: 'Dhaka Tech Solutions Ltd',
    partyPhone: '+880 1712-445566',
    partyType: 'Customer',
    relatedSku: 'DELL-XPS13-05',
    relatedProductId: 'prod-5',
    itemsCount: 1,
    itemsList: [
      { name: 'Dell XPS 13 Plus 9320 (OLED Edition)', qty: 1, unitPrice: 185000, total: 185000, sku: 'DELL-XPS13-05' },
    ],
    grossAmount: 185000,
    taxAmount: 9250,
    grandTotal: 194250,
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Corporate executive purchase invoice.',
    createdBy: 'Rahim',
  },
  {
    id: 'rec-sinv-08',
    type: 'sales_invoice',
    refNo: 'INV-2026-9041',
    dateTime: '2026-09-29 11:15',
    partyName: 'Engr. Mahfuzul Alam',
    partyPhone: '+880 1817-223344',
    partyType: 'Customer',
    relatedSku: 'SAM-NVME-1TB',
    relatedProductId: 'prod-6',
    itemsCount: 2,
    itemsList: [
      { name: 'Samsung 980 Pro 1TB NVMe SSD', qty: 2, unitPrice: 13500, total: 27000, sku: 'SAM-NVME-1TB' },
      { name: 'Hardware Thermal Tuning & Installation Service', qty: 1, unitPrice: 3000, total: 3000 },
    ],
    grossAmount: 30000,
    taxAmount: 1500,
    grandTotal: 31500,
    status: 'Paid',
    paymentMethod: 'bKash / MFS',
    notes: 'Workshop repair parts and SSD upgrade.',
    createdBy: 'Kamrul Hasan',
  },
  {
    id: 'rec-sinv-09',
    type: 'sales_invoice',
    refNo: 'INV-2026-9040',
    dateTime: '2026-09-28 16:10',
    partyName: 'Shohel Rana',
    partyPhone: '+880 1911-332211',
    partyType: 'Customer',
    relatedSku: 'MS-SL4-01',
    relatedProductId: 'prod-1',
    itemsCount: 1,
    itemsList: [
      { name: 'Microsoft Laptop Surface Laptop 4', qty: 1, unitPrice: 65000, total: 65000, sku: 'MS-SL4-01' },
    ],
    grossAmount: 65000,
    taxAmount: 3250,
    grandTotal: 68250,
    status: 'Paid',
    paymentMethod: 'Cash',
    notes: 'Walk-in cash counter sale with invoice voucher.',
    createdBy: 'Sadia Rahman',
  },
];

export const INITIAL_PURCHASE_ORDERS_RECORDS: ERPTransactionRecord[] = [
  {
    id: 'rec-po-01',
    type: 'purchase_order',
    refNo: 'PO-2026-0042',
    dateTime: '2026-09-28 14:00',
    partyName: 'Global Hardware Imports',
    partyPhone: '+880 1711-002233',
    partyType: 'Supplier',
    relatedSku: 'MS-SL4-01',
    relatedProductId: 'prod-1',
    itemsCount: 2,
    itemsList: [
      { name: 'Surface Laptop 4 (Wholesale Pack)', qty: 5, unitPrice: 112000, total: 560000, sku: 'MS-SL4-01' },
      { name: 'Kingston Fury DDR4 RAM 16GB', qty: 10, unitPrice: 5800, total: 58000, sku: 'FURY-DDR4-16G' },
    ],
    grossAmount: 618000,
    taxAmount: 30900,
    grandTotal: 648900,
    status: 'Pending',
    paymentMethod: 'Cash on Delivery',
    notes: 'Urgent restocking for corporate tender. Awaiting shipping batch.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-po-02',
    type: 'purchase_order',
    refNo: 'PO-2026-0038',
    dateTime: '2026-09-20 11:30',
    partyName: 'Smart Tech BD',
    partyPhone: '+880 1819-334455',
    partyType: 'Supplier',
    relatedSku: 'SAM-NVME-1TB',
    relatedProductId: 'prod-6',
    itemsCount: 2,
    itemsList: [
      { name: 'Intel Core i7-12700K Processors', qty: 8, unitPrice: 34000, total: 272000 },
      { name: 'Crucial P3 1TB NVMe SSD', qty: 10, unitPrice: 4800, total: 48000, sku: 'SAM-NVME-1TB' },
    ],
    grossAmount: 320000,
    taxAmount: 16000,
    grandTotal: 336000,
    status: 'Partial',
    paymentMethod: 'Bank Transfer',
    notes: 'Partial delivery received at central warehouse. 8 items remaining.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-po-03',
    type: 'purchase_order',
    refNo: 'PO-2026-0035',
    dateTime: '2026-09-15 10:15',
    partyName: 'Tech Valley Distribution',
    partyPhone: '+880 1912-778899',
    partyType: 'Supplier',
    relatedSku: 'DELL-XPS13-05',
    relatedProductId: 'prod-5',
    itemsCount: 2,
    itemsList: [
      { name: 'Dell Latitude 5420 Units', qty: 3, unitPrice: 58000, total: 174000, sku: 'DELL-XPS13-05' },
      { name: 'Logitech Wireless Keyboard Kits', qty: 10, unitPrice: 500, total: 5000 },
    ],
    grossAmount: 179000,
    taxAmount: 6000,
    grandTotal: 185000,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    notes: 'Goods fully received and added to inventory stock.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-po-04',
    type: 'purchase_order',
    refNo: 'PO-2026-0031',
    dateTime: '2026-09-10 16:40',
    partyName: 'Star Components Ltd',
    partyPhone: '+880 1678-556677',
    partyType: 'Supplier',
    relatedSku: 'MS-SP7-02',
    relatedProductId: 'prod-2',
    itemsCount: 1,
    itemsList: [
      { name: 'Surface Pro 7 Wholesale Pack', qty: 5, unitPrice: 38000, total: 190000, sku: 'MS-SP7-02' },
    ],
    grossAmount: 466666,
    taxAmount: 23334,
    grandTotal: 490000,
    status: 'Completed',
    paymentMethod: 'Cash',
    notes: 'Direct supplier fulfillment completed.',
    createdBy: 'Forhad',
  },
];

export const INITIAL_PURCHASE_INVOICES_RECORDS: ERPTransactionRecord[] = [
  {
    id: 'rec-pinv-01',
    type: 'purchase_invoice',
    refNo: 'PINV-2026-1049',
    dateTime: '2026-10-02 15:30',
    partyName: 'Global Hardware Imports',
    partyPhone: '+880 1711-002233',
    partyType: 'Supplier',
    relatedSku: 'MS-SL4-01',
    relatedProductId: 'prod-1',
    itemsCount: 2,
    itemsList: [
      { name: 'Surface Laptop 4 (Grade A Core i7)', qty: 4, unitPrice: 112000, total: 448000, sku: 'MS-SL4-01' },
      { name: 'Kingston 512GB NVMe SSDs', qty: 5, unitPrice: 4000, total: 20000, sku: 'SAM-NVME-1TB' },
    ],
    grossAmount: 468000,
    taxAmount: 23400,
    grandTotal: 491400,
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Direct purchase invoice. Physical inventory updated immediately.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-pinv-02',
    type: 'purchase_invoice',
    refNo: 'PINV-2026-1048',
    dateTime: '2026-10-01 11:00',
    partyName: 'Smart Tech BD',
    partyPhone: '+880 1819-334455',
    partyType: 'Supplier',
    relatedSku: 'MS-SLG-04',
    relatedProductId: 'prod-4',
    itemsCount: 1,
    itemsList: [
      { name: 'Surface Laptop Go Direct Batch', qty: 5, unitPrice: 30000, total: 150000, sku: 'MS-SLG-04' },
    ],
    grossAmount: 180000,
    taxAmount: 9000,
    grandTotal: 189000,
    status: 'Paid',
    paymentMethod: 'Cash',
    notes: 'Paid cash at counter receipt.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-pinv-03',
    type: 'purchase_invoice',
    refNo: 'PINV-2026-1047',
    dateTime: '2026-09-29 16:20',
    partyName: 'Tech Valley Distribution',
    partyPhone: '+880 1912-778899',
    partyType: 'Supplier',
    relatedSku: 'LOG-MX3S-01',
    itemsCount: 2,
    itemsList: [
      { name: 'Logitech Wireless Mice MX', qty: 8, unitPrice: 9500, total: 76000, sku: 'LOG-MX3S-01' },
      { name: 'Mechanical RGB Keyboards', qty: 4, unitPrice: 4500, total: 18000 },
    ],
    grossAmount: 94000,
    taxAmount: 4700,
    grandTotal: 98700,
    status: 'Paid',
    paymentMethod: 'bKash / MFS',
    notes: 'Immediate payment completed via MFS.',
    createdBy: 'Forhad',
  },
  {
    id: 'rec-pinv-04',
    type: 'purchase_invoice',
    refNo: 'PINV-2026-1046',
    dateTime: '2026-09-27 13:40',
    partyName: 'Star Components Ltd',
    partyPhone: '+880 1678-556677',
    partyType: 'Supplier',
    relatedSku: 'SAM-NVME-1TB',
    relatedProductId: 'prod-6',
    itemsCount: 1,
    itemsList: [
      { name: 'Samsung 980 Pro 2TB NVMe SSD', qty: 18, unitPrice: 13000, total: 234000, sku: 'SAM-NVME-1TB' },
    ],
    grossAmount: 234000,
    taxAmount: 11700,
    grandTotal: 245700,
    status: 'Partial',
    paymentMethod: 'Credit / Due',
    notes: 'Supplier terms: 15-day credit payable by 12-Oct-2026.',
    createdBy: 'Forhad',
  },
];

export function getStoredSalesInvoices(): ERPTransactionRecord[] {
  const saved = localStorage.getItem('erp_sales_invoices_v1');
  if (saved) {
    try {
      const parsed: ERPTransactionRecord[] = JSON.parse(saved);
      const hasSal15 = parsed.some((r) => r.refNo === 'SAL0015');
      if (!hasSal15) {
        const merged = [...INITIAL_SALES_INVOICES.slice(0, 3), ...parsed];
        localStorage.setItem('erp_sales_invoices_v1', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      // Fallback
    }
  }
  return INITIAL_SALES_INVOICES;
}

export function saveStoredSalesInvoices(records: ERPTransactionRecord[]): void {
  localStorage.setItem('erp_sales_invoices_v1', JSON.stringify(records));
}

export function getStoredPurchaseOrders(): ERPTransactionRecord[] {
  const saved = localStorage.getItem('erp_purchase_orders_v1');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_PURCHASE_ORDERS_RECORDS;
}

export function saveStoredPurchaseOrders(records: ERPTransactionRecord[]): void {
  localStorage.setItem('erp_purchase_orders_v1', JSON.stringify(records));
}

export function getStoredPurchaseInvoices(): ERPTransactionRecord[] {
  const saved = localStorage.getItem('erp_purchase_invoices_v1');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_PURCHASE_INVOICES_RECORDS;
}

export function saveStoredPurchaseInvoices(records: ERPTransactionRecord[]): void {
  localStorage.setItem('erp_purchase_invoices_v1', JSON.stringify(records));
}

/**
 * Staff Sales Profile for Employee-Wise Reporting
 */
export interface StaffSalesProfile {
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  commissionRate: number; // e.g. 2.0%
}

export const STANDARD_STAFF_MEMBERS: StaffSalesProfile[] = [
  {
    employeeCode: 'EMP-001',
    name: 'Rahim',
    designation: 'Senior Sales Executive',
    department: 'Sales & Operations',
    phone: '01711223344',
    commissionRate: 2.0,
  },
  {
    employeeCode: 'EMP-000',
    name: 'Forhad',
    designation: 'Master Cashier & Admin Lead',
    department: 'Operations & Management',
    phone: '01700123456',
    commissionRate: 2.0,
  },
  {
    employeeCode: 'EMP-003',
    name: 'Sadia Rahman',
    designation: 'POS Counter Cashier',
    department: 'Finance & Counter',
    phone: '01933445566',
    commissionRate: 1.5,
  },
  {
    employeeCode: 'EMP-002',
    name: 'Kamrul Hasan',
    designation: 'Chief Hardware Technician',
    department: 'Service & RMA',
    phone: '01822334455',
    commissionRate: 2.5,
  },
  {
    employeeCode: 'EMP-004',
    name: 'Nusrat Jahan',
    designation: 'Junior Sales Associate',
    department: 'Retail Counter',
    phone: '01678901234',
    commissionRate: 1.5,
  },
];

export interface EmployeeSalesSummary {
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  commissionRate: number;
  invoicesCount: number;
  unitsCount: number;
  grossAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  commissionEarned: number;
  invoices: ERPTransactionRecord[];
}

export function computeEmployeeWiseSaleSummary(
  salesInvoices: ERPTransactionRecord[],
  staffList: StaffSalesProfile[] = STANDARD_STAFF_MEMBERS
): EmployeeSalesSummary[] {
  return staffList.map((staff) => {
    const matchingInvoices = salesInvoices.filter((inv) => {
      const creator = (inv.createdBy || '').toLowerCase().trim();
      const staffName = staff.name.toLowerCase().trim();
      const staffCode = staff.employeeCode.toLowerCase().trim();
      return (
        creator.includes(staffName) ||
        staffName.includes(creator) ||
        creator === staffCode ||
        (creator === 'cashier 1' && staff.employeeCode === 'EMP-003') ||
        (creator === 'cashier 2' && staff.employeeCode === 'EMP-004')
      );
    });

    const invoicesCount = matchingInvoices.length;
    const unitsCount = matchingInvoices.reduce((acc, inv) => {
      return acc + (inv.itemsList?.reduce((s, it) => s + (it.qty || 1), 0) || inv.itemsCount || 1);
    }, 0);
    const grossAmount = matchingInvoices.reduce((acc, inv) => acc + (inv.grossAmount || 0), 0);
    const taxAmount = matchingInvoices.reduce((acc, inv) => acc + (inv.taxAmount || 0), 0);
    const grandTotal = matchingInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const paidAmount = matchingInvoices.reduce((acc, inv) => {
      if (inv.status === 'Paid' || inv.status === 'Completed') return acc + inv.grandTotal;
      if (inv.status === 'Partial') return acc + Math.round(inv.grandTotal * 0.6);
      return acc;
    }, 0);
    const dueAmount = grandTotal - paidAmount;
    const commissionEarned = Math.round((grandTotal * staff.commissionRate) / 100);

    return {
      employeeCode: staff.employeeCode,
      name: staff.name,
      designation: staff.designation,
      department: staff.department,
      commissionRate: staff.commissionRate,
      invoicesCount,
      unitsCount,
      grossAmount,
      taxAmount,
      grandTotal,
      paidAmount,
      dueAmount,
      commissionEarned,
      invoices: matchingInvoices,
    };
  });
}

/**
 * Filter records related to a product by sku, id, or item name
 */
export function filterRecordsForProduct(
  records: ERPTransactionRecord[],
  product: { id: string; sku: string; name: string }
): ERPTransactionRecord[] {
  const querySku = product.sku.toLowerCase();
  const queryName = product.name.toLowerCase();
  const queryId = product.id.toLowerCase();

  return records.filter((rec) => {
    if (rec.relatedProductId && rec.relatedProductId.toLowerCase() === queryId) return true;
    if (rec.relatedSku && rec.relatedSku.toLowerCase() === querySku) return true;
    return rec.itemsList.some(
      (item) =>
        (item.sku && item.sku.toLowerCase() === querySku) ||
        item.name.toLowerCase().includes(queryName) ||
        queryName.includes(item.name.toLowerCase())
    );
  });
}
