"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

// Safe expression evaluator (no Function/eval)
function safeEvaluate(expr: string): number {
  const tokens: (number | string)[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, "");

  while (i < s.length) {
    if (s[i] === "(" || s[i] === ")") {
      tokens.push(s[i]);
      i++;
    } else if ("+-*/^".includes(s[i])) {
      // Handle negative numbers at start or after operator/open paren
      if (s[i] === "-" && (tokens.length === 0 || tokens[tokens.length - 1] === "(" || "+-*/^".includes(String(tokens[tokens.length - 1])))) {
        let num = "-";
        i++;
        while (i < s.length && (s[i] >= "0" && s[i] <= "9" || s[i] === ".")) {
          num += s[i++];
        }
        tokens.push(parseFloat(num));
      } else {
        tokens.push(s[i]);
        i++;
      }
    } else if ((s[i] >= "0" && s[i] <= "9") || s[i] === ".") {
      let num = "";
      while (i < s.length && ((s[i] >= "0" && s[i] <= "9") || s[i] === ".")) {
        num += s[i++];
      }
      tokens.push(parseFloat(num));
    } else {
      throw new Error("Invalid character");
    }
  }

  let pos = 0;

  function parseExpr(): number {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (pos < tokens.length && (tokens[pos] === "*" || tokens[pos] === "/")) {
      const op = tokens[pos++];
      const right = parsePower();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parsePower(): number {
    let left = parseAtom();
    while (pos < tokens.length && tokens[pos] === "^") {
      pos++;
      const right = parseAtom();
      left = Math.pow(left, right);
    }
    return left;
  }

  function parseAtom(): number {
    if (tokens[pos] === "(") {
      pos++;
      const val = parseExpr();
      if (tokens[pos] === ")") pos++;
      return val;
    }
    return tokens[pos++] as number;
  }

  const result = parseExpr();
  return result;
}

export default function ScientificCalculator() {
  const t = useTranslations("tools.scientific-calculator.ui");

  const [display, setDisplay] = useState<string>("0");
  const [expression, setExpression] = useState<string>("");
  const [memory, setMemory] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  const handleFunction = (func: string) => {
    try {
      setError("");
      const value = parseFloat(display);
      if (isNaN(value)) throw new Error(t("invalidInput"));

      let result: number;
      switch (func) {
        case "sin": result = angleMode === "deg" ? Math.sin(toRadians(value)) : Math.sin(value); break;
        case "cos": result = angleMode === "deg" ? Math.cos(toRadians(value)) : Math.cos(value); break;
        case "tan": result = angleMode === "deg" ? Math.tan(toRadians(value)) : Math.tan(value); break;
        case "log": result = Math.log10(value); break;
        case "ln": result = Math.log(value); break;
        case "sqrt": result = Math.sqrt(value); break;
        case "square": result = value * value; break;
        case "inverse": result = 1 / value; break;
        case "negate": result = -value; break;
        case "factorial":
          if (value < 0 || !Number.isInteger(value) || value > 170) throw new Error(t("factorialError"));
          result = 1;
          for (let i = 2; i <= value; i++) result *= i;
          break;
        default: return;
      }

      if (!isFinite(result)) throw new Error(t("mathError"));
      setDisplay(result.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setDisplay("Error");
    }
  };

  const handleConstant = (constant: string) => {
    setError("");
    if (constant === "pi") setDisplay(Math.PI.toString());
    else if (constant === "e") setDisplay(Math.E.toString());
  };

  const handleEquals = () => {
    try {
      setError("");
      const fullExpression = expression + display;
      if (!fullExpression) return;

      const sanitized = fullExpression.replace(/×/g, "*").replace(/÷/g, "/");
      const result = safeEvaluate(sanitized);

      if (!isFinite(result)) throw new Error(t("mathError"));
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
      case "mc": setMemory(0); break;
      case "mr": setDisplay(memory.toString()); break;
      case "m+": setMemory(memory + value); break;
      case "m-": setMemory(memory - value); break;
    }
  };

  const copyResult = useCallback(() => {
    if (display !== "Error" && display !== "0") {
      navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
      else if (e.key === ".") handleDecimal();
      else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        handleOperator(e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key);
      } else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); handleEquals(); }
      else if (e.key === "Escape") handleClear();
      else if (e.key === "Backspace") handleBackspace();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [display, expression]);

  const Btn = ({
    onClick, children, className = "", variant = "default",
  }: {
    onClick: () => void; children: React.ReactNode; className?: string;
    variant?: "default" | "operator" | "function" | "equals";
  }) => {
    const base = "rounded-xl p-4 text-base font-medium transition-colors active:scale-95";
    const variants = {
      default: "bg-muted hover:bg-muted/80",
      operator: "bg-primary/10 text-primary hover:bg-primary/20",
      function: "bg-muted/50 hover:bg-muted text-sm",
      equals: "bg-primary text-primary-foreground hover:bg-primary/90",
    };
    return (
      <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Display */}
      <div
        className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
        onClick={copyResult}
      >
        <div className="mb-2 min-h-6 text-sm text-muted-foreground">{expression || " "}</div>
        <div className="break-all text-right text-3xl font-mono font-semibold">{display}</div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{memory !== 0 ? `M: ${memory}` : copied ? "✓" : " "}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setAngleMode(angleMode === "deg" ? "rad" : "deg"); }}
            className="rounded-lg bg-background px-3 py-1 font-medium hover:bg-muted"
          >
            {angleMode.toUpperCase()}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Memory & Mode Controls */}
      <div className="grid grid-cols-4 gap-2">
        <Btn onClick={() => handleMemory("mc")} variant="function">MC</Btn>
        <Btn onClick={() => handleMemory("mr")} variant="function">MR</Btn>
        <Btn onClick={() => handleMemory("m+")} variant="function">M+</Btn>
        <Btn onClick={() => handleMemory("m-")} variant="function">M−</Btn>
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-2">
        <Btn onClick={() => handleFunction("sin")} variant="function">sin</Btn>
        <Btn onClick={() => handleFunction("cos")} variant="function">cos</Btn>
        <Btn onClick={() => handleFunction("tan")} variant="function">tan</Btn>
        <Btn onClick={() => handleFunction("log")} variant="function">log</Btn>
        <Btn onClick={() => handleFunction("ln")} variant="function">ln</Btn>
        <Btn onClick={() => handleFunction("sqrt")} variant="function">√</Btn>
        <Btn onClick={() => handleFunction("square")} variant="function">x²</Btn>
        <Btn onClick={() => handleFunction("inverse")} variant="function">1/x</Btn>
        <Btn onClick={() => handleFunction("factorial")} variant="function">n!</Btn>
        <Btn onClick={() => handleConstant("pi")} variant="function">π</Btn>
        <Btn onClick={() => handleConstant("e")} variant="function">e</Btn>
        <Btn onClick={() => handleOperator("^")} variant="function">x^y</Btn>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-4 gap-2">
        <Btn onClick={handleClear} variant="operator" className="col-span-2">{t("clear")}</Btn>
        <Btn onClick={handleBackspace} variant="operator">⌫</Btn>
        <Btn onClick={() => handleOperator("÷")} variant="operator">÷</Btn>

        <Btn onClick={() => handleNumber("7")}>7</Btn>
        <Btn onClick={() => handleNumber("8")}>8</Btn>
        <Btn onClick={() => handleNumber("9")}>9</Btn>
        <Btn onClick={() => handleOperator("×")} variant="operator">×</Btn>

        <Btn onClick={() => handleNumber("4")}>4</Btn>
        <Btn onClick={() => handleNumber("5")}>5</Btn>
        <Btn onClick={() => handleNumber("6")}>6</Btn>
        <Btn onClick={() => handleOperator("-")} variant="operator">−</Btn>

        <Btn onClick={() => handleNumber("1")}>1</Btn>
        <Btn onClick={() => handleNumber("2")}>2</Btn>
        <Btn onClick={() => handleNumber("3")}>3</Btn>
        <Btn onClick={() => handleOperator("+")} variant="operator">+</Btn>

        <Btn onClick={() => handleFunction("negate")}>±</Btn>
        <Btn onClick={() => handleNumber("0")}>0</Btn>
        <Btn onClick={handleDecimal}>.</Btn>
        <Btn onClick={handleEquals} variant="equals">=</Btn>
      </div>

      <div className="text-center text-xs text-muted-foreground">{t("keyboardSupport")}</div>
    </div>
  );
}
