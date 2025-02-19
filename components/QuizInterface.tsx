import { useState, useEffect, useCallback, useRef } from "react";
import { Question, TestReport } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TEST_DURATION_MINUTES,
  CONSECUTIVE_TOPIC_CHANGE,
} from "@/config/constants";
import { Loader2, Lightbulb, Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import CalculatorComponent from "@/components/CalculatorComponent";
import TopicIntroduction from "@/components/TopicIntroduction";
import FeedbackDropdown from "@/components/FeedbackDropdown";

const DIFFICULTY_LEVELS = [
  "very_easy",
  "easy",
  "medium",
  "challenging",
  "hard",
];

interface TopicDetail {
  title: string;
  description: string;
  keyPoints: string[];
  examples: string[];
}

export default function QuizInterface({
  subject,
  grade,
  config,
  onTestComplete,
}: {
  subject: string;
  grade: number;
  config: { topics: readonly string[]; displayNames: Record<string, string> };
  onTestComplete: (report: TestReport) => void;
}) {
  // Existing states
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(
    TEST_DURATION_MINUTES * 60
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(config.topics[0]);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false);

  // New states for level progression and streak
  const [questionsInCurrentLevel, setQuestionsInCurrentLevel] = useState(0);
  const [correctInCurrentLevel, setCorrectInCurrentLevel] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Topic introduction states
  const [showTopicIntro, setShowTopicIntro] = useState(false);
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoadingTopicDetail, setIsLoadingTopicDetail] = useState(false);
  const [topicDetailError, setTopicDetailError] = useState<string | null>(null);
  const [seenTopics, setSeenTopics] = useState<Set<string>>(new Set());

  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);
  const questionStartTime = useRef(Date.now());

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

  const [currentQuestionStats, setCurrentQuestionStats] = useState({
    attempts: 0,
    hintUsed: false,
  });

  // Level Progress Component
  const LevelProgress = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-sm text-gray-500">Level Progress:</div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => {
          let hasIncorrect = questionsInCurrentLevel > correctInCurrentLevel;
          let isAfterIncorrect = hasIncorrect && index > correctInCurrentLevel;

          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full ${
                index < questionsInCurrentLevel
                  ? isAfterIncorrect
                    ? "bg-gray-200"
                    : index < correctInCurrentLevel
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );

  // Streak Component
  const StreakDisplay = () => (
    <div className="flex items-center gap-2">
      <Flame
        className={`h-5 w-5 ${
          currentStreak > 0 ? "text-orange-500" : "text-gray-400"
        }`}
      />
      <span className="text-sm font-medium">
        Streak: {currentStreak} | Best: {bestStreak}
      </span>
    </div>
  );
  // Fetch topic detail
  const fetchTopicDetail = useCallback(
    async (topic: string) => {
      setIsLoadingTopicDetail(true);
      setTopicDetailError(null);

      try {
        const response = await fetch("/api/topic-detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, grade, topic }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch topic details");
        }

        const data = await response.json();
        setTopicDetail(data);
        setShowTopicIntro(true);
      } catch (error) {
        setTopicDetailError(
          error instanceof Error
            ? error.message
            : "Failed to load topic details"
        );
      } finally {
        setIsLoadingTopicDetail(false);
      }
    },
    [subject, grade]
  );

  // Show topic introduction for new topics
  useEffect(() => {
    if (!seenTopics.has(currentTopic)) {
      fetchTopicDetail(currentTopic);
      setSeenTopics((prev) => new Set([...prev, currentTopic]));
    }
  }, [currentTopic, seenTopics, fetchTopicDetail]);

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
  useEffect(() => {
    if (!seenTopics.has(currentTopic)) {
      fetchTopicDetail(currentTopic);
      setSeenTopics((prev) => new Set([...prev, currentTopic]));
    } else {
      // Even if we've seen the topic before, show the intro when topic changes
      setShowTopicIntro(true);
    }
  }, [currentTopic, seenTopics, fetchTopicDetail]);
  // Update hints used in test report
  useEffect(() => {
    if (showHint && !currentQuestionStats.hintUsed) {
      setTestReport((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      setCurrentQuestionStats((prev) => ({ ...prev, hintUsed: true }));
    }
  }, [showHint, currentQuestionStats.hintUsed]);

  // Fetch next question
  const fetchNextQuestion = useCallback(async () => {
    if (!isMounted.current || testCompleted) return;

    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowHint(false);
    setShowExplanation(false);
    setCurrentQuestionStats({ attempts: 0, hintUsed: false });
    questionStartTime.current = Date.now();

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
      setCurrentQuestion(data);
      setTestReport((prev) => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
      }));
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
  }, [subject, grade, currentTopic, difficultyLevel, testCompleted]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
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

    setCurrentQuestionStats((prev) => ({
      attempts: prev.attempts + 1,
      hintUsed: prev.hintUsed,
    }));

    // Update questions count for current level
    setQuestionsInCurrentLevel((prev) => prev + 1);

    if (isCorrect) {
      // Update streak
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });

      setCorrectInCurrentLevel((prev) => prev + 1);

      // Check if we should change level or topic
      if (questionsInCurrentLevel === 4) {
        // This will be the 5th question
        if (correctInCurrentLevel === 4) {
          // All previous questions were correct
          if (difficultyLevel === DIFFICULTY_LEVELS.length - 1) {
            // If at max difficulty, change topic
            setCurrentTopic((prevTopic) => {
              const topics = config.topics;
              const nextIndex = (topics.indexOf(prevTopic) + 1) % topics.length;
              return topics[nextIndex];
            });
            setDifficultyLevel(0);
          } else {
            // Increase difficulty
            setDifficultyLevel((prev) => prev + 1);
          }
          // Reset counters
          setQuestionsInCurrentLevel(0);
          setCorrectInCurrentLevel(0);
        } else {
          // Reset counters but maintain difficulty
          setQuestionsInCurrentLevel(0);
          setCorrectInCurrentLevel(0);
        }
      }

      // Update test report
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
        topicStat.correct++;
        topicStat.totalAttempts += currentQuestionStats.attempts + 1;
        topicStat.totalTime += timeSpent;
        topicStat.hintsUsed += currentQuestionStats.hintUsed ? 1 : 0;

        return {
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          hintsUsed: prev.hintsUsed + (currentQuestionStats.hintUsed ? 1 : 0),
          totalAttempts: prev.totalAttempts + currentQuestionStats.attempts + 1,
          timeTaken: prev.timeTaken + timeSpent,
          averageTimePerQuestion:
            (prev.timeTaken + timeSpent) / (prev.totalQuestions + 1),
          bestStreak: Math.max(prev.bestStreak, currentStreak + 1),
          questionsData: [
            ...prev.questionsData,
            {
              questionId: currentQuestion.id,
              topic: currentQuestion.topic,
              attemptsNeeded: currentQuestionStats.attempts + 1,
              hintUsed: currentQuestionStats.hintUsed,
              timeTaken: timeSpent,
              correct: true,
              difficulty: DIFFICULTY_LEVELS[difficultyLevel],
            },
          ],
          topicStats: { ...newStats, [currentTopic]: topicStat },
        };
      });

      setShowExplanation(true);
    } else {
      // Reset streak on wrong answer
      setCurrentStreak(0);

      // For incorrect answers
      if (questionsInCurrentLevel === 4) {
        // Reset counters but maintain difficulty
        setQuestionsInCurrentLevel(0);
        setCorrectInCurrentLevel(0);
      }

      const newAttempts = currentQuestionStats.attempts + 1;
      if (newAttempts === 1) {
        setShowHint(true);
      } else {
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
          topicStat.totalAttempts += newAttempts;
          topicStat.totalTime += timeSpent;
          topicStat.hintsUsed += currentQuestionStats.hintUsed ? 1 : 0;

          return {
            ...prev,
            hintsUsed: prev.hintsUsed + (currentQuestionStats.hintUsed ? 1 : 0),
            totalAttempts: prev.totalAttempts + newAttempts,
            timeTaken: prev.timeTaken + timeSpent,
            averageTimePerQuestion:
              (prev.timeTaken + timeSpent) / (prev.totalQuestions + 1),
            questionsData: [
              ...prev.questionsData,
              {
                questionId: currentQuestion.id,
                topic: currentQuestion.topic,
                attemptsNeeded: newAttempts,
                hintUsed: currentQuestionStats.hintUsed,
                timeTaken: timeSpent,
                correct: false,
                difficulty: DIFFICULTY_LEVELS[difficultyLevel],
              },
            ],
            topicStats: { ...newStats, [currentTopic]: topicStat },
          };
        });
        setShowExplanation(true);
      }
    }
    setIsAnswerProcessing(false);
  }, [
    currentQuestion,
    currentTopic,
    testCompleted,
    isAnswerProcessing,
    selectedAnswer,
    currentQuestionStats,
    difficultyLevel,
    config.topics,
    questionsInCurrentLevel,
    correctInCurrentLevel,
    currentStreak,
  ]);
  // Initialize quiz and timer effects
  useEffect(() => {
    isMounted.current = true;
    if (!testCompleted) {
      fetchNextQuestion();
    }

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchNextQuestion, testCompleted]);

  useEffect(() => {
    if (testCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTestCompleted(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testCompleted]);

  const handleNextQuestion = useCallback(() => {
    setShowExplanation(false);
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  useEffect(() => {
    if (testCompleted) {
      onTestComplete(testReport);
    }
  }, [testCompleted, onTestComplete, testReport]);

  // JSX Return
  return (
    <div className="w-full mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-bold">
                Time: {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, "0")}
              </div>
              <div className="text-lg">
                {config.displayNames[currentTopic]} (Level:{" "}
                {DIFFICULTY_LEVELS.indexOf(DIFFICULTY_LEVELS[difficultyLevel]) +
                  1}
                )
              </div>
            </div>
            <LevelProgress />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Questions: {questionsInCurrentLevel}/5 | Correct:{" "}
                {correctInCurrentLevel}
              </div>
              <StreakDisplay />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
              <Button onClick={fetchNextQuestion} className="mt-2">
                Retry
              </Button>
            </Alert>
          )}

          {isLoading ? (
            <Card className="p-6 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Generating question...</p>
              </div>
            </Card>
          ) : (
            currentQuestion && (
              <Card className="p-6">
                <div className="relative">
                  <h2
                    className="text-xl mb-4 pr-10"
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion.questionText,
                    }}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0"
                        >
                          <Lightbulb className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Correct Answer: {currentQuestion.correctAnswer}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      variant={
                        showExplanation
                          ? option === currentQuestion.correctAnswer
                            ? "correct"
                            : option === selectedAnswer
                            ? "destructive"
                            : "outline"
                          : selectedAnswer === option
                          ? "default"
                          : "outline"
                      }
                      disabled={showExplanation}
                      className="p-4 text-lg w-full"
                    >
                      <span dangerouslySetInnerHTML={{ __html: option }} />
                    </Button>
                  ))}
                </div>

                {!showExplanation && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setShowHint(true)}
                      disabled={showHint || !!selectedAnswer}
                      variant="outline"
                    >
                      Show Hint
                    </Button>
                    {selectedAnswer && (
                      <>
                        <Button
                          onClick={handleSubmit}
                          disabled={isAnswerProcessing}
                        >
                          Submit Answer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAnswer(null)}
                          disabled={isAnswerProcessing}
                        >
                          Clear Selection
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {showHint && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <strong>Hint:</strong>{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: currentQuestion.hint,
                        }}
                      />
                    </AlertDescription>
                  </Alert>
                )}

                {showExplanation && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <strong>Explanation:</strong>{" "}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentQuestion.explanation,
                        }}
                      />
                      <Button className="mt-2" onClick={handleNextQuestion}>
                        Continue
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4">
                  <FeedbackDropdown onSubmitFeedback={handleFeedbackSubmit} />
                </div>
              </Card>
            )
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <AnalyticsPanel testReport={testReport} />
          <CalculatorComponent />
        </div>

        <TopicIntroduction
          isOpen={showTopicIntro}
          onClose={() => {
            setShowTopicIntro(false);
            if (!currentQuestion) {
              fetchNextQuestion();
            }
          }}
          topicName={config.displayNames[currentTopic]}
          topicDetail={topicDetail}
          isLoading={isLoadingTopicDetail}
          error={topicDetailError}
        />
      </div>
    </div>
  );
}

// export default QuizInterface;
