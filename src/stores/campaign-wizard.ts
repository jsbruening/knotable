import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface CampaignData {
  title: string;
  description: string;
  topic: string;
  targetAudience?: string;
  startingBloomLevel: number;
  targetBloomLevel: number;
  focusAreas: string[];
  resourceTypes: string[];
  excludedSources: string[];
  tone?: string;
  estimatedDuration?: number;
  challengeType?: string;
  teamChallengeIdeas?: string;
  teamId?: string;
}

export interface AIParams {
  learningStyle: string;
  difficultyPreference: string;
  contentFormat: string;
  timeCommitment: string;
  prerequisites: string;
  questionFormat: string;
  resourceTypes: string;
  finalOutcome: string;
}

export interface GeneratedContent {
  milestones: Array<{
    bloomLevel: number;
    title: string;
    objective: string;
    resources: string[];
    estimatedTime: string;
    subMilestones?: Array<{
      title: string;
      objective: string;
      resources: string[];
      estimatedTime: string;
      assessmentQuestions?: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
      }>;
    }>;
    assessmentQuestions?: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  }>;
  assessmentQuestions?: Array<{
    milestoneIndex: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

interface CampaignWizardState {
  // Wizard state
  currentStep: number;
  totalSteps: number;

  // Campaign data
  campaignData: CampaignData;
  aiParams: AIParams;
  generatedContent: GeneratedContent | null;

  // UI state
  isGenerating: boolean;
  showPrompt: boolean;
  aiPrompt: string;

  // Progressive loading state
  generationProgress: {
    stage:
      | "idle"
      | "building-prompt"
      | "calling-ai"
      | "parsing-response"
      | "complete";
    message: string;
    progress: number; // 0-100
  };

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  updateCampaignData: (data: Partial<CampaignData>) => void;
  updateAIParams: (params: Partial<AIParams>) => void;
  setGeneratedContent: (content: GeneratedContent | null) => void;

  setIsGenerating: (generating: boolean) => void;
  setShowPrompt: (show: boolean) => void;
  setAIPrompt: (prompt: string) => void;

  // Progressive loading actions
  setGenerationProgress: (
    progress: Partial<CampaignWizardState["generationProgress"]>,
  ) => void;
  resetGenerationProgress: () => void;

  // Utility actions
  resetWizard: () => void;
  canProceedToNextStep: () => boolean;
}

const initialCampaignData: CampaignData = {
  title: "",
  description: "",
  topic: "",
  targetAudience: "",
  startingBloomLevel: 1,
  targetBloomLevel: 6,
  focusAreas: [],
  resourceTypes: [],
  excludedSources: [],
  tone: "professional",
  estimatedDuration: undefined,
  challengeType: "",
  teamChallengeIdeas: "",
  teamId: undefined,
};

const initialAIParams: AIParams = {
  learningStyle: "",
  difficultyPreference: "",
  contentFormat: "",
  timeCommitment: "",
  prerequisites: "",
  questionFormat: "nested",
  resourceTypes: "mixed",
  finalOutcome: "build-app",
};

export const useCampaignWizardStore = create<CampaignWizardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: 0,
      totalSteps: 5,
      campaignData: initialCampaignData,
      aiParams: initialAIParams,
      generatedContent: null,
      isGenerating: false,
      showPrompt: false,
      aiPrompt: "",
      generationProgress: {
        stage: "idle",
        message: "",
        progress: 0,
      },

      // Step navigation
      setCurrentStep: (step: number) => {
        set({ currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)) });
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      // Data updates
      updateCampaignData: (data: Partial<CampaignData>) => {
        set((state) => ({
          campaignData: { ...state.campaignData, ...data },
        }));
      },

      updateAIParams: (params: Partial<AIParams>) => {
        set((state) => ({
          aiParams: { ...state.aiParams, ...params },
        }));
      },

      setGeneratedContent: (content: GeneratedContent | null) => {
        set({ generatedContent: content });
      },

      // UI state updates
      setIsGenerating: (generating: boolean) => {
        set({ isGenerating: generating });
      },

      setShowPrompt: (show: boolean) => {
        set({ showPrompt: show });
      },

      setAIPrompt: (prompt: string) => {
        set({ aiPrompt: prompt });
      },

      // Progressive loading actions
      setGenerationProgress: (
        progress: Partial<CampaignWizardState["generationProgress"]>,
      ) => {
        set((state) => ({
          generationProgress: { ...state.generationProgress, ...progress },
        }));
      },

      resetGenerationProgress: () => {
        set({
          generationProgress: {
            stage: "idle",
            message: "",
            progress: 0,
          },
        });
      },

      // Utility functions
      resetWizard: () => {
        set({
          currentStep: 0,
          campaignData: initialCampaignData,
          aiParams: initialAIParams,
          generatedContent: null,
          isGenerating: false,
          showPrompt: false,
          aiPrompt: "",
          generationProgress: {
            stage: "idle",
            message: "",
            progress: 0,
          },
        });
      },

      canProceedToNextStep: () => {
        const { currentStep, campaignData } = get();

        switch (currentStep) {
          case 0: // Basic Info
            return !!(
              campaignData.title &&
              campaignData.description &&
              campaignData.topic
            );
          case 1: // Learning Parameters
            return (
              campaignData.startingBloomLevel > 0 &&
              campaignData.targetBloomLevel > 0
            );
          case 2: // AI Generation
            return !!get().generatedContent;
          case 3: // Review
            return true; // Always can proceed from review
          case 4: // Publish
            return false; // Last step
          default:
            return false;
        }
      },
    }),
    {
      name: "campaign-wizard-store", // unique name for devtools
    },
  ),
);
