"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { RoleSelector } from "@/components/analyzer/role-selector";
import type { TargetRole } from "@/lib/types";
import { streamInterviewResponse } from "@/lib/interview-client";
import {
  MessageSquare,
  Send,
  Play,
  RotateCcw,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  text: string;
  id?: string;
}

export default function InterviewPage() {
  const [targetRole, setTargetRole] = useState<TargetRole | "">("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    if (!targetRole) return;
    setInterviewStarted(true);
    setIsLoading(true);
    
    const userMessage: Message = {
      role: "user",
      text: `Hello! I'm ready for my mock interview for the ${targetRole} position.`,
      id: Date.now().toString(),
    };
    
    setMessages([userMessage]);

    try {
      let assistantResponse = "";
      
      for await (const chunk of streamInterviewResponse(
        targetRole,
        [userMessage]
      )) {
        assistantResponse += chunk;
      }

      if (assistantResponse) {
        const assistantMessage: Message = {
          role: "assistant",
          text: assistantResponse,
          id: (Date.now() + 1).toString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Interview error:", error);
      const errorMessage: Message = {
        role: "assistant",
        text: "I encountered an error. Please try again.",
        id: (Date.now() + 1).toString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      text: inputValue,
      id: Date.now().toString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      let assistantResponse = "";
      
      for await (const chunk of streamInterviewResponse(
        targetRole,
        updatedMessages
      )) {
        assistantResponse += chunk;
      }

      if (assistantResponse) {
        const assistantMessage: Message = {
          role: "assistant",
          text: assistantResponse,
          id: (Date.now() + 1).toString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Interview error:", error);
      const errorMessage: Message = {
        role: "assistant",
        text: "I encountered an error. Please try again.",
        id: (Date.now() + 1).toString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setMessages([]);
    setInterviewStarted(false);
    setInputValue("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mock Interview</h1>
        <p className="mt-1 text-muted-foreground">
          Practice your interview skills with our AI interviewer.
        </p>
      </div>

      {!interviewStarted ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start a New Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RoleSelector value={targetRole} onChange={setTargetRole} />

            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="font-medium text-foreground">
                What to expect:
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• 5-8 interview questions tailored to your role</li>
                <li>• Mix of technical, behavioral, and situational questions</li>
                <li>• Real-time feedback and tips</li>
                <li>• Final score and improvement suggestions</li>
              </ul>
            </div>

            <Button
              onClick={startInterview}
              disabled={!targetRole}
              className="w-full gap-2"
              size="lg"
            >
              <Play className="h-4 w-4" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex h-[600px] flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Interviewer</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {targetRole} Interview
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetInterview}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New Interview
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isUser ? "flex-row-reverse" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          isUser ? "bg-primary/10" : "bg-accent/10"
                        )}
                      >
                        {isUser ? (
                          <User className="h-4 w-4 text-primary" />
                        ) : (
                          <Bot className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                    <div className="rounded-lg bg-muted px-4 py-2">
                      <Spinner className="h-4 w-4" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  className="min-h-[80px] resize-none"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  className="h-[80px] w-12"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
