import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { useState, useEffect } from 'react';
import { Product, ProductType } from '@/lib/models';
import * as Crypto from 'expo-crypto';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  editProduct?: Product | null;
}

export function AddProductModal({ visible, onClose, editProduct }: AddProductModalProps) {
  const { tr, lang, addProduct, updateProduct, deleteProduct } = useApp();
  const insets = useSafeAreaInsets();
  const [nameTamil, setNameTamil] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [productionCost, setProductionCost] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [productType, setProductType] = useState<ProductType>('wholesale');

  useEffect(() => {
    if (editProduct) {
      setNameTamil(editProduct.name_tamil);
      setNameEnglish(editProduct.name_english);
      setSellingPrice(editProduct.selling_price.toString());
      setCostPrice(editProduct.cost_price.toString());
      setProductionCost(editProduct.production_cost_total.toString());
      setCurrentStock(editProduct.current_stock.toString());
      setLowStockThreshold(editProduct.low_stock_threshold.toString());
      setProductType(editProduct.product_type);
    } else {
      resetForm();
    }
  }, [editProduct, visible]);

  const resetForm = () => {
    setNameTamil('');
    setNameEnglish('');
    setSellingPrice('');
    setCostPrice('');
    setProductionCost('');
    setCurrentStock('');
    setLowStockThreshold('10');
    setProductType('wholesale');
  };

  const handleSave = async () => {
    if (!nameEnglish.trim() || !sellingPrice.trim() || !currentStock.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const sp = parseFloat(sellingPrice) || 0;
    const cp = parseFloat(costPrice) || 0;
    const pc = parseFloat(productionCost) || 0;
    const profitMargin = productType === 'self_made' && sp > 0
      ? Math.round(((sp - pc) / sp) * 100)
      : 0;

    const product: Product = {
      id: editProduct?.id || Crypto.randomUUID(),
      name_tamil: nameTamil.trim() || nameEnglish.trim(),
      name_english: nameEnglish.trim(),
      image_url: editProduct?.image_url || null,
      cost_price: productType === 'wholesale' ? cp : 0,
      selling_price: sp,
      production_cost_total: productType === 'self_made' ? pc : 0,
      profit_margin: profitMargin,
      current_stock: parseInt(currentStock) || 0,
      low_stock_threshold: parseInt(lowStockThreshold) || 5,
      product_type: productType,
      created_at: editProduct?.created_at || new Date().toISOString(),
    };

    if (editProduct) {
      await updateProduct(product);
    } else {
      await addProduct(product);
    }
    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!editProduct) return;
    Alert.alert(
      tr('delete'),
      lang === 'ta' ? 'இந்த பொருளை நீக்க வேண்டுமா?' : 'Delete this product?',
      [
        { text: tr('cancel'), style: 'cancel' },
        {
          text: tr('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(editProduct.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>{editProduct ? tr('editProduct') : tr('addProduct')}</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeOption,
                  productType === 'wholesale' && styles.typeOptionActiveW,
                ]}
                onPress={() => setProductType('wholesale')}
              >
                <Ionicons name="business" size={20} color={productType === 'wholesale' ? Colors.white : Colors.wholesale} />
                <Text style={[
                  styles.typeOptionText,
                  productType === 'wholesale' && styles.typeOptionTextActive,
                ]}>
                  {tr('wholesale')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeOption,
                  productType === 'self_made' && styles.typeOptionActiveS,
                ]}
                onPress={() => setProductType('self_made')}
              >
                <Ionicons name="hand-left" size={20} color={productType === 'self_made' ? Colors.white : Colors.selfMade} />
                <Text style={[
                  styles.typeOptionText,
                  productType === 'self_made' && styles.typeOptionTextActive,
                ]}>
                  {tr('selfMade')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{tr('nameEnglish')}</Text>
              <TextInput
                style={styles.input}
                value={nameEnglish}
                onChangeText={setNameEnglish}
                placeholder="e.g. Milk Packet"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{tr('nameTamil')}</Text>
              <TextInput
                style={styles.input}
                value={nameTamil}
                onChangeText={setNameTamil}
                placeholder="e.g. பால் பாக்கெட்"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>{tr('sellingPrice')} (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              {productType === 'wholesale' ? (
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>{tr('costPrice')} (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={costPrice}
                    onChangeText={setCostPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              ) : (
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>{tr('productionCost')} (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={productionCost}
                    onChangeText={setProductionCost}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>{tr('currentStock')}</Text>
                <TextInput
                  style={styles.input}
                  value={currentStock}
                  onChangeText={setCurrentStock}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>{tr('lowStockThreshold')}</Text>
                <TextInput
                  style={styles.input}
                  value={lowStockThreshold}
                  onChangeText={setLowStockThreshold}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={22} color={Colors.white} />
              <Text style={styles.saveButtonText}>{tr('save')}</Text>
            </Pressable>

            {editProduct && (
              <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                <Text style={styles.deleteButtonText}>{tr('delete')}</Text>
              </Pressable>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textLight,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  typeOptionActiveW: {
    backgroundColor: Colors.wholesale,
    borderColor: Colors.wholesale,
  },
  typeOptionActiveS: {
    backgroundColor: Colors.selfMade,
    borderColor: Colors.selfMade,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  typeOptionTextActive: {
    color: Colors.white,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
});
