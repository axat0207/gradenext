// components/TopicIntroduction.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Minimize2, Maximize2 } from "lucide-react";

interface TopicIntroProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  topicDetail: {
    title: string;
    description: string;
    keyPoints: string[];
    examples: string[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

const TopicIntroduction: React.FC<TopicIntroProps> = ({
  isOpen,
  onClose,
  topicName,
  topicDetail,
  isLoading,
  error,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTopicName, setCurrentTopicName] = useState(topicName);

  useEffect(() => {
    if (topicName !== currentTopicName) {
      setIsMinimized(false);
      setCurrentTopicName(topicName);
    }
  }, [topicName, currentTopicName]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  // Handle outside click to minimize instead of close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleMinimize();
    }
  };

  const isDialogOpen = isOpen && !isMinimized;

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange} modal={true}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            e.preventDefault();
            handleMinimize();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleMinimize();
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Introduction to {topicName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMinimize}
              className="h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              topicDetail && (
                <div className="space-y-4 p-4">
                  <p className="text-lg leading-relaxed">
                    {topicDetail.description}
                  </p>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Key Points:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      {topicDetail.keyPoints.map((point, index) => (
                        <li key={index} className="text-gray-700">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Examples:</h3>
                    <div className="space-y-2">
                      {topicDetail.examples.map((example, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isMinimized && isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleMaximize}
            className="rounded-full shadow-lg flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-200 ease-in-out"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Show {topicName} Introduction</span>
          </Button>
        </div>
      )}
    </>
  );
};

export default TopicIntroduction;
