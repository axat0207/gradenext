"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuizInterface from "@/components/QuizInterface";
import TestReport from "@/components/TestReport";
import { TestReport as TestReportType } from "@/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { ProfileMenu } from "@/components/ProfileMenu";

interface QuizData {
  grade: number;
  subject: string;
  config: any; // Replace with your specific config type
}

interface QuizSession {
  id: string;
  email: string;
  grade: number;
  subject: string;
  config: any;
  created_at: string;
  completed_at?: string;
  abandoned_at?: string;
  report?: TestReportType;
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testReport, setTestReport] = useState<TestReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const sessionId = searchParams.get("session");

        if (!sessionId || !session?.user?.email) {
          router.push("/");
          return;
        }

        // Fetch quiz session
        const { data: sessionData, error: sessionError } = await supabase
          .from("quiz_sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("email", session.user.email)
          .single();

        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData) {
          setError("Quiz session not found");
          return;
        }

        // Check if quiz is already completed
        if (sessionData.completed_at) {
          setIsTestComplete(true);
          setTestReport(sessionData.report);
        }

        setQuizSession(sessionData);
        setQuizData({
          grade: sessionData.grade,
          subject: sessionData.subject,
          config: sessionData.config,
        });
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load quiz data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [router, searchParams, session]);

  const handleTestComplete = async (report: TestReportType) => {
    try {
      const sessionId = searchParams.get("session");

      if (!sessionId || !session?.user?.email) {
        throw new Error("Invalid session");
      }

      // Update quiz session with results
      const { error: updateError } = await supabase
        .from("quiz_sessions")
        .update({
          completed_at: new Date().toISOString(),
          report: report,
        })
        .eq("id", sessionId)
        .eq("email", session.user.email);

      if (updateError) throw updateError;

      setIsTestComplete(true);
      setTestReport(report);

      // Optional: Update user statistics or achievements here
    } catch (error) {
      console.error("Error saving test report:", error);
      setError("Failed to save test results");
    }
  };

  const handleStartOver = async () => {
    try {
      if (!isTestComplete && quizSession?.id && session?.user?.email) {
        // Mark session as abandoned if not completed
        await supabase
          .from("quiz_sessions")
          .update({
            abandoned_at: new Date().toISOString(),
          })
          .eq("id", quizSession.id)
          .eq("email", session.user.email);
      }

      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  if (!quizData || !session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No quiz data found</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {!isTestComplete ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Grade {quizData.grade} |{" "}
                {quizData.subject.charAt(0).toUpperCase() +
                  quizData.subject.slice(1)}
              </div>
              <div className="flex items-center gap-4">
                <div className="">
                  <ProfileMenu
                    email={session.user.email!}
                    image={session.user.image}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  Exit Quiz
                </Button>
              </div>
            </div>
            <QuizInterface
              subject={quizData.subject}
              grade={quizData.grade}
              config={quizData.config}
              onTestComplete={handleTestComplete}
            />
          </div>
        ) : (
          testReport && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Quiz Completed</div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleStartOver}
                    className="hover:bg-green-50 hover:text-green-600"
                  >
                    Start New Quiz
                  </Button>
                </div>
              </div>
              <TestReport report={testReport} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
