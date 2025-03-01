// components/SubjectSelector.tsx
"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { setQuizSession } from "@/actions/quiz";
import { GradeLevel, SubjectConfig } from "@/config/curriculum";
import { setQuizSession } from "@/actions/quiz";

interface SubjectSelectorProps {
  grade: GradeLevel;
  config: SubjectConfig;
  onBack: () => void;
}

export default function SubjectSelector({
  grade,
  config,
  onBack,
}: SubjectSelectorProps) {
  const router = useRouter();

  const handleSubjectSelect = async (subject: keyof SubjectConfig) => {
    await setQuizSession(grade, subject, config[subject]);
    router.push("/quiz");
  };

  return (
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
            <span className="text-sm text-gray-500">Grade {grade} Wizard</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="hover:bg-purple-100"
            >
              Change Level
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(config) as Array<keyof SubjectConfig>).map(
            (subject) => (
              <motion.div
                key={subject}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleSubjectSelect(subject)}
                  className="w-full h-24 text-lg font-semibold"
                  style={{
                    background:
                      subject === "mathematics" ? "#4CAF50" : "#2196F3",
                  }}
                >
                  <span className="mr-2 text-2xl">
                    {subject === "mathematics" ? "🧮" : "📚"}
                  </span>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </Button>
              </motion.div>
            )
          )}
        </div>
      </Card>
    </motion.div>
  );
}
