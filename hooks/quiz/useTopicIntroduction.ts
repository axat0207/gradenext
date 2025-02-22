import { useState, useCallback } from "react";
// import { TopicDetail } from "@/types";

export const useTopicIntroduction = (subject: string, grade: number) => {
  const [showTopicIntro, setShowTopicIntro] = useState(false);
  const [topicDetail, setTopicDetail] = useState<any | null>(null);
  const [isLoadingTopicDetail, setIsLoadingTopicDetail] = useState(false);
  const [topicDetailError, setTopicDetailError] = useState<string | null>(null);
  const [seenTopics, setSeenTopics] = useState<Set<string>>(new Set());

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

  const markTopicAsSeen = (topic: string) => {
    setSeenTopics((prev) => new Set([...prev, topic]));
  };

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
