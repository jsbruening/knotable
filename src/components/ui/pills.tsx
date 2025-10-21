import React from "react";
import { cn } from "~/lib/utils";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export function LevelPill({
  level,
  className,
}: {
  level: Level;
  className?: string;
}) {
  const colorByLevel: Record<Level, string> = {
    1: "bg-blue-500/20 text-blue-200 border border-blue-400/30",
    2: "bg-green-500/20 text-green-200 border border-green-400/30",
    3: "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30",
    4: "bg-orange-500/20 text-orange-200 border border-orange-400/30",
    5: "bg-red-500/20 text-red-200 border border-red-400/30",
    6: "bg-purple-500/20 text-purple-200 border border-purple-400/30",
  };
  return (
    <span className={cn("pill", colorByLevel[level], className)}>
      Level {level}
    </span>
  );
}

export function StatusPill({
  status,
  className,
}: {
  status: "Completed" | "In Progress" | "Locked";
  className?: string;
}) {
  const map: Record<string, string> = {
    Completed:
      "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30",
    "In Progress": "bg-blue-500/20 text-blue-200 border border-blue-400/30",
    Locked: "bg-gray-500/20 text-gray-200 border border-gray-400/30",
  };
  return <span className={cn("pill", map[status], className)}>{status}</span>;
}
