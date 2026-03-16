'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function MagneticCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringMagnetic, setIsHoveringMagnetic] = useState(false);
  const rawX = useRef(0);
  const rawY = useRef(0);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      rawX.current = e.clientX - 20;
      rawY.current = e.clientY - 20;
      x.set(rawX.current);
      y.set(rawY.current);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magnetic = target.closest('[data-magnetic]');
      if (magnetic) {
        setIsHoveringMagnetic(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magnetic = target.closest('[data-magnetic]');
      if (magnetic) {
        setIsHoveringMagnetic(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [x, y]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        x,
        y,
        border: isHoveringMagnetic ? '2px solid #f97316' : '2px solid #d1d5db',
        background: 'transparent',
        mixBlendMode: 'normal',
        transition: 'border-color 0.2s ease',
      }}
      animate={{
        scale: isHoveringMagnetic ? 1.5 : 1,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}
