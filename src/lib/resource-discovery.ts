import { generateExternalResources } from "./openai";

export interface ResourceDiscoveryParams {
  topic: string;
  milestoneTitle: string;
  milestoneObjective: string;
  bloomLevel: number;
  focusAreas: string[];
  resourceTypes?: string[];
}

export interface DiscoveredResource {
  url: string;
  title: string;
  type: string;
  provider: string;
  description?: string;
  estimatedDuration?: string;
}

/**
 * Discover fresh, relevant resources for a milestone using AI
 */
export async function discoverResourcesForMilestone(
  params: ResourceDiscoveryParams
): Promise<DiscoveredResource[]> {
  const { topic, milestoneTitle, milestoneObjective, bloomLevel, focusAreas, resourceTypes = [] } = params;

  // Build a comprehensive prompt for resource discovery
  const prompt = `
You are an expert educational content curator specializing in finding high-quality, current learning resources.

MILESTONE DETAILS:
- Topic: ${topic}
- Milestone Title: ${milestoneTitle}
- Learning Objective: ${milestoneObjective}
- Bloom's Taxonomy Level: ${bloomLevel} (${getBloomLevelName(bloomLevel)})
- Focus Areas: ${focusAreas.join(", ")}
- Preferred Resource Types: ${resourceTypes.length > 0 ? resourceTypes.join(", ") : "Mixed (videos, articles, documentation, code examples)"}

TASK:
Find 8-12 high-quality, current learning resources that directly support this milestone's learning objective.

RESOURCE REQUIREMENTS:
- Must be directly relevant to the milestone objective
- Should be appropriate for Bloom's Taxonomy level ${bloomLevel}
- Include a mix of resource types (videos, articles, documentation, interactive tutorials, code examples)
- Prioritize official sources (MDN, React docs, official tutorials, etc.)
- Include recent content (prefer resources from 2023-2024)
- Ensure URLs are real and accessible
- Mix of beginner-friendly and more advanced content as appropriate

RESOURCE TYPES TO INCLUDE:
- Official Documentation (React docs, MDN, etc.)
- Video Tutorials (YouTube, official channels)
- Interactive Learning (CodePen, CodeSandbox, interactive tutorials)
- Written Articles (Medium, Dev.to, official blogs)
- Code Examples (GitHub repos, CodePen examples)
- Practice Exercises (LeetCode, Codewars, etc.)

RESPONSE FORMAT (must be valid JSON):
{
  "resources": [
    {
      "url": "https://real-working-url.com",
      "title": "Descriptive title of the resource",
      "type": "video|article|documentation|interactive|code|exercise",
      "provider": "Provider name (e.g., React, MDN, YouTube, etc.)",
      "description": "Brief description of what this resource covers",
      "estimatedDuration": "X minutes" or "X hours" or "Self-paced"
    }
  ]
}

IMPORTANT:
- Use REAL, working URLs
- Ensure resources are current and relevant
- Provide diverse resource types
- Make titles descriptive and helpful
- Focus on quality over quantity
- Include both free and premium resources
- Ensure URLs are accessible and not behind paywalls (unless specified)

Return exactly ${Math.max(8, Math.min(12, 6 + bloomLevel))} resources.
`;

  try {
    const response = await generateExternalResources(topic, resourceTypes);
    
    // Parse the AI response and convert to our format
    const discoveredResources: DiscoveredResource[] = [];
    
    if (response && Array.isArray(response)) {
      for (const item of response) {
        if (typeof item === 'string') {
          // Handle simple URL strings
          discoveredResources.push({
            url: item,
            title: extractTitleFromUrl(item),
            type: detectResourceType(item),
            provider: extractProviderFromUrl(item),
            description: `Resource for ${milestoneTitle}`,
            estimatedDuration: "Self-paced"
          });
        } else if (item.url) {
          // Handle structured resource objects
          discoveredResources.push({
            url: item.url,
            title: item.title || extractTitleFromUrl(item.url),
            type: item.type || detectResourceType(item.url),
            provider: item.provider || extractProviderFromUrl(item.url),
            description: item.description || `Resource for ${milestoneTitle}`,
            estimatedDuration: item.estimatedDuration || "Self-paced"
          });
        }
      }
    }

    // If we don't have enough resources, generate some fallback ones
    if (discoveredResources.length < 6) {
      const fallbackResources = generateFallbackResources(params);
      discoveredResources.push(...fallbackResources);
    }

    return discoveredResources.slice(0, 12); // Cap at 12 resources
  } catch (error) {
    console.error("Error discovering resources:", error);
    // Return fallback resources if AI fails
    return generateFallbackResources(params);
  }
}

/**
 * Discover resources for sub-milestones
 */
export async function discoverResourcesForSubMilestone(
  params: ResourceDiscoveryParams & { subMilestoneTitle: string; subMilestoneObjective: string }
): Promise<DiscoveredResource[]> {
  const subParams = {
    ...params,
    milestoneTitle: params.subMilestoneTitle,
    milestoneObjective: params.subMilestoneObjective,
  };
  
  // For sub-milestones, we want fewer but more focused resources
  const resources = await discoverResourcesForMilestone(subParams);
  return resources.slice(0, 6); // Limit sub-milestone resources to 6
}

function getBloomLevelName(level: number): string {
  const levels = [
    "Remember",
    "Understand", 
    "Apply",
    "Analyze",
    "Evaluate",
    "Create"
  ];
  return levels[level - 1] || "Unknown";
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || urlObj.hostname;
    
    return decodeURIComponent(lastSegment)
      .replace(/[-_]+/g, ' ')
      .replace(/\.[a-z0-9]+$/i, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim() || urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function detectResourceType(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || urlLower.includes('vimeo.com')) {
    return 'video';
  }
  if (urlLower.includes('github.com') || urlLower.includes('codepen.io') || urlLower.includes('codesandbox.io')) {
    return 'code';
  }
  if (urlLower.includes('.pdf') || urlLower.includes('docs.') || urlLower.includes('documentation')) {
    return 'documentation';
  }
  if (urlLower.includes('codepen.io') || urlLower.includes('codesandbox.io') || urlLower.includes('jsfiddle.net')) {
    return 'interactive';
  }
  if (urlLower.includes('leetcode.com') || urlLower.includes('codewars.com') || urlLower.includes('hackerrank.com')) {
    return 'exercise';
  }
  
  return 'article';
}

function extractProviderFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Map common domains to friendly names
    const providerMap: Record<string, string> = {
      'reactjs.org': 'React',
      'developer.mozilla.org': 'MDN',
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'github.com': 'GitHub',
      'codepen.io': 'CodePen',
      'codesandbox.io': 'CodeSandbox',
      'medium.com': 'Medium',
      'dev.to': 'Dev.to',
      'freecodecamp.org': 'FreeCodeCamp',
      'w3schools.com': 'W3Schools',
      'stackoverflow.com': 'Stack Overflow',
    };
    
    return providerMap[hostname] || hostname.split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function generateFallbackResources(params: ResourceDiscoveryParams): DiscoveredResource[] {
  const { topic, milestoneTitle, bloomLevel } = params;
  
  // Generate some basic fallback resources based on the topic
  const fallbacks: DiscoveredResource[] = [
    {
      url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript`,
      title: `MDN JavaScript Documentation`,
      type: 'documentation',
      provider: 'MDN',
      description: `Official JavaScript documentation`,
      estimatedDuration: 'Self-paced'
    },
    {
      url: `https://reactjs.org/docs/getting-started.html`,
      title: `React Official Documentation`,
      type: 'documentation', 
      provider: 'React',
      description: `Official React documentation`,
      estimatedDuration: 'Self-paced'
    },
    {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)} tutorial`,
      title: `${topic} Tutorial Videos`,
      type: 'video',
      provider: 'YouTube',
      description: `Video tutorials for ${topic}`,
      estimatedDuration: '30-60 minutes'
    }
  ];
  
  return fallbacks;
}
