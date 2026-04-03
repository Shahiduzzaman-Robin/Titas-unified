'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { logoPaths } from './logoPaths';

export default function BrahmanbariaLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0.3, 0.9], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.3, 0.9], [0.98, 1]);

  return (
    <div ref={containerRef} className="py-10 md:py-32 flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <motion.div
        style={{
          opacity,
          scale
        }}
        className="w-full px-4 md:px-6 max-w-[1366px] flex flex-col items-center md:items-start"
      >
        <motion.p
          className="bn-text text-2xl md:text-5xl mb-2 font-bold tracking-wide opacity-100 relative z-10 text-center md:text-left"
          style={{
            opacity,
            color: '#656666'
          }}
        >
          ঢাকা বিশ্ববিদ্যালয়ে একখণ্ড
        </motion.p>
        <svg
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 180 1366 350"
          className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] overflow-visible"
          preserveAspectRatio="xMidYMin meet"
        >
          <defs>
            <linearGradient id="logoGradient" gradientUnits="userSpaceOnUse" x1="160" y1="0" x2="1300" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#175264" />
            </linearGradient>
          </defs>

          <g fill="url(#logoGradient)">
            {logoPaths.map((d, index) => (
              <path 
                key={index} 
                d={d} 
              />
            ))}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
