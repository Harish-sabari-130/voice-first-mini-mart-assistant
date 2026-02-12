import { StyleSheet, Text, View, Pressable, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Product } from '@/lib/models';
import { useApp } from '@/lib/app-context';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
}

function GridItem({ product, onPress, lang }: { product: Product; onPress: () => void; lang: string }) {
  const name = lang === 'ta' ? product.name_tamil : product.name_english;
  const isWholesale = product.product_type === 'wholesale';
  const tagColor = isWholesale ? Colors.wholesale : Colors.selfMade;
  const tagBg = isWholesale ? Colors.wholesaleLight : Colors.selfMadeLight;
  const isLowStock = product.current_stock <= product.low_stock_threshold;
  const iconName = getGridIcon(product.name_english);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridItem,
        pressed && styles.gridItemPressed,
        isLowStock && styles.gridItemLowStock,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.gridIconContainer, { backgroundColor: tagBg }]}>
        <Ionicons name={iconName} size={28} color={tagColor} />
        {isLowStock && (
          <View style={styles.lowStockDot} />
        )}
      </View>
      <Text style={styles.gridName} numberOfLines={2}>{name}</Text>
      <Text style={styles.gridPrice}>₹{product.selling_price}</Text>
      <View style={styles.stockRow}>
        <Ionicons name="layers-outline" size={11} color={Colors.textSecondary} />
        <Text style={[styles.gridStock, isLowStock && styles.gridStockLow]}>
          {product.current_stock}
        </Text>
      </View>
    </Pressable>
  );
}

function getGridIcon(nameEn: string): any {
  const lower = nameEn.toLowerCase();
  if (lower.includes('milk')) return 'water';
  if (lower.includes('sugar')) return 'cube';
  if (lower.includes('rice')) return 'restaurant';
  if (lower.includes('tea')) return 'cafe';
  if (lower.includes('oil')) return 'flask';
  if (lower.includes('bread')) return 'fast-food';
  if (lower.includes('cake')) return 'ice-cream';
  if (lower.includes('biscuit')) return 'ellipse';
  if (lower.includes('soap')) return 'sparkles';
  if (lower.includes('murukku') || lower.includes('snack')) return 'pizza';
  if (lower.includes('flour')) return 'layers';
  if (lower.includes('laddu')) return 'ellipse';
  return 'bag';
}

export function ProductGrid({ products, onProductPress }: ProductGridProps) {
  const { lang, tr } = useApp();

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={48} color={Colors.textLight} />
        <Text style={styles.emptyText}>{tr('noProducts')}</Text>
        <Text style={styles.emptySubText}>{tr('addFirstProduct')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <GridItem product={item} onPress={() => onProductPress(item)} lang={lang} />
      )}
      keyExtractor={item => item.id}
      numColumns={3}
      contentContainerStyle={styles.gridContainer}
      columnWrapperStyle={styles.gridRow}
      scrollEnabled={products.length > 0}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 200,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  gridItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    maxWidth: '33%',
  },
  gridItemPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
    backgroundColor: Colors.surfaceAlt,
  },
  gridItemLowStock: {
    borderColor: Colors.warning,
    borderWidth: 1.5,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowStockDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridStock: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  gridStockLow: {
    color: Colors.danger,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
