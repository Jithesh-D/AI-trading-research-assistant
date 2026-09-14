import React, { useState } from "react";
import "./App.css";
import QuestionInput from "./components/QuestionInput";
import ClarificationPanel from "./components/ClarificationPanel";
import ExperimentDefinition from "./components/ExperimentDefinition";

import LearningPanel from "./components/LearningPanel";

export default function TradingResearchApp() {
  const [step, setStep] = useState("question"); // question → clarify → define → test → learn
  const [question, setQuestion] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [assumptions, setAssumptions] = useState(null);
  const [experiment, setExperiment] = useState(null);
  const [backTestResults, setBackTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: User enters question
  const handleQuestionSubmit = async (userQuestion) => {
    setQuestion(userQuestion);
    setLoading(true);
    setError(null);

    try {
      // Call Claude API to extract and parse the trading question
      const response = await fetch("/api/parse-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse question");
      }

      const data = await response.json();
      setParsedData(data.parsed);
      setAssumptions(data.assumptions);
      setStep("clarify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User confirms/adjusts assumptions
  const handleAssumptionsConfirmed = (confirmedAssumptions) => {
    setAssumptions(confirmedAssumptions);
    setStep("define");
  };

  // Step 3: System shows structured experiment
  const handleExperimentDefined = (experimentDef) => {
    setExperiment(experimentDef);
    setStep("test");
    runBacktest(experimentDef);
  };

  // Step 4: Run mock backtest
  const runBacktest = async (experimentDef) => {
    setLoading(true);
    try {
      const response = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiment: experimentDef }),
      });

      const data = await response.json();
      setBackTestResults(data);
      setStep("learn");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setStep("question");
    setQuestion("");
    setParsedData(null);
    setAssumptions(null);
    setExperiment(null);
    setBackTestResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Trading Research Assistant</h1>
        <p className="subtitle">
          Transform questions into experiments, evidence into learning
        </p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {step === "question" && (
          <QuestionInput onSubmit={handleQuestionSubmit} loading={loading} />
        )}

        {step === "clarify" && (
          <ClarificationPanel
            parsed={parsedData}
            assumptions={assumptions}
            onConfirm={handleAssumptionsConfirmed}
          />
        )}

        {step === "define" && (
          <ExperimentDefinition
            assumptions={assumptions}
            onDefine={handleExperimentDefined}
          />
        )}

        {step === "test" && (
          <div className="loading-panel">
            <div className="spinner"></div>
            <p>Running backtest on synthetic market data...</p>
          </div>
        )}

        {step === "learn" && (
          <LearningPanel
            experiment={experiment}
            results={backTestResults}
            onNewExperiment={handleReset}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with ❤️ • Questions? <a href="#docs">Read the assumptions</a>
        </p>
      </footer>
    </div>
  );
}
