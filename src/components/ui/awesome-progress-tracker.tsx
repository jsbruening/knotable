"use client";

import { cn } from "~/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface AwesomeProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: "default" | "minimal" | "detailed";
}

export function AwesomeProgressTracker({
  steps,
  currentStep,
  className,
  variant = "default",
}: AwesomeProgressTrackerProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                index <= currentStep
                  ? "border-emerald-400 bg-emerald-400 text-white shadow-lg shadow-emerald-400/25"
                  : "border-white/30 bg-white/10 text-white/70"
              )}
            >
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 transition-all duration-300",
                  index < currentStep ? "bg-emerald-400" : "bg-white/20"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/70">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 animate-pulse" />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  index <= currentStep
                    ? "border-emerald-400 bg-emerald-400 text-white shadow-lg shadow-emerald-400/25"
                    : "border-white/30 bg-white/10 text-white/70"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-xs font-medium",
                  index <= currentStep ? "text-white" : "text-white/60"
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-white/50 mt-1 max-w-20">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - clean and modern
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/70">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 animate-pulse" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                index <= currentStep
                  ? "border-emerald-400 bg-emerald-400 text-white shadow-lg shadow-emerald-400/25"
                  : "border-white/30 bg-white/10 text-white/70"
              )}
            >
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6 transition-all duration-300",
                  index < currentStep ? "bg-emerald-400" : "bg-white/20"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
