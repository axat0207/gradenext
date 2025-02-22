import { useCallback, useRef } from "react";
import { Question } from "@/types";
import { DIFFICULTY_LEVELS } from "@/config/constants";

export const useQuestionFetcher = (
  subject: string,
  grade: number,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setCurrentQuestion: (question: Question | null) => void
) => {
  const abortController = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const fetchNextQuestion = useCallback(
    async (currentTopic: string, difficultyLevel: number) => {
      setIsLoading(true);
      setError(null);

      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        const level =
          DIFFICULTY_LEVELS[
            Math.min(difficultyLevel, DIFFICULTY_LEVELS.length - 1)
          ];
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, grade, topic: currentTopic, level }),
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        if (isMounted.current) {
          setCurrentQuestion(data);
        }
      } catch (error: any) {
        if (isMounted.current && error.name !== "AbortError") {
          setError(
            error instanceof Error ? error.message : "Failed to load question"
          );
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [subject, grade, setIsLoading, setError, setCurrentQuestion]
  );

  return { fetchNextQuestion, abortController, isMounted };
};
