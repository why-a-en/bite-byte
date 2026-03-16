'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollSectionProps {
  children: ReactNode;
  panelCount: number;
}

export default function HorizontalScrollSection({ children, panelCount }: HorizontalScrollSectionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;

    // On mobile: disable horizontal scroll (just let it be vertical)
    if (window.matchMedia('(max-width: 767px)').matches) return;

    const inner = innerRef.current;
    const outer = outerRef.current;

    const ctx = gsap.context(() => {
      const totalWidth = inner.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollAmount = totalWidth - viewportWidth;

      gsap.to(inner, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: outer,
          pin: true,
          scrub: 1,
          end: () => '+=' + scrollAmount,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => ctx.revert();
  }, [panelCount]);

  return (
    <div ref={outerRef} className="overflow-hidden">
      <div
        ref={innerRef}
        className="flex"
        style={{ width: `${panelCount * 100}vw` }}
      >
        {children}
      </div>
    </div>
  );
}
