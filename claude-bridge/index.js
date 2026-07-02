// ============================================================
// RAWBY — Claude bridge.
// Lets Aurora answer using the OWNER's Claude subscription (Pro/Max) via
// the Claude Agent SDK + OAuth. Usage draws from your normal plan limits.
//
// Auth: CLAUDE_CODE_OAUTH_TOKEN must be set — generate once with
//   `claude setup-token` (requires a Claude subscription).
//
// The RAWBY Dart server calls POST /complete (or /chat for back-compat)
// with a shared secret; this runs the SDK and returns the reply text.
//
// POST /chat      — back-compat alias (plain chat, no tools)
// POST /complete  — general: body { system, prompt, allowTools?, maxTurns? }
// GET  /health    — { ok, hasToken }
// ============================================================
import express from "express";
import { query } from "@anthropic-ai/claude-agent-sdk";

const app    = express();
const SECRET = process.env.BRIDGE_SECRET || "";
const MODEL  = process.env.CLAUDE_MODEL  || undefined; // e.g. "claude-sonnet-4-6"

app.use(express.json({ limit: "4mb" }));

// ── Auth guard ────────────────────────────────────────────────────────────────
function checkSecret(req, res) {
  if (SECRET && req.headers["x-bridge-secret"] !== SECRET) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  return true;
}

// ── Core SDK call ─────────────────────────────────────────────────────────────
async function runQuery(system, prompt, { allowTools = false, maxTurns } = {}) {
  // allowTools: enables WebSearch if you have an MCP WebSearch server
  // configured in this bridge's environment. With no MCP server set up,
  // allowedTools is silently ignored and Claude answers from training data.
  const tools    = allowTools ? ["WebSearch"] : [];
  const turns    = maxTurns ?? (allowTools ? 6 : 1);

  let reply = "";
  for await (const message of query({
    prompt,
    options: {
      systemPrompt:    system || undefined,
      model:           MODEL,
      allowedTools:    tools,
      maxTurns:        turns,
      permissionMode:  "bypassPermissions",
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      reply = message.result;
      break;
    }
  }
  if (!reply) throw new Error("no reply from Claude");
  return reply;
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ ok: true, hasToken: !!process.env.CLAUDE_CODE_OAUTH_TOKEN })
);

// General endpoint — used by chat, prompt generation, skill feedback
app.post("/complete", async (req, res) => {
  if (!checkSecret(req, res)) return;
  const { system, prompt, allowTools = false, maxTurns } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt required" });
  }
  try {
    const reply = await runQuery(system, prompt, { allowTools, maxTurns });
    res.json({ reply });
  } catch (e) {
    console.error("[bridge /complete] error:", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// Back-compat alias for the original /chat endpoint
app.post("/chat", async (req, res) => {
  if (!checkSecret(req, res)) return;
  const { system, prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt required" });
  }
  try {
    const reply = await runQuery(system, prompt, { allowTools: false });
    res.json({ reply });
  } catch (e) {
    console.error("[bridge /chat] error:", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 8787;
app.listen(port, () => {
  const tok = process.env.CLAUDE_CODE_OAUTH_TOKEN ? "set ✓" : "MISSING ✗";
  console.log(`Claude bridge :${port}  OAuth token ${tok}`);
});
