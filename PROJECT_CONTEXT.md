# Project Overview

This is a Next.js App Router SaaS app for AI-powered marketing tools. The product direction is a modular AI marketing system builder, not one giant content generator. The app is organized into separate tool families so strategy and content stay clearly separated.

Current top-level product areas:
- Avatar Analyzer
- Lead Magnet
- Launch
- Content Generator

Main goal:
- use Avatar as the shared business/customer foundation
- let users create strategic plans and then turn those plans into real marketing assets in focused, separate tools

# Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- OpenAI API via `openai` package
- localStorage for workflow continuity
- Vercel-style deployment target
- No database currently in use for this feature set

# Current Architecture

## High-level route structure

- `app/page.tsx`
  - main home page with cards for Content Generator, Lead Magnet, Launch
- `app/avatar-analyzer/page.tsx`
  - avatar analysis tool
- `app/lead-magnet-builder/...`
  - lead magnet strategy flow
- `app/lead-magnet-content/page.tsx`
  - lead magnet content generation
- `app/launch-sequence/...`
  - launch and prelaunch flow
- `app/content-generator/...`
  - content execution tools

## Content Generator structure

- `app/content-generator/page.tsx`
  - hub page
- `app/content-generator/30-day-planner/page.tsx`
  - planner input page
- `app/content-generator/30-day-planner/final/page.tsx`
  - saved/generated 30-day plan page
- `app/content-generator/social-post/page.tsx`
  - real execution page with planner mode + structured freestyle mode
- `app/content-generator/video-script/page.tsx`
  - real execution page with planner mode + structured freestyle mode
- `app/content-generator/types.ts`
  - shared planner/generator types

## Content Generator API routes

- `app/api/content-generator/30-day-planner/route.ts`
  - generates 30-day content plan
- `app/api/content-generator/social-post/route.ts`
  - generates finished Facebook-style social post
- `app/api/content-generator/video-script/route.ts`
  - generates finished video script

## Launch structure relevant to next task

- `app/launch-sequence/page.tsx`
  - launch hub
- `app/launch-sequence/prelaunch/page.tsx`
  - step 2 hub
- `app/launch-sequence/prelaunch-content/page.tsx`
  - hub for prelaunch content pieces
- `app/launch-sequence/prelaunch-content/plc-1/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-2/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-3/page.tsx`

## Launch API routes relevant to next task

- `app/api/launch-sequence/prelaunch-content/plc-1/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-2/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-3/route.ts`

## localStorage usage

Important shared keys:
- `confirmedAvatarAnalysis`
- `confirmedStructuredAvatar`

Launch keys:
- `launchSequenceOffer`
- `launchSequenceOfferDetails`
- `launchSequenceOfferFormat`
- `launchSequencePrice`
- `launchSequenceGoal`
- `launchSequenceContext`
- `launchSequencePrelaunchPlan`
- `launchSequencePlc1Content`
- `launchSequencePlc2Content`
- `launchSequencePlc3Content`

Content Generator keys:
- `contentPlanner30Input`
- `contentPlanner30Plan`
- `contentPlanner30SelectedDay`
- `contentGeneratorSocialPostMode`
- `contentGeneratorSocialPostInput`
- `contentGeneratorSocialPostResult`
- `contentGeneratorVideoScriptMode`
- `contentGeneratorVideoScriptInput`
- `contentGeneratorVideoScriptResult`

# Current Progress

## Already completed

### Content Generator hub
- `Content Generator` main page is no longer a placeholder
- it now links to:
  - `30-Day Content Planner`
  - `Social Post Generator`
  - `Video Script Generator`

### 30-Day Content Planner
- input page built
- final page built
- planner reads Avatar context from:
  - `confirmedAvatarAnalysis`
  - `confirmedStructuredAvatar`
- user input is currently:
  - primary platform
  - optional tone/style direction
  - optional extra context
- planner generates a mixed 30-day content calendar across:
  - ให้ความรู้
  - สร้างความน่าสนใจ
  - สร้างความบันเทิง
  - สร้างความไว้วางใจ
  - กระตุ้นการมีส่วนร่วม
- planner now only recommends 2 content execution types:
  - `social-post`
  - `video-script`
- planner final page is hydration-safe
- planner input page shows saved plan summary if one already exists

### Social Post Generator
- fully implemented as a real execution page
- supports:
  - planner mode
  - freestyle mode
- freestyle mode uses structured writing framework instead of one blank textarea
- planner mode has:
  - selected day summary
  - `สร้างโพสท์`
  - `เลือกวันอื่น`
- freestyle mode has:
  - structured Thai form
  - required-field red asterisks
  - compact brief box
- generation flow includes:
  - loading block
  - progress bar
  - result block
  - copy
  - regenerate
- old result clears when generating a new one
- page is hydration-safe

### Video Script Generator
- implemented with the same pattern as Social Post Generator
- supports planner mode + structured freestyle mode
- includes real API generation route
- includes loading/result/copy/regenerate flow
- page is hydration-safe

### Removal completed
- `Line Broadcast Generator` was removed entirely
- removed from Content Generator hub
- removed from planner routing/types/schema
- deleted page file

# Current Problem / Current Task

The next task is not in Content Generator.

Next target:
- fix `เนื้อหา Prelaunch` on `launch-sequence/prelaunch-content` flow
- specifically add a short line message preview before the audience clicks to read the full content

Interpretation for next session:
- likely update the Prelaunch content pages and/or API output handling so each PLC content can surface a short preview/message snippet
- this should happen in Launch Prelaunch Content, not Content Generator

# Known Issues

- `npm run build` is still blocked by Google Fonts fetch in `app/layout.tsx`
  - imports `Geist`
  - imports `Geist_Mono`
- repo has pre-existing lint issues outside the touched Content Generator files
- launch prelaunch content still uses the older content page structure compared with the newer generator patterns
- `launch-sequence/launch/page.tsx` is still placeholder/incomplete
- planner/day cards still contain some English labels in a few places on the 30-day planner final page, though this is not the current next task
- no database; all continuity is localStorage-based

# Next Steps

## Exact next implementation focus
Add a short preview/message line for Prelaunch content before the user opens or reads the full content.

## Suggested implementation sequence

1. Inspect `app/launch-sequence/prelaunch-content/page.tsx`
- understand current menu card structure for PLC 1 / PLC 2 / PLC 3

2. Inspect:
- `app/launch-sequence/prelaunch-content/plc-1/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-2/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-3/page.tsx`
- check what saved content shape exists now and whether only full long-form content is stored

3. Decide preview source
- simplest likely path:
  - derive a short line preview from already generated content
- stronger path:
  - update each PLC API route to also return a short preview line
- preserve route responsibilities and don’t blur them

4. Update UX on `app/launch-sequence/prelaunch-content/page.tsx`
- each PLC card should show a preview line if content already exists
- if no content exists yet, keep current description or empty state
- preview should appear before user clicks into full content

5. If needed, update localStorage contract
- either keep using:
  - `launchSequencePlc1Content`
  - `launchSequencePlc2Content`
  - `launchSequencePlc3Content`
- or add companion preview keys if the full-content-only approach is awkward:
  - `launchSequencePlc1Preview`
  - `launchSequencePlc2Preview`
  - `launchSequencePlc3Preview`

6. Verify locally
- targeted lint on touched launch files
- do not claim full build success unless font issue is separately solved

# Important Files

## For next task
- [app/launch-sequence/prelaunch-content/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/prelaunch-content/page.tsx)
- [app/launch-sequence/prelaunch-content/plc-1/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/prelaunch-content/plc-1/page.tsx)
- [app/launch-sequence/prelaunch-content/plc-2/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/prelaunch-content/plc-2/page.tsx)
- [app/launch-sequence/prelaunch-content/plc-3/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/prelaunch-content/plc-3/page.tsx)
- [app/api/launch-sequence/prelaunch-content/plc-1/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/prelaunch-content/plc-1/route.ts)
- [app/api/launch-sequence/prelaunch-content/plc-2/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/prelaunch-content/plc-2/route.ts)
- [app/api/launch-sequence/prelaunch-content/plc-3/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/prelaunch-content/plc-3/route.ts)

## Important existing Content Generator files for reference
- [app/content-generator/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/content-generator/page.tsx)
- [app/content-generator/30-day-planner/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/content-generator/30-day-planner/page.tsx)
- [app/content-generator/30-day-planner/final/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/content-generator/30-day-planner/final/page.tsx)
- [app/content-generator/social-post/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/content-generator/social-post/page.tsx)
- [app/content-generator/video-script/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/content-generator/video-script/page.tsx)
- [app/api/content-generator/30-day-planner/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/content-generator/30-day-planner/route.ts)
- [app/api/content-generator/social-post/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/content-generator/social-post/route.ts)
- [app/api/content-generator/video-script/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/content-generator/video-script/route.ts)