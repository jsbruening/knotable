"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number; // px
  label?: string;
}

export function ProgressCircle({
  value,
  size = 64,
  strokeWidth = 8,
  label,
  className,
  ...props
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-white/15"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-blue-400"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/90">
        {Math.round(clamped)}%
      </div>
      {label && (
        <div className="mt-1 text-center text-xs text-white/70">{label}</div>
      )}
    </div>
  );
}

export default ProgressCircle;
