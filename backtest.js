/**
 * Synthetic Data Generator for NIFTY
 * Creates realistic NIFTY price data with patterns
 * Includes occasional sharp falls for mean-reversion testing
 */

export function generateSyntheticData({ testPeriod = "2-years", volatilityRegime = "high" }) {
  const candleCount = testPeriod === "1-year" ? 250 : testPeriod === "5-years" ? 1250 : 500;
  
  const candles = [];
  let price = 20000; // Starting NIFTY price
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - candleCount);

  let volatility = 0.8; // Base volatility (%)

  for (let i = 0; i < candleCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Random walk with drift
    const drift = 0.02; // Slight upward drift
    const noise = (Math.random() - 0.5) * volatility;
    const dailyReturn = drift / 250 + noise; // Annualized drift

    // 10% chance of sharp fall (2-5%)
    let sharpFall = false;
    const open = price;
    if (Math.random() < 0.1) {
      const fallAmount = (Math.random() * 3 + 2) / 100; // 2-5% fall
      price *= 1 - fallAmount;
      sharpFall = true;
    } else {
      price *= 1 + dailyReturn;
    }

    // Generate OHLC
    const close = price;
    const high = Math.max(open, close) * (1 + Math.abs(Math.random() * 0.01));
    const low = Math.min(open, close) * (1 - Math.abs(Math.random() * 0.01));

    // Calculate intraday fall from open to close
    const intradayFall = ((open - close) / open) * 100;

    candles.push({
      date: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000 + 500000,
      intradayFall,
      sharpFall, // Marker for synthetic sharp falls
    });
  }

  return candles;
}

/**
 * Backtest Engine
 * Takes generated data and experiment parameters
 * Returns metrics and trade list
 */
export function runBacktest(candles, experiment) {
  const trades = [];
  const sharpFallThreshold = parseFloat(
    experiment.condition.match(/(\d+\.?\d*)/)?.[0] || 2
  ); // Extract threshold from condition

  const transactionCosts = (experiment.costAssumptions?.match(/(\d+\.?\d*)/)?.[0] || 0.1) / 100;

  for (let i = 0; i < candles.length - 1; i++) {
    const currentCandle = candles[i];
    const nextCandle = candles[i + 1];

    // Check if sharp fall occurred (use sharpFall marker OR intradayFall)
    const triggered = currentCandle.sharpFall || currentCandle.intradayFall >= sharpFallThreshold;
    if (triggered) {
      // Entry: next candle open
      const entryPrice = nextCandle.open;
      let exitPrice = nextCandle.close; // Default: same-day close

      // Holding period: 1 day (by default)
      // Could implement fixed stop-loss or profit target here

      // Calculate returns with transaction costs
      const grossReturn = (exitPrice - entryPrice) / entryPrice;
      const netReturn = grossReturn - transactionCosts;

      trades.push({
        date: nextCandle.date,
        entry: entryPrice,
        exit: exitPrice,
        return: netReturn,
        pnl: netReturn, // Per-trade P&L in basis points
        sharpePerTrade: netReturn / 0.01, // Simple Sharpe approximation
      });
    }
  }

  // Calculate metrics
  const metrics = calculateMetrics(trades);

  return {
    metrics,
    trades,
    summary: {
      backtestPeriod: `${candles[0].date} to ${candles[candles.length - 1].date}`,
      totalCandles: candles.length,
      totalTrades: trades.length,
    },
  };
}

/**
 * Calculate performance metrics from trade list
 */
function calculateMetrics(trades) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgReturn: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      afterCosts: false,
    };
  }

  // Win rate
  const winners = trades.filter((t) => t.return > 0);
  const winRate = (winners.length / trades.length) * 100;

  // Average return per trade
  const avgReturn = trades.reduce((sum, t) => sum + t.return, 0) / trades.length;

  // Profit factor (gross wins / gross losses)
  const grossWins = winners.reduce((sum, t) => sum + t.return, 0);
  const grossLosses = trades
    .filter((t) => t.return <= 0)
    .reduce((sum, t) => sum + Math.abs(t.return), 0);
  const profitFactor = grossLosses === 0 ? grossWins : grossWins / grossLosses;

  // Sharpe Ratio (simple: mean return / std dev)
  const variance =
    trades.reduce((sum, t) => sum + Math.pow(t.return - avgReturn, 2), 0) / trades.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev === 0 ? 0 : avgReturn / stdDev;

  // Max Drawdown
  let peak = 0;
  let maxDD = 0;
  let cumReturn = 0;
  for (const trade of trades) {
    cumReturn += trade.return;
    if (cumReturn > peak) {
      peak = cumReturn;
    }
    const dd = peak - cumReturn;
    if (dd > maxDD) {
      maxDD = dd;
    }
  }

  return {
    totalTrades: trades.length,
    winRate,
    avgReturn,
    profitFactor,
    sharpeRatio,
    maxDrawdown: maxDD,
    afterCosts: avgReturn > 0,
  };
}
