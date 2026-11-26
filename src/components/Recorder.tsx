"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";

// Records the speaker's voice in the browser. Calls onReady with the audio blob once stopped.
export function Recorder({ onReady, maxSeconds = 20 }: { onReady: (blob: Blob | null) => void; maxSeconds?: number }) {
  const [state, setState] = useState<"idle" | "recording" | "done" | "error">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        setUrl(URL.createObjectURL(blob));
        setState("done");
        onReady(blob);
      };
      rec.current = r;
      r.start();
      setSecs(0);
      setState("recording");
      timer.current = setInterval(() => setSecs((s) => {
        if (s + 1 >= maxSeconds) stop();
        return s + 1;
      }), 1000);
    } catch {
      setState("error");
    }
  }
  function stop() {
    if (timer.current) clearInterval(timer.current);
    if (rec.current && rec.current.state !== "inactive") rec.current.stop();
  }
  function reset() { setUrl(null); setState("idle"); onReady(null); }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {state === "idle" && <button type="button" onClick={start} className="btn btn-clay"><Mic aria-hidden className="size-4" /> Record</button>}
      {state === "recording" && (
        <span className="sr-only" aria-live="polite">Recording</span>
      )}
      {state === "recording" && (
        <button type="button" onClick={stop} className="btn btn-clay"><Square aria-hidden className="size-3.5 fill-current animate-pulse motion-reduce:animate-none" /> Stop · 0:{String(secs).padStart(2, "0")}</button>
      )}
      {state === "done" && url && (
        <>
          <audio src={url} controls className="h-10" />
          <button type="button" onClick={reset} className="btn btn-ghost text-sm"><RotateCcw aria-hidden className="size-4" /> Record again</button>
        </>
      )}
      {state === "error" && (
        <span role="alert" className="text-sm text-clay-deep">Microphone blocked. Allow microphone access in your browser and try again.</span>
      )}
    </div>
  );
}
