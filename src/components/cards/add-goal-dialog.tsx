"use client";

import { useState } from "react";
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

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, category: string) => Promise<void>;
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onSave,
}: AddGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CAREER");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), category);
    setTitle("");
    setCategory("CAREER");
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add Goal</DialogTitle>
          <DialogDescription>
            Add a new goal to fill this placeholder. It will be randomly placed
            on the card.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal</Label>
            <Input
              id="goal-title"
              placeholder="e.g., Learn a new programming language"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-category">Category</Label>
            <Select
              id="goal-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="CAREER">Career</option>
              <option value="HEALTH">Health</option>
              <option value="CREATIVE">Creative</option>
              <option value="RELATIONSHIPS">Relationships</option>
              <option value="FINANCIAL">Financial</option>
              <option value="HOME">Home</option>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Adding..." : "Add Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
