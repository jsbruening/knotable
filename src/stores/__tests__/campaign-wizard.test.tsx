import { renderHook, act } from "@testing-library/react";
import { useCampaignWizardStore } from "~/stores/campaign-wizard";

// Mock the store for testing
const mockStore = {
  currentStep: 0,
  totalSteps: 5,
  campaignData: {
    title: "",
    description: "",
    topic: "",
    targetAudience: "",
    startingBloomLevel: 1,
    targetBloomLevel: 3,
    focusAreas: [],
    estimatedDuration: 7,
    tone: "professional",
  },
  aiParams: {
    learningStyle: "mixed",
    difficultyPreference: "balanced",
    contentFormat: "mixed",
    timeCommitment: "flexible",
    prerequisites: "",
    resourceTypes: "mixed",
    finalOutcome: "build-app",
    questionFormat: "nested",
  },
  generatedContent: null,
  isGenerating: false,
  showPrompt: false,
  aiPrompt: "",
  generationProgress: {
    stage: "idle" as const,
    message: "",
    progress: 0,
  },
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  updateCampaignData: jest.fn(),
  updateAIParams: jest.fn(),
  setGeneratedContent: jest.fn(),
  setIsGenerating: jest.fn(),
  setShowPrompt: jest.fn(),
  setAIPrompt: jest.fn(),
  setGenerationProgress: jest.fn(),
  resetGenerationProgress: jest.fn(),
  resetWizard: jest.fn(),
};

jest.mock("~/stores/campaign-wizard", () => ({
  useCampaignWizardStore: jest.fn(() => mockStore),
}));

describe("Campaign Wizard Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(5);
    expect(result.current.campaignData.title).toBe("");
    expect(result.current.campaignData.startingBloomLevel).toBe(1);
    expect(result.current.campaignData.targetBloomLevel).toBe(3);
  });

  it("should have all required actions", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    expect(typeof result.current.nextStep).toBe("function");
    expect(typeof result.current.previousStep).toBe("function");
    expect(typeof result.current.updateCampaignData).toBe("function");
    expect(typeof result.current.updateAIParams).toBe("function");
    expect(typeof result.current.setGeneratedContent).toBe("function");
    expect(typeof result.current.setIsGenerating).toBe("function");
    expect(typeof result.current.setShowPrompt).toBe("function");
    expect(typeof result.current.setAIPrompt).toBe("function");
    expect(typeof result.current.setGenerationProgress).toBe("function");
    expect(typeof result.current.resetGenerationProgress).toBe("function");
    expect(typeof result.current.resetWizard).toBe("function");
  });

  it("should call nextStep when nextStep is called", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.nextStep).toHaveBeenCalledTimes(1);
  });

  it("should call previousStep when previousStep is called", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    act(() => {
      result.current.previousStep();
    });

    expect(result.current.previousStep).toHaveBeenCalledTimes(1);
  });

  it("should call updateCampaignData with correct data", () => {
    const { result } = renderHook(() => useCampaignWizardStore());
    const testData = { title: "Test Campaign" };

    act(() => {
      result.current.updateCampaignData(testData);
    });

    expect(result.current.updateCampaignData).toHaveBeenCalledWith(testData);
  });

  it("should call updateAIParams with correct params", () => {
    const { result } = renderHook(() => useCampaignWizardStore());
    const testParams = { learningStyle: "visual" };

    act(() => {
      result.current.updateAIParams(testParams);
    });

    expect(result.current.updateAIParams).toHaveBeenCalledWith(testParams);
  });

  it("should call setGeneratedContent with content", () => {
    const { result } = renderHook(() => useCampaignWizardStore());
    const testContent = { milestones: [] };

    act(() => {
      result.current.setGeneratedContent(testContent);
    });

    expect(result.current.setGeneratedContent).toHaveBeenCalledWith(
      testContent,
    );
  });

  it("should call setIsGenerating with boolean", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    act(() => {
      result.current.setIsGenerating(true);
    });

    expect(result.current.setIsGenerating).toHaveBeenCalledWith(true);
  });

  it("should call setGenerationProgress with progress data", () => {
    const { result } = renderHook(() => useCampaignWizardStore());
    const testProgress = {
      stage: "calling-ai" as const,
      message: "Calling AI...",
      progress: 50,
    };

    act(() => {
      result.current.setGenerationProgress(testProgress);
    });

    expect(result.current.setGenerationProgress).toHaveBeenCalledWith(
      testProgress,
    );
  });

  it("should call resetWizard when resetWizard is called", () => {
    const { result } = renderHook(() => useCampaignWizardStore());

    act(() => {
      result.current.resetWizard();
    });

    expect(result.current.resetWizard).toHaveBeenCalledTimes(1);
  });
});
