"use client";

import { useEffect, useState } from "react";

export function useTypingAnimation(text: string, speed = 40, startDelay = 1500) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const reset = () => {
      if (!cancelled) {
        setDisplayed("");
        setIsComplete(false);
      }
    };

    reset();

    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (cancelled) {
          return;
        }

        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, isComplete };
}
