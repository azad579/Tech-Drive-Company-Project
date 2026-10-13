import { Request, Response } from 'express';
import { db } from './db';

/**
 * GET /api/reports/summary
 * Returns high-level financial KPIs: total revenue, gross, tax, paid, due, AOV, items sold
 */
export async function getReportsSummary(req: Request, res: Response) {
  try {
    const { dateRange } = req.query;
    console.log(`[Reports Controller] GET /api/reports/summary with dateRange=${dateRange}`);
    const summary = db.getReportsSummary(dateRange as string);
    console.log('[Reports Controller] Computed dynamic financial summary from database:', summary);
    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error calculating summary:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/reports/sales-by-date
 * Returns daily/periodic sales grouping for charts and timeline trends
 */
export async function getSalesByDate(req: Request, res: Response) {
  try {
    console.log('[Reports Controller] GET /api/reports/sales-by-date received');
    const salesByDate = db.getSalesByDate();
    console.log(`[Reports Controller] Returned ${salesByDate.length} date entries for sales chart.`);
    return res.status(200).json({
      success: true,
      totalDates: salesByDate.length,
      data: salesByDate,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error querying sales by date:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/reports/top-selling
 * Returns top-performing products ranked by units sold and revenue
 */
export async function getTopSellingItems(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 10;
    console.log(`[Reports Controller] GET /api/reports/top-selling?limit=${limit}`);
    const topItems = db.getTopSellingItems(limit);
    console.log(`[Reports Controller] Returned top ${topItems.length} products.`);
    return res.status(200).json({
      success: true,
      items: topItems,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error querying top selling items:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/reports/by-category
 * Returns revenue and quantity breakdown by product category
 */
export async function getSalesByCategory(req: Request, res: Response) {
  try {
    console.log('[Reports Controller] GET /api/reports/by-category received');
    const categories = db.getSalesByCategory();
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error querying category report:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/reports/by-payment-method
 * Returns revenue distribution by payment method (Cash, Card, bKash, etc.)
 */
export async function getSalesByPaymentMethod(req: Request, res: Response) {
  try {
    console.log('[Reports Controller] GET /api/reports/by-payment-method received');
    const methods = db.getSalesByPaymentMethod();
    return res.status(200).json({
      success: true,
      methods,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error querying payment method report:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

/**
 * GET /api/reports/employee-sales
 * Returns employee-wise performance breakdown, units sold, revenue, commission
 */
export async function getEmployeeSales(req: Request, res: Response) {
  try {
    console.log('[Reports Controller] GET /api/reports/employee-sales received');
    const employeeData = db.getEmployeeSalesSummary();
    return res.status(200).json({
      success: true,
      employees: employeeData,
    });
  } catch (error: any) {
    console.error('[Reports Controller] Error querying employee sales report:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
