"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

interface Subject {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface SubjectSelectionProps {
  onSelect: (subject: string) => void;
  subjects: Subject[];
}

export default function SubjectSelection({
  onSelect,
  subjects,
}: SubjectSelectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject.value);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => onSelect(subject.value), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-gradient-to-b from-blue-200 to-purple-200 p-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-purple-600"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        Choose Your Adventure!
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {subjects.map((subject) => (
          <motion.div
            key={subject.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleSubjectClick(subject)}
              className={`w-full h-40 text-xl font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                selectedSubject === subject.value
                  ? "ring-4 ring-yellow-400"
                  : ""
              }`}
              style={{ backgroundColor: subject.color }}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-4xl mb-2">{subject.icon}</span>
                {subject.label}
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
