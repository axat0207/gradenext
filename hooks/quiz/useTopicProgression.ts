import { useState } from "react";
import { DIFFICULTY_LEVELS } from "@/config/constants";

export const useTopicProgression = (initialTopic: string) => {
  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [questionsInCurrentLevel, setQuestionsInCurrentLevel] = useState(0);
  const [correctInCurrentLevel, setCorrectInCurrentLevel] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const handleProgressionUpdate = (
    isCorrect: boolean,
    topics: readonly string[]
  ) => {
    setQuestionsInCurrentLevel((prev) => prev + 1);

    if (isCorrect) {
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });
      setCorrectInCurrentLevel((prev) => prev + 1);

      if (questionsInCurrentLevel === 4) {
        if (correctInCurrentLevel === 4) {
          if (difficultyLevel === DIFFICULTY_LEVELS.length - 1) {
            setCurrentTopic((prevTopic) => {
              const nextIndex = (topics.indexOf(prevTopic) + 1) % topics.length;
              return topics[nextIndex];
            });
            setDifficultyLevel(0);
          } else {
            setDifficultyLevel((prev) => prev + 1);
          }
          setQuestionsInCurrentLevel(0);
          setCorrectInCurrentLevel(0);
        } else {
          setQuestionsInCurrentLevel(0);
          setCorrectInCurrentLevel(0);
        }
      }
    } else {
      setCurrentStreak(0);
      if (questionsInCurrentLevel === 4) {
        setQuestionsInCurrentLevel(0);
        setCorrectInCurrentLevel(0);
      }
    }
  };

  return {
    currentTopic,
    setCurrentTopic,
    difficultyLevel,
    setDifficultyLevel,
    questionsInCurrentLevel,
    correctInCurrentLevel,
    currentStreak,
    bestStreak,
    handleProgressionUpdate,
  };
};
