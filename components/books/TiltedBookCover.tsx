"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TiltedBookCoverProps {
  title: string;
  coverImageUrl?: string;
}

export default function TiltedBookCover({ title, coverImageUrl }: TiltedBookCoverProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 160, damping: 18, mass: 0.45 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 160, damping: 18, mass: 0.45 });

  const firstChar = title.trim().charAt(0).toUpperCase();

  return (
    <div className="relative mx-auto w-full max-w-[340px] [perspective:1100px]">
      <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gold/20 blur-2xl" />
      <motion.div
        ref={cardRef}
        style={{ rotateX: smoothRotateX, rotateY: smoothRotateY }}
        onMouseMove={(event) => {
          const bounds = cardRef.current?.getBoundingClientRect();
          if (!bounds) return;
          const x = event.clientX - bounds.left;
          const y = event.clientY - bounds.top;
          const rotateYValue = ((x / bounds.width) * 2 - 1) * 8;
          const rotateXValue = (1 - (y / bounds.height) * 2) * 8;
          rotateX.set(rotateXValue);
          rotateY.set(rotateYValue);
        }}
        onMouseLeave={() => {
          rotateX.set(0);
          rotateY.set(0);
        }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-ash to-void shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
      >
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 80vw, 340px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#1d242e] via-[#1f2127] to-[#171614]">
            <span className="font-title text-9xl text-gold/35">{firstChar}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,255,255,0.24),transparent_35%)]" />
      </motion.div>
    </div>
  );
}
