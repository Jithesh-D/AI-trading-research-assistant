import React, { useState } from "react";

export default function ClarificationPanel({ parsed, assumptions, onConfirm }) {
  const [editedAssumptions, setEditedAssumptions] = useState(assumptions);
  const [openQuestions, setOpenQuestions] = useState(
    assumptions?.questions || []
  );

  const handleAssumptionChange = (key, value) => {
    setEditedAssumptions({
      ...editedAssumptions,
      [key]: value,
    });
  };

  const handleAnswerQuestion = (idx, answer) => {
    const updated = [...openQuestions];
    updated[idx] = { ...updated[idx], userAnswer: answer };
    setOpenQuestions(updated);
  };

  const allQuestionsAnswered = openQuestions.every((q) => q.userAnswer);

  const handleConfirm = () => {
    const finalAssumptions = {
      ...editedAssumptions,
      answers: Object.fromEntries(
        openQuestions.map((q) => [q.key, q.userAnswer])
      ),
    };
    onConfirm(finalAssumptions);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 2: Clarify</h2>
        <p>We've extracted what we understood. Let's confirm assumptions and answer critical questions.</p>
      </div>

      {/* What We Understood */}
      <section className="clarity-section">
        <h3>📖 What We Understood</h3>
        <div className="understood-grid">
          <div className="clarity-item">
            <label>Instrument</label>
            <p className="clarity-value">{parsed?.instrument || "Not specified"}</p>
          </div>
          <div className="clarity-item">
            <label>Trade Direction</label>
            <p className="clarity-value">{parsed?.direction || "Long"}</p>
          </div>
          <div className="clarity-item">
            <label>Trigger Condition</label>
            <p className="clarity-value">{parsed?.trigger || "Sharp fall (undefined)"}</p>
          </div>
          <div className="clarity-item">
            <label>Your Question</label>
            <p className="clarity-value">{parsed?.question || "Does this work?"}</p>
          </div>
        </div>
      </section>

      {/* Our Assumptions */}
      <section className="assumptions-section">
        <h3>🎯 Our Assumptions (Editable)</h3>
        <p className="assumptions-note">
          These are intelligent defaults based on standard trading practices. <strong>You can adjust them.</strong>
        </p>

        <div className="assumptions-grid">
          <div className="assumption-item">
            <label htmlFor="sharp-fall">
              What's a "Sharp Fall"?
            </label>
            <input
              id="sharp-fall"
              type="text"
              value={editedAssumptions?.sharpFallDefinition || "2% intraday drop"}
              onChange={(e) =>
                handleAssumptionChange("sharpFallDefinition", e.target.value)
              }
              className="input-field"
            />
            <small>e.g., "2% intraday", "1% close-to-close", "3% from open"</small>
          </div>

          <div className="assumption-item">
            <label htmlFor="entry-point">
              When Do We Enter?
            </label>
            <select
              id="entry-point"
              value={editedAssumptions?.entryPoint || "next-open"}
              onChange={(e) =>
                handleAssumptionChange("entryPoint", e.target.value)
              }
              className="input-field"
            >
              <option value="next-open">Next candle open</option>
              <option value="same-day-close">Same day close</option>
              <option value="next-day-open">Next day open</option>
            </select>
            <small>Realistic execution point after the fall is confirmed</small>
          </div>

          <div className="assumption-item">
            <label htmlFor="exit-point">
              When Do We Exit?
            </label>
            <select
              id="exit-point"
              value={editedAssumptions?.exitPoint || "same-day-close"}
              onChange={(e) =>
                handleAssumptionChange("exitPoint", e.target.value)
              }
              className="input-field"
            >
              <option value="same-day-close">Same day close (1-day hold)</option>
              <option value="next-day-close">Next day close</option>
              <option value="fixed-profit">Fixed profit target (1%)</option>
              <option value="fixed-stop">Fixed stop-loss (1%)</option>
            </select>
            <small>How long we hold the position</small>
          </div>

          <div className="assumption-item">
            <label htmlFor="test-period">
              Test Period
            </label>
            <select
              id="test-period"
              value={editedAssumptions?.testPeriod || "2-years"}
              onChange={(e) =>
                handleAssumptionChange("testPeriod", e.target.value)
              }
              className="input-field"
            >
              <option value="1-year">Last 1 Year</option>
              <option value="2-years">Last 2 Years</option>
              <option value="5-years">Last 5 Years</option>
            </select>
            <small>Historical data window for backtesting</small>
          </div>

          <div className="assumption-item">
            <label htmlFor="transaction-costs">
              Transaction Costs
            </label>
            <input
              id="transaction-costs"
              type="number"
              step="0.01"
              value={editedAssumptions?.transactionCosts || 0.1}
              onChange={(e) =>
                handleAssumptionChange("transactionCosts", parseFloat(e.target.value))
              }
              className="input-field"
            />
            <small>% round-trip (entry + exit). Default: 0.1% (brokerage + slippage)</small>
          </div>

          <div className="assumption-item">
            <label htmlFor="volatility-filter">
              Volatility Filter?
            </label>
            <select
              id="volatility-filter"
              value={editedAssumptions?.volatilityFilter || "high"}
              onChange={(e) =>
                handleAssumptionChange("volatilityFilter", e.target.value)
              }
              className="input-field"
            >
              <option value="none">No filter (trade always)</option>
              <option value="high">High volatility only</option>
              <option value="moderate">Moderate+ volatility</option>
            </select>
            <small>"Sharp fall" might mean different things in different regimes</small>
          </div>
        </div>
      </section>

      {/* Critical Questions for User */}
      {openQuestions.length > 0 && (
        <section className="questions-section">
          <h3>❓ We Need Your Input</h3>
          <p className="questions-note">
            A few questions to refine the experiment. Your answers will shape how we interpret "works".
          </p>

          {openQuestions.map((q, idx) => (
            <div key={idx} className="question-block">
              <label htmlFor={`question-${idx}`}>{q.question}</label>
              {q.type === "select" ? (
                <select
                  id={`question-${idx}`}
                  value={q.userAnswer || ""}
                  onChange={(e) => handleAnswerQuestion(idx, e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Choose --</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`question-${idx}`}
                  type="text"
                  value={q.userAnswer || ""}
                  onChange={(e) => handleAnswerQuestion(idx, e.target.value)}
                  placeholder={q.placeholder}
                  className="input-field"
                />
              )}
              <small>{q.context}</small>
            </div>
          ))}
        </section>
      )}

      {/* Action Buttons */}
      <div className="form-controls">
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={!allQuestionsAnswered}
        >
          Proceed to Define Experiment
        </button>
      </div>

      {!allQuestionsAnswered && (
        <p className="warning-text">⚠️ Please answer all questions to proceed</p>
      )}
    </div>
  );
}
