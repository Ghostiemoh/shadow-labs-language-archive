"use client";
import { useRef, useState } from "react";

export function AudioButton({ src, label = "Play" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => { const a = ref.current; if (!a) return; if (a.paused) { a.currentTime = 0; a.play(); } else a.pause(); }}
        className={`grid place-items-center size-9 rounded-full border border-line bg-white hover:border-indigo ${playing ? "text-clay" : "text-indigo"}`}
      >
        {playing ? "■" : "▶"}
      </button>
      <audio ref={ref} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </>
  );
}
