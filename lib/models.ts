export type ProductType = 'wholesale' | 'self_made';

export interface Product {
  id: string;
  name_tamil: string;
  name_english: string;
  image_url: string | null;
  cost_price: number;
  selling_price: number;
  production_cost_total: number;
  profit_margin: number;
  current_stock: number;
  low_stock_threshold: number;
  product_type: ProductType;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  product_id: string;
  name_tamil: string;
  name_english: string;
  quantity: number;
  selling_price: number;
  cost_price: number;
  product_type: ProductType;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: SaleItem[];
  total_amount: number;
  total_profit: number;
  invoice_generated: boolean;
}

export interface DailySummary {
  date: string;
  total_revenue: number;
  total_profit: number;
  total_transactions: number;
  top_products: { name: string; quantity: number }[];
}

export interface AppSettings {
  billing_threshold: number;
  language: 'ta' | 'en';
}

export const DEFAULT_SETTINGS: AppSettings = {
  billing_threshold: 100,
  language: 'ta',
};
