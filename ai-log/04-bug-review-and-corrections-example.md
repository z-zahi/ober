# 04 · Bug review and corrections 

## 1. The prompts and outputs

### Scheduling review

**User prompt:**

> can u check the dates? if it's 5pm and i choose today at 3pm, would it still book? choosing today isn't the same as choosing a future time

**AI output:**

> A date-only check would miss that case. Restricting the calendar to today and later prevents choosing yesterday, but it does not prevent choosing 3pm today when it is already 5pm. The rule needs to compare the complete selected date and time with the current time.
>
> There is a second case worth checking: the rider can open the screen with a valid time and then wait until that time has passed. A value that was valid when the picker opened is not necessarily valid when the rider confirms. My initial picker-only approach does not cover that change.
>
> The booking action also needs to reject an invalid date value and should have a defined maximum booking window. Otherwise, the interface may look constrained while the underlying action still accepts values outside the intended rules.

**User redirection:**

> yeah that's what i mean. check again when i press confirm too, i might leave the screen open. and put a limit on how far ahead i can book, maybe 30 days

**Revised AI output:**

> You're correct; checking the full timestamp at confirmation is better than my picker-only proposal. I corrected the example implementation around a shared scheduling rule so the screen and booking action use the same definition of a valid time.
>
> The rule now rejects an invalid date, a time equal to now, any earlier time, and a time more than 30 days ahead. The initial selection is one hour from now so the screen starts with a useful future value. That default is a convenience, not a substitute for validation when the rider submits.
>
> The screen checks before proceeding and gives the rider a clear error. The booking action checks again before creating the record. If validation fails, the action returns an error instead of adding a ride or navigating to the confirmation screen.
>
> The important boundary cases are exactly now, just after now, exactly 30 days ahead, and just beyond the limit. The existing helper measures the limit as 30 periods of 24 hours from the supplied current time. If the product later needs a calendar-date interpretation, that would need a separate decision.
>
> This addresses the scheduling logic in the example. The picker display and time selection still need a device walkthrough; logic tests do not establish how every native picker behaves.

### Cancellation correction

**User prompt:**

> what happens to the trip after i cancel it? can u check that part

**AI output:**

> My initial suggestion was to remove the booking from the rides list after the rider confirms cancellation. That would make it disappear from Upcoming, but it would also erase the rider's visible record of the booking.
>
> The review exposes two separate questions: what happens to the stored record, and which actions are allowed for its current status and pickup time. A correct cancellation flow needs to answer both. Removing a card from the screen is not enough to describe a cancelled booking.

**User redirection:**

> no why delete it? i still want to see it in history, just say cancelled. also check that i can't cancel something that's already completed or whose pickup time passed

**Revised AI output:**

> You're right. Keeping the booking with a Cancelled status is better than deleting it because the rider can still see what was booked and what happened to it. I corrected the example flow to update the status while retaining its reference, route, scheduled time, fare, and payment method.
>
> Cancellation requires both Scheduled status and a pickup time later than now. A completed ride, an already cancelled ride, or a scheduled ride whose pickup time has passed must not be changed by this action. A ride that cannot be found in the current user's records also returns an error.
>
> The screen uses the eligibility rule to decide whether to display the cancellation control. The action checks the rule again when the user confirms. That second check matters if the pickup time passes while the confirmation dialog is open; a previously visible button is not proof that the action is still allowed.
>
> After cancellation, the booking belongs in Previous rather than Upcoming. The user should be able to open it and see the Cancelled status. The review should check that cancelling one ride does not change any other ride and that repeating the action cannot restore or delete the record.
>
> The current data model stores the changed status but does not record a cancellation reason or cancellation timestamp. Those should not be claimed as part of this fix.

### Trip ordering corrected

**User prompt:**

> the order of my trips feels off. if i book next week then book tomorrow, tomorrow should be at the top. can u review how we're sorting them?

**AI output:**

> Sorting all trips by booking creation time answers which booking was made most recently. It does not answer which ride the rider needs next. For example, a booking made today for next week could appear above a booking made yesterday for tomorrow.
>
> I would separate the status and time classification from the display ordering. First decide whether a ride belongs in Upcoming or Previous, then sort within each group. That also gives cancellation a defined effect on where the booking appears.
>
> The timestamp used for sorting should be stated explicitly. Booking creation time and scheduled pickup time are different fields and can produce very different lists.

**User redirection:**

> do nearest pickup first for upcoming, newest first for previous. and if i cancel tomorrow's ride it shouldn't still be under upcoming

**Revised AI output:**

> Your ordering is better for the rider's next action. I corrected the example to put future Scheduled rides in Upcoming and sort them by scheduled pickup time, earliest first. The remaining rides go in Previous and are sorted by scheduled pickup time, latest first.
>
> A cancelled booking for tomorrow therefore appears in Previous even though its timestamp is in the future. A completed ride stays in Previous regardless of when it was booked. A scheduled ride whose pickup time has passed also leaves Upcoming, but this grouping does not change its status to Completed.
>
> The distinction between grouping and status is important: the prototype has no driver or server event proving that a ride took place. The list can classify a record as no longer upcoming without inventing a completed trip.
>
> I would verify this with a mixed set: two future scheduled rides in reverse insertion order, a recent completed ride, an older completed ride, and a future-dated cancelled ride. The displayed groups should follow the business rule even when the input array is shuffled.
>
> Time-based grouping is calculated when the helper runs. This correction alone does not prove that a screen left open will refresh exactly at the pickup-time boundary; that behavior needs its own UI check.

### Saved-place validation

**User prompt:**

> check saved places as well. what if i add Home twice but the second one is lowercase? or i just type spaces for the address

**AI output:**

> An exact string comparison would treat Home and home as different labels. It would also treat a label with trailing spaces as a different value unless the incoming text is normalized. A simple nonempty-string check would accept an address made entirely of spaces.
>
> These are validation concerns within the existing saved-place form. The useful behavior is to explain which input is invalid, retain the user's text so it can be corrected, and avoid adding a record until both fields are acceptable.
>
> Duplicate labels should be checked against the current account's places. Two different accounts can both have a place named Home without either one preventing the other from saving it.

**User redirection:**

> fix that in the same form. Home and home are the same thing here. strip the extra spaces too

**Revised AI output:**

> I corrected the example validation in the existing form. The label and address are checked after trimming, so whitespace alone cannot create a place. The incoming label is compared with the current user's saved labels without case sensitivity, and successfully saved values are trimmed before storage.
>
> This prevents Home, home, and a newly entered Home with extra outer spaces from becoming separate labels in the normal app flow. The provider checks the same rules before adding the record, so the screen is not the only place enforcing them.
>
> On failure, the form displays the returned error and keeps the entered values. On success, it clears the name and address fields so the rider can add another place. Your approach is better than introducing another form because the correction belongs exactly where the original values were entered.
>
> The review cases should include an empty label, an empty address, whitespace-only input, a case variant of an existing label, and a valid new label. The current behavior prevents duplicate names, not duplicate physical addresses: Home and Parents could still refer to the same address. That is a separate product decision and is not silently changed by this fix.

### Account isolation review

**User prompt:**

> hold on, if i log out and make a new account will it show Ali's trips? check saved places too, a new account should be empty

**AI output:**

> One possible shortcut would be to clear the rides and saved places when the user signs out. That would prevent the next account from seeing those records, but it would do so by removing data rather than selecting the correct account's data.
>
> A more useful review needs to follow a complete account switch: use account A, sign out, create or sign in to account B, then return to account A. Looking only at whether account B starts empty would miss the loss of account A's session data.

**User redirection:**

> but if u clear everything then what happens when i log back into the first account? keep the data attached to its user, don't wipe it on logout

**Revised AI output:**

> You're correct; filtering by the signed-in user is better than clearing every record. The example now associates each ride with riderId and each saved place with userId, then exposes the records matching the current account.
>
> The shared in-memory collections can retain records for multiple accounts during the same session. Signing out clears the selected account rather than discarding those collections. A newly created account has its own identifier and therefore starts without the demo account's trips or places. Returning to the original account exposes its existing records again.
>
> Trip lookup also needs to operate on the current user's rides. Filtering only the history list would be incomplete if opening a trip directly could still retrieve another account's booking. Creation should use the current account identifier rather than accepting an arbitrary owner supplied by a screen.
>
> The manual check should create a ride and a place for account A, switch to B, confirm they are absent, add B's own records, and switch back. That verifies preservation and separation together.
>
> This is session-level behavior in a local prototype. It is not persistent storage or server-enforced access control. Also, reviewing the exposed lists does not certify every mutation: each write action still needs its own ownership review before a broader security claim is justified.

### Verification challenged

**User prompt:**

> ok but how do we know these fixes work? tell me what to try, including the weird cases. and what's still missing so i don't say it's done when it isn't

**AI output:**

> The checks should be divided by what they establish. Pure rule tests can check validation and ordering with fixed inputs. A full walkthrough is needed to verify that the screens call those rules, display errors, preserve input, and navigate only after successful actions.
>
> For the rule checks:
>
> - Scheduling: a valid future time, exactly now, a past time, an invalid date, exactly 30 days ahead, and a value just beyond the limit.
> - Cancellation: future Scheduled, elapsed Scheduled, Completed, and Cancelled records.
> - Trip grouping: shuffled input, different pickup times, and a future-dated cancelled booking.
> - Saved places: missing fields, whitespace-only fields, case-insensitive duplicate labels, and a valid new place.
>
> For the walkthrough, create a booking and inspect it in both the confirmation and history screens. Cancel it and reopen its details. Then switch accounts and return to the original account. Repeat form submissions with invalid input to check that failure does not create records or clear useful text.
>
> The existing tests cover several rule cases, but their presence does not prove they ran during this fictional review. The exact 30-day boundary, future-cancelled grouping, and account-switching flow also need explicit attention beyond the inspected cases.
>
> The remaining limits are unchanged: data resets on reload, fares are fixed, and rides do not automatically become Completed. Source inspection, automated tests, and device checks should be reported separately so the evidence is clear.

## 2. Critical analysis and adaptation

The user challenges five weak approaches: relying on the calendar alone, deleting cancelled bookings, sorting by creation time, comparing place labels exactly, and clearing shared data on sign-out. The revised answers explain why each correction matters and separate rule checks from full user-flow verification.

## 3. Current-code observations

| Topic | Existing implementation | Existing test coverage |
| --- | --- | --- |
| Scheduling | `src/features/bookings/schedule.ts`; booking action in `src/context/rides-context.tsx` | Future, past, current, invalid, beyond-limit, and default-time cases |
| Cancellation | `canCancel` and the status update in `src/context/rides-context.tsx` | Eligibility before and after pickup, Completed, and Cancelled status |
| Trip ordering | `splitTrips` in `src/features/bookings/schedule.ts` | Ordering of upcoming and previous trips |
| Saved places | `src/features/account/validation.ts` and `src/context/places-context.tsx` | Required fields and case-insensitive duplicate labels |
| Account-specific records | Filters in `src/context/rides-context.tsx` and `src/context/places-context.tsx` | No account-switching integration test in the inspected test files |

The inspected tests are `src/features/bookings/__tests__/schedule.test.ts` and `src/features/account/__tests__/validation.test.ts`. They do not explicitly cover the exact 30-day boundary or a future-dated cancelled ride in the trip-list split. The example's suggested checks should not be mistaken for completed test coverage.

## 4. Rationale

The example shows how concrete counterexamples improve a review: the user describes a failure, rejects a shortcut, and asks the AI to explain both the correction and the limits of verification.
