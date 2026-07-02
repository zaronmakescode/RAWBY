# RAWBY Claude bridge

Lets **Aurora** answer using the **owner's Claude subscription** (Pro/Max) via the
Claude Agent SDK + OAuth — no pay-per-token API key required. Usage draws from your
normal plan limits.

The bridge is a tiny Node service. Once running, toggle **Settings → "Use my Claude
(Pro)"** in the app and Aurora will route:
- **Chat** (Aurora assistant)
- **Weekly prompt generation** (the 3 prompts each week)
- **Skill feedback** (coaching plan)

…all through your Claude subscription. Groq auto-fallback if the bridge is unreachable.

---

## 1. Get a subscription OAuth token

On a machine where you're logged into Claude with your subscription:

```bash
npm i -g @anthropic-ai/claude-code   # if you don't have the `claude` CLI
claude setup-token                   # prints a long-lived OAuth token
```

Copy the token it prints.

---

## 2. Run the bridge

```bash
cd claude-bridge
npm install
CLAUDE_CODE_OAUTH_TOKEN="<token from step 1>" \
BRIDGE_SECRET="<make up a long random string>" \
npm start
```

Listens on `:8787`. Verify: `GET /health` → `{ "ok": true, "hasToken": true }`.

Optional: set `CLAUDE_MODEL` to pin a model (e.g. `claude-sonnet-4-6`). Defaults to
whatever the Agent SDK picks for your subscription tier.

To deploy: any Node host (Render Web Service, Fly, VPS). Set the env vars above.

---

## 3. Point the RAWBY server at it

On the RAWBY Dart server (Render `rawby-1`), add two env vars:

```
CLAUDE_BRIDGE_URL = https://<your-bridge-host>
BRIDGE_SECRET     = <same secret as above>
```

---

## 4. Enable in the app

Settings → **"Use my Claude (Pro)"** toggle ON.  
All three AI features (chat, prompts, skill feedback) now run through your subscription.

---

## API reference

### `POST /complete`   ← primary endpoint (used by all features)
```json
{
  "system":     "<system prompt>",
  "prompt":     "<user prompt / conversation transcript>",
  "allowTools": false,
  "maxTurns":   1
}
```
Returns `{ "reply": "..." }`.

`allowTools: true` passes `["WebSearch"]` to the SDK — useful if you configure a
WebSearch MCP server in the bridge environment. Without one, Claude answers from
training data.

### `POST /chat`   ← back-compat alias (same as /complete with allowTools=false)
### `GET  /health` → `{ "ok": true, "hasToken": bool }`

---

## Security notes
- Keep `BRIDGE_SECRET` private — it's the only gate on who can spend your Claude usage.
- Tools are disabled by default — no file/system access.
- The bridge has a 120-second timeout per request.
