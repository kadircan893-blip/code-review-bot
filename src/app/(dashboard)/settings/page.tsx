"use client";

import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const FOCUS_AREAS = [
  { value: "bugs", label: "Bugs & Logic Errors" },
  { value: "security", label: "Security Vulnerabilities" },
  { value: "performance", label: "Performance Issues" },
  { value: "style", label: "Code Style" },
  { value: "maintainability", label: "Maintainability" },
  { value: "documentation", label: "Documentation" },
  { value: "tests", label: "Test Coverage" },
];

const SEVERITY_OPTIONS = [
  { value: "INFO", label: "INFO — everything" },
  { value: "LOW", label: "LOW and above (recommended)" },
  { value: "MEDIUM", label: "MEDIUM and above" },
  { value: "HIGH", label: "HIGH and above only" },
  { value: "CRITICAL", label: "CRITICAL only" },
];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    reviewOnDraft: false,
    autoPostComments: true,
    minChangedFiles: 1,
    maxDiffLines: 2000,
    focusAreas: ["bugs", "security", "performance", "style"],
    severityThreshold: "LOW",
    customInstructions: "",
  });

  // Sync settings into form when loaded
  useEffect(() => {
    if (!settings) return;
    const s = settings as typeof form & { focusAreas: string };
    setForm({
      reviewOnDraft: s.reviewOnDraft,
      autoPostComments: s.autoPostComments,
      minChangedFiles: s.minChangedFiles,
      maxDiffLines: s.maxDiffLines,
      focusAreas: (s.focusAreas ?? "bugs,security,performance,style").split(",").filter(Boolean),
      severityThreshold: s.severityThreshold,
      customInstructions: s.customInstructions ?? "",
    });
  }, [settings]);

  function toggleFocusArea(area: string) {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  }

  async function handleSave() {
    await updateSettings.mutateAsync({
      ...form,
      focusAreas: form.focusAreas as ("bugs" | "security" | "performance" | "style" | "maintainability" | "documentation" | "tests")[],
      severityThreshold: form.severityThreshold as "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      customInstructions: form.customInstructions || null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-32 rounded-lg shimmer" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-zinc-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-zinc-400 text-sm mt-0.5">Configure how Code Review Bot analyzes your PRs.</p>
        </div>
      </div>

      {/* Review Behavior */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-white font-semibold">Review Behavior</h3>

        <Toggle
          label="Review draft PRs"
          description="Also review PRs marked as draft."
          checked={form.reviewOnDraft}
          onChange={(v) => setForm((p) => ({ ...p, reviewOnDraft: v }))}
        />
        <Toggle
          label="Auto-post to GitHub"
          description="Automatically post the review as a GitHub PR comment."
          checked={form.autoPostComments}
          onChange={(v) => setForm((p) => ({ ...p, autoPostComments: v }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Min changed files"
            description="Skip PRs with fewer files."
            value={form.minChangedFiles}
            min={1}
            max={100}
            onChange={(v) => setForm((p) => ({ ...p, minChangedFiles: v }))}
          />
          <NumberInput
            label="Max diff lines"
            description="Truncate large diffs."
            value={form.maxDiffLines}
            min={100}
            max={10000}
            step={100}
            onChange={(v) => setForm((p) => ({ ...p, maxDiffLines: v }))}
          />
        </div>
      </section>

      {/* Focus Areas */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-white font-semibold">Focus Areas</h3>
        <p className="text-zinc-400 text-sm">Select which categories the AI should look for.</p>

        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => {
            const active = form.focusAreas.includes(area.value);
            return (
              <button
                key={area.value}
                onClick={() => toggleFocusArea(area.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm transition-all",
                  active
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                )}
              >
                {area.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Severity Threshold */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
        <h3 className="text-white font-semibold">Severity Threshold</h3>
        <p className="text-zinc-400 text-sm">Only report issues at or above this severity.</p>

        <select
          value={form.severityThreshold}
          onChange={(e) => setForm((p) => ({ ...p, severityThreshold: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-all"
        >
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
      </section>

      {/* Custom Instructions */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
        <h3 className="text-white font-semibold">Custom Instructions</h3>
        <p className="text-zinc-400 text-sm">
          Additional context or rules for the AI reviewer (max 2000 chars).
        </p>
        <textarea
          value={form.customInstructions}
          onChange={(e) => setForm((p) => ({ ...p, customInstructions: e.target.value }))}
          maxLength={2000}
          rows={4}
          placeholder="e.g. We use TypeScript strict mode. Always check for null handling. Our API follows REST conventions..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-all resize-none text-sm"
        />
        <p className="text-zinc-600 text-xs">{form.customInstructions.length}/2000</p>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
          checked ? "bg-violet-600" : "bg-zinc-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

function NumberInput({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-white text-sm font-medium">{label}</label>
      <p className="text-zinc-500 text-xs">{description}</p>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-all text-sm"
      />
    </div>
  );
}
