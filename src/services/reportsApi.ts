/**
 * Reports Service Layer
 * Traces API communication for aggregated reporting data (revenue, sales by date, top-selling items)
 */

import { getStoredSalesInvoices, computeEmployeeWiseSaleSummary, STANDARD_STAFF_MEMBERS } from '../data/mockTransactions';

export interface ReportSummaryData {
  totalRevenue: number;
  totalGross: number;
  totalDiscount: number;
  totalTax: number;
  totalPaid: number;
  totalDue: number;
  totalInvoices: number;
  totalItemsSold: number;
  estimatedGrossProfit: number;
  averageOrderValue: number;
  generatedAt: string;
}

export interface SalesByDateItem {
  date: string;
  revenue: number;
  invoicesCount: number;
  itemsCount: number;
}

export interface TopSellingItem {
  productId?: string;
  name: string;
  sku?: string;
  category?: string;
  quantitySold: number;
  totalRevenue: number;
  estimatedProfit: number;
}

export interface SalesByCategoryItem {
  category: string;
  revenue: number;
  itemsSold: number;
}

export interface PaymentMethodItem {
  method: string;
  amount: number;
  count: number;
}

/**
 * Fetch high-level aggregated report summary
 */
export async function fetchReportsSummary(dateRange?: string): Promise<ReportSummaryData> {
  console.log(`[Data Flow -> reportsApi] Fetching aggregated report summary from /api/reports/summary (dateRange=${dateRange || 'all'})...`);
  try {
    const url = dateRange ? `/api/reports/summary?dateRange=${encodeURIComponent(dateRange)}` : '/api/reports/summary';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log('[Data Flow -> reportsApi] Successfully received summary from API:', json.summary);
    return json.summary;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Backend summary API unreachable, computing dynamically from local sales database:', error);
    
    // Dynamic fallback computation from actual sales records
    const sales = getStoredSalesInvoices();
    const totalRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalGross = sales.reduce((sum, s) => sum + (s.grossAmount || 0), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + (s.discountAmount || 0), 0);
    const totalTax = sales.reduce((sum, s) => sum + (s.taxAmount || 0), 0);
    const totalPaid = sales.reduce((sum, s) => sum + (s.paidAmount || (s.status === 'Paid' ? s.grandTotal : 0)), 0);
    const totalDue = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
    const totalInvoices = sales.length;
    const totalItemsSold = sales.reduce((sum, s) => sum + (s.itemsCount || 1), 0);
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
      estimatedGrossProfit: Math.round(totalGross * 0.22),
      averageOrderValue,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch sales by date for charts and time trends
 */
export async function fetchSalesByDate(): Promise<SalesByDateItem[]> {
  console.log('[Data Flow -> reportsApi] Fetching sales by date from /api/reports/sales-by-date...');
  try {
    const res = await fetch('/api/reports/sales-by-date');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`[Data Flow -> reportsApi] Received ${json.data?.length || 0} sales by date points:`, json.data);
    return json.data;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Sales by date API fallback to dynamic local aggregation:', error);
    const sales = getStoredSalesInvoices();
    const map = new Map<string, SalesByDateItem>();
    sales.forEach(s => {
      const d = s.dateTime.split(',')[0].trim();
      const existing = map.get(d) || { date: d, revenue: 0, invoicesCount: 0, itemsCount: 0 };
      existing.revenue += s.grandTotal;
      existing.invoicesCount += 1;
      existing.itemsCount += s.itemsCount || 1;
      map.set(d, existing);
    });
    return Array.from(map.values());
  }
}

/**
 * Fetch top selling items
 */
export async function fetchTopSellingItems(limit: number = 10): Promise<TopSellingItem[]> {
  console.log(`[Data Flow -> reportsApi] Fetching top selling items from /api/reports/top-selling?limit=${limit}...`);
  try {
    const res = await fetch(`/api/reports/top-selling?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`[Data Flow -> reportsApi] Received ${json.items?.length || 0} top-selling items:`, json.items);
    return json.items;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Top-selling items API fallback to dynamic local aggregation:', error);
    const sales = getStoredSalesInvoices();
    const map = new Map<string, TopSellingItem>();
    sales.forEach(s => {
      (s.itemsList || []).forEach(it => {
        const key = it.sku || it.name;
        const existing = map.get(key) || {
          name: it.name,
          sku: it.sku || 'N/A',
          quantitySold: 0,
          totalRevenue: 0,
          estimatedProfit: 0,
        };
        existing.quantitySold += it.qty || 1;
        existing.totalRevenue += it.total || (it.unitPrice * (it.qty || 1));
        existing.estimatedProfit += Math.round((it.total || 0) * 0.2);
        map.set(key, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, limit);
  }
}

/**
 * Fetch sales by category
 */
export async function fetchSalesByCategory(): Promise<SalesByCategoryItem[]> {
  console.log('[Data Flow -> reportsApi] Fetching sales by category...');
  try {
    const res = await fetch('/api/reports/by-category');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.categories;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Sales by category API fallback:', error);
    return [
      { category: 'Laptops', revenue: 145000, itemsSold: 3 },
      { category: 'Components', revenue: 56000, itemsSold: 5 },
      { category: 'Accessories', revenue: 14000, itemsSold: 2 },
    ];
  }
}

/**
 * Fetch sales by payment method
 */
export async function fetchSalesByPaymentMethod(): Promise<PaymentMethodItem[]> {
  console.log('[Data Flow -> reportsApi] Fetching sales by payment method...');
  try {
    const res = await fetch('/api/reports/by-payment-method');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.methods;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Payment method API fallback:', error);
    const sales = getStoredSalesInvoices();
    const map = new Map<string, PaymentMethodItem>();
    sales.forEach(s => {
      const m = s.paymentMethod || 'Cash';
      const existing = map.get(m) || { method: m, amount: 0, count: 0 };
      existing.amount += s.grandTotal;
      existing.count += 1;
      map.set(m, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }
}

/**
 * Fetch employee sales summary
 */
export async function fetchEmployeeSalesReport() {
  console.log('[Data Flow -> reportsApi] Fetching employee sales report...');
  try {
    const res = await fetch('/api/reports/employee-sales');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.employees;
  } catch (error) {
    console.warn('[Data Flow -> reportsApi] Employee sales API fallback to local computation:', error);
    const sales = getStoredSalesInvoices();
    return computeEmployeeWiseSaleSummary(sales, STANDARD_STAFF_MEMBERS);
  }
}
