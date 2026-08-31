export const supportedTypes = new Set(['input', 'password', 'select', 'confirm']);

export function normalizeForm(options) {
  if (!options || !Array.isArray(options.questions) || options.questions.length === 0) throw new TypeError('inquire() needs at least one question.');
  const names = new Set();
  const questions = options.questions.map((question) => {
    if (!question.name || !question.message) throw new TypeError('Every question needs name and message.');
    if (names.has(question.name)) throw new TypeError(`Duplicate question name: ${question.name}`);
    names.add(question.name);
    const normalized = { ...question, type: question.type ?? 'input' };
    if (normalized.section != null && (typeof normalized.section !== 'string' || !normalized.section.trim())) throw new TypeError(`Section for "${normalized.name}" must be text.`);
    if (normalized.sectionIcon != null && (typeof normalized.sectionIcon !== 'string' || !normalized.sectionIcon.trim())) throw new TypeError(`Section icon for "${normalized.name}" must be text.`);
    if (!supportedTypes.has(normalized.type)) throw new TypeError(`Unsupported type: ${normalized.type}`);
    if (normalized.type === 'select' && (!Array.isArray(normalized.choices) || normalized.choices.length === 0)) throw new TypeError(`Select question "${normalized.name}" needs choices.`);
    return normalized;
  });
  return { title: options.title ?? 'Complete this form', questions };
}

export function validateAnswers(questions, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid form data.');
  const answers = {};
  for (const question of questions) {
    const value = payload[question.name];
    if (question.type === 'confirm') { answers[question.name] = value === true; continue; }
    if (typeof value !== 'string') throw new Error(`"${question.message}" must be text.`);
    if (question.required && !value.trim()) throw new Error(`"${question.message}" is required.`);
    if (question.type === 'select' && !question.choices.includes(value)) throw new Error(`Invalid choice for "${question.message}".`);
    answers[question.name] = value;
  }
  return answers;
}
