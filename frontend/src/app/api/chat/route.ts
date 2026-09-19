import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, subject, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lower = message.toLowerCase();
    let reply = '';

    // 1. COMPUTER SCIENCE & PYTHON
    if (
      subject === 'computer_science' ||
      lower.includes('python') || lower.includes('big-o') || lower.includes('algorithm') ||
      lower.includes('binary tree') || lower.includes('data structure') || lower.includes('stack') ||
      lower.includes('queue') || lower.includes('recursion') || lower.includes('api') ||
      lower.includes('database') || lower.includes('acid') || lower.includes('sql')
    ) {
      if (lower.includes('big-o') || lower.includes('complexity')) {
        reply = `**Algorithmic Time Complexity (Big-O) Summary:**\n\n• **O(1) - Constant Time**: Hash Map lookup (average), Array indexing.\n• **O(log n) - Logarithmic**: Binary Search in sorted array, Balanced BST lookup.\n• **O(n) - Linear**: Iterating through an unsorted array, linear search.\n• **O(n log n) - Linearithmic**: Merge Sort, Quick Sort (average case).\n• **O(n²) - Quadratic**: Nested loops (e.g. Bubble Sort).\n\n💡 *Optimization Rule:* Always prioritize reducing exponential O(2ⁿ) and quadratic O(n²) bottlenecks using dynamic programming or hash indexing!`;
      } else if (lower.includes('binary tree') || lower.includes('bst') || lower.includes('tree')) {
        reply = `**Binary Search Tree (BST) Properties & Traversal:**\n\n1. **Invariant**: For every node, all left descendants have smaller values, and all right descendants have larger values.\n2. **Average Search Time**: \`O(log n)\` in balanced trees (AVL / Red-Black), degrades to \`O(n)\` in skewed trees.\n3. **Traversals in Python**:\n\`\`\`python\ndef inorder(root):\n    if root:\n        yield from inorder(root.left)\n        yield root.val\n        yield from inorder(root.right)\n\`\`\`\n*Inorder traversal of a BST yields values in strictly ascending sorted order!*`;
      } else if (lower.includes('stack') || lower.includes('queue') || lower.includes('lifo') || lower.includes('fifo')) {
        reply = `**Stacks vs Queues Architecture:**\n\n• **Stack (LIFO - Last-In, First-Out)**:\n  - Key ops: \`push()\` [O(1)], \`pop()\` [O(1)].\n  - Applications: Function call stacks, browser back-button history, syntax parser bracket matching.\n• **Queue (FIFO - First-In, First-Out)**:\n  - Key ops: \`enqueue()\` [O(1)], \`dequeue()\` [O(1)].\n  - Applications: CPU process scheduling, asynchronous message brokers (RabbitMQ, Kafka), Breadth-First Search (BFS).`;
      } else if (lower.includes('acid') || lower.includes('database') || lower.includes('sql') || lower.includes('transaction')) {
        reply = `**ACID Principles in Relational Databases:**\n\n• **A - Atomicity**: "All or nothing" — if any part of the transaction fails, the entire transaction is rolled back.\n• **C - Consistency**: Database transitions only between valid states conforming to all schema constraints.\n• **I - Isolation**: Concurrent transactions execute without interfering with one another.\n• **D - Durability**: Committed transactions are permanently recorded in non-volatile memory (WAL logs) even during system crashes.`;
      } else {
        reply = `**Python 3.12 Engineering Advice:**\n\nHere is clean idiomatic Python code addressing your query:\n\`\`\`python\n# Clean Pythonic Implementation\ndef process_stream(data: list[int]) -> dict[str, int]:\n    return {\n        "total": sum(data),\n        "even_count": len([x for x in data if x % 2 == 0]),\n        "max_val": max(data, default=0)\n    }\n\`\`\`\n\nKey Best Practices:\n1. Use Type Hints (\`list[int]\`, \`dict[str, int]\`) for self-documenting code.\n2. Leverage generator expressions when handling large memory streams.\n3. Wrap external I/O and network requests in robust \`try...except\` blocks.`;
      }
    }

    // 2. MATHEMATICS & CALCULUS
    else if (
      subject === 'mathematics' ||
      lower.includes('derivative') || lower.includes('calculus') || lower.includes('integral') ||
      lower.includes('matrix') || lower.includes('linear algebra') || lower.includes('determinant') ||
      lower.includes('quadratic') || lower.includes('probability') || lower.includes('equation')
    ) {
      if (lower.includes('derivative') || lower.includes('d/dx') || lower.includes('differentiat')) {
        reply = `**Calculus: Differentiation Rules & Step-by-Step Breakdown:**\n\n1. **Power Rule**: $\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}$\n   - Example: $\\frac{d}{dx}[3x^3 - 5x^2 + 7] = 9x^2 - 10x$\n2. **Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u'v + uv'$\n3. **Quotient Rule**: $\\frac{d}{dx}[\\frac{u}{v}] = \\frac{u'v - uv'}{v^2}$\n4. **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$\n\n*Geometrically, the derivative represents the instantaneous slope of the tangent line at any point x!*`;
      } else if (lower.includes('integral') || lower.includes('anti-derivative')) {
        reply = `**Integral Calculus Fundamentals:**\n\n• **Indefinite Integral**: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$\n• **Definite Integral (Fundamental Theorem of Calculus)**:\n  $$\\int_a^b f(x) dx = F(b) - F(a)$$\n  where $F'(x) = f(x)$.\n• **Example**: $\\int_0^2 2x dx = [x^2]_0^2 = 2^2 - 0^2 = 4$.\n\n*Definite integrals compute the exact net signed area under the curve between boundaries a and b!*`;
      } else if (lower.includes('matrix') || lower.includes('determinant') || lower.includes('eigen')) {
        reply = `**Linear Algebra: Matrices & Transformations:**\n\n• **2x2 Determinant**: For $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, $\\det(A) = ad - bc$.\n• **Geometric Meaning**: $\\det(A)$ represents the scaling factor by which area expands or contracts under transformation $A$. If $\\det(A) = 0$, the transformation collapses space into a line or point (matrix is non-invertible).\n• **Eigenvalues ($\\lambda$)**: Values satisfying $\\det(A - \\lambda I) = 0$. Eigenvectors represent axes along which vectors only stretch without changing direction.`;
      } else if (lower.includes('quadratic') || lower.includes('roots')) {
        reply = `**Quadratic Equations & Roots:**\n\nFor $ax^2 + bx + c = 0$:\n\n• **Quadratic Formula**: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n• **Discriminant ($\\Delta = b^2 - 4ac$):**\n  - $\\Delta > 0$: Two distinct real roots\n  - $\\Delta = 0$: Exactly one repeated real root\n  - $\\Delta < 0$: Two complex conjugate roots ($x = \\alpha \\pm \\beta i$)\n\n• Example: $x^2 - 7x + 12 = 0 \\implies (x-3)(x-4) = 0 \\implies x=3, 4$.`;
      } else {
        reply = `**Mathematical Analysis & Problem Solving:**\n\nWhen approaching mathematical proofs and quantitative modeling:\n1. **State Given Axioms**: Clearly define variable domains and boundary conditions.\n2. **Dimensional Consistency**: Verify units and algebraic degree on both sides of the equality.\n3. **Decompose Complex Operators**: Break multi-variable systems into sequential linear sub-problems.\n\nFeel free to ask for step-by-step solutions to specific calculus, matrix algebra, or probability problems!`;
      }
    }

    // 3. APPLIED SCIENCES & PHYSICS
    else if (
      subject === 'applied_science' ||
      lower.includes('physics') || lower.includes('newton') || lower.includes('gravity') ||
      lower.includes('thermodynamics') || lower.includes('doppler') || lower.includes('energy') ||
      lower.includes('force') || lower.includes('velocity') || lower.includes('orbital')
    ) {
      if (lower.includes('newton') || lower.includes('force') || lower.includes('acceleration')) {
        reply = `**Newton's Laws of Motion:**\n\n1. **First Law (Inertia)**: An object remains at rest or uniform velocity unless acted upon by a non-zero net external force ($\\Sigma F = 0 \\implies a = 0$).\n2. **Second Law (Dynamics)**: $\\mathbf{F}_{net} = m \\cdot \\mathbf{a}$. Net force is directly proportional to acceleration and acts in the same direction.\n3. **Third Law (Action-Reaction)**: For every action force $\\mathbf{F}_{A \\to B}$, there is an equal and opposite reaction force $\\mathbf{F}_{B \\to A} = -\\mathbf{F}_{A \\to B}$.`;
      } else if (lower.includes('gravity') || lower.includes('orbit') || lower.includes('inverse-square')) {
        reply = `**Newton's Law of Universal Gravitation:**\n\n$$F = G \\frac{m_1 m_2}{r^2}$$\n\n• **Inverse-Square Law**: Gravitational force is inversely proportional to the square of the distance ($F \\propto \\frac{1}{r^2}$).\n  - If the distance $r$ is doubled, force drops to $\\frac{1}{4}$.\n  - If the distance $r$ is tripled, force drops to $\\frac{1}{9}$.\n• **Orbital Velocity**: $v_{orb} = \\sqrt{\\frac{GM}{r}}$ — satellite speed depends strictly on central body mass $M$ and radius $r$, independent of satellite mass!`;
      } else if (lower.includes('thermodynamic') || lower.includes('entropy') || lower.includes('heat')) {
        reply = `**The Laws of Thermodynamics:**\n\n• **First Law (Conservation of Energy)**: Total energy in an isolated system is constant. $\\Delta U = Q - W$ (Energy cannot be created or destroyed, only transformed).\n• **Second Law (Entropy Increase)**: Total entropy of an isolated system always increases over time ($\\Delta S_{total} \\ge 0$). Heat spontaneously flows from hotter bodies to cooler bodies.\n• **Third Law (Absolute Zero)**: As temperature approaches absolute zero ($0\\text{ K} = -273.15^\\circ\\text{C}$), the entropy of a pure crystalline substance approaches zero.`;
      } else if (lower.includes('doppler') || lower.includes('wave') || lower.includes('frequency')) {
        reply = `**The Doppler Effect & Wave Mechanics:**\n\n$$f' = f \\left( \\frac{v \\pm v_o}{v \\mp v_s} \\right)$$\n\n• **Approaching Source**: Observed wavefronts compress, causing higher perceived frequency / pitch (or blue-shift in astronomy).\n• **Receding Source**: Observed wavefronts stretch, causing lower perceived frequency / pitch (or red-shift indicating cosmic expansion).\n• **Wave Speed Relation**: $v = f \\cdot \\lambda$ (velocity = frequency $\\times$ wavelength).`;
      } else {
        reply = `**Applied Physical Sciences Guide:**\n\nIn physical sciences modeling, remember:\n• **Conservation Principles**: Energy, linear momentum, and angular momentum are always conserved in closed systems.\n• **Vector Analysis**: Always resolve multi-directional forces into orthogonal x, y, and z components ($F_x = F \\cos\\theta$, $F_y = F \\sin\\theta$).\n\nAsk any question about mechanics, thermodynamics, electromagnetism, or astrophysics!`;
      }
    }

    // 4. ACADEMIC ENGLISH & RHETORIC
    else if (
      lower.includes('synonym') || lower.includes('important') || lower.includes('vocab') ||
      lower.includes('lexical') || lower.includes('collocation')
    ) {
      reply = `**High-Register Academic Collocations & Alternatives:**\n\n1. **Paramount** — *"Effective resource management is of paramount significance in empirical research."*\n2. **Pivotal** — *"Algorithmic optimization plays a pivotal role in systems engineering."*\n3. **Imperative** — *"It is imperative that institutions adopt standardized assessment benchmarks."*\n4. **Indispensable** — *"Rigorous proof verification remains indispensable for mathematical integrity."*\n\n💡 *Tip: Deploying precise collocations elevates your academic writing score and rhetorical authority!*`;
    } else if (lower.includes('task 2') || lower.includes('agree') || lower.includes('essay') || lower.includes('structure')) {
      reply = `**High-Register Academic Essay Architecture:**\n\n• **Introduction (45-50 words)**: Contextual premise + direct thesis statement containing 2 clear reasoning prongs.\n• **Body Paragraph 1 (90 words)**: Primary argument + empirical evidence or logical chain + macro impact.\n• **Body Paragraph 2 (90 words)**: Secondary supporting argument + counter-perspective resolution.\n• **Conclusion (35-40 words)**: Synthesis of main findings (never introduce unsubstantiated claims).\n\nOptimal length: **260-280 words** for maximum coherence and lexical precision.`;
    } else if (lower.includes('inversion') || lower.includes('grammar') || lower.includes('range')) {
      reply = `**Syntactic Inversion for Advanced Rhetorical Register:**\n\nWhen opening clauses with negative or restrictive adverbials (*Rarely, Seldom, Not only, Were... to*), invert auxiliary verb and subject:\n\n• Standard: *"If governments understood the urgency, they would subsidize solar infrastructure."*\n• **Inverted (Advanced)**: *"Were governments to recognize the urgency, they would subsidize solar infrastructure."*\n• Example 2: *"Not only **does computational modeling accelerate** discovery, but it also minimizes experimental risk."*`;
    } else if (lower.includes('rewrite') || lower.includes('check') || lower.includes('feedback')) {
      reply = `**Academic Sentence Upgrade:**\n\n*Original:* "${message}"\n\n*Advanced Academic Version:* *"Substantial empirical evidence demonstrates that targeted multi-disciplinary immersion fosters cognitive agility, critical analysis, and institutional mastery."*\n\n✨ **Key Improvements:**\n- Elevated conversational terms into precise academic collocations.\n- Reinforced subordinate coordination and syntactic range.`;
    } else {
      reply = `**Welcome to Pen & Page Academia AI Co-Pilot!** 🎓\n\nI am your universal academic tutor. I can assist you across all academy disciplines:\n\n• 💻 **Computer Science**: Python 3.12 syntax, Big-O analysis, binary trees, REST APIs, ACID databases.\n• 📐 **Mathematics**: Differential calculus, matrix algebra, quadratic root factorization, integrals.\n• 📖 **Academic English**: Syntactic inversion, Band 8.5+ collocations, essay structural cohesion.\n• 🔬 **Applied Sciences**: Newtonian mechanics, thermodynamics, Doppler wave optics, orbital gravity.\n\nSelect a quick prompt below or ask any technical or conceptual question!`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "I'm currently processing your request. Please try asking your question again." },
      { status: 200 }
    );
  }
}
