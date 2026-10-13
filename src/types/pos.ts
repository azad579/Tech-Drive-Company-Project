export type ProductCategory = 'All' | 'Laptops' | 'Components' | 'Accessories' | 'Services';

export interface InstalledComponent {
  id: string;
  name: string;
  type: 'RAM' | 'SSD' | 'CUSTOM';
  cost: number;
  serialNo?: string;
  addedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Laptops' | 'Components' | 'Accessories' | 'Services';
  specs: string;
  price: number;
  costPrice?: number; // Total purchase cost
  basePurchaseCost?: number; // Cost of existing component under same SKU (will not change)
  additionalComponentsCost?: number; // Cost of new added components (RAM / SSD)
  installedComponents?: InstalledComponent[];
  sku: string;
  barcode: string;
  stock: number;
  iconType: 'laptop' | 'cpu' | 'mouse' | 'wrench' | 'disk' | 'charger';
  serials?: string[];
  unit?: string;
  warrantyDays?: number;
  warranty?: string;
  imageUrl?: string;
}

export interface GiftItem {
  id: string;
  name: string;
  sku?: string;
  quantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  selectedSerials?: string[];
  selectedGifts?: GiftItem[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

export type CustomerType = 'B2B' | 'Regular';

export interface Customer {
  id: string;
  customerCode?: string; // Saved customer code / SKU identifier
  name: string;
  phone: string;
  companyName?: string;
  contactPerson?: string;
  customerType?: CustomerType;
  address?: string;
  invoiceNote?: string; // Public invoice note (shown on customer invoice)
  internalNote?: string; // Internal message only (staff only)
  secondaryNote?: string;
  email?: string;
  loyaltyPoints?: number;
  points?: number;
  creditLimit?: number;
  balance?: number;
  paymentTerms?: string;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  customer: Customer;
  items: CartItem[];
  mode: 'sale' | 'quote';
  subtotal: number;
  discountTotal: number;
  tax: number;
  grandTotal: number;
  publicInvoiceNote?: string;
  internalNote?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  mode: 'sale' | 'quote';
  subtotal: number;
  discountTotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'bKash / MFS' | 'Bank Transfer';
  amountTendered: number;
  changeDue: number;
  cashierName: string;
  publicInvoiceNote?: string; // Shows on invoice
  internalNote?: string; // Internal message only (hidden from customer)
}

export interface CashDrawerState {
  isOpen: boolean;
  openedAt: string;
  startingFloat: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
}
