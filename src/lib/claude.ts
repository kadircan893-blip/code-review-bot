import Groq from "groq-sdk";
import { z } from "zod";
import type { UserSettings } from "@prisma/client";
import type { PRFile } from "@/types/github";
import type { PullRequest } from "@prisma/client";

// ─── Singleton Client ─────────────────────────────────────────────────────────

let client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return client;
}

// ─── Response Schema ──────────────────────────────────────────────────────────

const CommentCategoryEnum = z.enum([
  "BUG",
  "SECURITY",
  "PERFORMANCE",
  "STYLE",
  "MAINTAINABILITY",
  "DOCUMENTATION",
  "TEST_COVERAGE",
  "GENERAL",
]);

const SeverityEnum = z.enum(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const ReviewCommentSchema = z.object({
  path: z.string(),
  line: z.number().int().nullable(),
  side: z.enum(["LEFT", "RIGHT"]).nullable(),
  category: CommentCategoryEnum,
  severity: SeverityEnum,
  title: z.string(),
  body: z.string(),
  suggestion: z.string().nullable(),
});

export const ReviewResponseSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  highlights: z.array(z.string()),
  comments: z.array(ReviewCommentSchema),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type ReviewComment = z.infer<typeof ReviewCommentSchema>;

// ─── Prompt Builders ──────────────────────────────────────────────────────────

/**
 * Builds the system prompt for the AI code reviewer.
 */
export function buildSystemPrompt(settings: UserSettings): string {
  const focusAreas = settings.focusAreas.split(",").map((s) => s.trim());
  const threshold = settings.severityThreshold;

  return `You are an expert software engineer and code reviewer with 15+ years of experience across multiple languages and paradigms. Your role is to provide thorough, actionable, and constructive code reviews.

## Your Review Focus
You should focus specifically on these areas: ${focusAreas.join(", ")}.

## Severity Guidelines
Only report issues at or above the "${threshold}" severity level:
- INFO: Style suggestions, minor improvements
- LOW: Small code quality issues
- MEDIUM: Notable bugs or design problems
- HIGH: Significant bugs, security vulnerabilities, or performance issues
- CRITICAL: Critical security flaws, data loss risks, or breaking bugs

## Response Format
You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "summary": "2-3 sentence overview of the PR quality and main concerns",
  "score": 85,
  "highlights": ["Positive thing 1", "Positive thing 2"],
  "comments": [
    {
      "path": "src/auth/login.ts",
      "line": 42,
      "side": "RIGHT",
      "category": "SECURITY",
      "severity": "HIGH",
      "title": "Short issue title",
      "body": "Detailed explanation with context and why this is a problem (markdown supported)",
      "suggestion": "optional: suggested replacement code as a string, or null"
    }
  ]
}

## Rules
- Be specific: always reference exact file names and line numbers when possible
- Be constructive: explain WHY something is a problem and HOW to fix it
- Be balanced: acknowledge what works well in the highlights section
- Score from 0-100: 90+ means excellent, 70-89 is good, 50-69 needs work, <50 has serious issues
- Only include comments that add value — avoid nitpicking
- Maximum 20 comments per review to keep feedback focused
${settings.customInstructions ? `\n## Additional Instructions\n${settings.customInstructions}` : ""}`;
}

/**
 * Builds the user message containing PR diff content.
 */
export function buildUserMessage(
  pr: Pick<
    PullRequest,
    "title" | "body" | "baseBranch" | "headBranch" | "authorLogin"
  >,
  files: PRFile[],
  settings: UserSettings
): string {
  const lines: string[] = [
    `# Pull Request: ${pr.title}`,
    ``,
    `**Author:** ${pr.authorLogin}`,
    `**Branch:** \`${pr.headBranch}\` → \`${pr.baseBranch}\``,
    `**Files Changed:** ${files.length}`,
    ``,
    pr.body ? `## Description\n${pr.body}\n` : "",
    `## Changed Files`,
    ``,
  ];

  let totalLines = lines.join("\n").split("\n").length;

  for (const file of files) {
    if (!file.patch) continue;

    const fileHeader = [
      `### ${file.filename}`,
      `Status: ${file.status} | +${file.additions} -${file.deletions}`,
      ``,
      "```diff",
    ];

    const patchLines = file.patch.split("\n");
    const remainingBudget = settings.maxDiffLines - totalLines - 10;

    if (remainingBudget <= 0) {
      lines.push(
        `\n*[${files.length} files total — showing truncated due to size limit]*`
      );
      break;
    }

    const truncatedPatch = patchLines.slice(0, remainingBudget).join("\n");
    const wasTruncated = patchLines.length > remainingBudget;

    lines.push(
      ...fileHeader,
      truncatedPatch,
      "```",
      wasTruncated ? `*[... ${patchLines.length - remainingBudget} more lines truncated]*` : "",
      ""
    );

    totalLines += fileHeader.length + truncatedPatch.split("\n").length + 3;
  }

  lines.push(
    "",
    "---",
    "Please review the above changes and respond with ONLY the JSON object as specified in your instructions."
  );

  return lines.filter((l) => l !== undefined).join("\n");
}

/**
 * Runs the AI code review for a pull request using Groq.
 */
export async function runCodeReview(params: {
  pr: Pick<
    PullRequest,
    "title" | "body" | "baseBranch" | "headBranch" | "authorLogin"
  >;
  files: PRFile[];
  settings: UserSettings;
}): Promise<ReviewResponse & { promptTokens: number; completionTokens: number }> {
  const groq = getGroqClient();

  const systemPrompt = buildSystemPrompt(params.settings);
  const userMessage = buildUserMessage(params.pr, params.files, params.settings);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const rawText = completion.choices[0]?.message?.content ?? "";

  // Extract JSON from response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Groq returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Failed to parse Groq JSON response: ${jsonMatch[0].slice(0, 200)}`);
  }

  const validated = ReviewResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Groq response failed schema validation: ${JSON.stringify(validated.error.issues)}`
    );
  }

  return {
    ...validated.data,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
  };
}
