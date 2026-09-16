import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  const readingPassage = {
    title: "The Emergence of Early Writing Systems and Cognitive Expansion",
    paragraphs: [
      {
        label: "Paragraph A",
        text: "The transition of human societies from oral traditions to documented inscription represents one of the most profound leaps in cognitive archaeology. While symbolic cave paintings date back over 40,000 years, true proto-cuneiform systems materialized in ancient Mesopotamia around 3400 BCE. These early clay tokens and pictographs were primarily administrative tools, engineered not for poetic expression, but for quantifying agricultural surplus, grain distribution, and livestock inventories."
      },
      {
        label: "Paragraph B",
        text: "As economic trade expanded across the Fertile Crescent, the inherent limitations of pictographic tokens became insurmountable. Scribes required a medium capable of conveying abstract linguistic nuance and grammatical tense. The critical innovation occurred when pictographs transformed into phonograms—symbols representing speech sounds rather than tangible physical objects. This phonetization drastically reduced the total symbol inventory needed to transcribe spoken language."
      },
      {
        label: "Paragraph C",
        text: "Simultaneously in the Nile River Valley, Egyptian hieroglyphic script evolved alongside monumental architecture. Contrary to earlier twentieth-century academic hypotheses suggesting Mesopotamian origin, contemporary radiocarbon dating of tomb inscriptions at Abydos confirms that Egyptian hieroglyphs developed independently as early as 3200 BCE, driven largely by sacred royal rituals and ceremonial cosmology."
      }
    ]
  };

  const readingQuestions = [
    {
      id: 1,
      type: 'tfng',
      prompt: "The earliest Mesopotamian proto-cuneiform scripts were initially conceived to record religious and poetic literature.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "FALSE",
      explanation: "Paragraph A explicitly states early proto-cuneiform was engineered for administrative purposes (agricultural surplus, grain, livestock), not poetic expression."
    },
    {
      id: 2,
      type: 'tfng',
      prompt: "The shift to phonograms allowed scribes to convey abstract concepts with fewer individual symbols.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "TRUE",
      explanation: "Paragraph B confirms that phonetization enabled abstract linguistic nuance and drastically reduced the total symbol inventory."
    },
    {
      id: 3,
      type: 'tfng',
      prompt: "Egyptian hieroglyphic writing was originally introduced into Egypt by Mesopotamian merchants.",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
      correctAnswer: "FALSE",
      explanation: "Paragraph C notes that radiocarbon dating at Abydos confirms Egyptian hieroglyphs developed independently, contrary to earlier theories of Mesopotamian origin."
    },
    {
      id: 4,
      type: 'mcq',
      prompt: "According to Paragraph A, what was the primary catalyst for early token inscription?",
      options: [
        "Religious cosmology and funeral rituals",
        "Quantification and logistics of economic surplus",
        "Inter-regional military communication",
        "Documenting genealogical ancestry"
      ],
      correctAnswer: "Quantification and logistics of economic surplus",
      explanation: "Paragraph A states tokens were administrative tools for quantifying agricultural surplus and inventories."
    }
  ];

  const listeningQuestions = [
    {
      id: 1,
      section: 1,
      prompt: "Customer inquiry reference number:",
      options: ["CR-9482-B", "CR-4982-A", "TR-9482-B", "CR-9428-C"],
      correctAnswer: "CR-9482-B",
      explanation: "The caller confirms the file reference code ending in '9482-B'."
    },
    {
      id: 2,
      section: 1,
      prompt: "Preferred relocation start date:",
      options: ["14th November", "18th November", "24th November", "1st December"],
      correctAnswer: "18th November",
      explanation: "The student agent books the slot for Friday the 18th of November."
    },
    {
      id: 3,
      section: 2,
      prompt: "Which facility has recently been upgraded in the campus library?",
      options: [
        "Soundproof private podcast studios",
        "24-hour quiet study pods",
        "Automated book return conveyor",
        "High-resolution digital microfilm archive"
      ],
      correctAnswer: "24-hour quiet study pods",
      explanation: "The university guide mentions the brand-new 24-hour acoustic study pods installed last semester."
    }
  ];

  if (type === 'reading') {
    return NextResponse.json({ readingPassage, readingQuestions });
  }

  if (type === 'listening') {
    return NextResponse.json({ listeningQuestions });
  }

  return NextResponse.json({ readingPassage, readingQuestions, listeningQuestions });
}
