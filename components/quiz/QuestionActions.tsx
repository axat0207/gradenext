import React from "react";
import { Button } from "@/components/ui/button";

interface QuestionActionsProps {
  showExplanation: boolean;
  showHint: boolean;
  selectedAnswer: string | null;
  isAnswerProcessing: boolean;
  onShowHint: () => void;
  onSubmit: () => void;
  onClearSelection: () => void;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  showExplanation,
  showHint,
  selectedAnswer,
  isAnswerProcessing,
  onShowHint,
  onSubmit,
  onClearSelection,
}) => {
  if (showExplanation) return null;

  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      <Button
        onClick={onShowHint}
        disabled={showHint || !!selectedAnswer}
        variant="outline"
      >
        Show Hint
      </Button>
      {selectedAnswer && (
        <>
          <Button onClick={onSubmit} disabled={isAnswerProcessing}>
            Submit Answer
          </Button>
          <Button
            variant="outline"
            onClick={onClearSelection}
            disabled={isAnswerProcessing}
          >
            Clear Selection
          </Button>
        </>
      )}
    </div>
  );
};
