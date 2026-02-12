import { StyleSheet, View, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, cancelAnimation } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { useState, useEffect } from 'react';
import { speakDailySummary } from '@/lib/voice-service';

interface VoiceButtonProps {
  style?: any;
}

export function VoiceButton({ style }: VoiceButtonProps) {
  const { tr, lang, dailySummary, loadDailySummary } = useApp();
  const [isListening, setIsListening] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startPulse = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 600 }),
        withTiming(0.2, { duration: 600 }),
      ),
      -1,
      false
    );
  };

  const stopPulse = () => {
    cancelAnimation(scale);
    cancelAnimation(opacity);
    scale.value = withTiming(1, { duration: 200 });
    opacity.value = withTiming(0.3, { duration: 200 });
  };

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (isListening) {
      setIsListening(false);
      stopPulse();
      return;
    }

    setIsListening(true);
    startPulse();

    await loadDailySummary();

    setTimeout(() => {
      setIsListening(false);
      stopPulse();

      if (dailySummary) {
        const topProduct = dailySummary.top_products.length > 0
          ? dailySummary.top_products[0].name
          : (lang === 'ta' ? 'எதுவும் இல்லை' : 'none');
        speakDailySummary(
          dailySummary.total_revenue,
          dailySummary.total_profit,
          topProduct,
          lang,
        );
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopPulse();
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isListening && styles.buttonActive,
        ]}
        onPress={handlePress}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={28}
          color={Colors.white}
        />
      </Pressable>
      {isListening && (
        <Text style={styles.listeningText}>{tr('voiceListening')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.92 }],
  },
  buttonActive: {
    backgroundColor: Colors.danger,
  },
  listeningText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginTop: 6,
  },
});
