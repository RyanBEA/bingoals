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
import type { Goal } from "@/types";

interface FreeSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (title: string) => Promise<void>;
}

export function FreeSpaceDialog({
  open,
  onOpenChange,
  goal,
  onSave,
}: FreeSpaceDialogProps) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title === "FREE SPACE" ? "" : goal.title);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim());
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Free Space</DialogTitle>
          <DialogDescription>
            Record an unplanned accomplishment! What did you achieve that
            wasn&apos;t on your original list?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accomplishment">Your Accomplishment</Label>
            <Input
              id="accomplishment"
              placeholder="e.g., Got a surprise promotion!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Saving..." : "Save & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
