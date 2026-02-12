import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { ProductGrid } from '@/components/ProductGrid';
import { CartSheet } from '@/components/CartSheet';
import { VoiceButton } from '@/components/VoiceButton';

export default function DashboardScreen() {
  const { products, addToCart, cart, cartTotal, tr, lang, setLang, lowStockProducts, dailySummary } = useApp();
  const insets = useSafeAreaInsets();
  const [cartVisible, setCartVisible] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const toggleLang = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLang(lang === 'ta' ? 'en' : 'ta');
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? webTopInset : insets.top }]}>
      <View style={styles.topBar}>
        <View style={styles.titleArea}>
          <Ionicons name="storefront" size={24} color={Colors.primary} />
          <Text style={styles.appTitle}>{tr('appName')}</Text>
        </View>
        <View style={styles.topBarActions}>
          <Pressable style={styles.langToggle} onPress={toggleLang}>
            <Text style={styles.langText}>{lang === 'ta' ? 'EN' : 'தமிழ்'}</Text>
          </Pressable>
        </View>
      </View>

      {lowStockProducts.length > 0 && (
        <View style={styles.alertBar}>
          <Ionicons name="warning" size={16} color={Colors.warning} />
          <Text style={styles.alertText} numberOfLines={1}>
            {lowStockProducts.length} {lang === 'ta' ? 'பொருட்கள் குறைவு' : 'items low stock'}
          </Text>
        </View>
      )}

      {dailySummary && dailySummary.total_revenue > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{tr('todaySales')}</Text>
            <Text style={styles.summaryValue}>₹{dailySummary.total_revenue}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{tr('todayProfit')}</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>₹{dailySummary.total_profit}</Text>
          </View>
        </View>
      )}

      <ProductGrid products={products} onProductPress={addToCart} />

      {cart.length > 0 && (
        <Pressable
          style={[styles.cartFab, { bottom: Platform.OS === 'web' ? 34 + 84 : 100 }]}
          onPress={() => {
            setCartVisible(true);
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <View style={styles.cartFabContent}>
            <Ionicons name="cart" size={22} color={Colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          </View>
          <Text style={styles.cartFabTotal}>₹{cartTotal}</Text>
        </Pressable>
      )}

      <View style={[styles.voiceFabContainer, { bottom: Platform.OS === 'web' ? 34 + 84 : 100 }]}>
        <VoiceButton />
      </View>

      <CartSheet visible={cartVisible} onClose={() => setCartVisible(false)} />
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
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#856404',
    flex: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
  cartFab: {
    position: 'absolute',
    left: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cartFabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  cartFabTotal: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  voiceFabContainer: {
    position: 'absolute',
    right: 16,
  },
});
