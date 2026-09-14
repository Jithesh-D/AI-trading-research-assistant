import React, { useState } from "react";

export default function ExperimentDefinition({ assumptions, onDefine }) {
  const [experiment, setExperiment] = useState({
    market: assumptions?.market || "NIFTY",
    condition: `Fall ≥ ${assumptions?.sharpFallDefinition || "2%"} intraday`,
    entryPoint: `${assumptions?.entryPoint || "next-open"}`,
    exitPoint: `${assumptions?.exitPoint || "same-day-close"}`,
    holdingPeriod: "1 trading day",
    testPeriod: assumptions?.testPeriod || "2-years",
    costAssumptions: `${assumptions?.transactionCosts || 0.1}% round-trip brokerage + slippage`,
    hypothesis: "Sharp falls in market indices often lead to mean-reversion gains the same day",
  });

  const handleFieldChange = (key, value) => {
    setExperiment({ ...experiment, [key]: value });
  };

  const handleDefine = () => {
    onDefine(experiment);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 3: Define Experiment</h2>
        <p>Here's how we've structured your research question into a testable experiment.</p>
      </div>

      <section className="experiment-definition">
        <h3>📋 Experiment Parameters</h3>
        <p className="definition-note">
          Each field below is <strong>editable</strong>. Refine anything that doesn't match your intent.
        </p>

        <div className="definition-grid">
          {/* MARKET */}
          <div className="def-item">
            <label htmlFor="market">Market / Instrument</label>
            <input
              id="market"
              type="text"
              value={experiment.market}
              onChange={(e) => handleFieldChange("market", e.target.value)}
              className="input-field"
            />
          </div>

          {/* CONDITION */}
          <div className="def-item full-width">
            <label htmlFor="condition">Entry Condition</label>
            <textarea
              id="condition"
              value={experiment.condition}
              onChange={(e) => handleFieldChange("condition", e.target.value)}
              className="input-field textarea-field"
              rows={3}
            />
            <small>What must happen to trigger a trade?</small>
          </div>

          {/* ENTRY */}
          <div className="def-item">
            <label htmlFor="entry">Entry Point</label>
            <input
              id="entry"
              type="text"
              value={experiment.entryPoint}
              onChange={(e) => handleFieldChange("entryPoint", e.target.value)}
              className="input-field"
            />
            <small>When exactly do we buy?</small>
          </div>

          {/* EXIT */}
          <div className="def-item">
            <label htmlFor="exit">Exit Point</label>
            <input
              id="exit"
              type="text"
              value={experiment.exitPoint}
              onChange={(e) => handleFieldChange("exitPoint", e.target.value)}
              className="input-field"
            />
            <small>When exactly do we sell?</small>
          </div>

          {/* HOLDING */}
          <div className="def-item">
            <label htmlFor="holding">Holding Period</label>
            <input
              id="holding"
              type="text"
              value={experiment.holdingPeriod}
              onChange={(e) => handleFieldChange("holdingPeriod", e.target.value)}
              className="input-field"
            />
          </div>

          {/* TEST PERIOD */}
          <div className="def-item">
            <label htmlFor="testPeriod">Test Period</label>
            <input
              id="testPeriod"
              type="text"
              value={experiment.testPeriod}
              onChange={(e) => handleFieldChange("testPeriod", e.target.value)}
              className="input-field"
            />
          </div>

          {/* COSTS */}
          <div className="def-item full-width">
            <label htmlFor="costs">Cost Assumptions</label>
            <textarea
              id="costs"
              value={experiment.costAssumptions}
              onChange={(e) => handleFieldChange("costAssumptions", e.target.value)}
              className="input-field textarea-field"
              rows={2}
            />
            <small>Brokerage, slippage, taxes, spreads</small>
          </div>

          {/* HYPOTHESIS */}
          <div className="def-item full-width">
            <label htmlFor="hypothesis">Hypothesis</label>
            <textarea
              id="hypothesis"
              value={experiment.hypothesis}
              onChange={(e) => handleFieldChange("hypothesis", e.target.value)}
              className="input-field textarea-field"
              rows={3}
            />
            <small>What do you believe will happen and why?</small>
          </div>
        </div>
      </section>

      {/* Risks & Considerations */}
      <section className="risks-section">
        <h3>⚠️ Known Limitations & Risks</h3>
        <ul className="risks-list">
          <li>
            <strong>Look-Ahead Bias:</strong> This backtest assumes we can identify a "sharp fall"
            instantly. Real trading has delays.
          </li>
          <li>
            <strong>Limited Data:</strong> We're testing on 2 years of synthetic data. Real markets
            have regime changes.
          </li>
          <li>
            <strong>Slippage Assumptions:</strong> Real market impact may be higher than 0.1%.
          </li>
          <li>
            <strong>Survivor Bias:</strong> NIFTY exists today. We can't test what would happen to
            fallen indices.
          </li>
          <li>
            <strong>Sample Size:</strong> If we only get 20 trades, results could be luck, not skill.
          </li>
        </ul>
      </section>

      {/* Action Buttons */}
      <div className="form-controls">
        <button className="btn btn-primary" onClick={handleDefine}>
          Run Backtest
        </button>
        <p className="note">This will test your experiment on synthetic historical data...</p>
      </div>
    </div>
  );
}
