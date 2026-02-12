import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Product } from '@/lib/models';
import { useApp } from '@/lib/app-context';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  showCost?: boolean;
}

export function ProductCard({ product, onPress, showCost = false }: ProductCardProps) {
  const { lang } = useApp();
  const name = lang === 'ta' ? product.name_tamil : product.name_english;
  const isLowStock = product.current_stock <= product.low_stock_threshold;
  const isWholesale = product.product_type === 'wholesale';
  const tagColor = isWholesale ? Colors.wholesale : Colors.selfMade;
  const tagBg = isWholesale ? Colors.wholesaleLight : Colors.selfMadeLight;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const iconName = getProductIcon(product.name_english);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: tagBg }]}>
        <Ionicons name={iconName} size={32} color={tagColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.price}>₹{product.selling_price}</Text>
        {showCost && (
          <Text style={styles.cost}>
            {isWholesale ? `Cost: ₹${product.cost_price}` : `Cost: ₹${product.production_cost_total}`}
          </Text>
        )}
      </View>
      <View style={styles.badges}>
        <View style={[styles.typeBadge, { backgroundColor: tagBg }]}>
          <Text style={[styles.typeBadgeText, { color: tagColor }]}>
            {isWholesale ? (lang === 'ta' ? 'மொத்தம்' : 'W') : (lang === 'ta' ? 'சொந்தம்' : 'S')}
          </Text>
        </View>
        {isLowStock && (
          <View style={styles.lowStockBadge}>
            <Ionicons name="warning" size={12} color={Colors.danger} />
          </View>
        )}
      </View>
      <Text style={styles.stockText}>{product.current_stock}</Text>
    </Pressable>
  );
}

function getProductIcon(nameEn: string): any {
  const lower = nameEn.toLowerCase();
  if (lower.includes('milk')) return 'water-outline';
  if (lower.includes('sugar')) return 'cube-outline';
  if (lower.includes('rice')) return 'restaurant-outline';
  if (lower.includes('tea')) return 'cafe-outline';
  if (lower.includes('oil')) return 'flask-outline';
  if (lower.includes('bread')) return 'fast-food-outline';
  if (lower.includes('cake')) return 'ice-cream-outline';
  if (lower.includes('biscuit')) return 'ellipse-outline';
  if (lower.includes('soap')) return 'sparkles-outline';
  if (lower.includes('murukku') || lower.includes('snack')) return 'pizza-outline';
  if (lower.includes('flour')) return 'layers-outline';
  if (lower.includes('laddu')) return 'ellipse-outline';
  return 'bag-outline';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  price: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  cost: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badges: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  lowStockBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.cartLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    minWidth: 24,
    textAlign: 'center',
  },
});
