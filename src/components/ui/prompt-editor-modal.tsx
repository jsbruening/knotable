"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Edit3,
  Sparkles,
  FileText,
  Brain,
  CheckCircle,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onSave: (editedPrompt: string) => void;
  onGenerate: (prompt: string) => void;
  isGenerating?: boolean;
}

export function PromptEditorModal({
  isOpen,
  onClose,
  prompt,
  onSave,
  onGenerate,
  isGenerating = false,
}: PromptEditorModalProps) {
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Update editedPrompt when prompt prop changes
  useEffect(() => {
    setEditedPrompt(prompt);
    setHasChanges(false);
  }, [prompt]);

  const handlePromptChange = (value: string) => {
    setEditedPrompt(value);
    setHasChanges(value !== prompt);
  };

  const handleSave = () => {
    onSave(editedPrompt);
    setHasChanges(false);
    onClose();
  };

  const handleGenerate = () => {
    onGenerate(editedPrompt);
    setHasChanges(false);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleReset = () => {
    setEditedPrompt(prompt);
    setHasChanges(false);
  };

  const getPromptStats = (text: string) => {
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    const characters = text.length;
    const lines = text.split("\n").length;

    return { words, characters, lines };
  };

  const stats = getPromptStats(editedPrompt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[70vh] !max-w-7xl overflow-hidden bg-app-gradient border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Edit3 className="mr-2 h-5 w-5 text-blue-400" />
            Edit AI Prompt
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Review and customize the prompt that will be sent to the AI. You can
            modify the instructions to better match your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Prompt Stats */}
          <div className="flex items-center gap-4 rounded-lg bg-white/10 p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/80">Prompt Statistics:</span>
            </div>
            <div className="flex gap-4">
              <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/10">
                {stats.words} words
              </Badge>
              <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/10">
                {stats.characters.toLocaleString()} characters
              </Badge>
              <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/10">
                {stats.lines} lines
              </Badge>
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="min-h-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="prompt-editor" className="text-white">
                AI Prompt
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isCopied ? (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="prompt-editor"
              value={editedPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              className="h-[300px] resize-none border-white/20 bg-white/10 font-mono text-sm text-white placeholder:text-white/50 overflow-y-auto"
              placeholder="Enter your AI prompt here..."
            />
          </div>

          {/* Tips Card */}
          <Card className="border-blue-400/30 bg-blue-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm text-white">
                <Brain className="mr-2 h-4 w-4 text-blue-400" />
                Prompt Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-3 text-xs text-white/80 md:grid-cols-2">
                <div>
                  <h4 className="mb-1 font-semibold text-white">
                    For Better Results:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Be specific about learning objectives</li>
                    <li>• Include target audience details</li>
                    <li>• Specify difficulty levels clearly</li>
                    <li>• Mention preferred content formats</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-white">Avoid:</h4>
                  <ul className="space-y-1">
                    <li>• Vague or unclear instructions</li>
                    <li>• Contradictory requirements</li>
                    <li>• Overly complex prompts</li>
                    <li>• Missing context information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
              <span className="text-xs text-white/60">
                {hasChanges ? "You have unsaved changes" : "No changes made"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isGenerating}
                  className="border-blue-400 text-blue-400 hover:bg-blue-500/20"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
