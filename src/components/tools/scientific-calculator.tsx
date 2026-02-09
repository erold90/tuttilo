"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ScientificCalculator() {
  const t = useTranslations("tools.scientific-calculator.ui");

  const [display, setDisplay] = useState<string>("0");
  const [expression, setExpression] = useState<string>("");
  const [memory, setMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [error, setError] = useState<string>("");

  const handleNumber = (num: string) => {
    setError("");
    if (display === "0" || display === "Error") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setError("");
    if (display && display !== "Error") {
      setExpression(display + " " + op + " ");
      setDisplay("0");
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setError("");
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  const handleFunction = (func: string) => {
    try {
      setError("");
      const value = parseFloat(display);
      if (isNaN(value)) {
        throw new Error(t("invalidInput"));
      }

      let result: number;
      switch (func) {
        case "sin":
          result = angleMode === "deg" ? Math.sin(toRadians(value)) : Math.sin(value);
          break;
        case "cos":
          result = angleMode === "deg" ? Math.cos(toRadians(value)) : Math.cos(value);
          break;
        case "tan":
          result = angleMode === "deg" ? Math.tan(toRadians(value)) : Math.tan(value);
          break;
        case "log":
          result = Math.log10(value);
          break;
        case "ln":
          result = Math.log(value);
          break;
        case "sqrt":
          result = Math.sqrt(value);
          break;
        case "square":
          result = value * value;
          break;
        case "inverse":
          result = 1 / value;
          break;
        case "negate":
          result = -value;
          break;
        case "factorial":
          if (value < 0 || !Number.isInteger(value) || value > 170) {
            throw new Error(t("factorialError"));
          }
          result = 1;
          for (let i = 2; i <= value; i++) {
            result *= i;
          }
          break;
        default:
          return;
      }

      if (!isFinite(result)) {
        throw new Error(t("mathError"));
      }

      setDisplay(result.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setDisplay("Error");
    }
  };

  const handleConstant = (constant: string) => {
    setError("");
    if (constant === "pi") {
      setDisplay(Math.PI.toString());
    } else if (constant === "e") {
      setDisplay(Math.E.toString());
    }
  };

  const handleEquals = () => {
    try {
      setError("");
      const fullExpression = expression + display;
      if (!fullExpression) return;

      // Replace × with * and ÷ with /
      const sanitized = fullExpression.replace(/×/g, "*").replace(/÷/g, "/");

      // Evaluate the expression safely
      const result = Function('"use strict"; return (' + sanitized + ")")();

      if (!isFinite(result)) {
        throw new Error(t("mathError"));
      }

      setDisplay(result.toString());
      setExpression("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setDisplay("Error");
      setExpression("");
    }
  };

  const handleMemory = (action: string) => {
    const value = parseFloat(display);
    if (isNaN(value)) return;

    switch (action) {
      case "mc":
        setMemory(0);
        break;
      case "mr":
        setDisplay(memory.toString());
        break;
      case "m+":
        setMemory(memory + value);
        break;
      case "m-":
        setMemory(memory - value);
        break;
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleNumber(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        handleOperator(e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [display, expression]);

  const Button = ({
    onClick,
    children,
    className = "",
    variant = "default",
  }: {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "operator" | "function" | "equals";
  }) => {
    const baseClasses =
      "rounded-xl p-4 text-base font-medium transition-colors active:scale-95";
    const variantClasses = {
      default: "bg-muted hover:bg-muted/80",
      operator: "bg-primary/10 text-primary hover:bg-primary/20",
      function: "bg-muted/50 hover:bg-muted text-sm",
      equals: "bg-primary text-primary-foreground hover:bg-primary/90",
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Display */}
      <div className="rounded-xl border bg-muted/50 p-6">
        <div className="mb-2 min-h-6 text-sm text-muted-foreground">
          {expression || " "}
        </div>
        <div className="break-all text-right text-3xl font-mono font-semibold">
          {display}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{memory !== 0 ? `M: ${memory}` : " "}</span>
          <button
            onClick={() => setAngleMode(angleMode === "deg" ? "rad" : "deg")}
            className="rounded-lg bg-background px-3 py-1 font-medium hover:bg-muted"
          >
            {angleMode.toUpperCase()}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Memory & Mode Controls */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => handleMemory("mc")} variant="function">
          MC
        </Button>
        <Button onClick={() => handleMemory("mr")} variant="function">
          MR
        </Button>
        <Button onClick={() => handleMemory("m+")} variant="function">
          M+
        </Button>
        <Button onClick={() => handleMemory("m-")} variant="function">
          M−
        </Button>
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => handleFunction("sin")} variant="function">
          sin
        </Button>
        <Button onClick={() => handleFunction("cos")} variant="function">
          cos
        </Button>
        <Button onClick={() => handleFunction("tan")} variant="function">
          tan
        </Button>
        <Button onClick={() => handleFunction("log")} variant="function">
          log
        </Button>
        <Button onClick={() => handleFunction("ln")} variant="function">
          ln
        </Button>
        <Button onClick={() => handleFunction("sqrt")} variant="function">
          √
        </Button>
        <Button onClick={() => handleFunction("square")} variant="function">
          x²
        </Button>
        <Button onClick={() => handleFunction("inverse")} variant="function">
          1/x
        </Button>
        <Button onClick={() => handleFunction("factorial")} variant="function">
          n!
        </Button>
        <Button onClick={() => handleConstant("pi")} variant="function">
          π
        </Button>
        <Button onClick={() => handleConstant("e")} variant="function">
          e
        </Button>
        <Button onClick={() => handleOperator("^")} variant="function">
          x^y
        </Button>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={handleClear} variant="operator" className="col-span-2">
          {t("clear")}
        </Button>
        <Button onClick={handleBackspace} variant="operator">
          ⌫
        </Button>
        <Button onClick={() => handleOperator("÷")} variant="operator">
          ÷
        </Button>

        <Button onClick={() => handleNumber("7")}>7</Button>
        <Button onClick={() => handleNumber("8")}>8</Button>
        <Button onClick={() => handleNumber("9")}>9</Button>
        <Button onClick={() => handleOperator("×")} variant="operator">
          ×
        </Button>

        <Button onClick={() => handleNumber("4")}>4</Button>
        <Button onClick={() => handleNumber("5")}>5</Button>
        <Button onClick={() => handleNumber("6")}>6</Button>
        <Button onClick={() => handleOperator("-")} variant="operator">
          −
        </Button>

        <Button onClick={() => handleNumber("1")}>1</Button>
        <Button onClick={() => handleNumber("2")}>2</Button>
        <Button onClick={() => handleNumber("3")}>3</Button>
        <Button onClick={() => handleOperator("+")} variant="operator">
          +
        </Button>

        <Button onClick={() => handleFunction("negate")}>±</Button>
        <Button onClick={() => handleNumber("0")}>0</Button>
        <Button onClick={handleDecimal}>.</Button>
        <Button onClick={handleEquals} variant="equals">
          =
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        {t("keyboardSupport")}
      </div>
    </div>
  );
}
