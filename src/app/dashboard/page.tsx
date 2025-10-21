"use client";

import { useAuth } from "~/components/auth/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Trophy, Star, Users, Target, Zap, LogOut } from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { ProgressCircle } from "~/components/ui/progress-circle";
import { LevelPill, StatusPill } from "~/components/ui/pills";
import MilestoneCard from "~/components/ui/milestone-card";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [loading, user, router]);

  const { data: userStats, isLoading: statsLoading } =
    api.gamification.getUserStats.useQuery();
  const { data: userCampaigns, isLoading: campaignsLoading } =
    api.campaign.getUserCampaigns.useQuery();
  const { data: userTeams, isLoading: teamsLoading } =
    api.team.getUserTeams.useQuery();
  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  if (!user) {
    // Show a lightweight placeholder while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-app-gradient min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold text-white">
              {`Welcome back${currentUser?.displayName ? ", " + currentUser.displayName : user.user_metadata?.full_name ? ", " + user.user_metadata.full_name : user.email ? ", " + user.email : ""}!`}
            </h2>
            <p className="text-white/80">
              Ready to continue your learning journey?
            </p>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-600 p-2">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {statsLoading ? "..." : userStats?.totalPoints || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-600 p-2">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {statsLoading ? "..." : userStats?.totalKudos || 0}
                    </div>
                    <div className="text-sm text-green-700">Kudos Received</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-600 p-2">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {statsLoading ? "..." : userStats?.badges?.length || 0}
                    </div>
                    <div className="text-sm text-purple-700">Badges Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-orange-600 p-2">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-900">
                      {statsLoading ? "..." : userStats?.loginStreak || 0}
                    </div>
                    <div className="text-sm text-orange-700">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Journey Ladder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Your Journey</span>
                  <ProgressCircle value={67} size={56} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <div key={lvl} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80">
                        {lvl}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <LevelPill level={lvl as 1 | 2 | 3 | 4 | 5 | 6} />
                          {lvl < 3 ? (
                            <StatusPill status="Completed" />
                          ) : lvl === 3 ? (
                            <StatusPill status="In Progress" />
                          ) : (
                            <StatusPill status="Locked" />
                          )}
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded bg-white/10">
                          <div
                            className="h-2 bg-white/30"
                            style={{
                              width: `${lvl <= 3 ? (lvl === 3 ? 60 : 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Milestones (right column) */}
            <div className="space-y-4">
              <MilestoneCard
                level={1}
                status="Completed"
                quizPercent={95}
                points={100}
                title="React Fundamentals Review"
                description="Understand core React concepts including components, props, state, and lifecycle methods"
              />
              <MilestoneCard
                level={2}
                status="Completed"
                quizPercent={88}
                points={120}
                title="Component Composition Patterns"
                description="Learn to compose components effectively using props and children patterns"
              />
              <MilestoneCard
                level={3}
                status="In Progress"
                quizPercent={92}
                points={150}
                title="Higher-Order Components"
                description="Apply HOC pattern to add reusable functionality to components"
              />
              <MilestoneCard
                level={3}
                status="In Progress"
                points={150}
                title="Render Props Pattern"
                description="Use render props to share code between components"
              />
              <MilestoneCard
                level={4}
                status="Locked"
                points={180}
                title="Compound Components"
                description="Analyze and implement compound component patterns for flexible APIs"
              />
              <MilestoneCard
                level={5}
                status="Locked"
                points={200}
                title="Custom Hooks Architecture"
                description="Design and evaluate custom hooks for complex state management"
              />
            </div>

            {/* Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5" />
                  <span>My Teams</span>
                </CardTitle>
                <CardDescription className="text-white/80">
                  Collaborate with your teammates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="py-4 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                ) : userTeams?.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      No teams yet
                    </h3>
                    <p className="mb-4 text-white/80">
                      Join or create a team to collaborate!
                    </p>
                    <Button asChild>
                      <Link href="/teams">Browse Teams</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userTeams?.slice(0, 3).map((userTeam) => (
                      <div
                        key={userTeam.id}
                        className="rounded-lg border border-white/20 p-3 hover:bg-white/10"
                      >
                        <h4 className="font-semibold text-white">
                          {userTeam.team.name}
                        </h4>
                        <p className="mb-2 text-sm text-white/80">
                          {userTeam.team.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <Badge
                            variant={
                              userTeam.role === "admin" ? "default" : "glass"
                            }
                          >
                            {userTeam.role}
                          </Badge>
                          <span className="text-white/70">
                            {userTeam.team._count.members} members
                          </span>
                        </div>
                      </div>
                    ))}
                    {userTeams && userTeams.length > 3 && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/teams">View All Teams</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
