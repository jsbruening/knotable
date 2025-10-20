"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
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
  const [selectedTeams, setSelectedTeams] = useState<string[]>(data.selectedTeams || []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      setSelectedTeams(prev => prev.filter(id => id !== teamId));
    } else {
      // Add to selection and join
      try {
        await joinTeamMutation.mutateAsync({ teamId });
        setSelectedTeams(prev => [...prev, teamId]);
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
      setSelectedTeams(prev => [...prev, newTeam.id]);
      setIsCreateDialogOpen(false);
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
      <div className="text-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Join or Create Teams</h3>
        <p className="text-gray-600">
          Teams help you collaborate and learn together. Join existing teams or create your own!
        </p>
      </div>

      {/* Create Team Button */}
      <div className="text-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-4">
              <Plus className="w-4 h-4 mr-2" />
              Create New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
              <DialogDescription>
                Create a team to collaborate with others on your learning journey.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={createTeamData.name}
                  onChange={(e) => setCreateTeamData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={createTeamData.description}
                  onChange={(e) => setCreateTeamData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your team's goals..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={!createTeamData.name.trim()}>
                  Create Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams?.teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams available</h3>
            <p className="text-gray-600 mb-4">
              There are no public teams available right now. Create your own team!
            </p>
            <Button onClick={handleSkip} variant="outline">
              Skip for now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {teams?.teams.map((team) => (
            <Card
              key={team.id}
              className={`cursor-pointer transition-all ${selectedTeams.includes(team.id)
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md"
                }`}
              onClick={() => handleTeamToggle(team.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{team.name}</span>
                      {team.createdBy.id === data.userId && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {team.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge variant={selectedTeams.includes(team.id) ? "default" : "secondary"}>
                      {selectedTeams.includes(team.id) ? "Joined" : "Join"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{team._count.members}/{team.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Team chat</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={team.createdBy.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {team.createdBy.displayName?.charAt(0) || team.createdBy.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    Created by {team.createdBy.displayName || team.createdBy.email}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          Back
        </Button>
        <div className="space-x-2">
          <Button onClick={handleSkip} variant="outline">
            Skip
          </Button>
          <Button onClick={handleContinue}>
            Continue ({selectedTeams.length} selected)
          </Button>
        </div>
      </div>
    </div>
  );
}

