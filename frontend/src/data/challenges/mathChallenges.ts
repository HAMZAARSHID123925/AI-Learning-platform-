import type { ChallengeSet } from '@/types/learning';

export const mathChallenges: ChallengeSet[] = [
{
  courseId: 'g5-fractions',
  questions: [
  { id: 'fr-c1', kind: 'question', prompt: 'A pizza is cut into 8 equal slices. You eat 3. What fraction did you eat?', visual: { type: 'pizza', slices: 8, shaded: 3 }, options: ['3/8', '5/8', '8/3', '3/5'], answer: 0, explanation: '3 of 8 equal slices = 3/8.', skill: 'Basic fractions' },
  { id: 'fr-c2', kind: 'question', prompt: 'In the fraction 5/9, what is the denominator?', options: ['5', '9', '14', '4'], answer: 1, explanation: 'The denominator is the bottom number: 9.', skill: 'Basic fractions' },
  { id: 'fr-c3', kind: 'question', prompt: 'What fraction of the bar is shaded?', visual: { type: 'fractionBars', bars: [{ num: 2, den: 5 }] }, options: ['2/3', '3/5', '2/5', '5/2'], answer: 2, explanation: '2 of 5 equal parts are shaded.', skill: 'Basic fractions' },
  { id: 'fr-c4', kind: 'question', prompt: '1/2 = ?/10', options: ['2', '5', '10', '1'], answer: 1, explanation: 'Multiply top and bottom by 5: 1/2 = 5/10.', skill: 'Equivalent fractions' },
  { id: 'fr-c5', kind: 'question', prompt: 'Which fraction is NOT equal to 1/3?', options: ['2/6', '3/9', '3/6', '4/12'], answer: 2, explanation: '3/6 simplifies to 1/2, not 1/3.', skill: 'Equivalent fractions' },
  { id: 'fr-c6', kind: 'question', prompt: 'What is 6/8 in simplest form?', options: ['3/4', '2/3', '6/8', '1/2'], answer: 0, explanation: 'Divide top and bottom by 2: 6/8 = 3/4.', skill: 'Equivalent fractions', level: 'stretch' },
  { id: 'fr-c7', kind: 'question', prompt: 'Which fraction is the largest?', options: ['1/2', '2/3', '1/4', '3/5'], answer: 1, explanation: '2/3 ≈ 0.67 is bigger than 3/5 = 0.6, 1/2 and 1/4.', skill: 'Comparing fractions', level: 'stretch' },
  { id: 'fr-c8', kind: 'question', prompt: 'Choose the correct sign: 3/7 ☐ 5/7', options: ['<', '>', '='], answer: 0, explanation: 'Same denominator, 3 < 5, so 3/7 < 5/7.', skill: 'Comparing fractions' },
  { id: 'fr-c9', kind: 'question', prompt: 'What is 2/9 + 4/9?', options: ['6/18', '6/9', '8/9', '2/9'], answer: 1, explanation: 'Same denominator: 2 + 4 = 6, so 6/9.', skill: 'Adding fractions' },
  { id: 'fr-c10', kind: 'question', prompt: 'What is 1/4 + 1/2?', options: ['2/6', '2/4', '3/4', '1/8'], answer: 2, explanation: '1/2 = 2/4, and 1/4 + 2/4 = 3/4.', skill: 'Adding fractions', level: 'stretch' }]

},
{
  courseId: 'g5-decimals',
  questions: [
  { id: 'dec-c1', kind: 'question', prompt: 'What does 0.4 mean?', options: ['4 tenths', '4 hundredths', '4 ones', '40 tenths'], answer: 0, explanation: 'The first place after the point is tenths.', skill: 'Place value' },
  { id: 'dec-c2', kind: 'question', prompt: 'In 6.27, which digit is in the hundredths place?', options: ['6', '2', '7'], answer: 2, explanation: 'Hundredths is the second place after the point: 7.', skill: 'Place value' },
  { id: 'dec-c3', kind: 'question', prompt: '2 ones, 3 tenths and 5 hundredths is…', options: ['23.5', '2.35', '2.53', '235'], answer: 1, explanation: '2 + 0.3 + 0.05 = 2.35.', skill: 'Place value' },
  { id: 'dec-c4', kind: 'question', prompt: 'What is 7/10 as a decimal?', options: ['0.07', '7.0', '0.7', '0.17'], answer: 2, explanation: '7 tenths = 0.7.', skill: 'Decimals & fractions' },
  { id: 'dec-c5', kind: 'question', prompt: 'Which fraction equals 0.5?', options: ['1/5', '1/2', '5/100', '2/5'], answer: 1, explanation: '0.5 = 5/10 = 1/2.', skill: 'Decimals & fractions' },
  { id: 'dec-c6', kind: 'question', prompt: 'What decimal is shaded?', visual: { type: 'decimalGrid', shaded: 45 }, options: ['0.45', '4.5', '0.045', '45'], answer: 0, explanation: '45 of 100 squares = 0.45.', skill: 'Decimals & fractions' },
  { id: 'dec-c7', kind: 'question', prompt: 'Which decimal is the largest?', options: ['0.75', '0.8', '0.08', '0.7'], answer: 1, explanation: '0.8 has the most tenths (8).', skill: 'Comparing decimals' },
  { id: 'dec-c8', kind: 'question', prompt: 'Choose the correct sign: 0.3 ☐ 0.30', options: ['<', '>', '='], answer: 2, explanation: 'Adding a zero at the end doesn’t change the value.', skill: 'Comparing decimals', level: 'stretch' },
  { id: 'dec-c9', kind: 'question', prompt: 'Which is greater: 1.2 or 1.09?', options: ['1.2', '1.09', 'They are equal'], answer: 0, explanation: 'Compare tenths: 2 tenths beats 0 tenths.', skill: 'Comparing decimals', level: 'stretch' },
  { id: 'dec-c10', kind: 'question', prompt: 'What is 0.1 + 0.2?', options: ['0.12', '0.3', '3.0', '0.21'], answer: 1, explanation: '1 tenth + 2 tenths = 3 tenths.', skill: 'Place value' }]

},
{
  courseId: 'g5-geometry',
  questions: [
  { id: 'geo-c1', kind: 'question', prompt: 'How many sides does a pentagon have?', visual: { type: 'shapes', items: [{ shape: 'pentagon' }] }, options: ['4', '5', '6'], answer: 1, explanation: '“Penta” means five.', skill: 'Shapes & sides' },
  { id: 'geo-c2', kind: 'question', prompt: 'A shape with 4 equal sides and 4 right angles is a…', options: ['Rectangle', 'Square', 'Triangle'], answer: 1, explanation: 'Only a square has 4 equal sides and 4 right angles.', skill: 'Shapes & sides' },
  { id: 'geo-c3', kind: 'question', prompt: 'How many sides does an octagon have?', visual: { type: 'shapes', items: [{ shape: 'octagon' }] }, options: ['6', '7', '8'], answer: 2, explanation: '“Octo” means eight, like an octopus.', skill: 'Shapes & sides' },
  { id: 'geo-c4', kind: 'question', prompt: 'How many degrees is a right angle?', options: ['45°', '90°', '180°'], answer: 1, explanation: 'A right angle is exactly 90°.', skill: 'Angles' },
  { id: 'geo-c5', kind: 'question', prompt: 'An angle bigger than 90° but less than 180° is…', options: ['Acute', 'Obtuse', 'Right'], answer: 1, explanation: 'Obtuse angles are wider than a right angle.', skill: 'Angles' },
  { id: 'geo-c6', kind: 'question', prompt: 'The angles inside any triangle add up to…', options: ['90°', '180°', '360°'], answer: 1, explanation: 'Every triangle’s angles total 180°.', skill: 'Angles', level: 'stretch' },
  { id: 'geo-c7', kind: 'question', prompt: 'A triangle has sides 3 cm, 4 cm and 5 cm. Perimeter?', options: ['12 cm', '60 cm', '9 cm'], answer: 0, explanation: '3 + 4 + 5 = 12 cm.', skill: 'Perimeter' },
  { id: 'geo-c8', kind: 'question', prompt: 'A square has sides of 7 cm. Perimeter?', options: ['14 cm', '28 cm', '49 cm'], answer: 1, explanation: '4 × 7 = 28 cm.', skill: 'Perimeter' },
  { id: 'geo-c9', kind: 'question', prompt: 'A rectangle is 8 cm long and 2 cm wide. Perimeter?', options: ['10 cm', '16 cm', '20 cm'], answer: 2, explanation: '8 + 2 + 8 + 2 = 20 cm.', skill: 'Perimeter' },
  { id: 'geo-c10', kind: 'question', prompt: 'A square’s perimeter is 36 cm. How long is one side?', options: ['6 cm', '9 cm', '12 cm'], answer: 1, explanation: '36 ÷ 4 = 9 cm.', skill: 'Perimeter', level: 'stretch' }]

},
{
  courseId: 'g5-algebra',
  questions: [
  { id: 'alg-c1', kind: 'question', prompt: 'x + 6 = 10. What is x?', visual: { type: 'balance', left: 'x + 6', right: '10' }, options: ['4', '6', '16'], answer: 0, explanation: '10 − 6 = 4.', skill: 'Unknowns' },
  { id: 'alg-c2', kind: 'question', prompt: 'n − 3 = 9. What is n?', options: ['6', '12', '27'], answer: 1, explanation: '9 + 3 = 12.', skill: 'Unknowns' },
  { id: 'alg-c3', kind: 'question', prompt: 'x + x = 12. What is x?', options: ['6', '10', '24'], answer: 0, explanation: 'Two equal parts make 12, so each is 6.', skill: 'Unknowns' },
  { id: 'alg-c4', kind: 'question', prompt: 'What comes next? 2, 4, 6, 8, …', options: ['9', '10', '12'], answer: 1, explanation: 'Add 2 each time.', skill: 'Patterns' },
  { id: 'alg-c5', kind: 'question', prompt: 'What is the rule? 7, 14, 21, 28', options: ['Add 7', 'Double it', 'Add 14'], answer: 0, explanation: 'Each number is 7 more than the last.', skill: 'Patterns' },
  { id: 'alg-c6', kind: 'question', prompt: 'What comes next? 50, 45, 40, …', options: ['30', '35', '45'], answer: 1, explanation: 'Subtract 5 each time.', skill: 'Patterns' },
  { id: 'alg-c7', kind: 'question', prompt: 'What comes next? 1, 4, 9, 16, …', options: ['20', '25', '32'], answer: 1, explanation: 'These are square numbers: 5 × 5 = 25.', skill: 'Patterns', level: 'stretch' },
  { id: 'alg-c8', kind: 'question', prompt: '4 × m = 20. What is m?', options: ['4', '5', '16'], answer: 1, explanation: '20 ÷ 4 = 5.', skill: 'Equations' },
  { id: 'alg-c9', kind: 'question', prompt: '15 ÷ k = 3. What is k?', options: ['3', '5', '45'], answer: 1, explanation: '15 ÷ 5 = 3.', skill: 'Equations' },
  { id: 'alg-c10', kind: 'question', prompt: '3 × □ + 2 = 14. What goes in the box?', options: ['3', '4', '5'], answer: 1, explanation: '14 − 2 = 12, and 12 ÷ 3 = 4.', skill: 'Equations', level: 'stretch' }]

}];