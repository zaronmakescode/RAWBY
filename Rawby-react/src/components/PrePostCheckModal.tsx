import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "./ui/Modal";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { ai } from "../lib/endpoints";

const fieldCls =
  "w-full rounded-xl border border-hairline bg-field px-4 py-3 text-sm text-text-hi outline-none placeholder:text-text-dim/60 focus:border-cinema-500/70";

/** Sample `count` frames evenly across a local video, downscaled to JPEG data URLs. */
async function extractFrames(file: File, count = 5): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("Couldn't read that video file."));
    });
    const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const points = [0.02, 0.28, 0.5, 0.72, 0.96].slice(0, count);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const W = 540;
    const frames: string[] = [];
    for (const p of points) {
      const t = dur ? Math.min(p * dur, Math.max(0, dur - 0.05)) : 0;
      await new Promise<void>((res) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          res();
        };
        video.addEventListener("seeked", onSeek);
        try {
          video.currentTime = t;
        } catch {
          res();
        }
      });
      const ratio = video.videoWidth ? video.videoHeight / video.videoWidth : 16 / 9;
      canvas.width = W;
      canvas.height = Math.round(W * ratio);
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.72));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PrePostCheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [frames, setFrames] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const analyze = useMutation({ mutationFn: () => ai.analyzeReel(frames, caption) });

  useEffect(() => {
    if (open) {
      setFrames([]);
      setCaption("");
      setErr("");
      setBusy(false);
      analyze.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setFrames([]);
    analyze.reset();
    setBusy(true);
    try {
      setFrames(await extractFrames(file));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Couldn't read that video file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pre-post check">
      <div className="space-y-4">
        <p className="text-sm text-text-dim">
          Aurora samples a few frames from your near-final clip and reviews the hook, framing,
          exposure, safe areas, pacing and caption — before you post. The video never leaves your
          device; only the sampled frames are sent.
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-chip px-4 py-7 text-center transition-colors hover:border-cinema-500/60">
          <input type="file" accept="video/*" className="hidden" onChange={onFile} />
          <Icon name="film" size={22} className="text-cinema-400" />
          <span className="text-sm font-semibold text-text-hi">Choose your video</span>
          <span className="text-xs text-text-dim">mp4/mov — stays on your device</span>
        </label>

        {busy && (
          <div className="flex items-center gap-2 text-sm text-text-dim">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cinema-400 border-r-transparent" />
            Sampling frames…
          </div>
        )}
        {err && <p className="text-sm text-danger">{err}</p>}

        {frames.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {frames.map((f, i) => (
              <img key={i} src={f} alt={`frame ${i + 1}`} className="h-28 shrink-0 rounded-lg border border-hairline" />
            ))}
          </div>
        )}

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Planned caption (optional) — helps the review"
          className={fieldCls}
        />

        <GradientButton onClick={() => analyze.mutate()} loading={analyze.isPending} disabled={!frames.length} className="w-full">
          <Icon name="sparkles" size={16} /> Review my video
        </GradientButton>

        {analyze.isError && (
          <p className="text-sm text-danger">Couldn't analyse — the server may be waking. Try again.</p>
        )}
        {analyze.data && (
          <div className="whitespace-pre-wrap rounded-xl border border-hairline bg-chip p-4 text-sm leading-relaxed text-text-hi">
            {analyze.data}
          </div>
        )}
      </div>
    </Modal>
  );
}
