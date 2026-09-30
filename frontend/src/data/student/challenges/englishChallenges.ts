import type { ChallengeSet } from '@/types/student/learning';

export const englishChallenges: ChallengeSet[] = [
{
  courseId: 'g5-reading',
  questions: [
  { id: 'rd-c1', kind: 'question', prompt: 'The main idea of a passage is…', options: ['The first word', 'What it is mostly about', 'The longest sentence'], answer: 1, explanation: 'The main idea is the big point of the whole text.', skill: 'Main idea' },
  { id: 'rd-c2', kind: 'question', prompt: '“Dolphins talk with clicks and whistles. They call each other by name.” Main idea?', options: ['Dolphins can communicate', 'Dolphins are grey', 'Dolphins swim fast'], answer: 0, explanation: 'Both sentences are about how dolphins communicate.', skill: 'Main idea' },
  { id: 'rd-c3', kind: 'question', prompt: 'Details in a passage…', options: ['Support the main idea', 'Are always wrong', 'Are not important'], answer: 0, explanation: 'Details give evidence for the main idea.', skill: 'Main idea' },
  { id: 'rd-c4', kind: 'question', prompt: '“Leo’s stomach growled as he smelled the bread.” How does Leo feel?', options: ['Hungry', 'Sleepy', 'Angry'], answer: 0, explanation: 'A growling stomach is a clue he is hungry.', skill: 'Inference' },
  { id: 'rd-c5', kind: 'question', prompt: '“Ana smiled and hugged her new puppy.” Ana feels…', options: ['Sad', 'Happy', 'Scared'], answer: 1, explanation: 'Smiling and hugging show she is happy.', skill: 'Inference' },
  { id: 'rd-c6', kind: 'question', prompt: '“The streets were covered in white and kids built snowmen.” What season is it?', options: ['Summer', 'Winter', 'Spring'], answer: 1, explanation: 'Snow is a clue that it’s winter.', skill: 'Inference', level: 'stretch' },
  { id: 'rd-c7', kind: 'question', prompt: 'Which word shows something happens FIRST?', options: ['Finally', 'Initially', 'Afterwards'], answer: 1, explanation: '“Initially” means at the beginning.', skill: 'Sequencing', level: 'stretch' },
  { id: 'rd-c8', kind: 'question', prompt: 'What’s the correct order for brushing teeth?', options: ['Rinse, brush, add paste', 'Add paste, brush, rinse', 'Brush, add paste, rinse'], answer: 1, explanation: 'Paste first, then brush, then rinse.', skill: 'Sequencing' },
  { id: 'rd-c9', kind: 'question', prompt: 'A butterfly’s life begins as…', options: ['An egg', 'A butterfly', 'A cocoon'], answer: 0, explanation: 'Egg → caterpillar → chrysalis → butterfly.', skill: 'Sequencing' },
  { id: 'rd-c10', kind: 'question', prompt: 'Which word shows the middle of a sequence?', options: ['First', 'Next', 'Finally'], answer: 1, explanation: '“Next” moves the story along in the middle.', skill: 'Sequencing' }]

},
{
  courseId: 'g5-vocabulary',
  questions: [
  { id: 'voc-c1', kind: 'question', prompt: 'A synonym for “quick” is…', options: ['Fast', 'Slow', 'Quiet'], answer: 0, explanation: 'Quick and fast mean the same.', skill: 'Synonyms' },
  { id: 'voc-c2', kind: 'question', prompt: 'A synonym for “smart” is…', options: ['Clever', 'Silly', 'Tall'], answer: 0, explanation: 'Clever means smart.', skill: 'Synonyms' },
  { id: 'voc-c3', kind: 'question', prompt: 'Which pair are synonyms?', options: ['Cold / chilly', 'Up / down', 'Loud / quiet'], answer: 0, explanation: 'Cold and chilly both mean not warm.', skill: 'Synonyms' },
  { id: 'voc-c4', kind: 'question', prompt: 'The antonym of “empty” is…', options: ['Full', 'Hollow', 'Bare'], answer: 0, explanation: 'Full is the opposite of empty.', skill: 'Antonyms' },
  { id: 'voc-c5', kind: 'question', prompt: 'The antonym of “arrive” is…', options: ['Reach', 'Depart', 'Enter'], answer: 1, explanation: 'To depart means to leave.', skill: 'Antonyms' },
  { id: 'voc-c6', kind: 'question', prompt: 'Which pair are antonyms?', options: ['Huge / giant', 'Rough / smooth', 'Happy / glad'], answer: 1, explanation: 'Rough and smooth are opposites.', skill: 'Antonyms' },
  { id: 'voc-c7', kind: 'question', prompt: '“The fragile vase shattered when it fell.” Fragile means…', options: ['Easily broken', 'Very heavy', 'Brightly colored'], answer: 0, explanation: 'Shattered is the clue — it breaks easily.', skill: 'Context clues' },
  { id: 'voc-c8', kind: 'question', prompt: '“After the marathon, she was exhausted and slept all day.” Exhausted means…', options: ['Very tired', 'Excited', 'Lost'], answer: 0, explanation: 'Sleeping all day is the clue.', skill: 'Context clues' },
  { id: 'voc-c9', kind: 'question', prompt: '“The generous boy shared all his snacks.” Generous means…', options: ['Selfish', 'Willing to give', 'Hungry'], answer: 1, explanation: 'Sharing everything shows he is generous.', skill: 'Context clues', level: 'stretch' },
  { id: 'voc-c10', kind: 'question', prompt: '“The room was so dim we needed a torch.” Dim means…', options: ['Bright', 'Dark', 'Noisy'], answer: 1, explanation: 'Needing a torch is a clue it was dark.', skill: 'Context clues', level: 'stretch' }]

},
{
  courseId: 'g5-grammar',
  questions: [
  { id: 'gr-c1', kind: 'question', prompt: 'Which word is a verb?', options: ['Swim', 'Blue', 'Table'], answer: 0, explanation: 'Swim is an action.', skill: 'Nouns & verbs' },
  { id: 'gr-c2', kind: 'question', prompt: 'Which word is a noun?', options: ['Run', 'Mountain', 'Softly'], answer: 1, explanation: 'A mountain is a place/thing.', skill: 'Nouns & verbs' },
  { id: 'gr-c3', kind: 'question', prompt: 'In “Birds fly south”, what is the verb?', visual: { type: 'words', tokens: ['Birds', 'fly', 'south.'] }, options: ['Birds', 'Fly', 'South'], answer: 1, explanation: '“Fly” is what the birds do.', skill: 'Nouns & verbs' },
  { id: 'gr-c4', kind: 'question', prompt: 'Which word is an adjective?', options: ['Happy', 'Jump', 'Cat'], answer: 0, explanation: '“Happy” describes a noun.', skill: 'Adjectives' },
  { id: 'gr-c5', kind: 'question', prompt: 'In “The tall tree swayed”, which word is the adjective?', options: ['Tall', 'Tree', 'Swayed'], answer: 0, explanation: '“Tall” describes the tree.', skill: 'Adjectives' },
  { id: 'gr-c6', kind: 'question', prompt: 'Which sentence has TWO adjectives?', options: ['The dog barked.', 'A small brown dog barked.', 'Dogs bark loudly.'], answer: 1, explanation: '“Small” and “brown” both describe the dog.', skill: 'Adjectives', level: 'stretch' },
  { id: 'gr-c7', kind: 'question', prompt: 'Every sentence starts with a…', options: ['Capital letter', 'Comma', 'Number'], answer: 0, explanation: 'Sentences begin with a capital letter.', skill: 'Punctuation' },
  { id: 'gr-c8', kind: 'question', prompt: 'Which ends a question?', options: ['.', '?', '!'], answer: 1, explanation: 'Questions end with a question mark.', skill: 'Punctuation' },
  { id: 'gr-c9', kind: 'question', prompt: 'Which sentence is correct?', options: ['i like apples.', 'I like apples.', 'I like apples'], answer: 1, explanation: 'Capital I and a full stop at the end.', skill: 'Punctuation' },
  { id: 'gr-c10', kind: 'question', prompt: 'Where does the comma go? “I bought apples bananas and pears.”', options: ['After apples and bananas', 'After bought', 'After pears'], answer: 0, explanation: 'Commas separate items in a list: apples, bananas and pears.', skill: 'Punctuation', level: 'stretch' }]

}];