import { Product } from './pos';

export type SupplierType = 'Wholesaler' | 'Manufacturer' | 'Distributor' | 'Local Vendor';
export type PaymentTerms = 'Net 15' | 'Net 30' | 'Cash on Delivery' | 'Advance' | 'Credit';
export type POStatus = 'Pending' | 'Partial Receive' | 'Completed' | 'Cancelled';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  supplierType: SupplierType;
  paymentTerms: PaymentTerms;
  taxNumber?: string;
  balance?: number;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  unitCost: number;
  quantityOrdered: number;
  quantityReceived: number;
  quantityReceivingNow: number; // Used in active receive session
  taxRate: number;
  totalCost: number;
}

export interface ReceiveHistoryRecord {
  id: string;
  receivedAt: string;
  receivedBy: string;
  referenceNote?: string;
  itemsReceived: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  receiveHistory?: ReceiveHistoryRecord[];
}

export interface PurchaseInvoiceItem {
  id: string;
  productId: string;
  product: Product;
  unitCost: number;
  quantity: number;
  taxRate: number;
  totalCost: number;
  serials?: string[];
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  poId?: string;
  poNumber?: string;
  supplierId: string;
  supplier: Supplier;
  invoiceDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'MFS / bKash' | 'Credit / Due';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  items: PurchaseInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  notes?: string;
  internalNotes?: string;
  recordedBy: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  transactionType: 'po_receive' | 'direct_purchase' | 'sale_pos' | 'adjustment';
  referenceId: string;
  referenceNumber: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  timestamp: string;
  notes?: string;
}
