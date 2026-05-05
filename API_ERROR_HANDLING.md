# API Error Handling Documentation

## Overview
Both API routes now include comprehensive error handling with structured JSON responses containing error codes for client-side handling.

## `/api/analyze` Route

### Success Response (200)
```json
{
  "overallScore": 75,
  "currentSkills": [...],
  "requiredSkills": [...],
  "skillGaps": [...],
  "learningPath": [...],
  "strengths": [...],
  "areasForImprovement": [...],
  "interviewTopics": [...],
  "summary": "..."
}
```

### Error Responses

#### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```
**Cause**: User not authenticated
**Action**: Redirect to login

#### Invalid Request Body (400)
```json
{
  "error": "Invalid JSON in request body",
  "code": "INVALID_JSON"
}
```
**Cause**: Malformed JSON in POST body
**Action**: Check request formatting

#### Missing Resume (400)
```json
{
  "error": "Resume text is required and cannot be empty",
  "code": "MISSING_RESUME"
}
```
**Cause**: `resumeText` field is empty or missing
**Action**: Validate form input before submission

#### Missing Target Role (400)
```json
{
  "error": "Target role is required and cannot be empty",
  "code": "MISSING_TARGET_ROLE"
}
```
**Cause**: `targetRole` field is empty or missing
**Action**: Ensure role selector has a value

#### API Key Configuration Error (500)
```json
{
  "error": "Server configuration error",
  "code": "API_KEY_MISSING"
}
```
**Cause**: GEMINI_API_KEY environment variable not set
**Action**: Contact server administrator

#### Empty AI Response (500)
```json
{
  "error": "Empty response from AI service",
  "code": "EMPTY_RESPONSE"
}
```
**Cause**: Gemini API returned empty response
**Action**: Retry request or contact support

#### Invalid Response Format (500)
```json
{
  "error": "AI response format invalid",
  "code": "INVALID_RESPONSE_FORMAT"
}
```
**Cause**: Gemini API response couldn't be parsed as JSON
**Action**: Retry with different resume content

#### JSON Parse Error (500)
```json
{
  "error": "Failed to parse AI response as JSON",
  "code": "JSON_PARSE_ERROR"
}
```
**Cause**: Response JSON is malformed
**Action**: Retry request

#### Validation Error (500)
```json
{
  "error": "AI response failed validation",
  "code": "VALIDATION_ERROR"
}
```
**Cause**: Response doesn't match expected schema
**Action**: Retry with different resume

#### AI Service Error (500)
```json
{
  "error": "Model not found",
  "code": "MODEL_NOT_AVAILABLE"
}
```
**Cause**: Gemini model unavailable or deprecated
**Action**: Check model availability

#### Internal Server Error (500)
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```
**Cause**: Unexpected server error
**Action**: Check server logs, retry later

---

## `/api/interview` Route

### Success Response (200)
```
event-stream format:

data: {"type":"text","text":"Hello! I'm your technical interviewer..."}

data: [DONE]
```

### Error Responses

#### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```
**Cause**: User not authenticated
**Action**: Redirect to login

#### Invalid Request Body (400)
```json
{
  "error": "Invalid JSON in request body",
  "code": "INVALID_JSON"
}
```
**Cause**: Malformed JSON in POST body
**Action**: Check request formatting

#### Invalid Messages Format (400)
```json
{
  "error": "Messages must be an array",
  "code": "INVALID_MESSAGES"
}
```
**Cause**: `messages` parameter is not an array
**Action**: Ensure messages is formatted as array

#### Missing Target Role (400)
```json
{
  "error": "Target role is required",
  "code": "MISSING_TARGET_ROLE"
}
```
**Cause**: `targetRole` field is empty or missing
**Action**: Ensure role is passed with request

#### Missing User Message (400)
```json
{
  "error": "No user message provided",
  "code": "MISSING_MESSAGE"
}
```
**Cause**: Last message in array is empty
**Action**: Ensure user input is not empty

#### API Key Configuration Error (500)
```json
{
  "error": "Server configuration error",
  "code": "API_KEY_MISSING"
}
```
**Cause**: GEMINI_API_KEY environment variable not set
**Action**: Contact server administrator

#### Empty AI Response (500)
```json
{
  "error": "Empty response from AI service",
  "code": "EMPTY_RESPONSE"
}
```
**Cause**: Gemini API returned empty response
**Action**: Retry request

#### AI Service Error (500)
Returned as SSE error format:
```
data: {"type":"error","error":"Model not found","code":"MODEL_NOT_AVAILABLE"}
```
**Cause**: Gemini model unavailable
**Action**: Check model availability

#### Internal Server Error (500)
Returned as SSE error format:
```
data: {"type":"error","error":"Internal error message","code":"INTERNAL_ERROR"}
```
**Cause**: Unexpected server error
**Action**: Check server logs

---

## Error Handling Best Practices

### Client-Side Handling

```typescript
// Analyze route
try {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, targetRole }),
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (error.code) {
      case "AUTH_REQUIRED":
        // Redirect to login
        break;
      case "MISSING_RESUME":
      case "MISSING_TARGET_ROLE":
        // Show validation error to user
        break;
      case "API_KEY_MISSING":
        // Show "Service unavailable" message
        break;
      default:
        // Show generic error
        console.error(error);
    }
    return;
  }

  const result = await response.json();
  // Process successful analysis
} catch (err) {
  console.error("Network error:", err);
}
```

### Interview Route (SSE)

```typescript
try {
  for await (const chunk of streamInterviewResponse(role, messages)) {
    // Process text chunks
    console.log(chunk);
  }
} catch (err) {
  if (err.message.includes("AUTH_REQUIRED")) {
    // Handle auth error
  } else if (err.message.includes("MISSING")) {
    // Handle validation error
  } else {
    // Handle other errors
  }
}
```

---

## Testing Error Scenarios

### Test Missing Resume
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"targetRole":"Frontend Developer"}'
```

### Test Missing Target Role
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"My resume..."}'
```

### Test Invalid JSON
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
```

---

## Environment Configuration

Ensure `GEMINI_API_KEY` is set:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

Without this variable, all requests will return:
```json
{
  "error": "Server configuration error",
  "code": "API_KEY_MISSING"
}
```
