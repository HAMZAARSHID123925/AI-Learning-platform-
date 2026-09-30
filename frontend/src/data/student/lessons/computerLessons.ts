import type { LessonContent } from '@/types/student/learning';

export const computerLessons: LessonContent[] = [
{
  lessonId: 'db-1',
  steps: [
  { kind: 'concept', title: 'Input → Process → Output', body: 'A computer is a machine that takes in information (input), works on it (process) and gives back a result (output).', visual: { type: 'flow', nodes: [{ icon: 'keyboard', label: 'Input' }, { icon: 'cpu', label: 'Process' }, { icon: 'monitor', label: 'Output' }] } },
  { kind: 'explore', title: 'Follow a keypress', prompt: 'Tap each step to see what happens when you press a key.', interaction: { type: 'flowReveal', nodes: [{ icon: 'keyboard', label: 'Input', detail: 'You press “A”' }, { icon: 'cpu', label: 'Process', detail: 'The CPU reads the key' }, { icon: 'monitor', label: 'Output', detail: '“A” shows on screen' }] }, success: 'Every action follows input → process → output.' },
  { kind: 'question', prompt: 'Which of these is an input device?', options: ['Monitor', 'Keyboard', 'Speaker'], answer: 1, explanation: 'You put information in with a keyboard.', skill: 'Computer basics' },
  { kind: 'question', prompt: 'What does the CPU do?', options: ['Shows pictures', 'Processes information', 'Stores paper'], answer: 1, explanation: 'The CPU is the computer’s brain — it processes information.', skill: 'Computer basics' }]

},
{
  lessonId: 'db-2',
  steps: [
  { kind: 'concept', title: 'Touch it vs. run it', body: 'Hardware is the parts you can touch, like the mouse and screen. Software is the programs that run on it, like games and browsers.', visual: { type: 'flow', nodes: [{ icon: 'mouse', label: 'Mouse · hardware' }, { icon: 'laptop', label: 'Laptop · hardware' }, { icon: 'app', label: 'App · software' }] } },
  { kind: 'explore', title: 'Sort the words', prompt: 'Tap the two words that are software.', interaction: { type: 'wordTap', tokens: ['mouse', 'browser', 'screen', 'game', 'keyboard'], targets: [1, 3] }, success: 'Browsers and games are programs — software!' },
  { kind: 'question', prompt: 'Which one is software?', options: ['A printer', 'A web browser', 'A USB cable'], answer: 1, explanation: 'A web browser is a program, so it’s software.', skill: 'Hardware & software' },
  { kind: 'question', prompt: 'Which is hardware you can touch?', options: ['A mouse', 'A video game', 'An operating system'], answer: 0, explanation: 'A mouse is a physical part of the computer.', skill: 'Hardware & software' }]

},
{
  lessonId: 'db-3',
  steps: [
  { kind: 'concept', title: 'A web of computers', body: 'The internet connects millions of computers. Your device talks to a router, which sends your request across the internet to a website’s server.', visual: { type: 'flow', nodes: [{ icon: 'laptop', label: 'You' }, { icon: 'wifi', label: 'Router' }, { icon: 'globe', label: 'Internet' }, { icon: 'server', label: 'Website' }] } },
  { kind: 'explore', title: 'Send a message', prompt: 'Tap each stop to follow a web request.', interaction: { type: 'flowReveal', nodes: [{ icon: 'laptop', label: 'You', detail: 'Type a website name' }, { icon: 'wifi', label: 'Router', detail: 'Sends it out' }, { icon: 'globe', label: 'Internet', detail: 'Finds the way' }, { icon: 'server', label: 'Server', detail: 'Sends the page back' }] }, success: 'Requests travel out and pages travel back — in under a second!' },
  { kind: 'question', prompt: 'What do we use to find information online?', options: ['A search engine', 'A printer', 'A calculator'], answer: 0, explanation: 'Search engines help you find pages across the internet.', skill: 'Internet' },
  { kind: 'question', prompt: 'Which is the safest password?', options: ['12345', 'myname', 'Tr33!Blue7'], answer: 2, explanation: 'Mixing letters, numbers and symbols makes passwords hard to guess.', skill: 'Internet' }]

},
{
  lessonId: 'db-4',
  steps: [
  { kind: 'concept', title: 'Code is a list of instructions', body: 'An algorithm is a set of step-by-step instructions. Code is how we write those steps for a computer to follow.', visual: { type: 'flow', nodes: [{ icon: 'forward', label: 'Move forward' }, { icon: 'turn', label: 'Turn right' }, { icon: 'forward', label: 'Move forward' }] } },
  { kind: 'explore', title: 'Program the robot', prompt: 'Tap each block to see what the robot does.', interaction: { type: 'flowReveal', nodes: [{ icon: 'forward', label: 'Move', detail: 'Robot steps ahead' }, { icon: 'turn', label: 'Turn', detail: 'Robot faces right' }, { icon: 'repeat', label: 'Repeat 2×', detail: 'Do it again!' }, { icon: 'code', label: 'Done', detail: 'Program ends' }] }, success: 'You just read your first program!' },
  { kind: 'question', prompt: 'What is an algorithm?', options: ['A type of computer', 'Step-by-step instructions', 'A website'], answer: 1, explanation: 'An algorithm is an ordered list of steps to solve a problem.', skill: 'Coding' },
  { kind: 'question', prompt: 'Repeating the same steps in code is called a…', options: ['Loop', 'Bug', 'Mouse'], answer: 0, explanation: 'A loop repeats instructions so you don’t have to write them again.', skill: 'Coding' }]

}];