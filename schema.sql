-- ============================================================================
-- POINT OF SALE & ERP ENTERPRISE RELATIONAL DATABASE SCHEMA
-- PostgreSQL / Relational Standard SQL
-- ============================================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    barcode VARCHAR(64) UNIQUE,
    warranty VARCHAR(128) DEFAULT '1 Year Official Warranty',
    icon_type VARCHAR(64) DEFAULT 'laptop',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(64),
    email VARCHAR(255),
    address TEXT,
    tax_number VARCHAR(128),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    supplier_type VARCHAR(64) NOT NULL DEFAULT 'Distributor',
    payment_terms VARCHAR(64) NOT NULL DEFAULT 'Net 30',
    tax_number VARCHAR(128),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers(phone);

-- 4. Sales Transactions Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(64),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    order_mode VARCHAR(32) NOT NULL DEFAULT 'sale', -- 'sale', 'quotation'
    payment_method VARCHAR(64) NOT NULL DEFAULT 'Cash', -- 'Cash', 'Card', 'bKash / MFS', 'Bank Transfer', 'Credit'
    payment_status VARCHAR(32) NOT NULL DEFAULT 'Paid', -- 'Paid', 'Partial', 'Unpaid', 'Completed'
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by VARCHAR(128) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- 5. Sale Items (Line Items) Table
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(64),
    category VARCHAR(64),
    unit_price NUMERIC(15, 2) NOT NULL,
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL CHECK (quantity > 0),
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL,
    serial_numbers TEXT[], -- Serial numbers sold if tracked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_category ON sale_items(category);

-- 6. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(64) NOT NULL UNIQUE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Partial Receive', 'Completed', 'Cancelled'
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    internal_notes TEXT,
    created_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);

-- 7. Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR(64) PRIMARY KEY,
    po_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_cost NUMERIC(15, 2) NOT NULL,
    quantity_ordered INT NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INT NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_qty_received_le_ordered CHECK (quantity_received <= quantity_ordered)
);

CREATE INDEX IF NOT EXISTS idx_poi_po_id ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_poi_product_id ON purchase_order_items(product_id);

-- 8. Direct Purchase Invoices Table
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    po_id VARCHAR(64) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL,
    payment_method VARCHAR(64) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'Paid',
    subtotal NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    internal_notes TEXT,
    recorded_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pi_supplier_id ON purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_pi_po_id ON purchase_invoices(po_id);

-- 9. Purchase Invoice Items Table
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_cost NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15, 2) NOT NULL
);

-- 10. Inventory Transactions Ledger (Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(64) NOT NULL, -- 'sale_pos', 'po_receive', 'direct_purchase', 'adjustment'
    reference_id VARCHAR(64) NOT NULL,
    reference_number VARCHAR(64) NOT NULL,
    quantity_change INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_inv_tx_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_created_at ON inventory_transactions(created_at);

-- ============================================================================
-- REPORTING VIEWS & AGGREGATIONS
-- ============================================================================

-- Daily Sales Summary View
CREATE OR REPLACE VIEW v_daily_sales_summary AS
SELECT 
    DATE(sale_date) AS report_date,
    COUNT(id) AS total_invoices,
    SUM(grand_total) AS total_revenue,
    SUM(subtotal) AS total_gross,
    SUM(discount_amount) AS total_discount,
    SUM(tax_amount) AS total_tax,
    SUM(paid_amount) AS total_paid,
    SUM(due_amount) AS total_due
FROM sales
WHERE order_mode = 'sale'
GROUP BY DATE(sale_date)
ORDER BY report_date DESC;

-- Top Selling Products View
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT 
    si.product_id,
    si.product_name,
    si.sku,
    si.category,
    SUM(si.quantity) AS total_quantity_sold,
    SUM(si.total_price) AS total_revenue,
    SUM(si.total_price - (si.cost_price * si.quantity)) AS estimated_gross_profit
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
WHERE s.order_mode = 'sale'
GROUP BY si.product_id, si.product_name, si.sku, si.category
ORDER BY total_quantity_sold DESC;

-- Employee Sales Performance View
CREATE OR REPLACE VIEW v_employee_sales_summary AS
SELECT 
    created_by AS employee_name,
    COUNT(id) AS invoices_count,
    SUM(grand_total) AS total_sales,
    SUM(paid_amount) AS total_collected,
    SUM(due_amount) AS total_due
FROM sales
WHERE order_mode = 'sale'
GROUP BY created_by
ORDER BY total_sales DESC;
