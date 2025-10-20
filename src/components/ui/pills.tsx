import React from "react"
import { cn } from "~/lib/utils"

type Level = 1 | 2 | 3 | 4 | 5 | 6

export function LevelPill({ level, className }: { level: Level, className?: string }) {
 const colorByLevel: Record<Level, string> = {
  1: "bg-blue-500/15 text-blue-300",
  2: "bg-green-500/15 text-green-300",
  3: "bg-yellow-500/15 text-yellow-300",
  4: "bg-orange-500/15 text-orange-300",
  5: "bg-red-500/15 text-red-300",
  6: "bg-purple-500/15 text-purple-300",
 }
 return (
  <span className={cn("pill", colorByLevel[level], className)}>Level {level}</span>
 )
}

export function StatusPill({ status, className }: { status: "Completed" | "In Progress" | "Locked", className?: string }) {
 const map: Record<string, string> = {
  Completed: "bg-emerald-400/15 text-emerald-300",
  "In Progress": "bg-indigo-400/15 text-indigo-300",
  Locked: "bg-zinc-400/15 text-zinc-300",
 }
 return (
  <span className={cn("pill", map[status], className)}>{status}</span>
 )
}


