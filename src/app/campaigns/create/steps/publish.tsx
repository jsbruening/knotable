"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Check, Globe, Users, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";
import { ConfirmationModal } from "~/components/ui/confirmation-modal";
import { toast } from "sonner";

export function PublishStep() {
  const router = useRouter();
  const { campaignData, generatedContent, previousStep, resetWizard } =
    useCampaignWizardStore();

  const [scope, setScope] = useState<"public" | "team">("public");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const { data: teams } = api.team.getAll.useQuery({ limit: 50 });
  const createDraftMutation = api.campaign.createDraft.useMutation();
  const publishMutation = api.campaign.publish.useMutation();
  const createMilestonesMutation = api.campaign.createMilestones.useMutation();

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      // First create the campaign draft
      const campaign = await createDraftMutation.mutateAsync({
        ...campaignData,
        estimatedDuration: campaignData.estimatedDuration ? Number(campaignData.estimatedDuration) : undefined,
      });

      // Update campaign with final scope
      const updateData: {
        id: string;
        teamId?: string;
        isPublic: boolean;
      } = {
        id: campaign.id,
      };

      if (scope === "team" && selectedTeamId) {
        updateData.teamId = selectedTeamId;
        updateData.isPublic = false;
      } else {
        updateData.isPublic = true;
      }

      await publishMutation.mutateAsync(updateData);

      // Create milestones from generated content
      if (generatedContent?.milestones) {
        await createMilestonesMutation.mutateAsync({
          campaignId: campaign.id,
          milestones: generatedContent.milestones,
        });
      }

      toast.success("Campaign published successfully!");
      resetWizard();
      router.push("/campaigns");
    } catch (error) {
      console.error("Error publishing campaign:", error);
      toast.error("Failed to publish campaign. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish =
    !isPublishing &&
    (scope === "public" || (scope === "team" && selectedTeamId));

  const validatePublish = () => {
    const errors: string[] = [];

    // Validate campaign data
    if (!campaignData.title?.trim()) {
      errors.push("Campaign title is required");
    }
    if (!campaignData.description?.trim()) {
      errors.push("Campaign description is required");
    }
    if (!campaignData.topic?.trim()) {
      errors.push("Campaign topic is required");
    }
    if (
      campaignData.startingBloomLevel < 1 ||
      campaignData.startingBloomLevel > 6
    ) {
      errors.push("Starting Bloom level must be between 1 and 6");
    }
    if (
      campaignData.targetBloomLevel < 1 ||
      campaignData.targetBloomLevel > 6
    ) {
      errors.push("Target Bloom level must be between 1 and 6");
    }
    if (campaignData.startingBloomLevel >= campaignData.targetBloomLevel) {
      errors.push("Target Bloom level must be higher than starting level");
    }

    // Validate generated content
    if (!generatedContent?.milestones?.length) {
      errors.push("No milestones generated. Please generate content first.");
    }

    // Validate scope-specific requirements
    if (scope === "team" && !selectedTeamId) {
      errors.push("Please select a team for team campaigns");
    }

    return errors;
  };

  const handlePublishClick = async () => {
    const validationErrors = validatePublish();

    if (validationErrors.length > 0) {
      toast.error(`Validation failed: ${validationErrors.join(", ")}`);
      return;
    }

    await handlePublish();
  };

  return (
    <div className="space-y-6">
      {/* Campaign Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Check className="mr-2 h-5 w-5" />
            Ready to Publish
          </CardTitle>
          <CardDescription className="text-white/80">
            Your campaign is ready! Choose the visibility scope and publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="text-lg font-semibold text-white">
                {campaignData.title}
              </h3>
              <p className="mt-2 text-white/80">{campaignData.description}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-white/70">
                <span>📚 {campaignData.topic}</span>
                <span>
                  🎯 Level {campaignData.startingBloomLevel} →{" "}
                  {campaignData.targetBloomLevel}
                </span>
                <span>
                  ⏱️ {campaignData.estimatedDuration || "Flexible"} days
                </span>
                <span>
                  📋 {generatedContent?.milestones?.length || 0} milestones
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Campaign Scope</CardTitle>
          <CardDescription className="text-white/80">
            Choose who can access this campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setScope("public")}
                className={`rounded-lg border p-4 transition-colors ${scope === "public"
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-white" />
                  <div className="text-left">
                    <h4 className="font-medium text-white">Public Campaign</h4>
                    <p className="text-sm text-white/80">
                      Available to all users
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope("team")}
                className={`rounded-lg border p-4 transition-colors ${scope === "team"
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-white" />
                  <div className="text-left">
                    <h4 className="font-medium text-white">Team Campaign</h4>
                    <p className="text-sm text-white/80">
                      Private to selected team
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {scope === "team" && (
              <div className="space-y-2">
                <Label className="text-white">Select Team</Label>
                <Select
                  value={selectedTeamId}
                  onValueChange={setSelectedTeamId}
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publish Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={previousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handlePublishClick}
          disabled={!canPublish}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Publish Campaign
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        title="Publish Campaign"
        description={`Are you ready to publish "${campaignData.title}"? This will make it available to ${scope === "public" ? "all users" : "the selected team"}.`}
        confirmText="Publish"
        cancelText="Cancel"
        variant="default"
        isLoading={isPublishing}
      />
    </div>
  );
}
