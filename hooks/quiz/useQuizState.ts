import { useState } from "react";
import { Question } from "@/types";

export const useQuizState = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false);

  return {
    currentQuestion,
    setCurrentQuestion,
    selectedAnswer,
    setSelectedAnswer,
    showHint,
    setShowHint,
    showExplanation,
    setShowExplanation,
    isLoading,
    setIsLoading,
    error,
    setError,
    testCompleted,
    setTestCompleted,
    isAnswerProcessing,
    setIsAnswerProcessing,
  };
};
