"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { AwesomeProgressTracker } from "~/components/ui/awesome-progress-tracker";
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
        <AwesomeProgressTracker 
          steps={[
            { id: "building", title: "Building Prompt", description: "Crafting AI prompt" },
            { id: "calling", title: "Calling AI", description: "Generating content" },
            { id: "parsing", title: "Parsing Response", description: "Processing results" },
            { id: "complete", title: "Complete", description: "Ready to use" },
          ]} 
          currentStep={stage === "building-prompt" ? 0 : stage === "calling-ai" ? 1 : stage === "parsing-response" ? 2 : stage === "complete" ? 3 : 0} 
          variant="minimal"
        />
      </CardContent>
    </Card>
  );
}
