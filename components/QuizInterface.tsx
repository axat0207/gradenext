import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Import custom hooks
import { useQuizState } from "@/hooks/quiz/useQuizState";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";
import { useQuestionFetcher } from "@/hooks/quiz/useQuestionFetcher";
import { useTopicProgression } from "@/hooks/quiz/useTopicProgression";
import { useQuizReport } from "@/hooks/quiz/useQuizReport";
import { useTopicIntroduction } from "@/hooks/quiz/useTopicIntroduction";

// Import components
import { LevelProgress } from "@/components/quiz/LevelProgress";
import { StreakDisplay } from "@/components/quiz/StreakDisplay";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuestionActions } from "@/components/quiz/QuestionActions";
import { QuestionFeedback } from "@/components/quiz/QuestionFeedback";
import { Timer } from "@/components/quiz/Timer";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import CalculatorComponent from "@/components/CalculatorComponent";
import TopicIntroduction from "@/components/TopicIntroduction";
import FeedbackDropdown from "@/components/FeedbackDropdown";

interface QuizInterfaceProps {
  subject: string;
  grade: number;
  config: {
    topics: readonly string[];
    displayNames: Record<string, string>;
  };
  onTestComplete: (report: any) => void;
}

export default function QuizInterface({
  subject,
  grade,
  config,
  onTestComplete,
}: QuizInterfaceProps) {
  // Initialize hooks
  const {
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
  } = useQuizState();

  const {
    currentTopic,
    difficultyLevel,
    questionsInCurrentLevel,
    correctInCurrentLevel,
    currentStreak,
    bestStreak,
    handleProgressionUpdate,
  } = useTopicProgression(config.topics[0]);

  const { testReport, updateReport } = useQuizReport();
  const [currentQuestionStats, setCurrentQuestionStats] = useState({
    attempts: 0,
    hintUsed: false,
  });

  const questionStartTime = useRef(Date.now());
  const isInitialLoad = useRef(true);
  const lastTopicRef = useRef<string | null>(null);

  const timeRemaining = useQuizTimer(testCompleted, () => {
    setTestCompleted(true);
    onTestComplete(testReport);
  });

  const {
    showTopicIntro,
    setShowTopicIntro,
    topicDetail,
    isLoadingTopicDetail,
    topicDetailError,
    fetchTopicDetail,
    markTopicAsSeen,
  } = useTopicIntroduction(subject, grade);

  const { fetchNextQuestion, abortController, isMounted } = useQuestionFetcher(
    subject,
    grade,
    setIsLoading,
    setError,
    setCurrentQuestion
  );

  // Effect to handle initial topic introduction
  useEffect(() => {
    if (isInitialLoad.current && currentTopic) {
      fetchTopicDetail(currentTopic)
        .then(() => {
          markTopicAsSeen(currentTopic);
          isInitialLoad.current = false;
        })
        .catch((error) => {
          console.error("Failed to fetch initial topic detail:", error);
        });
    }
  }, [currentTopic, fetchTopicDetail, markTopicAsSeen]);

  // Effect to handle topic changes
  useEffect(() => {
    if (
      currentTopic &&
      (!lastTopicRef.current || lastTopicRef.current !== currentTopic)
    ) {
      fetchTopicDetail(currentTopic)
        .then(() => {
          markTopicAsSeen(currentTopic);
          lastTopicRef.current = currentTopic;
        })
        .catch((error) => {
          console.error("Failed to fetch topic detail:", error);
        });
    }
  }, [currentTopic, fetchTopicDetail, markTopicAsSeen]);

  // Handle answer submission
  const handleSubmit = React.useCallback(() => {
    if (
      !currentQuestion ||
      testCompleted ||
      isAnswerProcessing ||
      !selectedAnswer
    )
      return;

    setIsAnswerProcessing(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Math.floor(
      (Date.now() - questionStartTime.current) / 1000
    );

    handleProgressionUpdate(isCorrect, config.topics);

    updateReport(
      currentQuestion,
      isCorrect,
      currentQuestionStats.attempts + 1,
      timeSpent,
      showHint,
      currentTopic,
      difficultyLevel,
      currentStreak
    );

    setShowExplanation(true);
    setIsAnswerProcessing(false);
  }, [
    currentQuestion,
    testCompleted,
    isAnswerProcessing,
    selectedAnswer,
    currentTopic,
    difficultyLevel,
    currentStreak,
  ]);

  // Handle next question
  const handleNextQuestion = React.useCallback(() => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setShowHint(false);
    questionStartTime.current = Date.now();
    fetchNextQuestion(currentTopic, difficultyLevel);
  }, [currentTopic, difficultyLevel]);

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: string) => {
    try {
      await fetch("/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion?.id,
          feedback,
          subject,
          grade,
          topic: currentTopic,
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  // Handle topic introduction close
  const handleTopicIntroClose = () => {
    setShowTopicIntro(false);
    if (!currentQuestion) {
      fetchNextQuestion(currentTopic, difficultyLevel);
    }
  };

  // Initialize quiz
  useEffect(() => {
    if (!testCompleted) {
      fetchNextQuestion(currentTopic, difficultyLevel);
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [testCompleted, currentTopic, difficultyLevel]);

  // Complete test effect
  useEffect(() => {
    if (testCompleted) {
      onTestComplete(testReport);
    }
  }, [testCompleted, onTestComplete, testReport]);

  return (
    <div className="w-full mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Timer and Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Timer timeRemaining={timeRemaining} />
              <div className="text-lg">
                {config.displayNames[currentTopic]} (Level:{" "}
                {difficultyLevel + 1})
              </div>
            </div>
            <LevelProgress
              questionsInCurrentLevel={questionsInCurrentLevel}
              correctInCurrentLevel={correctInCurrentLevel}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Questions: {questionsInCurrentLevel}/5 | Correct:{" "}
                {correctInCurrentLevel}
              </div>
              <StreakDisplay
                currentStreak={currentStreak}
                bestStreak={bestStreak}
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
              <Button
                onClick={() => fetchNextQuestion(currentTopic, difficultyLevel)}
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Question Section */}
          <QuestionCard
            question={currentQuestion}
            isLoading={isLoading}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            onSelectAnswer={setSelectedAnswer}
            onClearSelection={() => setSelectedAnswer(null)}
          />

          <QuestionActions
            showExplanation={showExplanation}
            showHint={showHint}
            selectedAnswer={selectedAnswer}
            isAnswerProcessing={isAnswerProcessing}
            onShowHint={() => setShowHint(true)}
            onSubmit={handleSubmit}
            onClearSelection={() => setSelectedAnswer(null)}
          />

          {currentQuestion && (
            <QuestionFeedback
              showHint={showHint}
              showExplanation={showExplanation}
              hint={currentQuestion.hint}
              explanation={currentQuestion.explanation}
              onContinue={handleNextQuestion}
            />
          )}

          <div className="mt-4">
            <FeedbackDropdown onSubmitFeedback={handleFeedbackSubmit} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <AnalyticsPanel testReport={testReport} />
          <CalculatorComponent />
        </div>

        {/* Topic Introduction Modal */}
        <TopicIntroduction
          isOpen={showTopicIntro}
          onClose={handleTopicIntroClose}
          topicName={config.displayNames[currentTopic]}
          topicDetail={topicDetail}
          isLoading={isLoadingTopicDetail}
          error={topicDetailError}
        />
      </div>
    </div>
  );
}
