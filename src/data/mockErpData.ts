export interface SalesReturnRecord {
  id: string;
  returnNo: string;
  invoiceRef: string;
  date: string;
  customerName: string;
  customerPhone: string;
  itemsList: { name: string; sku: string; qty: number; unitPrice: number; refundTotal: number }[];
  totalRefund: number;
  restocked: boolean;
  reason: string;
  refundMethod: 'Cash' | 'Credit Note' | 'Bank Transfer' | 'MFS';
  status: 'Approved' | 'Pending' | 'Completed';
  createdBy: string;
}

export interface QuotationRecord {
  id: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  customerName: string;
  companyName?: string;
  customerPhone: string;
  customerEmail?: string;
  itemsList: { name: string; sku: string; qty: number; unitPrice: number; total: number }[];
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  notes: string;
  createdBy: string;
}

export interface SalesOrderRecord {
  id: string;
  orderNo: string;
  date: string;
  deliveryDate: string;
  customerName: string;
  companyName?: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsList: { name: string; sku: string; qty: number; unitPrice: number; total: number }[];
  grandTotal: number;
  advancePaid: number;
  dueAmount: number;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  paymentTerms: string;
  createdBy: string;
}

export interface DeliveryChallanRecord {
  id: string;
  challanNo: string;
  orderOrInvoiceRef: string;
  date: string;
  customerName: string;
  deliveryAddress: string;
  contactPhone: string;
  vehicleOrCourier: string;
  driverOrTracking: string;
  itemsList: { name: string; sku: string; qty: number; unit: string }[];
  status: 'Dispatched' | 'Delivered' | 'Pending' | 'Returned';
  dispatchedBy: string;
  receivedBySignature?: string;
}

export interface PurchaseBillRecord {
  id: string;
  billNo: string;
  date: string;
  supplierName: string;
  supplierPhone: string;
  supplierInvoiceRef: string;
  warehouse: string;
  itemsList: { name: string; sku: string; qty: number; unitCost: number; total: number }[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: 'Paid' | 'Partial' | 'Due';
  createdBy: string;
  notes?: string;
}

export interface PurchaseReturnRecord {
  id: string;
  returnNo: string;
  billRef: string;
  date: string;
  supplierName: string;
  supplierPhone: string;
  itemsList: { name: string; sku: string; qty: number; unitCost: number; totalRefund: number }[];
  totalRefund: number;
  reason: string;
  debitNoteRef: string;
  status: 'Approved' | 'Settled' | 'Pending';
  createdBy: string;
}

export interface GoodsReceivedRecord {
  id: string;
  grnNo: string;
  poRef: string;
  supplierChallanNo: string;
  date: string;
  supplierName: string;
  warehouse: string;
  itemsReceived: { name: string; sku: string; qtyOrdered: number; qtyReceived: number; status: 'Accepted' | 'Shortage' | 'Damaged' }[];
  inspector: string;
  status: 'Verified' | 'Partial' | 'Pending Inspection';
  remarks?: string;
}

export interface StockMovementRecord {
  id: string;
  refNo: string;
  date: string;
  type: 'IN' | 'OUT';
  warehouse: string;
  productName: string;
  sku: string;
  qty: number;
  unit: string;
  reason: 'Purchase Inward' | 'Customer Return' | 'Sales Dispatch' | 'Defective Discard' | 'Internal Transfer' | 'Sample';
  operator: string;
  status: 'Verified' | 'Draft';
}

export interface StockTransferRecord {
  id: string;
  transferNo: string;
  date: string;
  fromWarehouse: string;
  toWarehouse: string;
  itemsList: { name: string; sku: string; qty: number; unit: string }[];
  dispatchedBy: string;
  receivedBy: string;
  status: 'In Transit' | 'Completed' | 'Pending';
  vehicleRef?: string;
}

export interface StockAdjustmentRecord {
  id: string;
  adjNo: string;
  date: string;
  warehouse: string;
  productName: string;
  sku: string;
  systemQty: number;
  physicalQty: number;
  diffQty: number;
  reason: 'Shrinkage' | 'Damage / Defect' | 'Physical Audit Variance' | 'Expired Batch';
  adjustedBy: string;
  approvedBy: string;
  status: 'Reconciled' | 'Pending Approval';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day';
  overtimeHours: number;
  notes?: string;
}

// -------------------------------------------------------------
// REALISTIC SAMPLE DATA
// -------------------------------------------------------------

export const INITIAL_SALES_RETURNS: SalesReturnRecord[] = [
  {
    id: 'sr-001',
    returnNo: 'SR-2026-0012',
    invoiceRef: 'SAL0015',
    date: '2026-10-04',
    customerName: 'MD. Shamim',
    customerPhone: '+880 1712-987654',
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qty: 1, unitPrice: 35500, refundTotal: 35500 }
    ],
    totalRefund: 35500,
    restocked: true,
    reason: 'Customer upgraded to Surface Pro 9 on same day',
    refundMethod: 'Credit Note',
    status: 'Completed',
    createdBy: 'Forhad',
  },
  {
    id: 'sr-002',
    returnNo: 'SR-2026-0011',
    invoiceRef: 'SAL0011',
    date: '2026-10-02',
    customerName: 'Walking Customer',
    customerPhone: '01700-112233',
    itemsList: [
      { name: '16GB DDR4 3200MHz RAM Kit', sku: 'FURY-DDR4-16G', qty: 1, unitPrice: 4200, refundTotal: 4200 }
    ],
    totalRefund: 4200,
    restocked: true,
    reason: 'Motherboard incompatibility (DDR5 required)',
    refundMethod: 'Cash',
    status: 'Completed',
    createdBy: 'Sadia Rahman',
  },
];

export const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'qt-001',
    quoteNo: 'QT-2026-0045',
    date: '2026-10-05',
    validUntil: '2026-10-20',
    customerName: 'Vertex Technologies Ltd',
    companyName: 'Vertex Technologies Ltd',
    customerPhone: '+880 1711-234567',
    customerEmail: 'procurement@vertexbd.com',
    itemsList: [
      { name: 'ThinkPad T14 Gen 4 (i7, 16GB, 512GB)', sku: 'TP-T14-G4', qty: 5, unitPrice: 95000, total: 475000 },
      { name: 'Lenovo ThinkPad USB-C Dock Gen 2', sku: 'ACC-DOCK-01', qty: 5, unitPrice: 18500, total: 92500 },
    ],
    subtotal: 567500,
    discount: 25000,
    vat: 27125,
    grandTotal: 569625,
    status: 'Sent',
    notes: 'Price includes 3-year onsite hardware warranty. Delivery within 3 business days.',
    createdBy: 'Forhad',
  },
  {
    id: 'qt-002',
    quoteNo: 'QT-2026-0046',
    date: '2026-10-06',
    validUntil: '2026-10-25',
    customerName: 'Apex Data Systems Ltd',
    companyName: 'Apex Data Systems Ltd',
    customerPhone: '+880 1819-876543',
    customerEmail: 'it.admin@apexdata.com',
    itemsList: [
      { name: 'Dell Latitude 5540 Business Laptop', sku: 'DELL-LAT-5540', qty: 3, unitPrice: 88000, total: 264000 },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 6, unitPrice: 14000, total: 84000 },
    ],
    subtotal: 348000,
    discount: 10000,
    vat: 16900,
    grandTotal: 354900,
    status: 'Accepted',
    notes: 'Approved by Managing Director. Pending purchase order issue.',
    createdBy: 'Arif Mahmud',
  },
];

export const INITIAL_SALES_ORDERS: SalesOrderRecord[] = [
  {
    id: 'so-001',
    orderNo: 'SO-2026-0108',
    date: '2026-10-06',
    deliveryDate: '2026-10-10',
    customerName: 'Apex Data Systems Ltd',
    companyName: 'Apex Data Systems Ltd',
    customerPhone: '+880 1819-876543',
    deliveryAddress: 'Floor 7, Bilquis Tower, Gulshan-2, Dhaka',
    itemsList: [
      { name: 'Dell Latitude 5540 Business Laptop', sku: 'DELL-LAT-5540', qty: 3, unitPrice: 88000, total: 264000 },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 6, unitPrice: 14000, total: 84000 },
    ],
    grandTotal: 354900,
    advancePaid: 150000,
    dueAmount: 204900,
    status: 'Processing',
    paymentTerms: '50% Advance, Balance on Delivery Challan',
    createdBy: 'Forhad',
  },
  {
    id: 'so-002',
    orderNo: 'SO-2026-0105',
    date: '2026-10-03',
    deliveryDate: '2026-10-05',
    customerName: 'Mohammad Forhad',
    customerPhone: '01712-345678',
    deliveryAddress: 'House 14, Road 7, Dhanmondi, Dhaka',
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qty: 1, unitPrice: 35500, total: 35500 },
    ],
    grandTotal: 35500,
    advancePaid: 35500,
    dueAmount: 0,
    status: 'Delivered',
    paymentTerms: 'Paid in Full via bKash',
    createdBy: 'Sadia Rahman',
  },
];

export const INITIAL_DELIVERY_CHALLANS: DeliveryChallanRecord[] = [
  {
    id: 'ch-001',
    challanNo: 'CH-2026-0312',
    orderOrInvoiceRef: 'SO-2026-0105',
    date: '2026-10-05',
    customerName: 'Mohammad Forhad',
    deliveryAddress: 'House 14, Road 7, Dhanmondi, Dhaka',
    contactPhone: '01712-345678',
    vehicleOrCourier: 'Pathao Parcel Logistics',
    driverOrTracking: 'TRACK-PTH-88912',
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qty: 1, unit: 'Unit' }
    ],
    status: 'Delivered',
    dispatchedBy: 'Kamrul Hasan',
    receivedBySignature: 'M. Forhad (Customer Signature on file)',
  },
  {
    id: 'ch-002',
    challanNo: 'CH-2026-0313',
    orderOrInvoiceRef: 'SO-2026-0108',
    date: '2026-10-08',
    customerName: 'Apex Data Systems Ltd',
    deliveryAddress: 'Floor 7, Bilquis Tower, Gulshan-2, Dhaka',
    contactPhone: '+880 1819-876543',
    vehicleOrCourier: 'Company Delivery Van (Dhaka Metro-Ga 11-2091)',
    driverOrTracking: 'Driver: Rafiqul Islam (01711-554433)',
    itemsList: [
      { name: 'Dell Latitude 5540 Business Laptop', sku: 'DELL-LAT-5540', qty: 3, unit: 'Unit' },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 6, unit: 'Pcs' },
    ],
    status: 'Dispatched',
    dispatchedBy: 'Kamrul Hasan',
  },
];

export const INITIAL_PURCHASE_BILLS: PurchaseBillRecord[] = [
  {
    id: 'pb-001',
    billNo: 'PB-2026-0019',
    date: '2026-10-02',
    supplierName: 'Global Tech Distribution Ltd',
    supplierPhone: '+880 1711-445566',
    supplierInvoiceRef: 'GTD-INV-9901',
    warehouse: 'Main Headquarters & Showroom',
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qty: 10, unitCost: 28000, total: 280000 },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 20, unitCost: 11000, total: 220000 },
    ],
    subtotal: 500000,
    taxAmount: 25000,
    grandTotal: 525000,
    paidAmount: 300000,
    dueAmount: 225000,
    paymentMethod: 'Bank Wire (Brac Bank)',
    status: 'Partial',
    createdBy: 'Forhad',
    notes: 'Official import shipment batch #29. Balance due in 15 days.',
  },
  {
    id: 'pb-002',
    billNo: 'PB-2026-0020',
    date: '2026-10-04',
    supplierName: 'Smart Technologies BD Ltd',
    supplierPhone: '+880 1713-223344',
    supplierInvoiceRef: 'STBD-2026-8812',
    warehouse: 'Main Headquarters & Showroom',
    itemsList: [
      { name: '16GB DDR4 3200MHz RAM Kit', sku: 'FURY-DDR4-16G', qty: 30, unitCost: 3500, total: 105000 },
    ],
    subtotal: 105000,
    taxAmount: 5250,
    grandTotal: 110250,
    paidAmount: 110250,
    dueAmount: 0,
    paymentMethod: 'Cash Drawer',
    status: 'Paid',
    createdBy: 'Arif Mahmud',
    notes: 'Counter delivery paid in full upon arrival.',
  },
  {
    id: 'pb-003',
    billNo: 'PB-2026-0021',
    date: '2026-10-07',
    supplierName: 'Flora Limited BD',
    supplierPhone: '+880 1819-334455',
    supplierInvoiceRef: 'FLORA-7721',
    warehouse: 'Central Logistics Warehouse',
    itemsList: [
      { name: 'ThinkPad T14 Gen 4 (i7, 16GB, 512GB)', sku: 'TP-T14-G4', qty: 8, unitCost: 82000, total: 656000 },
    ],
    subtotal: 656000,
    taxAmount: 32800,
    grandTotal: 688800,
    paidAmount: 0,
    dueAmount: 688800,
    paymentMethod: 'Account Payable Credit',
    status: 'Due',
    createdBy: 'Forhad',
    notes: 'Corporate delivery on Net 30 Credit Terms.',
  },
];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturnRecord[] = [
  {
    id: 'pr-001',
    returnNo: 'PR-2026-0008',
    billRef: 'PB-2026-0019',
    date: '2026-10-04',
    supplierName: 'Global Tech Distribution Ltd',
    supplierPhone: '+880 1711-445566',
    itemsList: [
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 2, unitCost: 11000, totalRefund: 22000 }
    ],
    totalRefund: 22000,
    reason: 'Defective controller on unboxing - DOA Replacement / Credit',
    debitNoteRef: 'DN-2026-0034',
    status: 'Approved',
    createdBy: 'Kamrul Hasan',
  },
];

export const INITIAL_GOODS_RECEIVED: GoodsReceivedRecord[] = [
  {
    id: 'grn-001',
    grnNo: 'GRN-2026-0071',
    poRef: 'PO-2026-4412',
    supplierChallanNo: 'GTD-CH-9912',
    date: '2026-10-02',
    supplierName: 'Global Tech Distribution Ltd',
    warehouse: 'Main Headquarters & Showroom',
    itemsReceived: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qtyOrdered: 10, qtyReceived: 10, status: 'Accepted' },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qtyOrdered: 20, qtyReceived: 20, status: 'Accepted' },
    ],
    inspector: 'Kamrul Hasan (Chief Technician)',
    status: 'Verified',
    remarks: 'All seals intact. Barcodes scanned into warehouse system.',
  },
  {
    id: 'grn-002',
    grnNo: 'GRN-2026-0072',
    poRef: 'PO-2026-4415',
    supplierChallanNo: 'FLORA-CH-7740',
    date: '2026-10-07',
    supplierName: 'Flora Limited BD',
    warehouse: 'Central Logistics Warehouse',
    itemsReceived: [
      { name: 'ThinkPad T14 Gen 4 (i7, 16GB, 512GB)', sku: 'TP-T14-G4', qtyOrdered: 8, qtyReceived: 8, status: 'Accepted' },
    ],
    inspector: 'Arif Mahmud',
    status: 'Verified',
    remarks: 'Physical packaging verified and moved to Logistics Rack B-12.',
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: 'mvt-001',
    refNo: 'MVT-2026-0034',
    date: '2026-10-02',
    type: 'IN',
    warehouse: 'Main Headquarters & Showroom',
    productName: 'Surface Pro 7 (i5, 8GB, 256GB)',
    sku: 'MS-SP7-02',
    qty: 10,
    unit: 'Unit',
    reason: 'Purchase Inward',
    operator: 'Kamrul Hasan',
    status: 'Verified',
  },
  {
    id: 'mvt-002',
    refNo: 'MVT-2026-0035',
    date: '2026-10-03',
    type: 'OUT',
    warehouse: 'Main Headquarters & Showroom',
    productName: 'Surface Pro 7 (i5, 8GB, 256GB)',
    sku: 'MS-SP7-02',
    qty: 1,
    unit: 'Unit',
    reason: 'Sales Dispatch',
    operator: 'Forhad',
    status: 'Verified',
  },
  {
    id: 'mvt-003',
    refNo: 'MVT-2026-0036',
    date: '2026-10-04',
    type: 'IN',
    warehouse: 'Main Headquarters & Showroom',
    productName: 'Surface Pro 7 (i5, 8GB, 256GB)',
    sku: 'MS-SP7-02',
    qty: 1,
    unit: 'Unit',
    reason: 'Customer Return',
    operator: 'Sadia Rahman',
    status: 'Verified',
  },
  {
    id: 'mvt-004',
    refNo: 'MVT-2026-0037',
    date: '2026-10-05',
    type: 'OUT',
    warehouse: 'Main Headquarters & Showroom',
    productName: '16GB DDR4 3200MHz RAM Kit',
    sku: 'FURY-DDR4-16G',
    qty: 2,
    unit: 'Pcs',
    reason: 'Internal Transfer',
    operator: 'Kamrul Hasan',
    status: 'Verified',
  },
];

export const INITIAL_STOCK_TRANSFERS: StockTransferRecord[] = [
  {
    id: 'trf-001',
    transferNo: 'TRF-2026-0089',
    date: '2026-10-05',
    fromWarehouse: 'Central Logistics Warehouse',
    toWarehouse: 'Main Headquarters & Showroom',
    itemsList: [
      { name: 'ThinkPad T14 Gen 4 (i7, 16GB, 512GB)', sku: 'TP-T14-G4', qty: 3, unit: 'Unit' },
      { name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', qty: 10, unit: 'Pcs' },
    ],
    dispatchedBy: 'Logistics Supervisor (Arif)',
    receivedBy: 'Store In-charge (Kamrul)',
    status: 'Completed',
    vehicleRef: 'Pickup Truck Dhaka-Metro-Tha 14-8821',
  },
  {
    id: 'trf-002',
    transferNo: 'TRF-2026-0090',
    date: '2026-10-08',
    fromWarehouse: 'Main Headquarters & Showroom',
    toWarehouse: 'Dhanmondi Retail Branch',
    itemsList: [
      { name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', qty: 2, unit: 'Unit' },
      { name: '16GB DDR4 3200MHz RAM Kit', sku: 'FURY-DDR4-16G', qty: 5, unit: 'Pcs' },
    ],
    dispatchedBy: 'Store In-charge (Kamrul)',
    receivedBy: 'Branch Manager (Tariq)',
    status: 'In Transit',
    vehicleRef: 'Courier Delivery',
  },
];

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustmentRecord[] = [
  {
    id: 'adj-001',
    adjNo: 'ADJ-2026-0021',
    date: '2026-10-01',
    warehouse: 'Main Headquarters & Showroom',
    productName: '16GB DDR4 3200MHz RAM Kit',
    sku: 'FURY-DDR4-16G',
    systemQty: 32,
    physicalQty: 30,
    diffQty: -2,
    reason: 'Physical Audit Variance',
    adjustedBy: 'Sadia Rahman',
    approvedBy: 'Forhad (Admin)',
    status: 'Reconciled',
  },
  {
    id: 'adj-002',
    adjNo: 'ADJ-2026-0022',
    date: '2026-10-04',
    warehouse: 'Main Headquarters & Showroom',
    productName: 'Samsung 980 Pro 1TB NVMe SSD',
    sku: 'SAM-NVME-1TB',
    systemQty: 18,
    physicalQty: 17,
    diffQty: -1,
    reason: 'Damage / Defect',
    adjustedBy: 'Kamrul Hasan',
    approvedBy: 'Forhad (Admin)',
    status: 'Reconciled',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    date: '2026-10-08',
    employeeId: 'staff-1',
    employeeName: 'Abdur Rahim',
    designation: 'Senior Sales Executive',
    department: 'Sales',
    checkIn: '09:02 AM',
    checkOut: '06:15 PM',
    status: 'Present',
    overtimeHours: 0.5,
    notes: 'On time, active at POS counter',
  },
  {
    id: 'att-102',
    date: '2026-10-08',
    employeeId: 'staff-2',
    employeeName: 'Fatema Begum',
    designation: 'Inventory & Store Officer',
    department: 'Inventory',
    checkIn: '09:45 AM',
    checkOut: '06:30 PM',
    status: 'Late',
    overtimeHours: 0.5,
    notes: 'Delayed due to morning traffic congestion',
  },
  {
    id: 'att-103',
    date: '2026-10-08',
    employeeId: 'staff-3',
    employeeName: 'Kamrul Hasan',
    designation: 'Hardware Service Technician',
    department: 'Service',
    checkIn: '08:55 AM',
    checkOut: '07:00 PM',
    status: 'Present',
    overtimeHours: 1.0,
    notes: 'Completed laptop motherboard repair diagnostics',
  },
  {
    id: 'att-104',
    date: '2026-10-08',
    employeeId: 'staff-4',
    employeeName: 'Sadia Rahman',
    designation: 'Counter Cashier',
    department: 'Accounts',
    checkIn: '08:58 AM',
    checkOut: '06:05 PM',
    status: 'Present',
    overtimeHours: 0,
    notes: 'Reconciled daily cash drawer',
  },
  {
    id: 'att-105',
    date: '2026-10-08',
    employeeId: 'staff-5',
    employeeName: 'Arif Mahmud',
    designation: 'Operations Manager',
    department: 'Management',
    checkIn: '09:10 AM',
    checkOut: '06:40 PM',
    status: 'Present',
    overtimeHours: 0.5,
    notes: 'Supervised showroom customer operations',
  },
];

export interface ChequeRecord {
  id: string;
  chequeNo: string;
  bankName: string;
  accountNo: string;
  partyName: string;
  amount: number;
  issueDate: string;
  maturityDate: string;
  type: 'Received' | 'Issued';
  status: 'Pending' | 'Cleared' | 'Bounced';
  notes?: string;
}

export interface PaymentReceiptRecord {
  id: string;
  receiptNo: string;
  date: string;
  partyName: string;
  partyPhone: string;
  amount: number;
  mode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card / Other';
  accountName: string;
  invoiceRef?: string;
  notes: string;
  status: 'Received';
}

export interface PaymentVoucherRecord {
  id: string;
  voucherNo: string;
  date: string;
  partyName: string;
  amount: number;
  mode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card / Other';
  accountName: string;
  category: string;
  refNo?: string;
  notes: string;
  status: 'Disbursed';
}

export interface JournalEntryRecord {
  id: string;
  journalNo: string;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
  recordedBy: string;
}

export const INITIAL_CHEQUES: ChequeRecord[] = [
  {
    id: 'chq-101',
    chequeNo: 'CQ-778812',
    bankName: 'Islami Bank Bangladesh Ltd',
    accountNo: '2050114020089',
    partyName: 'Apex Data Systems Ltd',
    amount: 140000,
    issueDate: '2026-10-04',
    maturityDate: '2026-10-12',
    type: 'Received',
    status: 'Pending',
    notes: 'Advance for corporate server upgrade',
  },
  {
    id: 'chq-102',
    chequeNo: 'CQ-551240',
    bankName: 'Eastern Bank PLC',
    accountNo: '10810200984',
    partyName: 'TechVision Solutions',
    amount: 55000,
    issueDate: '2026-10-01',
    maturityDate: '2026-10-06',
    type: 'Received',
    status: 'Cleared',
    notes: 'Invoice INV-2026-9021 partial settlement',
  },
  {
    id: 'chq-103',
    chequeNo: 'CQ-990142',
    bankName: 'Brac Bank Current Account',
    accountNo: '1501204899201001',
    partyName: 'Flora Limited BD',
    amount: 250000,
    issueDate: '2026-10-06',
    maturityDate: '2026-10-15',
    type: 'Issued',
    status: 'Pending',
    notes: 'Vendor payment for Lenovo shipment',
  },
  {
    id: 'chq-104',
    chequeNo: 'CQ-334109',
    bankName: 'Dutch Bangla Bank Ltd',
    accountNo: '115103004812',
    partyName: 'CloudNet Technologies',
    amount: 32000,
    issueDate: '2026-09-28',
    maturityDate: '2026-10-02',
    type: 'Received',
    status: 'Bounced',
    notes: 'Insufficient fund notice received from clearing',
  },
];

export const INITIAL_PAYMENT_RECEIPTS: PaymentReceiptRecord[] = [
  {
    id: 'rcp-101',
    receiptNo: 'MR-2026-0412',
    date: '2026-10-08',
    partyName: 'Apex Data Systems Ltd',
    partyPhone: '01712-334455',
    amount: 75000,
    mode: 'Bank Transfer',
    accountName: 'Brac Bank Current Account',
    invoiceRef: 'INV-2026-9041',
    notes: 'Bulk purchase payment via RTGS',
    status: 'Received',
  },
  {
    id: 'rcp-102',
    receiptNo: 'MR-2026-0413',
    date: '2026-10-07',
    partyName: 'Mohammad Faruk Hossain',
    partyPhone: '01911-223344',
    amount: 35000,
    mode: 'Cash',
    accountName: 'Main POS Cash Register',
    invoiceRef: 'INV-2026-9038',
    notes: 'Retail customer laptop remaining due clearance',
    status: 'Received',
  },
  {
    id: 'rcp-103',
    receiptNo: 'MR-2026-0414',
    date: '2026-10-06',
    partyName: 'TechVision Solutions',
    partyPhone: '01819-445566',
    amount: 55000,
    mode: 'Cheque',
    accountName: 'City Bank Business Account',
    invoiceRef: 'INV-2026-9021',
    notes: 'Cheque CQ-551240 deposit',
    status: 'Received',
  },
  {
    id: 'rcp-104',
    receiptNo: 'MR-2026-0415',
    date: '2026-10-05',
    partyName: 'Tanvir Ahmed',
    partyPhone: '01677-889900',
    amount: 42000,
    mode: 'Card / Other',
    accountName: 'City Bank POS Terminal',
    invoiceRef: 'INV-2026-9018',
    notes: 'Visa credit card swipe at POS terminal',
    status: 'Received',
  },
];

export const INITIAL_PAYMENT_VOUCHERS: PaymentVoucherRecord[] = [
  {
    id: 'pv-201',
    voucherNo: 'PV-2026-0181',
    date: '2026-10-08',
    partyName: 'Global Tech Distribution Ltd',
    amount: 150000,
    mode: 'Bank Transfer',
    accountName: 'Brac Bank Current Account',
    category: 'Supplier Payment',
    refNo: 'PB-2026-0019',
    notes: 'Bill clearance for Microsoft Surface shipment',
    status: 'Disbursed',
  },
  {
    id: 'pv-202',
    voucherNo: 'PV-2026-0182',
    date: '2026-10-07',
    partyName: 'Dhaka City Power Corporation',
    amount: 14500,
    mode: 'Cash',
    accountName: 'Main POS Cash Register',
    category: 'Electricity & Utilities',
    refNo: 'BILL-SEP-2026',
    notes: 'Showroom & service center commercial electricity',
    status: 'Disbursed',
  },
  {
    id: 'pv-203',
    voucherNo: 'PV-2026-0183',
    date: '2026-10-05',
    partyName: 'Multiplan Center Landlord',
    amount: 45000,
    mode: 'Bank Transfer',
    accountName: 'City Bank Business Account',
    category: 'Showroom Rent',
    refNo: 'RENT-OCT-2026',
    notes: 'Level 4 showroom monthly commercial rent',
    status: 'Disbursed',
  },
  {
    id: 'pv-204',
    voucherNo: 'PV-2026-0184',
    date: '2026-10-04',
    partyName: 'Flora Limited BD',
    amount: 100000,
    mode: 'Cheque',
    accountName: 'Brac Bank Current Account',
    category: 'Supplier Payment',
    refNo: 'PB-2026-0021',
    notes: 'Partial payment against ThinkPad T14 supply',
    status: 'Disbursed',
  },
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntryRecord[] = [
  {
    id: 'jrn-301',
    journalNo: 'JV-2026-0081',
    date: '2026-10-08',
    debitAccount: 'Brac Bank Current Account',
    creditAccount: 'Accounts Receivable (Apex Data Systems)',
    amount: 75000,
    narration: 'Settlement received against corporate invoice INV-2026-9041',
    recordedBy: 'Forhad (Admin)',
  },
  {
    id: 'jrn-302',
    journalNo: 'JV-2026-0082',
    date: '2026-10-07',
    debitAccount: 'Accounts Payable (Global Tech Distribution)',
    creditAccount: 'Brac Bank Current Account',
    amount: 150000,
    narration: 'Vendor bill PB-2026-0019 payment via online fund transfer',
    recordedBy: 'Forhad (Admin)',
  },
  {
    id: 'jrn-303',
    journalNo: 'JV-2026-0083',
    date: '2026-10-06',
    debitAccount: 'Office Utilities & Electricity Expense',
    creditAccount: 'Main POS Cash Register',
    amount: 14500,
    narration: 'Commercial electric utility bill settlement for Sep 2026',
    recordedBy: 'Sadia Rahman (Cashier)',
  },
  {
    id: 'jrn-304',
    journalNo: 'JV-2026-0084',
    date: '2026-10-04',
    debitAccount: 'Inventory Purchase / Stock Asset',
    creditAccount: 'Accounts Payable (Flora Limited BD)',
    amount: 688800,
    narration: 'Goods inward booking for 8 units ThinkPad T14 under PB-2026-0021',
    recordedBy: 'Forhad (Admin)',
  },
];
