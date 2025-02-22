import React from "react";

interface TimerProps {
  timeRemaining: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining }) => {
  return (
    <div className="text-lg font-bold">
      Time: {Math.floor(timeRemaining / 60)}:
      {String(timeRemaining % 60).padStart(2, "0")}
    </div>
  );
};
