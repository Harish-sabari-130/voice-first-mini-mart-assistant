import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Sale, AppSettings, DEFAULT_SETTINGS, DailySummary } from './models';

const KEYS = {
  PRODUCTS: 'minimart_products',
  SALES: 'minimart_sales',
  SETTINGS: 'minimart_settings',
};

export async function getProducts(): Promise<Product[]> {
  const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

export async function saveProducts(products: Product[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export async function addProduct(product: Product): Promise<void> {
  const products = await getProducts();
  products.push(product);
  await saveProducts(products);
}

export async function updateProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = product;
    await saveProducts(products);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  await saveProducts(products.filter(p => p.id !== id));
}

export async function getSales(): Promise<Sale[]> {
  const data = await AsyncStorage.getItem(KEYS.SALES);
  return data ? JSON.parse(data) : [];
}

export async function saveSale(sale: Sale): Promise<void> {
  const sales = await getSales();
  sales.push(sale);
  await AsyncStorage.setItem(KEYS.SALES, JSON.stringify(sales));
}

export async function getTodaySales(): Promise<Sale[]> {
  const sales = await getSales();
  const today = new Date().toISOString().split('T')[0];
  return sales.filter(s => s.timestamp.startsWith(today));
}

export async function getDailySummary(): Promise<DailySummary> {
  const todaySales = await getTodaySales();
  const total_revenue = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
  const total_profit = todaySales.reduce((sum, s) => sum + s.total_profit, 0);

  const productMap = new Map<string, { name: string; quantity: number }>();
  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productMap.get(item.product_id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productMap.set(item.product_id, {
          name: item.name_english,
          quantity: item.quantity,
        });
      }
    });
  });

  const top_products = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  return {
    date: new Date().toISOString().split('T')[0],
    total_revenue,
    total_profit,
    total_transactions: todaySales.length,
    top_products,
  };
}

export async function getSettings(): Promise<AppSettings> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function reduceStock(productId: string, quantity: number): Promise<Product | null> {
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].current_stock = Math.max(0, products[idx].current_stock - quantity);
    await saveProducts(products);
    return products[idx];
  }
  return null;
}

export async function seedSampleProducts(): Promise<void> {
  const existing = await getProducts();
  if (existing.length > 0) return;

  const sampleProducts: Product[] = [
    {
      id: 'p1',
      name_tamil: 'பால் பாக்கெட்',
      name_english: 'Milk Packet',
      image_url: null,
      cost_price: 25,
      selling_price: 30,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 50,
      low_stock_threshold: 10,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p2',
      name_tamil: 'சர்க்கரை 1kg',
      name_english: 'Sugar 1kg',
      image_url: null,
      cost_price: 40,
      selling_price: 48,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 30,
      low_stock_threshold: 5,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p3',
      name_tamil: 'அரிசி 1kg',
      name_english: 'Rice 1kg',
      image_url: null,
      cost_price: 45,
      selling_price: 55,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 40,
      low_stock_threshold: 8,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p4',
      name_tamil: 'டீ தூள்',
      name_english: 'Tea Powder',
      image_url: null,
      cost_price: 80,
      selling_price: 100,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 20,
      low_stock_threshold: 5,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p5',
      name_tamil: 'எண்ணெய் 1L',
      name_english: 'Oil 1L',
      image_url: null,
      cost_price: 130,
      selling_price: 155,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 15,
      low_stock_threshold: 3,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p6',
      name_tamil: 'ரொட்டி',
      name_english: 'Bread',
      image_url: null,
      cost_price: 0,
      selling_price: 40,
      production_cost_total: 20,
      profit_margin: 50,
      current_stock: 25,
      low_stock_threshold: 5,
      product_type: 'self_made',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p7',
      name_tamil: 'கேக்',
      name_english: 'Cake',
      image_url: null,
      cost_price: 0,
      selling_price: 60,
      production_cost_total: 25,
      profit_margin: 58,
      current_stock: 10,
      low_stock_threshold: 3,
      product_type: 'self_made',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p8',
      name_tamil: 'பிஸ்கட்',
      name_english: 'Biscuit',
      image_url: null,
      cost_price: 8,
      selling_price: 10,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 100,
      low_stock_threshold: 20,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p9',
      name_tamil: 'சோப்',
      name_english: 'Soap',
      image_url: null,
      cost_price: 30,
      selling_price: 38,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 35,
      low_stock_threshold: 8,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p10',
      name_tamil: 'முறுக்கு',
      name_english: 'Murukku',
      image_url: null,
      cost_price: 0,
      selling_price: 50,
      production_cost_total: 18,
      profit_margin: 64,
      current_stock: 20,
      low_stock_threshold: 5,
      product_type: 'self_made',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p11',
      name_tamil: 'மாவு 1kg',
      name_english: 'Flour 1kg',
      image_url: null,
      cost_price: 35,
      selling_price: 45,
      production_cost_total: 0,
      profit_margin: 0,
      current_stock: 25,
      low_stock_threshold: 5,
      product_type: 'wholesale',
      created_at: new Date().toISOString(),
    },
    {
      id: 'p12',
      name_tamil: 'லட்டு',
      name_english: 'Laddu',
      image_url: null,
      cost_price: 0,
      selling_price: 30,
      production_cost_total: 12,
      profit_margin: 60,
      current_stock: 15,
      low_stock_threshold: 5,
      product_type: 'self_made',
      created_at: new Date().toISOString(),
    },
  ];

  await saveProducts(sampleProducts);
}
