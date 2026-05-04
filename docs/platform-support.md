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
| Custom titlebar / window chrome | supported | supported | supported | Windows source runs use frameless shell-owned controls; public Windows release remains unannounced. |
| Stealth UA matches host OS | supported | supported | partial | Windows source runs present Chrome on Windows; public Windows release remains unannounced. |
| Chrome bookmark + history import | supported | supported | partial | Windows source runs scan `%LOCALAPPDATA%\Google\Chrome\User Data\<Profile>\` for bookmark and history import. |
| Chrome cookie import | partial | unsupported | partial | Windows encrypted cookie import requires DPAPI support and is intentionally not implemented in phase 8; no risky dependency was added. |
| Native messaging host detection | supported | supported | supported | Windows reads Chrome native messaging host registry keys under HKCU/HKLM and keeps the filesystem fallback. |
| Voice transcription | supported | partial | partial | Windows source runs can use user-installed `whisper.exe` on `PATH`; Tandem does not bundle Whisper or download models. |
| Video recorder with system audio | supported | unsupported | partial | Windows phase 11 spike found that the current `ffmpeg-static` binary exposes DirectShow capture but no WASAPI input, and this machine has no DirectShow loopback/system-audio device. |
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
