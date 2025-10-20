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
  const { data: currentUser } = api.auth.getCurrentUser.useQuery(undefined, { enabled: !!user });

  useEffect(() => {
    if (currentUser?.onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  const progress = (currentStep / steps.length) * 100;
  const CurrentComponent = steps[currentStep - 1]?.component;

  const handleNext = (data?: any) => {
    if (data) {
      setOnboardingData(prev => ({ ...prev, ...data }));
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <p className="text-gray-600">You need to be signed in to access the onboarding process.</p>
        </div>
      </div>
    );
  }

  if (currentUser?.onboardingCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-top-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Knotable!
              <img src="/images/logo.png" alt="Knotable logo" className="inline-block ml-3 h-8 align-middle" />
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Let's get you set up for your learning journey
            </p>

            {/* Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.id <= currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                    }`}
                >
                  {step.id}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
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

