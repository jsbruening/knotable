"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";

export function BasicInfoStep() {
  const { campaignData, updateCampaignData, nextStep } =
    useCampaignWizardStore();

  const [formData, setFormData] = useState({
    title: campaignData.title || "",
    description: campaignData.description || "",
    topic: campaignData.topic || "",
    targetAudience: campaignData.targetAudience || "",
  });

  // Listen for navigation events from the header
  useEffect(() => {
    const handleNext = () => {
      if (formData.title && formData.description && formData.topic) {
        handleSubmit(new Event("submit") as any);
      }
    };

    window.addEventListener("wizard-next", handleNext);
    return () => window.removeEventListener("wizard-next", handleNext);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.topic) {
      updateCampaignData(formData);
      nextStep();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = formData.title && formData.description && formData.topic;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Campaign Basic Information</CardTitle>
        <CardDescription className="text-white/80">
          Provide the essential details for your learning campaign.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Campaign Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Master React Development"
              className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what learners will achieve in this campaign..."
              className="min-h-[100px] border-white/20 bg-white/10 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="text-white">
              Main Topic *
            </Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              placeholder="e.g., React, Python, Data Science, Web Development"
              className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-white">
              Target Audience
            </Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => handleChange("targetAudience", e.target.value)}
              placeholder="e.g., Beginners, Intermediate developers, Students"
              className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end">
            <Button type="submit" disabled={!canProceed}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
