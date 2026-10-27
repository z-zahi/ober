# Ober Phase 1 Design

Date: 2026-10-26. Two-member team. Phase 1 is due at the start of semester week 6.

## Intent

Ober is an open-source ride-booking app with a rider side and a driver side. Phase 1 delivers the analysis, the architecture, the data plan, and a working nine-screen prototype in Expo Go. The goal is an A* on the Phase 1 rubric with the smallest design that satisfies every rubric line cleanly.

## Rubric lines this design must satisfy

1. At least 5 functional requirements (login/signup excluded).
2. Use case diagram: at least 1 primary actor, at least 5 use cases, include/extend where appropriate.
3. Activity diagram reflecting the system's functions.
4. At least 9 implemented screens (the brief says 3 per member with a floor of 9; with two members we keep nine), sign in/registration excluded.
5. Architecture/design pattern selection, justified.
6. Data storage plan: data items and types, persistent storage plan, preliminary data model diagram.
7. Typed report (Word) plus UI implementation code.

## Goals, non-goals, anti-goals

- Goals: a complete rider-to-driver loop (request, accept, arrive, PIN, start, complete, rate) that updates live between two phones through Supabase Realtime; clean diagrams that match the code one-to-one; a report the team can edit in Word.
- Non-goals: payments, routing/ETA APIs, Google Cloud keys, background location, push notifications, pooling, scheduling, user interviews, a usability study.
- Anti-goals: anything that forces a development build (the prototype must run in Expo Go); an architecture section that does not match the folder layout; diagrams with more nodes than the app has features.

## Decisions (user's)

- Backend: Supabase (Auth, Postgres with row-level security, Realtime on the rides table).
- Styling: NativeWind v4 with Tailwind CSS v3.
- Base components: React Native Reusables (shadcn/ui port), added through its CLI.
- The earlier `docs/ober/` plan, diagrams and docx are removed completely.
- Commits carry no Co-Authored-By trailer.

## Decisions (mine, stated so they can be reversed)

- Commute Fit (budget/walk/deadline pickup ranking) is dropped. Fare estimate, ride PIN and rating stay.
- Map: Google Maps on both platforms via `react-native-maps` with `provider={PROVIDER_GOOGLE}` (no key needed in Expo Go; store builds need one through the config plugin). Display only: markers for pickup and dropoff plus the rider's current location via `expo-location` foreground permission. Location is optional; the app works without it.
- Backend: Phase 1 is design only. The Supabase schema is specified in the report and built in the next phase; the prototype runs on the in-memory repository.
- Places: a fixed list of eight named places around Cairo University with coordinates. Pickup and dropoff are chosen from this list. No free-text geocoding.
- Fare: `total = max(base 15.00 + 6.00 per km, minimum 25.00)` in EGP, distance by haversine between the two places, stored in integer piastres (cents).
- A repository interface sits between hooks and Supabase. A mock in-memory repository with seeded data is used automatically when the Supabase env vars are missing, so every screen runs in Expo Go before the team creates a Supabase project. The mock simulates a driver accepting 4 s after a request and arriving 10 s after, so the rider's live screen can be demonstrated on one phone.
- Navigation: one `(tabs)` group whose first tab renders the rider home or the driver home depending on `profile.role`. Role is switched on the Profile screen.
- Diagrams: PlantUML sources in `docs/diagrams/*.puml`, rendered to PNG by the `plantuml` CLI (Homebrew). Four figures: use case, activity (swimlanes), ER model, architecture.
- Report: `docs/report/Ober-Phase-1-Report.docx`, generated from the plan's content with the four diagrams and nine screenshots embedded. Team member names are placeholders (Member A, Member B) until supplied.
- Tests: Jest with `jest-expo` for domain rules and the mock repository only. No UI snapshot tests.

## Functional requirements

| ID | The system shall | Screens |
| --- | --- | --- |
| FR1 | Let a rider choose a pickup and a destination from named campus places, see them on a map, and see a fare estimate before requesting | S1, S2 |
| FR2 | Create a ride request with a 4-digit PIN and broadcast it live to available drivers | S2, S4 |
| FR3 | Let a driver switch availability on and off and see open requests update live | S4 |
| FR4 | Let an available driver inspect and accept one open request; the first accept wins and the request disappears for other drivers | S5 |
| FR5 | Let the assigned driver move the trip through arrived, in progress (after entering the rider's PIN) and completed | S6 |
| FR6 | Let the rider follow the ride status live, see the driver and vehicle, show the PIN, and cancel before the trip starts | S3 |
| FR7 | Show both roles their past trips with status, route, fare and timestamps | S7, S8 |
| FR8 | Let a rider rate a completed trip once with 1 to 5 stars and an optional comment | S8 |

Non-functional: runs in Expo Go on iOS and Android; every list has loading and empty states; every mutation shows an error message on failure and keeps the user's input; row-level security protects all tables.

## Screens (nine counted, two uncounted)

Ownership: Member A owns the rider side plus trip details (S1, S2, S3, S8); Member B owns the driver side plus trips, profile (S4, S5, S6, S7, S9).

| ID | Owner | Route | Content and actions |
| --- | --- | --- | --- |
| S1 | A | `(tabs)/index` (rider) | Map with markers, pickup and destination pickers, fare estimate card, "Review ride" button; banner linking to an active ride if one exists |
| S2 | A | `ride/confirm` | Route summary, fare breakdown (base, distance, total), "Request ride" button, error state |
| S3 | A | `ride/[id]` | Live status stepper, driver card with vehicle, large PIN, map, "Cancel ride" while allowed |
| S4 | B | `(tabs)/index` (driver) | Availability switch, live list of open requests with pickup, destination, distance and fare; empty state when none |
| S5 | B | `request/[id]` | Full request detail, rider name, fare and distance, "Accept request" with "no longer available" error |
| S6 | B | `drive/[id]` | Route and rider card, one primary action per status: "I've arrived", PIN entry plus "Start trip", "Complete trip" |
| S7 | B | `(tabs)/trips` | Past trips list (completed and cancelled), newest first, status badge, fare, date; empty state |
| S8 | A | `trip/[id]` | Full trip record with timestamps and fare; rating form (stars, comment) when completed and unrated, otherwise the submitted rating |
| S9 | B | `(tabs)/profile` | Name and phone editing, role switch (rider/driver), vehicle fields for drivers, demo-mode notice, sign out |
| - | - | `(auth)/sign-in`, `(auth)/sign-up` | Email and password; sign-up also takes full name and role. Not counted |

## Architecture: MVVM with a repository layer

- View: Expo Router screens under `src/app/`, styled with NativeWind, built from React Native Reusables components.
- ViewModel: hooks under `src/hooks/` (`useAuth`, `useRide`, `useOpenRequests`, `useTrips`, `useActiveRide`) that own loading, error and derived state and expose actions.
- Model: `src/domain/` pure TypeScript: types, fare rules, status transitions, PIN, places.
- Repository: `src/data/repository.ts` interface; `supabaseRepository.ts` and `mockRepository.ts` implementations; `src/data/index.ts` picks one.
- Justification: hooks are the natural ViewModel in React; the repository isolates Supabase so no screen imports the client, lets both members build screens against one contract, and makes the mock possible.

## Data storage plan

Cloud: Supabase Postgres, three tables with row-level security; Realtime enabled on `rides`. Device: the Supabase auth session persisted through `expo-sqlite`'s localStorage shim; nothing else is stored locally.

- `profiles`: id uuid PK (= auth user id), full_name text, phone text null, role enum rider|driver, vehicle_model text null, vehicle_plate text null, is_available bool, created_at timestamptz.
- `rides`: id uuid PK, rider_id uuid FK profiles, driver_id uuid FK profiles null, pickup_label text, pickup_lat/pickup_lng float8, dropoff_label text, dropoff_lat/dropoff_lng float8, distance_km numeric(6,2), fare_cents int, pin char(4), status enum requested|accepted|arrived|in_progress|completed|cancelled, requested_at, accepted_at, arrived_at, started_at, completed_at, cancelled_at timestamptz (all but requested_at nullable).
- `ratings`: id uuid PK, ride_id uuid FK rides unique, rider_id uuid FK, driver_id uuid FK, stars smallint 1..5, comment text ≤ 500 null, created_at timestamptz.
- Database functions: `accept_ride(p_ride_id)` performs the conditional update that makes acceptance race-safe; `start_ride(p_ride_id, p_pin)` checks the PIN server-side.
- A trigger creates the profile row from sign-up metadata (`full_name`, `role`).

## What is left to the builder

Exact copy on screens, icon choices, spacing, the seeded demo data values, and the order of sections inside each screen, as long as the screen table above is honoured.
