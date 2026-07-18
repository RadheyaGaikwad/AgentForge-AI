"use client";

import { useEffect, useState } from "react";

export function useMouseParallax(factor = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * factor;
      const y = (e.clientY - window.innerHeight / 2) * factor;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [factor]);

  return offset;
}
