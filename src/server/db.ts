/**
 * Server-Side Relational Database Store
 * Implements relational tables and query operations mapped to schema.sql
 */

export interface DbProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  barcode?: string;
  warranty?: string;
}

export interface DbCustomer {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  balance?: number;
}

export interface DbSaleItem {
  id: string;
  saleId: string;
  productId?: string;
  productName: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discountAmount: number;
  totalPrice: number;
  serialNumbers?: string[];
}

export interface DbSale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  saleDate: string; // ISO string or YYYY-MM-DD HH:mm:ss
  orderMode: 'sale' | 'quotation';
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Completed';
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxRate: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
  createdBy: string;
  items?: DbSaleItem[];
}

// In-Memory Relational Tables
class RelationalDatabase {
  private salesTable: Map<string, DbSale> = new Map();
  private saleItemsTable: Map<string, DbSaleItem> = new Map();
  private productsTable: Map<string, DbProduct> = new Map();
  private customersTable: Map<string, DbCustomer> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    console.log('[Database Layer] Seeding initial relational database tables...');

    // Seed Initial Products
    const initialProducts: DbProduct[] = [
      { id: 'prod-1', name: 'Surface Laptop 4 (Core i7, 16GB)', sku: 'MS-SL4-01', category: 'Laptops', price: 65000, costPrice: 52000, stock: 12 },
      { id: 'prod-2', name: 'MacBook Pro 14" M3 Pro (18GB, 512GB)', sku: 'APL-MBP14-M3', category: 'Laptops', price: 245000, costPrice: 215000, stock: 8 },
      { id: 'prod-3', name: 'Dell XPS 13 Plus 9320 (OLED 3.5K)', sku: 'DEL-XPS13-9320', category: 'Laptops', price: 175000, costPrice: 152000, stock: 5 },
      { id: 'prod-4', name: 'Lenovo ThinkPad X1 Carbon Gen 11', sku: 'LEN-X1C-G11', category: 'Laptops', price: 198000, costPrice: 174000, stock: 6 },
      { id: 'prod-5', name: 'Surface Pro 7 (i5, 8GB, 256GB)', sku: 'MS-SP7-02', category: 'Laptops', price: 35500, costPrice: 28500, stock: 9 },
      { id: 'prod-6', name: 'Samsung 980 Pro 1TB NVMe SSD', sku: 'SAM-NVME-1TB', category: 'Components', price: 14250, costPrice: 11000, stock: 24 },
      { id: 'prod-7', name: '16GB DDR4 3200MHz RAM Kit', sku: 'FURY-DDR4-16G', category: 'Components', price: 7125, costPrice: 5200, stock: 35 },
      { id: 'prod-8', name: 'Logitech MX Master 3S Mouse', sku: 'LOG-MX3S-01', category: 'Accessories', price: 7000, costPrice: 5400, stock: 18 },
    ];

    initialProducts.forEach(p => this.productsTable.set(p.id, p));

    // Seed Initial Customers
    const initialCustomers: DbCustomer[] = [
      { id: 'cust-1', name: 'MD. Shamim', phone: '+880 1712-987654', balance: 0 },
      { id: 'cust-2', name: 'Apex Data Systems Ltd', companyName: 'Apex Data Systems Ltd', phone: '+880 1711-234567', balance: 0 },
      { id: 'cust-3', name: 'Tanvir Ahmed', phone: '+880 1711-234567', balance: 0 },
      { id: 'cust-4', name: 'Walk-in Retail Customer', phone: 'N/A', balance: 0 },
    ];

    initialCustomers.forEach(c => this.customersTable.set(c.id, c));

    // Seed Initial Sales & Line Items
    const initialSalesData = [
      {
        sale: {
          id: 'rec-sal-0015',
          invoiceNumber: 'SAL0015',
          customerId: 'cust-1',
          customerName: 'MD. Shamim',
          customerPhone: '+880 1712-987654',
          saleDate: '2026-10-03 22:16:00',
          orderMode: 'sale' as const,
          paymentMethod: 'Cash',
          paymentStatus: 'Paid' as const,
          subtotal: 33810,
          discountAmount: 0,
          discountPercent: 0,
          taxAmount: 1690,
          taxRate: 5,
          grandTotal: 35500,
          paidAmount: 35500,
          dueAmount: 0,
          notes: 'In-store sales invoice',
          createdBy: 'Forhad',
        },
        items: [
          {
            id: 'item-0015-1',
            productId: 'prod-5',
            productName: 'Surface Pro 7 (i5, 8GB, 256GB)',
            sku: 'MS-SP7-02',
            category: 'Laptops',
            unitPrice: 33810,
            costPrice: 28500,
            quantity: 1,
            discountAmount: 0,
            totalPrice: 33810,
          },
        ],
      },
      {
        sale: {
          id: 'rec-sal-0012',
          invoiceNumber: 'SAL0012',
          customerId: 'cust-4',
          customerName: 'Walk-in Retail Customer',
          customerPhone: '+880 1819-112233',
          saleDate: '2026-10-03 18:41:00',
          orderMode: 'sale' as const,
          paymentMethod: 'Card (City Bank)',
          paymentStatus: 'Paid' as const,
          subtotal: 27142,
          discountAmount: 0,
          discountPercent: 0,
          taxAmount: 1358,
          taxRate: 5,
          grandTotal: 28500,
          paidAmount: 28500,
          dueAmount: 0,
          notes: 'POS checkout verified',
          createdBy: 'Sadia Rahman',
        },
        items: [
          {
            id: 'item-0012-1',
            productId: 'prod-6',
            productName: 'Samsung 980 Pro 1TB NVMe SSD',
            sku: 'SAM-NVME-1TB',
            category: 'Components',
            unitPrice: 13571,
            costPrice: 11000,
            quantity: 2,
            discountAmount: 0,
            totalPrice: 27142,
          },
        ],
      },
      {
        sale: {
          id: 'rec-sal-0011',
          invoiceNumber: 'SAL0011',
          customerId: 'cust-4',
          customerName: 'Walk-in Retail Customer',
          customerPhone: 'N/A',
          saleDate: '2026-10-03 17:04:00',
          orderMode: 'sale' as const,
          paymentMethod: 'bKash / MFS',
          paymentStatus: 'Paid' as const,
          subtotal: 27142,
          discountAmount: 500,
          discountPercent: 1.84,
          taxAmount: 1358,
          taxRate: 5,
          grandTotal: 28000,
          paidAmount: 28000,
          dueAmount: 0,
          notes: 'Customer discount applied',
          createdBy: 'Rahim',
        },
        items: [
          {
            id: 'item-0011-1',
            productId: 'prod-7',
            productName: '16GB DDR4 3200MHz RAM Kit',
            sku: 'FURY-DDR4-16G',
            category: 'Components',
            unitPrice: 13571,
            costPrice: 5200,
            quantity: 2,
            discountAmount: 500,
            totalPrice: 26642,
          },
        ],
      },
      {
        sale: {
          id: 'rec-sinv-01',
          invoiceNumber: 'INV-2026-9048',
          customerId: 'cust-3',
          customerName: 'Tanvir Ahmed',
          customerPhone: '+880 1711-234567',
          saleDate: '2026-10-04 11:20:00',
          orderMode: 'sale' as const,
          paymentMethod: 'Bank Transfer (BRAC)',
          paymentStatus: 'Paid' as const,
          subtotal: 72000,
          discountAmount: 0,
          discountPercent: 0,
          taxAmount: 3600,
          taxRate: 5,
          grandTotal: 75600,
          paidAmount: 75600,
          dueAmount: 0,
          notes: 'Executive bundle purchase',
          createdBy: 'Forhad',
        },
        items: [
          {
            id: 'item-sinv-01-1',
            productId: 'prod-1',
            productName: 'Surface Laptop 4 (Core i7, 16GB)',
            sku: 'MS-SL4-01',
            category: 'Laptops',
            unitPrice: 65000,
            costPrice: 52000,
            quantity: 1,
            discountAmount: 0,
            totalPrice: 65000,
          },
          {
            id: 'item-sinv-01-2',
            productId: 'prod-8',
            productName: 'Logitech MX Master 3S Mouse',
            sku: 'LOG-MX3S-01',
            category: 'Accessories',
            unitPrice: 7000,
            costPrice: 5400,
            quantity: 1,
            discountAmount: 0,
            totalPrice: 7000,
          },
        ],
      },
    ];

    initialSalesData.forEach(({ sale, items }) => {
      this.salesTable.set(sale.id, sale);
      items.forEach(item => {
        this.saleItemsTable.set(item.id, { ...item, saleId: sale.id });
      });
    });

    console.log(`[Database Layer] Seeded ${this.salesTable.size} sales and ${this.saleItemsTable.size} line items.`);
  }

  // --- SALE CRUD OPERATIONS ---

  public insertSale(saleData: Omit<DbSale, 'id'>, lineItems: Omit<DbSaleItem, 'id' | 'saleId'>[]): DbSale {
    const saleId = `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullSale: DbSale = {
      ...saleData,
      id: saleId,
    };

    console.log(`[Database Layer] Executing SQL: INSERT INTO sales (id, invoice_number, grand_total, created_by) VALUES ('${saleId}', '${fullSale.invoiceNumber}', ${fullSale.grandTotal}, '${fullSale.createdBy}')`);
    this.salesTable.set(saleId, fullSale);

    const createdItems: DbSaleItem[] = [];
    lineItems.forEach((it, idx) => {
      const itemId = `item-${Date.now()}-${idx}`;
      const fullItem: DbSaleItem = {
        ...it,
        id: itemId,
        saleId,
      };
      this.saleItemsTable.set(itemId, fullItem);
      createdItems.push(fullItem);

      // Decrement inventory stock if productId is present
      if (it.productId && this.productsTable.has(it.productId)) {
        const prod = this.productsTable.get(it.productId)!;
        const newStock = Math.max(0, prod.stock - it.quantity);
        prod.stock = newStock;
        this.productsTable.set(it.productId, prod);
        console.log(`[Database Layer] Updated product stock for ${prod.name}: ${prod.stock + it.quantity} -> ${newStock}`);
      }
    });

    fullSale.items = createdItems;
    return fullSale;
  }

  public getAllSales(): DbSale[] {
    const salesList = Array.from(this.salesTable.values());
    // Attach line items to each sale (Relational JOIN: sales LEFT JOIN sale_items ON sales.id = sale_items.sale_id)
    return salesList.map(sale => {
      const items = Array.from(this.saleItemsTable.values()).filter(i => i.saleId === sale.id);
      return {
        ...sale,
        items,
      };
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }

  public getSaleById(id: string): DbSale | null {
    const sale = this.salesTable.get(id);
    if (!sale) return null;
    const items = Array.from(this.saleItemsTable.values()).filter(i => i.saleId === sale.id);
    return { ...sale, items };
  }

  public updateSale(id: string, updates: Partial<DbSale>): DbSale | null {
    const existing = this.salesTable.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.salesTable.set(id, updated);
    return this.getSaleById(id);
  }

  public deleteSale(id: string): boolean {
    if (!this.salesTable.has(id)) return false;
    this.salesTable.delete(id);
    // Cascade delete line items (ON DELETE CASCADE)
    for (const [itemId, item] of this.saleItemsTable.entries()) {
      if (item.saleId === id) {
        this.saleItemsTable.delete(itemId);
      }
    }
    console.log(`[Database Layer] Executing SQL: DELETE FROM sales WHERE id = '${id}' (Cascaded line items)`);
    return true;
  }

  // --- REPORTING AGGREGATIONS (SQL VIEWS IMPLEMENTATION) ---

  /**
   * Aggregated Report Summary:
   * Total revenue, subtotal, discount, tax, paid, due, AOV, line items count
   */
  public getReportsSummary(dateRangeFilter?: string) {
    const sales = this.getAllSales().filter(s => s.orderMode === 'sale');

    console.log(`[Database Layer] Querying v_daily_sales_summary for ${sales.length} sales records...`);

    const totalRevenue = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
    const totalGross = sales.reduce((acc, s) => acc + (s.subtotal || 0), 0);
    const totalDiscount = sales.reduce((acc, s) => acc + (s.discountAmount || 0), 0);
    const totalTax = sales.reduce((acc, s) => acc + (s.taxAmount || 0), 0);
    const totalPaid = sales.reduce((acc, s) => acc + (s.paidAmount || (s.paymentStatus === 'Paid' ? s.grandTotal : 0)), 0);
    const totalDue = sales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
    const totalInvoices = sales.length;

    const allItems = Array.from(this.saleItemsTable.values());
    const totalItemsSold = allItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalEstimatedCost = allItems.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
    const estimatedGrossProfit = totalGross - totalEstimatedCost;
    const averageOrderValue = totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0;

    return {
      totalRevenue,
      totalGross,
      totalDiscount,
      totalTax,
      totalPaid,
      totalDue,
      totalInvoices,
      totalItemsSold,
      estimatedGrossProfit,
      averageOrderValue,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Sales grouped by date (for charts & periodic reports)
   */
  public getSalesByDate() {
    const sales = this.getAllSales().filter(s => s.orderMode === 'sale');
    const dateMap = new Map<string, { date: string; revenue: number; invoicesCount: number; itemsCount: number }>();

    sales.forEach(sale => {
      // Normalise date to YYYY-MM-DD
      const dateKey = sale.saleDate.split(' ')[0] || sale.saleDate.split('T')[0];
      const existing = dateMap.get(dateKey) || { date: dateKey, revenue: 0, invoicesCount: 0, itemsCount: 0 };
      existing.revenue += sale.grandTotal;
      existing.invoicesCount += 1;
      const itemCount = (sale.items || []).reduce((sum, it) => sum + it.quantity, 0);
      existing.itemsCount += itemCount;
      dateMap.set(dateKey, existing);
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Top-selling products ranked by quantity sold and revenue
   */
  public getTopSellingItems(limit: number = 10) {
    const itemMap = new Map<string, {
      productId?: string;
      name: string;
      sku?: string;
      category?: string;
      quantitySold: number;
      totalRevenue: number;
      estimatedProfit: number;
    }>();

    for (const item of this.saleItemsTable.values()) {
      const key = item.productId || item.sku || item.productName;
      const existing = itemMap.get(key) || {
        productId: item.productId,
        name: item.productName,
        sku: item.sku || 'N/A',
        category: item.category || 'General',
        quantitySold: 0,
        totalRevenue: 0,
        estimatedProfit: 0,
      };

      existing.quantitySold += item.quantity;
      existing.totalRevenue += item.totalPrice;
      existing.estimatedProfit += (item.totalPrice - (item.costPrice * item.quantity));
      itemMap.set(key, existing);
    }

    return Array.from(itemMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  }

  /**
   * Sales by Category breakdown
   */
  public getSalesByCategory() {
    const categoryMap = new Map<string, { category: string; revenue: number; itemsSold: number }>();

    for (const item of this.saleItemsTable.values()) {
      const cat = item.category || 'General';
      const existing = categoryMap.get(cat) || { category: cat, revenue: 0, itemsSold: 0 };
      existing.revenue += item.totalPrice;
      existing.itemsSold += item.quantity;
      categoryMap.set(cat, existing);
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Sales by Payment Method
   */
  public getSalesByPaymentMethod() {
    const methodMap = new Map<string, { method: string; amount: number; count: number }>();

    for (const sale of this.salesTable.values()) {
      if (sale.orderMode !== 'sale') continue;
      const m = sale.paymentMethod || 'Cash';
      const existing = methodMap.get(m) || { method: m, amount: 0, count: 0 };
      existing.amount += sale.grandTotal;
      existing.count += 1;
      methodMap.set(m, existing);
    }

    return Array.from(methodMap.values()).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Employee Wise Sales Summary
   */
  public getEmployeeSalesSummary() {
    const sales = this.getAllSales().filter(s => s.orderMode === 'sale');
    const empMap = new Map<string, {
      employeeName: string;
      invoicesCount: number;
      unitsSold: number;
      grandTotal: number;
      paidAmount: number;
      dueAmount: number;
      commissionEarned: number;
      invoices: DbSale[];
    }>();

    sales.forEach(sale => {
      const creator = sale.createdBy || 'Admin';
      const existing = empMap.get(creator) || {
        employeeName: creator,
        invoicesCount: 0,
        unitsSold: 0,
        grandTotal: 0,
        paidAmount: 0,
        dueAmount: 0,
        commissionEarned: 0,
        invoices: [],
      };

      existing.invoicesCount += 1;
      existing.grandTotal += sale.grandTotal;
      existing.paidAmount += sale.paidAmount;
      existing.dueAmount += sale.dueAmount;
      const units = (sale.items || []).reduce((sum, it) => sum + it.quantity, 0);
      existing.unitsSold += units;
      existing.commissionEarned += Math.round(sale.grandTotal * 0.02); // 2% standard
      existing.invoices.push(sale);
      empMap.set(creator, existing);
    });

    return Array.from(empMap.values()).sort((a, b) => b.grandTotal - a.grandTotal);
  }
}

export const db = new RelationalDatabase();
