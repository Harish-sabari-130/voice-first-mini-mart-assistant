import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Language, t } from './i18n';
import { Product, CartItem, Sale, SaleItem, AppSettings, DEFAULT_SETTINGS, DailySummary } from './models';
import * as Storage from './storage';
import { speakStockAlert } from './voice-service';
import * as Crypto from 'expo-crypto';

interface AppContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  tr: (key: any, params?: Record<string, string | number>) => string;
  products: Product[];
  loadProducts: () => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartProfit: number;
  completeSale: (invoiceGenerated: boolean) => Promise<Sale | null>;
  sales: Sale[];
  todaySales: Sale[];
  loadSales: () => Promise<void>;
  dailySummary: DailySummary | null;
  loadDailySummary: () => Promise<void>;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  lowStockProducts: Product[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ta');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const tr = useCallback((key: any, params?: Record<string, string | number>) => {
    return t(key, lang, params);
  }, [lang]);

  const setLang = useCallback(async (l: Language) => {
    setLangState(l);
    const current = await Storage.getSettings();
    await Storage.saveSettings({ ...current, language: l });
  }, []);

  const loadProducts = useCallback(async () => {
    const prods = await Storage.getProducts();
    setProducts(prods);
  }, []);

  const addProduct = useCallback(async (p: Product) => {
    await Storage.addProduct(p);
    await loadProducts();
  }, [loadProducts]);

  const updateProduct = useCallback(async (p: Product) => {
    await Storage.updateProduct(p);
    await loadProducts();
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await Storage.deleteProduct(id);
    await loadProducts();
  }, [loadProducts]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  }, [cart]);

  const cartProfit = useMemo(() => {
    return cart.reduce((sum, item) => {
      const costPerUnit = item.product.product_type === 'wholesale'
        ? item.product.cost_price
        : item.product.production_cost_total;
      return sum + (item.product.selling_price - costPerUnit) * item.quantity;
    }, 0);
  }, [cart]);

  const completeSale = useCallback(async (invoiceGenerated: boolean): Promise<Sale | null> => {
    if (cart.length === 0) return null;

    const saleItems: SaleItem[] = cart.map(item => ({
      product_id: item.product.id,
      name_tamil: item.product.name_tamil,
      name_english: item.product.name_english,
      quantity: item.quantity,
      selling_price: item.product.selling_price,
      cost_price: item.product.product_type === 'wholesale'
        ? item.product.cost_price
        : item.product.production_cost_total,
      product_type: item.product.product_type,
    }));

    const sale: Sale = {
      id: Crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      items: saleItems,
      total_amount: cartTotal,
      total_profit: cartProfit,
      invoice_generated: invoiceGenerated,
    };

    await Storage.saveSale(sale);

    const alertProducts: Product[] = [];
    for (const item of cart) {
      const updated = await Storage.reduceStock(item.product.id, item.quantity);
      if (updated && updated.current_stock <= updated.low_stock_threshold && updated.current_stock > 0) {
        alertProducts.push(updated);
      }
    }

    if (alertProducts.length > 0) {
      const name = lang === 'ta' ? alertProducts[0].name_tamil : alertProducts[0].name_english;
      speakStockAlert(name, lang);
    }

    setCart([]);
    await loadProducts();
    await loadSales();
    await loadDailySummary();

    return sale;
  }, [cart, cartTotal, cartProfit, lang]);

  const loadSales = useCallback(async () => {
    const allSales = await Storage.getSales();
    setSales(allSales);
    const today = await Storage.getTodaySales();
    setTodaySales(today);
  }, []);

  const loadDailySummary = useCallback(async () => {
    const summary = await Storage.getDailySummary();
    setDailySummary(summary);
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await Storage.saveSettings(updated);
    if (partial.language) {
      setLangState(partial.language);
    }
  }, [settings]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.current_stock <= p.low_stock_threshold);
  }, [products]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Storage.seedSampleProducts();
      const savedSettings = await Storage.getSettings();
      setSettings(savedSettings);
      setLangState(savedSettings.language);
      await loadProducts();
      await loadSales();
      await loadDailySummary();
      setIsLoading(false);
    };
    init();
  }, []);

  const value = useMemo(() => ({
    lang, setLang, tr,
    products, loadProducts, addProduct, updateProduct, deleteProduct,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartProfit,
    completeSale,
    sales, todaySales, loadSales,
    dailySummary, loadDailySummary,
    settings, updateSettings,
    isLoading, lowStockProducts,
  }), [
    lang, tr, products, cart, cartTotal, cartProfit,
    sales, todaySales, dailySummary, settings, isLoading, lowStockProducts,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
