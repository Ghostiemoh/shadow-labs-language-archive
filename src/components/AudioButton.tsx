"use client";
import { useRef, useState } from "react";
import { Play, Square } from "lucide-react";

export function AudioButton({ src, label = "Play" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={playing ? "Stop" : label}
        aria-pressed={playing}
        onClick={() => { const a = ref.current; if (!a) return; if (a.paused) { a.currentTime = 0; a.play(); } else a.pause(); }}
        className={`grid place-items-center size-11 shrink-0 rounded-full transition-colors duration-150 ${playing ? "bg-clay text-surface" : "bg-brand text-surface hover:bg-brand-deep"}`}
      >
        {playing ? <Square aria-hidden className="size-4 fill-current" /> : <Play aria-hidden className="size-4 fill-current translate-x-[1px]" />}
      </button>
      <audio ref={ref} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </>
  );
}
