import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { useMemo } from 'react';
import { speakDailySummary } from '@/lib/voice-service';

export default function AnalyticsScreen() {
  const { sales, todaySales, products, tr, lang, dailySummary, lowStockProducts } = useApp();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const todayRevenue = useMemo(() =>
    todaySales.reduce((sum, s) => sum + s.total_amount, 0), [todaySales]);

  const todayProfit = useMemo(() =>
    todaySales.reduce((sum, s) => sum + s.total_profit, 0), [todaySales]);

  const todayItems = useMemo(() =>
    todaySales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.quantity, 0), 0), [todaySales]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    todaySales.forEach(sale => {
      sale.items.forEach(item => {
        const name = lang === 'ta' ? item.name_tamil : item.name_english;
        const existing = map.get(item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.selling_price * item.quantity;
        } else {
          map.set(item.product_id, {
            name,
            quantity: item.quantity,
            revenue: item.selling_price * item.quantity,
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [todaySales, lang]);

  const handleVoiceSummary = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const topProduct = topProducts.length > 0 ? topProducts[0].name : (lang === 'ta' ? 'எதுவும் இல்லை' : 'none');
    speakDailySummary(todayRevenue, todayProfit, topProduct, lang);
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? webTopInset : insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>{tr('analytics')}</Text>
        <Pressable style={styles.speakBtn} onPress={handleVoiceSummary}>
          <Ionicons name="volume-high" size={20} color={Colors.white} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{tr('todaySummary')}</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FEF5E7' }]}>
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>₹{todayRevenue}</Text>
            <Text style={styles.statLabel}>{tr('revenue')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D5F5E3' }]}>
            <Ionicons name="trending-up" size={24} color={Colors.success} />
            <Text style={[styles.statValue, { color: Colors.success }]}>₹{todayProfit}</Text>
            <Text style={styles.statLabel}>{tr('profit')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D6EAF8' }]}>
            <Ionicons name="receipt-outline" size={24} color={Colors.info} />
            <Text style={[styles.statValue, { color: Colors.info }]}>{todaySales.length}</Text>
            <Text style={styles.statLabel}>{tr('sales')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F5EEF8' }]}>
            <Ionicons name="layers-outline" size={24} color="#8E44AD" />
            <Text style={[styles.statValue, { color: '#8E44AD' }]}>{todayItems}</Text>
            <Text style={styles.statLabel}>{tr('items')}</Text>
          </View>
        </View>

        {topProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{tr('topProducts')}</Text>
            <View style={styles.topProductsList}>
              {topProducts.map((product, index) => (
                <View key={index} style={styles.topProductItem}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topProductInfo}>
                    <Text style={styles.topProductName}>{product.name}</Text>
                    <Text style={styles.topProductQty}>
                      {product.quantity} {tr('pieces')}
                    </Text>
                  </View>
                  <Text style={styles.topProductRevenue}>₹{product.revenue}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {lowStockProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{tr('lowStock')}</Text>
            <View style={styles.lowStockList}>
              {lowStockProducts.map(product => {
                const name = lang === 'ta' ? product.name_tamil : product.name_english;
                return (
                  <View key={product.id} style={styles.lowStockItem}>
                    <Ionicons name="warning" size={18} color={Colors.warning} />
                    <Text style={styles.lowStockName}>{name}</Text>
                    <View style={styles.lowStockCount}>
                      <Text style={styles.lowStockCountText}>
                        {product.current_stock}/{product.low_stock_threshold}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {todaySales.length === 0 && topProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>{tr('noSales')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  speakBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  topProductsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  topProductInfo: {
    flex: 1,
    gap: 2,
  },
  topProductName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  topProductQty: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  topProductRevenue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  lowStockList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lowStockName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  lowStockCount: {
    backgroundColor: Colors.cartLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockCountText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
