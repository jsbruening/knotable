"use client";

import { useState } from "react";
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
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import {
  ArrowLeft,
  Users,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { LevelPill } from "~/components/ui/pills";
import { ConfirmationModal } from "~/components/ui/confirmation-modal";
import { toast } from "sonner";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: campaign, isLoading } = api.campaign.getById.useQuery({
    id: campaignId,
  });
  const joinCampaignMutation = api.campaign.join.useMutation();
  const deleteCampaignMutation = api.campaign.delete.useMutation();

  const handleJoinCampaign = async () => {
    try {
      await joinCampaignMutation.mutateAsync({ campaignId });
      toast.success("Successfully joined the campaign!");
      // TODO: Show success message
    } catch (error) {
      console.error("Failed to join campaign:", error);
      toast.error("Failed to join campaign. Please try again.");
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaignMutation.mutateAsync({ id: campaignId });
      toast.success("Campaign deleted successfully");
      router.push("/campaigns");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-app-gradient flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="bg-app-gradient flex min-h-screen items-center justify-center">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Campaign Not Found</CardTitle>
            <CardDescription className="text-white/80">
              This campaign doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/campaigns">Back to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage =
    campaign.milestones.length > 0
      ? (campaign.milestones.filter(
          (m) => m.bloomLevel <= campaign.targetBloomLevel,
        ).length /
          campaign.milestones.length) *
        100
      : 0;

  return (
    <div className="bg-app-gradient min-h-screen">
      {/* Header */}
      <header className="bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/campaigns">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Campaigns
                </Link>
              </Button>
              <img
                src="/images/logo.png"
                alt="Knotable logo"
                className="h-6 w-6"
              />
              <h1 className="text-2xl font-bold text-white">
                {campaign.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={handleJoinCampaign}
                disabled={joinCampaignMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {joinCampaignMutation.isPending
                  ? "Joining..."
                  : "Join Campaign"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Campaign Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                {campaign.title}
              </CardTitle>
              <CardDescription className="text-lg text-white/80">
                {campaign.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-white">
                    {campaign._count.users}
                  </div>
                  <div className="text-sm text-white/80">Members</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-white">
                    {campaign.milestones.length}
                  </div>
                  <div className="text-sm text-white/80">Milestones</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-white">
                    Level {campaign.startingBloomLevel} →{" "}
                    {campaign.targetBloomLevel}
                  </div>
                  <div className="text-sm text-white/80">Bloom Levels</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-white">
                    {campaign.estimatedDuration || "Flexible"}
                  </div>
                  <div className="text-sm text-white/80">Days</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-white">
                    Learning Path
                  </h3>
                  <Progress value={progressPercentage} className="mb-2" />
                  <p className="text-sm text-white/80">
                    Progress from Level {campaign.startingBloomLevel} to Level{" "}
                    {campaign.targetBloomLevel}
                  </p>
                </div>

                {campaign.focusAreas.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold text-white">
                      Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {campaign.focusAreas.map((area, index) => (
                        <Badge key={index} variant="glass" className="text-sm">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{campaign._count.users} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{campaign.milestones.length} milestones</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{campaign.estimatedDuration || "Flexible"} days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <div className="space-y-6">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Learning Milestones
            </h2>

            {campaign.milestones.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-16 w-16 text-white/50" />
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    No Milestones Yet
                  </h3>
                  <p className="text-white/80">
                    This campaign is still being developed. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {campaign.milestones.map((milestone, index) => (
                  <Card key={milestone.id} className="p-6">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-xl text-white">
                              {milestone.title}
                            </CardTitle>
                            <div className="mt-1 flex items-center space-x-2">
                              <LevelPill
                                level={
                                  milestone.bloomLevel as 1 | 2 | 3 | 4 | 5 | 6
                                }
                              />
                              <Badge variant="glass" className="text-xs">
                                Milestone {index + 1}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-sm text-white/80">
                            Available
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-semibold text-white">
                            Learning Objective
                          </h4>
                          <p className="text-white/80">{milestone.objective}</p>
                        </div>

                        {milestone.resources &&
                          milestone.resources.length > 0 && (
                            <div>
                              <h4 className="mb-2 font-semibold text-white">
                                Resources
                              </h4>
                              <div className="space-y-2">
                                {milestone.resources.map((resource, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-2"
                                  >
                                    <BookOpen className="h-4 w-4 text-white/60" />
                                    <a
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm break-all text-blue-300 underline hover:text-blue-200"
                                    >
                                      {resource}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Sub-milestones */}
                        {milestone.subMilestones &&
                          milestone.subMilestones.length > 0 && (
                            <div>
                              <h4 className="mb-3 font-semibold text-white">
                                Sub-milestones
                              </h4>
                              <div className="space-y-3">
                                {milestone.subMilestones.map(
                                  (subMilestone, subIndex) => (
                                    <div
                                      key={subMilestone.id}
                                      className="rounded-lg border border-white/10 bg-white/5 p-4"
                                    >
                                      <div className="mb-2 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="glassBlue"
                                            className="text-xs"
                                          >
                                            Sub-milestone {subIndex + 1}
                                          </Badge>
                                          {subMilestone.estimatedTime && (
                                            <Badge
                                              variant="glassYellow"
                                              className="text-xs"
                                            >
                                              {subMilestone.estimatedTime}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      <h5 className="mb-1 text-sm font-medium text-white">
                                        {subMilestone.title}
                                      </h5>
                                      <p className="mb-2 text-xs text-white/70">
                                        {subMilestone.objective}
                                      </p>

                                      {subMilestone.resources &&
                                        subMilestone.resources.length > 0 && (
                                          <div className="mb-2">
                                            <Label className="text-xs text-white">
                                              Resources:
                                            </Label>
                                            <ul className="mt-1 space-y-1 text-xs text-white/60">
                                              {subMilestone.resources.map(
                                                (resource, i) => (
                                                  <li
                                                    key={i}
                                                    className="break-all"
                                                  >
                                                    <a
                                                      href={resource}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="underline hover:text-white"
                                                    >
                                                      {resource}
                                                    </a>
                                                  </li>
                                                ),
                                              )}
                                            </ul>
                                          </div>
                                        )}

                                      {subMilestone.assessmentQuestions &&
                                        subMilestone.assessmentQuestions
                                          .length > 0 && (
                                          <div>
                                            <Label className="text-xs text-white">
                                              Assessment Questions:
                                            </Label>
                                            <div className="mt-1 space-y-2">
                                              {subMilestone.assessmentQuestions.map(
                                                (question, qIndex) => (
                                                  <div
                                                    key={qIndex}
                                                    className="rounded bg-white/5 p-2 text-xs"
                                                  >
                                                    <p className="mb-1 text-white/80">
                                                      {question.question}
                                                    </p>
                                                    <div className="text-white/60">
                                                      Options:{" "}
                                                      {question.options?.join(
                                                        ", ",
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Assessment Questions for the main milestone */}
                        {milestone.assessmentQuestions &&
                          milestone.assessmentQuestions.length > 0 && (
                            <div>
                              <h4 className="mb-3 font-semibold text-white">
                                Assessment Questions
                              </h4>
                              <div className="space-y-3">
                                {milestone.assessmentQuestions.map(
                                  (question, qIndex) => (
                                    <div
                                      key={qIndex}
                                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                                    >
                                      <p className="mb-2 text-sm font-medium text-white">
                                        {question.question}
                                      </p>
                                      <div className="space-y-1">
                                        {question.options?.map(
                                          (option, oIndex) => (
                                            <div
                                              key={oIndex}
                                              className="flex items-center space-x-2"
                                            >
                                              <span className="text-xs text-white/60">
                                                {String.fromCharCode(
                                                  65 + oIndex,
                                                )}
                                                .
                                              </span>
                                              <span className="text-xs text-white/80">
                                                {option}
                                              </span>
                                              {question.correctAnswer ===
                                                String.fromCharCode(
                                                  65 + oIndex,
                                                ) && (
                                                <Badge
                                                  variant="glassGreen"
                                                  className="text-xs"
                                                >
                                                  Correct
                                                </Badge>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      {question.explanation && (
                                        <p className="mt-2 text-xs text-white/60 italic">
                                          {question.explanation}
                                        </p>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteCampaignMutation.isPending}
      />
    </div>
  );
}
