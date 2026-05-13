import type {
  DceComprehensionQuestion,
  DceDialogue,
  DceGapFill,
  DceGrammarDrill,
  DceLevel,
  DceListeningItem,
  DceModule,
  DceReadingPassage,
} from "./types";

const TARGET_PER_ACTIVITY = 25;

const distractorWords = [
  "school",
  "office",
  "market",
  "station",
  "coffee",
  "family",
  "teacher",
  "ticket",
  "meeting",
  "hotel",
  "doctor",
  "payment",
  "morning",
  "evening",
  "friend",
  "course",
  "project",
  "customer",
  "airport",
  "schedule",
];

const vocabularyByTheme: Record<string, string[]> = {
  numbers: ["one", "two", "three", "ten", "twenty"],
  time: ["morning", "evening", "minute", "hour", "schedule"],
  food: ["coffee", "tea", "juice", "breakfast", "dinner"],
  drinks: ["water", "coffee", "tea", "juice", "milk"],
  family: ["mother", "father", "sister", "brother", "grandmother"],
  friends: ["friend", "classmate", "team", "partner", "neighbor"],
  transportation: ["bus", "train", "ticket", "station", "taxi"],
  places: ["museum", "bank", "hotel", "office", "school"],
  city: ["street", "station", "corner", "museum", "bank"],
  money: ["price", "cash", "card", "dollar", "bill"],
  clothes: ["shirt", "jacket", "shoes", "dress", "size"],
  colors: ["blue", "black", "red", "green", "white"],
  hobbies: ["football", "music", "cooking", "drawing", "tennis"],
  weekend: ["saturday", "sunday", "movie", "visit", "family"],
  projects: ["task", "deadline", "update", "blocker", "review"],
  deadlines: ["today", "tomorrow", "schedule", "release", "delay"],
  hotels: ["room", "reception", "checkout", "shuttle", "luggage"],
  airports: ["flight", "gate", "shuttle", "passport", "ticket"],
  health: ["cough", "throat", "doctor", "clinic", "medicine"],
  appointments: ["clinic", "time", "date", "book", "visit"],
  strategy: ["decision", "evidence", "risk", "trade-off", "recommendation"],
  incidents: ["outage", "update", "impact", "cause", "service"],
  negotiation: ["agreement", "term", "compromise", "partner", "commitment"],
};

function cloneQuestion(question: DceComprehensionQuestion, id?: string): DceComprehensionQuestion {
  return {
    ...question,
    id: id ?? question.id,
    options: [...question.options],
  };
}

function sourceSentences(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[A-Z][A-Za-z .'-]{0,24}:\s*/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24);
}

function sourceLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const speakerMatch = line.match(/^([A-Z][A-Za-z .'-]{0,24}):\s*(.+)$/);
      return {
        speaker: speakerMatch?.[1],
        text: (speakerMatch?.[2] ?? line).trim(),
      };
    })
    .filter((line) => line.text.length >= 8);
}

function uniqueWords(text: string) {
  const stopWords = new Set([
    "the",
    "and",
    "you",
    "that",
    "this",
    "there",
    "here",
    "with",
    "for",
    "have",
    "has",
    "are",
    "is",
    "was",
    "were",
    "what",
    "where",
    "when",
    "your",
    "about",
    "because",
    "every",
    "many",
    "good",
    "hello",
    "please",
    "anything",
    "sure",
    "yes",
    "that",
    "will",
    "would",
    "could",
    "should",
    "from",
    "into",
    "onto",
    "john",
    "ana",
    "maya",
    "sofia",
    "lia",
    "emma",
    "sarah",
    "priya",
    "hannah",
    "margaret",
    "maria",
    "lina",
  ]);

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, " ")
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => /^[a-z0-9]+$/.test(word) && word.length >= 4 && word.length <= 14 && !stopWords.has(word))
    )
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function answerWordsFor(sentence: string, fallbackText: string) {
  const words = uniqueWords(sentence);
  return words.length > 0 ? words : uniqueWords(fallbackText);
}

function makeCloze(sentence: string, word: string) {
  return sentence.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "i"), "____");
}

function optionsFor(correct: string, seed: number) {
  const normalizedCorrect = correct.toLowerCase();
  const options = [correct];
  for (const word of [...distractorWords.slice(seed), ...distractorWords.slice(0, seed)]) {
    if (options.length >= 4) break;
    if (word.toLowerCase() !== normalizedCorrect && !options.some((option) => option.toLowerCase() === word.toLowerCase())) {
      options.push(word);
    }
  }
  return options;
}

function rotateOptions(options: string[], answer: string, seed: number) {
  const uniqueOptions = Array.from(
    new Map(options.map((option) => [option.trim().toLocaleLowerCase(), option.trim()])).values()
  ).filter(Boolean);
  const answerKey = answer.trim().toLocaleLowerCase();
  const withoutAnswer = uniqueOptions.filter((option) => option.toLocaleLowerCase() !== answerKey);
  const padded = [answer, ...withoutAnswer];

  for (const word of distractorWords) {
    if (padded.length >= 4) break;
    if (!padded.some((option) => option.toLocaleLowerCase() === word.toLocaleLowerCase())) {
      padded.push(word);
    }
  }

  const selected = padded.slice(0, 4);
  const shift = seed % selected.length;
  const rotated = [...selected.slice(shift), ...selected.slice(0, shift)];
  return {
    options: rotated,
    answerIndex: rotated.findIndex((option) => option.trim().toLocaleLowerCase() === answerKey),
  };
}

function mutateSentence(sentence: string, seed: number) {
  const replacements: Array<[RegExp, string[]]> = [
    [/\b(six|seven|eight|nine|ten|twenty|thirty|fifty|one|two|three|four|five)\b/i, ["four", "five", "ten", "twelve"]],
    [/\b(morning|afternoon|evening|night|today|tomorrow|monday|saturday|sunday)\b/i, ["evening", "morning", "Friday", "yesterday"]],
    [/\b(train|bus|taxi|car|shuttle|flight)\b/i, ["bus", "taxi", "train", "bicycle"]],
    [/\b(office|school|hotel|hospital|station|museum|bank|restaurant|clinic|airport)\b/i, ["school", "market", "library", "station"]],
    [/\b(coffee|tea|juice|muffin|breakfast|dinner|water)\b/i, ["tea", "sandwich", "water", "dinner"]],
    [/\b(left|right|straight|near|behind|next)\b/i, ["right", "left", "behind", "across"]],
    [/\b(likes|wants|needs|plans|studies|teaches|works|opens|takes)\b/i, ["hates", "forgets", "cancels", "closes"]],
  ];

  for (const [pattern, values] of replacements) {
    if (pattern.test(sentence)) {
      return sentence.replace(pattern, values[seed % values.length]);
    }
  }

  const words = answerWordsFor(sentence, sentence);
  const target = words[seed % Math.max(words.length, 1)];
  if (!target) return `Not stated: ${sentence}`;
  return sentence.replace(new RegExp(`\\b${escapeRegExp(target)}\\b`, "i"), distractorWords[seed % distractorWords.length]);
}

function addGeneratedQuestion(params: {
  questions: DceComprehensionQuestion[];
  seenQuestions: Set<string>;
  prefix: string;
  question: string;
  correctAnswer: string;
  options: string[];
  rationale: string;
}) {
  const questionKey = params.question.trim().toLocaleLowerCase();
  if (params.seenQuestions.has(questionKey)) return false;
  const optionSet = rotateOptions(params.options, params.correctAnswer, params.questions.length);
  if (optionSet.answerIndex < 0 || new Set(optionSet.options.map((option) => option.toLocaleLowerCase())).size < 4) {
    return false;
  }

  params.seenQuestions.add(questionKey);
  params.questions.push({
    id: `${params.prefix}-auto-${String(params.questions.length + 1).padStart(2, "0")}`,
    question: params.question,
    options: optionSet.options,
    answerIndex: optionSet.answerIndex,
    rationale: params.rationale,
  });
  return true;
}

function sentenceOptions(sentences: string[], correct: string, seed: number) {
  const alternatives = sentences.filter((sentence) => sentence !== correct);
  const mutated = mutateSentence(correct, seed);
  return [correct, mutated, ...alternatives].slice(0, 8);
}

function generateComprehensionCandidates(params: {
  sourceText: string;
  prefix: string;
  sourceLabel: "reading text" | "listening transcript" | "dialogue";
}) {
  const sentences = sourceSentences(params.sourceText);
  const lines = sourceLines(params.sourceText);
  const lineSentences = lines.map((line) => line.text).filter((line) => line.length >= 8);
  const usableSentences =
    params.sourceLabel === "reading text"
      ? sentences.length > 0 ? sentences : lineSentences
      : lineSentences.length > 0 ? lineSentences : sentences;
  const generated: DceComprehensionQuestion[] = [];
  const seenQuestions = new Set<string>();

  usableSentences.forEach((sentence, index) => {
    const words = answerWordsFor(sentence, params.sourceText);
    const focusWord = words[index % Math.max(words.length, 1)] ?? `detail ${index + 1}`;
    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Which detail about "${focusWord}" is stated in the ${params.sourceLabel}?`,
      correctAnswer: sentence,
      options: sentenceOptions(usableSentences, sentence, index),
      rationale: `This detail appears directly in the ${params.sourceLabel}.`,
    });
  });

  for (let index = 0; index < usableSentences.length - 1; index += 1) {
    const current = usableSentences[index];
    const next = usableSentences[index + 1];
    const currentFocus = answerWordsFor(current, params.sourceText)[0] ?? `detail ${index + 1}`;
    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Sequence check: which detail comes immediately after the detail about "${currentFocus}" in the ${params.sourceLabel}?`,
      correctAnswer: next,
      options: sentenceOptions(usableSentences, next, index + 7),
      rationale: `The next detail after that sentence is: "${next}"`,
    });
  }

  for (let index = 1; index < usableSentences.length; index += 1) {
    const previous = usableSentences[index - 1];
    const current = usableSentences[index];
    const currentFocus = answerWordsFor(current, params.sourceText)[0] ?? `detail ${index + 1}`;
    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Sequence check: which detail comes immediately before the detail about "${currentFocus}" in the ${params.sourceLabel}?`,
      correctAnswer: previous,
      options: sentenceOptions(usableSentences, previous, index + 11),
      rationale: `The previous detail in the ${params.sourceLabel} is: "${previous}"`,
    });
  }

  lines.forEach((line, index) => {
    if (!line.speaker) return;
    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Who says this line in the ${params.sourceLabel}: "${line.text}"?`,
      correctAnswer: line.speaker,
      options: [line.speaker, ...lines.map((candidate) => candidate.speaker ?? "").filter(Boolean), "Teacher", "Customer", "Clerk"],
      rationale: `${line.speaker} says this line in the ${params.sourceLabel}.`,
    });
  });

  usableSentences.forEach((sentence, index) => {
    const words = answerWordsFor(sentence, params.sourceText);
    const word = words[index % Math.max(words.length, 1)];
    if (!word) return;
    const cloze = makeCloze(sentence, word);
    if (cloze === sentence) return;

    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Complete this sentence from the ${params.sourceLabel}: "${cloze}"`,
      correctAnswer: word,
      options: optionsFor(word, index),
      rationale: `The original sentence in the ${params.sourceLabel} uses "${word}".`,
    });
  });

  usableSentences.forEach((sentence, index) => {
    const words = answerWordsFor(sentence, params.sourceText);
    const word = words[(index + 2) % Math.max(words.length, 1)];
    if (!word) return;
    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Which word from this ${params.sourceLabel} detail is most important for the meaning: "${sentence}"?`,
      correctAnswer: word,
      options: optionsFor(word, index + 5),
      rationale: `"${word}" is a key content word in that detail.`,
    });
  });

  let fallbackIndex = 0;
  while (generated.length < TARGET_PER_ACTIVITY && usableSentences.length > 0 && fallbackIndex < 500) {
    const sentence = usableSentences[fallbackIndex % usableSentences.length];
    const words = answerWordsFor(sentence, params.sourceText);
    const word = words[Math.floor(fallbackIndex / usableSentences.length) % Math.max(words.length, 1)];
    fallbackIndex += 1;
    if (!word) continue;

    const cloze = makeCloze(sentence, word);
    if (cloze === sentence) continue;

    addGeneratedQuestion({
      questions: generated,
      seenQuestions,
      prefix: params.prefix,
      question: `Advanced detail ${generated.length + 1}: Which option completes this ${params.sourceLabel} sentence without changing the meaning? "${cloze}"`,
      correctAnswer: word,
      options: optionsFor(word, generated.length + fallbackIndex),
      rationale: `The ${params.sourceLabel} uses "${word}" in this sentence.`,
    });
  }

  return generated;
}

function expandComprehensionQuestions(params: {
  baseQuestions: DceComprehensionQuestion[];
  sourceText: string;
  prefix: string;
  sourceLabel: "reading text" | "listening transcript" | "dialogue";
}) {
  const expanded = params.baseQuestions.map((question, index) =>
    cloneQuestion(question, `${params.prefix}-authored-${String(index + 1).padStart(2, "0")}`)
  );
  const seenQuestions = new Set(expanded.map((question) => question.question.trim().toLocaleLowerCase()));
  const candidates = generateComprehensionCandidates({
    sourceText: params.sourceText,
    prefix: params.prefix,
    sourceLabel: params.sourceLabel,
  });

  for (const candidate of candidates) {
    if (expanded.length >= TARGET_PER_ACTIVITY) break;
    const key = candidate.question.trim().toLocaleLowerCase();
    if (seenQuestions.has(key)) continue;
    seenQuestions.add(key);
    expanded.push({
      ...candidate,
      id: `${params.prefix}-auto-${String(expanded.length + 1).padStart(2, "0")}`,
    });
  }

  return expanded.slice(0, TARGET_PER_ACTIVITY);
}

function distributeComprehensionQuestions<T extends { id: string; questions: DceComprehensionQuestion[] }>(params: {
  items: T[];
  getSourceText: (item: T) => string;
  sourceLabel: "reading text" | "listening transcript" | "dialogue";
}) {
  const pools = params.items.map((item) => ({
    authoredCount: item.questions.length,
    questions: expandComprehensionQuestions({
      baseQuestions: item.questions,
      sourceText: params.getSourceText(item),
      prefix: item.id,
      sourceLabel: params.sourceLabel,
    }),
  }));
  const results = params.items.map((item) => ({ ...item, questions: [] as DceComprehensionQuestion[] }));
  let total = 0;

  for (let itemIndex = 0; itemIndex < pools.length && total < TARGET_PER_ACTIVITY; itemIndex += 1) {
    const authoredQuestions = pools[itemIndex].questions.slice(0, pools[itemIndex].authoredCount);
    for (const question of authoredQuestions) {
      if (total >= TARGET_PER_ACTIVITY) break;
      results[itemIndex].questions.push(question);
      total += 1;
    }
  }

  const autoIndexes = pools.map((pool) => pool.authoredCount);
  let cursor = 0;
  while (total < TARGET_PER_ACTIVITY) {
    if (pools.every((pool, index) => autoIndexes[index] >= pool.questions.length)) {
      break;
    }

    const itemIndex = cursor % pools.length;
    const nextQuestion = pools[itemIndex].questions[autoIndexes[itemIndex]];
    cursor += 1;

    if (!nextQuestion) {
      continue;
    }

    results[itemIndex].questions.push(nextQuestion);
    autoIndexes[itemIndex] += 1;
    total += 1;
  }

  return results;
}

function expandReading(reading: DceReadingPassage[], module: DceModule) {
  const fallbackText = `${module.topic}. ${module.summary}`;
  const target = reading.length > 0 ? reading : [{
    id: `${module.slug}-read-01`,
    title: `${module.topic} reading practice`,
    text: fallbackText,
    estReadMinutes: 2,
    questions: [],
  }];

  return distributeComprehensionQuestions({
    items: target,
    getSourceText: (item) => item.text,
    sourceLabel: "reading text",
  });
}

function expandListening(listening: DceListeningItem[], module: DceModule) {
  const fallbackScript = `John: Let's practice ${module.topic} today.\nMaya: Great. I want to learn useful English for ${module.topic}.`;
  const target = listening.length > 0 ? listening : [{
    id: `${module.slug}-listen-01`,
    title: `${module.topic} listening practice`,
    script: fallbackScript,
    speakers: ["John", "Maya"],
    durationSec: 30,
    requiresManualAudioReview: true,
    questions: [],
  }];

  return distributeComprehensionQuestions({
    items: target,
    getSourceText: (item) => item.transcript ?? item.script,
    sourceLabel: "listening transcript",
  });
}

function expandDialogue(dialogue: DceDialogue[], module: DceModule) {
  const fallbackLines = [
    { speaker: "John", text: `Let's practice ${module.topic}.` },
    { speaker: "Maya", text: "Yes, that sounds useful." },
  ];
  const target = dialogue.length > 0 ? dialogue : [{
    id: `${module.slug}-dlg-01`,
    title: `${module.topic} dialogue practice`,
    lines: fallbackLines,
    questions: [],
  }];

  return distributeComprehensionQuestions({
    items: target,
    getSourceText: (item) => item.lines.map((line) => `${line.speaker}: ${line.text}`).join("\n"),
    sourceLabel: "dialogue",
  });
}

function expandVocabulary(vocabulary: DceGapFill[], module: DceModule) {
  const expanded = vocabulary.map((item) => ({ ...item, options: [...item.options] }));
  const themes = module.vocabularyThemes.length ? module.vocabularyThemes : [module.topic];
  let index = 0;

  while (expanded.length < TARGET_PER_ACTIVITY) {
    const theme = themes[index % themes.length];
    const themeKey =
      Object.keys(vocabularyByTheme).find((key) => theme.toLowerCase().includes(key)) ??
      "places";
    const themeWords = vocabularyByTheme[themeKey];
    const correct = themeWords[index % themeWords.length];
    expanded.push({
      id: `${module.slug}-v-auto-${String(index + 1).padStart(2, "0")}`,
      prompt: `Which word belongs to the topic "${theme}"?`,
      options: optionsFor(correct, index),
      answerIndex: 0,
      rationale: `"${correct}" is a useful word for the topic "${theme}".`,
    });
    index += 1;
  }

  return expanded.slice(0, TARGET_PER_ACTIVITY);
}

function expandGrammar(grammar: DceGrammarDrill[], module: DceModule) {
  const expanded = grammar.map((item) => ({ ...item, options: [...item.options] }));
  const structures = module.grammarInContext.length ? module.grammarInContext : ["Present Simple"];
  let index = 0;

  while (expanded.length < TARGET_PER_ACTIVITY) {
    const structure = structures[index % structures.length];
    const template = grammarTemplate(structure, index);
    expanded.push({
      id: `${module.slug}-g-auto-${String(index + 1).padStart(2, "0")}`,
      prompt: template.prompt,
      options: template.options,
      answerIndex: 0,
      rationale: template.rationale,
      targetStructure: structure,
    });
    index += 1;
  }

  return expanded.slice(0, TARGET_PER_ACTIVITY);
}

function grammarTemplate(structure: string, index: number): Pick<DceGrammarDrill, "prompt" | "options" | "rationale"> {
  const lower = structure.toLowerCase();
  const templates: Array<Pick<DceGrammarDrill, "prompt" | "options" | "rationale">> = lower.includes("perfect")
    ? [
        {
          prompt: "She ____ finished the report.",
          options: ["has", "have", "is", "does"],
          rationale: "Use 'has' with she/he/it in the present perfect.",
        },
        {
          prompt: "They ____ worked here since 2024.",
          options: ["have", "has", "are", "did"],
          rationale: "Use 'have' with they/we/you/I in the present perfect.",
        },
      ]
    : lower.includes("conditional")
      ? [
          {
            prompt: "If it rains, we ____ stay home.",
            options: ["will", "would", "were", "had"],
            rationale: "In the first conditional, use will + base verb for the result.",
          },
          {
            prompt: "If I were you, I ____ ask for help.",
            options: ["would", "will", "am", "have"],
            rationale: "Use would in the result clause of a second conditional.",
          },
        ]
      : lower.includes("modal") || lower.includes("request") || lower.includes("could")
        ? [
            {
              prompt: "____ you help me with this form?",
              options: ["Could", "Do", "Are", "Has"],
              rationale: "'Could you' is a polite request.",
            },
            {
              prompt: "You ____ bring your ID card.",
              options: ["should", "are", "have", "does"],
              rationale: "Use 'should' to give advice.",
            },
          ]
        : lower.includes("preposition")
          ? [
              {
                prompt: "The meeting starts ____ nine.",
                options: ["at", "on", "in", "by"],
                rationale: "Use 'at' with clock times.",
              },
              {
                prompt: "She lives ____ Jakarta.",
                options: ["in", "on", "at", "to"],
                rationale: "Use 'in' with cities.",
              },
            ]
          : lower.includes("comparative") || lower.includes("superlative")
            ? [
                {
                  prompt: "This room is ____ than the old one.",
                  options: ["quieter", "quiet", "quietest", "more quietest"],
                  rationale: "Use a comparative adjective with 'than'.",
                },
                {
                  prompt: "It is the ____ option today.",
                  options: ["best", "better", "good", "more good"],
                  rationale: "Use the superlative form after 'the'.",
                },
              ]
            : [
                {
                  prompt: "He ____ to school every morning.",
                  options: ["goes", "go", "going", "gone"],
                  rationale: "Use verb-s with he/she/it in the present simple.",
                },
                {
                  prompt: "They ____ English on Monday.",
                  options: ["study", "studies", "studying", "studied"],
                  rationale: "Use the base verb with they/we/you/I in the present simple.",
                },
              ];

  return templates[index % templates.length];
}

export function expandDceModuleQuestions(module: DceModule): DceModule {
  return {
    ...module,
    functionalLanguage: [...module.functionalLanguage],
    vocabularyThemes: [...module.vocabularyThemes],
    grammarInContext: [...module.grammarInContext],
    reading: expandReading(module.reading, module),
    listening: expandListening(module.listening, module),
    vocabulary: expandVocabulary(module.vocabulary, module),
    grammar: expandGrammar(module.grammar, module),
    dialogue: expandDialogue(module.dialogue, module),
    roleplay: module.roleplay.map((item) => ({ ...item })),
  };
}

export function expandDceLevelQuestions(level: DceLevel): DceLevel {
  return {
    ...level,
    modules: level.modules.map(expandDceModuleQuestions),
  };
}

export { TARGET_PER_ACTIVITY };
