# Platform Support Matrix

> **Single source of truth** for what works on which operating
> system. Code (`src/platform/capabilities.ts`) and docs read from
> this table. Update this file whenever a platform-related feature
> ships, is removed, or changes status.

## Tier Definitions

- **Tier 1 — required:** First-class platform. CI is required and
  green. Release blocker.
- **Tier 1 — target:** Will become required. CI runs but may be
  best-effort during the active build-out.
- **Tier 2 — best effort:** Supported when convenient. CI may be
  best-effort. Not a release blocker.
- **Unsupported:** Not maintained. May happen to work; no guarantees.

## Platforms

| Platform | Tier | Notes |
|----------|------|-------|
| macOS Apple Silicon (arm64) | Tier 1 — required | Primary platform. Signed and notarized. |
| Windows 11 x64 | Tier 1 — target | In active build-out. Detailed implementation plans are local-only until work is ready for public PRs. |
| Linux x64 | Tier 2 — best effort | Pre-beta. Functional but not a release blocker. |
| Windows 11 ARM64 | Tier 2 — best effort | Best-effort packaging only. |
| macOS Intel | Unsupported | Not built or tested. |

## Status Legend

- `supported` — implemented, tested, and exercised in CI where
  applicable.
- `partial` — implemented with known gaps documented in the notes.
- `unsupported` — not implemented on this platform.
- `planned` — on the roadmap but no active work.

## Capability Matrix

| Capability | macOS | Windows | Linux | Notes |
|------------|-------|---------|-------|-------|
| App startup (`npm start` from source) | supported | unsupported | partial | Windows blocked by Unix-only start script; fixed in windows-support phase 2. |
| Signed installer | supported | unsupported | unsupported | Windows installer planned in windows-support phase 13–14. |
| Auto-update | supported | unsupported | unsupported | Windows feed planned in windows-support phase 15. |
| Custom titlebar / window chrome | supported | unsupported | supported | Windows custom titlebar planned in windows-support phase 6. |
| Stealth UA matches host OS | supported | unsupported | partial | Windows UA persona planned in windows-support phase 7. |
| Chrome bookmark + history import | supported | unsupported | partial | Windows path detection planned in windows-support phase 8. |
| Chrome cookie import | partial | unsupported | partial | Windows DPAPI decrypt evaluated in windows-support phase 8. |
| Native messaging host detection | supported | partial | supported | Windows uses filesystem fallback today; registry reader planned in windows-support phase 9. |
| Voice transcription | supported | unsupported | partial | Windows Whisper fallback planned in windows-support phase 10. |
| Video recorder with system audio | supported | unsupported | partial | Windows WASAPI loopback planned in windows-support phase 11. |
| Keyboard shortcuts and labels | supported | partial | supported | Cross-platform labels finalized in windows-support phase 12. |
| Secrets at rest | supported | unsupported | supported | Unified `safeStorage` adapter planned in windows-support phase 5. |
| User data directory | supported | unsupported | supported | Windows `%APPDATA%` path planned in windows-support phase 4. |

## How to Update This File

1. Edit the relevant cell.
2. If a row flips to `supported` on Windows, also flip the matching
   value in `src/platform/capabilities.ts` so the UI hides or shows
   the feature accordingly.
3. Mention the change in `CHANGELOG.md` for the same release.
4. If a capability is removed or downgraded on macOS, treat it as a
   release blocker and revert unless a maintainer signs off.
