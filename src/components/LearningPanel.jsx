import React, { useState } from "react";

export default function LearningPanel({ experiment, results, onNewExperiment }) {
  const [activeTab, setActiveTab] = useState("results");

  if (!results) {
    return <div className="loading">Loading results...</div>;
  }

  const metrics = results.metrics || {};
  const trades = results.trades || [];

  // Interpret the results
  const hasEdge = metrics.profitFactor > 1.0;
  const isStatisticallySignificant = trades.length >= 30;
  const conclusion = getConclusion(metrics, trades);

  function getConclusion(metrics, trades) {
    if (trades.length < 10) {
      return {
        text: "Insufficient data to draw conclusions",
        reasoning:
          "Only " + trades.length + " trades. Need at least 30 for statistical validity.",
        confidence: "Very Low",
      };
    }

    if (!hasEdge) {
      return {
        text: "No edge detected — losses outweigh wins",
        reasoning: `Profit factor ${metrics.profitFactor?.toFixed(2)} < 1.0 means this strategy loses money after costs.`,
        confidence: metrics.profitFactor > 0.8 ? "Medium" : "High",
      };
    }

    if (metrics.winRate < 40) {
      return {
        text: "Edge detected, but relies on large wins from rare events",
        reasoning: `Only ${metrics.winRate?.toFixed(1)}% win rate, but average win is much larger than average loss.`,
        confidence: "Low to Medium — fragile edge",
      };
    }

    return {
      text: "Edge detected — more wins than losses, and wins are larger",
      reasoning: `${metrics.winRate?.toFixed(1)}% win rate with positive expectancy. Profit factor: ${metrics.profitFactor?.toFixed(2)}.`,
      confidence: "Medium",
    };
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 5: Learn</h2>
        <p>
          Here's what the data reveals. Remember: past backtest results ≠ future performance.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "results" ? "active" : ""}`}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
        <button
          className={`tab ${activeTab === "interpretation" ? "active" : ""}`}
          onClick={() => setActiveTab("interpretation")}
        >
          Interpretation
        </button>
        <button
          className={`tab ${activeTab === "trades" ? "active" : ""}`}
          onClick={() => setActiveTab("trades")}
        >
          Trade List
        </button>
        <button
          className={`tab ${activeTab === "nextSteps" ? "active" : ""}`}
          onClick={() => setActiveTab("nextSteps")}
        >
          Next Steps
        </button>
      </div>

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <section className="learning-section">
          <h3>📊 Raw Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{trades.length}</div>
              <div className="metric-label">Total Trades</div>
              <div className="metric-note">
                {isStatisticallySignificant ? "✅ Statistically valid" : "⚠️ Small sample"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{metrics.winRate?.toFixed(1)}%</div>
              <div className="metric-label">Win Rate</div>
              <div className="metric-note">
                {metrics.winRate >= 50 ? "✅ More wins than losses" : "⚠️ More losses than wins"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {(metrics.avgReturn * 100)?.toFixed(2)}%
              </div>
              <div className="metric-label">Avg Return / Trade</div>
              <div className="metric-note">
                After costs: {metrics.afterCosts ? "✅ Positive" : "❌ Negative"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{metrics.profitFactor?.toFixed(2)}</div>
              <div className="metric-label">Profit Factor</div>
              <div className="metric-note">
                {metrics.profitFactor > 1.5 && "✅ Strong"}
                {metrics.profitFactor > 1.0 && metrics.profitFactor <= 1.5 && "⚠️ Weak edge"}
                {metrics.profitFactor <= 1.0 && "❌ No edge"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {metrics.sharpeRatio?.toFixed(2)}
              </div>
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-note">Risk-adjusted returns</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {(metrics.maxDrawdown * 100)?.toFixed(1)}%
              </div>
              <div className="metric-label">Max Drawdown</div>
              <div className="metric-note">Worst peak-to-trough loss</div>
            </div>
          </div>
        </section>
      )}

      {/* INTERPRETATION TAB */}
      {activeTab === "interpretation" && (
        <section className="learning-section">
          <h3>🧠 What The Data Shows vs What We Can Conclude</h3>

          <div className="interpretation-box">
            <h4>📈 What the data actually shows:</h4>
            <ul>
              <li>In the last {experiment.testPeriod}, NIFTY fell ≥2% on {trades.length} days</li>
              <li>
                On {(metrics.winRate * trades.length / 100)?.toFixed(0)} of those days, buying
                at {experiment.entryPoint} and selling at {experiment.exitPoint} was profitable
              </li>
              <li>The average return was {(metrics.avgReturn * 100)?.toFixed(2)}% per trade</li>
              <li>Transaction costs reduced returns by approximately {experiment.costAssumptions}</li>
            </ul>
          </div>

          <div className="conclusion-box" style={{
            borderLeft: hasEdge ? "4px solid #4CAF50" : "4px solid #f44336",
          }}>
            <h4>🎯 Our Conclusion:</h4>
            <p className="conclusion-text">{conclusion.text}</p>
            <p className="reasoning"><strong>Reasoning:</strong> {conclusion.reasoning}</p>
            <p className="confidence">
              <strong>Confidence Level:</strong> {conclusion.confidence}
            </p>
          </div>

          <div className="caveats-box">
            <h4>⚠️ Important Caveats:</h4>
            <ul>
              <li>
                <strong>Past performance ≠ Future results:</strong> Markets change. This edge might
                not exist tomorrow.
              </li>
              <li>
                <strong>Look-ahead bias:</strong> This backtest assumes perfect information. Real
                trading has delays and slippage.
              </li>
              <li>
                <strong>Regime dependency:</strong> This strategy works in the test period. Does it
                work in bear markets? Sideways markets?
              </li>
              <li>
                <strong>Sample size:</strong> {trades.length} trades is
                {trades.length >= 30 ? " borderline statistically valid" : " too small to be reliable"}.
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* TRADES TAB */}
      {activeTab === "trades" && (
        <section className="learning-section">
          <h3>📋 Individual Trades</h3>
          <p>
            Here are the first 20 trades (out of {trades.length}). Each trade shows entry price,
            exit price, and profit/loss.
          </p>

          <div className="trades-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Return %</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 20).map((trade, idx) => (
                  <tr key={idx} className={trade.return > 0 ? "trade-win" : "trade-loss"}>
                    <td>{idx + 1}</td>
                    <td>{trade.date}</td>
                    <td>₹{trade.entry?.toFixed(2)}</td>
                    <td>₹{trade.exit?.toFixed(2)}</td>
                    <td className="return-value">
                      {(trade.return * 100)?.toFixed(2)}%
                    </td>
                    <td className="pnl-value">
                      {trade.return > 0 ? "+" : ""}{(trade.pnl * 100)?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {trades.length > 20 && (
            <p className="note">
              Showing 20 of {trades.length} trades. Download the full list to analyze further.
            </p>
          )}
        </section>
      )}

      {/* NEXT STEPS TAB */}
      {activeTab === "nextSteps" && (
        <section className="learning-section">
          <h3>🔍 Intelligent Next Questions</h3>
          <p>
            If this edge looks promising, here are the next experiments you could run to validate
            it further:
          </p>

          <div className="next-steps-list">
            <div className="step-card">
              <h4>1. Parameter Sensitivity</h4>
              <p>
                What if "sharp fall" was 1.5% instead of 2%? Or 3%? Test nearby thresholds to see
                if the edge is robust or fragile.
              </p>
            </div>

            <div className="step-card">
              <h4>2. Regime Analysis</h4>
              <p>
                Does this work in bull markets? Bear markets? During earnings seasons? Test
                different market regimes separately.
              </p>
            </div>

            <div className="step-card">
              <h4>3. Out-of-Sample Testing</h4>
              <p>
                Trained on 2024-2026? Test on 2022-2024. If it works there too, the edge is more
                real.
              </p>
            </div>

            <div className="step-card">
              <h4>4. Exit Optimization</h4>
              <p>
                Try different exit strategies (fixed stop-loss, profit target, trailing stop) instead
                of end-of-day exit.
              </p>
            </div>

            <div className="step-card">
              <h4>5. Instrument Diversification</h4>
              <p>
                Does this work on Bank Nifty? Sensex? Individual stocks? Edge might be specific to
                NIFTY or general to markets.
              </p>
            </div>

            <div className="step-card">
              <h4>6. Cost Impact Analysis</h4>
              <p>
                How sensitive is the edge to transaction costs? What if real slippage is 0.2% instead
                of 0.05%?
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div className="form-controls">
        <button className="btn btn-primary" onClick={onNewExperiment}>
          🔄 Test Another Question
        </button>
        <p className="note">Ready to refine your hypothesis? Start a new experiment.</p>
      </div>
    </div>
  );
}
