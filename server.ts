import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared backend Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // NLP Parser endpoint: Converts freeform text to structured transaction object
  app.post("/api/ai/parse", async (req, res) => {
    try {
      const { text, currentDate } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing required parameter: text" });
      }

      const clientDate = currentDate || new Date().toISOString().split("T")[0];
      const ai = getGeminiClient();

      const prompt = `Parse the following freeform financial sentence into a single transaction object.
Return the structured parse results.
Sentence to parse: "${text}"
Contextual Current Date (use as 'today'): ${clientDate}

Map Categories strictly to one of the following standard ones if possible:
- "Food & Dining"
- "Shopping"
- "Transport"
- "Housing & Rent"
- "Entertainment"
- "Utilities & Bills"
- "Healthcare"
- "Salary / Income"
- "Freelance / Business"
- "Investment"
- "Gifts & Personal"
- "Others"

Set Transaction type strictly to "expense" or "income".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert financial assistant. Your goal is to analyze informal text describing an expense or income and extract the transaction parameters. Be highly accurate with numbers, dates (including expressions like 'yesterday', 'last Friday', etc.), and category mapping.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: {
                type: Type.NUMBER,
                description: "The absolute monetary value extracted. If no amount is given, leave it as 0.",
              },
              type: {
                type: Type.STRING,
                description: "Must be 'expense' or 'income'.",
              },
              category: {
                type: Type.STRING,
                description: "The mapped standard category matching the list provided in the prompt.",
              },
              title: {
                type: Type.STRING,
                description: "A clean, concise description of the item or source (e.g. 'Coffee at Starbucks', 'Salary payment').",
              },
              date: {
                type: Type.STRING,
                description: "The resolved ISO standard date string (YYYY-MM-DD). Resolve relative dates using the contextual Current Date provided.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence score between 0.0 and 1.0.",
              },
              explanation: {
                type: Type.STRING,
                description: "A friendly, conversational explanation summarizing the extraction (e.g. 'Saved $18.50 for dinner under Food & Dining').",
              },
            },
            required: ["amount", "type", "category", "title", "date", "confidence", "explanation"],
          },
        },
      });

      const parsedResult = JSON.parse(response.text?.trim() || "{}");
      res.json(parsedResult);
    } catch (error: any) {
      console.error("AI Parse Error:", error);
      res.status(500).json({ error: error.message || "Failed to parse transaction using AI" });
    }
  });

  // Insights endpoint: Analyzes transaction log and provides budget coaching
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { transactions, budget, goals, selectedMonth } = req.body;
      const ai = getGeminiClient();

      const transactionsSummary = (transactions || [])
        .slice(0, 100) // limit context
        .map((t: any) => `- [${t.date}] (${t.type.toUpperCase()}) ${t.category} - ${t.title}: $${Number(t.amount).toFixed(2)}`)
        .join("\n");

      const budgetText = budget ? `Monthly budget limit: $${budget}` : "No specific monthly budget set.";
      const goalsSummary = (goals || [])
        .map((g: any) => `- ${g.name}: Target $${g.target} (Saved so far: $${g.current})`)
        .join("\n");

      const prompt = `Analyze this user's transactions and provide a helpful, coaching, friendly financial health insight and 2-3 tailored recommendations.
Current selected month/period is: ${selectedMonth || "this month"}.
${budgetText}

Visual Summary of active savings goals:
${goalsSummary || "No items"}

Latest transactions (up to 100):
${transactionsSummary || "No transaction records yet. Ask them to add some to unlock direct advice!"}

Write 3 short and concise sections. Keep the response to about 150-200 words. Format with clean markdown headers:
### 📊 Monthly Assessment
### 💡 Actionable Insights
### 🎯 Savings & Progress Tips`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a warm, supportive, and expert financial advisor who speaks directly to the user (use 'you'). Keep insights encouraging, specific to their values or data trends, and extremely concise. Avoid generic standard textbook advice. Focus on highlighting trends, alert for budget overruns or potential savings opportunities, and celebrating goal achievements.",
        },
      });

      res.json({ insights: response.text || "Unable to generate insights at this time." });
    } catch (error: any) {
      console.error("AI Insights Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate financial insights" });
    }
  });

  // Configure Vite dev or production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
