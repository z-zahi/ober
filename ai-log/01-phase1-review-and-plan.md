# 01 · Phase 1 review and plan

**Date:** 26 October 2026 · **Tool:** Claude Code (Claude Opus 5.5) · **Code generated:** none, planning only

## 1. The prompt

**Verbatim:**

```text
these are the requirements for phase one for this project, Ober, open Uber


<pasted_content>
Phase 1: Application Analysis, Architecture, and Prototype
Due Date: The beginning of sixth week of the semester.
Format: Typed report using word processing software + UI implementation code.
Content: This phase covers the foundational analysis and design of your application. You
must submit:
1. System Requirements: At least 5 relevant functional requirements (Login/Signup
not counted).
2. Use Case Diagram: With at least one primary actor and at least 5 relevant use
cases. Include include/extend dependencies where appropriate.
3. Activity Diagram: Illustrating the workflow of the application. Should reflect the
functions defined for the system.
Page 3 of 2
4. UI Prototype and Implementation: Initial UI implementation of the
application. Each team is required to implement at least 9 screens for their
application – 3 screens for each member. Sign In/Registration are excluded
from this count.
5. Architecture/Design Pattern Selection (Included in UI marks): Define and justify
the architecture/design pattern you will use (e.g., MVC, MVVM, BLoC, Provider).
This selection should be clearly documented in the report.
6. Data Storage Plan: Define the data items and types your application will manage
and describe your plan for persistent data storage (local or cloud). A preliminary data
model/diagram is required.
</pasted_content>

i want you to review the existing diagrams and everyhting and plan everyhting for this phase, we will be using supabase, maybe its realtime features too
```

- **Module/Feature:** the Phase 1 scope: the existing diagrams and a plan covering requirements, diagrams, screens, architecture and storage.
- **Constraints:**
  - Supabase as the backend, possibly with its Realtime features.
  - Keep the project simple.
- **Specifics:** review the existing diagrams against the brief, say if they are overkill, and come back with a plan.

## 2. The output


- **Review:**
  - The existing diagrams were too large rather than wrong: 15 use cases, and an activity diagram split over two figures.
  - The architecture and data model still assumed local JSON files instead of Supabase.
  - A "Commute Fit" ranking feature caused most of the extra size.
- **Plan:**
  - Drop Commute Fit.
  - Eight functional requirements.
  - One rider and driver ride loop.
  - MVVM with a repository.
  - Three Supabase tables (profiles, rides, ratings) with row-level security.
  - **Styling and maps:** plain React Native `StyleSheet` instead of NativeWind, and `react-native-maps` with the default provider.

The AI then wrote the plan up as `docs/superpowers/specs/2026-10-26-ober-phase1-design.md` and `docs/superpowers/plans/2026-10-26-ober-phase1.md`.

## 3. Critical analysis and adaptation

**Changes**

- **We rejected the styling choice.** The AI proposed plain `StyleSheet` "since NativeWind adds Tailwind, Babel and Metro config for no rubric gain". We required NativeWind in the next prompt (entry 02), because it is the styling approach we wanted for the project.
- **We accepted the reduced scope:** no Commute Fit, no user interviews, no Google Cloud keys and no EAS builds. It kept the project simple, which was our stated goal.

**Verification:** there was no code to test. The plan, with our styling change, became the brief for entry 02.

## 4. Rationale

We used the AI to audit an over-scoped earlier design against the marking brief. Comparing a long plan with six rubric items is quick for the AI and easy for us to check. The decisions stayed with us: the backend (Supabase), how simple the project stays, and the styling, which we changed.
