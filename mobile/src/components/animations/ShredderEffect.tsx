import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

interface ShredderEffectProps {
  isActive: boolean;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
  onComplete: () => void;
}

interface ParticleViewProps {
  particle: Particle;
  onComplete: () => void;
}

function ParticleView({ particle, onComplete }: ParticleViewProps) {
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const duration = 600;

    opacity.value = withTiming(0, { duration });
    translateX.value = withTiming(particle.velocityX, {
      duration,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(particle.velocityY + 400, {
      duration,
      easing: Easing.in(Easing.quad),
    });
    rotate.value = withTiming(
      particle.rotation,
      { duration },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: '#1A1A1A',
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ShredderEffect({
  isActive,
  originX,
  originY,
  originWidth,
  originHeight,
  onComplete,
}: ShredderEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (isActive) {
      // Generate 15 particles
      const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: originX + Math.random() * originWidth,
        y: originY + Math.random() * originHeight,
        size: 8 + Math.random() * 16,
        rotation: -180 + Math.random() * 360,
        velocityX: -100 + Math.random() * 200,
        velocityY: -200 + Math.random() * 100,
      }));
      setParticles(newParticles);
      setCompletedCount(0);
    } else {
      setParticles([]);
    }
  }, [isActive, originX, originY, originWidth, originHeight]);

  const handleParticleComplete = useCallback(() => {
    setCompletedCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= particles.length && particles.length > 0) {
        onComplete();
      }
      return newCount;
    });
  }, [particles.length, onComplete]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleView
          key={particle.id}
          particle={particle}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
}
