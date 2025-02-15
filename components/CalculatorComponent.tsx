import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CalculatorComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [firstNumber, setFirstNumber] = useState("");
  const [operation, setOperation] = useState("");
  const [newNumber, setNewNumber] = useState(true);
  const [waitingForSecondNumber, setWaitingForSecondNumber] = useState(false);

  // Store state in ref for keyboard handlers
  const stateRef = useRef({
    display,
    firstNumber,
    operation,
    newNumber,
    waitingForSecondNumber,
  });

  useEffect(() => {
    stateRef.current = {
      display,
      firstNumber,
      operation,
      newNumber,
      waitingForSecondNumber,
    };
  }, [display, firstNumber, operation, newNumber, waitingForSecondNumber]);

  const computeResult = (num1: number, num2: number, op: string) => {
    switch (op) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "×":
        return num1 * num2;
      case "÷":
        return num2 === 0 ? NaN : num1 / num2;
      default:
        return NaN;
    }
  };

  const formatNumber = (num: number): string => {
    const stringNum = num.toString();
    if (stringNum.includes("e")) {
      return "Error"; // Handle scientific notation
    }
    if (stringNum.length > 10) {
      return stringNum.slice(0, 10);
    }
    return stringNum;
  };

  const handleNumber = (num: string) => {
    if (display === "Error") {
      setDisplay(num);
      setNewNumber(false);
      setWaitingForSecondNumber(false);
      return;
    }

    if (newNumber || display === "0") {
      setDisplay(num);
      setNewNumber(false);
    } else {
      if (display.replace(".", "").length >= 10) return;
      setDisplay(display + num);
    }

    if (waitingForSecondNumber) {
      setWaitingForSecondNumber(false);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op: string) => {
    if (op === "C") {
      setDisplay("0");
      setFirstNumber("");
      setOperation("");
      setNewNumber(true);
      setWaitingForSecondNumber(false);
      return;
    }

    if (op === "=") {
      if (!operation || !firstNumber) return;

      const num1 = parseFloat(firstNumber);
      const num2 = parseFloat(display);
      const result = computeResult(num1, num2, operation);

      if (!isFinite(result)) {
        setDisplay("Error");
        setFirstNumber("");
        setOperation("");
        setNewNumber(true);
        setWaitingForSecondNumber(false);
        return;
      }

      setDisplay(formatNumber(result));
      setFirstNumber("");
      setOperation("");
      setNewNumber(true);
      setWaitingForSecondNumber(false);
      return;
    }

    // Handle new operation
    if (firstNumber && operation && !newNumber) {
      // Perform the pending operation
      const num1 = parseFloat(firstNumber);
      const num2 = parseFloat(display);
      const result = computeResult(num1, num2, operation);

      if (!isFinite(result)) {
        setDisplay("Error");
        setFirstNumber("");
        setOperation("");
        setNewNumber(true);
        setWaitingForSecondNumber(false);
        return;
      }

      setDisplay(formatNumber(result));
      setFirstNumber(formatNumber(result));
    } else {
      setFirstNumber(display);
    }

    setOperation(op);
    setNewNumber(true);
    setWaitingForSecondNumber(true);
  };

  const calculatorButtons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "C", "+"],
    ["="],
  ];

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const currentState = stateRef.current;

      // Prevent default for calculator keys
      if (
        [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ".",
          "+",
          "-",
          "*",
          "/",
          "Enter",
          "Backspace",
        ].includes(key)
      ) {
        e.preventDefault();
      }

      if (key >= "0" && key <= "9") {
        handleNumber(key);
      } else if (key === ".") {
        handleDecimal();
      } else if (key === "Enter") {
        handleOperation("=");
      } else if (key === "Backspace") {
        if (display === "Error") {
          handleOperation("C");
        } else {
          setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
        }
      } else if (key === "Escape") {
        handleOperation("C");
      } else if (["+", "-", "*", "/"].includes(key)) {
        const op = key === "*" ? "×" : key === "/" ? "÷" : key;
        handleOperation(op);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 rounded-full h-12 w-12 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Calculator className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[320px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-bold">Calculator</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <div className="flex flex-col bg-gray-100 dark:bg-gray-800 p-4 mb-4 rounded-lg">
              <div className="text-right text-gray-500 dark:text-gray-400 text-sm h-6">
                {firstNumber && `${firstNumber} ${operation}`}
              </div>
              <div
                className={`text-right transition-all ${
                  display === "Error"
                    ? "text-red-500 text-2xl"
                    : "text-3xl font-medium"
                }`}
                style={{
                  fontSize:
                    display.length > 10
                      ? `${Math.max(
                          1.5 - (display.length - 10) * 0.15,
                          0.8
                        )}rem`
                      : undefined,
                }}
              >
                {display}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {calculatorButtons.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {row.map((btn) => (
                    <Button
                      key={btn}
                      onClick={() => {
                        if (btn === ".") {
                          handleDecimal();
                        } else if (
                          ["C", "=", "+", "-", "×", "÷"].includes(btn)
                        ) {
                          handleOperation(btn);
                        } else {
                          handleNumber(btn);
                        }
                      }}
                      variant={
                        btn === "="
                          ? "default"
                          : ["+", "-", "×", "÷"].includes(btn)
                          ? "secondary"
                          : "outline"
                      }
                      className={`h-14 text-lg rounded-lg ${
                        btn === "=" ? "col-span-4" : ""
                      } ${
                        ["+", "-", "×", "÷"].includes(btn)
                          ? "text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {btn}
                    </Button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalculatorComponent;
