import type { ChallengeSet } from '@/types/student/learning';

export const scienceChallenges: ChallengeSet[] = [
{
  courseId: 'g5-plants-animals',
  questions: [
  { id: 'pa-c1', kind: 'question', prompt: 'Which of these is NOT a living thing?', options: ['A mushroom', 'A stone', 'A worm'], answer: 1, explanation: 'Stones don’t grow, eat or breathe.', skill: 'Living things' },
  { id: 'pa-c2', kind: 'question', prompt: 'What do plants use to make their own food?', options: ['Sunlight', 'Meat', 'Sand'], answer: 0, explanation: 'Plants capture sunlight to make food.', skill: 'Living things' },
  { id: 'pa-c3', kind: 'question', prompt: 'All living things need…', options: ['Water', 'Toys', 'Electricity'], answer: 0, explanation: 'Every living thing needs water to survive.', skill: 'Living things' },
  { id: 'pa-c4', kind: 'question', prompt: 'What does a food chain always start with?', options: ['A predator', 'The sun and a plant', 'An insect'], answer: 1, explanation: 'Energy begins with the sun, captured by plants.', skill: 'Food chains' },
  { id: 'pa-c5', kind: 'question', prompt: 'In grass → grasshopper → frog → snake, what does the frog eat?', visual: { type: 'flow', nodes: [{ icon: 'sprout', label: 'Grass' }, { icon: 'bird', label: 'Grasshopper' }, { icon: 'fish', label: 'Frog' }, { icon: 'rabbit', label: 'Snake' }] }, options: ['Grass', 'Grasshopper', 'Snake'], answer: 1, explanation: 'Each arrow points to the eater — the frog eats the grasshopper.', skill: 'Food chains' },
  { id: 'pa-c6', kind: 'question', prompt: 'An animal that eats only plants is a…', options: ['Carnivore', 'Herbivore', 'Predator'], answer: 1, explanation: 'Herbivores eat plants, like rabbits and cows.', skill: 'Food chains' },
  { id: 'pa-c7', kind: 'question', prompt: 'If all the rabbits disappeared, what would happen to the foxes?', options: ['They’d have more food', 'They’d have less food', 'Nothing'], answer: 1, explanation: 'Foxes eat rabbits, so their food supply would shrink.', skill: 'Food chains', level: 'stretch' },
  { id: 'pa-c8', kind: 'question', prompt: 'A habitat is…', options: ['An animal’s natural home', 'A type of food', 'A kind of weather'], answer: 0, explanation: 'A habitat provides food, water and shelter.', skill: 'Habitats' },
  { id: 'pa-c9', kind: 'question', prompt: 'Why do fish have gills?', options: ['To breathe underwater', 'To swim faster', 'To see in the dark'], answer: 0, explanation: 'Gills take oxygen from the water.', skill: 'Habitats' },
  { id: 'pa-c10', kind: 'question', prompt: 'Why is a cactus good at living in the desert?', options: ['It stores water in its stem', 'It has big soft leaves', 'It needs lots of rain'], answer: 0, explanation: 'Cacti store water and have spines instead of leaves to save water.', skill: 'Habitats', level: 'stretch' }]

},
{
  courseId: 'g5-photosynthesis',
  questions: [
  { id: 'ps-c1', kind: 'question', prompt: 'What do plants need for photosynthesis?', options: ['Sunlight, water, carbon dioxide', 'Soil, sugar, oxygen', 'Wind, rocks, rain'], answer: 0, explanation: 'Those three ingredients make sugar and oxygen.', skill: 'Ingredients' },
  { id: 'ps-c2', kind: 'question', prompt: 'What energy source powers photosynthesis?', options: ['Sunlight', 'Moonlight', 'Heat from soil'], answer: 0, explanation: 'Light energy from the sun drives the process.', skill: 'Ingredients' },
  { id: 'ps-c3', kind: 'question', prompt: 'What food does a plant make?', options: ['Salt', 'Sugar', 'Protein'], answer: 1, explanation: 'Plants make a sugar called glucose.', skill: 'Ingredients' },
  { id: 'ps-c4', kind: 'question', prompt: 'Which part carries water from the roots to the leaves?', options: ['Stem', 'Flower', 'Seed'], answer: 0, explanation: 'The stem works like a straw.', skill: 'Plant parts' },
  { id: 'ps-c5', kind: 'question', prompt: 'Which plant part catches the most sunlight?', options: ['Roots', 'Leaves', 'Bark'], answer: 1, explanation: 'Leaves are wide and flat to catch light.', skill: 'Plant parts' },
  { id: 'ps-c6', kind: 'question', prompt: 'What is the main job of roots?', options: ['Make seeds', 'Absorb water and hold the plant', 'Catch sunlight'], answer: 1, explanation: 'Roots anchor the plant and drink water.', skill: 'Plant parts' },
  { id: 'ps-c7', kind: 'question', prompt: 'Which gas do plants release?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen'], answer: 0, explanation: 'Oxygen is released for us to breathe.', skill: 'Oxygen & energy' },
  { id: 'ps-c8', kind: 'question', prompt: 'What makes leaves green?', options: ['Chlorophyll', 'Water', 'Sugar'], answer: 0, explanation: 'Chlorophyll is the green pigment that traps light.', skill: 'Oxygen & energy' },
  { id: 'ps-c9', kind: 'question', prompt: 'A plant kept in a dark cupboard for weeks will likely…', options: ['Grow faster', 'Turn pale and weak', 'Make more oxygen'], answer: 1, explanation: 'Without light it can’t make food.', skill: 'Oxygen & energy', level: 'stretch' },
  { id: 'ps-c10', kind: 'question', prompt: 'Why are plants important to animals?', options: ['They make oxygen and food', 'They make noise', 'They keep animals warm'], answer: 0, explanation: 'Plants start food chains and refresh our air.', skill: 'Oxygen & energy', level: 'stretch' }]

},
{
  courseId: 'g5-human-body',
  questions: [
  { id: 'hb-c1', kind: 'question', prompt: 'Which organ controls your thoughts and movements?', options: ['Heart', 'Brain', 'Stomach'], answer: 1, explanation: 'The brain is your body’s control center.', skill: 'Organs' },
  { id: 'hb-c2', kind: 'question', prompt: 'Which organ pumps blood?', options: ['Heart', 'Lungs', 'Liver'], answer: 0, explanation: 'The heart pumps blood all around the body.', skill: 'Organs' },
  { id: 'hb-c3', kind: 'question', prompt: 'Where does food go right after you swallow?', options: ['Lungs', 'Stomach', 'Brain'], answer: 1, explanation: 'Food travels down to the stomach.', skill: 'Organs' },
  { id: 'hb-c4', kind: 'question', prompt: 'Which system breaks down food?', options: ['Digestive', 'Skeletal', 'Nervous'], answer: 0, explanation: 'The digestive system turns food into energy.', skill: 'Body systems' },
  { id: 'hb-c5', kind: 'question', prompt: 'Your skeleton protects your organs. Which bone protects your brain?', options: ['Ribs', 'Skull', 'Spine'], answer: 1, explanation: 'The skull is a hard helmet for your brain.', skill: 'Body systems' },
  { id: 'hb-c6', kind: 'question', prompt: 'Which system carries messages from your brain?', options: ['Nervous system', 'Digestive system', 'Muscles'], answer: 0, explanation: 'Nerves send signals between the brain and body.', skill: 'Body systems' },
  { id: 'hb-c7', kind: 'question', prompt: 'Why does your heart beat faster when you run?', options: ['To send more oxygen to muscles', 'Because it is scared', 'To digest food'], answer: 0, explanation: 'Working muscles need more oxygen-rich blood.', skill: 'Body systems', level: 'stretch' },
  { id: 'hb-c8', kind: 'question', prompt: 'How much water should you drink?', options: ['Only when very thirsty', 'Several glasses every day', 'None if you drink juice'], answer: 1, explanation: 'Your body needs water all day long.', skill: 'Healthy habits' },
  { id: 'hb-c9', kind: 'question', prompt: 'Which habit helps your muscles and heart?', options: ['Daily exercise', 'Skipping breakfast', 'Staying up late'], answer: 0, explanation: 'Moving every day keeps muscles and heart strong.', skill: 'Healthy habits' },
  { id: 'hb-c10', kind: 'question', prompt: 'Why is washing your hands important?', options: ['It removes germs', 'It makes hands stronger', 'It helps you grow'], answer: 0, explanation: 'Soap washes away germs that can make you sick.', skill: 'Healthy habits' }]

}];