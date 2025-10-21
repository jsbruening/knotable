"use client";

import { useState, useEffect } from "react";
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
import { Users, Clock, Target, BookOpen } from "lucide-react";
import { api } from "~/trpc/react";

interface JoinCampaignsProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  data: any;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function JoinCampaigns({
  onNext,
  onPrevious,
  data,
}: JoinCampaignsProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(
    data.selectedCampaigns || [],
  );

  const { data: campaigns, isLoading } = api.campaign.getAll.useQuery({
    limit: 20,
  });

  const joinCampaignMutation = api.campaign.join.useMutation();

  const handleCampaignToggle = async (campaignId: string) => {
    if (selectedCampaigns.includes(campaignId)) {
      // Remove from selection
      setSelectedCampaigns((prev) => prev.filter((id) => id !== campaignId));
    } else {
      // Add to selection and join
      try {
        await joinCampaignMutation.mutateAsync({ campaignId });
        setSelectedCampaigns((prev) => [...prev, campaignId]);
      } catch (error) {
        console.error("Failed to join campaign:", error);
      }
    }
  };

  const handleContinue = () => {
    onNext({ selectedCampaigns });
  };

  const handleSkip = () => {
    onNext({ selectedCampaigns: [] });
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-600">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold">Join Learning Campaigns</h3>
        <p className="text-gray-600">
          Choose campaigns that interest you. You can join more later from your
          dashboard.
        </p>
      </div>

      {campaigns?.campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">
              No campaigns available
            </h3>
            <p className="mb-4 text-gray-600">
              There are no public campaigns available right now. Check back
              later!
            </p>
            <Button onClick={handleSkip} variant="outline">
              Skip for now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {campaigns?.campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className={`cursor-pointer transition-all ${
                selectedCampaigns.includes(campaign.id)
                  ? "bg-blue-50 ring-2 ring-blue-500"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleCampaignToggle(campaign.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.description}
                    </CardDescription>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedCampaigns.includes(campaign.id)
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedCampaigns.includes(campaign.id)
                        ? "Joined"
                        : "Join"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{campaign._count.users} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>
                      Level {campaign.startingBloomLevel} →{" "}
                      {campaign.targetBloomLevel}
                    </span>
                  </div>
                  {campaign.estimatedDuration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{campaign.estimatedDuration} days</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={campaign.createdBy.avatarUrl || undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {campaign.createdBy.displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    Created by {campaign.createdBy.displayName || "Unknown"}
                  </span>
                </div>

                {campaign.focusAreas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {campaign.focusAreas.slice(0, 3).map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {campaign.focusAreas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{campaign.focusAreas.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          Back
        </Button>
        <div className="space-x-2">
          <Button onClick={handleSkip} variant="outline">
            Skip
          </Button>
          <Button onClick={handleContinue}>
            Continue ({selectedCampaigns.length} selected)
          </Button>
        </div>
      </div>
    </div>
  );
}
