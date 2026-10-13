import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} from './src/server/salesController';
import {
  getReportsSummary,
  getSalesByDate,
  getTopSellingItems,
  getSalesByCategory,
  getSalesByPaymentMethod,
  getEmployeeSales,
} from './src/server/reportsController';
import {
  createPurchaseOrder,
  receivePurchaseOrder,
  createDirectPurchaseInvoice,
  getPurchaseOrders,
  getPurchaseInvoices,
} from './src/server/purchaseController';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Request logger for API requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[HTTP ${req.method}] ${req.url}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- SALES API ROUTES ---
  app.get('/api/sales', getSales);
  app.get('/api/sales/:id', getSaleById);
  app.post('/api/sales', createSale);
  app.put('/api/sales/:id', updateSale);
  app.delete('/api/sales/:id', deleteSale);

  // --- REPORTS & ANALYTICS API ROUTES ---
  app.get('/api/reports/summary', getReportsSummary);
  app.get('/api/reports/sales-by-date', getSalesByDate);
  app.get('/api/reports/top-selling', getTopSellingItems);
  app.get('/api/reports/by-category', getSalesByCategory);
  app.get('/api/reports/by-payment-method', getSalesByPaymentMethod);
  app.get('/api/reports/employee-sales', getEmployeeSales);

  // --- PURCHASES API ROUTES ---
  app.post('/api/purchases/orders', createPurchaseOrder);
  app.post('/api/purchases/orders/:id/receive', receivePurchaseOrder);
  app.post('/api/purchases/invoices', createDirectPurchaseInvoice);
  app.get('/api/purchases/orders', getPurchaseOrders);
  app.get('/api/purchases/invoices', getPurchaseInvoices);

  // --- VITE MIDDLEWARE (DEV) OR STATIC FILES (PROD) ---
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 POS Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
