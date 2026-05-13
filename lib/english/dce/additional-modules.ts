import type { DceModule } from "./types";

export const foundationExtraModules: DceModule[] = [
  {
    slug: "shopping-and-prices",
    topic: "Shopping and Prices",
    summary: "Ask for prices, choose sizes, compare simple items, and pay politely in shops.",
    functionalLanguage: ["Asking prices", "Choosing size and color", "Paying politely"],
    vocabularyThemes: ["Clothes", "Colors", "Money"],
    grammarInContext: ["How much", "This/that/these/those", "Can for requests"],
    reading: [
      {
        id: "fnd-shop-read-01",
        title: "A New Shirt",
        estReadMinutes: 2,
        text:
          "Nina is at a small clothes shop. She wants a blue shirt for work. The small size is too tight, so she tries a medium. The medium shirt fits well. It costs fifteen dollars. Nina pays by card and puts the shirt in her bag.",
        questions: [
          { id: "q1", question: "What does Nina want to buy?", options: ["A blue shirt", "A red dress", "Black shoes", "A green bag"], answerIndex: 0, rationale: "The passage says Nina wants a blue shirt." },
          { id: "q2", question: "Why does Nina try a medium shirt?", options: ["The small size is too tight", "The color is wrong", "It is cheaper", "She wants two shirts"], answerIndex: 0, rationale: "The small size is too tight." },
          { id: "q3", question: "How much does the shirt cost?", options: ["Five dollars", "Ten dollars", "Fifteen dollars", "Fifty dollars"], answerIndex: 2, rationale: "The shirt costs fifteen dollars." },
          { id: "q4", question: "How does Nina pay?", options: ["By card", "With cash", "By phone", "With a coupon"], answerIndex: 0, rationale: "Nina pays by card." },
          { id: "q5", question: "Where does Nina put the shirt?", options: ["In her bag", "On the table", "Behind the counter", "In a box"], answerIndex: 0, rationale: "She puts the shirt in her bag." },
        ],
      },
    ],
    listening: [
      {
        id: "fnd-shop-listen-01",
        title: "At the Market",
        level: "A1",
        section: "Shopping and Prices",
        script:
          "John: Good afternoon. How much are these apples?\nMaya: They are three dollars a kilo.\nJohn: Can I have one kilo, please?\nMaya: Of course. Do you need a bag?\nJohn: Yes, please. How much is the water?\nMaya: It is one dollar.\nJohn: Great. I will take the apples and the water.",
        speakers: ["John", "Maya"],
        durationSec: 35,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "What fruit does John buy?", options: ["Apples", "Bananas", "Oranges", "Mangos"], answerIndex: 0, rationale: "John asks for one kilo of apples." },
          { id: "q2", question: "How much are the apples?", options: ["One dollar a kilo", "Two dollars a kilo", "Three dollars a kilo", "Four dollars a kilo"], answerIndex: 2, rationale: "Maya says they are three dollars a kilo." },
          { id: "q3", question: "Does John need a bag?", options: ["Yes", "No", "Only for water", "He does not say"], answerIndex: 0, rationale: "John says, 'Yes, please.'" },
          { id: "q4", question: "How much is the water?", options: ["One dollar", "Two dollars", "Three dollars", "Five dollars"], answerIndex: 0, rationale: "Maya says the water is one dollar." },
          { id: "q5", question: "What does John take?", options: ["Apples and water", "Coffee and cake", "Rice and tea", "A shirt and shoes"], answerIndex: 0, rationale: "John says he will take the apples and the water." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "How ____ is this bag?", options: ["much", "many", "old", "long"], answerIndex: 0, rationale: "Use 'how much' to ask about price." },
      { id: "v2", prompt: "I need a ____ size, please.", options: ["medium", "money", "market", "minute"], answerIndex: 0, rationale: "Medium is a clothing size." },
      { id: "v3", prompt: "Can I pay by ____?", options: ["card", "chair", "color", "clock"], answerIndex: 0, rationale: "Pay by card is a common shop phrase." },
      { id: "v4", prompt: "These shoes are too ____.", options: ["small", "apple", "open", "early"], answerIndex: 0, rationale: "Small describes size." },
      { id: "v5", prompt: "I will ____ this one.", options: ["take", "talk", "teach", "turn"], answerIndex: 0, rationale: "'Take this one' means choose or buy it." },
    ],
    grammar: [
      { id: "g1", prompt: "____ much is the jacket?", options: ["How", "What", "Where", "Who"], answerIndex: 0, rationale: "Use 'How much' for prices.", targetStructure: "How much" },
      { id: "g2", prompt: "____ apples are fresh.", options: ["These", "This", "That", "A"], answerIndex: 0, rationale: "Use 'these' for plural things near you.", targetStructure: "This/these" },
      { id: "g3", prompt: "Can I ____ this dress?", options: ["try on", "try at", "try in", "try to"], answerIndex: 0, rationale: "'Try on' is used for clothes.", targetStructure: "Phrasal verb" },
      { id: "g4", prompt: "That shirt ____ expensive.", options: ["is", "are", "am", "be"], answerIndex: 0, rationale: "Use 'is' with singular 'shirt'.", targetStructure: "Verb to be" },
      { id: "g5", prompt: "I ____ like the red one.", options: ["would", "am", "has", "does"], answerIndex: 0, rationale: "'I would like' is polite.", targetStructure: "Would like" },
    ],
    dialogue: [
      {
        id: "fnd-shop-dlg-01",
        title: "Choosing a jacket",
        lines: [
          { speaker: "John", text: "Excuse me, do you have this jacket in black?" },
          { speaker: "Clerk", text: "Yes, we do. What size do you need?" },
          { speaker: "John", text: "Medium, please." },
          { speaker: "Clerk", text: "Here you are. You can try it on over there." },
          { speaker: "John", text: "Thank you. How much is it?" },
          { speaker: "Clerk", text: "It is thirty dollars." },
        ],
        questions: [
          { id: "q1", question: "What color does John ask for?", options: ["Black", "Blue", "Red", "White"], answerIndex: 0, rationale: "John asks for the jacket in black." },
          { id: "q2", question: "What size does John need?", options: ["Small", "Medium", "Large", "Extra large"], answerIndex: 1, rationale: "John says medium." },
          { id: "q3", question: "What can John do over there?", options: ["Try it on", "Pay by phone", "Meet a friend", "Drink coffee"], answerIndex: 0, rationale: "The clerk says John can try it on." },
          { id: "q4", question: "How much is the jacket?", options: ["Thirteen dollars", "Thirty dollars", "Forty dollars", "Fifty dollars"], answerIndex: 1, rationale: "The clerk says it is thirty dollars." },
          { id: "q5", question: "Who helps John?", options: ["A clerk", "A teacher", "A doctor", "A driver"], answerIndex: 0, rationale: "The other speaker is the shop clerk." },
        ],
      },
    ],
    roleplay: [
      {
        id: "fnd-shop-rp-01",
        scenario: "You are buying a T-shirt. Ask for the price, size, and color, then pay politely.",
        goal: "Practice simple shopping questions and polite requests.",
        personaSlug: "barista",
        turns: 5,
        openingLine: "Hello. Can I help you find something today?",
      },
    ],
  },
  {
    slug: "family-and-hobbies",
    topic: "Family and Hobbies",
    summary: "Talk about family members, free time, likes, and simple weekend plans.",
    functionalLanguage: ["Talking about family", "Saying likes and dislikes", "Making simple plans"],
    vocabularyThemes: ["Family", "Hobbies", "Weekend activities"],
    grammarInContext: ["Have/has", "Like + noun/verb-ing", "Present simple"],
    reading: [
      {
        id: "fnd-family-read-01",
        title: "Riko's Weekend",
        estReadMinutes: 2,
        text:
          "Riko lives with his parents and his younger sister. On Saturday morning, he plays football with his friends. His sister likes drawing at home. In the afternoon, the family visits their grandmother. They eat dinner together and talk about school.",
        questions: [
          { id: "q1", question: "Who does Riko live with?", options: ["His parents and sister", "His uncle", "His classmates", "His coach"], answerIndex: 0, rationale: "The passage says he lives with his parents and younger sister." },
          { id: "q2", question: "What does Riko do on Saturday morning?", options: ["Plays football", "Draws pictures", "Works in a shop", "Cooks dinner"], answerIndex: 0, rationale: "He plays football with his friends." },
          { id: "q3", question: "What does his sister like?", options: ["Drawing", "Swimming", "Shopping", "Running"], answerIndex: 0, rationale: "His sister likes drawing at home." },
          { id: "q4", question: "Who does the family visit?", options: ["Their grandmother", "Their teacher", "Their neighbor", "Their doctor"], answerIndex: 0, rationale: "They visit their grandmother." },
          { id: "q5", question: "What do they talk about at dinner?", options: ["School", "Money", "Travel", "Weather"], answerIndex: 0, rationale: "They talk about school." },
        ],
      },
    ],
    listening: [
      {
        id: "fnd-family-listen-01",
        title: "Weekend Hobbies",
        level: "A1",
        section: "Family and Hobbies",
        script:
          "John: Hi Sara. What do you do on Sundays?\nSara: I visit my parents in the morning.\nJohn: That sounds nice. Do you have brothers or sisters?\nSara: Yes, I have one brother. He likes tennis.\nJohn: Do you like tennis too?\nSara: No, I like cooking and music.",
        speakers: ["John", "Sara"],
        durationSec: 32,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "When does Sara visit her parents?", options: ["On Sundays", "On Mondays", "On Fridays", "Every night"], answerIndex: 0, rationale: "Sara says she visits her parents on Sundays." },
          { id: "q2", question: "How many brothers does Sara have?", options: ["One", "Two", "Three", "None"], answerIndex: 0, rationale: "Sara says she has one brother." },
          { id: "q3", question: "What sport does Sara's brother like?", options: ["Tennis", "Football", "Basketball", "Swimming"], answerIndex: 0, rationale: "Her brother likes tennis." },
          { id: "q4", question: "Does Sara like tennis?", options: ["No", "Yes", "Only on Sunday", "She does not say"], answerIndex: 0, rationale: "Sara says no." },
          { id: "q5", question: "What does Sara like?", options: ["Cooking and music", "Tennis and running", "Shopping and travel", "Reading and dance"], answerIndex: 0, rationale: "Sara says she likes cooking and music." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "My mother's mother is my ____.", options: ["grandmother", "sister", "aunt", "cousin"], answerIndex: 0, rationale: "Grandmother means your parent's mother." },
      { id: "v2", prompt: "I ____ football on Saturday.", options: ["play", "make", "do", "have"], answerIndex: 0, rationale: "Use play with football." },
      { id: "v3", prompt: "She likes ____ music.", options: ["listening to", "listen", "listens", "listened"], answerIndex: 0, rationale: "Use like + verb-ing phrase." },
      { id: "v4", prompt: "My sister is ____ years old.", options: ["ten", "time", "tall", "team"], answerIndex: 0, rationale: "Use a number for age." },
      { id: "v5", prompt: "We eat dinner ____.", options: ["together", "father", "early", "small"], answerIndex: 0, rationale: "Together means with other people." },
    ],
    grammar: [
      { id: "g1", prompt: "He ____ one sister.", options: ["has", "have", "is", "are"], answerIndex: 0, rationale: "Use has with he/she/it.", targetStructure: "Have/has" },
      { id: "g2", prompt: "They ____ in Jakarta.", options: ["live", "lives", "living", "lived"], answerIndex: 0, rationale: "Use base verb with they.", targetStructure: "Present simple" },
      { id: "g3", prompt: "She likes ____.", options: ["cooking", "cook", "cooks", "cooked"], answerIndex: 0, rationale: "Use verb-ing after likes for activities.", targetStructure: "Like + gerund" },
      { id: "g4", prompt: "Do you ____ any cousins?", options: ["have", "has", "having", "had"], answerIndex: 0, rationale: "Use have after do.", targetStructure: "Present simple question" },
      { id: "g5", prompt: "My parents ____ very kind.", options: ["are", "is", "am", "be"], answerIndex: 0, rationale: "Use are with plural subject parents.", targetStructure: "Verb to be" },
    ],
    dialogue: [
      {
        id: "fnd-family-dlg-01",
        title: "Talking after class",
        lines: [
          { speaker: "John", text: "Do you have a big family?" },
          { speaker: "Ana", text: "No, I have one sister and one brother." },
          { speaker: "John", text: "What do you do together?" },
          { speaker: "Ana", text: "We watch movies on Friday." },
          { speaker: "John", text: "That sounds fun." },
          { speaker: "Ana", text: "Yes, it is our favorite night." },
        ],
        questions: [
          { id: "q1", question: "Does Ana have a big family?", options: ["No", "Yes", "She does not say", "Only on Friday"], answerIndex: 0, rationale: "Ana says no." },
          { id: "q2", question: "How many sisters does Ana have?", options: ["One", "Two", "Three", "None"], answerIndex: 0, rationale: "Ana says she has one sister." },
          { id: "q3", question: "What do they watch?", options: ["Movies", "Sports", "News", "Lessons"], answerIndex: 0, rationale: "They watch movies." },
          { id: "q4", question: "When do they watch movies?", options: ["Friday", "Monday", "Saturday morning", "Sunday night"], answerIndex: 0, rationale: "Ana says on Friday." },
          { id: "q5", question: "How does John react?", options: ["He says it sounds fun", "He says it is boring", "He asks for food", "He leaves"], answerIndex: 0, rationale: "John says, 'That sounds fun.'" },
        ],
      },
    ],
    roleplay: [
      {
        id: "fnd-family-rp-01",
        scenario: "Tell a classmate about your family and ask about their hobbies.",
        goal: "Practice have/has and like + activity.",
        personaSlug: "tourist",
        turns: 5,
        openingLine: "Hi, do you have any brothers or sisters?",
      },
    ],
  },
  {
    slug: "time-and-schedules",
    topic: "Time and Schedules",
    summary: "Ask about time, arrange simple meetings, and describe daily schedules.",
    functionalLanguage: ["Asking the time", "Making appointments", "Talking about routines"],
    vocabularyThemes: ["Clock times", "Days", "Daily routine"],
    grammarInContext: ["At/on/in", "Present simple", "Question words"],
    reading: [
      {
        id: "fnd-time-read-01",
        title: "Lea's Study Day",
        estReadMinutes: 2,
        text:
          "Lea studies English every Tuesday and Thursday. Her class starts at seven thirty in the evening. She leaves home at seven because the school is near her house. After class, she reviews vocabulary for fifteen minutes. She goes to bed at ten.",
        questions: [
          { id: "q1", question: "Which days does Lea study English?", options: ["Tuesday and Thursday", "Monday and Friday", "Saturday and Sunday", "Every day"], answerIndex: 0, rationale: "She studies every Tuesday and Thursday." },
          { id: "q2", question: "What time does class start?", options: ["Seven thirty", "Seven", "Eight fifteen", "Ten"], answerIndex: 0, rationale: "The class starts at seven thirty." },
          { id: "q3", question: "Why does Lea leave at seven?", options: ["The school is near", "The bus is late", "She buys dinner", "She meets John"], answerIndex: 0, rationale: "The school is near her house." },
          { id: "q4", question: "What does Lea review after class?", options: ["Vocabulary", "Math", "Emails", "Music"], answerIndex: 0, rationale: "She reviews vocabulary." },
          { id: "q5", question: "What time does Lea go to bed?", options: ["Ten", "Nine", "Eight", "Eleven"], answerIndex: 0, rationale: "She goes to bed at ten." },
        ],
      },
    ],
    listening: [
      {
        id: "fnd-time-listen-01",
        title: "Meeting After Work",
        level: "A2",
        section: "Time and Schedules",
        script:
          "John: Hi Emma. Are you free after work today?\nEmma: Yes, I finish at five thirty.\nJohn: Great. Can we meet at six?\nEmma: Six is good. Where should we meet?\nJohn: Let's meet at the cafe near the station.\nEmma: Perfect. See you at six.",
        speakers: ["John", "Emma"],
        durationSec: 31,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "When does Emma finish work?", options: ["Five thirty", "Five", "Six", "Seven thirty"], answerIndex: 0, rationale: "Emma says she finishes at five thirty." },
          { id: "q2", question: "What time will they meet?", options: ["Six", "Five thirty", "Seven", "Eight"], answerIndex: 0, rationale: "They agree to meet at six." },
          { id: "q3", question: "Where will they meet?", options: ["At the cafe", "At the office", "At school", "At the bus stop"], answerIndex: 0, rationale: "John says the cafe near the station." },
          { id: "q4", question: "Is Emma free after work?", options: ["Yes", "No", "Only tomorrow", "She does not say"], answerIndex: 0, rationale: "Emma says yes." },
          { id: "q5", question: "What is near the cafe?", options: ["The station", "The bank", "The hospital", "The park"], answerIndex: 0, rationale: "John says the cafe near the station." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "Class starts ____ seven.", options: ["at", "on", "in", "to"], answerIndex: 0, rationale: "Use at with clock time." },
      { id: "v2", prompt: "I am free ____ Friday.", options: ["on", "at", "in", "by"], answerIndex: 0, rationale: "Use on with days." },
      { id: "v3", prompt: "Let's ____ at six.", options: ["meet", "make", "move", "miss"], answerIndex: 0, rationale: "Meet means come together." },
      { id: "v4", prompt: "The lesson is ____ thirty minutes.", options: ["for", "at", "on", "by"], answerIndex: 0, rationale: "Use for with duration." },
      { id: "v5", prompt: "I finish work in the ____.", options: ["evening", "clock", "minute", "day"], answerIndex: 0, rationale: "Evening is a part of the day." },
    ],
    grammar: [
      { id: "g1", prompt: "What time ____ you start work?", options: ["do", "does", "are", "is"], answerIndex: 0, rationale: "Use do with you in present simple questions.", targetStructure: "Present simple question" },
      { id: "g2", prompt: "She ____ home at seven.", options: ["leaves", "leave", "leaving", "left"], answerIndex: 0, rationale: "Use verb-s with she.", targetStructure: "Third person singular" },
      { id: "g3", prompt: "The meeting is ____ Monday.", options: ["on", "at", "in", "of"], answerIndex: 0, rationale: "Use on with days.", targetStructure: "Prepositions of time" },
      { id: "g4", prompt: "I wake up ____ the morning.", options: ["in", "on", "at", "to"], answerIndex: 0, rationale: "Use in the morning.", targetStructure: "Prepositions of time" },
      { id: "g5", prompt: "____ do you go to bed?", options: ["When", "Who", "Which", "Whose"], answerIndex: 0, rationale: "Use when to ask about time.", targetStructure: "Question words" },
    ],
    dialogue: [
      {
        id: "fnd-time-dlg-01",
        title: "Planning a study time",
        lines: [
          { speaker: "John", text: "When do you want to study?" },
          { speaker: "Mila", text: "Can we study on Wednesday?" },
          { speaker: "John", text: "Yes. What time is good for you?" },
          { speaker: "Mila", text: "Seven in the evening is good." },
          { speaker: "John", text: "Okay. Let's study for one hour." },
          { speaker: "Mila", text: "Great. See you then." },
        ],
        questions: [
          { id: "q1", question: "Which day does Mila choose?", options: ["Wednesday", "Monday", "Friday", "Sunday"], answerIndex: 0, rationale: "Mila asks to study on Wednesday." },
          { id: "q2", question: "What time is good for Mila?", options: ["Seven in the evening", "Seven in the morning", "Six", "Eight thirty"], answerIndex: 0, rationale: "Mila says seven in the evening is good." },
          { id: "q3", question: "How long will they study?", options: ["One hour", "Two hours", "Thirty minutes", "All day"], answerIndex: 0, rationale: "John says for one hour." },
          { id: "q4", question: "Who asks about the time?", options: ["John", "Mila", "A teacher", "A friend"], answerIndex: 0, rationale: "John asks what time is good." },
          { id: "q5", question: "What does Mila say at the end?", options: ["See you then", "I am late", "No thanks", "Good morning"], answerIndex: 0, rationale: "Mila says, 'See you then.'" },
        ],
      },
    ],
    roleplay: [
      {
        id: "fnd-time-rp-01",
        scenario: "Arrange a study meeting with John. Choose a day, time, and place.",
        goal: "Practice time questions and simple scheduling.",
        personaSlug: "manager",
        turns: 5,
        openingLine: "When are you free to study English this week?",
      },
    ],
  },
];

export const intermediateExtraModules: DceModule[] = [
  {
    slug: "workplace-updates",
    topic: "Workplace Updates and Status Reports",
    summary: "Give concise project updates, explain blockers, and ask for support in meetings.",
    functionalLanguage: ["Giving status updates", "Explaining blockers", "Asking for support"],
    vocabularyThemes: ["Projects", "Deadlines", "Team communication"],
    grammarInContext: ["Present perfect", "Future arrangements", "Because/so/although"],
    reading: [
      {
        id: "int-update-read-01",
        title: "A Sprint Update",
        estReadMinutes: 3,
        text:
          "Maya's team is building a new booking page. They have finished the design and most of the front-end work, but the payment test is still blocked because the test account has not been approved. Maya writes a short update for the team chat: the page is on schedule if approval arrives by Wednesday. If approval is delayed, they will move the release to next week.",
        questions: [
          { id: "q1", question: "What is Maya's team building?", options: ["A booking page", "A sales report", "A mobile game", "A help center"], answerIndex: 0, rationale: "The passage says the team is building a booking page." },
          { id: "q2", question: "What have they finished?", options: ["The design and most front-end work", "All payment testing", "The release notes only", "Customer interviews"], answerIndex: 0, rationale: "They have finished the design and most front-end work." },
          { id: "q3", question: "What is blocked?", options: ["The payment test", "The design", "The team chat", "The booking title"], answerIndex: 0, rationale: "The payment test is blocked." },
          { id: "q4", question: "When does approval need to arrive to stay on schedule?", options: ["By Wednesday", "By Friday", "By Monday", "By next month"], answerIndex: 0, rationale: "The page is on schedule if approval arrives by Wednesday." },
          { id: "q5", question: "What will happen if approval is delayed?", options: ["The release moves to next week", "The project is canceled", "The design restarts", "The team hires more people"], answerIndex: 0, rationale: "They will move the release to next week." },
        ],
      },
    ],
    listening: [
      {
        id: "int-update-listen-01",
        title: "Daily Stand-up",
        section: "Workplace Updates and Status Reports",
        script:
          "John: Morning, Priya. What's the status of the dashboard?\nPriya: The charts are done, but the export button still needs testing.\nJohn: Is anything blocking you?\nPriya: Not exactly. I just need QA time this afternoon.\nJohn: Okay, I can ask Daniel to review it after lunch.\nPriya: Perfect. Then we should be ready for tomorrow's demo.",
        speakers: ["John", "Priya"],
        durationSec: 40,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "What is done?", options: ["The charts", "The export testing", "The demo script", "The login page"], answerIndex: 0, rationale: "Priya says the charts are done." },
          { id: "q2", question: "What still needs testing?", options: ["The export button", "The charts", "The menu", "The email"], answerIndex: 0, rationale: "The export button still needs testing." },
          { id: "q3", question: "What does Priya need?", options: ["QA time", "A new laptop", "A client call", "A budget update"], answerIndex: 0, rationale: "She needs QA time this afternoon." },
          { id: "q4", question: "Who can review after lunch?", options: ["Daniel", "Priya", "Maya", "Sara"], answerIndex: 0, rationale: "John says he can ask Daniel." },
          { id: "q5", question: "When is the demo?", options: ["Tomorrow", "Today", "Next week", "After lunch"], answerIndex: 0, rationale: "Priya says tomorrow's demo." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "The task is ____ because we need approval.", options: ["blocked", "bright", "borrowed", "basic"], answerIndex: 0, rationale: "Blocked means unable to continue." },
      { id: "v2", prompt: "Can you give me a quick ____?", options: ["update", "upgrade", "upload", "upset"], answerIndex: 0, rationale: "A project update explains current status." },
      { id: "v3", prompt: "The release is still on ____.", options: ["schedule", "screen", "support", "system"], answerIndex: 0, rationale: "On schedule means not late." },
      { id: "v4", prompt: "We need to ____ the button before launch.", options: ["test", "taste", "text", "turn"], answerIndex: 0, rationale: "You test a feature before launch." },
      { id: "v5", prompt: "Please review it after ____.", options: ["lunch", "launch", "line", "level"], answerIndex: 0, rationale: "After lunch is a time phrase." },
    ],
    grammar: [
      { id: "g1", prompt: "We ____ finished the design.", options: ["have", "has", "are", "were"], answerIndex: 0, rationale: "Use have with we in present perfect.", targetStructure: "Present perfect" },
      { id: "g2", prompt: "The test is blocked ____ the account is not approved.", options: ["because", "although", "but", "unless"], answerIndex: 0, rationale: "Because introduces the reason.", targetStructure: "Reason clauses" },
      { id: "g3", prompt: "If approval arrives today, we ____ launch tomorrow.", options: ["can", "could have", "had", "were"], answerIndex: 0, rationale: "Can expresses possibility.", targetStructure: "First conditional" },
      { id: "g4", prompt: "I ____ meeting QA at two.", options: ["am", "is", "be", "have"], answerIndex: 0, rationale: "Use present continuous for arranged plans.", targetStructure: "Future arrangement" },
      { id: "g5", prompt: "The charts are done, ____ the export needs testing.", options: ["but", "because", "so", "if"], answerIndex: 0, rationale: "But contrasts two ideas.", targetStructure: "Linking words" },
    ],
    dialogue: [
      {
        id: "int-update-dlg-01",
        title: "Asking for help",
        lines: [
          { speaker: "John", text: "You look busy. What's the blocker?" },
          { speaker: "Nadia", text: "The data import works locally, but it fails in staging." },
          { speaker: "John", text: "Have you checked the environment variables?" },
          { speaker: "Nadia", text: "Yes, and they match. I think it may be a permission issue." },
          { speaker: "John", text: "Let's ask DevOps for access logs." },
          { speaker: "Nadia", text: "Good idea. That should narrow it down." },
        ],
        questions: [
          { id: "q1", question: "Where does the import fail?", options: ["In staging", "Locally", "In production", "In email"], answerIndex: 0, rationale: "Nadia says it fails in staging." },
          { id: "q2", question: "What has Nadia checked?", options: ["Environment variables", "The office map", "The invoice", "The lunch menu"], answerIndex: 0, rationale: "She has checked the environment variables." },
          { id: "q3", question: "What issue does Nadia suspect?", options: ["A permission issue", "A design issue", "A translation issue", "A pricing issue"], answerIndex: 0, rationale: "She thinks it may be a permission issue." },
          { id: "q4", question: "Who will they ask?", options: ["DevOps", "Sales", "HR", "A customer"], answerIndex: 0, rationale: "John suggests asking DevOps." },
          { id: "q5", question: "What will access logs help do?", options: ["Narrow it down", "Cancel the task", "Change the design", "Book a room"], answerIndex: 0, rationale: "Nadia says that should narrow it down." },
        ],
      },
    ],
    roleplay: [
      { id: "int-update-rp-01", scenario: "Give John a project update with one completed item, one blocker, and one next step.", goal: "Practice concise status reporting.", personaSlug: "manager", turns: 6, openingLine: "Can you give me a quick update before the meeting?" },
    ],
  },
  {
    slug: "travel-services",
    topic: "Travel Services and Hotel Requests",
    summary: "Handle hotel, airport, and transport conversations with polite clarification.",
    functionalLanguage: ["Requesting service", "Clarifying details", "Solving travel problems"],
    vocabularyThemes: ["Hotels", "Airports", "Transport"],
    grammarInContext: ["Could/would", "Present perfect", "Indirect questions"],
    reading: [
      {
        id: "int-travel-read-01",
        title: "A Room Change Request",
        estReadMinutes: 3,
        text:
          "A guest emails the hotel because the room faces a busy street and the noise makes it hard to sleep. She asks whether a quieter room is available for the next two nights. The hotel replies that a courtyard room is available after midday, but there is a small price difference. The guest accepts and asks if her bags can be moved while she is at a conference.",
        questions: [
          { id: "q1", question: "Why does the guest email the hotel?", options: ["The room is noisy", "The room is too cold", "The key is broken", "The hotel is closed"], answerIndex: 0, rationale: "The room faces a busy street and is noisy." },
          { id: "q2", question: "What kind of room does she want?", options: ["A quieter room", "A larger room", "A cheaper room", "A smoking room"], answerIndex: 0, rationale: "She asks for a quieter room." },
          { id: "q3", question: "When is the courtyard room available?", options: ["After midday", "Before breakfast", "At midnight", "Next week"], answerIndex: 0, rationale: "The hotel says after midday." },
          { id: "q4", question: "What is different about the new room?", options: ["The price", "The city", "The guest name", "The checkout day"], answerIndex: 0, rationale: "There is a small price difference." },
          { id: "q5", question: "What does the guest ask about her bags?", options: ["If they can be moved", "If they can be sold", "If they are too heavy", "If they are missing"], answerIndex: 0, rationale: "She asks if her bags can be moved." },
        ],
      },
    ],
    listening: [
      {
        id: "int-travel-listen-01",
        title: "Changing a Hotel Room",
        section: "Travel Services and Hotel Requests",
        script:
          "John: Good evening. I checked in an hour ago, but my room is very noisy.\nElena: I'm sorry about that. Would you like me to check for another room?\nJohn: Yes, please. A quiet room would be great.\nElena: We have one on the fifth floor, away from the street.\nJohn: That sounds perfect. Is there any extra charge?\nElena: No, we can move you at no extra cost.",
        speakers: ["John", "Elena"],
        durationSec: 42,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "When did John check in?", options: ["An hour ago", "Yesterday", "This morning", "Last week"], answerIndex: 0, rationale: "John says he checked in an hour ago." },
          { id: "q2", question: "What is wrong with the room?", options: ["It is noisy", "It is dirty", "It is too small", "It has no bed"], answerIndex: 0, rationale: "John says the room is very noisy." },
          { id: "q3", question: "Where is the new room?", options: ["On the fifth floor", "On the first floor", "Near the street", "In another hotel"], answerIndex: 0, rationale: "Elena says it is on the fifth floor." },
          { id: "q4", question: "Is the new room near the street?", options: ["No", "Yes", "Only at night", "She does not say"], answerIndex: 0, rationale: "Elena says it is away from the street." },
          { id: "q5", question: "How much extra will John pay?", options: ["No extra cost", "Ten dollars", "Twenty dollars", "A small fee"], answerIndex: 0, rationale: "Elena says no extra cost." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "I would like to ____ rooms, please.", options: ["change", "charge", "choose", "check"], answerIndex: 0, rationale: "Change rooms means move to another room." },
      { id: "v2", prompt: "The street is very ____ at night.", options: ["noisy", "narrow", "native", "near"], answerIndex: 0, rationale: "Noisy means loud." },
      { id: "v3", prompt: "Is breakfast ____ in the price?", options: ["included", "improved", "invited", "inside"], answerIndex: 0, rationale: "Included means part of the price." },
      { id: "v4", prompt: "Could you move my ____?", options: ["bags", "bills", "buttons", "boards"], answerIndex: 0, rationale: "Bags are luggage." },
      { id: "v5", prompt: "I need a late ____.", options: ["checkout", "checkup", "checklist", "checkpoint"], answerIndex: 0, rationale: "Late checkout is a hotel phrase." },
    ],
    grammar: [
      { id: "g1", prompt: "Could you ____ for another room?", options: ["check", "checked", "checking", "checks"], answerIndex: 0, rationale: "Use base verb after could.", targetStructure: "Could requests" },
      { id: "g2", prompt: "I ____ just checked in.", options: ["have", "has", "am", "was"], answerIndex: 0, rationale: "Use have with I in present perfect.", targetStructure: "Present perfect" },
      { id: "g3", prompt: "Do you know ____ breakfast starts?", options: ["when", "what", "who", "whose"], answerIndex: 0, rationale: "When asks about time.", targetStructure: "Indirect questions" },
      { id: "g4", prompt: "Would it be possible ____ move rooms?", options: ["to", "for", "at", "by"], answerIndex: 0, rationale: "Use possible to + verb.", targetStructure: "Polite request" },
      { id: "g5", prompt: "The room is quieter ____ the last one.", options: ["than", "then", "that", "there"], answerIndex: 0, rationale: "Use than after comparatives.", targetStructure: "Comparative" },
    ],
    dialogue: [
      {
        id: "int-travel-dlg-01",
        title: "Airport shuttle question",
        lines: [
          { speaker: "John", text: "Could you tell me where the airport shuttle stops?" },
          { speaker: "Receptionist", text: "It stops outside door three every thirty minutes." },
          { speaker: "John", text: "Do I need to book a seat?" },
          { speaker: "Receptionist", text: "No, but please be there ten minutes early." },
          { speaker: "John", text: "Great. How long does it take to the airport?" },
          { speaker: "Receptionist", text: "Usually around twenty-five minutes." },
        ],
        questions: [
          { id: "q1", question: "Where does the shuttle stop?", options: ["Outside door three", "Inside the lobby", "At the train station", "Behind the hotel"], answerIndex: 0, rationale: "It stops outside door three." },
          { id: "q2", question: "How often does the shuttle stop there?", options: ["Every thirty minutes", "Every ten minutes", "Once a day", "Every hour"], answerIndex: 0, rationale: "The receptionist says every thirty minutes." },
          { id: "q3", question: "Does John need to book a seat?", options: ["No", "Yes", "Only online", "Only at night"], answerIndex: 0, rationale: "The receptionist says no." },
          { id: "q4", question: "How early should John arrive?", options: ["Ten minutes early", "One hour early", "Thirty minutes early", "Five minutes late"], answerIndex: 0, rationale: "He should be there ten minutes early." },
          { id: "q5", question: "How long is the trip?", options: ["Around twenty-five minutes", "Ten minutes", "One hour", "Two hours"], answerIndex: 0, rationale: "It usually takes around twenty-five minutes." },
        ],
      },
    ],
    roleplay: [
      { id: "int-travel-rp-01", scenario: "Ask hotel reception for a quieter room and confirm any extra charge.", goal: "Practice polite service requests.", personaSlug: "support-agent", turns: 6, openingLine: "Good evening. How can I help with your room?" },
    ],
  },
  {
    slug: "health-and-appointments",
    topic: "Health and Appointments",
    summary: "Describe simple symptoms, book appointments, and follow basic advice.",
    functionalLanguage: ["Describing symptoms", "Booking appointments", "Asking for advice"],
    vocabularyThemes: ["Health", "Appointments", "Advice"],
    grammarInContext: ["Should/shouldn't", "For/since", "Present perfect"],
    reading: [
      {
        id: "int-health-read-01",
        title: "Booking a Clinic Visit",
        estReadMinutes: 3,
        text:
          "Dina has had a sore throat for three days. She calls the clinic and asks for the earliest appointment. The receptionist offers 10:30 on Friday morning. Dina explains that she has a meeting at that time, so they agree on 2:15 in the afternoon. The receptionist reminds her to bring her ID card and arrive ten minutes early.",
        questions: [
          { id: "q1", question: "What symptom does Dina have?", options: ["A sore throat", "A broken arm", "A headache only", "A stomach problem"], answerIndex: 0, rationale: "Dina has had a sore throat." },
          { id: "q2", question: "How long has Dina had the symptom?", options: ["Three days", "One day", "Two weeks", "A month"], answerIndex: 0, rationale: "The passage says for three days." },
          { id: "q3", question: "Why can't Dina take 10:30?", options: ["She has a meeting", "She is traveling", "She is asleep", "The clinic is closed"], answerIndex: 0, rationale: "She has a meeting at that time." },
          { id: "q4", question: "What time do they agree on?", options: ["2:15 in the afternoon", "10:30 in the morning", "9:00 at night", "12:45"], answerIndex: 0, rationale: "They agree on 2:15 in the afternoon." },
          { id: "q5", question: "What should Dina bring?", options: ["Her ID card", "A laptop", "A textbook", "A ticket"], answerIndex: 0, rationale: "The receptionist reminds her to bring her ID card." },
        ],
      },
    ],
    listening: [
      {
        id: "int-health-listen-01",
        title: "Calling the Clinic",
        section: "Health and Appointments",
        script:
          "John: Good morning. I'd like to book an appointment, please.\nNurse: Of course. What seems to be the problem?\nJohn: I've had a cough since Monday, and I feel tired.\nNurse: We have an opening at three this afternoon.\nJohn: That works. Should I bring anything?\nNurse: Please bring your ID and a list of any medicine you take.",
        speakers: ["John", "Nurse"],
        durationSec: 43,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "Why does John call?", options: ["To book an appointment", "To cancel a flight", "To buy medicine", "To ask for directions"], answerIndex: 0, rationale: "John says he would like to book an appointment." },
          { id: "q2", question: "What symptom does John have?", options: ["A cough", "A broken leg", "A fever only", "A toothache"], answerIndex: 0, rationale: "John says he has had a cough." },
          { id: "q3", question: "Since when has John had the cough?", options: ["Since Monday", "Since Friday", "Since yesterday", "Since last month"], answerIndex: 0, rationale: "He says since Monday." },
          { id: "q4", question: "What time is the appointment?", options: ["Three this afternoon", "Ten this morning", "Six this evening", "Noon"], answerIndex: 0, rationale: "The nurse says three this afternoon." },
          { id: "q5", question: "What should John bring?", options: ["ID and medicine list", "A passport only", "Cash only", "A notebook"], answerIndex: 0, rationale: "The nurse asks him to bring ID and a medicine list." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "I have a sore ____.", options: ["throat", "ticket", "train", "table"], answerIndex: 0, rationale: "Sore throat is a health phrase." },
      { id: "v2", prompt: "I'd like to book an ____.", options: ["appointment", "apartment", "agreement", "arrival"], answerIndex: 0, rationale: "Book an appointment means arrange a visit." },
      { id: "v3", prompt: "You should drink plenty of ____.", options: ["water", "wallet", "window", "weather"], answerIndex: 0, rationale: "Water is common health advice." },
      { id: "v4", prompt: "I feel very ____ today.", options: ["tired", "tidy", "tiny", "tight"], answerIndex: 0, rationale: "Tired describes low energy." },
      { id: "v5", prompt: "Please bring your ____ card.", options: ["ID", "ice", "idea", "item"], answerIndex: 0, rationale: "Clinics often ask for an ID card." },
    ],
    grammar: [
      { id: "g1", prompt: "You ____ see a doctor.", options: ["should", "has", "are", "were"], answerIndex: 0, rationale: "Should gives advice.", targetStructure: "Should" },
      { id: "g2", prompt: "I have had a cough ____ Monday.", options: ["since", "for", "during", "while"], answerIndex: 0, rationale: "Use since with a starting point.", targetStructure: "Since" },
      { id: "g3", prompt: "She has felt tired ____ three days.", options: ["for", "since", "at", "on"], answerIndex: 0, rationale: "Use for with duration.", targetStructure: "For" },
      { id: "g4", prompt: "You shouldn't ____ heavy food.", options: ["eat", "eats", "eating", "ate"], answerIndex: 0, rationale: "Use base verb after shouldn't.", targetStructure: "Shouldn't" },
      { id: "g5", prompt: "Have you ____ any medicine today?", options: ["taken", "took", "take", "takes"], answerIndex: 0, rationale: "Use past participle after have.", targetStructure: "Present perfect" },
    ],
    dialogue: [
      {
        id: "int-health-dlg-01",
        title: "Asking for advice",
        lines: [
          { speaker: "John", text: "I've had a headache since yesterday." },
          { speaker: "Doctor", text: "Have you been sleeping well?" },
          { speaker: "John", text: "Not really. I've been working late." },
          { speaker: "Doctor", text: "You should rest tonight and drink more water." },
          { speaker: "John", text: "Should I take medicine?" },
          { speaker: "Doctor", text: "Only if the headache continues tomorrow." },
        ],
        questions: [
          { id: "q1", question: "What problem does John have?", options: ["A headache", "A cough", "A sore throat", "A bad tooth"], answerIndex: 0, rationale: "John says he has had a headache." },
          { id: "q2", question: "Since when has John had the problem?", options: ["Since yesterday", "Since Monday", "For a week", "For a month"], answerIndex: 0, rationale: "He says since yesterday." },
          { id: "q3", question: "Why has John not slept well?", options: ["He has been working late", "He has been traveling", "He lost his key", "He has a new pet"], answerIndex: 0, rationale: "John says he has been working late." },
          { id: "q4", question: "What advice does the doctor give first?", options: ["Rest and drink water", "Run outside", "Eat heavy food", "Work later"], answerIndex: 0, rationale: "The doctor says to rest and drink more water." },
          { id: "q5", question: "When should John take medicine?", options: ["If the headache continues tomorrow", "Right now always", "Before every meal", "Never"], answerIndex: 0, rationale: "The doctor says only if it continues tomorrow." },
        ],
      },
    ],
    roleplay: [
      { id: "int-health-rp-01", scenario: "Call a clinic, explain two symptoms, and book an appointment.", goal: "Practice health vocabulary and polite questions.", personaSlug: "support-agent", turns: 6, openingLine: "Good morning. City Clinic. How can I help?" },
    ],
  },
];

export const advancedExtraModules: DceModule[] = [
  {
    slug: "strategic-storytelling",
    topic: "Strategic Storytelling",
    summary: "Shape complex ideas into persuasive narratives for executive audiences.",
    functionalLanguage: ["Framing narratives", "Signposting evidence", "Handling objections"],
    vocabularyThemes: ["Strategy", "Persuasion", "Executive communication"],
    grammarInContext: ["Cleft sentences", "Nominalisation", "Concession clauses"],
    reading: [
      {
        id: "adv-story-read-01",
        title: "Turning Data into a Decision",
        estReadMinutes: 4,
        text:
          "A strong executive story rarely begins with every available data point. It begins with the decision the audience must make, then selects evidence that clarifies the trade-off. The best presenters do not hide uncertainty; they name it, bound it, and explain why the recommendation still holds. This structure allows leaders to disagree productively because the logic is visible rather than buried inside a dense appendix.",
        questions: [
          { id: "q1", question: "What should an executive story begin with?", options: ["The decision to make", "Every data point", "A joke", "A long appendix"], answerIndex: 0, rationale: "The passage says it begins with the decision the audience must make." },
          { id: "q2", question: "What kind of evidence should presenters select?", options: ["Evidence that clarifies the trade-off", "Only positive evidence", "Random evidence", "Old evidence"], answerIndex: 0, rationale: "Evidence should clarify the trade-off." },
          { id: "q3", question: "What should presenters do with uncertainty?", options: ["Name it and bound it", "Hide it", "Ignore it", "Blame the audience"], answerIndex: 0, rationale: "They name it, bound it, and explain why the recommendation holds." },
          { id: "q4", question: "Why can leaders disagree productively?", options: ["The logic is visible", "The appendix is longer", "The presenter avoids questions", "The decision is delayed"], answerIndex: 0, rationale: "Visible logic supports productive disagreement." },
          { id: "q5", question: "What does 'buried inside a dense appendix' suggest?", options: ["Hard to find", "Easy to read", "Already approved", "Highly emotional"], answerIndex: 0, rationale: "Buried suggests the logic is hidden or hard to find." },
        ],
      },
    ],
    listening: [
      {
        id: "adv-story-listen-01",
        title: "Framing a Recommendation",
        section: "Strategic Storytelling",
        script:
          "John: I don't want to lead with the spreadsheet. I want to lead with the choice.\nClara: So the opening is the trade-off between speed and margin?\nJohn: Exactly. Then the numbers explain why speed matters this quarter.\nClara: We should still acknowledge the margin risk.\nJohn: Absolutely. If we name it early, the recommendation feels more credible.\nClara: Good. That gives the board something clear to debate.",
        speakers: ["John", "Clara"],
        durationSec: 48,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "What does John not want to lead with?", options: ["The spreadsheet", "The customer quote", "The budget request", "The timeline"], answerIndex: 0, rationale: "John says he does not want to lead with the spreadsheet." },
          { id: "q2", question: "What is the opening trade-off?", options: ["Speed and margin", "Price and color", "Hiring and training", "Design and legal"], answerIndex: 0, rationale: "Clara names the trade-off between speed and margin." },
          { id: "q3", question: "Why do the numbers matter?", options: ["They explain why speed matters this quarter", "They prove margin is irrelevant", "They replace the recommendation", "They cancel the debate"], answerIndex: 0, rationale: "John says the numbers explain why speed matters this quarter." },
          { id: "q4", question: "What risk should they acknowledge?", options: ["Margin risk", "Weather risk", "Office risk", "Travel risk"], answerIndex: 0, rationale: "Clara says they should acknowledge margin risk." },
          { id: "q5", question: "What does naming the risk early do?", options: ["Makes the recommendation more credible", "Makes the board angry", "Hides the trade-off", "Ends the meeting"], answerIndex: 0, rationale: "John says it feels more credible." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "The recommendation must be ____ by evidence.", options: ["supported", "supposed", "suppressed", "surprised"], answerIndex: 0, rationale: "Supported by evidence means backed up." },
      { id: "v2", prompt: "Let's ____ the risk before they ask.", options: ["acknowledge", "avoid", "announce", "argue"], answerIndex: 0, rationale: "Acknowledge means openly recognize." },
      { id: "v3", prompt: "The board needs a clear ____.", options: ["trade-off", "take-off", "turn-off", "write-off"], answerIndex: 0, rationale: "Trade-off means a choice between competing priorities." },
      { id: "v4", prompt: "Her argument was highly ____.", options: ["credible", "credit", "creative only", "crowded"], answerIndex: 0, rationale: "Credible means believable." },
      { id: "v5", prompt: "We need to ____ the story around the decision.", options: ["frame", "freeze", "float", "fold"], answerIndex: 0, rationale: "Frame means shape how an idea is understood." },
    ],
    grammar: [
      { id: "g1", prompt: "It is the trade-off ____ matters most.", options: ["that", "what", "who", "where"], answerIndex: 0, rationale: "Use 'that' in this cleft structure.", targetStructure: "Cleft sentence" },
      { id: "g2", prompt: "____ the risk is real, the recommendation still holds.", options: ["Although", "Because", "Unless", "Since"], answerIndex: 0, rationale: "Although introduces concession.", targetStructure: "Concession clause" },
      { id: "g3", prompt: "The ____ of the data changed the discussion.", options: ["interpretation", "interpret", "interpreting", "interpreted"], answerIndex: 0, rationale: "Interpretation is the noun form.", targetStructure: "Nominalisation" },
      { id: "g4", prompt: "What we need ____ a sharper opening.", options: ["is", "are", "be", "were"], answerIndex: 0, rationale: "Use is after the cleft subject.", targetStructure: "Cleft sentence" },
      { id: "g5", prompt: "Having ____ the objections, she moved to the recommendation.", options: ["addressed", "address", "addresses", "addressing"], answerIndex: 0, rationale: "Use past participle after having.", targetStructure: "Participle clause" },
    ],
    dialogue: [
      {
        id: "adv-story-dlg-01",
        title: "Preparing the board narrative",
        lines: [
          { speaker: "John", text: "The board won't remember five charts. They'll remember one decision." },
          { speaker: "Clara", text: "Then we should make the decision explicit on slide one." },
          { speaker: "John", text: "Yes, and use the charts as proof, not decoration." },
          { speaker: "Clara", text: "What about the weak regional data?" },
          { speaker: "John", text: "We address it directly and explain why it doesn't change the conclusion." },
          { speaker: "Clara", text: "That makes the story much sturdier." },
        ],
        questions: [
          { id: "q1", question: "What does John think the board will remember?", options: ["One decision", "Five charts", "The slide color", "The meeting room"], answerIndex: 0, rationale: "John says they will remember one decision." },
          { id: "q2", question: "Where should the decision appear?", options: ["On slide one", "In the appendix", "After the Q&A", "In an email only"], answerIndex: 0, rationale: "Clara says slide one." },
          { id: "q3", question: "How should they use the charts?", options: ["As proof", "As decoration", "As a replacement for the decision", "As a distraction"], answerIndex: 0, rationale: "John says as proof, not decoration." },
          { id: "q4", question: "What data worries Clara?", options: ["Weak regional data", "Strong global data", "Old payroll data", "Customer photos"], answerIndex: 0, rationale: "Clara asks about weak regional data." },
          { id: "q5", question: "How will they handle weak data?", options: ["Address it directly", "Hide it", "Delete the slide", "Cancel the meeting"], answerIndex: 0, rationale: "John says they address it directly." },
        ],
      },
    ],
    roleplay: [
      { id: "adv-story-rp-01", scenario: "Frame a recommendation for a skeptical board using one decision, one trade-off, and one risk.", goal: "Practice strategic narrative structure.", personaSlug: "ceo", turns: 6, openingLine: "Give me the board-level version. What's the decision we need to make?" },
    ],
  },
  {
    slug: "crisis-communication",
    topic: "Crisis Communication",
    summary: "Communicate clearly during incidents, acknowledge uncertainty, and protect trust.",
    functionalLanguage: ["Acknowledging impact", "Communicating uncertainty", "Setting next updates"],
    vocabularyThemes: ["Incidents", "Trust", "Public statements"],
    grammarInContext: ["Passive voice", "Hedging", "Future perfect"],
    reading: [
      {
        id: "adv-crisis-read-01",
        title: "A Responsible Incident Update",
        estReadMinutes: 4,
        text:
          "During a service outage, vague reassurance can damage trust more than silence. A responsible update states what is known, what remains unknown, who is affected, and when the next update will arrive. It avoids speculation but does not hide behind legal language. Customers do not expect perfection; they expect evidence that the team understands the impact and is acting with urgency.",
        questions: [
          { id: "q1", question: "What can damage trust more than silence?", options: ["Vague reassurance", "Clear timing", "Specific facts", "A next update"], answerIndex: 0, rationale: "The passage says vague reassurance can damage trust." },
          { id: "q2", question: "What should a responsible update state?", options: ["Knowns, unknowns, affected users, and next update time", "Only positive news", "Legal language only", "A discount code"], answerIndex: 0, rationale: "The passage lists those four elements." },
          { id: "q3", question: "What should the update avoid?", options: ["Speculation", "Specific timing", "Customer impact", "Plain language"], answerIndex: 0, rationale: "It avoids speculation." },
          { id: "q4", question: "What do customers expect?", options: ["Urgent, informed action", "Perfection", "Silence", "Blame"], answerIndex: 0, rationale: "They expect evidence the team understands impact and acts urgently." },
          { id: "q5", question: "What does 'hide behind legal language' mean?", options: ["Use wording to avoid responsibility", "Explain clearly", "Translate the update", "Send it to lawyers only"], answerIndex: 0, rationale: "It suggests using legal wording to avoid clear responsibility." },
        ],
      },
    ],
    listening: [
      {
        id: "adv-crisis-listen-01",
        title: "Drafting an Outage Message",
        section: "Crisis Communication",
        script:
          "John: The first draft sounds too reassuring. We don't actually know the root cause yet.\nMira: Agreed. We can say checkout is unavailable for some users, and investigation is ongoing.\nJohn: Good. Add the next update time as well.\nMira: Every thirty minutes until resolution?\nJohn: Yes. Also mention that no payment data appears to be affected.\nMira: I'll phrase that carefully: based on current evidence, payment data is not affected.",
        speakers: ["John", "Mira"],
        durationSec: 53,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "What is wrong with the first draft?", options: ["It sounds too reassuring", "It is too short", "It blames users", "It has no title"], answerIndex: 0, rationale: "John says it sounds too reassuring." },
          { id: "q2", question: "What do they not know yet?", options: ["The root cause", "The product name", "The customer count exactly", "The next update time"], answerIndex: 0, rationale: "John says they do not know the root cause yet." },
          { id: "q3", question: "What is unavailable for some users?", options: ["Checkout", "Login", "Search", "Email"], answerIndex: 0, rationale: "Mira says checkout is unavailable." },
          { id: "q4", question: "How often will they update users?", options: ["Every thirty minutes", "Every day", "Once a week", "Every five hours"], answerIndex: 0, rationale: "Mira suggests every thirty minutes and John agrees." },
          { id: "q5", question: "What data appears not to be affected?", options: ["Payment data", "Shipping data", "Profile photos", "Chat messages"], answerIndex: 0, rationale: "They mention payment data is not affected." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "The team is investigating the root ____.", options: ["cause", "course", "case", "clause"], answerIndex: 0, rationale: "Root cause means the underlying reason." },
      { id: "v2", prompt: "We should avoid ____ until we have evidence.", options: ["speculation", "specifics", "schedules", "summaries"], answerIndex: 0, rationale: "Speculation means guessing." },
      { id: "v3", prompt: "The outage ____ some users.", options: ["affects", "effects", "offers", "allows"], answerIndex: 0, rationale: "Affects is the verb meaning impacts." },
      { id: "v4", prompt: "Please send the next ____ at noon.", options: ["update", "upside", "upload", "upgrade"], answerIndex: 0, rationale: "An update gives new information." },
      { id: "v5", prompt: "The message should be clear and ____.", options: ["credible", "crowded", "casual only", "careless"], answerIndex: 0, rationale: "Credible means believable." },
    ],
    grammar: [
      { id: "g1", prompt: "Checkout ____ unavailable for some users.", options: ["is", "are", "were being", "have"], answerIndex: 0, rationale: "Use is with singular checkout.", targetStructure: "Passive/state wording" },
      { id: "g2", prompt: "The issue ____ identified by noon.", options: ["will have been", "will", "has", "is being have"], answerIndex: 0, rationale: "Future perfect passive uses will have been.", targetStructure: "Future perfect passive" },
      { id: "g3", prompt: "Payment data ____ to be unaffected.", options: ["appears", "appearing", "appear", "has appear"], answerIndex: 0, rationale: "Appears hedges the claim.", targetStructure: "Hedging" },
      { id: "g4", prompt: "We are investigating, ____ we do not yet know the cause.", options: ["but", "because", "unless", "whereas"], answerIndex: 0, rationale: "But contrasts action with uncertainty.", targetStructure: "Contrast" },
      { id: "g5", prompt: "Users ____ notified every thirty minutes.", options: ["will be", "will", "are have", "being"], answerIndex: 0, rationale: "Future passive uses will be + participle.", targetStructure: "Future passive" },
    ],
    dialogue: [
      {
        id: "adv-crisis-dlg-01",
        title: "Choosing precise language",
        lines: [
          { speaker: "John", text: "We cannot say the issue is fixed until monitoring confirms it." },
          { speaker: "Mira", text: "Then we say service has been restored, and monitoring continues." },
          { speaker: "John", text: "Exactly. That is accurate without overpromising." },
          { speaker: "Mira", text: "Should we apologize in the first line?" },
          { speaker: "John", text: "Yes. Acknowledge the disruption before explaining the technical detail." },
          { speaker: "Mira", text: "Clear. Impact first, explanation second." },
        ],
        questions: [
          { id: "q1", question: "What must happen before they say the issue is fixed?", options: ["Monitoring confirms it", "A designer approves it", "The meeting ends", "A customer asks"], answerIndex: 0, rationale: "John says monitoring must confirm it." },
          { id: "q2", question: "What wording does Mira suggest?", options: ["Service has been restored, and monitoring continues", "Everything is perfect", "No one was affected", "The issue never happened"], answerIndex: 0, rationale: "Mira suggests that exact wording." },
          { id: "q3", question: "Why does John like the wording?", options: ["It is accurate without overpromising", "It sounds dramatic", "It hides the impact", "It is very short"], answerIndex: 0, rationale: "John says it is accurate without overpromising." },
          { id: "q4", question: "Where should the apology go?", options: ["In the first line", "At the end only", "In a footnote", "Nowhere"], answerIndex: 0, rationale: "John agrees they should apologize in the first line." },
          { id: "q5", question: "What comes first?", options: ["Impact", "Technical explanation", "Pricing", "A legal quote"], answerIndex: 0, rationale: "Mira summarizes: impact first, explanation second." },
        ],
      },
    ],
    roleplay: [
      { id: "adv-crisis-rp-01", scenario: "Draft an outage update for customers with known facts, unknowns, impact, and next update time.", goal: "Practice precise crisis communication.", personaSlug: "diplomat", turns: 6, openingLine: "We need a customer update in five minutes. What should it say?" },
    ],
  },
  {
    slug: "cross-cultural-negotiation",
    topic: "Cross-Cultural Negotiation",
    summary: "Negotiate across cultures with careful framing, respectful disagreement, and clear commitments.",
    functionalLanguage: ["Softening disagreement", "Clarifying assumptions", "Confirming commitments"],
    vocabularyThemes: ["Negotiation", "Culture", "Partnerships"],
    grammarInContext: ["Conditionals", "Hedging", "Inversion"],
    reading: [
      {
        id: "adv-neg-read-01",
        title: "When Directness Feels Different",
        estReadMinutes: 4,
        text:
          "In cross-cultural negotiation, directness is not a universal signal of honesty, and indirectness is not necessarily a lack of clarity. A skilled negotiator notices how disagreement is packaged: some teams challenge ideas openly, while others use questions, pauses, or side conversations to surface concerns. The goal is not to imitate every style perfectly, but to make commitments explicit without making partners lose face.",
        questions: [
          { id: "q1", question: "What is not a universal signal of honesty?", options: ["Directness", "Preparation", "Written notes", "Clear timing"], answerIndex: 0, rationale: "The passage says directness is not universal." },
          { id: "q2", question: "What does indirectness not necessarily mean?", options: ["A lack of clarity", "Strong trust", "A signed deal", "A fast decision"], answerIndex: 0, rationale: "Indirectness is not necessarily a lack of clarity." },
          { id: "q3", question: "What should a skilled negotiator notice?", options: ["How disagreement is packaged", "Only the final price", "The room size", "The lunch menu"], answerIndex: 0, rationale: "The passage says to notice how disagreement is packaged." },
          { id: "q4", question: "What may some teams use to surface concerns?", options: ["Questions and pauses", "Only contracts", "Public complaints", "Silence forever"], answerIndex: 0, rationale: "The passage mentions questions, pauses, and side conversations." },
          { id: "q5", question: "What is the goal?", options: ["Make commitments explicit without causing loss of face", "Win every point", "Avoid all questions", "Copy every style perfectly"], answerIndex: 0, rationale: "That is the stated goal." },
        ],
      },
    ],
    listening: [
      {
        id: "adv-neg-listen-01",
        title: "Clarifying a Partnership Term",
        section: "Cross-Cultural Negotiation",
        script:
          "John: I sense we may be using the word exclusive differently.\nAiko: That's possible. For us, exclusive means no direct competitor in the same city.\nJohn: That's helpful. We meant no competitor in the whole region.\nAiko: That would be difficult for us to accept immediately.\nJohn: Understood. What if we start with city-level exclusivity and review after six months?\nAiko: That sounds like a respectful compromise.",
        speakers: ["John", "Aiko"],
        durationSec: 50,
        requiresManualAudioReview: true,
        questions: [
          { id: "q1", question: "Which word may they be using differently?", options: ["Exclusive", "Regional", "Respectful", "Immediate"], answerIndex: 0, rationale: "John mentions the word exclusive." },
          { id: "q2", question: "What does exclusive mean for Aiko's team?", options: ["No direct competitor in the same city", "No competitor worldwide", "No marketing", "No review period"], answerIndex: 0, rationale: "Aiko defines it as no direct competitor in the same city." },
          { id: "q3", question: "What did John mean by exclusive?", options: ["No competitor in the whole region", "No competitor in one building", "No city-level limit", "No contract"], answerIndex: 0, rationale: "John says the whole region." },
          { id: "q4", question: "What compromise does John suggest?", options: ["City-level exclusivity with a six-month review", "No exclusivity", "Immediate regional exclusivity", "A higher price only"], answerIndex: 0, rationale: "John suggests city-level exclusivity and review after six months." },
          { id: "q5", question: "How does Aiko describe the compromise?", options: ["Respectful", "Impossible", "Too late", "Unclear"], answerIndex: 0, rationale: "Aiko says it sounds like a respectful compromise." },
        ],
      },
    ],
    vocabulary: [
      { id: "v1", prompt: "We need to clarify the ____ of exclusive.", options: ["meaning", "meeting", "marketing", "margin"], answerIndex: 0, rationale: "Meaning is what a word represents." },
      { id: "v2", prompt: "That proposal is difficult to ____ immediately.", options: ["accept", "except", "access", "assess"], answerIndex: 0, rationale: "Accept means agree to." },
      { id: "v3", prompt: "Let's review the term after six ____.", options: ["months", "minutes", "markets", "methods"], answerIndex: 0, rationale: "Months are time periods used in contracts." },
      { id: "v4", prompt: "The compromise feels ____ to both sides.", options: ["respectful", "respective", "restless", "restricted"], answerIndex: 0, rationale: "Respectful means considerate." },
      { id: "v5", prompt: "We should make the commitment ____.", options: ["explicit", "explosive", "expensive", "external"], answerIndex: 0, rationale: "Explicit means clear and stated." },
    ],
    grammar: [
      { id: "g1", prompt: "If we started with city-level exclusivity, we ____ review it later.", options: ["could", "can have", "had", "were"], answerIndex: 0, rationale: "Could fits a hypothetical proposal.", targetStructure: "Second conditional" },
      { id: "g2", prompt: "____ we agree today, the review should be written into the contract.", options: ["Should", "Had", "Were", "Having"], answerIndex: 0, rationale: "Should can invert a conditional formally.", targetStructure: "Inversion" },
      { id: "g3", prompt: "That may be difficult ____ us to accept.", options: ["for", "to", "at", "by"], answerIndex: 0, rationale: "Difficult for someone to do something.", targetStructure: "Adjective pattern" },
      { id: "g4", prompt: "We seem ____ defining the term differently.", options: ["to be", "be", "being", "been"], answerIndex: 0, rationale: "Seem to be is the correct pattern.", targetStructure: "Hedging" },
      { id: "g5", prompt: "The agreement, ____ carefully drafted, could work.", options: ["if", "unless", "because", "despite"], answerIndex: 0, rationale: "If carefully drafted expresses condition.", targetStructure: "Reduced conditional" },
    ],
    dialogue: [
      {
        id: "adv-neg-dlg-01",
        title: "Softening disagreement",
        lines: [
          { speaker: "John", text: "I appreciate the direction, though I worry the timeline assumes too much certainty." },
          { speaker: "Aiko", text: "Which assumption concerns you most?" },
          { speaker: "John", text: "The regulatory approval. It may take longer than the model suggests." },
          { speaker: "Aiko", text: "That is a fair concern. Would a phased commitment help?" },
          { speaker: "John", text: "Yes. It would let both teams move forward without pretending the risk is gone." },
          { speaker: "Aiko", text: "Then let's draft the phased version." },
        ],
        questions: [
          { id: "q1", question: "What worries John?", options: ["The timeline assumes too much certainty", "The room is small", "The price is too low", "The team is late"], answerIndex: 0, rationale: "John says the timeline assumes too much certainty." },
          { id: "q2", question: "Which assumption concerns John most?", options: ["Regulatory approval", "Marketing color", "Lunch timing", "Office rent"], answerIndex: 0, rationale: "John names regulatory approval." },
          { id: "q3", question: "What does Aiko suggest?", options: ["A phased commitment", "Ending the deal", "Ignoring the risk", "Changing the topic"], answerIndex: 0, rationale: "Aiko asks if a phased commitment would help." },
          { id: "q4", question: "Why does John like the phased approach?", options: ["It lets both teams move forward honestly", "It removes all work", "It avoids any contract", "It hides the risk"], answerIndex: 0, rationale: "John says they can move forward without pretending the risk is gone." },
          { id: "q5", question: "What will they draft?", options: ["The phased version", "A press release", "A travel plan", "A hiring memo"], answerIndex: 0, rationale: "Aiko says to draft the phased version." },
        ],
      },
    ],
    roleplay: [
      { id: "adv-neg-rp-01", scenario: "Negotiate an exclusivity clause while preserving the relationship and clarifying assumptions.", goal: "Practice diplomatic negotiation language.", personaSlug: "diplomat", turns: 6, openingLine: "Before we sign, I think we should clarify what exclusivity means to each side." },
    ],
  },
];
