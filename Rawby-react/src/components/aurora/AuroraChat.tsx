// Aurora's chat core — shared by the floating panel (compact) and the
// full /assistant page. Owns the thread (persisted to the snapshot),
// the user context, and the send loop.
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "../ui/Icon";
import { ai } from "../../lib/endpoints";
import { useMe } from "../../hooks/queries";
import { useNote, useAurora } from "../../hooks/usePersonal";
import { useTrips } from "../../hooks/useTrips";
import { gearLabels, filmSummaries, tripSummaries } from "../../lib/personalize";
import { useAuth } from "../../store/auth";
import { useSettings, aiRequestFields } from "../../store/settings";
import type { ChatMessage, ChatContext } from "../../types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hey — I'm Aurora. I shoot, cut and grade solo too, so ask me anything specific: camera settings for a shot, a shot list for your prompt, how to film yourself with no crew, an edit or colour fix, or a Reel hook that lands. The more detail you give (gear, location, what's not working), the sharper I am.",
};

// Quick-start questions to seed a useful conversation.
const STARTERS = [
  "Give me a 5-shot list for this week's prompt.",
  "Best camera settings to shoot myself alone, no crew?",
  "My footage looks flat — how do I grade it?",
  "Write 3 Reel hooks for this film.",
];

export function AuroraChat({ compact = false }: { compact?: boolean }) {
  const { data } = useMe();
  const user = useAuth((s) => s.user);
  const { note } = useNote();
  const { thread, saveThread } = useAurora();
  const { trips } = useTrips();
  const aiProvider = useSettings((s) => s.aiProvider);
  const anthropicKey = useSettings((s) => s.anthropicKey);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const hydrated = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aurora remembers: hydrate the thread from the snapshot once on load.
  useEffect(() => {
    if (hydrated.current || !data?.snapshot) return;
    hydrated.current = true;
    if (thread.length) setMessages(thread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.snapshot]);

  const snap = data?.snapshot;
  const context: ChatContext = {
    displayName: user?.displayName,
    rank: snap?.rank,
    totalScore: snap?.totalScore,
    streak: snap?.streak,
    regensLeft: snap?.regensLeft,
    daysLeft: snap?.daysLeft,
    promptLevel: snap?.promptLevel,
    promptText: snap?.promptText,
    note,
    location: snap?.profile?.location,
    style: snap?.profile?.style,
    gear: gearLabels(snap?.gear ?? []),
    films: filmSummaries(snap?.history ?? []),
    memory: snap?.aurora?.facts ?? [],
    trips: tripSummaries(trips),
  };

  const m = useMutation({
    mutationFn: (history: ChatMessage[]) => {
      const { provider, apiKey } = aiRequestFields(aiProvider, anthropicKey);
      return ai.chat(history, context, provider, apiKey);
    },
    onSuccess: (reply) =>
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: reply }];
        saveThread.mutate(next); // persist so Aurora remembers next session
        return next;
      }),
    onError: () =>
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't reach the studio just now — the server may be waking up. Try again in a moment.",
        },
      ]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, m.isPending]);

  function send(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || m.isPending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    m.mutate(next);
  }

  function reset() {
    setMessages([GREETING]);
    saveThread.mutate([]);
  }

  const pad = compact ? "p-3.5" : "p-5";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className={`flex-1 space-y-3.5 overflow-y-auto ${pad}`}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cinema-500 text-[#1A1100]"
                    : "border border-hairline bg-chip text-text-hi"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {m.isPending && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl border border-hairline bg-chip px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-2 w-2 rounded-full bg-cinema-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {messages.length === 1 && !m.isPending && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-hairline bg-chip px-3 py-1.5 text-left text-xs text-text-dim transition-colors hover:border-cinema-500/60 hover:text-text-hi"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline p-2.5">
        {messages.length > 1 && (
          <button
            onClick={reset}
            title="New chat"
            aria-label="New chat"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-dim transition-colors hover:bg-glass hover:text-text-hi"
          >
            <Icon name="refresh" size={16} />
          </button>
        )}
        <label htmlFor={compact ? "aurora-input-panel" : "aurora-input"} className="sr-only">
          Message Aurora
        </label>
        <input
          id={compact ? "aurora-input-panel" : "aurora-input"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your shot, cut, or grade…"
          className="min-w-0 flex-1 rounded-xl border border-hairline bg-field px-3.5 py-2.5 text-sm text-text-hi outline-none transition-colors placeholder:text-text-dim/60 focus:border-cinema-500/70"
        />
        <button
          onClick={() => send()}
          disabled={m.isPending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cinema-500 text-[#16161a] transition-[filter] duration-200 hover:brightness-110 disabled:opacity-40"
          aria-label="Send message"
        >
          <Icon name="send" size={16} />
        </button>
      </div>
    </div>
  );
}
