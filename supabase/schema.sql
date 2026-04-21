-- File: supabase/schema.sql

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Food & Drinks', 'Household', 'Electronics', 'Clothing', 'Other')),
  unit TEXT CHECK (unit IN ('pieces', 'kg', 'liters', 'boxes', 'packs')),
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  reorder_point INTEGER DEFAULT 15,
  cost_price DECIMAL NOT NULL,
  selling_price DECIMAL NOT NULL,
  supplier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Suppliers Table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  contact TEXT,
  whatsapp_number TEXT,
  email TEXT,
  products_supplied TEXT[],
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sale Records Table
CREATE TABLE sale_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Competitors Table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Competitor Prices Table
CREATE TABLE competitor_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  their_price DECIMAL NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchase Orders Table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT CHECK (status IN ('pending', 'sent', 'received')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  sent_via_whatsapp BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Simple "Owner only" access
CREATE POLICY "Users can only see their own products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own suppliers" ON suppliers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own sales" ON sale_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own competitors" ON competitors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own purchase orders" ON purchase_orders FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_date ON sale_records(date);
CREATE INDEX idx_sales_product ON sale_records(product_id);
