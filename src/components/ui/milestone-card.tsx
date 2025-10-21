import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";
import { LevelPill, StatusPill } from "./pills";
import { Badge } from "./badge";
import { Button } from "./button";
import { Brain } from "lucide-react";

interface MilestoneCardProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Locked";
  quizPercent?: number;
  points?: number;
}

export function MilestoneCard({
  level,
  title,
  description,
  status,
  quizPercent,
  points,
}: MilestoneCardProps) {
  return (
    <Card className="border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LevelPill level={level} />
            <StatusPill status={status} />
            {quizPercent !== undefined && (
              <Badge variant="glassBlue">Quiz: {quizPercent}%</Badge>
            )}
          </div>
          {points !== undefined && (
            <Badge variant="glassYellow">⚡ {points} points</Badge>
          )}
        </div>
        <CardTitle className="mt-2 text-white">{title}</CardTitle>
        <CardDescription className="text-white/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm">
            <Brain className="mr-2 h-4 w-4" />
            Ask Copilot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MilestoneCard;
