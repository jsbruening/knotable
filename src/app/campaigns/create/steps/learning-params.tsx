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
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";

const BLOOM_LEVELS = [
  {
    value: 1,
    label: "Level 1: Remember",
    description: "Recall facts and basic concepts",
  },
  {
    value: 2,
    label: "Level 2: Understand",
    description: "Explain ideas or concepts",
  },
  {
    value: 3,
    label: "Level 3: Apply",
    description: "Use information in new situations",
  },
  {
    value: 4,
    label: "Level 4: Analyze",
    description: "Draw connections among ideas",
  },
  {
    value: 5,
    label: "Level 5: Evaluate",
    description: "Justify decisions or courses of action",
  },
  {
    value: 6,
    label: "Level 6: Create",
    description: "Produce new or original work",
  },
];

const FOCUS_AREAS = [
  "Fundamentals",
  "Advanced Concepts",
  "Best Practices",
  "Real-world Applications",
  "Performance Optimization",
  "Testing",
  "Debugging",
  "Architecture",
  "Security",
  "Deployment",
  "Maintenance",
  "Documentation",
  "Code Quality",
  "Design Patterns",
];

export function LearningParamsStep() {
  const { campaignData, updateCampaignData, nextStep, previousStep } =
    useCampaignWizardStore();

  const [formData, setFormData] = useState({
    startingBloomLevel: campaignData.startingBloomLevel || 1,
    targetBloomLevel: campaignData.targetBloomLevel || 6,
    focusAreas: campaignData.focusAreas || [],
    estimatedDuration: campaignData.estimatedDuration || "",
    tone: campaignData.tone || "professional",
  });

  // Listen for navigation events from the header
  useEffect(() => {
    const handleNext = () => {
      if (formData.startingBloomLevel > 0 && formData.targetBloomLevel > 0) {
        handleSubmit(new Event("submit") as any);
      }
    };

    window.addEventListener("wizard-next", handleNext);
    return () => window.removeEventListener("wizard-next", handleNext);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCampaignData(formData);
    nextStep();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a: string) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const canProceed =
    formData.startingBloomLevel > 0 && formData.targetBloomLevel > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Learning Parameters</CardTitle>
        <CardDescription className="text-white/80">
          Define the learning progression and focus areas for your campaign.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bloom's Taxonomy Levels */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Starting Bloom Level</Label>
              <Select
                value={formData.startingBloomLevel.toString()}
                onValueChange={(value) =>
                  handleChange("startingBloomLevel", parseInt(value))
                }
              >
                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Select starting level" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOM_LEVELS.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value.toString()}
                    >
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-white/70">
                          {level.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Target Bloom Level</Label>
              <Select
                value={formData.targetBloomLevel.toString()}
                onValueChange={(value) =>
                  handleChange("targetBloomLevel", parseInt(value))
                }
              >
                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Select target level" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOM_LEVELS.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value.toString()}
                    >
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-white/70">
                          {level.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-2">
            <Label className="text-white">Focus Areas</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  className={`rounded-lg p-2 text-sm transition-colors ${formData.focusAreas.includes(area)
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Parameters */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">
                Estimated Duration (days)
              </Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  handleChange("estimatedDuration", e.target.value)
                }
                placeholder="e.g., 7"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleChange("tone", value)}
              >
                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={previousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
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
