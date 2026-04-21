"use client";

import { ExportButton } from "@/components/analyzer/export-button";
import type { SkillAnalysis } from "@/lib/types";

interface ExportWrapperProps {
  analysis: SkillAnalysis;
  targetRole: string;
}

export function ExportWrapper({ analysis, targetRole }: ExportWrapperProps) {
  return <ExportButton analysis={analysis} targetRole={targetRole} />;
}
