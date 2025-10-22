"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Play,
  BookOpen,
  ExternalLink,
  Video,
  FileText,
  Code,
  Trophy,
} from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { LevelPill } from "~/components/ui/pills";
import { toast } from "sonner";

// Resource type detection
function getResourceType(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
    return "video";
  }
  if (url.includes("github.com") || url.includes("codepen.io") || url.includes("jsfiddle.net")) {
    return "code";
  }
  if (url.includes(".pdf") || url.includes("docs.") || url.includes("documentation")) {
    return "document";
  }
  return "article";
}

function getResourceIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "code":
      return <Code className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

// Derive a readable title from a URL (hostname + cleaned last path segment)
function getReadableResourceTitle(urlString: string): { title: string; subtitle?: string } {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || hostname;
    const cleaned = decodeURIComponent(last)
      .replace(/[-_]+/g, " ")
      .replace(/\.[a-z0-9]+$/i, "")
      .trim();
    const title = cleaned
      ? cleaned
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ")
      : hostname;
    return { title, subtitle: hostname };
  } catch {
    return { title: urlString };
  }
}

export default function LearningSessionPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const milestoneId = params.milestoneId as string;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const hasStartedRef = useRef(false);

  // Start learning session
  const startSessionMutation = api.campaign.startLearningSession.useMutation({
    onSuccess: (session) => {
      setSessionId(session.id);
      if (session.isNewEnrollment) {
        toast.success("Welcome to the campaign! Learning session started!");
      } else {
        toast.success("Learning session started!");
      }
    },
    onError: (error) => {
      // Redirect unauthenticated users to sign-in
      // @ts-expect-error tRPC error shape at runtime
      const code = error?.data?.code as string | undefined;
      if (code === "UNAUTHORIZED") {
        const callback = encodeURIComponent(`/campaigns/${campaignId}/learn/${milestoneId}`);
        router.push(`/auth/signin?callbackUrl=${callback}`);
        return;
      }
      toast.error(error.message || "Failed to start learning session");
    },
  });

  // Update session progress
  const updateSessionMutation = api.campaign.updateLearningSession.useMutation({
    onSuccess: () => {
      toast.success("Progress saved!");
    },
  });

  // Complete session
  const completeSessionMutation = api.campaign.completeLearningSession.useMutation({
    onSuccess: () => {
      toast.success("🎉 Milestone completed! Great job!");
      router.push(`/campaigns/${campaignId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const utils = api.useUtils();
  const refreshResourcesMutation = api.campaign.refreshResources.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      if (sessionId) {
        utils.campaign.getLearningSession.invalidate({ sessionId });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get session data
  const { data: session, isLoading } = api.campaign.getLearningSession.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  // Start session on component mount (guarded for dev double-invoke and param readiness)
  useEffect(() => {
    if (!campaignId || !milestoneId) return;
    if (sessionId) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startSessionMutation.mutate({ campaignId, milestoneId });
  }, [campaignId, milestoneId, sessionId, startSessionMutation]);

  // Track time spent
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);

      // Update session every 5 minutes
      if ((timeSpent + 1) % 5 === 0) {
        updateSessionMutation.mutate({
          sessionId,
          timeSpent: timeSpent + 1,
          completedResources,
        });
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessionId, timeSpent, completedResources]);

  const handleResourceComplete = (resourceUrl: string) => {
    const newCompleted = [...completedResources];
    if (!newCompleted.includes(resourceUrl)) {
      newCompleted.push(resourceUrl);
      setCompletedResources(newCompleted);

      updateSessionMutation.mutate({
        sessionId: sessionId!,
        completedResources: newCompleted,
        progress: (newCompleted.length / (session?.milestone.externalResources.length || 1)) * 100,
      });
    }
  };

  const handleCompleteSession = () => {
    if (sessionId) {
      completeSessionMutation.mutate({ sessionId });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  const { milestone, campaign } = session;
  
  // Hybrid approach: Combine milestone resources + lesson resources
  const milestoneResources = milestone.resources || [];
  const lessonResources = milestone.lessons?.flatMap(lesson => lesson.resources || []) || [];
  const allResources = [...milestoneResources, ...lessonResources];
  
  // Fallback to externalResources if no validated resources exist
  const resources = allResources.length > 0 
    ? allResources 
    : milestone.externalResources.map(url => ({ url, title: url, type: "article", isAlive: true }));
  
  const progressPercentage = (completedResources.length / resources.length) * 100;

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/campaigns/${campaignId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeSpent)}
            </Badge>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {milestone.title}
              </h1>
              <p className="text-white/80 text-lg mb-4">
                {milestone.objective}
              </p>
              <div className="flex items-center gap-4">
                <LevelPill level={milestone.bloomLevel} />
                <Badge variant="outline" className="text-white border-white/20">
                  {campaign.title}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshResourcesMutation.mutate({ milestoneId })}
                  disabled={refreshResourcesMutation.isPending}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {refreshResourcesMutation.isPending ? "Discovering..." : "Discover Resources"}
                </Button>
              </div>
              <Progress value={progressPercentage} className="w-48 mb-2" />
              <div className="text-white text-sm">
                {completedResources.length} / {resources.length} resources
              </div>
            </div>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="grid gap-6">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Resources
              </CardTitle>
              <CardDescription className="text-white/70">
                Work through these resources to master this milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {resources.map((resource, index) => {
                  const resourceUrl = typeof resource === 'string' ? resource : resource.url;
                  const resourceType = typeof resource === 'string' ? getResourceType(resource) : resource.type;
                  const isCompleted = completedResources.includes(resourceUrl);
                  const readable = typeof resource === 'string'
                    ? getReadableResourceTitle(resource)
                    : { title: resource.title, subtitle: resource.provider };

                  const isDead = typeof resource === 'object' && !resource.isAlive;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${isCompleted
                        ? "bg-green-500/20 border-green-500/50"
                        : isDead
                          ? "bg-red-500/10 border-red-500/30 opacity-60"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-white/60">
                            {getResourceIcon(resourceType)}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {readable.title}
                              {isDead && (
                                <span className="ml-2 text-red-400 text-xs">
                                  (Dead Link)
                                </span>
                              )}
                            </div>
                            <div className="text-white/60 text-xs">
                              {readable.subtitle || (resourceType.charAt(0).toUpperCase() + resourceType.slice(1))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResourceComplete(resourceUrl)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Complete
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            disabled={isDead}
                            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {isDead ? "Dead Link" : "Open"}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sub-milestones */}
          {milestone.subMilestones.length > 0 && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Sub-milestones</CardTitle>
                <CardDescription className="text-white/70">
                  Break down this milestone into smaller steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {milestone.subMilestones.map((subMilestone, index) => (
                    <div
                      key={subMilestone.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="text-white font-medium">
                        {subMilestone.title}
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {subMilestone.objective}
                      </div>
                      {subMilestone.estimatedTime && (
                        <div className="text-white/50 text-xs mt-2">
                          Estimated: {subMilestone.estimatedTime}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Session */}
          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium mb-1">
                    Ready to complete this milestone?
                  </div>
                  <div className="text-white/60 text-sm">
                    You've spent {formatTime(timeSpent)} learning this milestone
                  </div>
                </div>

                <Button
                  onClick={handleCompleteSession}
                  disabled={completeSessionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Milestone
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
