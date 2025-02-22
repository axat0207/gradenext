import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question | null;
  isLoading: boolean;
  selectedAnswer: string | null;
  showExplanation: boolean;
  onSelectAnswer: (answer: string) => void;
  onClearSelection: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isLoading,
  selectedAnswer,
  showExplanation,
  onSelectAnswer,
  onClearSelection,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Generating question...</p>
        </div>
      </Card>
    );
  }

  if (!question) return null;

  return (
    <Card className="p-6">
      <div className="relative">
        <h2
          className="text-xl mb-4 pr-10"
          dangerouslySetInnerHTML={{ __html: question.questionText }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
              >
                <Lightbulb className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Correct Answer: {question.correctAnswer}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option) => (
          <Button
            key={option}
            onClick={() => onSelectAnswer(option)}
            variant={
              showExplanation
                ? option === question.correctAnswer
                  ? "correct"
                  : option === selectedAnswer
                  ? "destructive"
                  : "outline"
                : selectedAnswer === option
                ? "default"
                : "outline"
            }
            disabled={showExplanation}
            className="p-4 text-lg w-full"
          >
            <span dangerouslySetInnerHTML={{ __html: option }} />
          </Button>
        ))}
      </div>
    </Card>
  );
};
