# StoryArc Linear Story, Quest Journal, and Exam Lab Runtime v4

Date: 2026-07-15

## Learner Story sequence

- The learner Story page no longer exposes the published content map.
- Published episode inventory remains visible under the admin StoryArc content lifecycle route.
- Learners enter the first incomplete episode by default. Requests for a future locked episode resolve to that current episode.
- Completed earlier episodes remain available through `Review previous`, an always-visible previous/first-episode control inside the scene player, the terminal completion controls, and the completed-mission journal.
- The next-episode action remains inside the terminal completion state, so forward movement follows the published sequence.

## Quest Journal

- Quest content is derived from each published Story Mode `episode-brief`, including quest intent, scene intent, arc title, and relationship notes.
- The journal shows the current mission, resume/start state, scene clue count, Story XP/level, completion count, and review links for completed missions.
- Future quest titles are not exposed to learners before their sequence unlock.

## Exam Lab practice runtime

- All 18 published Exam Lab items open as interactive practice sessions.
- The runtime normalizes School Exam, TOEIC-style, Interview, and Mock Exam blocks into section navigation.
- Selected-response questions support section checking, score display, explanations, and selected-option rationales.
- Listening sections expose explicit audio playback plus the published transcript.
- Speaking, writing, John interview, and presentation tasks expose response-note areas and published rubric focus.

The runtime is currently session practice. Certified evidence persistence, controlled attempt timing, and final approved audio remain separate release gates.
