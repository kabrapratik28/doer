'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

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
  onComplete: () => void;
  originRect: DOMRect | null;
}

export function ShredderEffect({ isActive, onComplete, originRect }: ShredderEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    if (!originRect) return [];

    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: originRect.left + Math.random() * originRect.width,
      y: originRect.top + Math.random() * originRect.height,
      size: 8 + Math.random() * 16,
      rotation: Math.random() * 360,
      velocityX: -100 + Math.random() * 200,
      velocityY: -200 + Math.random() * 100,
    }));
  }, [originRect]);

  useEffect(() => {
    if (!isActive || !originRect) return;

    const newParticles = generateParticles();
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [isActive, originRect, onComplete, generateParticles]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-surface rounded-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          initial={{
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            x: particle.velocityX,
            y: particle.velocityY + 400,
            rotate: particle.rotation,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
