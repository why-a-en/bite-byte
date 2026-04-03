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

    // Hide native cursor globally
    const style = document.createElement('style');
    style.id = 'magnetic-cursor-hide';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    const SIZE = 48;
    const HALF = SIZE / 2;

    const handleMouseMove = (e: MouseEvent) => {
      rawX.current = e.clientX - HALF;
      rawY.current = e.clientY - HALF;
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
      const el = document.getElementById('magnetic-cursor-hide');
      if (el) el.remove();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [x, y]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          x,
          y,
          border: isHoveringMagnetic
            ? '2px solid rgba(249,115,22,1)'
            : '2px solid rgba(0,0,0,0.5)',
          background: isHoveringMagnetic
            ? 'rgba(249,115,22,0.15)'
            : 'transparent',
          boxShadow: isHoveringMagnetic
            ? '0 0 20px rgba(249,115,22,0.5), 0 0 60px rgba(249,115,22,0.2)'
            : '0 0 10px rgba(0,0,0,0.08)',
          transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.3s ease',
        }}
        animate={{
          scale: isHoveringMagnetic ? 1.6 : 1,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
      {/* Center dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          pointerEvents: 'none',
          zIndex: 10000,
          x,
          y,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{
            width: isHoveringMagnetic ? 0 : 6,
            height: isHoveringMagnetic ? 0 : 6,
            opacity: isHoveringMagnetic ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          style={{
            borderRadius: '50%',
            background: '#1a1a1a',
          }}
        />
      </motion.div>
    </>
  );
}
