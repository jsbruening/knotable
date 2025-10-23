"use client";

import { cn } from "~/lib/utils";
import { CheckCircle, Circle, Sparkles, Zap, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Step {
 id: string;
 title: string;
 description?: string;
 icon?: React.ComponentType<{ className?: string }>;
}

interface EpicProgressTrackerProps {
 steps: Step[];
 currentStep: number;
 className?: string;
 variant?: "epic" | "minimal" | "detailed" | "gamified";
 theme?: "default" | "neon" | "cosmic" | "fire";
}

export function EpicProgressTracker({
 steps,
 currentStep,
 className,
 variant = "epic",
 theme = "default",
}: EpicProgressTrackerProps) {
 const [animatedStep, setAnimatedStep] = useState(currentStep);
 const [isAnimating, setIsAnimating] = useState(false);

 // Animate step changes
 useEffect(() => {
  if (currentStep !== animatedStep) {
   setIsAnimating(true);
   const timer = setTimeout(() => {
    setAnimatedStep(currentStep);
    setIsAnimating(false);
   }, 300);
   return () => clearTimeout(timer);
  }
 }, [currentStep, animatedStep]);

 const progress = ((animatedStep + 1) / steps.length) * 100;

 // Theme configurations
 const themes = {
  default: {
   primary: "from-emerald-400 to-blue-400",
   secondary: "from-emerald-400/20 to-blue-400/20",
   accent: "emerald-400",
   glow: "shadow-emerald-400/25",
  },
  neon: {
   primary: "from-cyan-400 to-pink-400",
   secondary: "from-cyan-400/20 to-pink-400/20",
   accent: "cyan-400",
   glow: "shadow-cyan-400/30",
  },
  cosmic: {
   primary: "from-purple-400 to-indigo-400",
   secondary: "from-purple-400/20 to-indigo-400/20",
   accent: "purple-400",
   glow: "shadow-purple-400/25",
  },
  fire: {
   primary: "from-orange-400 to-red-400",
   secondary: "from-orange-400/20 to-red-400/20",
   accent: "orange-400",
   glow: "shadow-orange-400/25",
  },
 };

 const currentTheme = themes[theme];

 if (variant === "minimal") {
  return (
   <div className={cn("flex items-center space-x-2", className)}>
    {steps.map((step, index) => (
     <div key={step.id} className="flex items-center">
      <div
       className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out",
        index <= animatedStep
         ? `border-${currentTheme.accent} bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg ${currentTheme.glow}`
         : "border-white/30 bg-white/10 text-white/70"
       )}
      >
       {index < animatedStep ? (
        <CheckCircle className="h-4 w-4 animate-pulse" />
       ) : (
        <span className="text-sm font-semibold">{index + 1}</span>
       )}
      </div>
      {index < steps.length - 1 && (
       <div
        className={cn(
         "h-0.5 w-8 transition-all duration-500 ease-out",
         index < animatedStep ? `bg-gradient-to-r ${currentTheme.primary}` : "bg-white/20"
        )}
       />
      )}
     </div>
    ))}
   </div>
  );
 }

 if (variant === "gamified") {
  return (
   <div className={cn("space-y-6", className)}>
    {/* Epic Progress Bar */}
    <div className="space-y-3">
     <div className="flex justify-between text-sm text-white/70">
      <span className="flex items-center gap-2">
       <Sparkles className="h-4 w-4 text-yellow-400" />
       Level {animatedStep + 1} of {steps.length}
      </span>
      <span className="flex items-center gap-2">
       <Zap className="h-4 w-4 text-blue-400" />
       {Math.round(progress)}% Complete
      </span>
     </div>
     <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
      <div
       className={cn(
        "h-full bg-gradient-to-r transition-all duration-700 ease-out",
        currentTheme.primary
       )}
       style={{ width: `${progress}%` }}
      />
      <div className={cn(
       "absolute inset-0 bg-gradient-to-r animate-pulse",
       currentTheme.secondary
      )} />
      {/* Floating particles effect */}
      <div className="absolute inset-0">
       {[...Array(3)].map((_, i) => (
        <div
         key={i}
         className={cn(
          "absolute h-1 w-1 rounded-full bg-white/60 animate-ping",
          `top-${i + 1}`
         )}
         style={{
          left: `${progress - 5 + i * 2}%`,
          animationDelay: `${i * 0.5}s`,
         }}
        />
       ))}
      </div>
     </div>
    </div>

    {/* Gamified Step Indicators */}
    <div className="flex justify-between">
     {steps.map((step, index) => (
      <div key={step.id} className="flex flex-col items-center space-y-3">
       <div
        className={cn(
         "relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out",
         index <= animatedStep
          ? `border-${currentTheme.accent} bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg ${currentTheme.glow}`
          : "border-white/30 bg-white/10 text-white/70"
        )}
       >
        {/* Completion sparkle effect */}
        {index < animatedStep && (
         <div className="absolute -top-1 -right-1">
          <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
         </div>
        )}

        {index < animatedStep ? (
         <CheckCircle className="h-6 w-6 animate-bounce" />
        ) : (
         <span className="text-lg font-bold">{index + 1}</span>
        )}
       </div>
       <div className="text-center">
        <div className={cn(
         "text-sm font-medium transition-colors duration-300",
         index <= animatedStep ? "text-white" : "text-white/60"
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

 if (variant === "detailed") {
  return (
   <div className={cn("space-y-6", className)}>
    {/* Enhanced Progress Bar */}
    <div className="space-y-3">
     <div className="flex justify-between text-sm text-white/70">
      <span>Step {animatedStep + 1} of {steps.length}</span>
      <span>{Math.round(progress)}% Complete</span>
     </div>
     <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
      <div
       className={cn(
        "h-full bg-gradient-to-r transition-all duration-700 ease-out",
        currentTheme.primary
       )}
       style={{ width: `${progress}%` }}
      />
      <div className={cn(
       "absolute inset-0 bg-gradient-to-r animate-pulse",
       currentTheme.secondary
      )} />
     </div>
    </div>

    {/* Enhanced Step Indicators */}
    <div className="flex justify-between">
     {steps.map((step, index) => (
      <div key={step.id} className="flex flex-col items-center space-y-2">
       <div
        className={cn(
         "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out",
         index <= animatedStep
          ? `border-${currentTheme.accent} bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg ${currentTheme.glow}`
          : "border-white/30 bg-white/10 text-white/70"
        )}
       >
        {index < animatedStep ? (
         <CheckCircle className="h-5 w-5" />
        ) : (
         <span className="text-sm font-semibold">{index + 1}</span>
        )}
       </div>
       <div className="text-center">
        <div className={cn(
         "text-xs font-medium",
         index <= animatedStep ? "text-white" : "text-white/60"
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

 // Epic variant (default)
 return (
  <div className={cn("space-y-6", className)}>
   {/* Epic Progress Bar with Particles */}
   <div className="space-y-4">
    <div className="flex justify-between text-sm text-white/70">
     <span className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
      Step {animatedStep + 1} of {steps.length}
     </span>
     <span className="flex items-center gap-2">
      <Zap className="h-4 w-4 text-blue-400" />
      {Math.round(progress)}% Complete
     </span>
    </div>

    <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
     {/* Main progress bar */}
     <div
      className={cn(
       "h-full bg-gradient-to-r transition-all duration-700 ease-out",
       currentTheme.primary
      )}
      style={{ width: `${progress}%` }}
     />

     {/* Animated background glow */}
     <div className={cn(
      "absolute inset-0 bg-gradient-to-r animate-pulse",
      currentTheme.secondary
     )} />

     {/* Floating particles */}
     <div className="absolute inset-0">
      {[...Array(5)].map((_, i) => (
       <div
        key={i}
        className={cn(
         "absolute h-1 w-1 rounded-full bg-white/80 animate-ping",
         `top-${i + 1}`
        )}
        style={{
         left: `${Math.max(0, progress - 10 + i * 3)}%`,
         animationDelay: `${i * 0.3}s`,
         animationDuration: '2s',
        }}
       />
      ))}
     </div>
    </div>
   </div>

   {/* Epic Step Indicators */}
   <div className="flex justify-center space-x-6">
    {steps.map((step, index) => (
     <div key={step.id} className="flex items-center">
      <div
       className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out hover:scale-110",
        index <= animatedStep
         ? `border-${currentTheme.accent} bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg ${currentTheme.glow}`
         : "border-white/30 bg-white/10 text-white/70 hover:border-white/50"
       )}
      >
       {/* Completion sparkle */}
       {index < animatedStep && (
        <div className="absolute -top-1 -right-1">
         <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
        </div>
       )}

       {index < animatedStep ? (
        <CheckCircle className="h-5 w-5 animate-bounce" />
       ) : (
        <span className="text-sm font-semibold">{index + 1}</span>
       )}
      </div>

      {index < steps.length - 1 && (
       <div
        className={cn(
         "h-0.5 w-8 transition-all duration-500 ease-out",
         index < animatedStep ? `bg-gradient-to-r ${currentTheme.primary}` : "bg-white/20"
        )}
       />
      )}
     </div>
    ))}
   </div>
  </div>
 );
}
