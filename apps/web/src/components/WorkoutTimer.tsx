import { useEffect, useState } from "react";
import { formatDuration } from "../lib/date.js";

interface WorkoutTimerProps {
  startedAt: string;
  finishedAt: string | null;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function WorkoutTimer({ startedAt, finishedAt }: WorkoutTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (finishedAt !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [finishedAt]);

  if (finishedAt !== null) {
    return (
      <span className="rounded bg-gray-700/50 px-2 py-1 text-xs text-gray-300">
        ⏱ {formatDuration(startedAt, finishedAt)}
      </span>
    );
  }

  const start = new Date(startedAt).getTime();
  const elapsedMs = Number.isFinite(start) ? now - start : 0;

  return (
    <span className="rounded bg-cyan-500/10 px-2 py-1 text-xs font-mono text-cyan-400">
      ● {formatElapsed(elapsedMs)}
    </span>
  );
}
