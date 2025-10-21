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
import { Badge } from "~/components/ui/badge";
import {
  Target,
  Users,
  Trophy,
  Star,
  Zap,
  BookOpen,
  Github,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

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
    <div className="bg-app-gradient min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <img
            src="/images/logo.png"
            alt="Knotable logo"
            className="mx-auto mb-6 h-12 w-12"
          />
          <h1 className="mb-6 text-5xl font-bold text-white">
            Level Up Your Learning with{" "}
            <span className="text-blue-300">Knotable</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/80">
            Join AI-generated campaigns, collaborate with teams, and earn badges
            as you progress through Bloom's Taxonomy levels.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Why Choose Knotable?
            </h2>
            <p className="text-lg text-white/80">
              Experience learning like never before with our unique gamification
              system
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">
                  AI-Generated Campaigns
                </CardTitle>
                <CardDescription className="text-white/70">
                  Learn through structured campaigns based on Bloom's Taxonomy,
                  created with AI assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-green-300">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Team Collaboration</CardTitle>
                <CardDescription className="text-white/70">
                  Join teams, participate in challenges, and chat in real-time
                  with your learning partners
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-purple-300">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Badges & Points</CardTitle>
                <CardDescription className="text-white/70">
                  Earn badges for achievements and points for completing
                  milestones and challenges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-yellow-300">
                  <Star className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Kudos System</CardTitle>
                <CardDescription className="text-white/70">
                  Give and receive kudos with fun features like "I owe you a
                  beverage" and "Kudo Bomb"
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-pink-300">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Unlockables</CardTitle>
                <CardDescription className="text-white/70">
                  Spend points on profile themes, avatars, skip tokens, and
                  secret campaigns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-orange-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Bloom's Taxonomy</CardTitle>
                <CardDescription className="text-white/70">
                  Progress through 6 levels from Remember to Create, with
                  AI-generated objectives
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Join thousands of learners who are already leveling up with
              Knotable
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/signin">
                  <Github className="mr-2 h-5 w-5" />
                  Sign in with GitHub
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">Sign in with Google</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-4 text-2xl font-bold">Knotable</h3>
            <p className="mb-4 text-white/70">
              Gamified learning platform powered by AI and Bloom's Taxonomy
            </p>
            <div className="flex justify-center space-x-6 text-sm text-white/70">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
