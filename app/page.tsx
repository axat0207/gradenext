"use client";
import { useState } from "react";
import SubjectSelection from "@/components/SubjectSelection";
import { TestReport as TestReportType } from "@/types";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const GRADE_SUBJECT_CONFIG = {
  1: {
    mathematics: {
      topics: ["numbers", "basic_shapes"],
      displayNames: {
        numbers: "Numbers & Counting",
        basic_shapes: "Basic Shapes",
      },
    },
    english: {
      topics: ["phonics", "sight_words", "basic_reading"],
      displayNames: {
        phonics: "Phonics",
        sight_words: "Sight Words",
        basic_reading: "Basic Reading",
      },
    },
  },
  2: {
    mathematics: {
      topics: ["addition_subtraction", "basic_geometry", "patterns"],
      displayNames: {
        addition_subtraction: "Addition & Subtraction",
        basic_geometry: "Basic Geometry",
        patterns: "Patterns & Sequences",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading"],
      displayNames: {
        grammar: "Basic Grammar",
        vocabulary: "Vocabulary",
        reading: "Reading Comprehension",
      },
    },
  },
  3: {
    mathematics: {
      topics: ["multiplication", "division", "fractions", "measurement"],
      displayNames: {
        multiplication: "Multiplication",
        division: "Division",
        fractions: "Basic Fractions",
        measurement: "Measurement",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing"],
      displayNames: {
        grammar: "Grammar",
        vocabulary: "Vocabulary",
        reading: "Reading Comprehension",
        writing: "Writing Skills",
      },
    },
  },
  4: {
    mathematics: {
      topics: ["fractions", "decimals", "geometry", "data"],
      displayNames: {
        fractions: "Fractions & Decimals",
        decimals: "Decimal Operations",
        geometry: "Geometry",
        data: "Data & Graphs",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing"],
      displayNames: {
        grammar: "Advanced Grammar",
        vocabulary: "Advanced Vocabulary",
        reading: "Critical Reading",
        writing: "Creative Writing",
      },
    },
  },
  5: {
    mathematics: {
      topics: ["algebra", "geometry", "statistics", "problem_solving"],
      displayNames: {
        algebra: "Pre-Algebra",
        geometry: "Advanced Geometry",
        statistics: "Statistics & Probability",
        problem_solving: "Problem Solving",
      },
    },
    english: {
      topics: ["grammar", "vocabulary", "reading", "writing", "literature"],
      displayNames: {
        grammar: "Complex Grammar",
        vocabulary: "Rich Vocabulary",
        reading: "Advanced Reading",
        writing: "Essay Writing",
        literature: "Literature Analysis",
      },
    },
  },
} as const;

type GradeLevel = keyof typeof GRADE_SUBJECT_CONFIG;
type SubjectConfig = (typeof GRADE_SUBJECT_CONFIG)[GradeLevel];
export default function Home() {
  const router = useRouter();
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [gradeSubmitted, setGradeSubmitted] = useState(false);

  const handleGradeChange = (value: string) => {
    const newGrade = parseInt(value) as GradeLevel;
    setGrade(newGrade);
  };

  const handleGradeSubmit = () => {
    if (grade) {
      setGradeSubmitted(true);
    }
  };

  const handleSubjectSelect = (selectedSubject: keyof SubjectConfig) => {
    if (grade) {
      sessionStorage.setItem("quizGrade", grade.toString());
      sessionStorage.setItem("quizSubject", selectedSubject);
      sessionStorage.setItem(
        "quizConfig",
        JSON.stringify(GRADE_SUBJECT_CONFIG[grade][selectedSubject])
      );

      router.push("/quiz");
    }
  };

  const handleStartOver = () => {
    setGrade(null);
    setGradeSubmitted(false);
  };

  const currentConfig = grade ? GRADE_SUBJECT_CONFIG[grade] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-200 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-center mb-8 text-purple-600"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          Magical Learning Journey
        </motion.h1>

        {!gradeSubmitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
                What's Your Magic Level?
              </h2>
              <div className="space-y-4">
                <Select
                  value={grade?.toString()}
                  onValueChange={handleGradeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((gradeLevel) => (
                      <SelectItem
                        key={gradeLevel}
                        value={gradeLevel.toString()}
                      >
                        Grade {gradeLevel} Wizard
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGradeSubmit}
                  disabled={!grade}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
                >
                  Start Your Adventure!
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : currentConfig ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-blue-600">
                  Choose Your Path
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Grade {grade} Wizard
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartOver}
                    className="hover:bg-purple-100"
                  >
                    Change Level
                  </Button>
                </div>
              </div>
              <SubjectSelection
                onSelect={handleSubjectSelect}
                subjects={Object.keys(currentConfig).map((subjectKey) => ({
                  value: subjectKey,
                  label:
                    subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1),
                  icon: subjectKey === "mathematics" ? "🧮" : "📚",
                  color: subjectKey === "mathematics" ? "#4CAF50" : "#2196F3",
                }))}
              />
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
