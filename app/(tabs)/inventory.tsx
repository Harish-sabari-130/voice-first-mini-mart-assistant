import { StyleSheet, View, Text, Pressable, TextInput, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState, useMemo } from 'react';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { ProductCard } from '@/components/ProductCard';
import { AddProductModal } from '@/components/AddProductModal';
import { Product, ProductType } from '@/lib/models';

type FilterType = 'all' | 'wholesale' | 'self_made';

export default function InventoryScreen() {
  const { products, tr, lang, setLang } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const filteredProducts = useMemo(() => {
    let result = products;
    if (filter !== 'all') {
      result = result.filter(p => p.product_type === filter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name_english.toLowerCase().includes(s) ||
        p.name_tamil.includes(s)
      );
    }
    return result;
  }, [products, filter, search]);

  const wholesaleCount = products.filter(p => p.product_type === 'wholesale').length;
  const selfMadeCount = products.filter(p => p.product_type === 'self_made').length;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? webTopInset : insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>{tr('inventory')}</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            setEditProduct(null);
            setAddModalVisible(true);
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={tr('search')}
          placeholderTextColor={Colors.textLight}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        <FilterChip
          label={`${tr('all')} (${products.length})`}
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label={`${tr('wholesale')} (${wholesaleCount})`}
          active={filter === 'wholesale'}
          onPress={() => setFilter('wholesale')}
          color={Colors.wholesale}
        />
        <FilterChip
          label={`${tr('selfMade')} (${selfMadeCount})`}
          active={filter === 'self_made'}
          onPress={() => setFilter('self_made')}
          color={Colors.selfMade}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            showCost
            onPress={() => {
              setEditProduct(item);
              setAddModalVisible(true);
            }}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filteredProducts.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>{tr('noProducts')}</Text>
          </View>
        }
      />

      <AddProductModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditProduct(null);
        }}
        editProduct={editProduct}
      />
    </View>
  );
}

function FilterChip({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color?: string }) {
  const bgColor = active ? (color || Colors.primary) : Colors.white;
  const textColor = active ? Colors.white : Colors.textSecondary;

  return (
    <Pressable
      style={[styles.filterChip, { backgroundColor: bgColor, borderColor: active ? bgColor : Colors.border }]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, { color: textColor }]}>{label}</Text>
    </Pressable>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 34 + 84 : 120,
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
