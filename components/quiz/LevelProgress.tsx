import React from "react";

interface LevelProgressProps {
  questionsInCurrentLevel: number;
  correctInCurrentLevel: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  questionsInCurrentLevel,
  correctInCurrentLevel,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-sm text-gray-500">Level Progress:</div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => {
          const hasIncorrect = questionsInCurrentLevel > correctInCurrentLevel;
          const isAfterIncorrect =
            hasIncorrect && index > correctInCurrentLevel;

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
};
