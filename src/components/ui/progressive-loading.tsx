"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Loader2, Sparkles, FileText, Brain, CheckCircle } from "lucide-react";

interface ProgressiveLoadingProps {
  stage:
    | "idle"
    | "building-prompt"
    | "calling-ai"
    | "parsing-response"
    | "complete";
  message: string;
  progress: number;
}

const stageConfig = {
  idle: { icon: Sparkles, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  "building-prompt": {
    icon: FileText,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  "calling-ai": {
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  "parsing-response": {
    icon: Loader2,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  complete: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
};

export function ProgressiveLoading({
  stage,
  message,
  progress,
}: ProgressiveLoadingProps) {
  const config = stageConfig[stage];
  const IconComponent = config.icon;

  return (
    <Card className="border-blue-400/30 bg-blue-500/10">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <div className={`rounded-lg p-2 ${config.bgColor} mr-3`}>
            <IconComponent
              className={`h-5 w-5 ${config.color} ${stage === "calling-ai" ? "animate-spin" : ""}`}
            />
          </div>
          AI Content Generation
        </CardTitle>
        <CardDescription className="text-white/80">
          {message || "Generating your learning campaign content..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="grid grid-cols-4 gap-2 text-xs text-white/60">
            <div
              className={`rounded p-2 text-center ${stage === "building-prompt" ? "bg-yellow-500/20 text-yellow-300" : ""}`}
            >
              Building Prompt
            </div>
            <div
              className={`rounded p-2 text-center ${stage === "calling-ai" ? "bg-purple-500/20 text-purple-300" : ""}`}
            >
              Calling AI
            </div>
            <div
              className={`rounded p-2 text-center ${stage === "parsing-response" ? "bg-green-500/20 text-green-300" : ""}`}
            >
              Parsing Response
            </div>
            <div
              className={`rounded p-2 text-center ${stage === "complete" ? "bg-green-500/20 text-green-300" : ""}`}
            >
              Complete
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
