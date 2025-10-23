"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { ProfileSetup } from "./profile-setup";
import { JoinCampaigns } from "./join-campaigns";
import { JoinTeams } from "./join-teams";
import { QuickTour } from "./quick-tour";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EpicProgressTracker } from "~/components/ui/epic-progress-tracker";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

const steps = [
  { id: "profile", title: "Profile Setup", description: "Set up your profile" },
  { id: "campaigns", title: "Join Campaigns", description: "Discover learning campaigns" },
  { id: "teams", title: "Join Teams", description: "Connect with teams" },
  { id: "tour", title: "Quick Tour", description: "Learn the platform" },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const router = useRouter();
  const { data: currentUser } = api.auth.getCurrentUser.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    // Check if user already has a profile set up (has displayName)
    // or if onboarding was explicitly completed
    if (currentUser?.onboardingCompleted || currentUser?.displayName) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  // Map step index to component
  const getStepComponent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return ProfileSetup;
      case 1: return JoinCampaigns;
      case 2: return JoinTeams;
      case 3: return QuickTour;
      default: return ProfileSetup;
    }
  };

  const CurrentComponent = getStepComponent(currentStep - 1);

  const handleNext = (data?: any) => {
    if (data) {
      setOnboardingData((prev) => ({ ...prev, ...data }));
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">
            Please sign in to continue
          </h1>
          <p className="text-white/80">
            You need to be signed in to access the onboarding process.
          </p>
        </div>
      </div>
    );
  }

  if (currentUser?.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">
              Welcome to Knotable!
              <img
                src="/images/logo.png"
                alt="Knotable logo"
                className="ml-3 inline-block h-8 align-middle"
              />
            </h1>
            <p className="mb-6 text-lg text-white/80">
              Let's get you set up for your learning journey
            </p>

            {/* Epic Progress Tracker */}
            <div className="mx-auto mb-8 max-w-3xl">
              <EpicProgressTracker
                steps={steps}
                currentStep={currentStep - 1}
                variant="gamified"
                theme="cosmic"
              />
            </div>
          </div>

          {/* Step Content */}
          <Card className="mx-auto max-w-2xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-white">
                {steps[currentStep - 1]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {CurrentComponent && (
                <CurrentComponent
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  data={onboardingData}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === steps.length}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}