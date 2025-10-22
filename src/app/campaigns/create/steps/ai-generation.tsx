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
import { Textarea } from "~/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  RotateCcw,
  Edit3,
  FileText,
  Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";
import { toast } from "sonner";
import { ProgressiveLoading } from "~/components/ui/progressive-loading";
import { PromptEditorModal } from "~/components/ui/prompt-editor-modal";

const LEARNING_STYLES = [
  "Visual",
  "Auditory",
  "Kinesthetic",
  "Reading/Writing",
  "Mixed",
];

const DIFFICULTY_LEVELS = [
  "Beginner-friendly",
  "Intermediate",
  "Advanced",
  "Balanced",
];

const CONTENT_FORMATS = [
  "Step-by-step tutorials",
  "Project-based",
  "Theory-heavy",
  "Hands-on labs",
  "Mixed",
];

const TIME_COMMITMENTS = [
  "1-2 hours/week",
  "3-5 hours/week",
  "5-10 hours/week",
  "Flexible",
];

export function AIGenerationStep() {
  const {
    campaignData,
    aiParams,
    generatedContent,
    isGenerating,
    showPrompt,
    aiPrompt,
    generationProgress,
    updateAIParams,
    setGeneratedContent,
    setIsGenerating,
    setShowPrompt,
    setAIPrompt,
    setGenerationProgress,
    resetGenerationProgress,
    nextStep,
    previousStep,
  } = useCampaignWizardStore();

  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const generateContentMutation = api.campaign.generateContent.useMutation();
  const saveDraftMutation = api.campaign.saveDraft.useMutation();

  // Build the AI prompt for preview
  const buildPrompt = () => {
    const levelNames = [
      "",
      "Remember",
      "Understand",
      "Apply",
      "Analyze",
      "Evaluate",
      "Create",
    ];
    return `
You are an expert educational content creator specializing in Bloom's Taxonomy. Create a comprehensive learning campaign.

CAMPAIGN DETAILS:
- Title: "${campaignData.title}"
- Topic: ${campaignData.topic}
- Description: ${campaignData.description}
- Target Audience: ${campaignData.targetAudience || "General learners"}
- Starting Bloom Level: ${campaignData.startingBloomLevel} (${levelNames[campaignData.startingBloomLevel]})
- Target Bloom Level: ${campaignData.targetBloomLevel} (${levelNames[campaignData.targetBloomLevel]})
- Focus Areas: ${campaignData.focusAreas?.join(", ") || "None specified"}
- Estimated Duration: ${campaignData.estimatedDuration || "Not specified"} days
- Tone: ${campaignData.tone || "Professional"}

LEARNING PARAMETERS:
- Learning Style: ${aiParams.learningStyle || "Mixed"}
- Difficulty Preference: ${aiParams.difficultyPreference || "Balanced"}
- Content Format: ${aiParams.contentFormat || "Mixed"}
- Time Commitment: ${aiParams.timeCommitment || "Flexible"}
- Prerequisites: ${aiParams.prerequisites || "Working knowledge of HTML, CSS, and modern JavaScript (including basic ES6+ features like arrow functions and let/const)"}

ADVANCED CONFIGURATION:
- Resource Types: ${aiParams.resourceTypes || "Mixed formats"}
- Final Learning Outcome: ${aiParams.finalLearningOutcome || "Comprehensive understanding"}
- Question Format: ${aiParams.questionFormat || "Multiple choice"}

${campaignData.topic.toLowerCase().includes('react') || campaignData.topic.toLowerCase().includes('javascript') || campaignData.topic.toLowerCase().includes('programming') || campaignData.topic.toLowerCase().includes('web development') || campaignData.topic.toLowerCase().includes('frontend') || campaignData.topic.toLowerCase().includes('coding') ? `CODE STANDARDS:
- Syntax: All explanations and examples must exclusively use modern Functional Components and Hooks syntax
- Language: Use modern JavaScript (ES6+) for all code, defaulting to JSX
- TypeScript: If TypeScript is used, it should be introduced as a separate, clearly marked lesson/topic
- Prohibited: Class components and deprecated lifecycles are strictly forbidden` : ''}

DOMAIN STANDARDS:
- Use current, industry-standard practices for the specified topic
- Avoid outdated or deprecated methods/approaches
- Prioritize official documentation and authoritative sources
- Ensure all content reflects modern best practices

STRUCTURE REQUIREMENTS:
- Each milestone must contain 2-5 detailed lessons
- Use whole hour increments for time estimates (e.g., "1-2 hours", "3-4 hours")
- Progress sequentially through Bloom levels ${campaignData.startingBloomLevel} to ${campaignData.targetBloomLevel}
- Each milestone must strictly correspond to one Bloom's Taxonomy level

IMPORTANT:
- Use real, high-quality educational resources when possible
- Make objectives specific and measurable
- Ensure questions test the appropriate Bloom level
- Keep the JSON structure exactly as specified
- Make content engaging and practical
- Each milestone should build on the previous one

RESOURCE GUIDANCE:
- Prioritize official documentation and industry leaders
- If specific links are unavailable, use placeholder URLs with clear descriptions
- Mix documentation, videos, tutorials, and interactive content
- Focus on authoritative sources and current materials

FINAL OUTCOME GUIDANCE:
- Culminate in a production-ready deployed application
- Include testing, performance optimization, and documentation

Return ONLY a valid JSON object with this exact structure:
{
  "milestones": [
    {
      "bloomLevel": 1,
      "title": "Milestone title",
      "objective": "Clear learning objective",
      "resources": [
        "https://real-official-docs-url.com",
        "https://real-tutorial-url.com",
        "https://real-video-url.com"
      ],
      "estimatedTime": "X-Y hours",
      "lessons": [
        {
          "title": "Specific lesson title",
          "objective": "Clear learning objective for this lesson",
          "resources": [
            "https://real-resource-url.com",
            "https://real-tutorial-url.com"
          ],
          "estimatedTime": "1-2 hours",
          "assessmentQuestions": [
            {
              "question": "Context-specific question for this lesson",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "A",
              "explanation": "Detailed explanation of why this answer is correct"
            }
          ]
        }
      ],
      "assessmentQuestions": [
        {
          "question": "Context-specific question that tests this Bloom level",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "A",
          "explanation": "Detailed explanation of why this answer is correct"
        }
      ]
    }
  ]
}

TASK:
Create a comprehensive learning campaign with exactly ${campaignData.targetBloomLevel - campaignData.startingBloomLevel + 1} milestones. Each milestone must strictly correspond to one Bloom's Taxonomy level, progressing sequentially from Level ${campaignData.startingBloomLevel} (${levelNames[campaignData.startingBloomLevel]}) to Level ${campaignData.targetBloomLevel} (${levelNames[campaignData.targetBloomLevel]}).`;
  };

  // Initialize the prompt when component loads
  useEffect(() => {
    console.log("useEffect triggered:", { aiPrompt, campaignData, aiParams });
    if (!aiPrompt) {
      const prompt = buildPrompt();
      console.log("Generated prompt:", prompt);
      setAIPrompt(prompt);
    }
  }, [campaignData, aiParams, setAIPrompt, buildPrompt]);

  // Listen for navigation events from the header
  useEffect(() => {
    const handleNext = () => {
      if (!isGenerating && generatedContent) {
        nextStep();
      }
    };

    window.addEventListener("wizard-next", handleNext);
    return () => window.removeEventListener("wizard-next", handleNext);
  }, [isGenerating, generatedContent, nextStep]);


  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      resetGenerationProgress();

      // Stage 1: Building prompt
      setGenerationProgress({
        stage: "building-prompt",
        message: "Building AI prompt with your parameters...",
        progress: 20,
      });

      // Build and store the prompt for user review
      const prompt = buildPrompt();
      setAIPrompt(prompt);

      // Stage 2: Calling AI
      setGenerationProgress({
        stage: "calling-ai",
        message: "Sending request to Gemini AI...",
        progress: 40,
      });

      // Generate content using a temporary campaign ID (we'll create the real campaign later)
      const content = await generateContentMutation.mutateAsync({
        campaignId: "temp", // Temporary ID - we'll handle this in the publish step
        // Campaign data
        title: campaignData.title,
        topic: campaignData.topic,
        description: campaignData.description,
        targetAudience: campaignData.targetAudience,
        startingBloomLevel: campaignData.startingBloomLevel,
        targetBloomLevel: campaignData.targetBloomLevel,
        focusAreas: campaignData.focusAreas || [],
        estimatedDuration: Number(campaignData.estimatedDuration) || 7,
        tone: campaignData.tone,
        // Learning parameters
        ...aiParams,
      });

      // Stage 3: Parsing response
      setGenerationProgress({
        stage: "parsing-response",
        message: "Processing AI response and formatting content...",
        progress: 80,
      });

      setGeneratedContent(content);

      // Stage 4: Complete
      setGenerationProgress({
        stage: "complete",
        message: "Content generated successfully!",
        progress: 100,
      });

      toast.success("Content generated successfully!");

      // Reset progress after a short delay
      setTimeout(() => {
        resetGenerationProgress();
      }, 2000);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
      resetGenerationProgress();
      // Keep the prompt even if generation fails
      const prompt = buildPrompt();
      setAIPrompt(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateContent = async () => {
    await handleGenerateContent();
  };

  const handleChange = (field: string, value: string) => {
    updateAIParams({ [field]: value });
  };

  const handleOpenPromptEditor = () => {
    console.log("Opening prompt editor, current aiPrompt:", aiPrompt);
    const prompt = buildPrompt();
    console.log("Generated prompt in handleOpenPromptEditor:", prompt);
    setAIPrompt(prompt);
    setShowPromptEditor(true);
  };

  const handleSavePrompt = (editedPrompt: string) => {
    setAIPrompt(editedPrompt);
    setShowPrompt(true);
  };

  const handleGenerateWithPrompt = async (prompt: string) => {
    try {
      setIsGenerating(true);
      resetGenerationProgress();

      // Stage 1: Building prompt
      setGenerationProgress({
        stage: "building-prompt",
        message: "Using custom prompt...",
        progress: 20,
      });

      setAIPrompt(prompt);

      // Stage 2: Calling AI
      setGenerationProgress({
        stage: "calling-ai",
        message: "Sending request to Gemini AI...",
        progress: 40,
      });

      // Generate content using a temporary campaign ID (we'll create the real campaign later)
      const content = await generateContentMutation.mutateAsync({
        campaignId: "temp", // Temporary ID - we'll handle this in the publish step
        // Campaign data
        title: campaignData.title,
        topic: campaignData.topic,
        description: campaignData.description,
        targetAudience: campaignData.targetAudience,
        startingBloomLevel: campaignData.startingBloomLevel,
        targetBloomLevel: campaignData.targetBloomLevel,
        focusAreas: campaignData.focusAreas || [],
        estimatedDuration: Number(campaignData.estimatedDuration) || 7,
        tone: campaignData.tone,
        // Learning parameters
        ...aiParams,
      });

      // Stage 3: Parsing response
      setGenerationProgress({
        stage: "parsing-response",
        message: "Processing AI response and formatting content...",
        progress: 80,
      });

      setGeneratedContent(content);

      // Stage 4: Complete
      setGenerationProgress({
        stage: "complete",
        message: "Content generated successfully!",
        progress: 100,
      });

      toast.success("Content generated successfully!");

      // Reset progress after a short delay
      setTimeout(() => {
        resetGenerationProgress();
      }, 2000);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
      resetGenerationProgress();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraftMutation.mutateAsync({
        campaignData,
        aiParams,
        generatedContent,
      });

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const canProceed = !!generatedContent;

  // Calculate total assessment questions from milestones and lessons
  const getTotalAssessmentQuestions = (content: any) => {
    if (!content?.milestones) return 0;

    let totalQuestions = 0;
    content.milestones.forEach((milestone: any) => {
      // Count milestone-level questions
      if (milestone.assessmentQuestions) {
        totalQuestions += milestone.assessmentQuestions.length;
      }
      // Count lesson-level questions
      if (milestone.lessons) {
        milestone.lessons.forEach((lesson: any) => {
          if (lesson.assessmentQuestions) {
            totalQuestions += lesson.assessmentQuestions.length;
          }
        });
      }
    });
    return totalQuestions;
  };

  const totalAssessmentQuestions = getTotalAssessmentQuestions(generatedContent);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Content Generation
          </CardTitle>
          <CardDescription className="text-white/80">
            Configure parameters to help AI generate the best learning content
            for your campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Learning Style</Label>
                <Select
                  value={aiParams.learningStyle}
                  onValueChange={(value) =>
                    handleChange("learningStyle", value)
                  }
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEARNING_STYLES.map((style) => (
                      <SelectItem key={style} value={style.toLowerCase()}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Difficulty Preference</Label>
                <Select
                  value={aiParams.difficultyPreference}
                  onValueChange={(value) =>
                    handleChange("difficultyPreference", value)
                  }
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Content Format</Label>
                <Select
                  value={aiParams.contentFormat}
                  onValueChange={(value) =>
                    handleChange("contentFormat", value)
                  }
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_FORMATS.map((format) => (
                      <SelectItem key={format} value={format.toLowerCase()}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Time Commitment</Label>
                <Select
                  value={aiParams.timeCommitment}
                  onValueChange={(value) =>
                    handleChange("timeCommitment", value)
                  }
                >
                  <SelectTrigger className="border-white/20 bg-white/10 text-white">
                    <SelectValue placeholder="Select time commitment" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_COMMITMENTS.map((commitment) => (
                      <SelectItem
                        key={commitment}
                        value={commitment.toLowerCase()}
                      >
                        {commitment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisites" className="text-white">
                Prerequisites
              </Label>
              <Textarea
                id="prerequisites"
                value={aiParams.prerequisites}
                onChange={(e) => handleChange("prerequisites", e.target.value)}
                placeholder="What should learners already know before starting this campaign?"
                className="min-h-[80px] border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>

            {/* Advanced AI Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Advanced AI Configuration
                </h3>
                {aiPrompt && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPrompt(!showPrompt)}
                    size="sm"
                  >
                    {showPrompt ? "Hide" : "Show"} AI Prompt
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white">
                    Resource Types Preference
                  </Label>
                  <Select
                    value={aiParams.resourceTypes}
                    onValueChange={(value) =>
                      handleChange("resourceTypes", value)
                    }
                  >
                    <SelectTrigger className="border-white/20 bg-white/10 text-white">
                      <SelectValue placeholder="Select resource preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">
                        Mixed formats (docs, videos, tutorials)
                      </SelectItem>
                      <SelectItem value="docs-first">
                        Official docs + blog posts
                      </SelectItem>
                      <SelectItem value="video-heavy">
                        YouTube & video courses
                      </SelectItem>
                      <SelectItem value="free-only">
                        Free & open access only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Final Learning Outcome</Label>
                  <Select
                    value={aiParams.finalOutcome}
                    onValueChange={(value) =>
                      handleChange("finalOutcome", value)
                    }
                  >
                    <SelectTrigger className="border-white/20 bg-white/10 text-white">
                      <SelectValue placeholder="Select final outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="build-app">
                        Build a polished app
                      </SelectItem>
                      <SelectItem value="build-teach">
                        Build app + teach it
                      </SelectItem>
                      <SelectItem value="architect-scale">
                        Architect at scale
                      </SelectItem>
                      <SelectItem value="open-source">
                        Open source contribution
                      </SelectItem>
                      <SelectItem value="hybrid">Hybrid approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Generate Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <Button
                type="button"
                onClick={handleOpenPromptEditor}
                disabled={isGenerating}
                variant="outline"
                size="lg"
              >
                <Edit3 className="mr-2 h-5 w-5" />
                Edit Prompt
              </Button>
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isGenerating}
                variant="outline"
                size="lg"
                className="border-green-400 text-green-400 hover:bg-green-500/20"
              >
                <FileText className="mr-2 h-5 w-5" />
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progressive Loading */}
      {isGenerating && (
        <ProgressiveLoading
          stage={generationProgress.stage}
          message={generationProgress.message}
          progress={generationProgress.progress}
        />
      )}

      {/* AI Prompt Preview */}
      {showPrompt && aiPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">AI Prompt Preview</CardTitle>
            <CardDescription className="text-white/80">
              This is the exact prompt being sent to the AI. You can see how
              your parameters are being used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-white/20 bg-black/20 p-4">
              <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap text-white/90">
                {aiPrompt}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview of generated content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Generated Content Preview
                </CardTitle>
                <CardDescription className="text-white/80">
                  AI has generated the following content for your campaign:
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleRegenerateContent}
                disabled={isGenerating}
                size="sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold text-white">
                  Milestones ({generatedContent.milestones?.length || 0})
                </h4>
                <div className="space-y-6">
                  {generatedContent.milestones
                    ?.map((milestone: any, index: number) => (
                      <div key={index} className="rounded-lg bg-white/10 p-6 border border-white/20">
                        {/* Milestone Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                              Level {milestone.bloomLevel}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
                              Milestone {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Milestone Title */}
                        <h5 className="text-lg font-semibold text-white mb-2">
                          {milestone.title}
                        </h5>
                        
                        {/* Milestone Objective */}
                        <p className="text-sm text-white/80 mb-4">
                          {milestone.objective}
                        </p>

                        {/* Resources */}
                        {milestone.resources && milestone.resources.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-white/90 mb-2">Resources:</h6>
                            <div className="space-y-1">
                              {milestone.resources.map((resource: string, resourceIndex: number) => (
                                <a
                                  key={resourceIndex}
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-300 hover:text-blue-200 underline"
                                >
                                  {resource}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Milestone Assessment Questions */}
                        {milestone.assessmentQuestions && milestone.assessmentQuestions.length > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-white/90 mb-2">
                              Assessment Questions: {milestone.assessmentQuestions.length} questions
                            </h6>
                          </div>
                        )}

                        {/* Lessons */}
                        {milestone.lessons && milestone.lessons.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-white/90 mb-3">Lessons:</h6>
                            <div className="space-y-4 ml-4">
                              {milestone.lessons.map((lesson: any, lessonIndex: number) => (
                                <div key={lessonIndex} className="rounded-lg bg-white/5 p-4 border border-white/10">
                                  {/* Lesson Header */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
                                      Lesson {lessonIndex + 1}
                                    </span>
                                    {lesson.estimatedTime && (
                                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full">
                                        {lesson.estimatedTime}
                                      </span>
                                    )}
                                  </div>

                                  {/* Lesson Title */}
                                  <h7 className="text-sm font-medium text-white mb-2 block">
                                    {lesson.title}
                                  </h7>

                                  {/* Lesson Objective */}
                                  <p className="text-xs text-white/70 mb-3">
                                    {lesson.objective}
                                  </p>

                                  {/* Lesson Resources */}
                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <div className="mb-3">
                                      <h8 className="text-xs font-medium text-white/80 mb-1">Resources:</h8>
                                      <div className="space-y-1">
                                        {lesson.resources.map((resource: string, resourceIndex: number) => (
                                          <a
                                            key={resourceIndex}
                                            href={resource}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-blue-300 hover:text-blue-200 underline"
                                          >
                                            {resource}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Lesson Assessment Questions */}
                                  {lesson.assessmentQuestions && lesson.assessmentQuestions.length > 0 && (
                                    <div>
                                      <h8 className="text-xs font-medium text-white/80">
                                        Quiz Questions: {lesson.assessmentQuestions.length} questions
                                      </h8>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">
                  Assessment Questions ({totalAssessmentQuestions})
                </h4>
                <p className="text-sm text-white/80">
                  {totalAssessmentQuestions} questions generated for knowledge verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button type="button" onClick={nextStep} disabled={!canProceed}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Prompt Editor Modal */}
      <PromptEditorModal
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        prompt={aiPrompt}
        onSave={handleSavePrompt}
        onGenerate={handleGenerateWithPrompt}
        isGenerating={isGenerating}
      />
    </div>
  );
}
