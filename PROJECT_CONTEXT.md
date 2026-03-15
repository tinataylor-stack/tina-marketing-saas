# Project Summary

This is a Next.js App Router SaaS project for AI-powered marketing tools. The product direction is a modular AI marketing system builder, not one giant content generator. Avatar is the shared foundation, and the app is structured into separate tool families for Content Generator, Lead Magnet, and Launch. The stack is Next.js, TypeScript, Tailwind CSS, OpenAI API, and localStorage for workflow continuity.

# Architecture

The app is organized by tool namespace and keeps strategy and content separate.

# Current major areas:

- Avatar Analyzer
- Lead Magnet
strategy flow under app/lead-magnet-builder/...
content flow under app/lead-magnet-content/page.tsx

- Launch
launch foundation
prelaunch strategy
prelaunch content
launch placeholder

- Content Generator
standalone content-layer family under app/content-generator/...

# Important architecture rules already reflected in the repo:
- each major tool has its own route namespace
- focused API routes are preferred over one mega route
- strategy outputs and content outputs are kept separate
- shared workflow state is stored in explicit localStorage keys
- hub pages use a consistent card-based pattern

# New Content Generator architecture now started:
- hub page at app/content-generator/page.tsx
- planner types at app/content-generator/types.ts
- planner input page at app/content-generator/30-day-planner/page.tsx
- planner final page at app/content-generator/30-day-planner/final/page.tsx
- planner API at app/api/content-generator/30-day-planner/route.ts

# Current State

Completed:
- Content Generator hub is now a real page instead of a placeholder
- hub includes cards for:
30-Day Content Planner
Social Post Generator
Line Broadcast Generator
Video Script Generator

- 30-Day Content Planner v1 is built
- planner input now only asks for:
primary platform
optional tone/style direction
optional extra context

- planner reads business/topic context from:
confirmedAvatarAnalysis
confirmedStructuredAvatar

- planner generates a mixed 30-day calendar across:
ให้ความรู้
สร้างความน่าสนใจ
สร้างความบันเทิง
สร้างความไว้วางใจ
กระตุ้นการมีส่วนร่วม

- each day saves enough structured info to hand off into a generator
- selected day is saved to localStorage and routed into a matching generator page
- generator destination pages currently exist so the flow does not dead-end

# Current localStorage additions:

- contentPlanner30Input
- contentPlanner30Plan
- contentPlanner30SelectedDay

# Known limitations:
- the generator pages are currently handoff-ready shells, not full content-generation tools yet
- full repo lint is still noisy because of older existing issues outside this feature
- npm run build is still blocked by the known Google Fonts fetch issue in app/layout.tsx

# Next Development Task

Best next task:
- build the first real execution tool, starting with Social Post Generator

# Recommended scope for that task:
- turn app/content-generator/social-post/page.tsx into a full generator page
- add focused API route:
app/api/content-generator/social-post/route.ts

- make it work in two modes:
standalone brief input
prefilled selected day from contentPlanner30SelectedDay

- include:
avatar summary box
selected planner day summary box
result box
copy pill
loading/progress state
regenerate flow
saved result localStorage key

After that:
- build Line Broadcast Generator
- then Video Script Generator