import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QuestionFeedbackProps {
  showHint: boolean;
  showExplanation: boolean;
  hint: string;
  explanation: string;
  onContinue: () => void;
}

export const QuestionFeedback: React.FC<QuestionFeedbackProps> = ({
  showHint,
  showExplanation,
  hint,
  explanation,
  onContinue,
}) => {
  return (
    <>
      {showHint && (
        <Alert className="mt-4">
          <AlertDescription>
            <strong>Hint:</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: hint }} />
          </AlertDescription>
        </Alert>
      )}

      {showExplanation && (
        <Alert className="mt-4">
          <AlertDescription>
            <strong>Explanation:</strong>{" "}
            <div dangerouslySetInnerHTML={{ __html: explanation }} />
            <Button className="mt-2" onClick={onContinue}>
              Continue
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
