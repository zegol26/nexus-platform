import type { DceLevel } from "./types";

export const advancedLevel: DceLevel = {
  level: "C1",
  name: "Advanced",
  focus: "Sophisticated Communication",
  cefrRange: "C1",
  badgeColor: "violet",
  modules: [
    {
      slug: "nuance-sarcasm-idiom",
      topic: "Nuance, Sarcasm, and Idiomatic Speech",
      summary:
        "Decode tone, soften unwelcome news, deliver controlled sarcasm, and read between the lines like a native speaker.",
      functionalLanguage: [
        "Using sarcasm appropriately",
        "Reading between the lines",
        "Softening bad news",
      ],
      vocabularyThemes: [
        "Idioms and phrasal verbs",
        "Cultural nuances",
        "Abstract concepts",
      ],
      grammarInContext: [
        "Mixed Conditionals",
        "Inversion for emphasis",
        "Advanced cleft sentences",
      ],
      reading: [
        {
          id: "adv-nuance-read-01",
          title: "The art of the British understatement",
          estReadMinutes: 4,
          text:
            "Few cultural quirks confuse newcomers to Britain more than the national habit of understatement. When a British colleague says a project is 'a bit of a challenge', they often mean it is on the verge of collapse. 'Not bad' can serve as enthusiastic praise, while 'with the greatest respect' frequently signals that what follows will be neither respectful nor diplomatic. The trick is not what is said but what is implied — and the implication is calibrated by tone, eyebrow, and the length of the pause that follows. For non-natives, the safest strategy is to listen for the gap between the words and the situation. If the words sound mild but the room has gone quiet, something heavier is being communicated.",
          questions: [
            {
              id: "q1",
              question: "What does 'a bit of a challenge' often actually mean?",
              options: [
                "An easy task",
                "A project on the verge of collapse",
                "A friendly disagreement",
                "A new opportunity",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question:
                "What signal does the article say usually follows 'with the greatest respect'?",
              options: [
                "Sincere praise",
                "An apology",
                "A blunt criticism",
                "A formal compliment",
              ],
              answerIndex: 2,
            },
            {
              id: "q3",
              question:
                "How does the writer recommend non-natives interpret British understatement?",
              options: [
                "Take words literally",
                "Listen for the gap between words and situation",
                "Ask for written summaries",
                "Avoid the conversation altogether",
              ],
              answerIndex: 1,
            },
            {
              id: "q4",
              question: "Which word best describes the tone of this article?",
              options: ["Sarcastic", "Wry and observational", "Hostile", "Academic"],
              answerIndex: 1,
            },
          ],
        },
      ],
      listening: [
        {
          id: "adv-nuance-listen-01",
          title: "A diplomatic 'no'",
          script:
            "Hannah: I've reviewed your proposal. It's certainly… ambitious. \nApplicant: Thank you. Does that mean we're moving forward? \nHannah: Let's say there are several aspects we'd want to revisit. The timeline, in particular, is rather optimistic. \nApplicant: I can adjust it. By how much? \nHannah: Perhaps if you assumed the funding would arrive twelve months later than planned, the rest of the plan might align with reality. \nApplicant: Understood. So it's a no in its current form. \nHannah: I wouldn't put it quite that strongly, but yes, you've grasped the spirit of it.",
          speakers: ["Hannah", "Applicant"],
          durationSec: 50,
          questions: [
            {
              id: "q1",
              question: "What is Hannah really doing in this conversation?",
              options: [
                "Approving the proposal enthusiastically",
                "Refusing the proposal in its current form, politely",
                "Asking for a smaller budget",
                "Forwarding it to a committee",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What does 'rather optimistic' suggest about the timeline?",
              options: [
                "It is realistic",
                "It is too short",
                "It is exactly right",
                "It is irrelevant",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "What does Hannah's final line imply?",
              options: [
                "She is contradicting herself",
                "She is softening a 'no' while still meaning it",
                "She has changed her mind",
                "She wants the applicant to escalate",
              ],
              answerIndex: 1,
            },
          ],
        },
      ],
      vocabulary: [
        { id: "v1", prompt: "Let's not ____ around the bush — say what you mean.", options: ["walk", "beat", "go", "run"], answerIndex: 1 },
        { id: "v2", prompt: "The launch was a complete ____ in the ointment.", options: ["fly", "bee", "fish", "thorn"], answerIndex: 0 },
        { id: "v3", prompt: "He's burning the candle ____ both ends.", options: ["on", "at", "from", "to"], answerIndex: 1 },
        { id: "v4", prompt: "I'd take that report with a ____ of salt.", options: ["pinch", "cup", "scoop", "kilo"], answerIndex: 0 },
        { id: "v5", prompt: "Her resignation came totally ____ of the blue.", options: ["out", "in", "off", "on"], answerIndex: 0 },
        { id: "v6", prompt: "The team is in ____ over the deadline.", options: ["over their heads", "out of stock", "off the wall", "on the dot"], answerIndex: 0 },
        { id: "v7", prompt: "We need to ____ the elephant in the room.", options: ["address", "feed", "ignore", "avoid"], answerIndex: 0 },
        { id: "v8", prompt: "His comment was a ____ in the side of management.", options: ["thorn", "rose", "needle", "nail"], answerIndex: 0 },
        { id: "v9", prompt: "Let's call it a day; we've gone the extra ____.", options: ["mile", "meter", "step", "kilometer"], answerIndex: 0 },
        { id: "v10", prompt: "She really hit the ____ on the head.", options: ["nail", "screw", "wood", "wall"], answerIndex: 0 },
      ],
      grammar: [
        { id: "g1", prompt: "If she had taken the job, she ____ in Berlin now.", options: ["would live", "would have lived", "would be living", "lives"], answerIndex: 2, targetStructure: "Mixed Conditional" },
        { id: "g2", prompt: "____ had I sat down when the phone rang.", options: ["No sooner", "Hardly", "Scarcely", "Barely"], answerIndex: 0, targetStructure: "Inversion" },
        { id: "g3", prompt: "Not only ____ late, he also forgot the slides.", options: ["he was", "was he", "he is", "is he"], answerIndex: 1, targetStructure: "Inversion for emphasis" },
        { id: "g4", prompt: "It was John ____ closed the deal.", options: ["who", "whom", "which", "what"], answerIndex: 0, targetStructure: "Cleft sentences" },
        { id: "g5", prompt: "What I really need ____ a long holiday.", options: ["are", "is", "be", "have"], answerIndex: 1, targetStructure: "Cleft sentences" },
        { id: "g6", prompt: "Rarely ____ a candidate this prepared.", options: ["I have seen", "have I seen", "I had seen", "had I see"], answerIndex: 1, targetStructure: "Inversion" },
        { id: "g7", prompt: "Had I known earlier, I ____ you immediately.", options: ["call", "would call", "would have called", "had called"], answerIndex: 2, targetStructure: "Inverted Conditional" },
        { id: "g8", prompt: "The reason I declined ____ that the terms were vague.", options: ["was", "were", "is being", "had"], answerIndex: 0, targetStructure: "Cleft sentences" },
        { id: "g9", prompt: "Should you require assistance, ____ hesitate to call.", options: ["don't", "do not", "not", "won't"], answerIndex: 1, targetStructure: "Inverted Conditional (formal)" },
        { id: "g10", prompt: "If we hadn't pivoted in 2024, the company ____ today.", options: ["wouldn't exist", "won't exist", "didn't exist", "doesn't exist"], answerIndex: 0, targetStructure: "Mixed Conditional" },
      ],
      dialogue: [
        {
          id: "adv-nuance-dlg-01",
          title: "A wry exchange in the lift",
          lines: [
            { speaker: "Sara", text: "Loved your presentation. So… brave of you to skip the data slides." },
            { speaker: "Mark", text: "Yes, I thought I'd let the strategy speak for itself." },
            { speaker: "Sara", text: "Mm. It said a lot." },
            { speaker: "Mark", text: "I sense layers in that compliment." },
            { speaker: "Sara", text: "I would never imply such a thing." },
          ],
          questions: [
            {
              id: "q1",
              question: "What is Sara actually doing?",
              options: [
                "Praising the talk genuinely",
                "Politely teasing Mark with sarcasm",
                "Asking for the slides",
                "Inviting him to lunch",
              ],
              answerIndex: 1,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "adv-nuance-rp-01",
          scenario:
            "Deliver bad news to a long-time client whose contract you have to terminate. Soften the message, acknowledge the relationship, and leave the door open for the future.",
          goal: "Practice diplomatic, idiomatic delivery of unwelcome news.",
          personaSlug: "diplomat",
          turns: 6,
          openingLine:
            "Thank you for making time today. I'm afraid I have something rather difficult to share with you.",
        },
      ],
    },
    {
      slug: "high-level-professional-discourse",
      topic: "High-Level Professional Discourse",
      summary:
        "Pitch ideas with confidence, lead debates, and use diplomatic language in board, summit, and investor settings.",
      functionalLanguage: [
        "Pitching ideas with structure",
        "Leading and moderating a debate",
        "Diplomatic and hedged language",
      ],
      vocabularyThemes: [
        "Global economics",
        "Leadership",
        "Corporate strategy",
      ],
      grammarInContext: [
        "Participle clauses",
        "Advanced cohesive devices",
        "Subjunctive mood",
      ],
      reading: [
        {
          id: "adv-pro-read-01",
          title: "What investors really listen for",
          estReadMinutes: 4,
          text:
            "Behind every founder's pitch lies a quieter conversation that experienced investors carry on with themselves. They are listening less for facts than for narrative coherence: does the founder's story hang together, and is the team unified by a shared idea of what 'winning' looks like? Numbers obviously matter, but they are weighted against the founder's confidence in defending them. A clean pitch with shaky answers under pressure is more damning than a rough pitch with crisp follow-ups. Above all, investors track the quality of the questions a founder asks back. A founder who interrogates the room, treating capital as one input among several, signals a maturity that purely defensive pitches almost never match.",
          questions: [
            {
              id: "q1",
              question: "According to the article, what do investors listen for most?",
              options: [
                "Slide design",
                "Narrative coherence",
                "Office location",
                "Customer testimonials",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question:
                "Which is more damning, according to the writer?",
              options: [
                "A rough pitch with crisp follow-ups",
                "A clean pitch with shaky answers",
                "A short deck",
                "A long deck",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "What signals founder maturity?",
              options: [
                "Defensive answers",
                "High valuation",
                "Quality of the questions the founder asks back",
                "Clothing choice",
              ],
              answerIndex: 2,
            },
          ],
        },
      ],
      listening: [
        {
          id: "adv-pro-listen-01",
          title: "Boardroom debate",
          script:
            "Daniel: Colleagues, I would propose that we sunset the legacy product within twelve months. \nMargaret: Were we to do so, we would alienate roughly a third of our current revenue base. \nDaniel: Granted. However, having reviewed the cohort data, I'd argue that revenue is structurally declining anyway. \nMargaret: Even so, the optics of an abrupt exit could shake confidence in the broader portfolio. \nDaniel: Which is precisely why I'd advocate a phased migration, paired with a generous customer-credit program. \nMargaret: Now that's a position I could support. Shall we draft something for the next session?",
          speakers: ["Daniel", "Margaret"],
          durationSec: 55,
          questions: [
            {
              id: "q1",
              question: "What is Daniel proposing?",
              options: [
                "Acquiring a competitor",
                "Sunsetting the legacy product",
                "Raising prices",
                "Going public",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What is Margaret's main concern?",
              options: [
                "The cost of marketing",
                "Optics and customer confidence",
                "Engineering capacity",
                "Regulatory risk",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "How does the conversation end?",
              options: [
                "With a hard disagreement",
                "With Margaret rejecting the plan",
                "With a willingness to draft a phased proposal",
                "With Daniel withdrawing",
              ],
              answerIndex: 2,
            },
          ],
        },
      ],
      vocabulary: [
        { id: "v1", prompt: "Our strategy ____ on disciplined capital allocation.", options: ["hinges", "hangs", "hooks", "halts"], answerIndex: 0 },
        { id: "v2", prompt: "The CFO ____ a cautious tone in her remarks.", options: ["struck", "set", "told", "made"], answerIndex: 0 },
        { id: "v3", prompt: "We're seeing significant ____ in the European market.", options: ["traction", "transit", "translation", "tradition"], answerIndex: 0 },
        { id: "v4", prompt: "Let me ____ the salient points before we proceed.", options: ["recap", "recall", "react", "reduce"], answerIndex: 0 },
        { id: "v5", prompt: "The proposal is ____ with our long-term vision.", options: ["aligned", "alarmed", "afforded", "altered"], answerIndex: 0 },
        { id: "v6", prompt: "We must ____ short-term pain against long-term gain.", options: ["weigh", "wait", "watch", "wage"], answerIndex: 0 },
        { id: "v7", prompt: "Their pricing model is largely ____ from ours.", options: ["divergent", "divided", "divisive", "diverse"], answerIndex: 0 },
        { id: "v8", prompt: "The CEO ____ his support to the new initiative.", options: ["lent", "borrowed", "took", "offered up"], answerIndex: 0 },
        { id: "v9", prompt: "I'd like to ____ a different perspective on this.", options: ["put forward", "put off", "put up", "put down"], answerIndex: 0 },
        { id: "v10", prompt: "Our market share has grown by leaps and ____.", options: ["bounds", "skips", "jumps", "miles"], answerIndex: 0 },
      ],
      grammar: [
        { id: "g1", prompt: "____ in the European market, the firm shifted focus.", options: ["Having struggled", "Struggling", "To struggle", "Struggle"], answerIndex: 0, targetStructure: "Participle clause (perfect)" },
        { id: "g2", prompt: "Should the board approve, we ____ proceed immediately.", options: ["will", "shall", "would", "are"], answerIndex: 0, targetStructure: "Inverted conditional" },
        { id: "g3", prompt: "It is essential that he ____ present at the vote.", options: ["is", "be", "was", "to be"], answerIndex: 1, targetStructure: "Subjunctive" },
        { id: "g4", prompt: "____ the data, we revised our forecast.", options: ["Considering", "Being considered", "To consider", "Consider"], answerIndex: 0, targetStructure: "Participle clause" },
        { id: "g5", prompt: "____, our findings suggest a structural shift.", options: ["In short", "In any case", "Therefore", "However"], answerIndex: 2, targetStructure: "Cohesive device" },
        { id: "g6", prompt: "The CEO insisted that the report ____ submitted by Monday.", options: ["is", "was", "be", "were"], answerIndex: 2, targetStructure: "Subjunctive" },
        { id: "g7", prompt: "____ properly executed, the strategy will succeed.", options: ["Being", "If", "When", "Once"], answerIndex: 1, targetStructure: "Cohesive device" },
        { id: "g8", prompt: "The committee recommended that he ____ from the role.", options: ["resigns", "resign", "resigned", "had resigned"], answerIndex: 1, targetStructure: "Subjunctive" },
        { id: "g9", prompt: "____ said than done, of course.", options: ["Easier", "Easy", "More easy", "Most easy"], answerIndex: 0, targetStructure: "Idiomatic comparative" },
        { id: "g10", prompt: "____, we must act decisively.", options: ["This being so", "Being this so", "So being this", "It being so"], answerIndex: 0, targetStructure: "Participle clause (absolute)" },
      ],
      dialogue: [
        {
          id: "adv-pro-dlg-01",
          title: "Pitching to a sceptical investor",
          lines: [
            { speaker: "Founder", text: "Our growth has compounded at 18% month over month for the past four quarters." },
            { speaker: "Investor", text: "Impressive on paper. What's the underlying driver?" },
            { speaker: "Founder", text: "Largely a shift from paid to organic acquisition, paired with a referral loop." },
            { speaker: "Investor", text: "Is that defensible?" },
            { speaker: "Founder", text: "We believe so, provided we keep the product surface lean. We can walk you through the cohort data." },
            { speaker: "Investor", text: "Please do." },
          ],
          questions: [
            {
              id: "q1",
              question: "What is the investor probing for?",
              options: [
                "Whether the growth is defensible",
                "The CEO's bio",
                "Office address",
                "Tax structure",
              ],
              answerIndex: 0,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "adv-pro-rp-01",
          scenario:
            "You're pitching a 3-year corporate strategy to the board. They're sceptical about reallocating budget away from a profitable but stagnating product line. Persuade them with structure, hedged language, and one strong analogy.",
          goal: "Demonstrate executive-level pitching with diplomatic language and strong cohesion.",
          personaSlug: "ceo",
          turns: 6,
          openingLine:
            "Welcome. Walk us through how this strategy materially changes our position over the next three years.",
        },
      ],
    },
  ],
};
