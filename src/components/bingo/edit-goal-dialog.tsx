"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Trash2, RotateCcw } from "lucide-react";
import type { Goal } from "@/types";

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (goalId: string, title: string, category: string) => Promise<void>;
  onDelete: (goalId: string) => Promise<void>;
  onToggleComplete?: (goalId: string, completed: boolean) => Promise<void>;
}

export function EditGoalDialog({
  open,
  onOpenChange,
  goal,
  onSave,
  onDelete,
  onToggleComplete,
}: EditGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setCategory(goal.category);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!title.trim() || !goal) return;
    setSaving(true);
    await onSave(goal.id, title.trim(), category);
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!goal) return;
    if (!confirm("Delete this goal? It will become a placeholder.")) return;
    setDeleting(true);
    await onDelete(goal.id);
    setDeleting(false);
    onOpenChange(false);
  };

  const handleToggleComplete = async () => {
    if (!goal || !onToggleComplete) return;
    setToggling(true);
    await onToggleComplete(goal.id, !goal.isCompleted);
    setToggling(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the goal title or category, or delete it to create a
            placeholder.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Goal</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="CAREER">Career</option>
              <option value="HEALTH">Health</option>
              <option value="CREATIVE">Creative</option>
              <option value="RELATIONSHIPS">Relationships</option>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2 mr-auto">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving || toggling}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            {goal?.isCompleted && onToggleComplete && (
              <Button
                variant="outline"
                onClick={handleToggleComplete}
                disabled={deleting || saving || toggling}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {toggling ? "..." : "Mark Incomplete"}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
