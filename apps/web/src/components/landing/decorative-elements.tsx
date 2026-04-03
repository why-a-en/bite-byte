'use client';

import { motion } from 'motion/react';

/* ------------------------------------------------------------------ */
/*  Gradient Blob                                                      */
/* ------------------------------------------------------------------ */
type BlobColor = 'orange' | 'amber' | 'rose';

const blobColorMap: Record<BlobColor, string> = {
  orange: 'from-orange-300 to-orange-100',
  amber: 'from-amber-300 to-amber-100',
  rose: 'from-rose-300 to-rose-100',
};

interface GradientBlobProps {
  color?: BlobColor;
  size?: string;
  position?: string;
  opacity?: number;
  className?: string;
}

export function GradientBlob({
  color = 'orange',
  size = 'w-[600px] h-[600px]',
  position = 'top-0 left-0',
  opacity = 0.2,
  className = '',
}: GradientBlobProps) {
  return (
    <div
      className={`absolute ${position} ${size} rounded-full bg-gradient-to-br ${blobColorMap[color]} blur-3xl pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Dot Grid                                                           */
/* ------------------------------------------------------------------ */
interface DotGridProps {
  opacity?: number;
  className?: string;
}

export function DotGrid({ opacity = 0.04, className = '' }: DotGridProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage:
          'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Glow Orb                                                           */
/* ------------------------------------------------------------------ */
interface GlowOrbProps {
  color?: string;
  size?: string;
  position?: string;
  className?: string;
}

export function GlowOrb({
  color = 'bg-orange-400',
  size = 'w-32 h-32',
  position = 'top-0 right-0',
  className = '',
}: GlowOrbProps) {
  return (
    <motion.div
      className={`absolute ${position} ${size} ${color} rounded-full blur-2xl pointer-events-none ${className}`}
      style={{ opacity: 0.15 }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Shapes                                                    */
/* ------------------------------------------------------------------ */
interface FloatingShapesProps {
  className?: string;
}

const shapes = [
  {
    style: 'w-6 h-6 rounded-full bg-orange-300/20',
    position: 'top-[10%] left-[5%]',
    yRange: [0, -12, 0],
    duration: 5,
  },
  {
    style: 'w-8 h-8 rounded-lg bg-amber-300/15 rotate-12',
    position: 'top-[30%] right-[8%]',
    yRange: [0, 15, 0],
    duration: 6,
  },
  {
    style: 'w-5 h-5 rounded-full bg-rose-300/20',
    position: 'bottom-[20%] left-[12%]',
    yRange: [0, -10, 0],
    duration: 4.5,
  },
  {
    style: 'w-7 h-7 rounded-lg bg-orange-400/10 -rotate-6',
    position: 'bottom-[35%] right-[15%]',
    yRange: [0, 12, 0],
    duration: 5.5,
  },
];

export function FloatingShapes({ className = '' }: FloatingShapesProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.position} ${s.style}`}
          animate={{ y: s.yRange }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
