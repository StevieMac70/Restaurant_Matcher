import React, { useCallback } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const ROTATION_FACTOR = 8; // degrees at edge of screen

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;   // vote FOR (yes)
  onSwipeRight: () => void;  // vote AGAINST (no)
  overlayLeftLabel?: string;
  overlayRightLabel?: string;
  isTop: boolean;
}

type GestureContext = { startX: number; startY: number };

export default function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  overlayLeftLabel = '✓ YES',
  overlayRightLabel = '✗ NO',
  isTop,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const fireHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe left → YES
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(fireHaptic)();
        runOnJS(onSwipeLeft)();
      } else if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe right → NO
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(fireHaptic)();
        runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-ROTATION_FACTOR, 0, ROTATION_FACTOR],
      Extrapolate.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -20, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP,
    ),
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 20, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolate.CLAMP,
    ),
  }));

  return (
    <PanGestureHandler onGestureEvent={isTop ? gestureHandler : undefined} enabled={isTop}>
      <Animated.View style={[styles.card, cardStyle]}>
        {children}

        {/* LEFT overlay = YES (vote for) */}
        <Animated.View style={[styles.overlay, styles.overlayLeft, leftOverlayStyle]}>
          <Animated.Text style={styles.overlayLeftText}>{overlayLeftLabel}</Animated.Text>
        </Animated.View>

        {/* RIGHT overlay = NO (vote against) */}
        <Animated.View style={[styles.overlay, styles.overlayRight, rightOverlayStyle]}>
          <Animated.Text style={styles.overlayRightText}>{overlayRightLabel}</Animated.Text>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderRadius: 8,
  },
  overlayLeft: {
    left: 20,
    borderColor: '#2ECC71',
    backgroundColor: 'rgba(46,204,113,0.15)',
    transform: [{ rotate: '-15deg' }],
  },
  overlayRight: {
    right: 20,
    borderColor: '#E74C3C',
    backgroundColor: 'rgba(231,76,60,0.15)',
    transform: [{ rotate: '15deg' }],
  },
  overlayLeftText: {
    color: '#2ECC71',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  overlayRightText: {
    color: '#E74C3C',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
