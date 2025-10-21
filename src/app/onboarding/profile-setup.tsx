"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
// Removed Select and Bloom's info card as learning level is campaign-specific
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Upload, Github, ExternalLink } from "lucide-react";
import { useAuth } from "~/components/auth/auth-provider";

interface ProfileSetupProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  data: any;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Removed global Bloom level options; level will be chosen per-campaign

export function ProfileSetup({ onNext, data }: ProfileSetupProps) {
  const { user } = useAuth();
  const utils = api.useUtils();
  const updateProfile = api.auth.updateProfile.useMutation();
  const [formData, setFormData] = useState({
    displayName: data.displayName || user?.user_metadata?.full_name || "",
    githubUsername: data.githubUsername || "",
    githubRepoUrl: data.githubRepoUrl || "",
    bio: data.bio || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { displayName, githubUsername, githubRepoUrl, bio } = formData;
    try {
      await updateProfile.mutateAsync({
        displayName,
        githubUsername,
        githubRepoUrl,
      });
      await utils.auth.getCurrentUser.invalidate();
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
    onNext({ displayName, githubUsername, githubRepoUrl, bio });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="text-center">
        <Avatar className="mx-auto mb-4 h-24 w-24">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-2xl">
            {formData.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <Button type="button" variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload Avatar
        </Button>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => handleInputChange("displayName", e.target.value)}
          placeholder="Enter your display name"
          required
        />
      </div>

      {/* GitHub Username */}
      <div className="space-y-2">
        <Label htmlFor="githubUsername">GitHub Username</Label>
        <div className="relative">
          <Github className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <Input
            id="githubUsername"
            value={formData.githubUsername}
            onChange={(e) =>
              handleInputChange("githubUsername", e.target.value)
            }
            placeholder="your-github-username"
            className="pl-10"
          />
        </div>
      </div>

      {/* GitHub Repo URL */}
      <div className="space-y-2">
        <Label htmlFor="githubRepoUrl">GitHub Repository URL</Label>
        <div className="relative">
          <ExternalLink className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <Input
            id="githubRepoUrl"
            value={formData.githubRepoUrl}
            onChange={(e) => handleInputChange("githubRepoUrl", e.target.value)}
            placeholder="https://github.com/username/repo"
            className="pl-10"
          />
        </div>
      </div>

      {/* Removed global learning level; will be selected when joining a campaign */}

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          placeholder="Tell us a bit about yourself and your learning goals..."
          rows={3}
        />
      </div>

      {/* Removed Bloom's Taxonomy explainer for now; we'll show per-campaign context */}

      <div className="flex justify-end">
        <Button type="submit" className="px-8">
          Continue
        </Button>
      </div>
    </form>
  );
}
