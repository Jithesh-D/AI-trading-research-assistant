# AI Trading Research Assistant

A web prototype that transforms natural language trading questions into structured experiments, runs backtests, and explains the results in plain language.

## 🎯 What It Does

1. **Ask** — User enters a question like "Does buying NIFTY after a sharp fall work?"
2. **Clarify** — System extracts what it understood and surfaces assumptions for user confirmation
3. **Define** — Question becomes a structured experiment with parameters
4. **Test** — Backtest runs on synthetic historical data
5. **Learn** — Results are interpreted with clear distinction between "what the data shows" and "what we can conclude"

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                        │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │   Question   │  Clarify &   │  Experiment  │         │
│  │   Input      │ Assumptions  │  Definition  │         │
│  └──────────────┴──────────────┴──────────────┘         │
└─────────────────────────────────────────────────────────┘
                           ↓ (API calls)
┌─────────────────────────────────────────────────────────┐
│               Node.js/Express Backend                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  POST /api/parse-question                         │ │
│  │  • Claude API: Extract instrument, trigger, etc   │ │
│  │  • Returns structured data + assumptions          │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  POST /api/backtest                               │ │
│  │  • Generate synthetic NIFTY data                  │ │
│  │  • Run backtest logic                            │ │
│  │  • Calculate metrics & trade list                │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Technologies Used

- **Frontend:** React + TypeScript, vanilla CSS (no frameworks)
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API (Opus 4.1) for question parsing
- **Data:** Synthetic NIFTY price data (no external APIs)
- **Deployment:** Ready for Vercel (frontend) + any Node host (backend)

## 📋 Key Decisions

### 1. **Synthetic Data Instead of Real APIs**
- **Why:** Keeps the prototype simple and focused on research thinking, not data plumbing
- **How:** Generates realistic OHLC data with random walk + drift + volatility clustering
- **Impact:** Fast feedback loop, no rate limits, completely controllable

### 2. **Claude API for Question Parsing**
- **Why:** Natural language understanding is Claude's strength; avoids hardcoded parsing logic
- **Output:** Structured JSON with instrument, direction, trigger, assumptions
- **Benefit:** Handles ambiguous, colloquial user inputs gracefully

### 3. **Transparent Assumptions (Not Hidden Defaults)**
- **Why:** Users need to know what we're testing, not discover it in results
- **How:** Every assumption is editable before backtest runs
- **Impact:** Enables intelligent refinement, builds trust

### 4. **Distinction Between "What Data Shows" vs "What We Conclude"**
- **Why:** Common mistake: treating backtest results as proof
- **How:** Results page clearly separates:
  - Factual metrics (win rate, Sharpe, etc.)
  - Interpretations (potential edge?)
  - Important caveats (regime dependency, sample size, etc.)
- **Impact:** Teaches proper hypothesis testing mindset

### 5. **No Full Trading System**
- **Why:** Keeps scope small, focuses on research workflow
- **What we skip:**
  - Real portfolio management
  - Live order execution
  - Multi-instrument strategies
  - Complex risk models
- **What we include:** Core workflow (question → experiment → evidence → learning)

### 6. **Mock Backtest Over Third-Party Services**
- **Why:** Avoids API dependencies, rate limits, authentication
- **How:** Implement core backtest logic (signal detection, P&L calculation, metrics)
- **Trade-off:** Synthetic data is less realistic, but sufficient for prototype

## 🚀 How to Run

### Prerequisites
```bash
node --version  # 16+
npm --version   # 8+
OPENROUTER_API_KEY=sk-or-...
```

### Backend
```bash
# Install dependencies
npm install express cors @anthropic-ai/sdk

# Run server
npm start
# Server starts on http://localhost:3001
```

### Frontend
```bash
# Install React + build tools
npm create vite@latest . -- --template react

# Copy React components to src/components/
# Copy app.jsx to src/App.jsx
# Copy app.css to src/App.css

# Start dev server
npm run dev
# App runs on http://localhost:5173. Vite proxies /api requests to the backend.
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]
```

## 📊 Example Workflow

**User Input:**
```
"Does buying NIFTY after a sharp fall work better during high volatility?"
```

**What System Extracts:**
```json
{
  "instrument": "NIFTY",
  "direction": "long",
  "trigger": "sharp fall",
  "question": "Does it work better in high-volatility periods?"
}
```

**Assumptions Presented:**
- "Sharp fall" = 2% intraday drop (user can adjust)
- Entry = Next candle open (user can change)
- Exit = Same day close (user can refine)
- Test period = Last 2 years (user can extend)
- Costs = 0.1% round-trip (user can increase)

**Experiment Defined:**
```
HYPOTHESIS:
Sharp falls followed by mean reversion are profitable same-day trades

PARAMETERS:
├─ Market: NIFTY
├─ Condition: ≥2% intraday fall
├─ Entry: Next candle open
├─ Exit: Day close
├─ Holding: 1 day
├─ Test: 2 years of data
└─ Costs: 0.1% round-trip
```

**Results (Example):**
```
Total Trades: 42
Win Rate: 62%
Avg Return/Trade: 0.15%
Profit Factor: 1.8
Sharpe Ratio: 0.95
Max Drawdown: -3.2%

Conclusion: Edge detected. But only 42 trades — need more data to be confident.
```

## 🎓 Key Insights (Teaching Value)

This prototype teaches critical thinking about trading research:

1. **Ambiguity is Everywhere**
   - "Sharp fall" means nothing without definition
   - System forces you to get specific

2. **Assumptions Matter More Than Code**
   - Small changes (entry timing, exit rules) change results dramatically
   - User must decide, not the system

3. **Backtests Lie (If You Let Them)**
   - Look-ahead bias, survivorship bias, overfitting all hide here
   - Results must distinguish between "what happened" and "what we learned"

4. **Sample Size is Critical**
   - 20 trades = could be luck
   - 100 trades = starting to believe
   - Need regime testing too (bull/bear/sideways)

5. **Past ≠ Future**
   - Even a perfect 80% win rate on historical data can fail in live trading
   - Regime changes, market structure, costs all matter

## 🔧 What to Improve With More Time

### Short-term (1-2 days)
1. **Real Data Integration**
   - Fetch actual NIFTY historical data from NSE API or yfinance
   - Replace synthetic data with real prices

2. **Parameter Sensitivity Analysis**
   - User picks parameter (e.g., "fall threshold")
   - System shows how P&L changes across a range
   - Graphs for visual understanding

3. **Regime Analysis**
   - Separate backtest results by market regime (bull/bear/volatile/calm)
   - Show whether edge works in all regimes

4. **Position Sizing**
   - Let user define risk per trade (e.g., 2% of capital)
   - Calculate optimal position size
   - Show drawdown in absolute currency terms

### Medium-term (1 week)
1. **Database Integration**
   - Save experiments and results
   - Compare across multiple strategies
   - Share results via link

2. **Advanced Exit Logic**
   - Fixed stop-loss / profit target
   - Trailing stops
   - Time-based exits (hold until specific time)

3. **Multi-Instrument Testing**
   - Test on Bank Nifty, Sensex, individual stocks
   - Show which instruments work best

4. **Monte Carlo Simulation**
   - Randomize trade order
   - Show range of outcomes
   - Distinguish skill from luck

### Long-term (2+ weeks)
1. **Integration with Real Backtesting Engine**
   - Connect to tools like Backtrader, Zipline, or custom engine
   - Support minute-level and tick-level data

2. **Paper Trading Mode**
   - Track strategy performance in real-time
   - Compare backtest vs live
   - Build confidence before live trading

3. **Strategy Library**
   - Save and version control strategies
   - Collaborative research
   - Publish strategies

## 📚 References & Learning

### Books Recommended for This Kind of Thinking
- "A Man for All Markets" by Ed Thorp (quantitative thinking)
- "Fooled by Randomness" by Nassim Taleb (bias and luck)
- "Designing Machine Learning Systems" by Chip Huyen (frameworks for thinking)

### Articles
- [Why 90% of Day Traders Lose Money](https://en.wikipedia.org/wiki/Day_trading#Failure_rate) (Wikipedia)
- [Look-Ahead Bias in Backtesting](https://www.investopedia.com/terms/l/lookaheadbias.asp) (Investopedia)

## 🤝 Contributing

This is a teaching prototype. Suggestions for improving the thinking process are welcome:
- How could we surface biases better?
- What questions should we always ask?
- How do we teach users about regime dependency?

## 📄 License

MIT — use for learning and research

---

**Built with:** ❤️ + careful thinking about what matters
