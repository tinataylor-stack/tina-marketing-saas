# AGENTS.md

## Project Overview

This repo is a Next.js App Router SaaS project that helps business owners build marketing assets with AI.

Current tool flow:

1. Avatar Analyzer
2. Lead Magnet Builder
3. Lead Magnet Final Page with modular cards:
   - Lead Magnet Draft
   - Title Options
   - Suggested Format
   - CTA
4. Launch Sequence Builder based on Jeff Walker style prelaunch + launch workflow:
   - Step 1: Launch Foundation
   - Step 2: Prelaunch Strategy
   - Prelaunch Content
   - Step 3: Launch LINE Broadcast

This project is modular by design. Do not merge unrelated tools into one giant page or one giant API route.

---

## Core Stack

- Next.js App Router
- TypeScript
- OpenAI API
- Tailwind CSS
- Vercel deployment
- GitHub repo
- localStorage used for temporary frontend workflow state

---

## High-Level Product Philosophy

This app is not just a content generator. It is a **marketing system builder**.

The architecture should reflect a sequence of tools:

- Avatar Analyzer
- Lead Magnet Builder
- Launch Sequence Builder
- Future sales/marketing tools

Each tool should be structurally separate.

Do not collapse strategy, execution, and campaign orchestration into one page unless explicitly requested.

---

## Important Existing Pages

### Avatar Analyzer
- `app/avatar-analyzer/page.tsx`
- Generates structured avatar analysis
- Saves to localStorage:
  - `confirmedAvatarAnalysis`
  - `confirmedStructuredAvatar`

### Lead Magnet Builder
- `app/lead-magnet-builder/page.tsx`
- Multi-step workflow using localStorage

### Lead Magnet Final Page
- `app/lead-magnet-builder/final/page.tsx`
- Uses modular cards
- Draft loads automatically
- Other cards generate on click

### Launch Sequence
- `app/launch-sequence/page.tsx`
- `app/launch-sequence/step-1/page.tsx`
- `app/launch-sequence/step-2/page.tsx`
- `app/launch-sequence/prelaunch/page.tsx`
- `app/launch-sequence/prelaunch-content/page.tsx`
- `app/launch-sequence/launch/page.tsx`
- Launch is now an active product area in the repo, not just a planned tool

---

## Important Existing API Routes

### Avatar
- `app/api/avatar-analyzer/route.ts`

### Lead Magnet
- `app/api/lead-magnet/final-draft/route.ts`
- `app/api/lead-magnet/title-options/route.ts`
- `app/api/lead-magnet/suggested-format/route.ts`
- `app/api/lead-magnet/cta-copy/route.ts`

### Launch Sequence
- `app/api/launch-sequence/prelaunch-plan/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-1/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-2/route.ts`
- `app/api/launch-sequence/prelaunch-content/plc-3/route.ts`
- `app/api/launch-sequence/launch/day-1-cart-open/route.ts`
- `app/api/launch-sequence/launch/day-2-objection/route.ts`
- `app/api/launch-sequence/launch/day-3-objection/route.ts`
- `app/api/launch-sequence/launch/day-4-urgency/route.ts`
- `app/api/launch-sequence/launch/day-5-cart-close/route.ts`

When editing these routes, preserve the intended job of each route.

Do not blur route responsibilities.

Examples:
- `final-draft` = strategic lead magnet blueprint, not full consumer-facing content
- `title-options` = lead magnet titles only, not next-step offer titles
- `cta-copy` = CTA for promoting the lead magnet itself, not the next-step offer

---

## Architectural Rules

### 1. Keep tools modular
Each major tool should have its own route namespace and page structure.

Preferred pattern:

- `app/avatar-analyzer/...`
- `app/lead-magnet-builder/...`
- `app/launch-sequence/...`

### 2. Prefer multiple focused API routes
Prefer:
- one route per clear job

Avoid:
- one giant route that tries to generate everything

### 3. Preserve the strategy layer vs content layer distinction
There are at least two different output layers in this project:

#### Strategy layer
Produces:
- structured frameworks
- blueprints
- outlines
- campaign strategy

#### Content layer
Produces:
- articles
- scripts
- checklists
- PDFs
- emails
- posts

Do not mix them unless explicitly requested.

### 4. Reuse proven UI patterns
Prefer reusing:
- progress/loading cards
- modular result cards
- copy buttons
- localStorage workflow continuity

### 5. Do not rewrite working prompts unless explicitly requested
If changing prompts:
- preserve the route’s original purpose
- tighten ambiguity rather than redefining the feature
- do not silently convert blueprint prompts into consumer-facing content prompts

### 6. Keep frontend changes minimal and targeted
Do not refactor unrelated parts of the app while implementing a new feature.

---

## Coding Rules

### TypeScript
- Keep types explicit when practical
- Avoid unnecessary `any`
- If `any` already exists in working code, do not refactor it unless needed

### React / Next.js
- Use App Router conventions
- Keep client components as `"use client"` only when needed
- Avoid unnecessary complexity
- Preserve existing page flow unless explicitly changing it

### Tailwind
- Keep styling simple and consistent with current UI
- Prefer existing button/card patterns
- Avoid adding complex custom styling systems unless asked

### UX
- Prefer clarity over novelty
- Buttons and labels should match the existing product language
- Avoid jargon in user-facing Thai copy
- Keep Thai UI copy natural and readable

---

## Prompt Design Rules

When writing or editing AI prompts:

### For strategy routes
The output should be:
- structured
- strategic
- blueprint-oriented
- for the business owner, not the end customer

Avoid:
- article-style intros
- speaking directly to the customer unless explicitly required
- overly polished marketing prose if the route is intended to produce structure

### For content routes
The output should be:
- usable
- readable
- format-specific

### For CTA routes
Be explicit about whether the CTA is for:
- promoting the lead magnet
or
- promoting the next-step offer

Never assume those are the same.

### For title routes
Make it explicit whether titles are for:
- the free lead magnet
or
- the paid offer

Do not let the model infer this from context alone.

---

## Performance Rules

This app should optimize for perceived speed and modular generation.

Preferred patterns:
- generate core result first
- load optional outputs on click
- avoid giant multi-purpose generations when smaller calls are possible

For long AI calls:
- use loading states
- use staged loading text/progress
- use modular result cards

---

## localStorage Rules

This project relies on localStorage for workflow continuity.

Do not rename existing keys unless necessary.

If adding new keys:
- keep names explicit
- group by feature
- avoid vague names

Existing examples:
- `confirmedAvatarAnalysis`
- `confirmedStructuredAvatar`
- `leadMagnetCurrentProblem`
- `selectedBigProblem`
- `leadMagnetSection2`
- `leadMagnetSection3`
- `leadMagnetSection4`
- `leadMagnetSection5`

For new tools, use similarly clear names, for example:
- `launchSequenceOffer`
- `launchSequencePLC1`
- `launchSequencePLC2`
- `launchSequencePLC3`
- `launchSequenceLaunchSetup`
- `launchSequenceDay1Messages`
- `launchSequenceDay2Messages`
- `launchSequenceDay3Messages`
- `launchSequenceDay4Messages`
- `launchSequenceDay5Messages`

---

## Menu / Navigation Rules

The app is evolving into a suite of marketing tools.

Prefer menu structure like:
- Avatar Analyzer
- Lead Magnet Builder
- Launch Sequence Builder

Do not bury a major new tool inside an unrelated existing page.

Major new systems should get their own page and route.

---

## How to Handle New Features

Before implementing a major new feature:

1. Inspect the existing repo structure
2. Summarize current behavior
3. Propose the cleanest architecture
4. Wait for approval if the change is large
5. Implement in small steps

Preferred implementation order:
- route structure
- landing page / page shell
- localStorage/state flow
- API routes
- UI generation cards
- polish

---

## Build / Verification Rules

After changing code, always verify locally.

Preferred checks:

```bash
npm run build

````md

## Build / Sanity Check

If appropriate, also run:

```bash
npm run dev
````

Do not claim a change is complete without checking for obvious build-breaking issues.

## Git / Commit Style

When making commits, use clear, specific commit messages such as:

* `add launch sequence landing page`
* `split final outputs into modular cards`
* `tighten CTA prompt for lead magnet promotion`
* `add copy buttons to final page`

Avoid vague commit messages such as:

* `update`
* `fix stuff`

## What to Avoid

Do not:

* combine all AI generation into one mega route
* convert strategic blueprint pages into content pages without approval
* rewrite Thai user-facing copy into unnatural Thai
* introduce large refactors unrelated to the current task
* change route purposes silently
* replace modular generation with all-at-once generation unless asked

## Current Product Direction

This project is moving toward a full AI marketing systems platform.

Likely direction:

* Avatar Analyzer
* Lead Magnet Builder
* Launch Sequence Builder
  * Step 1: Foundation
  * Step 2: Prelaunch Strategy
  * Prelaunch Content
  * Step 3: Launch LINE Broadcast
* Sales Assets / Content Tools

Future work should preserve this system-builder direction.

## When Unsure

If the requested task could:

* affect architecture
* blur tool boundaries
* change prompt intent
* change user workflow significantly

then pause and propose a plan before editing files.

```
```
