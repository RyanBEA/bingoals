"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CSVUploader } from "@/components/cards/csv-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Shuffle, Check } from "lucide-react";
import type { ParsedGoal, Category } from "@/lib/csv-parser";
import { randomizeGrid } from "@/lib/randomize-grid";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/types";

type Step = "details" | "upload" | "preview";

export default function NewCardPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState(`Q${currentQuarter} ${currentYear} Goals`);
  const [quarter, setQuarter] = useState(currentQuarter);
  const [year, setYear] = useState(currentYear);
  const [goals, setGoals] = useState<ParsedGoal[]>([]);
  const [previewGoals, setPreviewGoals] = useState<
    ReturnType<typeof randomizeGrid>
  >([]);
  const [creating, setCreating] = useState(false);

  const handleGoalsParsed = (parsedGoals: ParsedGoal[]) => {
    setGoals(parsedGoals);
    const positioned = randomizeGrid(parsedGoals);
    setPreviewGoals(positioned);
    setStep("preview");
  };

  const handleShuffle = () => {
    const positioned = randomizeGrid(goals);
    setPreviewGoals(positioned);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quarter,
          year,
          goals,
        }),
      });

      if (response.ok) {
        const card = await response.json();
        router.push(`/cards/${card.id}`);
      } else {
        alert("Failed to create card");
        setCreating(false);
      }
    } catch {
      alert("Failed to create card");
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Card</h1>
          <p className="text-muted-foreground">
            {step === "details" && "Step 1: Card Details"}
            {step === "upload" && "Step 2: Upload Goals"}
            {step === "preview" && "Step 3: Preview & Create"}
          </p>
        </div>
      </div>

      {/* Step: Details */}
      {step === "details" && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 2026 Goals"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter</Label>
              <Select
                id="quarter"
                value={quarter.toString()}
                onChange={(e) => setQuarter(parseInt(e.target.value))}
              >
                <option value="1">Q1 (Jan-Mar)</option>
                <option value="2">Q2 (Apr-Jun)</option>
                <option value="3">Q3 (Jul-Sep)</option>
                <option value="4">Q4 (Oct-Dec)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min={2024}
                max={2030}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep("upload")} disabled={!name.trim()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <CSVUploader onGoalsParsed={handleGoalsParsed} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("details")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Preview</h3>
            <Button variant="outline" size="sm" onClick={handleShuffle}>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>

          {/* Mini Grid Preview */}
          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            {previewGoals.map((goal) => {
              const category = goal.category as Category;
              const colors =
                CATEGORY_COLORS[category] || CATEGORY_COLORS.CAREER;
              return (
                <div
                  key={goal.position}
                  className={cn(
                    "aspect-square rounded flex items-center justify-center p-1 text-center",
                    colors.bg,
                    colors.border,
                    "border",
                    goal.isFreeSpace &&
                      "bg-yellow-100 border-yellow-500",
                    goal.isPlaceholder &&
                      "bg-gray-100 border-gray-300 border-dashed"
                  )}
                >
                  <span className="text-[8px] leading-tight line-clamp-2">
                    {goal.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Category Summary */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Category Distribution</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(["CAREER", "HEALTH", "CREATIVE", "RELATIONSHIPS"] as const).map(
                (cat) => {
                  const count = goals.filter((g) => g.category === cat).length;
                  const colors = CATEGORY_COLORS[cat];
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-3 h-3 rounded",
                          colors.bg,
                          colors.border,
                          "border"
                        )}
                      />
                      <span>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}: {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
            {goals.length < 24 && (
              <p className="text-sm text-muted-foreground mt-2">
                {24 - goals.length} placeholder slot
                {24 - goals.length !== 1 ? "s" : ""} will be created
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                "Creating..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Card
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
