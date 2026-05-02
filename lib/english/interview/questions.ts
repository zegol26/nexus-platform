export type EnglishInterviewSeedQuestion = {
  sourceKey: string;
  order: number;
  prompt: string;
  focusArea: string;
  expectedDuration: string;
  audioText: string;
};

export const englishInterviewQuestions: EnglishInterviewSeedQuestion[] = [
  {
    sourceKey: "overseas-interview-001",
    order: 1,
    prompt: "Tell me about yourself and why you want to work abroad.",
    focusArea: "Self introduction and motivation",
    expectedDuration: "60-90 seconds",
    audioText:
      "Question one. Tell me about yourself and why you want to work abroad. Please answer in clear English for about one minute.",
  },
  {
    sourceKey: "overseas-interview-002",
    order: 2,
    prompt: "Describe your previous work experience and the skills you can bring to our team.",
    focusArea: "Work experience and transferable skills",
    expectedDuration: "60-90 seconds",
    audioText:
      "Question two. Describe your previous work experience and the skills you can bring to our team. Give one concrete example.",
  },
  {
    sourceKey: "overseas-interview-003",
    order: 3,
    prompt: "How do you handle pressure, schedule changes, or difficult instructions at work?",
    focusArea: "Problem solving and workplace behavior",
    expectedDuration: "60-90 seconds",
    audioText:
      "Question three. How do you handle pressure, schedule changes, or difficult instructions at work? Explain your approach calmly.",
  },
  {
    sourceKey: "overseas-interview-004",
    order: 4,
    prompt: "Tell me about a time you worked with people from different backgrounds.",
    focusArea: "Cross-cultural communication",
    expectedDuration: "60-90 seconds",
    audioText:
      "Question four. Tell me about a time you worked with people from different backgrounds. What did you learn from that experience?",
  },
  {
    sourceKey: "overseas-interview-005",
    order: 5,
    prompt: "Why should we hire you for this overseas position?",
    focusArea: "Closing pitch and confidence",
    expectedDuration: "60-120 seconds",
    audioText:
      "Question five. Why should we hire you for this overseas position? Summarize your strengths and commitment.",
  },
];
