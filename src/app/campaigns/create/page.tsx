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
import { EpicProgressTracker } from "~/components/ui/epic-progress-tracker";
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
      <div className="flex min-h-screen items-center justify-center bg-app-gradient">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400"></div>
      </div>
    );
  }

  if (!user || !currentUser?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gradient">
        <Card className="mx-auto max-w-md bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-white/80">
              Only administrators can create campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
          {/* Epic Progress Tracker */}
          <Card className="mb-8 bg-white/10 border-white/20">
            <CardContent className="p-6">
              <EpicProgressTracker
                steps={STEPS}
                currentStep={currentStep}
                variant="epic"
                theme="neon"
              />
            </CardContent>
          </Card>

          {/* Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
