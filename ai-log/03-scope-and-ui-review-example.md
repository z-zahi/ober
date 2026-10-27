# 03 · Scope and UI review 

## 1. The prompts and outputs

### Initial review

**User prompt:**

> can u look at what we have so far and tell me what's actually needed for phase 1? i feel like we're adding too much

**AI output:**

> I propose covering both sides of the ride: a rider makes a request, a driver accepts it, the trip progresses, and the rider pays and leaves a rating. That would give the diagrams a clear interaction between two actors and provide enough distinct screens for the UI requirement.
>
> The rider side would include pickup and destination, ride selection, an active-trip screen, history, and profile. The driver side would need availability, incoming requests, and trip controls. Live location could help demonstrate progress, while Supabase could eventually coordinate the records.
>
> The cost of this proposal is that several screens depend on behavior outside a simple UI prototype. Accepting a ride needs another actor, tracking needs changing location data, and payment needs a clear distinction between a demonstration and an actual transaction. These dependencies make the scope much larger than the screen count suggests.

**User redirection:**

> no this is basically the whole app. we're only doing phase one. just the rider booking a ride for now, leave the driver stuff and supabase for later

**Revised AI output:**

> You're right. A rider scheduling flow is better than what I proposed for this phase because it gives us a complete journey that can be demonstrated by one person. My first proposal expanded into dispatch, tracking, and payment before establishing the basic booking experience.
>
> The revised scope is:
>
> - Enter a pickup and destination, with saved places as optional shortcuts.
> - Choose a future date and time and compare the available ride options.
> - Select a payment preference and confirm the booking.
> - Show the booking summary, then make the record available in My Trips.
> - Open trip details and cancel a scheduled ride while it is still eligible.
> - Manage profile details and saved places through the same account.
>
> This still provides several useful functions beyond authentication. It also gives the activity diagram one readable path, with branches for invalid input and cancellation. The current prototype can use in-memory data while the storage section explains the planned Supabase model.
>
> The acceptance check should follow one rider from entering a journey through finding the same booking in history. Driver availability, live tracking, completed payments, and server synchronization should remain outside the implementation claims for this phase.

### Styling proposal rejected

**User prompt:**

> also check the ui. we already have Daniella's screens so whatever we add needs to look like those

**AI output:**

> My first suggestion is to introduce a stronger visual theme: a colored Home header, larger promotional cards, and a more prominent confirmation treatment. That could make individual screens feel more polished in screenshots. I also considered plain styles throughout to reduce the number of styling conventions a new contributor has to learn.
>
> However, both choices would affect more than the new screens. Existing buttons, headings, cards, and form fields would need to be reconciled with the new direction. The review therefore needs to consider consistency across the whole app, not just whether one redesigned screen looks attractive.

**User redirection:**

> why are we changing the design? keep it black and white like the existing screens. and use nativewind, we already decided on that

**Revised AI output:**

> You're correct: matching the existing design is better than introducing my proposed visual direction. The team already has a recognizable visual language, and replacing it would create extra work without improving the booking flow.
>
> I would keep NativeWind and use the existing shared components as the starting point. Buttons should have consistent height, text treatment, and emphasis. Form fields should keep visible labels rather than relying only on placeholders. Ride options should use the same card structure so the rider can compare price, capacity, and description without learning a new layout for each option.
>
> The review should focus on the details that affect use: whether the selected option is obvious, whether secondary text remains readable, whether long addresses can fit, and whether the main action is easy to find on a small screen. A dark primary action, light surfaces, muted labels, and simple borders already support those goals.
>
> I would compare Home, Choose Ride, Profile, and the new account screens together before accepting a visual change. That makes consistency a concrete check rather than assuming that reusing the same colors is sufficient. NativeWind remains the agreed styling approach; there is no reason to change it as part of this review.

### Screen-count review

**User prompt:**

> how many screens do we actually have without login and signup? those don't count btw. don't split everything into separate pages just to get nine

**AI output:**

> The current screen set has nine useful non-authentication screens:
>
> 1. Home collects the pickup and destination.
> 2. Choose Ride brings together scheduling, ride selection, fare, and payment preference.
> 3. My Trips separates upcoming bookings from previous trips.
> 4. Profile gives the rider access to account information and settings.
> 5. Ride Scheduled confirms the booking that was just created.
> 6. Trip Details shows an existing booking and its available actions.
> 7. Edit Profile lets the rider change account details.
> 8. Saved Places manages reusable addresses.
> 9. Payment Method changes the preference used for new bookings.
>
> Sign In and Sign Up are separate from this count. The most important distinction to explain is between Ride Scheduled and Trip Details: one confirms the result of a booking action, while the other supports later inspection and cancellation. A date picker or a cancellation dialog should not be counted as another full screen.

**User redirection:**

> date and time can stay on choose ride. i don't want to go through another page for that. cancel can just be a button in trip details too

**Revised AI output:**

> Agreed. Your arrangement gives each screen a clear responsibility and keeps related decisions together. Choose Ride should let the rider review the date, time, selected vehicle type, fare, and payment preference before making a single confirmation decision.
>
> A separate scheduling page would make the rider remember a choice made earlier in the flow. Keeping it on Choose Ride also makes validation easier to understand: an invalid date or time can be corrected in the same place where the rider confirms the booking.
>
> Cancellation belongs in Trip Details, alongside the pickup, destination, and scheduled time. The rider can identify the correct booking before choosing the destructive action, and a confirmation dialog can explain that the booking will remain in history as cancelled.
>
> I would review the screen count against the route list and then walk through the actions on each screen. That checks both the numeric requirement and whether the screens do useful work. We should not create a separate route solely to display an error, choose a date, or confirm a cancellation.

### Payment scope corrected

**User prompt:**

> wait what are we doing on the payment screen exactly? we're not taking real payments

**AI output:**

> One option would be to build a payment-style form with card number and expiry fields, followed by a simulated success screen. That would demonstrate a familiar checkout layout, but it would introduce questions the prototype does not currently answer: where the details go, whether anything is validated beyond formatting, and whether a charge actually happens.
>
> Before adopting that approach, the screen needs a precise responsibility. A payment preference and a payment transaction are different features, and the rest of the booking flow must use the same meaning.

**User redirection:**

> no don't ask for card numbers. just cash, card or wallet and remember what i picked. that's enough for this phase

**Revised AI output:**

> You're right; your version describes what the prototype actually does and is better than my proposed card-entry flow. Payment Method should let the rider choose Cash, Card, or Wallet, save that preference, and return to the previous screen.
>
> The booking then needs to record the selected method at creation time. That detail matters because changing the account preference later should affect new rides without rewriting an existing booking's payment information. The confirmation and trip-details screens should read the method from the booking itself.
>
> The interface should explain that this is a payment choice and should not display a transaction receipt, authorization result, or successful-charge message. Collecting card details would add unnecessary sensitive input without supporting a real payment function.
>
> The useful review cases are selecting a different method, leaving without saving, returning to Choose Ride after saving, and inspecting an older booking after the preference changes. The report should describe this feature as choosing and storing a payment preference, with transaction processing left for future work.

### Final flow review

**User prompt:**

> can u go over the flow again? like if someone opens this and hasn't seen it before, what's confusing? i need an actual review

**AI output:**

> The most useful review findings are about information and missing states:
>
> - The booking confirmation needs a visible pickup time. Without it, a rider could mistake scheduling for an immediate ride request.
> - A new account needs a useful empty state in My Trips. An empty page gives no indication whether loading failed or no bookings exist.
> - Trip Details needs a missing-record state. A booking reference may no longer resolve after the in-memory session resets.
> - Fare descriptions need to say that the prototype uses fixed prices. The app does not calculate a route distance, so the wording should not imply a distance-based estimate.
> - Cancelling a ride should explain the result before applying it. The booking stays in history with a changed status.
>
> I would check these with both the seeded demo account and a new account. The demo account helps show a populated history; the new account exposes whether the app explains its empty states. Those are different review situations, and screenshots of populated screens alone would miss the second one.

**User redirection:**

> yes fix those first. leave the animations for now, i care more about the booking making sense

**Revised AI output:**

> That is a better priority than my earlier decorative suggestions. The next pass should make the booking information consistent across Choose Ride, Ride Scheduled, My Trips, and Trip Details. A rider should recognize the same journey, time, price, and status wherever that booking appears.
>
> I would then inspect the empty and missing-record states, followed by cancellation feedback and fixed-fare wording. These changes improve the explanation of the existing behavior without adding a new feature or a new dependency.
>
> For verification, the walkthrough should include a successful booking, an invalid time, an empty account, a cancellation, and an unavailable booking reference. Mobile layout checks should include long addresses and the form with the keyboard open. Those checks still need to be performed on the actual app; a source review alone does not establish that every layout is comfortable on a device.
>
> Animation can be considered after those cases are clear. At this stage, the acceptance criterion is whether someone can complete the flow and understand the result without a team member explaining each screen.

## 2. Critical analysis and adaptation

In this example, the user rejects an oversized driver flow, a visual redesign, extra navigation, and simulated payment processing. The revised direction is a focused rider prototype. The AI's useful contribution is explaining screen responsibilities and identifying missing-state and wording concerns.

## 3. Current-code observations

- `README.md` lists the nine non-authentication screens and describes the in-memory prototype.
- `src/app/ride/confirm.tsx` groups date, time, ride selection, fare, and payment preference.
- `src/app/(tabs)/trips.tsx` includes an empty state for an account with no rides.
- `src/app/trip/[id].tsx` includes a missing-trip state, fixed-fare wording, and conditional cancellation.

These are observations of the existing implementation, not evidence that the invented exchange produced it.

## 4. Rationale

The example shows the user setting priorities and rejecting unnecessary scope, while using AI review to clarify the behavior of each screen.
