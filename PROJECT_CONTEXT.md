# Project Overview

This is a Next.js App Router SaaS app for AI-powered marketing tools. The product direction is still a modular AI marketing system builder, not one giant content generator. The app is organized into separate tool families so strategy and content stay clearly separated.

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
  - home page with cards for Content Generator, Lead Magnet, Launch
- `app/avatar-analyzer/page.tsx`
  - avatar analysis tool and shared context entry point
- `app/lead-magnet-builder/...`
  - lead magnet strategy flow
- `app/lead-magnet-content/page.tsx`
  - lead magnet content generation
- `app/launch-sequence/...`
  - launch foundation, prelaunch strategy, prelaunch content, and launch LINE broadcast flow
- `app/content-generator/...`
  - content execution tools

## Launch structure

- `app/launch-sequence/page.tsx`
  - launch hub with Step 1, Step 2, Step 3 cards
- `app/launch-sequence/step-1/page.tsx`
  - launch foundation input page
- `app/launch-sequence/step-2/page.tsx`
  - prelaunch strategy generator for PLC 1 / PLC 2 / PLC 3
- `app/launch-sequence/prelaunch/page.tsx`
  - Step 2 hub
- `app/launch-sequence/prelaunch-content/page.tsx`
  - hub for prelaunch content pieces with saved Line preview display
- `app/launch-sequence/prelaunch-content/plc-1/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-2/page.tsx`
- `app/launch-sequence/prelaunch-content/plc-3/page.tsx`
- `app/launch-sequence/launch/page.tsx`
  - Step 3 launch page for LINE Broadcast launch messages

## Launch API routes

- `app/api/launch-sequence/prelaunch-plan/route.ts`
  - generates PLC 1 / PLC 2 / PLC 3 strategic sequence
- `app/api/launch-sequence/prelaunch-content/plc-1/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-2/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-3/route.ts`
  - generate full PLC content plus Line preview options
- `app/api/launch-sequence/prelaunch-content/plc-1/line-preview/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-2/line-preview/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-3/line-preview/route.ts`
  - regenerate Line preview options only
- `app/api/launch-sequence/launch/day-1-cart-open/route.ts`
- `app/api/launch-sequence/launch/day-2-objection/route.ts`
- `app/api/launch-sequence/launch/day-3-objection/route.ts`
- `app/api/launch-sequence/launch/day-4-urgency/route.ts`
- `app/api/launch-sequence/launch/day-5-cart-close/route.ts`
  - day-based LINE Broadcast launch message generation
- `app/api/launch-sequence/launch/shared.ts`
  - shared validation and prompt builder for Step 3 launch routes

## Content Generator structure

- `app/content-generator/page.tsx`
  - hub page
- `app/content-generator/30-day-planner/page.tsx`
  - planner input page
- `app/content-generator/30-day-planner/final/page.tsx`
  - saved/generated 30-day plan page
- `app/content-generator/social-post/page.tsx`
  - execution page with planner mode + structured freestyle mode
- `app/content-generator/video-script/page.tsx`
  - execution page with planner mode + structured freestyle mode
- `app/content-generator/types.ts`
  - shared planner/generator types

## Content Generator API routes

- `app/api/content-generator/30-day-planner/route.ts`
  - generates 30-day content plan
- `app/api/content-generator/social-post/route.ts`
  - generates finished Facebook-style social post
- `app/api/content-generator/video-script/route.ts`
  - generates finished video script

## localStorage usage

Important shared keys:
- `confirmedAvatarAnalysis`
- `confirmedStructuredAvatar`

Launch foundation and prelaunch keys:
- `launchSequenceOffer`
- `launchSequenceOfferDetails`
- `launchSequenceOfferFormat`
- `launchSequencePrice`
- `launchSequenceGoal`
- `launchSequenceContext`
- `launchSequencePrelaunchPlan`
- `launchSequencePlc1LinePreviewOptions`
- `launchSequencePlc2LinePreviewOptions`
- `launchSequencePlc3LinePreviewOptions`
- `launchSequencePlc1LinePreview`
- `launchSequencePlc2LinePreview`
- `launchSequencePlc3LinePreview`
- `launchSequencePlc1Content`
- `launchSequencePlc2Content`
- `launchSequencePlc3Content`

Launch Step 3 keys:
- `launchSequenceLaunchSetup`
- `launchSequenceDay1Messages`
- `launchSequenceDay2Messages`
- `launchSequenceDay3Messages`
- `launchSequenceDay4Messages`
- `launchSequenceDay5Messages`

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
- it links to:
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
- planner recommends 2 content execution types:
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

### Launch Prelaunch Content
- `prelaunch-content` hub displays saved Line preview text on PLC cards before opening the full page
- PLC 1 / 2 / 3 routes generate:
  - 3 Line preview options
  - full Facebook post content
- each PLC page supports saving and regenerating Line preview options separately

### Launch Step 3
- `app/launch-sequence/launch/page.tsx` is no longer a placeholder
- Step 3 is now a dedicated LINE Broadcast launch tool
- Launch Setup block collects:
  - bonuses
  - urgency mechanism
  - checkout direction
  - launch notes
  - priority objections
- Step 3 uses a 5-day structure:
  - Day 1: Cart Open, 2 messages
  - Day 2: Objection Handling, 1 message
  - Day 3: Objection Handling, 1 message
  - Day 4: Objection Handling + Scarcity + Urgency, 2 messages
  - Day 5: Last Call / Cart Close, 3 messages
- each day is generated through its own API route
- each day block supports:
  - generate
  - regenerate
  - copy per message
  - in-block progress UI
- Launch Setup has its own progress bar when the user clicks `สร้างใหม่`
- current behavior of Launch Setup `สร้างใหม่`:
  - clears old Day 1 - Day 5 launch outputs
  - auto-generates Day 1 only
  - leaves Day 2 - Day 5 for manual generation by block
- launch prompts now explicitly forbid showing price anywhere in generated launch messages

### Launch Hub cleanup
- Step 3 card on `app/launch-sequence/page.tsx` no longer shows `Coming Soon`

### Removal completed
- `Line Broadcast Generator` was removed from the old Content Generator area
- removed from Content Generator hub
- removed from planner routing/types/schema

# Current Goal

The current goal is in Launch Step 2, not Step 3.

Next target:
- update `app/launch-sequence/step-2/page.tsx`
- allow the user to edit PLC 1, PLC 2, and PLC 3 directly on the Prelaunch Strategy page if they do not like the generated strategy

This is specifically about editing the strategy itself on Step 2.
It is not about the prelaunch content pages and not about the launch LINE message page.

# Known Issues / Current Gaps

- `app/launch-sequence/step-2/page.tsx` is still view-only after generation
- the user can regenerate the whole prelaunch plan, but cannot manually edit:
  - headline
  - contentOutline
  - talkingPoints
  - cta
  for PLC 1 / PLC 2 / PLC 3 on that page
- Step 2 still uses display cards rather than editable fields after generation
- there may still be pre-existing lint issues elsewhere in the repo outside the launch work touched in this session
- no database; all continuity is localStorage-based

# Next Steps

## Exact next implementation focus
Allow manual editing of PLC 1 / PLC 2 / PLC 3 strategy blocks on `app/launch-sequence/step-2/page.tsx`.

## Suggested implementation sequence

1. Inspect `app/launch-sequence/step-2/page.tsx`
- identify how generated `plan` state is rendered today
- identify where `launchSequencePrelaunchPlan` is saved

2. Convert PLC display sections into editable fields
- `headline`
- `contentOutline`
- `talkingPoints`
- `cta`

3. Add explicit save/update behavior
- save edited PLC strategy back to component state
- persist edited plan back to `launchSequencePrelaunchPlan`

4. Preserve regenerate behavior
- user should still be able to regenerate the full plan if needed
- regenerate should not silently remove the ability to manually edit afterward

5. Keep Step 2 strategy-focused
- do not turn Step 2 into prelaunch content generation
- do not mix this task into PLC content pages

6. Verify locally
- run `npm run build`

# Important Files

## Current Step 2 next-task files
- [app/launch-sequence/step-2/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/step-2/page.tsx)
- [app/api/launch-sequence/prelaunch-plan/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/prelaunch-plan/route.ts)

## Current Step 3 files
- [app/launch-sequence/launch/page.tsx](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/launch-sequence/launch/page.tsx)
- [app/api/launch-sequence/launch/shared.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/shared.ts)
- [app/api/launch-sequence/launch/day-1-cart-open/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/day-1-cart-open/route.ts)
- [app/api/launch-sequence/launch/day-2-objection/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/day-2-objection/route.ts)
- [app/api/launch-sequence/launch/day-3-objection/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/day-3-objection/route.ts)
- [app/api/launch-sequence/launch/day-4-urgency/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/day-4-urgency/route.ts)
- [app/api/launch-sequence/launch/day-5-cart-close/route.ts](/Users/tinasomchit-taylor/Desktop/tina-marketing-saas/app/api/launch-sequence/launch/day-5-cart-close/route.ts)
