import type { LessonContent } from '@/types/learning';

export const mathLessons: LessonContent[] = [
/* ---------- Fractions ---------- */
{
  lessonId: 'fr-1',
  steps: [
  { kind: 'concept', title: 'A fraction is a piece of a whole', body: 'When you cut something into equal parts, each part is a fraction of the whole. This pizza is cut into 8 equal slices.', visual: { type: 'pizza', slices: 8, shaded: 0 } },
  { kind: 'question', prompt: 'This pizza is cut into 4 equal slices. What fraction represents one part?', visual: { type: 'pizza', slices: 4, shaded: 1 }, options: ['1/4', '4/1', '1/3', '3/4'], answer: 0, explanation: 'There are 4 equal parts and we’re looking at 1 of them, so one part is 1/4. The bottom number counts the parts; the top number counts the ones we pick.', skill: 'Basic fractions' },
  { kind: 'concept', title: 'Top and bottom numbers', body: 'The bottom number (denominator) tells how many equal parts the whole has. The top number (numerator) tells how many parts we are talking about.', visual: { type: 'fractionBars', bars: [{ num: 3, den: 5 }] } },
  { kind: 'explore', title: 'Your turn: slice it', prompt: 'Tap the slices to shade exactly 3/8 of the pizza.', interaction: { type: 'pizzaShade', slices: 8, target: 3 }, success: 'Nice! 3 out of 8 equal slices is 3/8.' },
  { kind: 'question', prompt: 'What fraction of this pizza is shaded?', visual: { type: 'pizza', slices: 6, shaded: 5 }, options: ['1/6', '5/6', '6/5', '5/1'], answer: 1, explanation: '5 of the 6 equal slices are shaded, so the fraction is 5/6.', skill: 'Basic fractions' }]

},
{
  lessonId: 'fr-2',
  steps: [
  { kind: 'concept', title: 'Different names, same amount', body: 'These bars are all the same length. 1/2, 2/4 and 4/8 cover exactly the same amount — they are equivalent fractions.', visual: { type: 'fractionBars', bars: [{ num: 1, den: 2 }, { num: 2, den: 4 }, { num: 4, den: 8 }] } },
  { kind: 'explore', title: 'Find the halfway point', prompt: 'Slide the marker to the eighth that is equal to 1/2.', interaction: { type: 'numberLineSlide', min: 0, max: 1, step: 0.125, target: 0.5, labelAs: 'fraction', den: 8 }, success: '4/8 sits exactly at 1/2 — they’re equivalent!' },
  { kind: 'question', prompt: 'Which fraction is equivalent to 2/3?', options: ['3/4', '4/6', '2/6', '3/2'], answer: 1, explanation: 'Multiply the top and bottom of 2/3 by 2 and you get 4/6. Same amount, smaller pieces.', skill: 'Equivalent fractions' },
  { kind: 'question', prompt: 'Look at the bars. Are 3/4 and 6/8 equal?', visual: { type: 'fractionBars', bars: [{ num: 3, den: 4 }, { num: 6, den: 8 }] }, options: ['Yes, they are equal', 'No, 3/4 is bigger', 'No, 6/8 is bigger'], answer: 0, explanation: 'Both bars are shaded to the same point. 3/4 × 2/2 = 6/8.', skill: 'Equivalent fractions' }]

},
{
  lessonId: 'fr-3',
  steps: [
  { kind: 'concept', title: 'More pieces, smaller pieces', body: 'When the top numbers are the same, the fraction with the bigger bottom number is smaller — because the whole is cut into more pieces.', visual: { type: 'fractionBars', bars: [{ num: 1, den: 3 }, { num: 1, den: 5 }] } },
  { kind: 'question', prompt: 'Which is bigger?', visual: { type: 'fractionBars', bars: [{ num: 3, den: 4 }, { num: 2, den: 4 }] }, options: ['3/4', '2/4', 'They are equal'], answer: 0, explanation: 'Same-sized pieces (quarters), and 3 pieces is more than 2 pieces.', skill: 'Comparing fractions' },
  { kind: 'question', prompt: 'Which is larger: 1/2 or 1/3?', options: ['1/2', '1/3', 'They are equal'], answer: 0, explanation: 'Halves are bigger than thirds. Splitting into fewer parts makes each part larger.', skill: 'Comparing fractions' },
  { kind: 'question', prompt: 'Which is larger: 5/8 or 3/4?', visual: { type: 'fractionBars', bars: [{ num: 5, den: 8 }, { num: 6, den: 8 }] }, options: ['5/8', '3/4', 'They are equal'], answer: 1, explanation: '3/4 is the same as 6/8, and 6/8 is more than 5/8.', skill: 'Comparing fractions', level: 'stretch' }]

},
{
  lessonId: 'fr-4',
  steps: [
  { kind: 'concept', title: 'Adding same-sized pieces', body: 'When the bottom numbers match, just add the top numbers. 1/5 + 2/5 = 3/5 — the size of each piece stays the same.', visual: { type: 'fractionBars', bars: [{ num: 1, den: 5 }, { num: 2, den: 5 }, { num: 3, den: 5 }] } },
  { kind: 'explore', title: 'Pizza party', prompt: 'Ali ate 2/6 and Sara ate 3/6. Shade how much they ate together.', interaction: { type: 'pizzaShade', slices: 6, target: 5 }, success: '2/6 + 3/6 = 5/6. Only one slice left!' },
  { kind: 'question', prompt: 'What is 1/4 + 2/4?', options: ['3/8', '3/4', '2/4', '1/2'], answer: 1, explanation: 'The pieces are quarters, so add the tops: 1 + 2 = 3. The answer is 3/4.', skill: 'Adding fractions' },
  { kind: 'question', prompt: 'What is 3/8 + 1/8 in simplest form?', options: ['4/16', '1/2', '4/8', '3/4'], answer: 1, explanation: '3/8 + 1/8 = 4/8, and 4/8 simplifies to 1/2.', skill: 'Adding fractions', level: 'stretch' }]

},

/* ---------- Decimals ---------- */
{
  lessonId: 'dec-1',
  steps: [
  { kind: 'concept', title: 'A hundred tiny squares', body: 'This grid is one whole cut into 100 squares. Each column is one tenth (0.1). Here, 30 hundredths are shaded — that’s 0.30, or 0.3.', visual: { type: 'decimalGrid', shaded: 30 } },
  { kind: 'explore', title: 'Shade a decimal', prompt: 'Use the slider to shade exactly 0.45 of the grid.', interaction: { type: 'gridShade', target: 45 }, success: '45 hundredths = 4 tenths and 5 hundredths = 0.45.' },
  { kind: 'question', prompt: 'What decimal is shaded?', visual: { type: 'decimalGrid', shaded: 70 }, options: ['0.07', '0.7', '7', '70'], answer: 1, explanation: '70 of 100 squares are shaded: 7 full columns = 7 tenths = 0.7.', skill: 'Place value' },
  { kind: 'question', prompt: 'In 3.58, which digit is in the tenths place?', options: ['3', '5', '8'], answer: 1, explanation: 'The first digit after the decimal point is tenths. In 3.58 that’s 5.', skill: 'Place value' }]

},
{
  lessonId: 'dec-2',
  steps: [
  { kind: 'concept', title: 'Decimals are fractions too', body: '0.5 means 5 tenths — that’s 5/10, which is the same as 1/2. It sits exactly halfway between 0 and 1.', visual: { type: 'numberLine', min: 0, max: 1, step: 0.1, labelAs: 'decimal', marks: [0.5] } },
  { kind: 'explore', title: 'Find 0.7', prompt: 'Slide the marker to 0.7 on the number line.', interaction: { type: 'numberLineSlide', min: 0, max: 1, step: 0.1, target: 0.7, labelAs: 'decimal' }, success: '0.7 is 7 tenths — 7/10 of the way to 1.' },
  { kind: 'question', prompt: 'Which fraction equals 0.25?', options: ['1/4', '2/5', '1/25', '25/10'], answer: 0, explanation: '0.25 = 25/100, and 25/100 simplifies to 1/4.', skill: 'Decimals & fractions' },
  { kind: 'question', prompt: 'Which decimal equals 3/10?', options: ['0.03', '3.0', '0.3', '0.13'], answer: 2, explanation: '3 tenths is written 0.3.', skill: 'Decimals & fractions' }]

},
{
  lessonId: 'dec-3',
  steps: [
  { kind: 'concept', title: 'Compare place by place', body: 'Line up the decimal points, then compare digits from left to right. The first place that differs decides which is bigger.', visual: { type: 'numberLine', min: 0, max: 1, step: 0.1, labelAs: 'decimal', marks: [0.45, 0.6] } },
  { kind: 'question', prompt: 'Which is greater: 0.6 or 0.45?', options: ['0.6', '0.45', 'They are equal'], answer: 0, explanation: 'Compare tenths first: 6 tenths beats 4 tenths, so 0.6 is greater.', skill: 'Comparing decimals' },
  { kind: 'question', prompt: 'Which list is ordered from smallest to largest?', options: ['0.9, 0.19, 0.09', '0.09, 0.19, 0.9', '0.19, 0.09, 0.9'], answer: 1, explanation: '0.09 has 0 tenths, 0.19 has 1 tenth, 0.9 has 9 tenths.', skill: 'Comparing decimals' }]

},

/* ---------- Geometry ---------- */
{
  lessonId: 'geo-1',
  steps: [
  { kind: 'concept', title: 'What is a polygon?', body: 'A polygon is a flat, closed shape made only of straight sides. It is named by how many sides it has.', visual: { type: 'shapes', items: [{ shape: 'triangle', label: '3 sides' }, { shape: 'square', label: '4 sides' }, { shape: 'pentagon', label: '5 sides' }, { shape: 'hexagon', label: '6 sides' }] } },
  { kind: 'question', prompt: 'How many sides does this shape have?', visual: { type: 'shapes', items: [{ shape: 'hexagon' }] }, options: ['5', '6', '8'], answer: 1, explanation: 'This is a hexagon — it has 6 straight sides.', skill: 'Shapes & sides' },
  { kind: 'question', prompt: 'Which of these is NOT a polygon?', visual: { type: 'shapes', items: [{ shape: 'triangle' }, { shape: 'circle' }, { shape: 'square' }] }, options: ['Triangle', 'Circle', 'Square'], answer: 1, explanation: 'A circle has a curved edge and no straight sides, so it is not a polygon.', skill: 'Shapes & sides' }]

},
{
  lessonId: 'geo-2',
  steps: [
  { kind: 'concept', title: 'The right angle', body: 'A right angle measures 90° — like the corner of a book. Angles smaller than 90° are acute; bigger ones are obtuse.', visual: { type: 'shapes', items: [{ shape: 'rightAngle', label: '90°' }] } },
  { kind: 'question', prompt: 'An angle smaller than 90° is called…', options: ['Obtuse', 'Acute', 'Straight'], answer: 1, explanation: 'Acute angles are “sharp” — less than a right angle.', skill: 'Angles' },
  { kind: 'question', prompt: 'How many right angles does a rectangle have?', visual: { type: 'shapes', items: [{ shape: 'rectangle' }] }, options: ['2', '3', '4'], answer: 2, explanation: 'Every corner of a rectangle is a right angle — 4 in total.', skill: 'Angles' }]

},
{
  lessonId: 'geo-3',
  steps: [
  { kind: 'concept', title: 'Walk around the edge', body: 'Perimeter is the total distance around a shape. Add up the lengths of every side.', visual: { type: 'shapes', items: [{ shape: 'rectangle', label: '6 cm × 4 cm' }] } },
  { kind: 'question', prompt: 'What is the perimeter of a 6 cm × 4 cm rectangle?', options: ['10 cm', '20 cm', '24 cm'], answer: 1, explanation: '6 + 4 + 6 + 4 = 20 cm.', skill: 'Perimeter' },
  { kind: 'question', prompt: 'A square has sides of 5 cm. What is its perimeter?', visual: { type: 'shapes', items: [{ shape: 'square', label: '5 cm' }] }, options: ['20 cm', '25 cm', '10 cm'], answer: 0, explanation: '4 equal sides × 5 cm = 20 cm.', skill: 'Perimeter' }]

},

/* ---------- Basic Algebra ---------- */
{
  lessonId: 'alg-1',
  steps: [
  { kind: 'concept', title: 'Keep it balanced', body: 'An equation is like a balance scale. Both sides must weigh the same. The letter x stands for a mystery number.', visual: { type: 'balance', left: 'x + 3', right: '7' } },
  { kind: 'explore', title: 'Balance the scale', prompt: 'Slide to choose x so that x + 3 balances 7.', interaction: { type: 'balanceSolve', op: '+', a: 3, b: 7, max: 10 }, success: 'x = 4, because 4 + 3 = 7.' },
  { kind: 'question', prompt: '□ + 5 = 12. What number goes in the box?', options: ['6', '7', '17'], answer: 1, explanation: 'Think: what plus 5 makes 12? 12 − 5 = 7.', skill: 'Unknowns' }]

},
{
  lessonId: 'alg-2',
  steps: [
  { kind: 'concept', title: 'Spot the rule', body: 'A pattern follows a rule. On this number line, each jump adds 3: 2, 5, 8, 11…', visual: { type: 'numberLine', min: 0, max: 14, step: 1, labelAs: 'integer', marks: [2, 5, 8, 11] } },
  { kind: 'question', prompt: 'What comes next? 3, 6, 9, 12, …', options: ['13', '14', '15'], answer: 2, explanation: 'The rule is “add 3”, so 12 + 3 = 15.', skill: 'Patterns' },
  { kind: 'question', prompt: 'What is the rule? 5, 10, 20, 40', options: ['Add 5', 'Double it', 'Add 10'], answer: 1, explanation: 'Each number is twice the one before: 5 × 2 = 10, 10 × 2 = 20…', skill: 'Patterns' }]

},
{
  lessonId: 'alg-3',
  steps: [
  { kind: 'concept', title: 'Undo to solve', body: 'To find a mystery number, undo what was done to it. If 2 × x = 10, divide 10 by 2.', visual: { type: 'balance', left: '2 × x', right: '10' } },
  { kind: 'explore', title: 'Balance with multiplication', prompt: 'Slide to choose x so that 3 × x balances 12.', interaction: { type: 'balanceSolve', op: '×', a: 3, b: 12, max: 8 }, success: 'x = 4, because 3 × 4 = 12.' },
  { kind: 'question', prompt: '2 × n = 18. What is n?', options: ['8', '9', '16'], answer: 1, explanation: 'Undo × 2 by dividing: 18 ÷ 2 = 9.', skill: 'Equations' },
  { kind: 'question', prompt: 'y − 4 = 10. What is y?', options: ['6', '14', '40'], answer: 1, explanation: 'Undo − 4 by adding 4: 10 + 4 = 14.', skill: 'Equations' }]

}];