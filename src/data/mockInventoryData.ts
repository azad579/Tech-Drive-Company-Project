export interface Branch {
  id: string;
  sn: number;
  name: string;
  nameBn?: string;
  phone: string;
  email: string;
  addressEn: string;
  addressBn?: string;
}

export interface Warehouse {
  id: string;
  sn: number;
  name: string;
  nameBn?: string;
  phone: string;
  email: string;
  addressEn: string;
  addressBn?: string;
}

export interface DeliveryItem {
  productId: string;
  name: string;
  code: string;
  image?: string;
  sold: number;
  delivered: number;
  restQty: number;
  now?: number;
}

export interface SalesDeliveryRecord {
  id: string;
  sn: number;
  date: string;
  challanNo: string;
  invoiceNo: string;
  customerName?: string;
  from: string;
  note: string;
  items: DeliveryItem[];
  status: 'Delivered' | 'Partial' | 'Pending';
}

export interface ReceiveItem {
  productId: string;
  name: string;
  code: string;
  image?: string;
  purchase: number;
  received: number;
  restQty: number;
  now?: number;
}

export interface PurchaseReceiveRecord {
  id: string;
  sn: number;
  date: string;
  challanNo: string;
  purchaseNo: string;
  supplierName?: string;
  from: string;
  note: string;
  items: ReceiveItem[];
  status: 'Received' | 'Partial' | 'Pending';
}

export interface StockStatusItem {
  id: string;
  sn: number;
  name: string;
  color: string;
  size: string;
  sku: string;
  warehouseName?: string;
  image?: string;
  // Purchase details
  purchase: number;
  pReceived: number;
  pReturn: number;
  pBalance: number;
  // Transaction details (transfer)
  tReceived: number;
  tSend: number;
  tBalance: number;
  // Sold details
  sold: number;
  deli: number;
  adBal: number;
  sReturn: number;
  sBalance: number;
  // Warranty
  wReplace: number;
  wSupRec: number;
  wBalance: number;
  // Disposal & available
  dpQty: number;
  inStock: number;
  // Sold summary
  undeli: number;
  netSaleAmount: number;
}

export interface TransferCartItem {
  productId: string;
  name: string;
  sku: string;
  cost: number;
  qty: number;
  hasSerial: boolean;
  serials: string[];
}

export interface TransferRecord {
  id: string;
  sn: number;
  date: string;
  transferNo: string;
  from: string;
  to: string;
  note: string;
  type: 'branch' | 'warehouse';
  items: TransferCartItem[];
}

export interface DisposalCartItem {
  productId: string;
  name: string;
  sku: string;
  cost: number;
  qty: number;
  price: number;
  subtotal: number;
  serials: string[];
}

export interface DisposalRecord {
  id: string;
  sn: number;
  date: string;
  disposalNo: string;
  from: string;
  cost: number;
  recover: number;
  note: string;
  items: DisposalCartItem[];
}

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-1',
    sn: 1,
    name: 'Taltola',
    nameBn: 'তালতলা',
    phone: '01618070088',
    email: 'info@axesgl.com',
    addressEn: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ'
  },
  {
    id: 'br-2',
    sn: 2,
    name: 'Mirpur 10',
    nameBn: 'মিরপুর ১০',
    phone: '01712345678',
    email: 'mirpur@techdrive.com.bd',
    addressEn: 'Mirpur 10 Roundabout, Dhaka',
    addressBn: 'মিরপুর ১০ গোলচত্বর, ঢাকা'
  },
  {
    id: 'br-3',
    sn: 3,
    name: 'Uttara Branch',
    nameBn: 'উত্তরা শাখা',
    phone: '01899112233',
    email: 'uttara@techdrive.com.bd',
    addressEn: 'Sector 3, Uttara, Dhaka',
    addressBn: 'সেক্টর ৩, উত্তরা, ঢাকা'
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    sn: 1,
    name: 'Mirpur 11',
    nameBn: 'মিরপুর ১১',
    phone: '01972379494',
    email: 'axes.mirpur11@gmail.com',
    addressEn: 'Paris road, Mirpur 11, Dhaka',
    addressBn: 'প্যারিস রোড, মিরপুর ১১, ঢাকা'
  },
  {
    id: 'wh-2',
    sn: 2,
    name: 'IDB Central Hub',
    nameBn: 'আইডিবি সেন্ট্রাল হাব',
    phone: '01911223344',
    email: 'hub@techdrive.com.bd',
    addressEn: 'Agargaon Commercial Area, Dhaka',
    addressBn: 'আগারগাঁও বাণিজ্যিক এলাকা, ঢাকা'
  }
];

export const INITIAL_DELIVERY_RECORDS: SalesDeliveryRecord[] = [
  {
    id: 'del-1',
    sn: 1,
    date: '24-10-2026',
    challanNo: 'DLI241026101',
    invoiceNo: 'SEL231026102',
    customerName: 'Walk-In Customer',
    from: 'Taltola',
    note: 'Challan delivered with warranty seal and invoice copy',
    status: 'Delivered',
    items: [
      {
        productId: 'prod-1',
        name: 'Catblack Laptop Cooling Fan Stand',
        code: 'ABA223P',
        sold: 5,
        delivered: 5,
        restQty: 0
      },
      {
        productId: 'prod-6',
        name: 'Dell Latitude 5420 Core i5 11th Gen',
        code: 'LAP-DELL-5420',
        sold: 2,
        delivered: 2,
        restQty: 0
      }
    ]
  },
  {
    id: 'del-2',
    sn: 2,
    date: '23-10-2026',
    challanNo: 'DLI231026105',
    invoiceNo: 'SEL231026101',
    customerName: 'Al-Amin Computers',
    from: 'Mirpur 11',
    note: 'Partial delivery dispatched via Sundarban Courier',
    status: 'Partial',
    items: [
      {
        productId: 'prod-8',
        name: 'HP ProBook 450 G8 16GB/512GB SSD',
        code: 'LAP-HP-450G8',
        sold: 3,
        delivered: 2,
        restQty: 1
      }
    ]
  }
];

export const INITIAL_RECEIVE_RECORDS: PurchaseReceiveRecord[] = [
  {
    id: 'rec-1',
    sn: 1,
    date: '24-10-2026',
    challanNo: 'RCI241026101',
    purchaseNo: 'PINV241026101',
    supplierName: 'City Laptop Zone',
    from: 'Multiplan Center, Level 4',
    note: 'Shipment received in good condition, carton unbroken',
    status: 'Received',
    items: [
      {
        productId: 'prod-10',
        name: 'Samsung 980 Pro NVMe M.2 SSD 500GB',
        code: 'SSD-SAM-980-500',
        purchase: 10,
        received: 10,
        restQty: 0
      }
    ]
  },
  {
    id: 'rec-2',
    sn: 2,
    date: '22-10-2026',
    challanNo: 'RCI221026103',
    purchaseNo: 'PINV221026105',
    supplierName: 'Smart Technologies BD Ltd',
    from: 'Jahangir Tower, Karwan Bazar',
    note: 'First lot accepted; remaining 5 pcs to arrive tomorrow',
    status: 'Partial',
    items: [
      {
        productId: 'prod-11',
        name: 'Kingston NV2 PCIe 4.0 NVMe SSD 1TB',
        code: 'SSD-KIN-1TB',
        purchase: 20,
        received: 15,
        restQty: 5
      }
    ]
  }
];

export const INITIAL_STOCK_STATUS_ITEMS: StockStatusItem[] = [
  {
    id: 'stk-1',
    sn: 1,
    name: 'Catblack Laptop Cooling Fan Stand',
    color: 'Black',
    size: 'Standard',
    sku: 'ABA223P',
    warehouseName: 'MIRPUR 11',
    purchase: 120,
    pReceived: 120,
    pReturn: 0,
    pBalance: 120,
    tReceived: 15,
    tSend: 5,
    tBalance: 10,
    sold: 85,
    deli: 80,
    adBal: 80,
    sReturn: 2,
    sBalance: 83,
    wReplace: 1,
    wSupRec: 1,
    wBalance: 0,
    dpQty: 1,
    inStock: 46,
    undeli: 5,
    netSaleAmount: 63750
  },
  {
    id: 'stk-2',
    sn: 2,
    name: 'Hit Sen Fan Mini',
    color: 'Blue',
    size: 'Mini',
    sku: 'ABA226P',
    warehouseName: 'MIRPUR 11',
    purchase: 50,
    pReceived: 50,
    pReturn: 0,
    pBalance: 50,
    tReceived: 0,
    tSend: 10,
    tBalance: -10,
    sold: 25,
    deli: 25,
    adBal: 25,
    sReturn: 0,
    sBalance: 25,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 0,
    inStock: 15,
    undeli: 0,
    netSaleAmount: 13750
  },
  {
    id: 'stk-3',
    sn: 3,
    name: 'Laptop Stand Creative Folding Storage Bracket Aluminium',
    color: 'Silver',
    size: 'Standard',
    sku: 'ABA222P',
    warehouseName: 'MIRPUR 11',
    purchase: 75,
    pReceived: 75,
    pReturn: 0,
    pBalance: 75,
    tReceived: 10,
    tSend: 0,
    tBalance: 10,
    sold: 40,
    deli: 38,
    adBal: 38,
    sReturn: 1,
    sBalance: 39,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 2,
    inStock: 44,
    undeli: 2,
    netSaleAmount: 56000
  },
  {
    id: 'stk-4',
    sn: 4,
    name: 'Laptop Stand Metal For Laptop SG-004',
    color: 'Grey',
    size: 'Adjustable',
    sku: 'ABA221P',
    warehouseName: 'MIRPUR 11',
    purchase: 60,
    pReceived: 60,
    pReturn: 0,
    pBalance: 60,
    tReceived: 5,
    tSend: 5,
    tBalance: 0,
    sold: 35,
    deli: 35,
    adBal: 35,
    sReturn: 0,
    sBalance: 35,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 0,
    inStock: 25,
    undeli: 0,
    netSaleAmount: 57750
  },
  {
    id: 'stk-5',
    sn: 5,
    name: 'MOUSE PAD GAMING MOUSE PAD PAD 300*700*3MM',
    color: 'Black/Red',
    size: '300x700',
    sku: 'ABA186P',
    warehouseName: 'MIRPUR 11',
    purchase: 200,
    pReceived: 200,
    pReturn: 0,
    pBalance: 200,
    tReceived: 20,
    tSend: 10,
    tBalance: 10,
    sold: 140,
    deli: 140,
    adBal: 140,
    sReturn: 5,
    sBalance: 135,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 5,
    inStock: 70,
    undeli: 0,
    netSaleAmount: 49000
  },
  {
    id: 'stk-6',
    sn: 6,
    name: 'Dell Latitude 5420 Core i5 11th Gen 16GB/512GB SSD',
    color: 'Silver',
    size: '14 inch',
    sku: 'LAP-DELL-5420',
    warehouseName: 'MIRPUR 11',
    purchase: 15,
    pReceived: 15,
    pReturn: 0,
    pBalance: 15,
    tReceived: 2,
    tSend: 1,
    tBalance: 1,
    sold: 12,
    deli: 12,
    adBal: 12,
    sReturn: 0,
    sBalance: 12,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 0,
    inStock: 4,
    undeli: 0,
    netSaleAmount: 558000
  },
  {
    id: 'stk-7',
    sn: 7,
    name: 'HP ProBook 450 G8 Core i5 11th Gen 16GB/512GB SSD',
    color: 'Silver',
    size: '15.6 inch',
    sku: 'LAP-HP-450G8',
    warehouseName: 'MIRPUR 11',
    purchase: 10,
    pReceived: 10,
    pReturn: 0,
    pBalance: 10,
    tReceived: 0,
    tSend: 0,
    tBalance: 0,
    sold: 7,
    deli: 6,
    adBal: 6,
    sReturn: 0,
    sBalance: 7,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 0,
    inStock: 3,
    undeli: 1,
    netSaleAmount: 486500
  },
  {
    id: 'stk-8',
    sn: 8,
    name: 'Samsung 980 Pro NVMe M.2 SSD 500GB Gen4',
    color: 'Black',
    size: 'M.2 2280',
    sku: 'SSD-SAM-980-500',
    warehouseName: 'MIRPUR 11',
    purchase: 25,
    pReceived: 25,
    pReturn: 0,
    pBalance: 25,
    tReceived: 5,
    tSend: 0,
    tBalance: 5,
    sold: 22,
    deli: 22,
    adBal: 22,
    sReturn: 0,
    sBalance: 22,
    wReplace: 0,
    wSupRec: 0,
    wBalance: 0,
    dpQty: 0,
    inStock: 8,
    undeli: 0,
    netSaleAmount: 123200
  }
];

export const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'tr-1',
    sn: 1,
    date: '24 Oct 2026',
    transferNo: 'TRN241026101',
    from: 'Taltola',
    to: 'Mirpur 11',
    note: 'Internal stock balancing transfer',
    type: 'branch',
    items: [
      {
        productId: 'prod-1',
        name: 'Catblack Laptop Cooling Fan Stand',
        sku: 'ABA223P',
        cost: 480,
        qty: 10,
        hasSerial: false,
        serials: []
      }
    ]
  },
  {
    id: 'tr-2',
    sn: 2,
    date: '23 Oct 2026',
    transferNo: 'WTR231026102',
    from: 'Mirpur 11',
    to: 'Taltola',
    note: 'Urgent restocking for customer reservations',
    type: 'warehouse',
    items: [
      {
        productId: 'prod-6',
        name: 'Dell Latitude 5420 Core i5 11th Gen',
        sku: 'LAP-DELL-5420',
        cost: 38000,
        qty: 2,
        hasSerial: true,
        serials: ['TD-5CD22734GT', 'TD-5CD22734GU']
      }
    ]
  }
];

export const INITIAL_DISPOSALS: DisposalRecord[] = [
  {
    id: 'dsp-1',
    sn: 1,
    date: '10 Jul 2024',
    disposalNo: 'PDR100724101',
    from: 'No Branch',
    cost: 12800,
    recover: 0,
    note: 'Water damaged packaging and non-functional PCB unit',
    items: [
      {
        productId: 'prod-d1',
        name: 'Speaker Mini Bluetooth ABA076PB1014',
        sku: 'ABA076PB1014',
        cost: 1200,
        qty: 4,
        price: 1200,
        subtotal: 4800,
        serials: ['SPK-88123-A', 'SPK-88123-B', 'SPK-88123-C', 'SPK-88123-D']
      },
      {
        productId: 'prod-d2',
        name: 'Corporate Promo Mousepad Gift-001B1123',
        sku: 'Gift-001B1123',
        cost: 800,
        qty: 10,
        price: 800,
        subtotal: 8000,
        serials: []
      }
    ]
  },
  {
    id: 'dsp-2',
    sn: 2,
    date: '18 Oct 2026',
    disposalNo: 'PDR181026102',
    from: 'Taltola',
    cost: 4200,
    recover: 500,
    note: 'Damaged during transit; salvage value recovered',
    items: [
      {
        productId: 'prod-15',
        name: 'Logitech G102 Lightsync Optical Gaming Mouse',
        sku: 'ACC-LOG-G102',
        cost: 1450,
        qty: 2,
        price: 1450,
        subtotal: 2900,
        serials: ['LOG-9921-X', 'LOG-9921-Y']
      },
      {
        productId: 'prod-1',
        name: 'Catblack Laptop Cooling Fan Stand',
        sku: 'ABA223P',
        cost: 480,
        qty: 2,
        price: 480,
        subtotal: 960,
        serials: []
      }
    ]
  }
];

export const INVENTORY_HISTORY_LOGS = [
  { id: 'h-1', date: '24 Oct 2026', title: 'Staff access - Transfer created', user: 'Ferdous Ahmed', time: '14:22' },
  { id: 'h-2', date: '24 Oct 2026', title: 'Staff access - Product delivery created', user: 'Ferdous Ahmed', time: '12:05' },
  { id: 'h-3', date: '23 Oct 2026', title: 'Staff access - Branch list accessed', user: 'Ferdous Ahmed', time: '16:40' },
  { id: 'h-4', date: '23 Oct 2026', title: 'Staff access - Branch added - Taltola', user: 'Ferdous Ahmed', time: '11:15' },
  { id: 'h-5', date: '23 Oct 2026', title: 'Staff access - Warehouse added - Mirpur 11', user: 'Ferdous Ahmed', time: '10:02' },
  { id: 'h-6', date: '10 Jul 2024', title: 'Staff access - Product disposal PDR100724101', user: 'Admin User', time: '17:30' }
];
