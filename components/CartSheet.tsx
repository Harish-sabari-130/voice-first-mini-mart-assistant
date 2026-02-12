import { StyleSheet, Text, View, Pressable, ScrollView, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { useState, useEffect, useRef } from 'react';
import { speakBillQuestion, speakSaleComplete, stopSpeaking } from '@/lib/voice-service';

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const { cart, cartTotal, cartProfit, updateCartQuantity, removeFromCart, clearCart, completeSale, tr, settings, lang } = useApp();
  const insets = useSafeAreaInsets();
  const [showBillPrompt, setShowBillPrompt] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [lastSaleInvoice, setLastSaleInvoice] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (cartTotal >= settings.billing_threshold) {
      setShowBillPrompt(true);
      speakBillQuestion(cartTotal, lang);
      timerRef.current = setTimeout(() => {
        handleBillResponse(false);
      }, 5000);
    } else {
      handleBillResponse(false);
    }
  };

  const handleBillResponse = async (wantsBill: boolean) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stopSpeaking();
    setShowBillPrompt(false);

    const sale = await completeSale(wantsBill);
    if (sale) {
      setLastSaleInvoice(wantsBill);
      setSaleComplete(true);
      speakSaleComplete(sale.total_amount, lang);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleDismiss = () => {
    setSaleComplete(false);
    setShowBillPrompt(false);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>{tr('cart')}</Text>
              <View style={styles.headerActions}>
                {cart.length > 0 && !saleComplete && (
                  <Pressable onPress={clearCart} style={styles.clearBtn}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </Pressable>
                )}
                <Pressable onPress={handleDismiss} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </Pressable>
              </View>
            </View>
          </View>

          {saleComplete ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>{tr('saleCompleted')}</Text>
              {lastSaleInvoice && (
                <Text style={styles.successSubtitle}>{tr('invoiceGenerated')}</Text>
              )}
              <Pressable
                style={styles.doneButton}
                onPress={handleDismiss}
              >
                <Text style={styles.doneButtonText}>OK</Text>
              </Pressable>
            </View>
          ) : showBillPrompt ? (
            <View style={styles.billPromptContainer}>
              <Ionicons name="receipt-outline" size={48} color={Colors.primary} />
              <Text style={styles.billQuestion}>
                {tr('billQuestion', { amount: cartTotal })}
              </Text>
              <View style={styles.billButtons}>
                <Pressable
                  style={[styles.billButton, styles.billButtonYes]}
                  onPress={() => handleBillResponse(true)}
                >
                  <Ionicons name="checkmark" size={28} color={Colors.white} />
                  <Text style={styles.billButtonText}>{tr('yes')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.billButton, styles.billButtonNo]}
                  onPress={() => handleBillResponse(false)}
                >
                  <Ionicons name="close" size={28} color={Colors.white} />
                  <Text style={styles.billButtonText}>{tr('no')}</Text>
                </Pressable>
              </View>
              <Text style={styles.autoText}>
                {lang === 'ta' ? '5 வினாடியில் தானாக "இல்லை"' : 'Auto "No" in 5 seconds'}
              </Text>
            </View>
          ) : cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>{tr('emptyCart')}</Text>
              <Text style={styles.emptySubText}>{tr('addItems')}</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                {cart.map(item => {
                  const name = lang === 'ta' ? item.product.name_tamil : item.product.name_english;
                  return (
                    <View key={item.product.id} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{name}</Text>
                        <Text style={styles.cartItemPrice}>₹{item.product.selling_price} x {item.quantity}</Text>
                      </View>
                      <View style={styles.qtyControls}>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => {
                            updateCartQuantity(item.product.id, item.quantity - 1);
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Ionicons name="remove" size={20} color={Colors.text} />
                        </Pressable>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => {
                            updateCartQuantity(item.product.id, item.quantity + 1);
                            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Ionicons name="add" size={20} color={Colors.text} />
                        </Pressable>
                      </View>
                      <Text style={styles.cartItemTotal}>₹{item.product.selling_price * item.quantity}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{tr('total')}</Text>
                  <Text style={styles.totalAmount}>₹{cartTotal}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.checkoutButton,
                    pressed && styles.checkoutPressed,
                  ]}
                  onPress={handleCheckout}
                >
                  <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                  <Text style={styles.checkoutText}>{tr('completeSale')}</Text>
                </Pressable>
              </View>
            </>
          )}
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
    minHeight: '50%',
    maxHeight: '85%',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  cartItemInfo: {
    flex: 1,
    gap: 2,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cartItemPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    minWidth: 28,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  checkoutText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 60,
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
  billPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  billQuestion: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  billButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  billButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 120,
    justifyContent: 'center',
  },
  billButtonYes: {
    backgroundColor: Colors.success,
  },
  billButtonNo: {
    backgroundColor: Colors.danger,
  },
  billButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  autoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
