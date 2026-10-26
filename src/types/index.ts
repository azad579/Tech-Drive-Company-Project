export interface Product {
  id: string;
  sn: number;
  sku: string;
  code?: string;
  name: string;
  parentCategory?: string;
  category: string;
  subCategory?: string;
  brand: string;
  purchasePrice: number;
  salePrice: number;
  costPrice?: number;
  oldPrice?: number;
  currentPrice?: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  warranty: string;
  warrantyDays?: number;
  lastUpdated?: string;
  image?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  district: string;
  address: string;
  balance: number;
  isWalkIn?: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  discount: number;
  warranty: string;
  serialNumber?: string;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  district?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxVat: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket';
  status: 'Paid' | 'Due' | 'Partial';
  notes?: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items?: InvoiceItem[];
  total: number;
  paid: number;
  due: number;
  status: 'Paid' | 'Due' | 'Partial';
}

export interface ExpenseRecord {
  id: string;
  date: string;
  expenseHead: string;
  amount: number;
  paidTo: string;
  paymentMethod: 'Cash' | 'Bank' | 'bKash';
  note?: string;
}

export interface ChequeRecord {
  id: string;
  chequeNo: string;
  bankName: string;
  partyName: string;
  date: string;
  amount: number;
  type: 'Receive' | 'Given';
  status: 'Pending' | 'Cleared' | 'Bounced';
}

export interface BankAccount {
  id: string;
  sn?: number;
  bankName: string;
  accountNo: string;
  accountTitle?: string;
  branchName?: string;
  branchCode?: string;
  branchLocation?: string;
  accountType?: 'Current' | 'Savings' | 'Mobile Banking';
  debit?: number;
  credit?: number;
  balance: number;
}

export interface BankMaster {
  id: string;
  sn: number;
  name: string;
  sortName: string;
  status?: 'Active' | 'Inactive';
}

export interface MobileAccount {
  id: string;
  sn: number;
  name: string;
  mobile: string;
  balance: number;
  provider?: string;
  status?: 'Active' | 'Inactive';
}

export interface BankTransaction {
  id: string;
  sn: number;
  traNo: string;
  date: string;
  depositFrom: string;
  depositTo: string;
  chequeNo?: string;
  chequeDate?: string;
  ref?: string;
  amount: number;
  note?: string;
}

export interface Department {
  id: string;
  sn: number;
  name: string;
  code?: string;
  description?: string;
  employeeCount?: number;
}

export interface Designation {
  id: string;
  sn: number;
  name: string;
  department: string;
  description?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  department: string;
  designation: string;
  joiningDate: string;
  branch: string;
  mobile: string;
  phone?: string;
  email: string;
  nid?: string;
  basicSalary: number;
  houseRent?: number;
  medicalAllowance?: number;
  conveyance?: number;
  salary: number;
  status: 'Active' | 'Inactive';
  image?: string;
  address?: string;
  permanentAddress?: string;
}

export interface LeaveType {
  id: string;
  sn: number;
  name: string;
  days: number;
  isPaid: boolean;
  description?: string;
}

export interface LeaveRecord {
  id: string;
  sn: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  year: number;
  month: string;
  branch: string;
  grossSalary?: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  presentAmount?: number;
  monthWorkingDays?: number;
  workingHourPerDay?: number;
  perHourOvertimeRate?: number;
  overtimeHours: number;
  totalOvertimeAmount?: number;
}

export interface PayslipItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  salaryMonth: string;
  basicSalary: number;
  allowance: number;
  grossSalary: number;
  deductAbsent?: number;
  deductLate?: number;
  allowLeave?: number;
  presentDays?: number;
  presentAmount?: number;
  deduction: number;
  netPayable: number;
  perHourOvertimeRate?: number;
  overtimeHours?: number;
  totalOvertimeAmount?: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
  paidDate?: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  tag: 'Personal' | 'Work' | 'Social' | 'Important';
  isFavorite: boolean;
  isPinned: boolean;
}

export interface TodoTask {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

export interface UserSession {
  email: string;
  name: string;
  role: string;
  branch: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface RoleItem {
  id: string;
  sn: number;
  name: string;
  status: 'Active' | 'Inactive';
  description: string;
  moduleAccess: Record<string, boolean>;
  permissions: Record<string, Record<string, {
    read: boolean;
    write: boolean;
    edit: boolean;
    delete: boolean;
    print: boolean;
  }>>;
}

export interface UserItem {
  id: string;
  sn: number;
  name: string;
  nameBn?: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  createdAt?: string;
}

export interface HistoryLogItem {
  id: string;
  date: string;
  time: string;
  actor: string;
  action: string;
  details: string;
}

export interface ServiceItem {
  id: string;
  sn: number;
  code: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface ServiceReceived {
  id: string;
  sn: number;
  date: string;
  invoiceNo: string;
  customerName: string;
  phone: string;
  address?: string;
  productName: string;
  productModel: string;
  problem: string;
  deliveryDate: string;
  status: 'Received' | 'In Service' | 'Ready' | 'Delivered';
  remarks?: string;
}

export interface ServiceSale {
  id: string;
  sn: number;
  date: string;
  invoiceNo: string;
  customerName: string;
  phone?: string;
  total: number;
  discount: number;
  vat: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Due';
  items: Array<{
    id: string;
    code: string;
    name: string;
    price: number;
    qty: number;
    discount: number;
    subtotal: number;
  }>;
}

export interface WarrantyClaim {
  id: string;
  sn: number;
  date: string;
  claimNo: string;
  productName: string;
  serial: string;
  invoiceNo: string;
  salesDate: string;
  warrantyExpired: string;
  status: 'Checking' | 'Send for Warranty' | 'Product Successfully Delivered!!!' | 'Warranty Denied & Send To Delivery';
  claimNote?: string;
  checkingNote?: string;
  serviceCenter?: string;
}

export interface WarrantyChecking {
  id: string;
  claimNo: string;
  serial: string;
  claimNote: string;
  checkingNote: string;
  status: 'Warranty Denied & Send To Delivery' | 'Send for Warranty' | 'Checking';
}

export interface WarrantyProductManage {
  id: string;
  claimNo: string;
  product: string;
  serial: string;
  status: 'Waiting For Received' | 'Received & Replaced' | 'Delivered';
  receivedDetails?: string;
  replacedSerial?: string;
}

export interface WarrantyDelivered {
  id: string;
  sn: number;
  claimNo: string;
  product: string;
  serial: string;
  deliveredProduct: string;
  deliveredSerial: string;
  settlement: string;
  deliveryNote: string;
  status: string;
  date: string;
}

export interface WarrantyStockItem {
  id: string;
  sn: number;
  productName: string;
  inQty: number;
  outQty: number;
  deliveredQty: number;
  availableQty: number;
  badStockIn: number;
  badStockOut: number;
  badStockAvailable: number;
}

export interface SupplierBadStockClaim {
  id: string;
  sn: number;
  date: string;
  claimNo: string;
  supplierName: string;
  product: string;
  serial: string;
  problem: string;
  status: 'Pending' | 'Sent to Supplier' | 'Replaced' | 'Credited';
  note?: string;
}

export interface ServiceCenter {
  id: string;
  sn: number;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  remarks?: string;
}



