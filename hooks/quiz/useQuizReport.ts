import { useState } from "react";
import { TestReport, Question } from "@/types";
import { DIFFICULTY_LEVELS } from "@/config/constants";

export const useQuizReport = () => {
  const [testReport, setTestReport] = useState<TestReport>({
    totalQuestions: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    timeTaken: 0,
    topicsCompleted: [],
    questionsData: [],
    topicStats: {},
    totalAttempts: 0,
    averageTimePerQuestion: 0,
    revisionNeeded: [],
    bestStreak: 0,
  });

  const updateReport = (
    currentQuestion: Question,
    isCorrect: boolean,
    attempts: number,
    timeSpent: number,
    hintUsed: boolean,
    currentTopic: string,
    difficultyLevel: number,
    currentStreak: number
  ) => {
    setTestReport((prev) => {
      const newStats = { ...prev.topicStats };
      const topicStat = newStats[currentTopic] || {
        total: 0,
        correct: 0,
        totalAttempts: 0,
        totalTime: 0,
        hintsUsed: 0,
      };

      topicStat.total++;
      if (isCorrect) topicStat.correct++;
      topicStat.totalAttempts += attempts;
      topicStat.totalTime += timeSpent;
      topicStat.hintsUsed += hintUsed ? 1 : 0;

      return {
        ...prev,
        correctAnswers: isCorrect
          ? prev.correctAnswers + 1
          : prev.correctAnswers,
        hintsUsed: hintUsed ? prev.hintsUsed + 1 : prev.hintsUsed,
        totalAttempts: prev.totalAttempts + attempts,
        timeTaken: prev.timeTaken + timeSpent,
        averageTimePerQuestion:
          (prev.timeTaken + timeSpent) / (prev.totalQuestions + 1),
        bestStreak: Math.max(prev.bestStreak, currentStreak),
        questionsData: [
          ...prev.questionsData,
          {
            questionId: currentQuestion.id,
            topic: currentQuestion.topic,
            attemptsNeeded: attempts,
            hintUsed,
            timeTaken: timeSpent,
            correct: isCorrect,
            difficulty: DIFFICULTY_LEVELS[difficultyLevel],
          },
        ],
        topicStats: { ...newStats, [currentTopic]: topicStat },
      };
    });
  };

  return { testReport, updateReport };
};
