# 05 · Review and tests

**Date:** 27 October 2026 · **Tool:** Claude Code (Claude Opus 5.5)

## 1. The prompt

**Verbatim:**

```text
i made astra 6 spit out the its log, now for u 

Review this app carefully and write tests for the parts that matter most start by reading and reviewing and checking how the project is structured and how its existing tests work, if there are uncommitted changes, focus on those first; otherwise, review the main user flows.


and dont forget to add this for the ai log
```

- **Module/Feature:** the whole Phase 1 app. The only commit is the Expo template, so every screen, provider and rule in `src/` counts as an uncommitted change.
- **Constraints:**
  - Read the project structure and the existing tests before writing anything.
  - Focus on the uncommitted changes first.
  - Record the session in this log.
- **Specifics:** review the app, then write tests for the parts that matter most.

## 2. The output

**Review.** The existing 22 Jest tests only covered the pure rules in `src/features/` (scheduling, ride options, form validation). Nothing tested the three providers in `src/context/`. Those providers handle sign-in, sign-up, booking, cancelling and the per-account filtering of trips and places. The screens had no tests either. Entry 04 had already listed three gaps: the exact 30-day boundary, a future-dated cancelled ride, and switching accounts.

The AI did not change any app code. It reported three findings for us to decide on:

- `removePlace` in `src/context/places-context.tsx` removes a place by id without checking that it belongs to the signed-in rider. `cancelRide` in `src/context/rides-context.tsx` does check. The bug can't be reached from the app, because Saved Places only lists the rider's own places, but the two actions follow different ownership rules.
- `addRide` accepts the car type and price that the screen sends and does not check them against `rideOptions`. With fixed fares in Phase 1 this does no harm. In Phase 2 the server should set the price.
- The `ober://demo` link signs in the demo account without a password, in any build. It is a presentation shortcut and should not survive into Phase 2.

**Setup.** The AI added `@testing-library/react-native` 14.1.0 as a dev dependency with `bunx expo install`. Expo's SDK 58 testing docs recommend this library, and `expo-router/testing-library` needs version 14 or later. The Jest `testMatch` now includes `.tsx` files. The flow tests stub `global.css`, the lucide icons and the native date picker in their own file, so the project-wide Jest config stays the same.

**Tests added** (73 in total, up from 22):

| File | Tests | What they check |
| --- | --- | --- |
| `src/features/bookings/__tests__/schedule.test.ts` | +6 | A ride exactly 30 days ahead is accepted. Cancelling is blocked at the exact pickup time. A future cancelled ride and a missed scheduled ride both go to past trips, and the missed ride stays Scheduled. The trip split leaves the original list in place. The cheapest option is found in any order. |
| `src/features/account/__tests__/validation.test.ts` | +7 | Phone numbers with brackets and dashes, letters, or too many digits. One-letter names. A malformed sign-in email. Profile errors are shown before password errors. Place names that are only spaces, or duplicates with extra spaces. |
| `src/context/__tests__/providers.test.tsx` | 29 (new) | Sign-in with the email in any case, and the same message for a wrong password or an unknown email. Sign-up trims the details and rejects duplicate emails. Profile edits, and payment preference. A booking needs a signed-in rider and is refused for past, too-far, invalid or blank input without being saved. Cancelling keeps the ride as Cancelled and refuses repeats, completed rides and unknown rides. A ride keeps the payment method it was booked with. Saved places can be added, removed and checked for duplicates. One account never sees or cancels another account's records, and switching back restores them. |
| `src/__tests__/booking-flow.test.tsx` | 9 (new) | Uses the real `src/app` routes through Expo Router's `renderRouter`. A signed-out rider is redirected to Sign In. A wrong password shows an error. A new account starts with an empty My Trips. Signing out works. The full journey runs: Home → Choose Ride (OberXL) → Ride Scheduled → My Trips → Trip Details → cancel. Home asks for missing addresses. A saved place fills the field that was focused last. A missing trip shows "Trip not found". |

## 3. Critical analysis and adaptation

**Changes:** we have not changed the AI's tests yet. The `removePlace` ownership fix is still ours to decide.

**Verification**

- `bun run test` passed with 73 tests, with the same result over three repeat runs. `bun run typecheck` and `bun run lint` were clean, and `expo-doctor` passed all 20 checks.
- Every new test passed on its first run, and that alone does not show the tests can fail. So the AI broke the code on purpose 15 times and checked that at least one test failed each time. Nine of the breaks were in the providers and rules: no rider filter on trips, no user filter on places, cancelling across riders, deleting instead of cancelling, case-sensitive email, the profile email check including the rider's own account, skipping the schedule check, an off-by-one at 30 days, and cancelling regardless of status. Six were in the screens: the saved-place chip ignoring focus, unguarded tabs, the booking ignoring the chosen car, the booking dropping the pickup, the cancel dialog doing nothing, and the cancel button always showing. After each break the AI restored the file and compared it byte for byte with a backup.
- **Limits.** The tests run in Jest with a test renderer, not on a phone. The native date picker is mocked, so choosing a date and time on iOS or Android is not tested. NativeWind styling and layout are not checked. Tests that depend on time use the real clock with margins of an hour or more.

## 4. Rationale

The providers decide what gets saved, cancelled and shown to which account, so a bug there loses or leaks a rider's data. Before this session they had no tests. Provider tests check those rules directly. The router flow tests check that the screens actually call the rules and move between the right routes. The deliberate breaks show that the tests catch real mistakes. The review findings were reported rather than fixed, because changing app behaviour is our decision.
