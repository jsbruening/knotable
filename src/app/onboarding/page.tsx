"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/components/auth/auth-provider";
import { ProfileSetup } from "./profile-setup";
import { JoinCampaigns } from "./join-campaigns";
import { JoinTeams } from "./join-teams";
import { QuickTour } from "./quick-tour";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

const steps = [
  { id: 1, title: "Profile Setup", component: ProfileSetup },
  { id: 2, title: "Join Campaigns", component: JoinCampaigns },
  { id: 3, title: "Join Teams", component: JoinTeams },
  { id: 4, title: "Quick Tour", component: QuickTour },
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

  const progress = (currentStep / steps.length) * 100;
  const CurrentComponent = steps[currentStep - 1]?.component;

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

            {/* Progress */}
            <div className="mx-auto mb-8 max-w-md">
              <div className="mb-2 flex justify-between text-sm text-white/70">
                <span>
                  Step {currentStep} of {steps.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="mb-8 flex justify-center">
            <div className="flex space-x-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${step.id <= currentStep
                      ? "border-blue-400 bg-blue-400 text-white"
                      : "border-white/30 bg-white/10 text-white/70"
                    }`}
                >
                  {step.id}
                </div>
              ))}
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
