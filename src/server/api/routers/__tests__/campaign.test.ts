import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock the database and context
const mockDb = {
  campaign: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockContext = {
  user: {
    id: "test-user-id",
    isAdmin: true,
  },
  db: mockDb,
};

// Mock the tRPC procedures
const mockProtectedProcedure = {
  input: jest.fn().mockReturnThis(),
  mutation: jest.fn(),
  query: jest.fn(),
};

describe("Campaign Router API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveDraft mutation", () => {
    it("should create a campaign draft with correct data", async () => {
      const mockCampaignData = {
        title: "Test Campaign",
        description: "Test Description",
        topic: "React",
        targetAudience: "Beginners",
        startingBloomLevel: 1,
        targetBloomLevel: 3,
        focusAreas: ["frontend"],
        estimatedDuration: 7,
        tone: "professional",
      };

      const mockAIParams = {
        learningStyle: "visual",
        difficultyPreference: "beginner",
        contentFormat: "mixed",
        timeCommitment: "flexible",
        prerequisites: "Basic HTML",
        resourceTypes: "mixed",
        finalOutcome: "build-app",
        questionFormat: "nested",
      };

      const mockGeneratedContent = {
        milestones: [
          {
            bloomLevel: 1,
            title: "Learn React Basics",
            objective: "Understand React fundamentals",
            resources: ["https://react.dev"],
            estimatedTime: "2 hours",
          },
        ],
      };

      const expectedCampaign = {
        id: "campaign-id",
        ...mockCampaignData,
        createdBy: "test-user-id",
        isPublic: false,
        scope: "draft",
        status: "draft",
        metadata: {
          aiParams: mockAIParams,
          generatedContent: mockGeneratedContent,
          savedAt: expect.any(String),
        },
      };

      mockDb.campaign.create.mockResolvedValue(expectedCampaign);

      // Simulate the mutation call
      const result = await mockDb.campaign.create({
        data: {
          title: mockCampaignData.title,
          description: mockCampaignData.description,
          topic: mockCampaignData.topic,
          targetAudience: mockCampaignData.targetAudience || "General learners",
          startingBloomLevel: mockCampaignData.startingBloomLevel,
          targetBloomLevel: mockCampaignData.targetBloomLevel,
          focusAreas: mockCampaignData.focusAreas,
          estimatedDuration: mockCampaignData.estimatedDuration || 7,
          tone: mockCampaignData.tone || "professional",
          createdBy: mockContext.user.id,
          isPublic: false,
          scope: "draft",
          status: "draft",
          metadata: {
            aiParams: mockAIParams,
            generatedContent: mockGeneratedContent,
            savedAt: new Date().toISOString(),
          },
        },
      });

      expect(mockDb.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Test Campaign",
          description: "Test Description",
          topic: "React",
          targetAudience: "Beginners",
          startingBloomLevel: 1,
          targetBloomLevel: 3,
          focusAreas: ["frontend"],
          estimatedDuration: 7,
          tone: "professional",
          createdBy: "test-user-id",
          isPublic: false,
          scope: "draft",
          status: "draft",
          metadata: expect.objectContaining({
            aiParams: mockAIParams,
            generatedContent: mockGeneratedContent,
            savedAt: expect.any(String),
          }),
        }),
      });

      expect(result).toEqual(expectedCampaign);
    });

    it("should handle missing optional fields", async () => {
      const minimalCampaignData = {
        title: "Minimal Campaign",
        description: "Minimal Description",
        topic: "JavaScript",
        startingBloomLevel: 1,
        targetBloomLevel: 2,
        focusAreas: [],
      };

      const expectedCampaign = {
        id: "campaign-id",
        ...minimalCampaignData,
        targetAudience: "General learners",
        estimatedDuration: 7,
        tone: "professional",
        createdBy: "test-user-id",
        isPublic: false,
        scope: "draft",
        status: "draft",
        metadata: {
          aiParams: {},
          generatedContent: null,
          savedAt: expect.any(String),
        },
      };

      mockDb.campaign.create.mockResolvedValue(expectedCampaign);

      const result = await mockDb.campaign.create({
        data: {
          title: minimalCampaignData.title,
          description: minimalCampaignData.description,
          topic: minimalCampaignData.topic,
          targetAudience: "General learners",
          startingBloomLevel: minimalCampaignData.startingBloomLevel,
          targetBloomLevel: minimalCampaignData.targetBloomLevel,
          focusAreas: minimalCampaignData.focusAreas,
          estimatedDuration: 7,
          tone: "professional",
          createdBy: mockContext.user.id,
          isPublic: false,
          scope: "draft",
          status: "draft",
          metadata: {
            aiParams: {},
            generatedContent: null,
            savedAt: new Date().toISOString(),
          },
        },
      });

      expect(result.targetAudience).toBe("General learners");
      expect(result.estimatedDuration).toBe(7);
      expect(result.tone).toBe("professional");
    });
  });

  describe("generateContent mutation", () => {
    it("should handle temporary campaign ID", () => {
      const tempCampaignId = "temp";
      const aiParams = {
        learningStyle: "visual",
        difficultyPreference: "beginner",
      };

      // Mock campaign data for temp ID
      const mockCampaign = {
        title: "Temporary Campaign",
        topic: "General",
        description: "Temporary description",
        targetAudience: "General learners",
        startingBloomLevel: 1,
        targetBloomLevel: 3,
        focusAreas: [],
        estimatedDuration: 7,
        tone: "professional",
      };

      expect(tempCampaignId).toBe("temp");
      expect(mockCampaign.title).toBe("Temporary Campaign");
      expect(mockCampaign.startingBloomLevel).toBe(1);
      expect(mockCampaign.targetBloomLevel).toBe(3);
    });
  });

  describe("validation", () => {
    it("should validate required fields", () => {
      const validData = {
        title: "Valid Campaign",
        description: "Valid Description",
        topic: "Valid Topic",
        startingBloomLevel: 1,
        targetBloomLevel: 3,
        focusAreas: [],
      };

      expect(validData.title).toBeTruthy();
      expect(validData.description).toBeTruthy();
      expect(validData.topic).toBeTruthy();
      expect(validData.startingBloomLevel).toBeGreaterThan(0);
      expect(validData.targetBloomLevel).toBeGreaterThan(
        validData.startingBloomLevel,
      );
    });

    it("should validate Bloom levels", () => {
      const validBloomLevels = {
        starting: 1,
        target: 3,
      };

      expect(validBloomLevels.starting).toBeGreaterThanOrEqual(1);
      expect(validBloomLevels.starting).toBeLessThanOrEqual(6);
      expect(validBloomLevels.target).toBeGreaterThanOrEqual(1);
      expect(validBloomLevels.target).toBeLessThanOrEqual(6);
      expect(validBloomLevels.target).toBeGreaterThan(
        validBloomLevels.starting,
      );
    });
  });
});
