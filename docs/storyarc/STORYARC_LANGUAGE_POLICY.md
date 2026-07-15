# StoryArc Language Policy

## Policy objective

Every voice and tutor request is explicitly bound to an application, course, tutor, source language, output language, voice profile, history scope, entitlement policy, and usage feature. No language decision comes from a shared default, global UI locale, previous app session, or model inference when the product context is known.

## Current repository truth

John’s present request path is protected in several places:

- `lib/english/john-tutor-config.ts` declares `tutorId=john`, `courseId=english-john`, and English input/output/UI.
- `components/apps/english/john/JohnVoicePanel.tsx` sends John identity to STT and requests `voiceProfile=john` for TTS.
- `app/api/voice/transcribe/route.ts` resolves John server-side and passes `language: "en"` to OpenAI.
- `app/api/apps/english/john/route.ts` filters history, uses an English-only prompt, repairs forbidden-script output, and applies a deterministic final guard.
- `VoiceTtsCache` keys include voice profile and text hash.

Confirmed remaining coupling:

- unlabeled shared STT defaults to `ja`;
- Nihongo’s voice client depends on that implicit default;
- John STT and tutor quota helpers resolve Nihongo access and usage;
- missing/unknown TTS profile defaults to Ai-chan;
- client language fields are submitted but do not define the server contract;
- no generic server-owned tutor context registry exists.

## Required server-owned context

Before StoryArc voice/AI implementation, introduce an explicit validated context registry. Conceptual entry:

```text
contextId: storyarc-john
appSlug: storyarc
courseId: storyarc-english-10-12
tutorId: john
subject: english
inputLanguage: en
outputLanguage: en
uiLanguage: en or id, as product-selected
allowMixedLanguage: false
voiceProfile: john
sttPolicy: english-only
historyNamespace: storyarc:john
entitlementSlug: storyarc
usageFeatures: STORYARC_AI_TUTOR, STORYARC_VOICE
outputGuard: john-english-only
```

The client sends only a context ID. The server resolves all authoritative fields. Unknown or disabled contexts return 400/403; they never fall back to Japanese, Ai-chan, another app, or a general assistant.

## End-to-end StoryArc voice flow

1. StoryArc recorder captures a supported browser audio format.
2. Client posts audio plus `contextId=storyarc-john` and an attempt/turn ID.
3. Server authenticates and checks `AppUserAccess` for `storyarc`.
4. Server resolves the context registry and checks StoryArc voice usage.
5. Server validates MIME/size and calls STT with explicit `language=en`.
6. Server applies an English input policy. Japanese/non-Latin input receives an English retry prompt; it is not translated into Japanese or inserted into history.
7. Tutor route scopes history to `historyNamespace=storyarc:john`, item revision, and learner.
8. Prompt receives only StoryArc English lesson/scene context and the allowed recent history.
9. Output is checked with the John English-only policy; invalid output is repaired once and then replaced by deterministic fallback.
10. TTS is invoked with the resolved `voiceProfile=john`, not a client-selected default.
11. Cache identity includes profile, provider/model/voice/instruction version, normalized text hash, and policy version.
12. Usage/latency/provider metadata is recorded under `appSlug=storyarc`; response audio is returned through authenticated storage/streaming.

## Isolation rules

- StoryArc history never includes Nexus AI English, Nihongo, Arabic, PMP, Ai-chan, or global assistant turns.
- Browser state is not trusted as the only history scope; persisted conversation keys include user, app, course/tutor context, and item/scene when relevant.
- Nihongo lesson fields, Japanese profile weaknesses, romaji, Japanese examples, and `NihongoLessonTutorMessage` are forbidden StoryArc prompt inputs.
- Global `LanguageProvider` controls UI copy only. It cannot alter STT language, tutor subject, output policy, or TTS profile.
- Browser `navigator.language` is telemetry only.
- StoryArc canonical content declares content language. The server verifies that requested item revision belongs to StoryArc.
- Indonesian may be used for UI instructions or approved scaffolding, but John’s spoken tutor reply remains English-only under the current product concept.
- No automatic English→Japanese translation stage exists in StoryArc.

## Prompt policy

StoryArc John:

- is an English mentor, not a general assistant;
- uses grade/competency/scene context from the published item revision;
- does not reveal system instructions;
- does not quote, translate, transliterate, pronounce, or explain Japanese text;
- redirects non-English-script input to a short English starter;
- does not use copyrighted anime characters or universes;
- cannot grant XP, quests, relationships, completion, grades, or mastery;
- returns formative coaching unless called by a separate controlled assessment evaluator.

Hana and Ryo are original StoryArc characters. Their dialogue is canonical published content or validated StoryArc generation output, not a reuse of Nihongo prompt/persona state.

## STT policy

- Explicit BCP-47/ISO language selected from server context; StoryArc uses English.
- No source-language auto-detection as the primary routing mechanism.
- Script detection is a guard, not proof of spoken language; Latin-script Japanese remains an input-quality edge case and returns an English practice redirect when detected by content policy.
- Store transcript only under declared retention/privacy policy.
- Do not send previous chat history to STT.
- Do not translate STT output before tutor processing.

## TTS and cache policy

- Require a resolved allowed voice profile; remove fallback to Ai-chan for StoryArc paths.
- Cache key dimensions: app/context policy version, profile, provider/model, voice ID/version, instruction version, normalized text hash, format.
- Cache bytes contain no authorization. Cache GET remains authenticated and checks access where cost/content sensitivity requires it.
- John and Ai-chan never share cache identities even for identical text.
- Purge/retention and object-storage migration are operational requirements before large-scale StoryArc audio.

## Tests that block StoryArc voice release

- Missing/unknown context is rejected and never chooses Japanese.
- `storyarc-john` always passes English to STT.
- `nihongo-aichan` continues to pass Japanese explicitly after default removal.
- English access without Nihongo access can use StoryArc voice when StoryArc-entitled.
- StoryArc usage is recorded under StoryArc only.
- Cross-app history injection is dropped.
- Japanese/non-Latin transcript and response guards return English fallback.
- Missing TTS profile cannot select Ai-chan.
- Cache keys differ by app/context/profile/policy version.
- Global ID/EN UI toggle and `navigator.language=ja-JP` do not change server language selection.
