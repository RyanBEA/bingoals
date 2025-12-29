"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseGoalsCSV, type ParsedGoal } from "@/lib/csv-parser";

interface CSVUploaderProps {
  onGoalsParsed: (goals: ParsedGoal[]) => void;
}

export function CSVUploader({ onGoalsParsed }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setErrors([]);
      setSuccess(false);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = parseGoalsCSV(content);

        if (result.success && result.goals) {
          setSuccess(true);
          onGoalsParsed(result.goals);
        } else {
          setErrors(result.errors || ["Failed to parse CSV"]);
        }
      };
      reader.readAsText(file);
    },
    [onGoalsParsed]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          success && "border-green-500 bg-green-50",
          errors.length > 0 && "border-red-500 bg-red-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            {success ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : errors.length > 0 ? (
              <AlertCircle className="w-10 h-10 text-red-500" />
            ) : fileName ? (
              <FileText className="w-10 h-10 text-muted-foreground" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground" />
            )}
            <div>
              {fileName ? (
                <p className="font-medium">{fileName}</p>
              ) : (
                <p className="text-muted-foreground">
                  Drag and drop a CSV file, or click to browse
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" type="button">
              Choose File
            </Button>
          </div>
        </label>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Errors found:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium mb-2">CSV Format</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Your CSV should have the following columns:
        </p>
        <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
          {`title,category,description
"Get promoted",CAREER,"Achieve senior level"
"Run a marathon",HEALTH,
"Write a book",CREATIVE,"Fiction novel"`}
        </pre>
        <p className="text-sm text-muted-foreground mt-2">
          Categories: CAREER, HEALTH, CREATIVE, RELATIONSHIPS
          <br />
          Maximum 24 goals (remaining slots become placeholders)
        </p>
      </div>
    </div>
  );
}
