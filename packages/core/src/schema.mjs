export const supportedTypes = new Set(['input', 'password', 'select', 'confirm']);

export class FormValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'FormValidationError';
    this.field = field;
  }
}

export function normalizeForm(options) {
  if (!options || !Array.isArray(options.questions) || options.questions.length === 0) {
    throw new TypeError('inquire() needs at least one question.');
  }
  const names = new Set();
  const questions = options.questions.map((question) => {
    if (!question.name || !question.message) throw new TypeError('Every question needs name and message.');
    if (names.has(question.name)) throw new TypeError(`Duplicate question name: ${question.name}`);
    names.add(question.name);
    const normalized = { ...question, type: question.type ?? 'input' };
    if (normalized.presentation != null && !['default', 'buttons'].includes(normalized.presentation)) {
      throw new TypeError(`Unsupported presentation: ${normalized.presentation}`);
    }
    if (normalized.section != null && (typeof normalized.section !== 'string' || !normalized.section.trim())) {
      throw new TypeError(`Section for "${normalized.name}" must be text.`);
    }
    if (normalized.sectionIcon != null && (typeof normalized.sectionIcon !== 'string' || !normalized.sectionIcon.trim())) {
      throw new TypeError(`Section icon for "${normalized.name}" must be text.`);
    }
    if (!supportedTypes.has(normalized.type)) throw new TypeError(`Unsupported type: ${normalized.type}`);
    if (normalized.type === 'select') normalized.choices = normalizeChoices(normalized.choices, normalized.name);
    return normalized;
  });
  return { title: options.title ?? 'Complete this form', questions };
}

export async function validateAnswers(questions, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new FormValidationError('Invalid form data.');
  const answers = {};
  for (const question of questions) {
    const value = payload[question.name];
    if (question.type === 'confirm') {
      answers[question.name] = value === true;
      continue;
    }
    if (typeof value !== 'string') throw new FormValidationError(`"${question.message}" must be text.`, question.name);
    if (question.required && !value.trim()) throw new FormValidationError(`"${question.message}" is required.`, question.name);
    if (question.type === 'select' && !question.choices.some((choice) => choice.value === value)) {
      throw new FormValidationError(`Invalid choice for "${question.message}".`, question.name);
    }
    if (typeof question.validate === 'function') {
      const result = await question.validate(value, answers);
      if (result !== true) {
        throw new FormValidationError(typeof result === 'string' ? result : `Invalid value for "${question.message}".`, question.name);
      }
    }
    answers[question.name] = value;
  }
  return answers;
}

function normalizeChoices(choices, name) {
  if (!Array.isArray(choices) || choices.length === 0) throw new TypeError(`Select question "${name}" needs choices.`);
  return choices.map((choice) => {
    if (typeof choice === 'string') return { name: choice, value: choice };
    if (!choice || typeof choice !== 'object' || typeof choice.value !== 'string' || typeof choice.name !== 'string') {
      throw new TypeError(`Select question "${name}" has an invalid choice.`);
    }
    return { name: choice.name, value: choice.value, ...(choice.description ? { description: String(choice.description) } : {}) };
  });
}
