import React from "react";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  bestStreak,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Flame
        className={`h-5 w-5 ${
          currentStreak > 0 ? "text-orange-500" : "text-gray-400"
        }`}
      />
      <span className="text-sm font-medium">
        Streak: {currentStreak} | Best: {bestStreak}
      </span>
    </div>
  );
};
