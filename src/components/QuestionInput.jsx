import React, { useState } from "react";

export default function QuestionInput({ onSubmit, loading }) {
  const [question, setQuestion] = useState("");
  const [exampleExpanded, setExampleExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
    }
  };

  const exampleQuestions = [
    "Does buying NIFTY after a sharp fall work?",
    "Does buying Bank Nifty after a 2% drop have an edge during high volatility?",
    "Can I profit by shorting Sensex when it falls more than 1% intraday?",
  ];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 1: Ask</h2>
        <p>Enter your trading research question. Be as specific or vague as you like.</p>
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., 'Does buying NIFTY after a sharp fall work better during high-volatility periods?'"
          className="question-input"
          rows={4}
          disabled={loading}
        />

        <div className="form-controls">
          <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()}>
            {loading ? "Analyzing..." : "Analyze Question"}
          </button>
        </div>
      </form>

      <div className="examples-section">
        <button
          className="toggle-examples"
          onClick={() => setExampleExpanded(!exampleExpanded)}
        >
          {exampleExpanded ? "Hide" : "Show"} Example Questions
        </button>

        {exampleExpanded && (
          <div className="examples-list">
            {exampleQuestions.map((ex, idx) => (
              <button
                key={idx}
                className="example-btn"
                onClick={() => {
                  setQuestion(ex);
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="info-box">
        <h3>💡 What Happens Next</h3>
        <ul>
          <li><strong>Clarify:</strong> We'll identify missing information and show our assumptions</li>
          <li><strong>Define:</strong> Your question becomes a structured experiment</li>
          <li><strong>Test:</strong> We'll run a backtest on synthetic historical data</li>
          <li><strong>Learn:</strong> We'll show you what the data reveals and what questions remain</li>
        </ul>
      </div>
    </div>
  );
}
