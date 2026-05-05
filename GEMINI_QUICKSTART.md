# Gemini API Integration - Quick Start Guide

## Environment Setup ✅
The `GEMINI_API_KEY` environment variable has been added. Ensure it's set in your Vercel project settings.

## Features Overview

### 📄 Resume Analysis
**Endpoint**: `POST /api/analyze`
- Analyzes your resume for a target role
- Returns comprehensive skill gap analysis including:
  - Overall readiness score (0-100%)
  - Current skills with proficiency levels
  - Required skills by importance
  - Specific skill gaps with priorities
  - Structured learning path with resources
  - Interview preparation topics
  - Key strengths and areas for improvement

**Frontend**: `/dashboard/analyze`
- Upload PDF or TXT resume
- Select target role
- View detailed analysis with visualizations
- Auto-saves to localStorage and database

### 🎤 Mock Interview
**Endpoint**: `POST /api/interview`
- Conducts mock technical interviews
- Asks 5-8 tailored questions (technical, behavioral, situational)
- Provides real-time feedback on answers
- Adapts difficulty based on performance
- Gives final score and improvement suggestions

**Frontend**: `/dashboard/interview`
- Select target role
- Real-time conversation with AI interviewer
- Can ask follow-up questions
- Get comprehensive feedback

### 📊 Analysis History
**Endpoint**: `GET /dashboard/history`
- View all saved analyses
- Quick analyses stored in localStorage
- Saved analyses from database
- Delete individual items or clear history
- Sort by score and date

## Technical Details

### API Routes
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/analyze` | POST | Required | Resume analysis |
| `/api/interview` | POST | Required | Mock interview |
| `/api/analyze/save` | POST | Required | Save analysis |

### Data Flow
1. **Client** uploads resume → **Server**
2. **Server** calls **Gemini API** with analysis prompt
3. **Gemini** returns structured JSON analysis
4. **Server** validates and returns to **Client**
5. **Client** saves to localStorage + database (optional)

### Storage Options
- **localStorage**: Fast, offline-capable, browser-based (50 items max)
- **Supabase**: Persistent, shareable, requires authentication
- Both are automatically used together

## Important Notes

### Security
- ✅ API key is server-side only - never exposed to client
- ✅ All Gemini calls happen on the backend
- ✅ User data is encrypted in transit and at rest
- ✅ Requires Supabase authentication

### Performance
- ✅ Single JSON responses (no streaming overhead)
- ✅ Cached locally with localStorage
- ✅ Real-time SSE for interview conversation
- ✅ Optimized for fast response times

### Limitations
- Max resume size: Limited by browser upload (typically 50MB)
- Max localStorage items: 50 recent analyses
- Interview question limit: ~8 questions per session
- Response time: Depends on Gemini API rate limits

## Troubleshooting

### PDF Upload Error
**Issue**: "Warning: Setting up fake worker"
- **Solution**: Already fixed! PDF worker now uses bundled version
- App automatically handles PDF text extraction

### No Gemini Response
**Issue**: API returns error or timeout
- **Check**: GEMINI_API_KEY is set in environment
- **Check**: API key is valid and has sufficient quota
- **Check**: Resume text is not empty (min 50 chars)

### Missing Analyses
**Issue**: Previous analyses not showing
- **Solution**: Check localStorage in browser DevTools
- **Solution**: Check Supabase database for saved analyses
- **Solution**: May need to re-analyze after clearing cache

## Testing

### Manual Testing Flow
1. Navigate to `/dashboard/analyze`
2. Upload your resume (PDF or TXT)
3. Select a target role
4. Click "Analyze Resume"
5. View results and check localStorage
6. Navigate to `/dashboard/interview`
7. Start a mock interview
8. Answer questions and get feedback

### Browser DevTools
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('skillGapHistory'))

// Clear history
localStorage.removeItem('skillGapHistory')
```

## Next Steps
1. Test resume analysis with sample data
2. Test mock interview flow
3. Verify database saves
4. Monitor Gemini API usage and costs
5. Consider adding rate limiting if needed
