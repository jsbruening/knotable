"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Users, Plus, MessageCircle, Crown } from "lucide-react";
import { api } from "~/trpc/react";

interface JoinTeamsProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  data: any;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function JoinTeams({ onNext, onPrevious, data }: JoinTeamsProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    data.selectedTeams || [],
  );
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createTeamData, setCreateTeamData] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const utils = api.useUtils();

  const { data: teams, isLoading } = api.team.getAll.useQuery({
    limit: 20,
  });
  const { data: userTeams } = api.team.getUserTeams.useQuery();

  useEffect(() => {
    if (userTeams) {
      const joinedIds = userTeams.map((ut) => ut.team.id);
      setSelectedTeams((prev) => Array.from(new Set([...prev, ...joinedIds])));
    }
  }, [userTeams]);

  const joinTeamMutation = api.team.join.useMutation();
  const createTeamMutation = api.team.create.useMutation();

  const handleTeamToggle = async (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      // Remove from selection
      setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
    } else {
      // Add to selection and join
      try {
        await joinTeamMutation.mutateAsync({ teamId });
        setSelectedTeams((prev) => [...prev, teamId]);
        await Promise.all([
          utils.team.getAll.invalidate(),
          utils.team.getUserTeams.invalidate(),
        ]);
      } catch (error) {
        console.error("Failed to join team:", error);
      }
    }
  };

  const handleCreateTeam = async () => {
    try {
      const newTeam = await createTeamMutation.mutateAsync(createTeamData);
      setSelectedTeams((prev) => [...prev, newTeam.id]);
      setIsCreateDrawerOpen(false);
      setCreateTeamData({ name: "", description: "", isPublic: true });
      // Refresh team lists so the new team appears immediately
      await Promise.all([
        utils.team.getAll.invalidate(),
        utils.team.getUserTeams.invalidate(),
      ]);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleContinue = () => {
    onNext({ selectedTeams });
  };

  const handleSkip = () => {
    onNext({ selectedTeams: [] });
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-blue-400"></div>
        <p className="text-white/80">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-white">Join or Create Teams</h3>
        <p className="text-white/80">
          Teams help you collaborate and learn together. Join existing teams or
          create your own!
        </p>
      </div>

      {/* Create Team Button */}
      <div className="text-center">
        <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="mb-4 border-white/20 text-white hover:bg-white/10">
              <Plus className="mr-2 h-4 w-4" />
              Create New Team
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-white/10 border-white/20">
            <DrawerHeader>
              <DrawerTitle className="text-white">Create a New Team</DrawerTitle>
              <DrawerDescription className="text-white/80">
                Create a team to collaborate with others on your learning
                journey.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-white">Team Name</Label>
                <Input
                  id="teamName"
                  value={createTeamData.name}
                  onChange={(e) =>
                    setCreateTeamData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter team name"
                  className="text-white placeholder:text-white/60 focus:border-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription" className="text-white">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={createTeamData.description}
                  onChange={(e) =>
                    setCreateTeamData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your team's goals..."
                  rows={3}
                  className="text-white placeholder:text-white/60 focus:border-white/40"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDrawerOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!createTeamData.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Team
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {teams?.teams.length === 0 ? (
        <Card className="bg-white/10 border-white/20">
          <CardContent className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-white/60" />
            <h3 className="mb-2 text-lg font-semibold text-white">No teams available</h3>
            <p className="mb-4 text-white/80">
              There are no public teams available right now. Create your own
              team!
            </p>
            <Button onClick={handleSkip} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Skip for now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {teams?.teams.map((team) => (
            <Card
              key={team.id}
              className={`cursor-pointer transition-all bg-white/10 border-white/20 ${selectedTeams.includes(team.id)
                ? "ring-2 ring-blue-400"
                : "hover:bg-white/15"
                }`}
              onClick={() => handleTeamToggle(team.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2 text-lg text-white">
                      <span>{team.name}</span>
                      {team.createdBy.id === data.userId && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-white/80">
                      {team.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedTeams.includes(team.id)
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedTeams.includes(team.id)
                          ? "bg-blue-600 text-white"
                          : "bg-white/20 text-white border-white/30"
                      }
                    >
                      {selectedTeams.includes(team.id) ? "Joined" : "Join"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {team._count.members}/{team.maxMembers} members
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>Team chat</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={team.createdBy.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-white/20 text-white">
                      {team.createdBy.displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white/70">
                    Created by {team.createdBy.displayName || "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Back
        </Button>
        <div className="space-x-2">
          <Button onClick={handleSkip} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Skip
          </Button>
          <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700 text-white">
            Continue ({selectedTeams.length} selected)
          </Button>
        </div>
      </div>
    </div>
  );
}
