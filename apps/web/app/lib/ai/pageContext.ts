/**
 * Dynamic Page Context Extraction
 * Captures current page content like X Grok - AI can "see" what's on screen
 */

export interface PageContext {
  pageTitle: string;
  visibleText: string;
  codeBlocks: string[];
  currentUrl: string;
  metadata: {
    lessonTitle?: string;
    phase?: string;
    slideNumber?: string;
    exerciseTitle?: string;
  };
}

/**
 * Extract all visible text content from the page
 * Cleans up and formats for AI consumption
 */
function extractVisibleText(): string {
  const body = document.body;
  if (!body) return '';

  // Clone the body to manipulate without affecting the page
  const clone = body.cloneNode(true) as HTMLElement;

  // Remove script, style, svg, and hidden elements
  const unwanted = clone.querySelectorAll('script, style, svg, [hidden], [aria-hidden="true"]');
  unwanted.forEach(el => el.remove());

  // Get text content
  let text = clone.innerText || clone.textContent || '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
    .trim();

  return text;
}

/**
 * Extract all code blocks from the page
 */
function extractCodeBlocks(): string[] {
  const codeBlocks: string[] = [];

  // Find code in <pre>, <code>, or Monaco editor instances
  const preElements = document.querySelectorAll('pre code, pre, .view-lines');

  preElements.forEach((el) => {
    const code = el.textContent?.trim();
    if (code && code.length > 10) {
      // Only include substantial code blocks
      codeBlocks.push(code);
    }
  });

  // Also check for Monaco editor content (our code editor)
  const monacoEditors = document.querySelectorAll('.monaco-editor');
  monacoEditors.forEach((editor) => {
    const lines = editor.querySelectorAll('.view-line');
    const code = Array.from(lines)
      .map(line => line.textContent)
      .join('\n')
      .trim();

    if (code && code.length > 10) {
      codeBlocks.push(code);
    }
  });

  return codeBlocks;
}

/**
 * Extract metadata from the page (lesson info, phase, etc.)
 */
function extractMetadata(): PageContext['metadata'] {
  const metadata: PageContext['metadata'] = {};

  // Try to find lesson title (usually in h1 or title)
  const h1 = document.querySelector('h1');
  if (h1) {
    metadata.lessonTitle = h1.textContent?.trim();
  }

  // Try to find phase indicators
  const phaseIndicators = document.querySelectorAll('[class*="phase"], [data-phase]');
  if (phaseIndicators.length > 0) {
    const phaseText = phaseIndicators[0].textContent?.trim();
    if (phaseText) {
      metadata.phase = phaseText;
    }
  }

  // Try to find slide number
  const slideIndicators = document.querySelectorAll('[class*="slide"]');
  slideIndicators.forEach(el => {
    const text = el.textContent?.trim();
    if (text && /\d+\s*(?:of|\/)\s*\d+/.test(text)) {
      metadata.slideNumber = text;
    }
  });

  // Try to find exercise title
  const exerciseTitle = document.querySelector('[class*="exercise"] h2, [class*="exercise"] h3');
  if (exerciseTitle) {
    metadata.exerciseTitle = exerciseTitle.textContent?.trim();
  }

  return metadata;
}

/**
 * Capture full page context for AI
 * Called when user clicks the voice button
 */
export function capturePageContext(): PageContext {
  return {
    pageTitle: document.title,
    visibleText: extractVisibleText(),
    codeBlocks: extractCodeBlocks(),
    currentUrl: window.location.pathname,
    metadata: extractMetadata(),
  };
}

/**
 * Format page context into a prompt for the AI
 */
export function formatContextForAI(context: PageContext): string {
  let prompt = `You are an expert Move programming tutor. You can see the current page the student is viewing.\n\n`;

  // Page info
  prompt += `PAGE CONTEXT:\n`;
  prompt += `URL: ${context.currentUrl}\n`;
  prompt += `Page Title: ${context.pageTitle}\n\n`;

  // Metadata
  if (Object.keys(context.metadata).length > 0) {
    prompt += `LESSON INFO:\n`;
    if (context.metadata.lessonTitle) {
      prompt += `Lesson: "${context.metadata.lessonTitle}"\n`;
    }
    if (context.metadata.phase) {
      prompt += `Phase: ${context.metadata.phase}\n`;
    }
    if (context.metadata.slideNumber) {
      prompt += `Slide: ${context.metadata.slideNumber}\n`;
    }
    if (context.metadata.exerciseTitle) {
      prompt += `Exercise: "${context.metadata.exerciseTitle}"\n`;
    }
    prompt += `\n`;
  }

  // Code blocks
  if (context.codeBlocks.length > 0) {
    prompt += `CODE ON PAGE:\n`;
    context.codeBlocks.forEach((code, index) => {
      prompt += `\nCode Block ${index + 1}:\n\`\`\`move\n${code}\n\`\`\`\n`;
    });
    prompt += `\n`;
  }

  // Visible content (truncated to avoid token limits)
  const maxTextLength = 2000;
  const visibleText = context.visibleText.length > maxTextLength
    ? context.visibleText.substring(0, maxTextLength) + '...'
    : context.visibleText;

  prompt += `VISIBLE CONTENT:\n${visibleText}\n\n`;

  // Instructions
  prompt += `YOUR ROLE:\n`;
  prompt += `1. You can see everything on this page - use it to provide context-aware help\n`;
  prompt += `2. Help the student understand concepts, debug code, and solve problems\n`;
  prompt += `3. Guide with questions using the Socratic method\n`;
  prompt += `4. Keep responses concise (under 3 sentences unless detailed explanation requested)\n`;
  prompt += `5. Be encouraging and supportive\n`;
  prompt += `6. Reference specific content you see on the page when relevant\n\n`;
  prompt += `The student is asking you a question about this page. Help them learn!`;

  return prompt;
}
