"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { AlertTriangle, Settings, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [isGeminiDisabled, setIsGeminiDisabled] = useState(false);

  const handleToggleGemini = async () => {
    try {
      // In a real app, this would make an API call to update the setting
      // For now, we'll just show a toast
      const newState = !isGeminiDisabled;
      setIsGeminiDisabled(newState);
      
      toast.success(
        `Gemini API ${newState ? "disabled" : "enabled"}`,
        {
          description: newState 
            ? "AI content generation is now disabled" 
            : "AI content generation is now enabled"
        }
      );
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

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
                  Set to "true" or "1" to disable, "false" or "0" to enable
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
