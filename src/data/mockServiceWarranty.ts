import {
  ServiceItem,
  ServiceReceived,
  ServiceSale,
  WarrantyClaim,
  WarrantyChecking,
  WarrantyProductManage,
  WarrantyDelivered,
  WarrantyStockItem,
  SupplierBadStockClaim,
  ServiceCenter
} from '../types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'ser-1',
    sn: 1,
    code: 'ABA007S',
    name: 'Battery Service',
    category: 'Service',
    cost: 0,
    price: 500,
    description: 'Laptop Battery Service, re-cell & calibration',
    status: 'Active'
  },
  {
    id: 'ser-2',
    sn: 2,
    code: 'ABA008S',
    name: 'Bios Lock',
    category: 'Service',
    cost: 0,
    price: 1500,
    description: 'Laptop Bios Password Removal & Firmware reflash',
    status: 'Active'
  },
  {
    id: 'ser-3',
    sn: 3,
    code: 'ABA009S',
    name: 'Dell Latitude 3189 TPN Lock',
    category: 'Service',
    cost: 0,
    price: 1000,
    description: 'Dell TPN Chip security bypass and setup',
    status: 'Active'
  },
  {
    id: 'ser-4',
    sn: 4,
    code: 'ABA010S',
    name: 'Mother Board Repair',
    category: 'Service',
    cost: 500,
    price: 2500,
    description: 'Motherboard power IC, MOSFET and track servicing',
    status: 'Active'
  },
  {
    id: 'ser-5',
    sn: 5,
    code: 'ABA011S',
    name: 'Display Panel Replacement',
    category: 'Service',
    cost: 200,
    price: 800,
    description: 'FHD IPS LED Screen replacement & bezel fitting',
    status: 'Active'
  },
  {
    id: 'ser-6',
    sn: 6,
    code: 'ABA012S',
    name: 'Thermal Paste & Full Servicing',
    category: 'Service',
    cost: 100,
    price: 600,
    description: 'Cooling heatsink cleanup and Arctic MX-4 thermal repaste',
    status: 'Active'
  },
  {
    id: 'ser-7',
    sn: 7,
    code: 'ABA013S',
    name: 'Windows OS & Essential Drivers',
    category: 'Service',
    cost: 0,
    price: 500,
    description: 'Windows 11 Pro 64-bit clean setup + Drivers + Office Suite',
    status: 'Active'
  }
];

export const INITIAL_SERVICE_RECEIVED: ServiceReceived[] = [
  {
    id: 'srec-1',
    sn: 1,
    date: '24 Oct 2026',
    invoiceNo: 'SR20261024-80002',
    customerName: 'Md. Rafiqul Islam',
    phone: '01711223344',
    address: 'Elephant Road, Dhaka',
    productName: 'HP ProBook 450 G8',
    productModel: '450 G8 Core i5',
    problem: 'No display on boot, power LED blinking 3 times white 2 times amber',
    deliveryDate: '28 Oct 2026',
    status: 'Received',
    remarks: 'Customer provided charger and power cord.'
  },
  {
    id: 'srec-2',
    sn: 2,
    date: '22 Oct 2026',
    invoiceNo: 'SR20261022-80001',
    customerName: 'Tanvir Hasan',
    phone: '01823456789',
    address: 'Mirpur-10, Dhaka',
    productName: 'Dell Latitude 3420',
    productModel: '3420 Core i7',
    problem: 'Battery plugged in but not charging, 0% available',
    deliveryDate: '26 Oct 2026',
    status: 'In Service',
    remarks: 'Checked charging port - OK. Suspect battery sensor.'
  },
  {
    id: 'srec-3',
    sn: 3,
    date: '20 Oct 2026',
    invoiceNo: 'SR20261020-80000',
    customerName: 'Kamal Uddin',
    phone: '01912345678',
    address: 'Dhanmondi, Dhaka',
    productName: 'Lenovo ThinkPad T480',
    productModel: 'T480 Core i5 8th Gen',
    problem: 'Supervisor Bios password locked out',
    deliveryDate: '23 Oct 2026',
    status: 'Ready',
    remarks: 'Password removed successfully. Tested boot.'
  }
];

export const INITIAL_SERVICE_SALES: ServiceSale[] = [
  {
    id: 'ssale-1',
    sn: 1,
    date: '23 Oct 2026',
    invoiceNo: 'SINV-261023-01',
    customerName: 'Kamal Uddin',
    phone: '01912345678',
    total: 1500,
    discount: 100,
    vat: 0,
    grandTotal: 1400,
    paidAmount: 1400,
    dueAmount: 0,
    status: 'Paid',
    items: [
      {
        id: 'ser-2',
        code: 'ABA008S',
        name: 'Bios Lock',
        price: 1500,
        qty: 1,
        discount: 100,
        subtotal: 1400
      }
    ]
  },
  {
    id: 'ssale-2',
    sn: 2,
    date: '21 Oct 2026',
    invoiceNo: 'SINV-261021-02',
    customerName: 'Abir Rahman',
    phone: '01755123987',
    total: 3100,
    discount: 200,
    vat: 0,
    grandTotal: 2900,
    paidAmount: 2900,
    dueAmount: 0,
    status: 'Paid',
    items: [
      {
        id: 'ser-4',
        code: 'ABA010S',
        name: 'Mother Board Repair',
        price: 2500,
        qty: 1,
        discount: 150,
        subtotal: 2350
      },
      {
        id: 'ser-6',
        code: 'ABA012S',
        name: 'Thermal Paste & Full Servicing',
        price: 600,
        qty: 1,
        discount: 50,
        subtotal: 550
      }
    ]
  }
];

export const INITIAL_WARRANTY_CLAIMS: WarrantyClaim[] = [
  {
    id: 'war-1',
    sn: 1,
    date: '01 Oct 2025',
    claimNo: 'CLA011025101',
    productName: 'Dell Optiplex 7070 Micro Core i5',
    serial: '5CG9453QN4',
    invoiceNo: 'SEL190925101',
    salesDate: '19 Sep 2025',
    warrantyExpired: '18 Sep 2026',
    status: 'Checking',
    claimNote: 'Display port 1 not detecting external monitor',
    checkingNote: 'Sent to internal testing bench. Verified DP signal loss.',
    serviceCenter: 'City Laptop Zone'
  },
  {
    id: 'war-2',
    sn: 2,
    date: '28 Sep 2025',
    claimNo: 'CLA280925102',
    productName: 'HP EliteBook 840 G7 Core i7 10th Gen',
    serial: '5CD03816T2',
    invoiceNo: 'SEL150825104',
    salesDate: '15 Aug 2025',
    warrantyExpired: '14 Aug 2027',
    status: 'Send for Warranty',
    claimNote: 'Keyboard random keys typing automatically and sticking',
    checkingNote: 'Hardware key malfunction verified. Sent to vendor service hub.',
    serviceCenter: 'Star Tech Warranty Hub'
  },
  {
    id: 'war-3',
    sn: 3,
    date: '14 Sep 2025',
    claimNo: 'CLA140925103',
    productName: 'Lenovo ThinkPad X1 Carbon Gen 8',
    serial: 'PF2198031',
    invoiceNo: 'SEL020625101',
    salesDate: '02 Jun 2025',
    warrantyExpired: '01 Jun 2027',
    status: 'Product Successfully Delivered!!!',
    claimNote: 'Internal CPU cooling fan making loud grinding noise',
    checkingNote: 'Replaced with original Delta fan unit. Passed stress test 100%.',
    serviceCenter: 'Monir Colour & BGA Station'
  },
  {
    id: 'war-4',
    sn: 4,
    date: '05 Sep 2025',
    claimNo: 'CLA050925104',
    productName: 'Acer Aspire 5 A515-56',
    serial: 'NXA8ESD001',
    invoiceNo: 'SEL220725109',
    salesDate: '22 Jul 2025',
    warrantyExpired: '21 Jul 2027',
    status: 'Warranty Denied & Send To Delivery',
    claimNote: 'No power on, completely dead unit',
    checkingNote: 'Liquid spillage corrosion detected near charging IC. Warranty voided as per company policy.',
    serviceCenter: 'Tech Drive Testing Lab'
  }
];

export const INITIAL_SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc-1',
    sn: 1,
    name: 'City Laptop Zone',
    contactPerson: 'Md. Monirul Islam',
    phone: '01712-987654',
    address: 'Shop #304, Multiplan Center, Elephant Road, Dhaka',
    status: 'Active',
    remarks: 'Specialized in HP & Dell business laptops'
  },
  {
    id: 'sc-2',
    sn: 2,
    name: 'Monir Colour & BGA Station',
    contactPerson: 'Engr. Monir Hossain',
    phone: '01987-654321',
    address: 'Eastern Plus Shopping Complex, 4th Floor, Shantinagar, Dhaka',
    status: 'Active',
    remarks: 'Motherboard BGA reballing & chip-level micro soldering'
  },
  {
    id: 'sc-3',
    sn: 3,
    name: 'Star Tech Warranty Hub',
    contactPerson: 'Shahed Ahmed',
    phone: '01811-223344',
    address: 'Pragati Sarani, Kuril, Dhaka',
    status: 'Active',
    remarks: 'Official distributor warranty channel'
  }
];

export const INITIAL_WARRANTY_STOCKS: WarrantyStockItem[] = [
  {
    id: 'wstk-1',
    sn: 1,
    productName: 'HP EliteBook 840 G7 Core i5 10th Gen',
    inQty: 12,
    outQty: 8,
    deliveredQty: 7,
    availableQty: 4,
    badStockIn: 2,
    badStockOut: 1,
    badStockAvailable: 1
  },
  {
    id: 'wstk-2',
    sn: 2,
    productName: 'Dell Latitude 5420 Core i5 11th Gen',
    inQty: 18,
    outQty: 14,
    deliveredQty: 12,
    availableQty: 4,
    badStockIn: 3,
    badStockOut: 2,
    badStockAvailable: 1
  },
  {
    id: 'wstk-3',
    sn: 3,
    productName: 'Lenovo ThinkPad T14 Gen 2 Core i7',
    inQty: 9,
    outQty: 5,
    deliveredQty: 4,
    availableQty: 4,
    badStockIn: 1,
    badStockOut: 0,
    badStockAvailable: 1
  },
  {
    id: 'wstk-4',
    sn: 4,
    productName: 'Apple MacBook Air M1 8GB/256GB SSD',
    inQty: 6,
    outQty: 4,
    deliveredQty: 4,
    availableQty: 2,
    badStockIn: 0,
    badStockOut: 0,
    badStockAvailable: 0
  }
];

export const INITIAL_BAD_STOCK_CLAIMS: SupplierBadStockClaim[] = [
  {
    id: 'bsc-1',
    sn: 1,
    date: '18 Oct 2026',
    claimNo: 'BSC-202610-001',
    supplierName: 'Global Brand Pvt Ltd',
    product: 'Dell Latitude 5420 Motherboard',
    serial: 'CN-0N1X87-12963',
    problem: 'PCH short circuit from factory batch',
    status: 'Sent to Supplier',
    note: 'Shipped via courier to Global Brand Tejgaon RMA center'
  },
  {
    id: 'bsc-2',
    sn: 2,
    date: '08 Oct 2026',
    claimNo: 'BSC-202610-002',
    supplierName: 'Smart Technologies BD Ltd',
    product: 'HP 65W USB-C Original AC Adapter',
    serial: 'HP-L25296-003',
    problem: 'No voltage output, spark on wall outlet',
    status: 'Replaced',
    note: 'Replacement unit received with new serial SN-HP-ADP-992'
  }
];
