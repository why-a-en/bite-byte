'use client';

import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const charVariants = {
  hidden: { y: '100%', opacity: 0, rotateX: -80 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 200,
    },
  },
};

export default function SplitText({ text, className, delay = 0 }: SplitTextProps) {
  const words = text.split(' ');

  return (
    <motion.span
      className={className}
      style={{ display: 'inline', perspective: '600px' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay,
          },
        },
      }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={charVariants}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <motion.span variants={charVariants} style={{ display: 'inline-block' }}>
              &nbsp;
            </motion.span>
          )}
        </span>
      ))}
    </motion.span>
  );
}
