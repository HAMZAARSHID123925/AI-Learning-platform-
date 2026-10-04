import type { LessonContent } from '@/types/learning';

export const englishLessons: LessonContent[] = [
/* ---------- Reading Skills ---------- */
{
  lessonId: 'rd-1',
  steps: [
  { kind: 'concept', title: 'The big idea', body: 'The main idea is what a passage is mostly about. The other sentences are details that support it.', visual: { type: 'passage', text: 'Bees visit flowers to collect nectar. As they move, they carry pollen from flower to flower. This helps plants make seeds. Without bees, many fruits would not grow.', highlight: 'Without bees, many fruits would not grow.' } },
  { kind: 'question', prompt: 'What is the main idea of the bee passage?', options: ['Bees like nectar', 'Bees help plants make seeds and fruit', 'Flowers are colorful'], answer: 1, explanation: 'Every detail points to one big idea: bees help plants reproduce.', skill: 'Main idea' },
  { kind: 'question', prompt: '“Owls hunt at night. Their big eyes see in the dark, and soft feathers let them fly silently.” What is this mostly about?', options: ['How owls are built to hunt at night', 'Why feathers are soft', 'What owls eat'], answer: 0, explanation: 'The eyes and feathers are details that explain night hunting.', skill: 'Main idea' }]

},
{
  lessonId: 'rd-2',
  steps: [
  { kind: 'concept', title: 'Be a detective', body: 'Writers don’t always say everything. Inference means using clues plus what you know to figure out what’s really happening.', visual: { type: 'passage', text: 'Maya grabbed her umbrella and pulled on her boots before heading out.', highlight: 'umbrella' } },
  { kind: 'explore', title: 'Find the clues', prompt: 'Tap the two words that tell you how Tom feels.', interaction: { type: 'wordTap', tokens: ['Tom', 'yawned', 'and', 'rubbed', 'his', 'eyes.'], targets: [1, 3] }, success: 'Yawning and rubbing eyes are clues: Tom is sleepy.' },
  { kind: 'question', prompt: 'Maya grabbed her umbrella and boots. What can you infer?', options: ['It is sunny', 'It is raining', 'She is going to swim'], answer: 1, explanation: 'Umbrellas and boots are clues that it is wet outside.', skill: 'Inference' },
  { kind: 'question', prompt: '“Sam’s face turned red and he looked at the floor after dropping the cake.” How does Sam feel?', options: ['Proud', 'Embarrassed', 'Hungry'], answer: 1, explanation: 'A red face and looking down are clues he feels embarrassed.', skill: 'Inference' }]

},
{
  lessonId: 'rd-3',
  steps: [
  { kind: 'concept', title: 'First, next, last', body: 'Signal words like first, then, next and finally show the order things happen in a story.', visual: { type: 'words', tokens: ['First', 'we', 'mixed', 'the', 'flour.', 'Then', 'we', 'baked', 'it.', 'Finally', 'we', 'ate!'], highlight: [0, 5, 9] } },
  { kind: 'question', prompt: 'Which word usually tells you something happens LAST?', options: ['First', 'Next', 'Finally'], answer: 2, explanation: '“Finally” signals the end of a sequence.', skill: 'Sequencing' },
  { kind: 'question', prompt: 'Put the plant’s life in order.', options: ['Flower → seed → sprout', 'Seed → sprout → flower', 'Sprout → flower → seed'], answer: 1, explanation: 'A seed sprouts, grows, then blooms into a flower.', skill: 'Sequencing' }]

},

/* ---------- Vocabulary ---------- */
{
  lessonId: 'voc-1',
  steps: [
  { kind: 'concept', title: 'Same meaning, new word', body: 'Synonyms are words that mean the same or almost the same thing. Using them makes your writing more interesting.', visual: { type: 'words', tokens: ['happy', '=', 'joyful', '=', 'cheerful'], highlight: [0, 2, 4] } },
  { kind: 'question', prompt: 'Which word is a synonym for “big”?', options: ['Tiny', 'Enormous', 'Quick'], answer: 1, explanation: 'Enormous means very big.', skill: 'Synonyms' },
  { kind: 'question', prompt: 'Which word means the same as “begin”?', options: ['Start', 'Finish', 'Pause'], answer: 0, explanation: 'To begin is to start.', skill: 'Synonyms' }]

},
{
  lessonId: 'voc-2',
  steps: [
  { kind: 'concept', title: 'Opposites attract', body: 'Antonyms are words with opposite meanings, like hot and cold or early and late.', visual: { type: 'words', tokens: ['hot', '↔', 'cold'], highlight: [0, 2] } },
  { kind: 'explore', title: 'Spot the opposites', prompt: 'Tap the two words that are antonyms.', interaction: { type: 'wordTap', tokens: ['The', 'hot', 'soup', 'cooled', 'in', 'the', 'cold', 'bowl.'], targets: [1, 6] }, success: 'Hot and cold are antonyms!' },
  { kind: 'question', prompt: 'What is the opposite of “ancient”?', options: ['Old', 'Modern', 'Broken'], answer: 1, explanation: 'Ancient means very old; modern means new.', skill: 'Antonyms' },
  { kind: 'question', prompt: 'Which word is an antonym of “brave”?', options: ['Fearful', 'Bold', 'Strong'], answer: 0, explanation: 'Brave means not afraid, so fearful is its opposite.', skill: 'Antonyms' }]

},
{
  lessonId: 'voc-3',
  steps: [
  { kind: 'concept', title: 'Let the sentence help', body: 'Context clues are words around a new word that hint at what it means.', visual: { type: 'passage', text: 'The arid desert had not seen a drop of rain for months.', highlight: 'had not seen a drop of rain' } },
  { kind: 'question', prompt: 'In “The arid desert had no rain for months”, arid means…', options: ['Very dry', 'Very cold', 'Very busy'], answer: 0, explanation: 'No rain for months is the clue — arid means very dry.', skill: 'Context clues' },
  { kind: 'question', prompt: '“The famished boy ate three plates of pasta.” Famished means…', options: ['Tired', 'Very hungry', 'Happy'], answer: 1, explanation: 'Eating three plates is a clue he was very hungry.', skill: 'Context clues' }]

},

/* ---------- Grammar ---------- */
{
  lessonId: 'gr-1',
  steps: [
  { kind: 'concept', title: 'Naming and doing words', body: 'Nouns name people, places or things. Verbs show actions. Here the nouns are highlighted.', visual: { type: 'words', tokens: ['The', 'dog', 'runs', 'in', 'the', 'park.'], highlight: [1, 5] } },
  { kind: 'explore', title: 'Find the action', prompt: 'Tap the verb in this sentence.', interaction: { type: 'wordTap', tokens: ['The', 'girl', 'kicks', 'the', 'ball.'], targets: [2] }, success: '“Kicks” is the action — it’s the verb.' },
  { kind: 'question', prompt: 'Which word is a noun?', options: ['Quickly', 'Teacher', 'Jump'], answer: 1, explanation: 'A teacher is a person, so it’s a noun.', skill: 'Nouns & verbs' }]

},
{
  lessonId: 'gr-2',
  steps: [
  { kind: 'concept', title: 'Describing words', body: 'Adjectives describe nouns. They tell us what kind, how many, or which one.', visual: { type: 'words', tokens: ['A', 'big', 'blue', 'whale'], highlight: [1, 2] } },
  { kind: 'explore', title: 'Spot the adjectives', prompt: 'Tap both adjectives.', interaction: { type: 'wordTap', tokens: ['A', 'tiny', 'red', 'bird', 'sang.'], targets: [1, 2] }, success: '“Tiny” and “red” describe the bird.' },
  { kind: 'question', prompt: 'In “The fluffy cat slept”, which word is the adjective?', options: ['Fluffy', 'Cat', 'Slept'], answer: 0, explanation: '“Fluffy” describes the cat.', skill: 'Adjectives' }]

},
{
  lessonId: 'gr-3',
  steps: [
  { kind: 'concept', title: 'Punctuation is a road sign', body: 'Capital letters start sentences. Full stops end statements, question marks end questions, and exclamation marks show strong feeling.', visual: { type: 'words', tokens: ['Where', 'is', 'my', 'hat?'], highlight: [0, 3] } },
  { kind: 'question', prompt: 'Which sentence is punctuated correctly?', options: ['where is the library?', 'Where is the library?', 'Where is the library.'], answer: 1, explanation: 'Capital letter to start, question mark to end a question.', skill: 'Punctuation' },
  { kind: 'question', prompt: 'Which mark ends an excited sentence?', options: ['!', '?', ','], answer: 0, explanation: 'The exclamation mark shows strong feeling, like “We won!”', skill: 'Punctuation' }]

}];