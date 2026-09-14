import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { generateSyntheticData, runBacktest } from "./backtest.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json());

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || "openrouter/auto";

/**
 * POST /api/parse-question
 * Accepts a natural language trading question
 * Uses Claude to extract and structure it
 * Returns parsed components + intelligent assumptions
 */
app.post("/api/parse-question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question required" });
  }

  try {
    if (!openRouterApiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Trading Research Assistant",
      },
      body: JSON.stringify({
        model: openRouterModel,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are analyzing a trading research question. Extract and structure it.

Question: "${question}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "parsed": {
    "instrument": "NIFTY or the instrument mentioned",
    "direction": "long, short, or unspecified",
    "trigger": "the condition that triggers a trade",
    "question": "what the user is trying to find out"
  },
  "assumptions": {
    "sharpFallDefinition": "what '2% intraday' or similar means",
    "entryPoint": "next-open or similar",
    "exitPoint": "same-day-close or similar",
    "testPeriod": "2-years",
    "transactionCosts": 0.1,
    "volatilityFilter": "high",
    "questions": [
      {
        "key": "exit_type",
        "question": "Should we use a fixed stop-loss or time-based exit?",
        "type": "select",
        "options": ["Time-based (end of day)", "Fixed stop-loss (2%)", "Fixed profit target (2%)", "No exit — let it run"],
        "context": "This affects risk/reward"
      }
    ]
  }
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const providerError = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${providerError}`);
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content || "";
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenRouter returned an empty response");
    }
    
    // Try to parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If Claude returned markdown code blocks, extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    }

    return res.json({
      parsed: parsed.parsed,
      assumptions: parsed.assumptions,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/backtest
 * Accepts experiment parameters
 * Runs a mock backtest with synthetic data
 * Returns metrics and trade list
 */
app.post("/api/backtest", async (req, res) => {
  const { experiment } = req.body;

  if (!experiment) {
    return res.status(400).json({ error: "Experiment required" });
  }

  try {
    // Generate synthetic NIFTY data
    const syntheticData = generateSyntheticData({
      testPeriod: experiment.testPeriod,
      volatilityRegime: experiment.volatilityFilter,
    });

    // Run the backtest
    const results = runBacktest(syntheticData, experiment);

    return res.json(results);
  } catch (error) {
    console.error("Backtest error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /health
 * Simple health check
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve the production Vite build after API routes.
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Trading Research Server running on port ${PORT}`);
});
