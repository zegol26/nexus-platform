import type { DceLevel } from "./types";

export const foundationLevel: DceLevel = {
  level: "A1_A2",
  name: "Foundation",
  focus: "Survival English & Everyday Interaction",
  cefrRange: "A1 → A2",
  badgeColor: "emerald",
  modules: [
    {
      slug: "introductions-daily-routines",
      topic: "Introductions and Daily Routines",
      summary:
        "Greet people, share basic personal info, talk about daily life, and order food in everyday settings.",
      functionalLanguage: [
        "Greeting people (Hi, How are you, Nice to meet you)",
        "Asking for basic information (name, country, job)",
        "Ordering food and drinks politely",
      ],
      vocabularyThemes: ["Numbers and time", "Food and drinks", "Family and friends"],
      grammarInContext: ["Verb 'To Be'", "Present Simple", "Basic Prepositions (in, on, at)"],
      reading: [
        {
          id: "fnd-intro-read-01",
          title: "Maria's Morning",
          estReadMinutes: 2,
          text:
            "Maria is from Mexico. She lives in Sydney with her sister Ana. Every morning she wakes up at six o'clock. She drinks a glass of water and makes coffee. At seven, she walks to the station. The train to her office takes twenty minutes. Maria is a junior nurse at Royal Hospital. She likes her job because she meets new people every day.",
          questions: [
            {
              id: "q1",
              question: "Where does Maria live?",
              options: ["Mexico City", "Sydney", "London", "Melbourne"],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What time does she wake up?",
              options: ["5:00", "6:00", "7:00", "8:00"],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "How does she go to the office?",
              options: ["By bus", "By car", "By train", "By bike"],
              answerIndex: 2,
            },
            {
              id: "q4",
              question: "Why does Maria like her job?",
              options: [
                "It pays a lot",
                "It is near home",
                "She meets new people",
                "She works alone",
              ],
              answerIndex: 2,
            },
          ],
        },
        {
          id: "fnd-intro-read-02",
          title: "A Cafe in Bali",
          estReadMinutes: 2,
          text:
            "There is a small cafe near my hotel. The owner is Mr. Putu. He is from Ubud. He opens the cafe at eight in the morning. The menu has coffee, tea, juice, and cakes. The mango juice is fresh and cheap. Many tourists come for breakfast. Mr. Putu speaks English, Balinese, and a little Japanese.",
          questions: [
            {
              id: "q1",
              question: "Who is the owner?",
              options: ["Mr. Made", "Mr. Putu", "Mr. Wayan", "Mr. Nyoman"],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "When does the cafe open?",
              options: ["6 AM", "7 AM", "8 AM", "9 AM"],
              answerIndex: 2,
            },
            {
              id: "q3",
              question: "What is fresh and cheap?",
              options: ["Coffee", "Tea", "Mango juice", "Cake"],
              answerIndex: 2,
            },
          ],
        },
      ],
      listening: [
        {
          id: "fnd-intro-listen-01",
          title: "Meeting a New Classmate",
          script:
            "Anna: Hi! I'm Anna. What's your name? \nLuis: Hello Anna. I'm Luis. Nice to meet you. \nAnna: Nice to meet you too, Luis. Where are you from? \nLuis: I'm from Spain. And you? \nAnna: I'm from Indonesia. Are you a student here? \nLuis: Yes, I study engineering. What about you? \nAnna: I study English literature.",
          speakers: ["Anna", "Luis"],
          durationSec: 35,
          questions: [
            {
              id: "q1",
              question: "Where is Luis from?",
              options: ["Italy", "Spain", "Mexico", "Portugal"],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "What does Anna study?",
              options: [
                "Engineering",
                "Medicine",
                "English literature",
                "Business",
              ],
              answerIndex: 2,
            },
            {
              id: "q3",
              question: "Which phrase do they both use to greet?",
              options: [
                "How do you do",
                "Nice to meet you",
                "Good evening",
                "Long time no see",
              ],
              answerIndex: 1,
            },
          ],
        },
        {
          id: "fnd-intro-listen-02",
          title: "Ordering Coffee",
          script:
            "Barista: Good morning! What can I get for you? \nCustomer: Good morning. Can I have a flat white, please? \nBarista: Sure. Small, medium, or large? \nCustomer: Medium, please. \nBarista: Anything else? \nCustomer: A blueberry muffin, please. \nBarista: That'll be eight dollars fifty.",
          speakers: ["Barista", "Customer"],
          durationSec: 28,
          questions: [
            {
              id: "q1",
              question: "What does the customer order?",
              options: [
                "Latte and cookie",
                "Flat white and muffin",
                "Cappuccino and bagel",
                "Espresso and croissant",
              ],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "How much is the total?",
              options: ["$5.00", "$7.50", "$8.50", "$10.00"],
              answerIndex: 2,
            },
          ],
        },
      ],
      vocabulary: [
        {
          id: "v1",
          prompt: "I usually wake ____ at six in the morning.",
          options: ["up", "on", "in", "at"],
          answerIndex: 0,
        },
        {
          id: "v2",
          prompt: "She works ____ a hospital downtown.",
          options: ["on", "in", "at", "by"],
          answerIndex: 1,
        },
        {
          id: "v3",
          prompt: "Can I ____ a cup of tea, please?",
          options: ["take", "have", "give", "do"],
          answerIndex: 1,
        },
        {
          id: "v4",
          prompt: "We have breakfast ____ seven o'clock.",
          options: ["in", "on", "at", "by"],
          answerIndex: 2,
        },
        {
          id: "v5",
          prompt: "Nice to ____ you.",
          options: ["meet", "make", "see", "find"],
          answerIndex: 0,
        },
        {
          id: "v6",
          prompt: "My brother is ____ engineer.",
          options: ["a", "an", "the", "—"],
          answerIndex: 1,
        },
        {
          id: "v7",
          prompt: "How ____ are you? — I'm twenty-five.",
          options: ["tall", "old", "much", "many"],
          answerIndex: 1,
        },
        {
          id: "v8",
          prompt: "She ____ from Brazil.",
          options: ["are", "is", "am", "be"],
          answerIndex: 1,
        },
        {
          id: "v9",
          prompt: "Could I have the ____, please?",
          options: ["bill", "ticket", "key", "card"],
          answerIndex: 0,
        },
        {
          id: "v10",
          prompt: "I'd like a ____ of orange juice.",
          options: ["plate", "slice", "glass", "piece"],
          answerIndex: 2,
        },
      ],
      grammar: [
        {
          id: "g1",
          prompt: "____ they your friends?",
          options: ["Is", "Are", "Am", "Be"],
          answerIndex: 1,
          targetStructure: "Verb 'To Be'",
        },
        {
          id: "g2",
          prompt: "He ____ to the gym every Monday.",
          options: ["go", "goes", "going", "gone"],
          answerIndex: 1,
          targetStructure: "Present Simple",
        },
        {
          id: "g3",
          prompt: "There ____ two cats on the sofa.",
          options: ["is", "are", "am", "be"],
          answerIndex: 1,
          targetStructure: "There is/are",
        },
        {
          id: "g4",
          prompt: "I don't ____ coffee in the morning.",
          options: ["drinks", "drink", "drinking", "drank"],
          answerIndex: 1,
          targetStructure: "Present Simple negative",
        },
        {
          id: "g5",
          prompt: "____ you speak English?",
          options: ["Are", "Do", "Is", "Have"],
          answerIndex: 1,
          targetStructure: "Present Simple question",
        },
        {
          id: "g6",
          prompt: "She is ____ teacher.",
          options: ["a", "an", "the", "—"],
          answerIndex: 0,
          targetStructure: "Articles",
        },
        {
          id: "g7",
          prompt: "We live ____ Jakarta.",
          options: ["on", "at", "in", "by"],
          answerIndex: 2,
          targetStructure: "Prepositions of place",
        },
        {
          id: "g8",
          prompt: "____ I help you?",
          options: ["Can", "Do", "Am", "Is"],
          answerIndex: 0,
          targetStructure: "Modal can",
        },
        {
          id: "g9",
          prompt: "My birthday is ____ March.",
          options: ["on", "at", "in", "of"],
          answerIndex: 2,
          targetStructure: "Prepositions of time",
        },
        {
          id: "g10",
          prompt: "These are ____ books.",
          options: ["I", "me", "my", "mine"],
          answerIndex: 2,
          targetStructure: "Possessive adjective",
        },
      ],
      dialogue: [
        {
          id: "fnd-intro-dlg-01",
          title: "First day at the office",
          lines: [
            { speaker: "Sam", text: "Good morning! I'm Sam, the new intern." },
            { speaker: "Lia", text: "Hi Sam, welcome! I'm Lia. Where are you from?" },
            { speaker: "Sam", text: "I'm from Surabaya. And you?" },
            { speaker: "Lia", text: "I'm from Bandung. Have you met our team yet?" },
            { speaker: "Sam", text: "Not yet. Could you introduce me, please?" },
            { speaker: "Lia", text: "Of course. Follow me." },
          ],
          questions: [
            {
              id: "q1",
              question: "What does Sam ask Lia to do?",
              options: [
                "Show him the cafe",
                "Introduce him to the team",
                "Send him an email",
                "Help him log in",
              ],
              answerIndex: 1,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "fnd-intro-rp-01",
          scenario:
            "You meet your new flatmate for the first time. Introduce yourself, ask 3 personal questions, and agree on a coffee time.",
          goal: "Hold a 5-turn small talk conversation using greetings and Present Simple.",
          personaSlug: "barista",
          turns: 5,
          openingLine: "Hi! I just moved in. I'm Maya. What's your name?",
        },
      ],
    },
    {
      slug: "navigating-the-city",
      topic: "Navigating the City",
      summary:
        "Buy tickets, ask for and give directions, and survive transport mishaps in a new city.",
      functionalLanguage: [
        "Asking for directions",
        "Buying tickets and confirming prices",
        "Expressing confusion politely",
      ],
      vocabularyThemes: ["Transportation", "Places in a city", "Money"],
      grammarInContext: ["Imperatives", "There is/There are", "Can for requests"],
      reading: [
        {
          id: "fnd-city-read-01",
          title: "Lost in Singapore",
          estReadMinutes: 2,
          text:
            "Lina arrives at Changi Airport at nine in the evening. She wants to go to her hotel in Bugis. She walks to the MRT station and looks at the map. The journey is twenty-one stops with one transfer at Tanah Merah. She buys a ticket from the machine. The total is two dollars and forty cents. The train is clean and quiet. Forty-five minutes later, she arrives at Bugis station.",
          questions: [
            {
              id: "q1",
              question: "Where is Lina's hotel?",
              options: ["Bugis", "Changi", "Tanah Merah", "Marina Bay"],
              answerIndex: 0,
            },
            {
              id: "q2",
              question: "How does she pay for the ticket?",
              options: [
                "At the counter",
                "From a machine",
                "With a card on the train",
                "By phone",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "How long is the trip?",
              options: ["20 minutes", "30 minutes", "45 minutes", "1 hour"],
              answerIndex: 2,
            },
          ],
        },
      ],
      listening: [
        {
          id: "fnd-city-listen-01",
          title: "Asking for Directions",
          script:
            "Tourist: Excuse me, how do I get to the museum? \nLocal: Walk straight for two blocks, then turn left at the bank. \nTourist: Sorry, did you say left? \nLocal: Yes, left. The museum is next to the post office. \nTourist: Is it far? \nLocal: About ten minutes on foot. \nTourist: Thanks a lot! \nLocal: You're welcome.",
          speakers: ["Tourist", "Local"],
          durationSec: 30,
          questions: [
            {
              id: "q1",
              question: "Where do you turn?",
              options: ["At the post office", "At the bank", "At the museum", "At the cafe"],
              answerIndex: 1,
            },
            {
              id: "q2",
              question: "How long does it take to walk?",
              options: ["5 minutes", "10 minutes", "20 minutes", "30 minutes"],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "What is the museum next to?",
              options: ["The bank", "The cafe", "The post office", "The hotel"],
              answerIndex: 2,
            },
          ],
        },
      ],
      vocabulary: [
        { id: "v1", prompt: "How ____ is a single ticket?", options: ["many", "much", "long", "old"], answerIndex: 1 },
        { id: "v2", prompt: "Turn ____ at the traffic lights.", options: ["right", "wrong", "in", "off"], answerIndex: 0 },
        { id: "v3", prompt: "The bank is ____ to the cafe.", options: ["next", "near", "between", "behind"], answerIndex: 0 },
        { id: "v4", prompt: "I'd like a ____ ticket to London.", options: ["return", "going", "back", "way"], answerIndex: 0 },
        { id: "v5", prompt: "Excuse me, where is the ____?", options: ["station", "stationery", "stationary", "stay"], answerIndex: 0 },
        { id: "v6", prompt: "The bus ____ leaves in five minutes.", options: ["stop", "station", "stand", "way"], answerIndex: 0 },
        { id: "v7", prompt: "Can I pay ____ card?", options: ["on", "with", "by", "in"], answerIndex: 2 },
        { id: "v8", prompt: "Is the museum ____ from here?", options: ["far", "long", "near", "wide"], answerIndex: 0 },
        { id: "v9", prompt: "I need to ____ a taxi.", options: ["pick", "take", "do", "make"], answerIndex: 1 },
        { id: "v10", prompt: "Sorry, I don't ____ what you mean.", options: ["know", "understand", "say", "speak"], answerIndex: 1 },
      ],
      grammar: [
        { id: "g1", prompt: "____ straight ahead and you'll see it.", options: ["Goes", "Going", "Go", "Went"], answerIndex: 2, targetStructure: "Imperatives" },
        { id: "g2", prompt: "There ____ a pharmacy on the corner.", options: ["are", "is", "have", "has"], answerIndex: 1, targetStructure: "There is/are" },
        { id: "g3", prompt: "____ I have a map, please?", options: ["Do", "Am", "Can", "Is"], answerIndex: 2, targetStructure: "Can for requests" },
        { id: "g4", prompt: "Don't ____ at the red light.", options: ["go", "going", "goes", "gone"], answerIndex: 0, targetStructure: "Negative imperatives" },
        { id: "g5", prompt: "There ____ many tourists today.", options: ["is", "be", "are", "was"], answerIndex: 2, targetStructure: "There is/are" },
        { id: "g6", prompt: "____ help me with the ticket machine?", options: ["Could you", "You can", "Will I", "Do I"], answerIndex: 0, targetStructure: "Polite request" },
        { id: "g7", prompt: "The cafe is ____ the bank and the cinema.", options: ["next", "between", "behind", "above"], answerIndex: 1, targetStructure: "Prepositions of place" },
        { id: "g8", prompt: "Take the second turn ____ the right.", options: ["in", "on", "at", "to"], answerIndex: 1, targetStructure: "Prepositions of direction" },
        { id: "g9", prompt: "How ____ stops to Central?", options: ["much", "many", "long", "far"], answerIndex: 1, targetStructure: "Quantifiers" },
        { id: "g10", prompt: "____ you tell me where the toilet is?", options: ["Could", "Should", "May", "Will"], answerIndex: 0, targetStructure: "Modal could" },
      ],
      dialogue: [
        {
          id: "fnd-city-dlg-01",
          title: "Buying a metro ticket",
          lines: [
            { speaker: "Customer", text: "Hi, one ticket to King's Cross, please." },
            { speaker: "Clerk", text: "Single or return?" },
            { speaker: "Customer", text: "Single, please. How much is it?" },
            { speaker: "Clerk", text: "Two pounds eighty." },
            { speaker: "Customer", text: "Sorry, can you say that again?" },
            { speaker: "Clerk", text: "Two pounds eighty. Cash or card?" },
            { speaker: "Customer", text: "Card, please." },
          ],
          questions: [
            {
              id: "q1",
              question: "Why does the customer say 'sorry, can you say that again'?",
              options: [
                "He didn't catch the price",
                "He wants a refund",
                "He needs a different station",
                "He has no card",
              ],
              answerIndex: 0,
            },
          ],
        },
      ],
      roleplay: [
        {
          id: "fnd-city-rp-01",
          scenario:
            "You're a tourist in London who is lost on the way to the British Museum. Ask a local for directions, confirm the route, and thank them.",
          goal: "Practice asking for directions and confirming distance using polite questions.",
          personaSlug: "tourist",
          turns: 5,
          openingLine:
            "Hi there, sorry to bother you. Could you tell me how to get to the British Museum from here?",
        },
      ],
    },
  ],
};
