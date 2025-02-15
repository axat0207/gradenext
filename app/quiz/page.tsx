"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizInterface from "@/components/QuizInterface";
import TestReport from "@/components/TestReport";
import { TestReport as TestReportType } from "@/types";
import { Button } from "../../components/ui/button";

export default function QuizPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<{
    grade: number;
    subject: string;
    config: any;
  } | null>(null);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [testReport, setTestReport] = useState<TestReportType | null>(null);

  useEffect(() => {
    // Retrieve data from sessionStorage
    const grade = sessionStorage.getItem("quizGrade");
    const subject = sessionStorage.getItem("quizSubject");
    const config = sessionStorage.getItem("quizConfig");

    if (!grade || !subject || !config) {
      // If data is missing, redirect back to home
      router.push("/");
      return;
    }

    setQuizData({
      grade: parseInt(grade),
      subject,
      config: JSON.parse(config),
    });
  }, [router]);

  const handleTestComplete = (report: TestReportType) => {
    setIsTestComplete(true);
    setTestReport(report);
  };

  const handleStartOver = () => {
    // Clear session storage and redirect to home
    sessionStorage.clear();
    router.push("/");
  };

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {!isTestComplete ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Grade {quizData.grade} |{" "}
                {quizData.subject.charAt(0).toUpperCase() +
                  quizData.subject.slice(1)}
              </div>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                Exit Quiz
              </Button>
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
              <div className="mb-4 flex justify-end">
                <Button variant="outline" onClick={handleStartOver}>
                  Start New Quiz
                </Button>
              </div>
              <TestReport report={testReport} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
