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
  questions.replaceChildren();
  sectionNav.replaceChildren();
  settingsNav.hidden = false;
  settingsLayout.classList.remove('settings-layout--single');
  let currentSection;
  let fields;
  let groupIndex = 0;
  const hasSections = questionList.some((question) => Boolean(question.section));

  for (const question of questionList) {
    const section = hasSections ? question.section || 'General' : '';

    if (!fields || section !== currentSection) {
      currentSection = section;
      groupIndex += 1;
      const group = createQuestionGroup(groupIndex);
      fields = group.querySelector('.question-section__fields');
      questions.append(group);

      if (section) sectionNav.append(createSectionLink(section, question.sectionIcon, group.id));
    }

    fields.append(createField(question));
  }

  if (!sectionNav.children.length) {
    settingsNav.hidden = true;
    settingsLayout.classList.add('settings-layout--single');
  } else {
    const requestedSection = window.location.hash.slice(1);
    const requestedElement = document.getElementById(requestedSection);
    const initialSection = requestedElement?.classList.contains('question-section')
      ? requestedSection
      : sectionNav.querySelector('.settings-nav__item').hash.slice(1);
    activateSection(initialSection);
  }
}

function createQuestionGroup(index) {
  const section = document.createElement('section');
  section.className = 'question-section';
  section.id = 'form-section-' + index;

  const fields = document.createElement('div');
  fields.className = 'question-section__fields';
  section.append(fields);
  return section;
}

function createSectionLink(title, icon, targetId) {
  const link = document.createElement('a');
  link.className = 'settings-nav__item';
  link.href = '#' + targetId;

  const iconElement = document.createElement('span');
  iconElement.className = 'settings-nav__icon';
  iconElement.setAttribute('aria-hidden', 'true');
  iconElement.textContent = icon || '◌';

  const label = document.createElement('span');
  label.className = 'settings-nav__label';
  label.textContent = title;
  link.append(iconElement, label);

  if (!sectionNav.children.length) {
    link.classList.add('settings-nav__item--active');
    link.setAttribute('aria-current', 'true');
  }

  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.history.replaceState(null, '', link.hash);
    activateSection(targetId);
  });

  return link;
}

function activateSection(targetId) {
  for (const section of questions.querySelectorAll('.question-section')) {
    section.hidden = section.id !== targetId;
  }

  for (const item of sectionNav.querySelectorAll('.settings-nav__item')) {
    const active = item.hash === '#' + targetId;
    item.classList.toggle('settings-nav__item--active', active);
    if (active) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  }
}

function createField(question) {
  return question.type === 'confirm'
    ? createCheckboxField(question)
    : question.presentation === 'buttons'
      ? createButtonChoices(question)
    : createStandardField(question);
}

function createButtonChoices(question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-choices';
  wrapper.setAttribute('role', 'radiogroup');
  wrapper.setAttribute('aria-label', question.message);

  const label = document.createElement('div');
  label.className = 'field__label';
  label.append(question.message, requiredMarker(question));
  wrapper.append(label);

  const hidden = document.createElement('input');
  hidden.type = 'text';
  hidden.name = question.name;
  hidden.required = Boolean(question.required);
  hidden.tabIndex = -1;
  hidden.className = 'menu-choices__value';
  wrapper.append(hidden);

  for (const choice of question.choices) {
    const item = typeof choice === 'string' ? { name: choice, value: choice } : choice;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-choice';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.innerHTML = '<span class="menu-choice__name"></span><span class="menu-choice__description"></span>';
    button.querySelector('.menu-choice__name').textContent = item.name;
    button.querySelector('.menu-choice__description').textContent = item.description || '';
    button.querySelector('.menu-choice__description').hidden = !item.description;
    button.addEventListener('click', () => {
      hidden.value = item.value;
      for (const sibling of wrapper.querySelectorAll('.menu-choice')) {
        const active = sibling === button;
        sibling.classList.toggle('menu-choice--active', active);
        sibling.setAttribute('aria-checked', String(active));
      }
    });
    wrapper.append(button);
  }
  const defaultChoice = question.choices.find((choice) =>
    (typeof choice === 'string' ? choice : choice.value) === question.default
  );
  if (defaultChoice) wrapper.querySelector('.menu-choice').click();
  return wrapper;
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
    const value = typeof choice === 'string' ? choice : choice.value;
    option.value = value;
    option.textContent = typeof choice === 'string'
      ? choice
      : choice.description
        ? choice.name + ' — ' + choice.description
        : choice.name;
    if (typeof choice === 'object' && choice.description) option.title = choice.description;
    option.selected = value === question.default;
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
    const result = await send('/answers', collectAnswers());
    if (result.done === false) {
      title.textContent = result.form.title;
      renderQuestions(result.form.questions);
      errorMessage.textContent = '';
      setBusy(false);
      return;
    }
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

submitButton.addEventListener('click', (event) => {
  if (focusFirstInvalidControl()) event.preventDefault();
});

form.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && focusFirstInvalidControl()) event.preventDefault();
});

function focusFirstInvalidControl() {
  const invalidControl = Array.from(form.elements).find((control) =>
    control.willValidate && !control.checkValidity()
  );

  if (!invalidControl) return false;

  const section = invalidControl.closest('.question-section');
  if (section) activateSection(section.id);

  requestAnimationFrame(() => {
    invalidControl.focus();
    invalidControl.reportValidity();
  });

  return true;
}

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
  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong.');
    error.field = data.field;
    throw error;
  }
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
  if (error.field) {
    const invalidControl = form.elements.namedItem(error.field);
    if (invalidControl) {
      const section = invalidControl.closest('.question-section');
      if (section) activateSection(section.id);
      invalidControl.focus();
    }
  }
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
