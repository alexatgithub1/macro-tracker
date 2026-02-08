# Macro Tracker MVP

Personal diet, macros & workout journal optimized for zero-friction logging.

## Quick Start

```bash
cd "/Users/alexwang/GitHub Test/macro-tracker"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What's Built (MVP v0.1)

### ✅ Core Features
- Today view with real-time macro tracking
- Calorie & protein progress bars
- Deficit calculation
- Food logging UI (manual entry ready)
- Workout logging UI
- Dark mode minimal design

### 🚧 In Progress
- Voice input for meals
- Photo analysis for meals
- Daily journal generation
- Next-day recommendations
- HealthKit integration

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- date-fns (date utilities)
- Claude API (for voice/photo analysis)

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main Today view
├── lib/
│   ├── store.ts          # Zustand state management
│   └── types.ts          # TypeScript interfaces
└── components/           # Reusable components (coming)
```

## User Flow

1. Open app → See today's summary
2. Tap "+" → Choose voice/photo/manual
3. Log meal → Auto-calculates macros
4. Review deficit → See recommendation

## Next Steps

1. Add voice recording + transcription
2. Add photo upload + AI analysis
3. Build journal generation logic
4. Add navigation (Today / Journal / Settings)
5. Persist data (localStorage for MVP, Supabase for prod)

## Design Philosophy

**Zero friction**. This is not a social app. No streaks, no gamification. Just fast logging and smart recommendations.

The best tracking app is the one you forget you're using.
