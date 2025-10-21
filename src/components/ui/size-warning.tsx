"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";

interface SizeWarningProps {
  contentSize: number; // Size in characters
  estimatedTime?: string;
}

export function SizeWarning({ contentSize, estimatedTime }: SizeWarningProps) {
  const getSizeCategory = (size: number) => {
    if (size < 5000)
      return {
        level: "small",
        color: "bg-green-500/20 text-green-300",
        icon: Info,
      };
    if (size < 15000)
      return {
        level: "medium",
        color: "bg-yellow-500/20 text-yellow-300",
        icon: AlertTriangle,
      };
    return {
      level: "large",
      color: "bg-red-500/20 text-red-300",
      icon: AlertTriangle,
    };
  };

  const category = getSizeCategory(contentSize);
  const IconComponent = category.icon;

  const getMessage = (level: string) => {
    switch (level) {
      case "small":
        return "Content is compact and will load quickly.";
      case "medium":
        return "Content is moderately sized. Loading may take a few seconds.";
      case "large":
        return "Content is quite large. This may take longer to process and display.";
      default:
        return "";
    }
  };

  const getRecommendation = (level: string) => {
    switch (level) {
      case "small":
        return null;
      case "medium":
        return "Consider breaking this into smaller sections if needed.";
      case "large":
        return "You may want to regenerate with more focused parameters or break this into multiple campaigns.";
      default:
        return null;
    }
  };

  if (category.level === "small") {
    return null; // Don't show warning for small content
  }

  return (
    <Card className={`border-current ${category.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className={`rounded-lg p-2 ${category.color} mr-3`}>
            <IconComponent className="h-5 w-5" />
          </div>
          Content Size Notice
        </CardTitle>
        <CardDescription>{getMessage(category.level)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Content Size:</span>
            <Badge variant="outline" className={category.color}>
              {category.level.toUpperCase()} ({contentSize.toLocaleString()}{" "}
              characters)
            </Badge>
          </div>

          {estimatedTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Estimated Processing Time:</span>
              <span className="text-sm font-medium">{estimatedTime}</span>
            </div>
          )}

          {getRecommendation(category.level) && (
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-sm text-white/80">
                <strong>Recommendation:</strong>{" "}
                {getRecommendation(category.level)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
