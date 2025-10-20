"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function AuthCallback() {
 const router = useRouter();
 const { data: currentUser, isLoading, isError } = api.auth.getCurrentUser.useQuery();

 useEffect(() => {
  if (isLoading) return;
  if (isError || !currentUser) {
   router.replace("/auth/signin");
   return;
  }
  if (currentUser.onboardingCompleted) {
   router.replace("/dashboard");
  } else {
   router.replace("/onboarding");
  }
 }, [currentUser, isLoading, isError, router]);

 return (
  <div className="flex min-h-screen items-center justify-center">
   <div className="text-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
    <p className="text-gray-600">Completing sign in...</p>
   </div>
  </div>
 );
}

