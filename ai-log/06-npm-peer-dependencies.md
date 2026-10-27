# 06 · npm peer dependencies

**Date:** 27 October 2026 · **Tool:** Claude Code (Claude Opus 5.5)

## 1. The prompt

**Verbatim** (the pasted npm output is shortened to its key lines):

```text
fix peerdeps for npm, uni requires npm, keep bun for local dev 

npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error
npm error While resolving: react-dom@19.3.1
npm error Found: react@19.3.0
...
npm error Could not resolve dependency:
npm error peer react@"^19.3.1" from react-dom@19.3.1
...
npm error Conflicting peer dependency: react@19.3.1
...
npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
```

- **Module/Feature:** the project's dependencies in `package.json`.
- **Constraints:**
  - `npm install` must work, because the university requires npm.
  - Bun stays the package manager for local development.
- **Specifics:** fix the peer dependency conflict.

## 2. The output

**Cause.** `expo-router` uses `@radix-ui/react-tabs`, which requires `react-dom` as a peer. Nothing in the project listed `react-dom`, so npm installed the latest release, 19.3.1. That release needs `react` 19.3.1 or later, while Expo SDK 58 pins `react` to 19.3.0. In an empty folder npm only warned and installed the mismatched pair. Over an existing `node_modules` it stopped with the error above. Bun does not enforce peer dependencies, so the local install had the same mismatched `react-dom` without any warning.

**Fix.** The AI added `react-dom` 19.3.0 as a direct dependency with `bunx expo install react-dom`. Expo's own version list for SDK 58 gives 19.3.0. This is the only change to `package.json`, and `bun.lock` was updated with it. The AI did not use `--legacy-peer-deps`, `--force` or an `.npmrc`, because they would hide the mismatch instead of fixing it.

The AI also updated the README so that it shows `npm install` and `npx expo start` first and says that the team uses bun locally.

## 3. Critical analysis and adaptation

**Changes:** none yet.

**Verification**

- **npm-only copy:** the AI ran a fresh `npm install` in a copy of the project with no `node_modules`, as a marker would. It finished with no ERESOLVE warning and exactly one `react` and one `react-dom`, both 19.3.0. In that copy, `npm test` passed all 73 tests, and `npx expo export --platform ios` built the app bundle.
- **Bun then npm:** in another copy, the AI ran `bun install` followed by `npm install`, the order that failed for us. npm finished with exit code 0. `npm test`, `npx tsc --noEmit` and `npx expo lint` all passed.
- **The real project, with bun:** the 73 tests, typecheck and lint passed, and `expo-doctor` passed all 20 checks.
- **Limit:** after `npm install`, `expo-doctor` reports "Multiple lock files detected", because npm writes `package-lock.json` next to `bun.lock`. Expo CLI still picks bun when both files exist. We chose to commit both lock files, so that npm installs the same versions we tested, and we accept this one `expo-doctor` warning.

## 4. Rationale

Pinning `react-dom` to the version Expo expects fixes the cause in one line. It works for both package managers and also fixes the mismatched version that bun had installed without warning. Forcing npm past the error would have handed in a project whose React packages don't match.
