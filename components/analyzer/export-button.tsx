"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { SkillAnalysis } from "@/lib/types";

interface ExportButtonProps {
  analysis: SkillAnalysis;
  targetRole: string;
}

export function ExportButton({ analysis, targetRole }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Generate HTML content for the PDF
      const htmlContent = generateReportHTML(analysis, targetRole);

      // Open in a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        // Small delay to ensure styles are loaded
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      {isExporting ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

function generateReportHTML(analysis: SkillAnalysis, targetRole: string): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Skill Gap Analysis Report - ${targetRole}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 28px;
      color: #0d9488;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-top: 32px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e5e5;
    }
    h3 {
      font-size: 16px;
      color: #404040;
      margin-top: 20px;
      margin-bottom: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid #0d9488;
    }
    .subtitle {
      color: #666;
      font-size: 16px;
      margin-top: 4px;
    }
    .date {
      color: #888;
      font-size: 14px;
      margin-top: 8px;
    }
    .score-box {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      margin: 24px 0;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
    }
    .score-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .summary {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .skill-gap {
      background: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .skill-gap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .skill-name {
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-large { background: #fee2e2; color: #991b1b; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-small { background: #d1fae5; color: #065f46; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-important { background: #fef3c7; color: #92400e; }
    .badge-nice { background: #e0e7ff; color: #3730a3; }
    .list {
      padding-left: 20px;
    }
    .list li {
      margin-bottom: 8px;
    }
    .phase {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .phase-title {
      font-weight: 600;
      color: #0d9488;
    }
    .duration {
      color: #666;
      font-size: 14px;
    }
    .resource {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      margin-top: 8px;
      font-size: 14px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e5e5e5;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Skill Gap Analysis Report</h1>
    <div class="subtitle">Target Role: ${targetRole}</div>
    <div class="date">Generated on ${currentDate}</div>
  </div>

  <div class="score-box">
    <div class="score-value">${analysis.overallScore}%</div>
    <div class="score-label">Overall Job Readiness Score</div>
  </div>

  <div class="summary">
    <p>${analysis.summary}</p>
  </div>

  <h2>Skill Gaps Analysis</h2>
  ${analysis.skillGaps
    .sort((a, b) => a.priority - b.priority)
    .map(
      (gap) => `
    <div class="skill-gap">
      <div class="skill-gap-header">
        <span class="skill-name">${gap.skill}</span>
        <span class="badge badge-${gap.gap}">${gap.gap} gap</span>
      </div>
      <p style="color: #666; font-size: 14px;">${gap.recommendation}</p>
    </div>
  `
    )
    .join("")}

  <h2>Your Strengths</h2>
  <ul class="list">
    ${analysis.strengths.map((s) => `<li>${s}</li>`).join("")}
  </ul>

  <h2>Areas for Improvement</h2>
  <ul class="list">
    ${analysis.areasForImprovement.map((a) => `<li>${a}</li>`).join("")}
  </ul>

  <div class="page-break"></div>

  <h2>Personalized Learning Path</h2>
  ${analysis.learningPath
    .map(
      (phase) => `
    <div class="phase">
      <div class="phase-header">
        <span class="phase-title">Phase ${phase.phase}: ${phase.title}</span>
        <span class="duration">${phase.duration}</span>
      </div>
      <p style="margin-bottom: 12px;"><strong>Skills:</strong> ${phase.skills.join(", ")}</p>
      <div>
        <strong>Resources:</strong>
        ${phase.resources
          .map(
            (r) => `
          <div class="resource">
            <strong>${r.name}</strong> (${r.type}) - ${r.estimatedTime}
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("")}

  <h2>Interview Preparation Topics</h2>
  ${analysis.interviewTopics
    .map(
      (topic) => `
    <div class="skill-gap">
      <div class="skill-gap-header">
        <span class="skill-name">${topic.topic}</span>
        <span class="badge badge-${topic.importance === "high" ? "critical" : topic.importance === "medium" ? "important" : "nice"}">${topic.importance} priority</span>
      </div>
      <ul style="margin-top: 8px; padding-left: 20px; font-size: 14px; color: #666;">
        ${topic.preparationTips.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>
    </div>
  `
    )
    .join("")}

  <div class="footer">
    <p>Generated by SkillBridge AI - Your Career Success Partner</p>
    <p>www.skillbridge.ai</p>
  </div>
</body>
</html>
  `;
}
