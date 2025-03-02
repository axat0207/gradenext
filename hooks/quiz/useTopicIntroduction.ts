// hooks/quiz/useTopicIntroduction.ts
import { useState, useCallback, useEffect } from "react";

interface TopicDetail {
  title: string;
  description: string;
  keyPoints: string[];
  examples: string[];
}

export const useTopicIntroduction = (subject: string, grade: number) => {
  const [showTopicIntro, setShowTopicIntro] = useState(true);
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoadingTopicDetail, setIsLoadingTopicDetail] = useState(false);
  const [topicDetailError, setTopicDetailError] = useState<string | null>(null);
  const [seenTopics, setSeenTopics] = useState<Set<string>>(new Set());

  const fetchTopicDetail = useCallback(
    async (topic: string) => {
      if (seenTopics.has(topic)) {
        return;
      }

      setIsLoadingTopicDetail(true);
      setTopicDetailError(null);
      setShowTopicIntro(true);

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
    [subject, grade, seenTopics]
  );

  const markTopicAsSeen = useCallback((topic: string) => {
    setSeenTopics((prev) => new Set([...prev, topic]));
  }, []);

  return {
    showTopicIntro,
    setShowTopicIntro,
    topicDetail,
    isLoadingTopicDetail,
    topicDetailError,
    seenTopics,
    fetchTopicDetail,
    markTopicAsSeen,
  };
};
