import type { LessonContent } from '@/types/learning';

export const scienceLessons: LessonContent[] = [
/* ---------- Plants & Animals ---------- */
{
  lessonId: 'pa-1',
  steps: [
  { kind: 'concept', title: 'Every living thing has needs', body: 'Plants and animals need energy, water and air to survive. Plants get energy from sunlight; animals get it from food.', visual: { type: 'flow', nodes: [{ icon: 'sun', label: 'Sunlight' }, { icon: 'water', label: 'Water' }, { icon: 'air', label: 'Air' }, { icon: 'food', label: 'Food' }] } },
  { kind: 'question', prompt: 'Which of these is a living thing?', options: ['A rock', 'A tree', 'A cloud'], answer: 1, explanation: 'A tree grows, takes in water and needs energy — it is alive.', skill: 'Living things' },
  { kind: 'question', prompt: 'Where do animals get their energy from?', options: ['Sunlight directly', 'Food they eat', 'The soil'], answer: 1, explanation: 'Animals can’t make their own food, so they eat plants or other animals.', skill: 'Living things' }]

},
{
  lessonId: 'pa-2',
  steps: [
  { kind: 'concept', title: 'Who eats whom?', body: 'A food chain shows how energy passes from one living thing to the next. It always starts with the sun and a plant.', visual: { type: 'flow', nodes: [{ icon: 'sun', label: 'Sun' }, { icon: 'sprout', label: 'Grass' }, { icon: 'rabbit', label: 'Rabbit' }, { icon: 'bird', label: 'Hawk' }] } },
  { kind: 'explore', title: 'Follow the energy', prompt: 'Tap each link in the chain to see its role.', interaction: { type: 'flowReveal', nodes: [{ icon: 'sun', label: 'Sun', detail: 'Gives light energy' }, { icon: 'sprout', label: 'Grass', detail: 'Producer: makes food' }, { icon: 'rabbit', label: 'Rabbit', detail: 'Consumer: eats plants' }, { icon: 'bird', label: 'Hawk', detail: 'Predator: eats rabbits' }] }, success: 'Energy flows sun → producer → consumers.' },
  { kind: 'question', prompt: 'In grass → rabbit → hawk, which is the producer?', options: ['Grass', 'Rabbit', 'Hawk'], answer: 0, explanation: 'Producers make their own food using sunlight. That’s the grass.', skill: 'Food chains' },
  { kind: 'question', prompt: 'Which animal is the predator in this chain?', visual: { type: 'flow', nodes: [{ icon: 'sprout', label: 'Grass' }, { icon: 'rabbit', label: 'Rabbit' }, { icon: 'bird', label: 'Hawk' }] }, options: ['Grass', 'Rabbit', 'Hawk'], answer: 2, explanation: 'The hawk hunts and eats the rabbit, so it is the predator.', skill: 'Food chains' }]

},
{
  lessonId: 'pa-3',
  steps: [
  { kind: 'concept', title: 'A home that fits', body: 'A habitat is the natural home of a living thing. Animals have special features that help them survive in their habitat.', visual: { type: 'flow', nodes: [{ icon: 'mountain', label: 'Desert' }, { icon: 'waves', label: 'Ocean' }, { icon: 'tree', label: 'Forest' }, { icon: 'snowflake', label: 'Arctic' }] } },
  { kind: 'question', prompt: 'How do a camel’s humps help it live in the desert?', options: ['They keep it cool', 'They store fat for energy', 'They help it swim'], answer: 1, explanation: 'Camels store fat in their humps and use it when food is scarce.', skill: 'Habitats' },
  { kind: 'question', prompt: 'Where do polar bears live?', options: ['The Arctic', 'The desert', 'The rainforest'], answer: 0, explanation: 'Polar bears have thick fur and fat to survive the freezing Arctic.', skill: 'Habitats' }]

},

/* ---------- Photosynthesis ---------- */
{
  lessonId: 'ps-1',
  steps: [
  { kind: 'concept', title: 'Plants are food factories', body: 'Plants use sunlight, water and carbon dioxide to make their own food (sugar). They release oxygen as a bonus.', visual: { type: 'flow', nodes: [{ icon: 'sun', label: 'Sunlight' }, { icon: 'water', label: 'Water' }, { icon: 'air', label: 'Carbon dioxide' }, { icon: 'leaf', label: 'Sugar + oxygen' }] } },
  { kind: 'explore', title: 'Build the recipe', prompt: 'Tap each ingredient to see where it comes from.', interaction: { type: 'flowReveal', nodes: [{ icon: 'sun', label: 'Sunlight', detail: 'Caught by the leaves' }, { icon: 'water', label: 'Water', detail: 'Pulled up by the roots' }, { icon: 'air', label: 'Carbon dioxide', detail: 'Taken in from the air' }, { icon: 'leaf', label: 'Sugar', detail: 'Food made in the leaf' }] }, success: 'Sunlight + water + carbon dioxide → sugar + oxygen.' },
  { kind: 'question', prompt: 'Which gas do plants take in to make food?', options: ['Oxygen', 'Carbon dioxide', 'Helium'], answer: 1, explanation: 'Plants absorb carbon dioxide from the air through tiny holes in their leaves.', skill: 'Ingredients' }]

},
{
  lessonId: 'ps-2',
  steps: [
  { kind: 'concept', title: 'Every part has a job', body: 'Roots drink water, the stem carries it up, and leaves catch sunlight to make food. Flowers help make seeds.', visual: { type: 'flow', nodes: [{ icon: 'sprout', label: 'Roots' }, { icon: 'tree', label: 'Stem' }, { icon: 'leaf', label: 'Leaves' }, { icon: 'flower', label: 'Flower' }] } },
  { kind: 'question', prompt: 'Which part of a plant absorbs water from the soil?', options: ['Leaves', 'Roots', 'Flower'], answer: 1, explanation: 'Roots soak up water and minerals from the soil.', skill: 'Plant parts' },
  { kind: 'question', prompt: 'Where does most photosynthesis happen?', options: ['In the leaves', 'In the roots', 'In the seeds'], answer: 0, explanation: 'Leaves are wide and flat to catch as much sunlight as possible.', skill: 'Plant parts' }]

},
{
  lessonId: 'ps-3',
  steps: [
  { kind: 'concept', title: 'Why we need plants', body: 'The oxygen plants release is the air we breathe. Plants are also the first link in almost every food chain.', visual: { type: 'flow', nodes: [{ icon: 'leaf', label: 'Plant' }, { icon: 'air', label: 'Oxygen' }, { icon: 'heart', label: 'People & animals' }] } },
  { kind: 'question', prompt: 'Which gas do plants give off during photosynthesis?', options: ['Oxygen', 'Carbon dioxide', 'Steam'], answer: 0, explanation: 'Oxygen is released into the air — we breathe it in.', skill: 'Oxygen & energy' },
  { kind: 'question', prompt: 'What is the green substance in leaves that catches sunlight?', options: ['Chlorophyll', 'Nectar', 'Pollen'], answer: 0, explanation: 'Chlorophyll gives leaves their green color and traps light energy.', skill: 'Oxygen & energy', level: 'stretch' }]

},

/* ---------- Human Body ---------- */
{
  lessonId: 'hb-1',
  steps: [
  { kind: 'concept', title: 'Meet your organs', body: 'Organs are body parts with special jobs. Your heart pumps, your lungs breathe, your brain thinks and your stomach digests.', visual: { type: 'flow', nodes: [{ icon: 'heart', label: 'Heart' }, { icon: 'air', label: 'Lungs' }, { icon: 'brain', label: 'Brain' }, { icon: 'food', label: 'Stomach' }] } },
  { kind: 'question', prompt: 'Which organ pumps blood around your body?', options: ['Lungs', 'Heart', 'Brain'], answer: 1, explanation: 'Your heart is a strong muscle that pumps blood all day and night.', skill: 'Organs' },
  { kind: 'question', prompt: 'Which organs help you breathe?', options: ['Lungs', 'Kidneys', 'Stomach'], answer: 0, explanation: 'Lungs take in oxygen and push out carbon dioxide.', skill: 'Organs' }]

},
{
  lessonId: 'hb-2',
  steps: [
  { kind: 'concept', title: 'Organs work in teams', body: 'A body system is a team of organs working together. The digestive system breaks food into energy.', visual: { type: 'flow', nodes: [{ icon: 'apple', label: 'Mouth' }, { icon: 'food', label: 'Stomach' }, { icon: 'repeat', label: 'Intestines' }, { icon: 'run', label: 'Energy' }] } },
  { kind: 'explore', title: 'Journey of a snack', prompt: 'Tap each stop to follow an apple through your body.', interaction: { type: 'flowReveal', nodes: [{ icon: 'apple', label: 'Mouth', detail: 'Teeth chew it up' }, { icon: 'food', label: 'Stomach', detail: 'Juices break it down' }, { icon: 'repeat', label: 'Intestines', detail: 'Nutrients are absorbed' }, { icon: 'run', label: 'Energy', detail: 'You can run and play!' }] }, success: 'That’s the digestive system at work.' },
  { kind: 'question', prompt: 'Your bones make up which system?', options: ['Skeletal system', 'Digestive system', 'Nervous system'], answer: 0, explanation: 'The skeletal system supports and protects your body.', skill: 'Body systems' },
  { kind: 'question', prompt: 'Blood travels around the body through…', options: ['Nerves', 'Blood vessels', 'Muscles'], answer: 1, explanation: 'Arteries and veins are blood vessels — the body’s highways.', skill: 'Body systems' }]

},
{
  lessonId: 'hb-3',
  steps: [
  { kind: 'concept', title: 'Habits that help', body: 'Sleep, movement, water and good food keep every body system strong.', visual: { type: 'flow', nodes: [{ icon: 'moon', label: 'Sleep' }, { icon: 'run', label: 'Exercise' }, { icon: 'water', label: 'Water' }, { icon: 'apple', label: 'Healthy food' }] } },
  { kind: 'question', prompt: 'How much sleep do most 10-year-olds need each night?', options: ['4–5 hours', '9–11 hours', '14–16 hours'], answer: 1, explanation: 'Growing bodies need about 9 to 11 hours of sleep.', skill: 'Healthy habits' },
  { kind: 'question', prompt: 'Which is the healthiest snack?', options: ['A candy bar', 'An apple', 'Chips'], answer: 1, explanation: 'Fruit gives vitamins, fibre and natural energy.', skill: 'Healthy habits' }]

}];