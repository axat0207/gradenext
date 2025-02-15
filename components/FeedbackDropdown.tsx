import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

const FEEDBACK_OPTIONS = [
  {
    value: "no_correct_answer",
    label: "None of the options match the correct answer",
  },
  {
    value: "explanation_mismatch",
    label: "Explanation doesn't match the correct answer",
  },
  {
    value: "hint_unclear",
    label: "Hint is unclear or unhelpful",
  },
  {
    value: "question_unclear",
    label: "Question is unclear or confusing",
  },
  {
    value: "multiple_correct",
    label: "Multiple answers seem correct",
  },
  {
    value: "other",
    label: "Other issue",
  },
];

interface FeedbackDropdownProps {
  onSubmitFeedback: (feedback: string) => void;
}

const FeedbackDropdown = ({ onSubmitFeedback }: FeedbackDropdownProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedFeedback) {
      onSubmitFeedback(selectedFeedback);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={selectedFeedback} onValueChange={setSelectedFeedback}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Report an issue with this question" />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={!selectedFeedback || submitted}
          variant="secondary"
        >
          Submit Feedback
        </Button>
      </div>

      {submitted && (
        <Alert className="bg-green-50">
          <AlertDescription>
            Thank you for your feedback! We'll review this question.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FeedbackDropdown;
