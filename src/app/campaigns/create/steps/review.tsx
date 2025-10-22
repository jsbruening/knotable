"use client";

import { useState } from "react";
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
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, ArrowRight, Edit3, Trash2 } from "lucide-react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";

export function ReviewStep() {
  const {
    campaignData,
    generatedContent,
    setGeneratedContent,
    nextStep,
    previousStep,
  } = useCampaignWizardStore();

  const [milestones, setMilestones] = useState(
    generatedContent?.milestones || [],
  );
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);

  const handleMilestoneEdit = (
    index: number,
    field: string,
    value: string | string[],
  ) => {
    const updatedMilestones = milestones.map((milestone: any, i: number) =>
      i === index ? { ...milestone, [field]: value } : milestone,
    );
    setMilestones(updatedMilestones);

    // Update the store with the modified content
    setGeneratedContent({
      ...generatedContent,
      milestones: updatedMilestones,
    });
  };

  const handleMilestoneDelete = (index: number) => {
    const updatedMilestones = milestones.filter(
      (_: any, i: number) => i !== index,
    );
    setMilestones(updatedMilestones);

    // Update the store with the modified content
    setGeneratedContent({
      ...generatedContent,
      milestones: updatedMilestones,
    });
  };

  const handleSubmit = () => {
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Campaign Summary</CardTitle>
          <CardDescription className="text-white/80">
            Review your campaign details before publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-white">Title</Label>
                <p className="text-white/80">{campaignData.title}</p>
              </div>
              <div>
                <Label className="font-medium text-white">Topic</Label>
                <p className="text-white/80">{campaignData.topic}</p>
              </div>
              <div>
                <Label className="font-medium text-white">
                  Target Audience
                </Label>
                <p className="text-white/80">
                  {campaignData.targetAudience || "General learners"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-white">Bloom Levels</Label>
                <p className="text-white/80">
                  Level {campaignData.startingBloomLevel} → Level{" "}
                  {campaignData.targetBloomLevel}
                </p>
              </div>
              <div>
                <Label className="font-medium text-white">Focus Areas</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {campaignData.focusAreas?.map((area: string) => (
                    <Badge key={area} variant="glass" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-medium text-white">Duration</Label>
                <p className="text-white/80">
                  {campaignData.estimatedDuration || "Not specified"} days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Learning Milestones</CardTitle>
          <CardDescription className="text-white/80">
            Review and edit the AI-generated milestones. You can modify titles,
            objectives, and resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone: any, index: number) => (
              <div
                key={index}
                className="rounded-lg border border-white/20 bg-white/10 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="glass" className="text-xs">
                      Level {milestone.bloomLevel}
                    </Badge>
                    <span className="text-sm text-white/70">
                      Milestone {index + 1}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingMilestone(
                          editingMilestone === index ? null : index,
                        )
                      }
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMilestoneDelete(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {editingMilestone === index ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-white">Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) =>
                          handleMilestoneEdit(index, "title", e.target.value)
                        }
                        className="border-white/20 bg-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white">Objective</Label>
                      <Textarea
                        value={milestone.objective}
                        onChange={(e) =>
                          handleMilestoneEdit(
                            index,
                            "objective",
                            e.target.value,
                          )
                        }
                        className="min-h-[60px] border-white/20 bg-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white">
                        Resources (one per line)
                      </Label>
                      <Textarea
                        value={milestone.resources?.join("\n") || ""}
                        onChange={(e) =>
                          handleMilestoneEdit(
                            index,
                            "resources",
                            e.target.value.split("\n"),
                          )
                        }
                        className="min-h-[80px] border-white/20 bg-white/10 text-white"
                        placeholder="https://example.com/resource1&#10;https://youtube.com/watch?v=example"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-white">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-white/80">
                        {milestone.objective}
                      </p>
                      {milestone.resources &&
                        milestone.resources.length > 0 && (
                          <div>
                            <Label className="text-sm text-white">
                              Resources:
                            </Label>
                            <ul className="mt-1 space-y-1 text-sm text-white/70">
                              {milestone.resources.map(
                                (resource: string, i: number) => (
                                  <li key={i} className="break-all">
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
                    </div>

                    {/* Lessons */}
                    {milestone.lessons &&
                      milestone.lessons.length > 0 && (
                        <div className="ml-4 border-l-2 border-white/20 pl-4">
                          <Label className="text-sm font-medium text-white">
                            Lessons:
                          </Label>
                          <div className="mt-2 space-y-3">
                            {milestone.lessons.map(
                              (lesson: any, lessonIndex: number) => (
                                <div
                                  key={lessonIndex}
                                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                                >
                                  <div className="mb-2 flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="glassBlue"
                                        className="text-xs"
                                      >
                                        Lesson {lessonIndex + 1}
                                      </Badge>
                                      {lesson.estimatedTime && (
                                        <Badge
                                          variant="glassYellow"
                                          className="text-xs"
                                        >
                                          {lesson.estimatedTime}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <h5 className="mb-1 text-sm font-medium text-white">
                                    {lesson.title}
                                  </h5>
                                  <p className="mb-2 text-xs text-white/70">
                                    {lesson.objective}
                                  </p>

                                  {lesson.resources &&
                                    lesson.resources.length > 0 && (
                                      <div>
                                        <Label className="text-xs text-white">
                                          Resources:
                                        </Label>
                                        <ul className="mt-1 space-y-1 text-xs text-white/60">
                                          {lesson.resources.map(
                                            (resource: string, i: number) => (
                                              <li key={i} className="break-all">
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

                                  {lesson.assessmentQuestions &&
                                    lesson.assessmentQuestions.length >
                                      0 && (
                                      <div className="mt-2">
                                        <Label className="text-xs text-white">
                                          Quiz Questions:
                                        </Label>
                                        <div className="mt-1 text-xs text-white/60">
                                          {
                                            lesson.assessmentQuestions
                                              .length
                                          }{" "}
                                          question
                                          {lesson.assessmentQuestions
                                            .length !== 1
                                            ? "s"
                                            : ""}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={previousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleSubmit}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
