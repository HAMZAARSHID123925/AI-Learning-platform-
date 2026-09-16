import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  const flashcards = [
    {
      id: 1,
      word: "Ubiquitous",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      partOfSpeech: "adjective",
      bandLevel: "Band 8.5",
      definition: "Present, appearing, or found everywhere simultaneously.",
      collocations: ["ubiquitous presence", "ubiquitous technology", "become increasingly ubiquitous"],
      exampleSentence: "Smart devices have become ubiquitous in modern metropolitan households, reshaping communication paradigms.",
      topic: "Technology"
    },
    {
      id: 2,
      word: "Exacerbate",
      phonetic: "/ɪɡˈzæs.ə.beɪt/",
      partOfSpeech: "verb",
      bandLevel: "Band 8.0",
      definition: "To make a problem, bad situation, or negative feeling much worse.",
      collocations: ["exacerbate the problem", "exacerbate climate change", "further exacerbate tensions"],
      exampleSentence: "Unchecked industrial emissions will severely exacerbate the global climate crisis over the next decade.",
      topic: "Environment"
    },
    {
      id: 3,
      word: "Preponderance",
      phonetic: "/prɪˈpɒn.dər.əns/",
      partOfSpeech: "noun",
      bandLevel: "Band 9.0",
      definition: "The quality or fact of being greater in number, quantity, or importance.",
      collocations: ["preponderance of evidence", "preponderance of opinions"],
      exampleSentence: "A substantial preponderance of empirical evidence indicates that bilingualism strengthens executive cognitive function.",
      topic: "Education"
    },
    {
      id: 4,
      word: "Mitigate",
      phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
      partOfSpeech: "verb",
      bandLevel: "Band 7.5",
      definition: "To make something bad less severe, serious, or painful.",
      collocations: ["mitigate the impact", "mitigate risks", "mitigate emissions"],
      exampleSentence: "Governmental investments in renewable energy are pivotal to mitigate future economic risks.",
      topic: "Environment"
    },
    {
      id: 5,
      word: "Proponents",
      phonetic: "/prəˈpəʊ.nənt/",
      partOfSpeech: "noun",
      bandLevel: "Band 8.0",
      definition: "A person who advocates a theory, proposal, or project.",
      collocations: ["leading proponents", "proponents of reform", "fervent proponents"],
      exampleSentence: "Proponents of remote learning contend that flexible schedules empower self-directed learners.",
      topic: "Society"
    },
    {
      id: 6,
      word: "Detrimental",
      phonetic: "/ˌdet.rɪˈmen.təl/",
      partOfSpeech: "adjective",
      bandLevel: "Band 8.0",
      definition: "Tending to cause harm, damage, or injury.",
      collocations: ["detrimental effect", "detrimental to health", "severely detrimental"],
      exampleSentence: "Sedentary lifestyles exert a detrimental influence on physical well-being and cardiovascular health.",
      topic: "Health"
    },
    {
      id: 7,
      word: "Disseminate",
      phonetic: "/dɪˈsem.ɪ.neɪt/",
      partOfSpeech: "verb",
      bandLevel: "Band 8.5",
      definition: "To spread information, knowledge, or opinions widely.",
      collocations: ["disseminate information", "widely disseminated", "disseminate research findings"],
      exampleSentence: "Academic institutions must effectively disseminate scientific discoveries to the broader public.",
      topic: "Education"
    }
  ];

  const quizQuestions = [
    {
      id: 1,
      topic: "Environment",
      bandLevel: "Band 8.5",
      sentence: "The introduction of strict carbon taxes helped to ________ the adverse economic impact of environmental degradation.",
      options: [
        { word: "mitigate", label: "mitigate", definition: "to reduce severity or make less severe" },
        { word: "exacerbate", label: "exacerbate", definition: "to make a situation worse" },
        { word: "preponderance", label: "preponderance", definition: "greatness in weight or importance" },
        { word: "ubiquitous", label: "ubiquitous", definition: "present or found everywhere" }
      ],
      correctWord: "mitigate",
      explanation: "'Mitigate' means to make something bad less severe. In the context of taxes preventing severe environmental consequences, 'mitigate the impact' is the standard Band 8.5 academic collocation.",
      ieltsTip: "Use 'mitigate' instead of simplistic verbs like 'lessen' or 'make smaller' in IELTS Writing Task 2 problem-solution essays."
    },
    {
      id: 2,
      topic: "Technology",
      bandLevel: "Band 8.5",
      sentence: "Smartphones and artificial intelligence have become ________ in 21st-century workplaces, altering productivity metrics.",
      options: [
        { word: "preponderance", label: "preponderance", definition: "a superiority in power or numbers" },
        { word: "ubiquitous", label: "ubiquitous", definition: "omnipresent, found everywhere" },
        { word: "detrimental", label: "detrimental", definition: "harmful or causing damage" },
        { word: "disseminate", label: "disseminate", definition: "to spread or distribute widely" }
      ],
      correctWord: "ubiquitous",
      explanation: "'Ubiquitous' is an adjective meaning appearing everywhere. As smartphone technology is present in every modern workplace, 'ubiquitous' fits the grammatical and semantic context perfectly.",
      ieltsTip: "Replace common phrases like 'can be seen everywhere' with 'has become ubiquitous' to elevate your Lexical Resource score."
    },
    {
      id: 3,
      topic: "Education & Research",
      bandLevel: "Band 9.0",
      sentence: "The university launched an open-access repository to ________ cutting-edge medical research to doctors globally.",
      options: [
        { word: "disseminate", label: "disseminate", definition: "to broadcast or distribute information widely" },
        { word: "mitigate", label: "mitigate", definition: "to lessen pain or severity" },
        { word: "exacerbate", label: "exacerbate", definition: "to aggravate or inflame" },
        { word: "proponents", label: "proponents", definition: "advocates or supporters" }
      ],
      correctWord: "disseminate",
      explanation: "'Disseminate' specifically refers to distributing knowledge, data, or findings to a widespread audience.",
      ieltsTip: "'Disseminate findings' is a high-value C2 collocation for IELTS Academic Writing Task 2 and Speaking Part 3."
    },
    {
      id: 4,
      topic: "Society & Governance",
      bandLevel: "Band 8.0",
      sentence: "Leading ________ of urban public transport claim that expanding light rail networks alleviates metropolitan congestion.",
      options: [
        { word: "proponents", label: "proponents", definition: "persons who argue in favor of something" },
        { word: "detrimental", label: "detrimental", definition: "injurious or damaging" },
        { word: "preponderance", label: "preponderance", definition: "greatness of quantity" },
        { word: "exacerbate", label: "exacerbate", definition: "to intensify negatively" }
      ],
      correctWord: "proponents",
      explanation: "'Proponents' is a noun designating advocates or supporters of a particular policy or viewpoint.",
      ieltsTip: "Use 'Proponents of [X] argue that...' to introduce arguments naturally in discussion essays."
    },
    {
      id: 5,
      topic: "Public Health",
      bandLevel: "Band 8.0",
      sentence: "Prolonged screen exposure and lack of physical exercise exert a ________ influence on adolescent mental well-being.",
      options: [
        { word: "detrimental", label: "detrimental", definition: "harmful, damaging, or adverse" },
        { word: "ubiquitous", label: "ubiquitous", definition: "existing everywhere" },
        { word: "mitigate", label: "mitigate", definition: "to reduce the severity of" },
        { word: "disseminate", label: "disseminate", definition: "to spread widely" }
      ],
      correctWord: "detrimental",
      explanation: "'Detrimental' means damaging or harmful. The phrase 'exert a detrimental influence/effect on' is an academic staple.",
      ieltsTip: "Replace 'has a bad effect on' with 'exerts a detrimental effect on' to reach Band 8.0+ in Grammatical Range and Lexicon."
    }
  ];

  if (type === 'flashcards') {
    return NextResponse.json({ flashcards });
  }

  if (type === 'quiz') {
    return NextResponse.json({ quizQuestions });
  }

  return NextResponse.json({ flashcards, quizQuestions });
}
