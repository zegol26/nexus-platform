# StoryArc Vocabulary and Expression Strategy

## Two separate catalogs

Per the Codex learning architecture, canonical definitions are versioned content and learner state is separate. Content design maintains **two catalogs with distinct ID namespaces**:

- **VOCABULARY** (`voc-*`): single words/lemmas with part of speech, meaning, grade band, example in StoryArc context.
- **EXPRESSIONS** (`exp-*`): collocations, phrasal language, functional chunks, and discourse formulas ("Would you mind…?", "It turns out…", "I'd rather…", "make a decision", "rain check").

StoryArc is **expression-first**: usable chunks carry communication; isolated nouns are the minority. Target ratio ≥1 expression per 1.5 vocabulary items overall.

## Load caps and budgets (initial release planning targets)

| Unit | New vocabulary | New expressions |
| --- | --- | --- |
| School Core item | ≤10 | ≤12 (typical 8) |
| Story episode | intro of new vocab discouraged (≤4) | ≤8 |
| Grade totals (planning) | ~140–160 | ~110–130 |
| Initial release totals (planning) | ~420–480 | ~330–390 |

These are authoring budgets, not counted content — final counts appear in the Step 4 generation report. Duplicate entries across grades are prohibited: a chunk is introduced once and thereafter **referenced** (recycled), never re-created under a new ID.

## Introduction → exposure → recall lifecycle

1. **Introduce (School Core):** expression taught with meaning, form, register note, and an active production task. Status: taught.
2. **Encounter/Unlock (Story Mode):** hearing/using the expression in a scene unlocks it in the learner's collection. **Unlock is exposure, not mastery** — per architecture, unlock state and recall evidence never share one boolean.
3. **Practice:** re-use in later practice beats or John coaching; updates practice counts only.
4. **Recall (delayed):** a later scene or Exam Lab checkpoint requires producing/selecting the expression without support. Only rubric-declared recall produces RECALL_EVIDENCE.

Every expression set introduced in grade G must have: ≥1 story encounter in grade G, and ≥1 recall opportunity in grade G or G+1. Release validation should reject orphan expressions (introduced, never encountered) and ghost recalls (recalled, never introduced).

## Progression design

### Grade 10 — survival and social chunks

Functional sets keyed to source items: introductions (exp set: "Nice to meet you too", "I'm into…", "How about you?"), small talk openers/closers, direction chunks ("It's just past…", "You can't miss it"), clarification kit ("Sorry, could you say that again?", "What does … mean?", "Do you mean…?"), invitation/decline softeners ("I'd love to, but…", "Maybe next time?"), preference chunks ("I'm not really a fan of…"), sequencing ("First… then… after that…"), storytelling connectors ("At first…", "In the end…").

The **clarification kit** is the series' flagship set: introduced sc-g10-12, applied sm-g10-02/05, recalled sm-g11-06 and sm-g12-05.

### Grade 11 — collaboration and argument chunks

Opinion/hedging ("I see your point, but…", "To be honest…", "That might not work because…"), suggestion/negotiation ("Why don't we…", "What if we…", "Let's meet halfway"), delegation ("Can you take care of…?", "Leave that to me"), progress/problem ("We're on track", "We're running behind", "It turns out…"), repair ("That came out wrong", "I owe you an apology", "Fair enough"), presentation signposts ("Let me start with…", "Moving on to…", "To sum up"), data talk ("increased sharply", "roughly a third").

### Grade 12 — professional and decision chunks

Self-presentation ("I'm confident with…", "hands-on experience", "a fast learner"), CV/letter collocations ("apply for a position", "meet the requirements", "attached is my…"), call etiquette ("May I ask who's calling?", "Could you put me through to…?", "Let me get back to you"), workplace ("safety first", "double-check", "report to", "shadow someone"), interviews ("In my previous project…", "The situation was…", "As a result…"), decisions ("weigh the options", "in the long run", "If I take this, then…"), farewells ("Keep in touch", "I can't thank you enough", "This isn't goodbye").

## Recall link plan (expression-set level)

| Expression set (source) | Encounter | Recall event(s) |
| --- | --- | --- |
| Clarification kit (sc-g10-12) | sm-g10-02, sm-g10-05 | sm-g11-06; **sm-g12-05**; ex-g10-05 criterion |
| Direction/place chunks (sc-g10-05/04) | sm-g10-02, sm-g10-08 | sm-g11-08; ex-g10-06 |
| Invitation softeners (sc-g10-08) | sm-g10-03, sm-g10-06 | sm-g11-06; ex-g10-05 |
| Storytelling connectors (sc-g10-15/09) | sm-g10-09 | **sm-g12-09**; ex-g10-06 |
| Message register (sc-g10-14) | sm-g10-07 | contrast recall in sm-g11-02 |
| Hedged disagreement (sc-g11-02) | sm-g11-03, sm-g11-05 | sm-g12-07; ex-g11-04 |
| Progress/problem chunks (sc-g11-08) | sm-g11-04 | **sm-g12-05**; ex-g11-04 |
| Presentation signposts (sc-g11-10/11) | sm-g11-07, sm-g11-08 | ex-g11-05 |
| Repair set (sc-g11-12) | sm-g11-05, sm-g11-06 | sm-g12-05 (register-shifted) |
| Formal request set (sc-g11-14) | sm-g11-02 | sm-g12-02, sm-g12-03 |
| STAR scaffolds (sc-g12-06) | sm-g12-08 | ex-g12-04 |
| Call etiquette (sc-g12-07) | sm-g12-03 | sm-g12-06; ex-g12-04 |
| Workplace set (sc-g12-08/09) | sm-g12-04 | sm-g12-05; ex-g12-02 |

## Contextual reuse rules

1. An expression's recall context must differ from its introduction context (new interlocutor, register, or stakes) — recall proves transfer, not scene memory.
2. Register-shifted recall is preferred in Grade 12 (informal chunk reappearing in professional form is explicitly taught as a shift).
3. John may prompt any unlocked expression in coaching; that is practice, not recall evidence.
4. Learner collection UI (unlocked expressions) shows exposure/practice status distinctly from recall-proven status — content supplies both states' copy.

## CONTENT REQUIREMENT / IMPLEMENTATION GAP

- Out-of-session spaced review of unlocked expressions requires the recall scheduler (gap G1). The in-story recall plan above is schedule-free by design.
- Expression audio (pronunciation models) requires the audio pipeline (gap G4).
- No acoustic pronunciation scoring is designed (gap G3).
