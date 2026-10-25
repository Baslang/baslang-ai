require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const port = Number(process.env.PORT) || 3000;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Baslang AI", configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Baslang AI is not connected to a model yet. Add OPENAI_API_KEY to your environment settings."
    });
  }

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Send between 1 and 30 conversation messages." });
  }

  const allowed = messages.every((message) =>
    message &&
    ["user", "assistant"].includes(message.role) &&
    typeof message.content === "string" &&
    message.content.length <= 8000
  );
  if (!allowed) {
    return res.status(400).json({ error: "Messages must contain a user/assistant role and text content under 8,000 characters." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are Baslang AI, a helpful, clear, honest assistant. Think through tasks carefully, explain uncertainty, and never claim to have performed an action unless it actually happened. Ask for approval before consequential external actions. Do not reveal secrets or request passwords."
          },
          ...messages.map(({ role, content }) => ({ role, content }))
        ],
        temperature: 0.4
      }),
      signal: AbortSignal.timeout(60000)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Model provider returned status", response.status);
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 401
          ? "The model provider rejected the API key. Check the server environment variable."
          : response.status === 429
            ? "The model provider rate limit or quota was reached. Check your provider account."
            : "The model provider request failed. Check server logs and provider status."
      });
    }

    const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "The model returned an empty response." });
    }
    return res.json({ reply: answer });
  } catch (error) {
    console.error("Chat request failed:", error.name || "Error");
    return res.status(504).json({ error: "The request timed out or the model provider could not be reached. Please try again." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Baslang AI listening on port ${port}`);
});