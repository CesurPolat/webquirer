const card = document.querySelector('.form-card');
const sessionId = card.dataset.sessionId;
const sessionApi = '/api/sessions/' + sessionId;

const form = document.querySelector('#webquirer-form');
const title = document.querySelector('#form-title');
const questions = document.querySelector('#questions');
const errorMessage = document.querySelector('#form-error');
const cancelButton = document.querySelector('#cancel-button');

start();

async function start() {
  try {
    const config = await getSession();
    title.textContent = config.title;
    renderQuestions(config.questions);
  } catch (error) {
    showError(error);
  }
}

async function getSession() {
  const response = await fetch(sessionApi);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load this form.');
  return data;
}

function renderQuestions(questionList) {
  for (const question of questionList) {
    questions.append(createField(question));
  }
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
  setBusy(true);

  try {
    await send('/answers', collectAnswers());
    renderCompletion('Done', 'You can return to your terminal.');
  } catch (error) {
    showError(error);
    setBusy(false);
  }
});

cancelButton.addEventListener('click', async () => {
  setBusy(true);

  try {
    await send('/cancel', {});
    renderCompletion('Cancelled', 'You can return to your terminal.');
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

function setBusy(isBusy) {
  for (const button of form.querySelectorAll('button')) {
    button.disabled = isBusy;
  }
}

function showError(error) {
  errorMessage.textContent = error.message;
}

function renderCompletion(heading, message) {
  card.innerHTML =
    '<section class="completion">' +
      '<h1>' + heading + '</h1>' +
      '<p>' + message + '</p>' +
      '<button class="button button--secondary" type="button" id="close-tab-button">Close tab</button>' +
      '<p id="close-hint" class="close-hint" hidden>You can close this tab manually.</p>' +
    '</section>';

  document.querySelector('#close-tab-button').addEventListener('click', closeTab);

  // Browsers only allow this when the page was opened by script.
  // It is harmless to try; the visible close button remains as a fallback.
  setTimeout(closeTab, 700);
}

function closeTab() {
  window.close();

  // If the browser rejects window.close(), give the user a clear fallback.
  setTimeout(() => {
    const hint = document.querySelector('#close-hint');
    if (hint) hint.hidden = false;
  }, 150);
}
