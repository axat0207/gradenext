import { useState, useEffect } from "react";
import { TEST_DURATION_MINUTES } from "@/config/constants";

export const useQuizTimer = (
  testCompleted: boolean,
  onTimeComplete: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState(
    TEST_DURATION_MINUTES * 60
  );

  useEffect(() => {
    if (testCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeComplete();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testCompleted, onTimeComplete]);

  return timeRemaining;
};
