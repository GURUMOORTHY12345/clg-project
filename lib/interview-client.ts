// Custom client for handling Gemini interview streaming
export interface InterviewMessage {
  role: "user" | "assistant";
  text: string;
  id?: string;
}

export async function* streamInterviewResponse(
  targetRole: string,
  messages: InterviewMessage[]
) {
  try {
    const response = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, targetRole }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to get interview response";

      if (contentType?.includes("application/json")) {
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.error || errorMessage;
        } catch {
          // Fallback to status text
          errorMessage = response.statusText || errorMessage;
        }
      } else {
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(`${response.status}: ${errorMessage}`);
    }

    if (!response.body) {
      throw new Error("No response body from server");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let hasError = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle error response
              if (parsed.type === "error") {
                hasError = true;
                throw new Error(
                  `${parsed.code}: ${parsed.error}`
                );
              }

              // Yield text response
              if (parsed.text) {
                yield parsed.text;
              }
            } catch (parseErr) {
              if (!hasError) {
                console.error("Failed to parse SSE data:", parseErr);
              }
              // Continue processing other lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
