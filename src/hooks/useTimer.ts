import { useState, useEffect, useRef, useCallback } from "react";

export interface UseTimerOptions {
  initialTime: number; // En segundos
  onTick?: (timeRemaining: number) => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer({
  initialTime,
  onTick,
  onComplete,
  autoStart = false,
}: UseTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Utilizar refs para callbacks y evitar reinicios del timer cuando cambian
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onTickRef.current = onTick;
    onCompleteRef.current = onComplete;
  }, [onTick, onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newTime?: number) => {
      setIsRunning(false);
      setTimeRemaining(newTime ?? initialTime);
    },
    [initialTime],
  );

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining((prev) => Math.max(0, prev + seconds));
  }, []);

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => {
          // Si ya estábamos en 0, no seguimos bajando
          if (prev <= 0) {
            setIsRunning(false);
            return 0;
          }

          const next = Math.max(0, prev - 1);

          if (onTickRef.current) {
            onTickRef.current(next);
          }

          if (next === 0) {
            setIsRunning(false);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]); // Quitamos timeRemaining de las dependencias para evitar reinicios

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    reset,
    addTime,
    formatTime,
    formattedTime: formatTime(timeRemaining),
  };
}
