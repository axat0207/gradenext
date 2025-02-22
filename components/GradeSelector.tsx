// components/GradeSelector.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubjectSelector from "./SubjectSelector";
import { GradeLevel, SubjectConfig } from "@/config/curriculum";

interface GradeSelectorProps {
  config: Record<GradeLevel, SubjectConfig>;
}

export default function GradeSelector({ config }: GradeSelectorProps) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [gradeSubmitted, setGradeSubmitted] = useState(false);

  const handleGradeChange = (value: string) => {
    setGrade(parseInt(value) as GradeLevel);
  };

  const handleGradeSubmit = () => {
    if (grade) {
      setGradeSubmitted(true);
    }
  };

  const handleStartOver = () => {
    setGrade(null);
    setGradeSubmitted(false);
  };

  const currentConfig = grade ? config[grade] : null;

  return (
    <>
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
                    <SelectItem key={gradeLevel} value={gradeLevel.toString()}>
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
        <SubjectSelector
          grade={grade}
          config={currentConfig}
          onBack={handleStartOver}
        />
      ) : null}
    </>
  );
}
