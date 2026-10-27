# Ober

Ride scheduling for riders: enter a pickup and destination, pick a date and time, choose an affordable ride, and keep track of upcoming and previous trips.

Built with Expo SDK 58 (React Native 0.88), Expo Router and NativeWind. The look comes from the team repo [daniellaamgad/ober-app](https://github.com/daniellaamgad/ober-app): black on white, grey labels, cards with light borders. Phase 1 university project by a two-member team.

## Run it

```bash
npm install
npx expo start
```

The team uses bun locally (`bun install`, `bunx expo start`). Both lock files are committed: `bun.lock` for bun and `package-lock.json` for npm. Because of that, `expo-doctor` reports "Multiple lock files detected"; this is expected.

Scan the QR code with Expo Go (SDK 58), or press `i` / `a` for a simulator. No development build is needed.

Phase 1 has no backend. The app starts from in-memory demo data that resets on reload:

| Account | Password | Data |
| --- | --- | --- |
| `ali@ober.app` | `ober123` | Two saved places, two completed trips and one cancelled trip |

New accounts made on Sign Up start empty.

Demo shortcut for presentations: `ober://demo?to=/trips` signs in the demo account and opens the given route. Add `book=1` to schedule a sample ride first; `{id}` in `to` becomes its id, for example `ober://demo?book=1&to=/trip/{id}`. With Expo Go the links are `exp://<host>:8081/--/demo?...`.

## Screens

| ID | Screen | Route | Member |
| --- | --- | --- | --- |
| S1 | Home | `(tabs)/index` | Daniella |
| S2 | Choose Ride | `ride/confirm` | Daniella |
| S3 | My Trips | `(tabs)/trips` | Daniella |
| S4 | Profile | `(tabs)/profile` | Daniella |
| S5 | Ride Scheduled | `ride/booked/[id]` | Ali |
| S6 | Trip Details | `trip/[id]` | Ali |
| S7 | Edit Profile | `edit-profile` | Ali |
| S8 | Saved Places | `places` | Ali |
| S9 | Payment Method | `payment` | Ali |

Sign In and Sign Up live under `(auth)/` and are not counted.

## Project layout

The app uses the Provider pattern (React Context): providers own the data and the actions that change it, and screens use them through hooks.

| Folder | Role | What lives there |
| --- | --- | --- |
| `src/app/` | View | Expo Router screens; every file is a route |
| `src/components/` | View | Shared NativeWind components (Button, TextField, OptionCard, TripCard, …) |
| `src/context/` | Provider | `AuthProvider`, `RidesProvider`, `PlacesProvider` and their `useAuth`, `useRides`, `usePlaces` hooks |
| `src/features/` | Model | Types, ride options, payment methods, schedule and form validation (unit-tested), demo data |
| `src/lib/` | Helpers | Price, date and id formatting |
| `tailwind.config.js` | Styling | Colour tokens taken from the team repo (`ink`, `muted`, `line`, `surface`, `success`, `danger`) |
| `docs/diagrams/` | Report | PlantUML sources and rendered PNGs |
| `docs/report/` | Report | The filled Phase 1 template, its build script and screenshots |
| `ai-log/` | Report | Each AI interaction in the course's format: verbatim prompt, output, changes and verification, rationale |

## Report

`docs/report/Phase 1 - Ober App.docx` was first built from the team's template in `docs/report/template/` and is now edited by hand in Word. The build script refuses to overwrite it; `--force` regenerates it from the template and discards the Word edits:

```bash
bun run report -- --force
```

Re-render a diagram after editing its `.puml` file:

```bash
plantuml -tpng docs/diagrams/use-case.puml
```

## Checks

```bash
bun run test        # Jest: rules, providers, and sign-in/booking flows through the real screens
bun run typecheck   # tsc --noEmit
bun run lint        # expo lint
```

With npm, the same scripts run as `npm run test`, `npm run typecheck` and `npm run lint`.

## Known limitations (Phase 1)

- All data is in memory and resets on reload. The Supabase backend is planned in the report's data storage section and is built in Phase 2.
- Passwords of accounts made on Sign Up are kept in memory as typed; Phase 2 moves accounts to Supabase Auth.
- Fares are fixed per ride option (EGP 120 and EGP 200) and do not depend on the distance.
- Pickup and destination are free text; there is no map or address search.
- Rides never move to Completed on their own; only the seeded history shows completed trips.
