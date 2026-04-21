"use client";

import type { SkillAnalysis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface AnalysisResultsProps {
  analysis: SkillAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getGapColor = (gap: string) => {
    switch (gap) {
      case "large":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "small":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical":
      case "high":
        return "bg-destructive/10 text-destructive";
      case "important":
      case "medium":
        return "bg-chart-4/10 text-chart-4";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLevelWidth = (level: string) => {
    switch (level) {
      case "advanced":
        return 100;
      case "intermediate":
        return 66;
      case "beginner":
        return 33;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Overall Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {analysis.overallScore}%
            </div>
            <Progress value={analysis.overallScore} className="flex-1" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="learning">Learning Path</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="interview">Interview Prep</TabsTrigger>
        </TabsList>

        {/* Skill Gaps Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-chart-4" />
                Priority Skill Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.skillGaps
                .sort((a, b) => a.priority - b.priority)
                .map((gap, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getGapColor(gap.gap)}
                        >
                          {gap.gap} gap
                        </Badge>
                        <span className="font-medium text-foreground">
                          {gap.skill}
                        </span>
                      </div>
                      <Badge variant="secondary">Priority {gap.priority}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {gap.recommendation}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.areasForImprovement.map((area, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="learning" className="space-y-4">
          {analysis.learningPath.map((phase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Phase {phase.phase}: {phase.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Duration: {phase.duration}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Skills to Learn:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Resources:
                  </p>
                  <div className="space-y-2">
                    {phase.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {resource.type}
                          </Badge>
                          <span className="text-sm text-foreground">
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {resource.estimatedTime}
                          </span>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Current Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.currentSkills.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {skill.name}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {skill.level}
                    </Badge>
                  </div>
                  <Progress value={getLevelWidth(skill.level)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills for Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.requiredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {skill.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={getImportanceColor(skill.importance)}
                    >
                      {skill.importance}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{skill.currentLevel}</span>
                    <span>→</span>
                    <span className="capitalize text-primary">
                      {skill.targetLevel}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Prep Tab */}
        <TabsContent value="interview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Interview Topics to Prepare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.interviewTopics.map((topic, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getImportanceColor(topic.importance)}
                    >
                      {topic.importance}
                    </Badge>
                    <span className="font-medium text-foreground">
                      {topic.topic}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {topic.preparationTips.map((tip, tipIndex) => (
                      <li
                        key={tipIndex}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
