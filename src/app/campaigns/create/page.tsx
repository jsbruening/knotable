"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { useAuth } from "~/components/auth/auth-provider";
import Link from "next/link";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";

// Import wizard steps
import { BasicInfoStep } from "./steps/basic-info";
import { LearningParamsStep } from "./steps/learning-params";
import { AIGenerationStep } from "./steps/ai-generation";
import { ReviewStep } from "./steps/review";
import { PublishStep } from "./steps/publish";

const STEPS = [
  {
    id: "basic",
    title: "Basic Info",
    description: "Campaign details and overview",
  },
  {
    id: "params",
    title: "Learning Parameters",
    description: "Bloom levels and focus areas",
  },
  { id: "ai", title: "AI Generation", description: "Generate content with AI" },
  {
    id: "review",
    title: "Review & Edit",
    description: "Customize generated content",
  },
  { id: "publish", title: "Publish", description: "Make campaign available" },
];

export default function CreateCampaignPage() {
  const { user, loading } = useAuth();
  const {
    currentStep,
    totalSteps,
    campaignData,
    generatedContent,
    nextStep,
    previousStep,
    canProceedToNextStep,
  } = useCampaignWizardStore();

  // Check if user is admin
  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user || !currentUser?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-white/80">
              Only administrators can create campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <LearningParamsStep />;
      case 2:
        return <AIGenerationStep />;
      case 3:
        return <ReviewStep />;
      case 4:
        return <PublishStep />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-app-gradient min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Step {currentStep + 1} of {totalSteps}:{" "}
                  {STEPS[currentStep]?.title}
                </h2>
                <span className="text-sm text-white/80">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="mb-4" />
              <p className="text-sm text-white/80">
                {STEPS[currentStep]?.description}
              </p>
            </CardContent>
          </Card>

          {/* Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
