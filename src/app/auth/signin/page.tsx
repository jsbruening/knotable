"use client";

import { useAuth } from "~/components/auth/auth-provider";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Github, Chrome } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="bg-app-gradient flex min-h-screen items-center justify-center px-4">
      <Card className="glass-card w-full max-w-md border-white/10">
        <CardHeader className="text-center">
          <img
            src="/images/logo.png"
            alt="Knotable logo"
            className="mx-auto mb-3 h-12 w-12"
          />
          <CardTitle className="text-2xl text-white">
            Welcome to Knotable
          </CardTitle>
          <CardDescription className="text-white/70">
            Sign in to start your gamified learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleSignIn("github")}
            className="h-12 w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <Button
            onClick={() => handleSignIn("google")}
            variant="outline"
            className="h-12 w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="text-center text-sm text-white/60">
            <p>By signing in, you agree to our</p>
            <div className="flex justify-center space-x-2">
              <Link href="/terms" className="text-blue-300 hover:underline">
                Terms of Service
              </Link>
              <span>and</span>
              <Link href="/privacy" className="text-blue-300 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
