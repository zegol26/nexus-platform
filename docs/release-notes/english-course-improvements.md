# English Course Improvements

## Added

- Added next section/course navigation for English DCE modules, with a roadmap fallback at the end of the course.
- Added structured answer feedback with correctness, correct answer, explanation, learner summary, and study tip.
- Added dual-voice listening playback for DCE dialogues: John for speaker A and a female English partner voice for speaker B.
- Added English listening sanity checks via `npm run sanity:english-listening`.
- Added English question quality validation via `npm run sanity:english-questions`.
- Added regression checks for question counts, listening transcript format, feedback output, and navigation helpers.
- Expanded each DCE level to 5 modules.
- Expanded every DCE module to 25 questions each for Reading, Listening, Vocabulary, Grammar, and Dialogue.
- Added answer-position distribution validation so correct options cannot stay pinned to the same A/B/C/D slot.

## Improved

- Converted Foundation A1-A2 listening scripts to clear A/B dialogue format.
- Standardized listening character roles so speaker A is John and speaker B is another named speaker, usually female.
- Standardized Foundation listening metadata with level, section, speakers, and manual audio review flags.
- Added section summary UI after quiz practice is completed.
- Normalized DCE option ordering after question expansion so authored and generated questions keep their content while distributing correct answers across A/B/C/D.

## Quality

- English sections are validated to contain at least 25 questions.
- Validation catches vague prompts, missing answers, duplicate options, unsupported listening answers, same-position answer distributions, missing transcripts, and missing audio references when static audio is configured.
