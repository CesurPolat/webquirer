const card = document.querySelector('.form-card');
const sessionApi = '/api/sessions/' + card.dataset.sessionId;

const form = document.querySelector('#webquirer-form');
const title = document.querySelector('#form-title');
const questions = document.querySelector('#questions');
const errorMessage = document.querySelector('#form-error');
const submitButton = form.querySelector('[type="submit"]');
const cancelButton = document.querySelector('#cancel-button');
const themeButtons = document.querySelectorAll('[data-theme-choice]');
const loadingState = document.querySelector('#loading-state');
const settingsContent = document.querySelector('.settings-content');
const settingsLayout = document.querySelector('.settings-layout');
const settingsNav = document.querySelector('.settings-nav');
const sectionNav = document.querySelector('#section-nav');

initializeTheme();
start();

function initializeTheme() {
  const savedTheme = localStorage.getItem('webquirer-theme') || 'system';
  setTheme(savedTheme);

  for (const button of themeButtons) {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeChoice;
      setTheme(theme);
      localStorage.setItem('webquirer-theme', theme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  for (const button of themeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
  }
}

async function start() {
  try {
    const config = await getSession();
    title.textContent = config.title;
    renderQuestions(config.questions);
    loadingState.hidden = true;
    form.hidden = false;
  } catch (error) {
    renderState('Unable to load the form', error.message, 'error');
  }
}

async function getSession() {
  const response = await fetch(sessionApi);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load this form.');
  return data;
}

function renderQuestions(questionList) {
  let currentSection;
  let fields;
  let groupIndex = 0;

  for (const question of questionList) {
    const section = question.section || '';

    if (!fields || section !== currentSection) {
      currentSection = section;
      groupIndex += 1;
      const group = createQuestionGroup(section, groupIndex);
      fields = group.querySelector('.question-section__fields');
      questions.append(group);

      if (section) sectionNav.append(createSectionLink(section, group.id));
    }

    fields.append(createField(question));
  }

  if (!sectionNav.children.length) {
    settingsNav.hidden = true;
    settingsLayout.classList.add('settings-layout--single');
  }
}

function createQuestionGroup(title, index) {
  const section = document.createElement('section');
  section.className = 'question-section';
  section.id = 'form-section-' + index;

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'question-section__title';
    heading.textContent = title;
    section.append(heading);
  }

  const fields = document.createElement('div');
  fields.className = 'question-section__fields';
  section.append(fields);
  return section;
}

function createSectionLink(title, targetId) {
  const link = document.createElement('a');
  link.className = 'settings-nav__item';
  link.href = '#' + targetId;
  link.textContent = title;

  if (!sectionNav.children.length) {
    link.classList.add('settings-nav__item--active');
    link.setAttribute('aria-current', 'true');
  }

  link.addEventListener('click', () => {
    for (const item of sectionNav.querySelectorAll('.settings-nav__item')) {
      const active = item === link;
      item.classList.toggle('settings-nav__item--active', active);
      if (active) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    }
  });

  return link;
}

function createField(question) {
  return question.type === 'confirm'
    ? createCheckboxField(question)
    : createStandardField(question);
}

function createStandardField(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const label = document.createElement('label');
  label.className = 'field__label';
  label.htmlFor = question.name;
  label.append(question.message, requiredMarker(question));

  const control = question.type === 'select'
    ? createSelect(question)
    : createInput(question);

  wrapper.append(label, control);
  return wrapper;
}

function createInput(question) {
  const input = document.createElement('input');
  input.className = 'control';
  input.id = question.name;
  input.name = question.name;
  input.type = question.type;
  input.required = Boolean(question.required);
  input.value = question.default ?? '';
  return input;
}

function createSelect(question) {
  const select = document.createElement('select');
  select.className = 'control';
  select.id = question.name;
  select.name = question.name;
  select.required = Boolean(question.required);

  for (const choice of question.choices) {
    const option = document.createElement('option');
    option.value = choice;
    option.textContent = choice;
    option.selected = choice === question.default;
    select.append(option);
  }
  return select;
}

function createCheckboxField(question) {
  const label = document.createElement('label');
  label.className = 'checkbox-field';

  const checkbox = document.createElement('input');
  checkbox.id = question.name;
  checkbox.name = question.name;
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(question.default);

  label.append(checkbox, question.message, requiredMarker(question));
  return label;
}

function requiredMarker(question) {
  if (!question.required) return '';
  const marker = document.createElement('span');
  marker.className = 'field__required';
  marker.textContent = ' *';
  return marker;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBusy(true, 'submit');

  try {
    await send('/answers', collectAnswers());
    renderCompletion('Done', 'You can return to your terminal.', 'success');
  } catch (error) {
    showError(error);
    setBusy(false);
  }
});

cancelButton.addEventListener('click', async () => {
  setBusy(true, 'cancel');

  try {
    await send('/cancel', {});
    renderCompletion('Cancelled', 'You can return to your terminal.', 'cancelled');
  } catch (error) {
    showError(error);
    setBusy(false);
  }
});

function collectAnswers() {
  const answers = {};
  for (const control of form.elements) {
    if (!control.name) continue;
    answers[control.name] = control.type === 'checkbox'
      ? control.checked
      : control.value;
  }
  return answers;
}

async function send(path, payload) {
  const response = await fetch(sessionApi + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function setBusy(isBusy, action) {
  for (const button of form.querySelectorAll('button')) {
    button.disabled = isBusy;
  }
  submitButton.textContent = isBusy && action === 'submit' ? 'Submitting…' : 'Continue';
  cancelButton.textContent = isBusy && action === 'cancel' ? 'Cancelling…' : 'Cancel';
}

function showError(error) {
  errorMessage.textContent = error.message;
}

function renderCompletion(heading, message, type) {
  renderState(heading, message, type);

  const panel = settingsContent.querySelector('.state-panel');
  const closeButton = document.createElement('button');
  closeButton.className = 'button button--secondary';
  closeButton.type = 'button';
  closeButton.textContent = 'Close tab';
  closeButton.addEventListener('click', closeTab);
  panel.append(closeButton);

  const closeHint = document.createElement('p');
  closeHint.id = 'close-hint';
  closeHint.className = 'close-hint';
  closeHint.hidden = true;
  closeHint.textContent = 'You can close this tab manually.';
  panel.append(closeHint);

  const countdown = document.createElement('p');
  countdown.className = 'close-countdown';
  countdown.innerHTML = 'Closing this tab in <strong>5</strong>s…';
  panel.append(countdown);

  // This succeeds only for tabs the browser permits scripts to close.
  startCloseCountdown(countdown);
}

function renderState(heading, message, type) {
  settingsContent.replaceChildren();

  const panel = document.createElement('section');
  panel.className = 'state-panel state-panel--' + type;

  const icon = document.createElement('span');
  icon.className = 'state-icon';
  icon.textContent = type === 'success' ? '✓' : type === 'cancelled' ? '—' : '!';

  const headingElement = document.createElement('h2');
  headingElement.textContent = heading;

  const messageElement = document.createElement('p');
  messageElement.textContent = message;

  panel.append(icon, headingElement, messageElement);
  settingsContent.append(panel);
}

function closeTab() {
  window.close();

  setTimeout(() => {
    const hint = document.querySelector('#close-hint');
    if (hint) hint.hidden = false;
  }, 150);
}

function startCloseCountdown(countdown) {
  let remaining = 5;
  const timer = setInterval(() => {
    remaining -= 1;
    countdown.innerHTML = 'Closing this tab in <strong>' + remaining + '</strong>s…';

    if (remaining === 0) {
      clearInterval(timer);
      closeTab();
    }
  }, 1000);
}
