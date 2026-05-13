import type { DceLevel } from "./types";
import { intermediateExtraModules } from "./additional-modules";

export const intermediateLevel: DceLevel = {
  level: "B1_B2",
  name: "Intermediate",
  focus: "Social & Professional Fluency",
  cefrRange: "B1 → B2",
  badgeColor: "blue",
  modules: [
    {
      slug: "expressing-opinions",
      topic: "Expressing Opinions and Agreeing/Disagreeing",
      summary:
        "State opinions clearly, push back politely, interrupt without being rude, and engage in workplace and current-affairs discussions.",
      functionalLanguage: [
        "Stating opinions clearly (In my view…, As I see it…)",
        "Polite disagreement (I see your point, but…)",
        "Interrupting politely (Sorry to jump in, but…)",
      ],
      vocabularyThemes: [
        "Workplace scenarios",
        "Current events",
        "Hobbies and media",
      ],
      grammarInContext: [
        "Present Perfect vs Past Simple",
        "Comparative and Superlative",
        "Modals of deduction (must, might, can't)",
      ],
      reading: [
        {
          id: "int-opinion-read-01",
          title: "Should companies require return-to-office?",
          estReadMinutes: 3,
          text:
            "Three years after the pandemic shifted millions of workers home, the debate over return-to-office is far from settled. Supporters argue that face-to-face collaboration sparks creativity and helps junior staff learn faster. Critics counter that long commutes hurt focus and family life, and that productivity data has actually improved for remote teams. A 2025 survey by the British Chamber of Commerce found that 62% of employees would consider switching jobs if forced into the office five days a week, while 71% of managers still believed in-person work was 'essential' for culture. Hybrid arrangements appear to be the compromise most companies are settling on, but the rules vary widely.",
          questions: [
            {
              id: "q1",
              question: "What did 62% of employees in the survey say?",
              options: [
                "They prefer working alone",
                "They would consider quitting if forced back full-time",
                "They want a pay rise",
                "They believe in-office is essential",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "Which compromise is most companies adopting?",
              options: [
                "Fully remote",
                "Five days in office",
                "Hybrid arrangements",
                "Four-day weeks",
              ],
              answerIndex: 2,
            },
            {
              id: "q3",
              question:
                "According to the article, what is one argument for in-office work?",
              options: [
                "Lower commuting costs",
                "Better focus at home",
                "Junior staff learn faster",
                "Cheaper office rent",
              ],
              answerIndex: 2,
            },
            {
              id: "q4",
              question: "What does 'far from settled' mean here?",
              options: [
                "Already decided",
                "Not yet resolved",
                "Easy to fix",
                "Located far away",
              ],
              answerIndex: 1,
            },
          ],
        },
        {
          id: "int-opinion-read-02",
          title: "The Streaming Wars",
          estReadMinutes: 2,
          text:
            "The number of streaming services has tripled in the last five years. Each platform now produces its own original shows, hoping to attract subscribers and keep them for the long term. Critics say this has fragmented the audience and made monthly bills uncomfortably high. Some viewers have started rotating subscriptions, paying for only one service per month. Industry analysts believe consolidation is inevitable: smaller platforms will likely merge or shut down by 2027.",
          questions: [
            {
              id: "q1",
              question: "What strategy do some viewers now use?",
              options: [
                "Pirating shows",
                "Rotating subscriptions monthly",
                "Sharing accounts",
                "Watching only free content",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What do analysts predict for smaller platforms?",
              options: [
                "Sudden growth",
                "Government regulation",
                "Mergers or shutdowns",
                "Higher prices",
              ],
              answerIndex: 2,
            },
          ],
        },
      ],
      listening: [
        {
          id: "int-opinion-listen-01",
          title: "Office debate: open plan vs private desks",
          script:
            "John: Honestly, I think open-plan offices are a productivity disaster. \nRia: I see your point, but they help teams collaborate, don't they? \nJohn: Maybe in theory. In practice, it's just constant noise. \nRia: Sorry to jump in -- what about hybrid setups, with quiet pods? \nJohn: That's a fair compromise. I might actually support that. \nRia: Great, let's bring it up in tomorrow's meeting.",
          speakers: ["John", "Ria"],
          durationSec: 35,
          questions: [
            {
              id: "q1",
              question: "What does John dislike about open offices?",
              options: ["The temperature", "The noise", "The chairs", "The lighting"],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "Which phrase does Ria use to interrupt politely?",
              options: [
                "Excuse me, I disagree",
                "Sorry to jump in",
                "Hold on a second",
                "Let me finish",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "What does 'I might actually support that' suggest?",
              options: [
                "John is fully convinced",
                "John is uncertain but leaning yes",
                "John is rejecting it",
                "John hasn't heard the idea",
              ],
              answerIndex: 1,
            },
          ],
        },
      ],
      vocabulary: [
        { id: "v1", prompt: "I'm ____ to disagree, but the data is unclear.", options: ["afraid", "scared", "angry", "happy"], answerIndex: 0 },
        { id: "v2", prompt: "Let me ____ in here for a moment.", options: ["jump", "drop", "look", "set"], answerIndex: 0 },
        { id: "v3", prompt: "From my ____ of view, remote work is more efficient.", options: ["place", "side", "point", "kind"], answerIndex: 2 },
        { id: "v4", prompt: "The argument is convincing, ____ I have one concern.", options: ["although", "because", "since", "unless"], answerIndex: 0 },
        { id: "v5", prompt: "They reached a ____ after a long discussion.", options: ["compromise", "complaint", "compliment", "comparison"], answerIndex: 0 },
        { id: "v6", prompt: "I ____ entirely with what she said.", options: ["agree", "argue", "argue with", "discuss"], answerIndex: 0 },
        { id: "v7", prompt: "Sales have ____ by 30% this quarter.", options: ["raised", "risen", "raise", "rises"], answerIndex: 1 },
        { id: "v8", prompt: "Could you ____ on that point a little?", options: ["clarify", "claim", "clear", "close"], answerIndex: 0 },
        { id: "v9", prompt: "I'm not ____ that's the best approach.", options: ["confident", "convinced", "confused", "concerned"], answerIndex: 1 },
        { id: "v10", prompt: "We need to look at this from a different ____.", options: ["angle", "corner", "edge", "side"], answerIndex: 0 },
      ],
      grammar: [
        { id: "g1", prompt: "She ____ in this company since 2019.", options: ["worked", "has worked", "works", "is working"], answerIndex: 1, targetStructure: "Present Perfect" },
        { id: "g2", prompt: "I ____ him at the conference last week.", options: ["have met", "meet", "met", "meeting"], answerIndex: 2, targetStructure: "Past Simple" },
        { id: "g3", prompt: "This proposal is ____ than the previous one.", options: ["good", "better", "best", "more good"], answerIndex: 1, targetStructure: "Comparative" },
        { id: "g4", prompt: "It's the ____ idea I've heard all day.", options: ["smart", "smarter", "smartest", "more smart"], answerIndex: 2, targetStructure: "Superlative" },
        { id: "g5", prompt: "He ____ be in a meeting; his door is closed.", options: ["must", "can't", "should", "would"], answerIndex: 0, targetStructure: "Modal of deduction (must)" },
        { id: "g6", prompt: "She ____ be the new CFO; she just left college.", options: ["must", "can't", "might", "should"], answerIndex: 1, targetStructure: "Modal of deduction (can't)" },
        { id: "g7", prompt: "I've ____ finished the report.", options: ["just", "yet", "since", "for"], answerIndex: 0, targetStructure: "Present Perfect adverb" },
        { id: "g8", prompt: "Have you spoken to her ____?", options: ["yet", "still", "already", "ever"], answerIndex: 0, targetStructure: "Present Perfect adverb" },
        { id: "g9", prompt: "Yesterday's meeting was much ____ than today's.", options: ["short", "shortest", "shorter", "more short"], answerIndex: 2, targetStructure: "Comparative" },
        { id: "g10", prompt: "They ____ have left already; the lights are off.", options: ["must", "can't", "may", "should"], answerIndex: 0, targetStructure: "Modal of deduction" },
      ],
      dialogue: [
        {
          id: "int-opinion-dlg-01",
          title: "Disagreeing in a stand-up",
          lines: [
            { speaker: "Lead", text: "We should launch the feature on Friday." },
            { speaker: "Engineer", text: "I see your point, but the QA isn't done yet." },
            { speaker: "Lead", text: "How long do you actually need?" },
            { speaker: "Engineer", text: "Three more days, ideally." },
            { speaker: "Lead", text: "Okay, let's compromise: launch Monday with a feature flag." },
            { speaker: "Engineer", text: "That works for me." },
          ],
          questions: [
            {
              id: "q1",
              question: "What is the compromise?",
              options: [
                "Cancel the launch",
                "Friday launch with QA debt",
                "Monday launch with a feature flag",
                "Skip QA",
              ],
              answerIndex: 2,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "int-opinion-rp-01",
          scenario:
            "You're in a team meeting. Your manager wants to cut the testing phase to ship faster. Push back politely with two reasons and propose a compromise.",
          goal: "Practice polite disagreement and proposing compromise in a workplace setting.",
          personaSlug: "manager",
          turns: 6,
          openingLine:
            "Team, to hit the deadline I think we should skip the full QA cycle this sprint. Thoughts?",
        },
      ],
    },
    {
      slug: "handling-problems-negotiations",
      topic: "Handling Problems and Negotiations",
      summary:
        "Explain issues clearly, propose solutions, and reach compromises in customer service, tech, and travel scenarios.",
      functionalLanguage: [
        "Explaining an issue calmly",
        "Proposing solutions and trade-offs",
        "Making compromises and confirming agreement",
      ],
      vocabularyThemes: [
        "Customer service",
        "Tech troubleshooting",
        "Travel emergencies",
      ],
      grammarInContext: [
        "First and Second Conditionals",
        "Passive voice",
        "Reported Speech",
      ],
      reading: [
        {
          id: "int-problem-read-01",
          title: "When the laptop won't boot",
          estReadMinutes: 3,
          text:
            "When a corporate laptop refuses to start, IT support follows a predictable diagnostic ladder. First they check that the power adapter is charging — a faulty cable accounts for almost a quarter of all reported boot failures. If power is fine, they look for a black or blue screen, which usually points to a hardware issue, and a frozen logo, which is more often a corrupted system update. If the laptop still doesn't respond after a forced reset, the drive may be removed and connected to a healthy machine to recover the user's files before any reinstall. Most cases are resolved within 24 hours, although hardware replacements can take up to a week.",
          questions: [
            {
              id: "q1",
              question: "What causes about 25% of reported boot failures?",
              options: [
                "Faulty motherboards",
                "Faulty cables",
                "Software updates",
                "Drained batteries",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What does a frozen logo usually indicate?",
              options: [
                "Hardware failure",
                "Power issue",
                "Corrupted system update",
                "Dead battery",
              ],
              answerIndex: 2,
            },
            {
              id: "q3",
              question: "How long can hardware replacements take?",
              options: ["A few hours", "24 hours", "Up to a week", "A month"],
              answerIndex: 2,
            },
          ],
        },
      ],
      listening: [
        {
          id: "int-problem-listen-01",
          title: "Refund call",
          script:
            "John: Hi Priya, I returned a jacket two weeks ago and the refund hasn't been processed. \nPriya: I'm sorry to hear that. Could I have your order number? \nJohn: Sure, it's NX-48217. \nPriya: Thanks. I can see the return was received but it's been stuck in our system. I'll escalate it now and you should see the refund within 48 hours. \nJohn: Thank you. Could I get a confirmation email as well? \nPriya: Absolutely, I'll send it before we hang up.",
          speakers: ["John", "Priya"],
          durationSec: 40,
          questions: [
            {
              id: "q1",
              question: "Why is John phoning?",
              options: [
                "To order a jacket",
                "To complain about delivery",
                "Refund hasn't been processed",
                "To change an address",
              ],
              answerIndex: 2,
            },
            {
              id: "q2",
              question: "What does Priya promise to send?",
              options: ["A coupon", "A confirmation email", "A new jacket", "A survey"],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "How long until the refund appears?",
              options: ["24 hours", "48 hours", "One week", "Same day"],
              answerIndex: 1,
            },
          ],
        },
      ],
      vocabulary: [
        { id: "v1", prompt: "I'd like to ____ a complaint about my order.", options: ["file", "make", "do", "set"], answerIndex: 0 },
        { id: "v2", prompt: "Can you ____ the issue to your manager?", options: ["escalate", "elevate", "evaluate", "evade"], answerIndex: 0 },
        { id: "v3", prompt: "We're sorry for the ____.", options: ["inconvenience", "convenience", "incompetence", "indecision"], answerIndex: 0 },
        { id: "v4", prompt: "The flight has been ____ until tomorrow.", options: ["delayed", "denied", "discarded", "demanded"], answerIndex: 0 },
        { id: "v5", prompt: "I'll ____ a refund within three working days.", options: ["process", "produce", "promote", "promise"], answerIndex: 0 },
        { id: "v6", prompt: "Could you ____ the order number, please?", options: ["confirm", "conform", "consult", "consume"], answerIndex: 0 },
        { id: "v7", prompt: "Let me put you on a brief ____.", options: ["hold", "wait", "stop", "rest"], answerIndex: 0 },
        { id: "v8", prompt: "We can offer a ____ as a gesture of goodwill.", options: ["discount", "denial", "deposit", "demand"], answerIndex: 0 },
        { id: "v9", prompt: "The Wi-Fi keeps ____ out.", options: ["dropping", "falling", "running", "going"], answerIndex: 0 },
        { id: "v10", prompt: "Have you tried turning it off and ____ on again?", options: ["over", "back", "in", "down"], answerIndex: 1 },
      ],
      grammar: [
        { id: "g1", prompt: "If you reset the router, it ____ work again.", options: ["would", "will", "would have", "is"], answerIndex: 1, targetStructure: "First Conditional" },
        { id: "g2", prompt: "If I ____ you, I'd ask for a refund.", options: ["am", "was", "were", "be"], answerIndex: 2, targetStructure: "Second Conditional" },
        { id: "g3", prompt: "Your bag ____ delivered tomorrow.", options: ["will", "will be", "is being", "be"], answerIndex: 1, targetStructure: "Passive future" },
        { id: "g4", prompt: "She said she ____ call back later.", options: ["will", "would", "is going to", "may"], answerIndex: 1, targetStructure: "Reported Speech" },
        { id: "g5", prompt: "He told me the meeting ____ been cancelled.", options: ["had", "has", "was", "is"], answerIndex: 0, targetStructure: "Reported Speech" },
        { id: "g6", prompt: "If we ____ the flight, we wouldn't be late.", options: ["catch", "had caught", "caught", "have caught"], answerIndex: 1, targetStructure: "Third Conditional" },
        { id: "g7", prompt: "The data ____ checked twice before release.", options: ["is", "was", "are being", "have been"], answerIndex: 0, targetStructure: "Passive present" },
        { id: "g8", prompt: "She asked me ____ I had the receipt.", options: ["that", "if", "what", "did"], answerIndex: 1, targetStructure: "Reported Speech (yes/no)" },
        { id: "g9", prompt: "If the device ____ overheating, please contact us.", options: ["keep", "keeps", "kept", "is keeping"], answerIndex: 1, targetStructure: "First Conditional" },
        { id: "g10", prompt: "The room ____ cleaned every morning.", options: ["is", "are", "be", "has"], answerIndex: 0, targetStructure: "Passive present" },
      ],
      dialogue: [
        {
          id: "int-problem-dlg-01",
          title: "Hotel mix-up",
          lines: [
            { speaker: "Guest", text: "Excuse me, I think there's been a mix-up with my room." },
            { speaker: "Reception", text: "I'm sorry to hear that. What seems to be the issue?" },
            { speaker: "Guest", text: "I booked a non-smoking room but this one smells of smoke." },
            { speaker: "Reception", text: "My apologies. Let me move you to another room straight away." },
            { speaker: "Guest", text: "That'd be great. Could you also waive tonight's room service?" },
            { speaker: "Reception", text: "Of course. Consider it done." },
          ],
          questions: [
            {
              id: "q1",
              question: "What compromise does the guest negotiate?",
              options: [
                "A free upgrade",
                "Free breakfast",
                "Waived room service charge",
                "Late checkout",
              ],
              answerIndex: 2,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "int-problem-rp-01",
          scenario:
            "Your laptop has been crashing for two days. Call IT support, explain the symptoms, and negotiate a temporary replacement so you can keep working.",
          goal: "Explain a tech issue clearly and negotiate a workable temporary solution.",
          personaSlug: "support-agent",
          turns: 6,
          openingLine:
            "Hello, this is IT support. Could you walk me through what's happening with the device?",
        },
      ],
    },
    ...intermediateExtraModules,
  ],
};
