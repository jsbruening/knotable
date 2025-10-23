"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { AlertTriangle, Settings, Zap, Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useAuth } from "~/components/auth/auth-provider";
import Link from "next/link";

export default function AdminSettings() {
  const [isGeminiDisabled, setIsGeminiDisabled] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState("auto");
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [loading, user, router]);

  // Fetch admin settings
  const { data: adminSettings, refetch: refetchSettings } = api.adminSettings.getAll.useQuery();
  
  // Mutations for updating settings
  const setGeminiDisabledMutation = api.adminSettings.set.useMutation({
    onSuccess: async () => {
      await refetchSettings();
      toast.success("Gemini API setting updated");
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  const setLLMProviderMutation = api.adminSettings.set.useMutation({
    onSuccess: async () => {
      await refetchSettings();
      toast.success("LLM Provider setting updated");
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  // Load settings from database on mount
  useEffect(() => {
    if (adminSettings && typeof adminSettings === 'object') {
      const geminiSetting = adminSettings.gemini_disabled;
      const llmSetting = adminSettings.llm_provider;
      
      if (geminiSetting && typeof geminiSetting === 'object' && 'value' in geminiSetting) {
        setIsGeminiDisabled(geminiSetting.value === "true");
      }
      
      if (llmSetting && typeof llmSetting === 'object' && 'value' in llmSetting) {
        setSelectedLLM(llmSetting.value ?? "auto");
      }
    }
  }, [adminSettings]);

  const handleToggleGemini = async () => {
    const newState = !isGeminiDisabled;
    setIsGeminiDisabled(newState);
    
    setGeminiDisabledMutation.mutate({
      key: "gemini_disabled",
      value: newState ? "true" : "false",
      description: "Controls whether Gemini API calls are disabled",
    });
  };

  const handleLLMChange = (value: string) => {
    setSelectedLLM(value);
    
    setLLMProviderMutation.mutate({
      key: "llm_provider",
      value: value,
      description: "Primary LLM provider for content generation",
    });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gradient">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400" />
      </div>
    );
  }

  // Show loading spinner while not authenticated (will redirect)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gradient">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400" />
      </div>
    );
  }

  // Check if user is admin
  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  // Show access denied if not admin
  if (currentUser && typeof currentUser === 'object' && 'isAdmin' in currentUser && !currentUser.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gradient">
        <Card className="mx-auto max-w-md bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-white/80">
              Only administrators can access admin settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-white">
              Admin Settings
              <Settings className="ml-3 inline-block h-8 align-middle" />
            </h1>
            <p className="text-lg text-white/80">
              Manage system settings and API configurations
            </p>
          </div>

          {/* LLM Provider Settings */}
          <Card className="mb-6 bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    LLM Provider Settings
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Choose which AI provider to use for content generation
                  </CardDescription>
                </div>
                <Badge 
                  variant="default"
                  className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                >
                  {selectedLLM === "auto" ? "Auto-Rotate" : selectedLLM.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-1">
                  <Label htmlFor="llm-select" className="text-white font-medium">
                    Primary LLM Provider
                  </Label>
                  <p className="text-sm text-white/70">
                    Select which AI provider to use for campaign generation
                  </p>
                </div>
                <Select value={selectedLLM} onValueChange={handleLLMChange}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 border-white/20">
                    <SelectItem value="auto" className="text-white hover:bg-white/20">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Auto-Rotate
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini" className="text-white hover:bg-white/20">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Google Gemini
                      </div>
                    </SelectItem>
                    <SelectItem value="openai" className="text-white hover:bg-white/20">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        OpenAI GPT
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    <h4 className="font-medium text-green-300">Google Gemini</h4>
                  </div>
                  <p className="text-sm text-green-200/80">
                    Fast, cost-effective, good for structured content
                  </p>
                  <div className="mt-2 text-xs text-green-200/60">
                    Cost: ~$0.001 per 1K tokens
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-400" />
                    <h4 className="font-medium text-blue-300">OpenAI GPT</h4>
                  </div>
                  <p className="text-sm text-blue-200/80">
                    Reliable, high-quality, good for complex reasoning
                  </p>
                  <div className="mt-2 text-xs text-blue-200/60">
                    Cost: ~$0.002 per 1K tokens
                  </div>
                </div>
              </div>

              {/* Auto-Rotation Info */}
              {selectedLLM === "auto" && (
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-purple-400" />
                    <h4 className="font-medium text-purple-300">Auto-Rotation Active</h4>
                  </div>
                  <p className="text-sm text-purple-200/80">
                    Smart rotation: Gemini (cost-effective) → OpenAI (reliable).
                    Falls back to alternative providers if the primary fails.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gemini API Settings */}
          <Card className="mb-6 bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Gemini API Settings
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Control AI content generation features
                  </CardDescription>
                </div>
                <Badge 
                  variant={isGeminiDisabled ? "destructive" : "default"}
                  className={isGeminiDisabled ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}
                >
                  {isGeminiDisabled ? "Disabled" : "Enabled"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="space-y-1">
                  <Label htmlFor="gemini-toggle" className="text-white font-medium">
                    AI Content Generation
                  </Label>
                  <p className="text-sm text-white/70">
                    Enable or disable Gemini API calls for campaign generation
                  </p>
                </div>
                <Switch
                  id="gemini-toggle"
                  checked={!isGeminiDisabled}
                  onCheckedChange={handleToggleGemini}
                />
              </div>

              {/* Warning */}
              {isGeminiDisabled && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-300">AI Generation Disabled</h4>
                    <p className="text-sm text-yellow-200/80 mt-1">
                      Campaign generation will use fallback content instead of AI-generated content.
                      This helps prevent unexpected API costs during development.
                    </p>
                  </div>
                </div>
              )}

              {/* Environment Variable Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-2">Environment Variable</h4>
                <p className="text-sm text-blue-200/80 mb-2">
                  You can also control this setting via environment variable:
                </p>
                <code className="block p-2 bg-black/20 rounded text-blue-100 text-sm font-mono">
                  DISABLE_GEMINI=true
                </code>
                <p className="text-xs text-blue-200/60 mt-2">
                  Set to &quot;true&quot; or &quot;1&quot; to disable, &quot;false&quot; or &quot;0&quot; to enable
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/70">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => toast.info("Feature coming soon")}
              >
                View API Usage Statistics
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => toast.info("Feature coming soon")}
              >
                Manage User Permissions
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => toast.info("Feature coming soon")}
              >
                System Health Check
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
