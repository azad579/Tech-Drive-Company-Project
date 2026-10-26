import {
  Product, Customer, Supplier, SalesInvoice, PurchaseInvoice, ExpenseRecord, ChequeRecord, BankAccount,
  BankMaster, MobileAccount, BankTransaction, Department, Designation, Employee,
  LeaveType, LeaveRecord, AttendanceRecord, PayslipItem, PersonalNote, TodoTask
} from '../types';

export const BD_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Bagerhat', 'Bandarban', 'Barguna', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chapainawabganj',
  'Chuadanga', 'Comilla', "Cox's Bazar", 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur',
  'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachhari',
  'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj',
  'Meherpur', 'Moulvibazar', 'Munshiganj', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore',
  'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari',
  'Rangamati', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Tangail', 'Thakurgaon'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sn: 1,
    sku: 'ABA223P',
    name: 'Catblack Laptop Cooling Fan Stand',
    category: 'Accessories',
    brand: 'Catblack',
    purchasePrice: 480,
    salePrice: 750,
    stock: 0,
    minStockAlert: 5,
    unit: 'Pcs',
    warranty: '6 Months'
  },
  {
    id: 'prod-2',
    sn: 2,
    sku: 'ABA226P',
    name: 'Hit Sen Fan Mini',
    category: 'Accessories',
    brand: 'Hit Sen',
    purchasePrice: 320,
    salePrice: 550,
    stock: 0,
    minStockAlert: 5,
    unit: 'Pcs',
    warranty: '3 Months'
  },
  {
    id: 'prod-3',
    sn: 3,
    sku: 'ABA222P',
    name: 'Laptop Stand Creative Folding Storage Bracket Aluminium',
    category: 'Laptop Accessories',
    brand: 'TechGear',
    purchasePrice: 850,
    salePrice: 1400,
    stock: 0,
    minStockAlert: 5,
    unit: 'Pcs',
    warranty: '1 Year'
  },
  {
    id: 'prod-4',
    sn: 4,
    sku: 'ABA221P',
    name: 'Laptop Stand Metal For Laptop SG-004',
    category: 'Laptop Accessories',
    brand: 'TechGear',
    purchasePrice: 950,
    salePrice: 1650,
    stock: 0,
    minStockAlert: 5,
    unit: 'Pcs',
    warranty: '1 Year'
  },
  {
    id: 'prod-5',
    sn: 5,
    sku: 'ABA186P',
    name: 'MOUSE PAD GAMING MOUSE PAD PAD 300*700*3MM',
    category: 'Accessories',
    brand: 'Razer Clone',
    purchasePrice: 180,
    salePrice: 350,
    stock: 0,
    minStockAlert: 10,
    unit: 'Pcs',
    warranty: 'None'
  },
  {
    id: 'prod-6',
    sn: 6,
    sku: 'LAP-DELL-5420',
    name: 'Dell Latitude 5420 Core i5 11th Gen 16GB/512GB SSD',
    category: 'Laptop',
    brand: 'Dell',
    purchasePrice: 38000,
    salePrice: 46500,
    stock: 4,
    minStockAlert: 2,
    unit: 'Pcs',
    warranty: '2 Years'
  },
  {
    id: 'prod-7',
    sn: 7,
    sku: 'LAP-THINK-T480S',
    name: 'Lenovo ThinkPad T480s Core i7 8th Gen 16GB/512GB SSD',
    category: 'Laptop',
    brand: 'Lenovo',
    purchasePrice: 28500,
    salePrice: 35000,
    stock: 2,
    minStockAlert: 2,
    unit: 'Pcs',
    warranty: '1 Year'
  },
  {
    id: 'prod-8',
    sn: 8,
    sku: 'LAP-HP-840G7',
    name: 'HP EliteBook 840 G7 Core i5 10th Gen 16GB/512GB SSD',
    category: 'Laptop',
    brand: 'HP',
    purchasePrice: 39500,
    salePrice: 48000,
    stock: 3,
    minStockAlert: 2,
    unit: 'Pcs',
    warranty: '2 Years'
  },
  {
    id: 'prod-9',
    sn: 9,
    sku: 'LAP-MAC-M1',
    name: 'Apple MacBook Air M1 8GB / 256GB Space Gray Retina',
    category: 'Laptop',
    brand: 'Apple',
    purchasePrice: 72000,
    salePrice: 83500,
    stock: 2,
    minStockAlert: 1,
    unit: 'Pcs',
    warranty: '1 Year'
  },
  {
    id: 'prod-10',
    sn: 10,
    sku: 'SSD-SAM-980P',
    name: 'Samsung 980 NVMe M.2 SSD 500GB Gen3',
    category: 'SSD',
    brand: 'Samsung',
    purchasePrice: 4200,
    salePrice: 5600,
    stock: 8,
    minStockAlert: 3,
    unit: 'Pcs',
    warranty: '3 Years'
  },
  {
    id: 'prod-11',
    sn: 11,
    sku: 'SSD-KIN-1TB',
    name: 'Kingston NV2 PCIe 4.0 NVMe SSD 1TB',
    category: 'SSD',
    brand: 'Kingston',
    purchasePrice: 5900,
    salePrice: 7500,
    stock: 12,
    minStockAlert: 3,
    unit: 'Pcs',
    warranty: '3 Years'
  },
  {
    id: 'prod-12',
    sn: 12,
    sku: 'RAM-COR-8GB',
    name: 'Corsair Vengeance SODIMM DDR4 8GB 3200MHz Laptop RAM',
    category: 'RAM',
    brand: 'Corsair',
    purchasePrice: 1950,
    salePrice: 2650,
    stock: 15,
    minStockAlert: 4,
    unit: 'Pcs',
    warranty: 'Lifetime'
  },
  {
    id: 'prod-13',
    sn: 13,
    sku: 'RAM-COR-16GB',
    name: 'Corsair Vengeance SODIMM DDR4 16GB 3200MHz Laptop RAM',
    category: 'RAM',
    brand: 'Corsair',
    purchasePrice: 3450,
    salePrice: 4500,
    stock: 9,
    minStockAlert: 3,
    unit: 'Pcs',
    warranty: 'Lifetime'
  },
  {
    id: 'prod-14',
    sn: 14,
    sku: 'ACC-CHG-DELL65',
    name: 'Original Dell 65W Type-C AC Laptop Charger Adapter',
    category: 'Accessories',
    brand: 'Dell',
    purchasePrice: 1650,
    salePrice: 2500,
    stock: 11,
    minStockAlert: 3,
    unit: 'Pcs',
    warranty: '1 Year'
  },
  {
    id: 'prod-15',
    sn: 15,
    sku: 'ACC-LOG-G102',
    name: 'Logitech G102 Lightsync RGB Optical Gaming Mouse',
    category: 'Accessories',
    brand: 'Logitech',
    purchasePrice: 1450,
    salePrice: 2150,
    stock: 14,
    minStockAlert: 4,
    unit: 'Pcs',
    warranty: '2 Years'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cus-ahad',
    code: 'ABA/CU/032',
    name: 'ABDUL AHAD',
    phone: '01581505471',
    district: 'Narayanganj',
    address: 'Narayanganj, Bangladesh',
    balance: 0,
    isWalkIn: false
  },
  {
    id: 'cus-ferdous',
    code: 'ABA/CU/031',
    name: 'Ferdous Ahmed',
    phone: '01712998877',
    district: 'Dhaka',
    address: 'Mirpur DOHS, Dhaka, Bangladesh',
    balance: 15400,
    isWalkIn: false
  },
  {
    id: 'cus-1',
    code: 'ABA/CU/001',
    name: 'Walk-In Customer',
    phone: '01700000000',
    district: 'Dhaka',
    address: 'Counter Cash Sale',
    balance: 0,
    isWalkIn: true
  },
  {
    id: 'cus-2',
    code: 'ABA/CU/002',
    name: 'Al-Amin Computers',
    phone: '01711234567',
    district: 'Chittagong',
    address: 'Agrabad C/A, Chittagong',
    balance: 75000
  },
  {
    id: 'cus-3',
    code: 'CUS-103',
    name: 'Tech Park BD',
    phone: '01819876543',
    district: 'Sylhet',
    address: 'Zindabazar, Sylhet',
    balance: 19000
  },
  {
    id: 'cus-4',
    code: 'CUS-104',
    name: 'Silicon Tech Systems',
    phone: '01912345678',
    district: 'Bogra',
    address: 'Kobi Nazrul Islam Road, Bogra',
    balance: 31000
  },
  {
    id: 'cus-5',
    code: 'CUS-105',
    name: 'Apex Solutions Ltd',
    phone: '01611122233',
    district: 'Barisal',
    address: 'Sadar Road, Barisal',
    balance: 49000
  },
  {
    id: 'cus-6',
    code: 'CUS-106',
    name: 'Rafiqul Islam (Personal)',
    phone: '01755443322',
    district: 'Dhaka',
    address: 'Uttara Sector 7, Dhaka',
    balance: 96500
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'City Laptop Zone',
    phone: '01712000001',
    address: 'Multiplan Center, Level 4, Elephant Road, Dhaka',
    balance: 22000
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'Best Laptop Gallery',
    phone: '01712000002',
    address: 'IDB Bhaban, BCS Computer City, Agargaon, Dhaka',
    balance: 439000
  },
  {
    id: 'sup-3',
    code: 'SUP-003',
    name: 'Smart Technologies BD Ltd',
    phone: '01811000003',
    address: 'Jahangir Tower, Karwan Bazar, Dhaka',
    balance: 0
  },
  {
    id: 'sup-4',
    code: 'SUP-004',
    name: 'UCC Computer Centre',
    phone: '01911000004',
    address: 'Eastern Plus Shopping Complex, Shantinagar, Dhaka',
    balance: 15000
  }
];

export const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-1',
    invoiceNo: 'PUR231026102',
    supplierId: 'sup-1',
    supplierName: 'City Laptop Zone',
    date: '2026-10-23',
    total: 22000,
    paid: 0,
    due: 22000,
    status: 'Due'
  },
  {
    id: 'pur-2',
    invoiceNo: 'PUR231026101',
    supplierId: 'sup-2',
    supplierName: 'Best Laptop Gallery',
    date: '2026-10-23',
    total: 54500,
    paid: 0,
    due: 54500,
    status: 'Due'
  },
  {
    id: 'pur-3',
    invoiceNo: 'PUR221026102',
    supplierId: 'sup-2',
    supplierName: 'Best Laptop Gallery',
    date: '2026-10-22',
    total: 156500,
    paid: 0,
    due: 156500,
    status: 'Due'
  },
  {
    id: 'pur-4',
    invoiceNo: 'PUR221026103',
    supplierId: 'sup-2',
    supplierName: 'Best Laptop Gallery',
    date: '2026-10-22',
    total: 29500,
    paid: 29500,
    due: 0,
    status: 'Paid'
  },
  {
    id: 'pur-5',
    invoiceNo: 'PUR221026101',
    supplierId: 'sup-2',
    supplierName: 'Best Laptop Gallery',
    date: '2026-10-22',
    total: 198500,
    paid: 0,
    due: 198500,
    status: 'Due'
  }
];

export const INITIAL_SALES: SalesInvoice[] = [
  {
    id: 'sel-1',
    invoiceNo: 'SEL231026102',
    customerId: 'cus-2',
    customerName: 'Al-Amin Computers',
    customerPhone: '01711234567',
    district: 'Chittagong',
    date: '2026-10-23',
    items: [
      {
        productId: 'prod-6',
        name: 'Dell Latitude 5420 Core i5',
        sku: 'LAP-DELL-5420',
        price: 46500,
        qty: 1,
        discount: 1500,
        warranty: '2 Years',
        total: 45000
      },
      {
        productId: 'prod-7',
        name: 'Lenovo ThinkPad T480s',
        sku: 'LAP-THINK-T480S',
        price: 35000,
        qty: 1,
        discount: 5000,
        warranty: '1 Year',
        total: 30000
      }
    ],
    subtotal: 81500,
    discount: 6500,
    taxVat: 0,
    grandTotal: 75000,
    paidAmount: 0,
    dueAmount: 75000,
    paymentMethod: 'Bank',
    status: 'Due'
  },
  {
    id: 'sel-2',
    invoiceNo: 'SEL231026101',
    customerId: 'cus-3',
    customerName: 'Tech Park BD',
    customerPhone: '01819876543',
    district: 'Sylhet',
    date: '2026-10-23',
    items: [
      {
        productId: 'prod-11',
        name: 'Kingston NV2 NVMe SSD 1TB',
        sku: 'SSD-KIN-1TB',
        price: 7500,
        qty: 2,
        discount: 0,
        warranty: '3 Years',
        total: 15000
      },
      {
        productId: 'prod-12',
        name: 'Corsair Vengeance DDR4 8GB',
        sku: 'RAM-COR-8GB',
        price: 2650,
        qty: 2,
        discount: 1300,
        warranty: 'Lifetime',
        total: 4000
      }
    ],
    subtotal: 20300,
    discount: 1300,
    taxVat: 0,
    grandTotal: 19000,
    paidAmount: 0,
    dueAmount: 19000,
    paymentMethod: 'bKash',
    status: 'Due'
  },
  {
    id: 'sel-3',
    invoiceNo: 'SEL221026101',
    customerId: 'cus-4',
    customerName: 'Silicon Tech Systems',
    customerPhone: '01912345678',
    district: 'Bogra',
    date: '2026-10-22',
    items: [
      {
        productId: 'prod-7',
        name: 'Lenovo ThinkPad T480s',
        sku: 'LAP-THINK-T480S',
        price: 35000,
        qty: 1,
        discount: 4000,
        warranty: '1 Year',
        total: 31000
      }
    ],
    subtotal: 35000,
    discount: 4000,
    taxVat: 0,
    grandTotal: 31000,
    paidAmount: 0,
    dueAmount: 31000,
    paymentMethod: 'Cash',
    status: 'Due'
  },
  {
    id: 'sel-4',
    invoiceNo: 'SEL201026101',
    customerId: 'cus-5',
    customerName: 'Apex Solutions Ltd',
    customerPhone: '01611122233',
    district: 'Barisal',
    date: '2026-10-20',
    items: [
      {
        productId: 'prod-8',
        name: 'HP EliteBook 840 G7',
        sku: 'LAP-HP-840G7',
        price: 48000,
        qty: 1,
        discount: 1000,
        warranty: '2 Years',
        total: 47000
      },
      {
        productId: 'prod-15',
        name: 'Logitech G102 Mouse',
        sku: 'ACC-LOG-G102',
        price: 2150,
        qty: 1,
        discount: 150,
        warranty: '2 Years',
        total: 2000
      }
    ],
    subtotal: 50150,
    discount: 1150,
    taxVat: 0,
    grandTotal: 49000,
    paidAmount: 0,
    dueAmount: 49000,
    paymentMethod: 'Bank',
    status: 'Due'
  },
  {
    id: 'sel-5',
    invoiceNo: 'SEL191026101',
    customerId: 'cus-6',
    customerName: 'Rafiqul Islam (Personal)',
    customerPhone: '01755443322',
    district: 'Dhaka',
    date: '2026-10-19',
    items: [
      {
        productId: 'prod-9',
        name: 'Apple MacBook Air M1',
        sku: 'LAP-MAC-M1',
        price: 83500,
        qty: 1,
        discount: 0,
        warranty: '1 Year',
        total: 83500
      },
      {
        productId: 'prod-11',
        name: 'Kingston NV2 NVMe SSD 1TB',
        sku: 'SSD-KIN-1TB',
        price: 7500,
        qty: 1,
        discount: 0,
        warranty: '3 Years',
        total: 7500
      },
      {
        productId: 'prod-10',
        name: 'Samsung 980 NVMe SSD 500GB',
        sku: 'SSD-SAM-980P',
        price: 5600,
        qty: 1,
        discount: 100,
        warranty: '3 Years',
        total: 5500
      }
    ],
    subtotal: 96600,
    discount: 100,
    taxVat: 0,
    grandTotal: 96500,
    paidAmount: 0,
    dueAmount: 96500,
    paymentMethod: 'Bank',
    status: 'Due'
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    date: '2026-10-23',
    expenseHead: 'Conveyance & Transport',
    amount: 4500,
    paidTo: 'Pathao Courier & SA Paribahan',
    paymentMethod: 'Cash',
    note: 'Laptop shipment parcel to Sylhet and Chittagong'
  },
  {
    id: 'exp-2',
    date: '2026-10-22',
    expenseHead: 'Entertainment & Staff Snacks',
    amount: 1800,
    paidTo: 'Tasty Treat',
    paymentMethod: 'Cash',
    note: 'Team lunch and customer refreshments'
  },
  {
    id: 'exp-3',
    date: '2026-10-20',
    expenseHead: 'Showroom Electricity Bill',
    amount: 6500,
    paidTo: 'DESCO',
    paymentMethod: 'bKash',
    note: 'Electricity bill October 2026'
  },
  {
    id: 'exp-4',
    date: '2026-10-15',
    expenseHead: 'Showroom Rent',
    amount: 30000,
    paidTo: 'Building Landlord',
    paymentMethod: 'Bank',
    note: 'Monthly showroom rent'
  }
];

export const INITIAL_CHEQUES: ChequeRecord[] = [
  {
    id: 'chk-1',
    chequeNo: '0000139',
    bankName: 'Islami Bank Bangladesh',
    partyName: 'Infosystem Technology Limited',
    date: '01 Oct 2026',
    amount: 45000,
    type: 'Receive',
    status: 'Pending'
  },
  {
    id: 'chk-2',
    chequeNo: '0000138',
    bankName: 'Dutch-Bangla Bank',
    partyName: 'Infosystem Technology Limited',
    date: '01 Sep 2026',
    amount: 60000,
    type: 'Receive',
    status: 'Pending'
  },
  {
    id: 'chk-3',
    chequeNo: '0000137',
    bankName: 'Prime Bank Ltd',
    partyName: 'Infosystem Technology Limited',
    date: '01 Sep 2026',
    amount: 25000,
    type: 'Receive',
    status: 'Pending'
  },
  {
    id: 'chk-4',
    chequeNo: 'JHGHHJGHJ',
    bankName: 'City Bank Ltd',
    partyName: 'Best Laptop Gallery',
    date: '10 Apr 2026',
    amount: 50000,
    type: 'Given',
    status: 'Pending'
  }
];

export const INITIAL_BANKS: BankMaster[] = [
  {
    id: 'bm-1',
    sn: 1,
    name: 'BRAC BANK',
    sortName: 'BRAC',
    status: 'Active'
  },
  {
    id: 'bm-2',
    sn: 2,
    name: 'CITY BANK',
    sortName: 'CITY',
    status: 'Active'
  },
  {
    id: 'bm-3',
    sn: 3,
    name: 'DUTCH BANGLA BANK',
    sortName: 'DBBL',
    status: 'Active'
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    sn: 1,
    bankName: 'DUTCH BANGLA BANK',
    accountNo: '0987654321',
    accountTitle: 'Tech Drive Corporate',
    branchName: 'Mirpur 10',
    branchCode: 'DBBL-MIR10',
    branchLocation: 'Dhaka-1216',
    accountType: 'Current',
    debit: 450000,
    credit: 210000,
    balance: 240000
  },
  {
    id: 'bank-2',
    sn: 2,
    bankName: 'BRAC BANK',
    accountNo: '1501204892001',
    accountTitle: 'Tech Drive Operations',
    branchName: 'Elephant Road',
    branchCode: 'BRAC-ELP02',
    branchLocation: 'Dhaka-1205',
    accountType: 'Current',
    debit: 620000,
    credit: 234600,
    balance: 385400
  },
  {
    id: 'bank-3',
    sn: 3,
    bankName: 'CITY BANK',
    accountNo: '21098457201',
    accountTitle: 'Tech Drive Collection',
    branchName: 'Gulshan 1',
    branchCode: 'CITY-GLS01',
    branchLocation: 'Dhaka-1212',
    accountType: 'Current',
    debit: 310000,
    credit: 115000,
    balance: 195000
  }
];

export const INITIAL_MOBILE_ACCOUNTS: MobileAccount[] = [
  {
    id: 'mob-1',
    sn: 1,
    name: 'bKash Merchant Account',
    mobile: '01616170071',
    balance: 64800,
    provider: 'bKash',
    status: 'Active'
  },
  {
    id: 'mob-2',
    sn: 2,
    name: 'Nagad Commercial Account',
    mobile: '01751871072',
    balance: 32500,
    provider: 'Nagad',
    status: 'Active'
  },
  {
    id: 'mob-3',
    sn: 3,
    name: 'Rocket Corporate Account',
    mobile: '01911223344',
    balance: 18200,
    provider: 'Rocket',
    status: 'Active'
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'bt-1',
    sn: 1,
    traNo: 'TR-20261023-01',
    date: '2026-10-23',
    depositFrom: 'Cash Collection (Showroom)',
    depositTo: 'DUTCH BANGLA BANK - 0987654321',
    chequeNo: 'CQ-98124',
    chequeDate: '2026-10-23',
    ref: 'INV-2026-089',
    amount: 75000,
    note: 'Daily showroom cash deposit to primary account'
  },
  {
    id: 'bt-2',
    sn: 2,
    traNo: 'TR-20261021-02',
    date: '2026-10-21',
    depositFrom: 'BRAC BANK - 1501204892001',
    depositTo: 'Best Laptop Gallery (Supplier)',
    chequeNo: '0000139',
    chequeDate: '2026-10-21',
    ref: 'PO-881',
    amount: 50000,
    note: 'Motherboard and ThinkPad stock settlement'
  },
  {
    id: 'bt-3',
    sn: 3,
    traNo: 'TR-20261018-03',
    date: '2026-10-18',
    depositFrom: 'bKash Merchant - 01616170071',
    depositTo: 'DUTCH BANGLA BANK - 0987654321',
    chequeNo: 'MFS-SWP-101',
    chequeDate: '2026-10-18',
    ref: 'MFS-TRF-09',
    amount: 30000,
    note: 'bKash merchant wallet sweep to bank'
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dep-1', sn: 1, name: 'Customer Service & Support', code: 'CSS', description: 'Customer inquiry, warranty reception and repair ticket support', employeeCount: 2 },
  { id: 'dep-2', sn: 2, name: 'Finance & Accounting Department', code: 'FAD', description: 'General ledger, payments, tax, bank transfers and cash reconciliations', employeeCount: 2 },
  { id: 'dep-3', sn: 3, name: 'HR & Admin Department', code: 'HRA', description: 'Recruitment, attendance records, payroll slips and office administration', employeeCount: 2 },
  { id: 'dep-4', sn: 4, name: 'IT & Technology Department', code: 'ITD', description: 'Chip level motherboard servicing, bios lock release, hardware testing', employeeCount: 2 },
  { id: 'dep-5', sn: 5, name: 'Logistics and Shipping Department', code: 'LSD', description: 'Product delivery, branch dispatches, courier consignments', employeeCount: 2 },
  { id: 'dep-6', sn: 6, name: 'Procurement & Supply Chain', code: 'PSC', description: 'Supplier contracts, wholesale sourcing, import batches', employeeCount: 2 },
  { id: 'dep-7', sn: 7, name: 'Purchase', code: 'PUR', description: 'Local component purchases, vendor billing and quote comparisons', employeeCount: 2 },
  { id: 'dep-8', sn: 8, name: 'Quality Control & Assurance', code: 'QCA', description: 'Screen, battery, keyboard, motherboard diagnostic checklists', employeeCount: 2 },
  { id: 'dep-9', sn: 9, name: 'Sales & Marketing Department', code: 'SMD', description: 'Retail counter sales, corporate quotation, digital promotions', employeeCount: 4 }
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  { id: 'des-1', sn: 1, name: 'CEO', department: 'Finance & Accounting Department', description: 'owner' },
  { id: 'des-2', sn: 2, name: 'Executive', department: 'Sales & Marketing Department', description: 'Corporate & Showroom Laptop Operations' },
  { id: 'des-3', sn: 3, name: 'Marketing Manger', department: 'Sales & Marketing Department', description: 'Department head of Marketing' },
  { id: 'des-4', sn: 4, name: 'Sales Executive', department: 'Sales & Marketing Department', description: 'Showroom sales and client follow up' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-10013',
    employeeId: 'EM-10013',
    name: 'RABBI ISLAM',
    fatherName: 'Nurul Islam',
    motherName: 'Rokeya Begum',
    dob: '1995-03-20',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    department: 'Sales & Marketing Department',
    designation: 'Sales Executive',
    joiningDate: '2022-04-10',
    branch: 'No-Branch',
    mobile: '01718401862',
    phone: '',
    email: '',
    nid: '19952699876543210',
    basicSalary: 8500,
    houseRent: 2000,
    medicalAllowance: 1000,
    conveyance: 500,
    salary: 12000,
    status: 'Active',
    address: 'New Elephant Road, Dhaka',
    permanentAddress: 'Bogra'
  },
  {
    id: 'emp-40011',
    employeeId: 'EM-40011',
    name: 'Mohammad Forhad Hossain',
    fatherName: 'Late Abdul Hossain',
    motherName: 'Fatema Begum',
    dob: '1988-06-15',
    gender: 'Male',
    bloodGroup: 'B+',
    maritalStatus: 'Married',
    department: 'Finance & Accounting Department',
    designation: 'CEO',
    joiningDate: '2020-01-01',
    branch: 'No-Branch',
    mobile: '01751871072',
    phone: '',
    email: '',
    nid: '19882691234567890',
    basicSalary: 20000,
    houseRent: 6000,
    medicalAllowance: 2500,
    conveyance: 1500,
    salary: 30000,
    status: 'Active',
    address: 'Mirpur 10, Dhaka',
    permanentAddress: 'Chandpur'
  },
  {
    id: 'emp-10014',
    employeeId: 'EM-10014',
    name: 'Azad Shah',
    fatherName: 'Abul Shah',
    motherName: 'Nasrin Shah',
    dob: '1992-08-11',
    gender: 'Male',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    joiningDate: '2021-08-01',
    branch: 'No-Branch',
    mobile: '+8801675666998',
    phone: '',
    email: '',
    nid: '19922694567812345',
    basicSalary: 14000,
    houseRent: 3500,
    medicalAllowance: 1500,
    conveyance: 1000,
    salary: 20000,
    status: 'Active',
    address: 'Mirpur, Dhaka',
    permanentAddress: 'Sylhet'
  },
  {
    id: 'emp-10012',
    employeeId: 'EM-10012',
    name: 'ABU SIAM',
    fatherName: 'Sultan Ahmed',
    motherName: 'Rina Begum',
    dob: '1994-05-19',
    gender: 'Male',
    bloodGroup: 'B+',
    maritalStatus: 'Single',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    joiningDate: '2021-03-15',
    branch: 'No-Branch',
    mobile: '01788548782',
    phone: '',
    email: '',
    nid: '19942693214567890',
    basicSalary: 16000,
    houseRent: 4000,
    medicalAllowance: 2000,
    conveyance: 1000,
    salary: 23000,
    status: 'Active',
    address: 'Elephant Road, Dhaka',
    permanentAddress: 'Mymensingh'
  },
  {
    id: 'emp-10001',
    employeeId: 'EM-10001',
    name: 'Abdul Ahad',
    fatherName: 'Late Rahim Ullah',
    motherName: 'Ayesha Khatun',
    dob: '1990-12-05',
    gender: 'Male',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    department: 'Sales & Marketing Department',
    designation: 'Marketing Manger',
    joiningDate: '2020-05-01',
    branch: 'No-Branch',
    mobile: '01878729216',
    phone: '',
    email: '',
    nid: '19902697891234560',
    basicSalary: 14000,
    houseRent: 3500,
    medicalAllowance: 1500,
    conveyance: 1000,
    salary: 20000,
    status: 'Active',
    address: 'Multiplan Center, Dhaka',
    permanentAddress: 'Chittagong'
  }
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  { id: 'lt-1', sn: 1, name: 'Weekly Day off', days: 4, isPaid: true, description: 'Weekly 1 monthly 4' },
  { id: 'lt-2', sn: 2, name: 'Casual Leave (CL)', days: 14, isPaid: true, description: 'Annual standard casual leave' },
  { id: 'lt-3', sn: 3, name: 'Sick Leave (SL)', days: 14, isPaid: true, description: 'Medical certified recovery leave' }
];

export const INITIAL_LEAVE_RECORDS: LeaveRecord[] = [
  {
    id: 'lr-1',
    sn: 1,
    employeeId: 'EM-10001',
    employeeName: 'Abdul Ahad (Marketing Manger)',
    leaveType: 'Weekly Day off',
    fromDate: '24 Sep 2026',
    toDate: '28 Sep 2026',
    totalDays: 5,
    reason: 'Weekly designated off days adjustment',
    status: 'Approved',
    appliedDate: '26 Sep 2026'
  }
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'EM-10013',
    employeeName: 'RABBI ISLAM',
    department: 'Sales & Marketing Department',
    designation: 'Sales Executive',
    year: 2026,
    month: 'September',
    branch: 'No-Branch',
    grossSalary: 12000,
    absentDays: 0,
    lateDays: 1,
    leaveDays: 0,
    presentDays: 26,
    presentAmount: 12000,
    monthWorkingDays: 26,
    workingHourPerDay: 9,
    perHourOvertimeRate: 51.28,
    overtimeHours: 10,
    totalOvertimeAmount: 512.8
  },
  {
    id: 'att-2',
    employeeId: 'EM-40011',
    employeeName: 'Mohammad Forhad Hossain',
    department: 'Finance & Accounting Department',
    designation: 'CEO',
    year: 2026,
    month: 'September',
    branch: 'No-Branch',
    grossSalary: 30000,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    presentDays: 26,
    presentAmount: 30000,
    monthWorkingDays: 26,
    workingHourPerDay: 9,
    perHourOvertimeRate: 128.21,
    overtimeHours: 0,
    totalOvertimeAmount: 0
  },
  {
    id: 'att-3',
    employeeId: 'EM-10014',
    employeeName: 'Azad Shah',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    year: 2026,
    month: 'September',
    branch: 'No-Branch',
    grossSalary: 20000,
    absentDays: 1,
    lateDays: 2,
    leaveDays: 0,
    presentDays: 25,
    presentAmount: 19230.77,
    monthWorkingDays: 26,
    workingHourPerDay: 9,
    perHourOvertimeRate: 85.47,
    overtimeHours: 6,
    totalOvertimeAmount: 512.82
  },
  {
    id: 'att-4',
    employeeId: 'EM-10012',
    employeeName: 'ABU SIAM',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    year: 2026,
    month: 'September',
    branch: 'No-Branch',
    grossSalary: 23000,
    absentDays: 0,
    lateDays: 1,
    leaveDays: 1,
    presentDays: 25,
    presentAmount: 23000,
    monthWorkingDays: 26,
    workingHourPerDay: 9,
    perHourOvertimeRate: 98.29,
    overtimeHours: 8,
    totalOvertimeAmount: 786.32
  },
  {
    id: 'att-5',
    employeeId: 'EM-10001',
    employeeName: 'Abdul Ahad',
    department: 'Sales & Marketing Department',
    designation: 'Marketing Manger',
    year: 2026,
    month: 'September',
    branch: 'No-Branch',
    grossSalary: 20000,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 5,
    presentDays: 21,
    presentAmount: 20000,
    monthWorkingDays: 26,
    workingHourPerDay: 9,
    perHourOvertimeRate: 85.47,
    overtimeHours: 12,
    totalOvertimeAmount: 1025.64
  }
];

export const INITIAL_PAYSLIPS: PayslipItem[] = [
  {
    id: 'ps-1',
    employeeId: 'EM-10013',
    employeeName: 'RABBI ISLAM',
    department: 'Sales & Marketing Department',
    designation: 'Sales Executive',
    salaryMonth: 'September 2026',
    basicSalary: 8500,
    allowance: 3500,
    grossSalary: 12000,
    deductAbsent: 0,
    deductLate: 0,
    allowLeave: 0,
    presentDays: 26,
    presentAmount: 12000,
    deduction: 0,
    netPayable: 12512.8,
    perHourOvertimeRate: 51.28,
    overtimeHours: 10,
    totalOvertimeAmount: 512.8,
    status: 'Paid',
    paidDate: '2026-09-30'
  },
  {
    id: 'ps-2',
    employeeId: 'EM-40011',
    employeeName: 'Mohammad Forhad Hossain',
    department: 'Finance & Accounting Department',
    designation: 'CEO',
    salaryMonth: 'September 2026',
    basicSalary: 20000,
    allowance: 10000,
    grossSalary: 30000,
    deductAbsent: 0,
    deductLate: 0,
    allowLeave: 0,
    presentDays: 26,
    presentAmount: 30000,
    deduction: 0,
    netPayable: 30000,
    perHourOvertimeRate: 128.21,
    overtimeHours: 0,
    totalOvertimeAmount: 0,
    status: 'Paid',
    paidDate: '2026-09-30'
  },
  {
    id: 'ps-3',
    employeeId: 'EM-10014',
    employeeName: 'Azad Shah',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    salaryMonth: 'September 2026',
    basicSalary: 14000,
    allowance: 6000,
    grossSalary: 20000,
    deductAbsent: 769.23,
    deductLate: 0,
    allowLeave: 0,
    presentDays: 25,
    presentAmount: 19230.77,
    deduction: 769.23,
    netPayable: 19743.59,
    perHourOvertimeRate: 85.47,
    overtimeHours: 6,
    totalOvertimeAmount: 512.82,
    status: 'Paid',
    paidDate: '2026-09-30'
  },
  {
    id: 'ps-4',
    employeeId: 'EM-10012',
    employeeName: 'ABU SIAM',
    department: 'Sales & Marketing Department',
    designation: 'Executive',
    salaryMonth: 'September 2026',
    basicSalary: 16000,
    allowance: 7000,
    grossSalary: 23000,
    deductAbsent: 0,
    deductLate: 0,
    allowLeave: 0,
    presentDays: 25,
    presentAmount: 23000,
    deduction: 0,
    netPayable: 23786.32,
    perHourOvertimeRate: 98.29,
    overtimeHours: 8,
    totalOvertimeAmount: 786.32,
    status: 'Paid',
    paidDate: '2026-09-30'
  },
  {
    id: 'ps-5',
    employeeId: 'EM-10001',
    employeeName: 'Abdul Ahad',
    department: 'Sales & Marketing Department',
    designation: 'Marketing Manger',
    salaryMonth: 'September 2026',
    basicSalary: 14000,
    allowance: 6000,
    grossSalary: 20000,
    deductAbsent: 0,
    deductLate: 0,
    allowLeave: 0,
    presentDays: 21,
    presentAmount: 20000,
    deduction: 0,
    netPayable: 21025.64,
    perHourOvertimeRate: 85.47,
    overtimeHours: 12,
    totalOvertimeAmount: 1025.64,
    status: 'Paid',
    paidDate: '2026-09-30'
  }
];

export const INITIAL_PERSONAL_NOTES: PersonalNote[] = [
  {
    id: 'note-1',
    title: 'Supplier Meeting Notes - Lenovo Thinkpad stock arrival schedule on next Tuesday',
    content: 'Discussed with Best Laptop Gallery regarding 15 units of Lenovo ThinkPad T480s and 10 units Dell 5420. Need to arrange bank transfer from DBBL account on Monday before 2 PM. Delivery inspection team must prepare serial barcodes.',
    date: '23 Oct 2026',
    time: '03:15 PM',
    tag: 'Work',
    isFavorite: true,
    isPinned: true
  },
  {
    id: 'note-2',
    title: 'Warranty claim process review for Dell Latitude motherboards',
    content: 'Review customer warranty claims with technical team. Ensure all original serial number seals are intact and battery health reports are printed before sending replacement units to supplier.',
    date: '21 Oct 2026',
    time: '11:30 AM',
    tag: 'Important',
    isFavorite: true,
    isPinned: false
  },
  {
    id: 'note-3',
    title: 'Staff monthly incentives and holiday attendance allowance calculation criteria',
    content: 'Attendance cut-off is set to 25th of every month. Sales staff exceeding BDT 500,000 threshold receive 1.5% commission on collected dues.',
    date: '18 Oct 2026',
    time: '06:45 PM',
    tag: 'Personal',
    isFavorite: false,
    isPinned: false
  }
];

export const INITIAL_TODOS: TodoTask[] = [
  {
    id: 'td-1',
    title: 'Verify DBBL cheque deposit clearance from customer Al-Amin Computers',
    priority: 'High',
    dueDate: '2026-10-24',
    category: 'Banking',
    completed: false,
    createdAt: '2026-10-23'
  },
  {
    id: 'td-2',
    title: 'Inspect 10 units Dell Latitude 5420 received from supplier Best Laptop Gallery',
    priority: 'Medium',
    dueDate: '2026-10-25',
    category: 'QC & Inventory',
    completed: false,
    createdAt: '2026-10-23'
  },
  {
    id: 'td-3',
    title: 'Generate October 2026 payroll payslips and disburse bank transfers',
    priority: 'High',
    dueDate: '2026-10-26',
    category: 'Payroll',
    completed: false,
    createdAt: '2026-10-22'
  },
  {
    id: 'td-4',
    title: 'Send quotation to Silicon Tech Systems for 5 units Apple M1 MacBook Air',
    priority: 'Low',
    dueDate: '2026-10-27',
    category: 'Sales',
    completed: true,
    createdAt: '2026-10-21'
  }
];

export const ERP_MODULE_SECTIONS = [
  {
    name: 'Daily Process',
    items: ['Price List', 'Expenses Record', 'Expenses Head']
  },
  {
    name: 'Operation Process',
    items: ['Proforma Invoice', 'LC', 'Invoice', 'Delivery Record']
  },
  {
    name: 'Client',
    items: ['Customer', 'Supplier']
  },
  {
    name: 'Product',
    items: ['Parent', 'Category', 'Sub-Category', 'Product']
  },
  {
    name: 'Master',
    items: ['Brand', 'Manufacturer', 'Unit', 'Currency', 'Country', 'Shipping']
  },
  {
    name: 'Accounts',
    items: [
      'Account Chart',
      'Ledger Head',
      'Customer Ledger',
      'Supplier Ledger',
      'Account Ledger',
      'Payment Voucher',
      'Received Voucher',
      'Journal Entry'
    ]
  },
  {
    name: 'Financials',
    items: ['Chart Of Account', 'Profit & Loss', 'Trial Balance', 'Balance Sheet', 'Finance Analysis']
  },
  {
    name: 'Payroll',
    items: [
      'Department',
      'Designation',
      'Employee',
      'Leave',
      'Leave Record',
      'Leave Application',
      'Attendance & Payslip'
    ]
  },
  {
    name: 'Bank',
    items: ['Bank', 'Account', 'Transaction']
  },
  {
    name: 'User & Role',
    items: ['User Role', 'User']
  },
  {
    name: 'Report',
    items: ['Report']
  },
  {
    name: 'Purchase',
    items: ['Purchase Order', 'Purchase Invoice', 'Purchase Return']
  },
  {
    name: 'Sales',
    items: ['Sales Estimate', 'Sales Invoice', 'Sales Return']
  },
  {
    name: 'Service',
    items: ['Service List', 'Service Received List', 'Sales Service']
  },
  {
    name: 'Warranty Management',
    items: [
      'Warranty Claim',
      'Product Checking',
      'Manage Proudct',
      'Warranty Deliver',
      'Warranty Stock',
      'Claim to Supplier',
      'Service Center'
    ]
  },
  {
    name: 'Inventory',
    items: [
      'Branch',
      'Warehouse',
      'Product Delivery',
      'Product Received',
      'Branch Stock',
      'Warehouse Stock',
      'Combined Stock',
      'Transfer From Branch',
      'Transfer From Warehouse',
      'Proudct Disposal'
    ]
  }
];

export const ERP_MODULE_TOGGLES = [
  'Daily Process',
  'Purchase',
  'Sales',
  'Service',
  'Inventory',
  'Operation Process',
  'Client',
  'Product',
  'Master',
  'Accounts',
  'Financials',
  'Payroll',
  'Bank',
  'User & Role',
  'Report',
  'Warranty Management',
  'Installment & Loan Setup',
  'Personal',
  'Home'
];

export const INITIAL_ROLES = [
  {
    id: 'role-1',
    sn: 1,
    name: 'Administration',
    status: 'Active' as const,
    description: 'All access are open for this role',
    moduleAccess: ERP_MODULE_TOGGLES.reduce((acc, m) => ({ ...acc, [m]: true }), {}),
    permissions: ERP_MODULE_SECTIONS.reduce((acc, sec) => {
      acc[sec.name] = sec.items.reduce((secAcc, item) => {
        secAcc[item] = { read: true, write: true, edit: true, delete: true, print: true };
        return secAcc;
      }, {} as any);
      return acc;
    }, {} as any)
  },
  {
    id: 'role-2',
    sn: 2,
    name: 'Azad shah',
    status: 'Active' as const,
    description: 'All access are open for this role',
    moduleAccess: ERP_MODULE_TOGGLES.reduce((acc, m) => ({ ...acc, [m]: true }), {}),
    permissions: ERP_MODULE_SECTIONS.reduce((acc, sec) => {
      acc[sec.name] = sec.items.reduce((secAcc, item) => {
        secAcc[item] = { read: true, write: true, edit: true, delete: true, print: true };
        return secAcc;
      }, {} as any);
      return acc;
    }, {} as any)
  },
  {
    id: 'role-3',
    sn: 3,
    name: 'Staff access',
    status: 'Active' as const,
    description: '',
    moduleAccess: ERP_MODULE_TOGGLES.reduce((acc, m) => {
      acc[m] = ['Daily Process', 'Sales', 'Service', 'Product', 'Inventory'].includes(m);
      return acc;
    }, {} as Record<string, boolean>),
    permissions: ERP_MODULE_SECTIONS.reduce((acc, sec) => {
      acc[sec.name] = sec.items.reduce((secAcc, item) => {
        const canWrite = ['Sales', 'Daily Process'].includes(sec.name);
        secAcc[item] = { read: true, write: canWrite, edit: false, delete: false, print: true };
        return secAcc;
      }, {} as any);
      return acc;
    }, {} as any)
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    sn: 1,
    name: 'Tech Drive',
    nameBn: 'টেক ড্রাইভ',
    email: 'info.techdrivebd@gmail.com',
    role: 'Administration',
    branch: 'Main Branch',
    status: 'Active' as const,
    avatar: ''
  },
  {
    id: 'usr-2',
    sn: 2,
    name: 'Azad shah',
    nameBn: 'আজাদ শাহ',
    email: 'azadshah034@gmail.com',
    role: 'Azad shah',
    branch: 'Main Branch',
    status: 'Active' as const,
    avatar: ''
  },
  {
    id: 'usr-3',
    sn: 3,
    name: 'Staff access',
    nameBn: 'স্টাফ এক্সেস',
    email: 'md.forhad.hossain.net@gmail.com',
    role: 'Staff access',
    branch: 'Elephant Road Branch',
    status: 'Active' as const,
    avatar: ''
  },
  {
    id: 'usr-4',
    sn: 4,
    name: 'Saymon',
    nameBn: 'সায়মন',
    email: 'alehsantradinglimited@gmail.com',
    role: 'Administration',
    branch: 'Main Branch',
    status: 'Active' as const,
    avatar: ''
  }
];

export const INITIAL_HISTORY_LOGS = [
  {
    id: 'hist-dept-1',
    date: '07 Nov 2025',
    time: '04:54:19 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Procurement & Supply Chain'
  },
  {
    id: 'hist-dept-2',
    date: '07 Nov 2025',
    time: '04:53:23 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Customer Service & Support'
  },
  {
    id: 'hist-dept-3',
    date: '07 Nov 2025',
    time: '04:52:36 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Quality Control & Assurance'
  },
  {
    id: 'hist-dept-4',
    date: '07 Nov 2025',
    time: '04:52:05 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Logistics and Shipping Department'
  },
  {
    id: 'hist-dept-5',
    date: '07 Nov 2025',
    time: '04:51:25 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Purchase'
  },
  {
    id: 'hist-dept-6',
    date: '07 Nov 2025',
    time: '04:50:56 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Finance & Accounting Department'
  },
  {
    id: 'hist-dept-7',
    date: '07 Nov 2025',
    time: '04:50:23 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: IT & Technology Department'
  },
  {
    id: 'hist-dept-8',
    date: '07 Nov 2025',
    time: '04:49:57 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: Sales & Marketing Department'
  },
  {
    id: 'hist-dept-9',
    date: '07 Nov 2025',
    time: '04:47:49 PM',
    actor: 'Tech Drive',
    action: 'Department has been Added',
    details: 'New Department Add: HR & Admin Department'
  },
  {
    id: 'hist-desig-1',
    date: '07 Nov 2025',
    time: '04:45:10 PM',
    actor: 'Tech Drive',
    action: 'Designation has been Added',
    details: 'Designation name: CEO'
  },
  {
    id: 'hist-desig-2',
    date: '07 Nov 2025',
    time: '04:44:02 PM',
    actor: 'Tech Drive',
    action: 'Designation has been Added',
    details: 'Designation name: Marketing Manger'
  },
  {
    id: 'hist-1',
    date: '22 Oct 2026',
    time: '12:24:15 PM',
    actor: 'Tech Drive',
    action: 'User has been Added',
    details: 'New User Add: Saymon'
  },
  {
    id: 'hist-2',
    date: '09 Oct 2026',
    time: '11:47:18 PM',
    actor: 'Tech Drive',
    action: 'User has been deleted',
    details: 'User name: Symon Azad'
  },
  {
    id: 'hist-3',
    date: '18 Aug 2026',
    time: '04:45:23 PM',
    actor: 'Tech Drive',
    action: 'User has been Added',
    details: 'New User Add: Symon Azad'
  },
  {
    id: 'hist-4',
    date: '06 Feb 2026',
    time: '06:41:56 PM',
    actor: 'Tech Drive',
    action: 'User has been Added',
    details: 'New User Add: Staff access'
  },
  {
    id: 'hist-5',
    date: '06 Feb 2026',
    time: '06:37:34 PM',
    actor: 'Tech Drive',
    action: 'Role has been created',
    details: 'New Role Add: Staff access'
  },
  {
    id: 'hist-6',
    date: '06 Jan 2026',
    time: '07:22:51 PM',
    actor: 'Tech Drive',
    action: 'User has been deleted',
    details: 'User name: Shadat Hossain'
  },
  {
    id: 'hist-7',
    date: '18 Dec 2025',
    time: '07:54:14 PM',
    actor: 'Tech Drive',
    action: 'User has been Added',
    details: 'New User Add: Azad shah'
  },
  {
    id: 'hist-8',
    date: '18 Dec 2025',
    time: '07:51:26 PM',
    actor: 'Tech Drive',
    action: 'Role has been created',
    details: 'New Role Add: Azad shah'
  },
  {
    id: 'hist-9',
    date: '18 Dec 2025',
    time: '07:42:10 PM',
    actor: 'Tech Drive',
    action: 'Role has been updated',
    details: 'Role Name: Administration'
  }
];
