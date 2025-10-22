"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    data: currentUser,
    isLoading,
    isError,
  } = api.auth.getCurrentUser.useQuery();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !currentUser) {
      router.replace("/auth/signin");
      return;
    }

    // If there's a callback URL, use it
    if (callbackUrl) {
      router.replace(decodeURIComponent(callbackUrl));
      return;
    }

    // Otherwise, follow normal flow
    if (currentUser.onboardingCompleted) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [currentUser, isLoading, isError, router, callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gradient">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400"></div>
        <p className="text-white/80">Completing sign in...</p>
      </div>
    </div>
  );
}
