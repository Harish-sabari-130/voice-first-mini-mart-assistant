import { StyleSheet, View, Text, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { Sale } from '@/lib/models';

export default function SalesScreen() {
  const { sales, tr, lang } = useApp();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const sortedSales = [...sales].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const itemNames = item.items.map(i =>
      lang === 'ta' ? i.name_tamil : i.name_english
    ).join(', ');
    const totalItems = item.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <View style={styles.saleTimeContainer}>
            <Text style={styles.saleTime}>{formatTime(item.timestamp)}</Text>
            <Text style={styles.saleDate}>{formatDate(item.timestamp)}</Text>
          </View>
          <View style={styles.saleBadges}>
            {item.invoice_generated && (
              <View style={styles.invoiceBadge}>
                <Ionicons name="receipt" size={12} color={Colors.secondary} />
                <Text style={styles.invoiceBadgeText}>{tr('invoice')}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.saleItems} numberOfLines={2}>{itemNames}</Text>
        <View style={styles.saleFooter}>
          <View style={styles.saleItemCount}>
            <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.saleItemCountText}>{totalItems} {tr('items')}</Text>
          </View>
          <View style={styles.saleAmounts}>
            <Text style={styles.saleTotal}>₹{item.total_amount}</Text>
            <Text style={styles.saleProfit}>+₹{item.total_profit}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? webTopInset : insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>{tr('salesHistory')}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{sales.length}</Text>
        </View>
      </View>

      <FlatList
        data={sortedSales}
        renderItem={renderSaleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sortedSales.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>{tr('noSales')}</Text>
          </View>
        }
      />
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
  countBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 34 + 84 : 120,
  },
  saleCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saleTimeContainer: {
    gap: 2,
  },
  saleTime: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  saleDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saleBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  invoiceBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  saleItems: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  saleItemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saleItemCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  saleAmounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  saleProfit: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
