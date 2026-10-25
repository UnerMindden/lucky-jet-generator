import { randomCoefficient, DURATION_MS } from './generator.mjs?v=range10';

const copy = {
  ru: {
    title: 'Lucky Jet · Генератор', languageLabel: 'Язык интерфейса',
    generatorLabel: 'ГЕНЕРАТОР', headlineOne: 'Твой следующий', headlineTwo: 'коэффициент.',
    resultLabel: 'Случайный коэффициент', duration: '3 секунды',
    idleHint: 'Нажми кнопку — начнём генерацию', generatingHint: 'Генерируем случайное значение…',
    resultHint: 'Случайное значение готово', generate: 'Получить сигнал', generating: 'Генерация…',
    notice: 'Случайные значения. Не прогноз игры.',
    generatingLive: 'Генерация случайного коэффициента. Ожидание 3 секунды.', resultLive: 'Случайный коэффициент: '
  },
  en: {
    title: 'Lucky Jet · Generator', languageLabel: 'Interface language',
    generatorLabel: 'GENERATOR', headlineOne: 'Your next', headlineTwo: 'multiplier.',
    resultLabel: 'Random multiplier', duration: '3 seconds',
    idleHint: 'Tap the button to generate a value', generatingHint: 'Generating a random value…',
    resultHint: 'Your random value is ready', generate: 'Get signal', generating: 'Generating…',
    notice: 'Random values. Not a game prediction.',
    generatingLive: 'Generating a random multiplier. Please wait 3 seconds.', resultLive: 'Random multiplier: '
  }
};
const card = document.querySelector('.generator');
const generateButton = document.querySelector('#generate-button');
const buttonLabel = document.querySelector('#button-label');
const coefficient = document.querySelector('#coefficient');
const hint = document.querySelector('#result-hint');
const liveMessage = document.querySelector('#live-message');
const languageGroup = document.querySelector('.language-switch');
const languageButtons = Array.from(document.querySelectorAll('[data-lang]'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = 'ru';
let state = 'idle';
let finalValue = null;
let animationFrame = null;
let finishTimer = null;

try {
  const savedLanguage = localStorage.getItem('lucky-jet-language');
  language = savedLanguage === 'en' || savedLanguage === 'ru' ? savedLanguage : (navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en');
} catch {
  language = navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function updateStatus() {
  const t = copy[language];
  hint.textContent = state === 'generating' ? t.generatingHint : state === 'result' ? t.resultHint : t.idleHint;
  buttonLabel.textContent = state === 'generating' ? t.generating : t.generate;
}

function setLanguage(nextLanguage) {
  if (!Object.hasOwn(copy, nextLanguage)) return;
  language = nextLanguage;
  document.documentElement.lang = language;
  document.title = copy[language].title;
  languageGroup.setAttribute('aria-label', copy[language].languageLabel);
  document.querySelectorAll('[data-i18n]').forEach(function (element) {
    const key = element.dataset.i18n;
    if (copy[language][key]) element.textContent = copy[language][key];
  });
  languageButtons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.lang === language)); });
  updateStatus();
  if (state === 'result') liveMessage.textContent = copy[language].resultLive + finalValue + '×';
  if (state === 'generating') liveMessage.textContent = copy[language].generatingLive;
  try { localStorage.setItem('lucky-jet-language', language); } catch { /* Language remains usable without storage. */ }
}

function finishGeneration() {
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
  finishTimer = null;
  finalValue = randomCoefficient();
  coefficient.textContent = finalValue;
  state = 'result';
  card.dataset.state = state;
  card.setAttribute('aria-busy', 'false');
  generateButton.disabled = false;
  updateStatus();
  liveMessage.textContent = copy[language].resultLive + finalValue + '×';
}

function startGeneration() {
  if (state === 'generating') return;
  state = 'generating';
  card.dataset.state = state;
  card.setAttribute('aria-busy', 'true');
  generateButton.disabled = true;
  liveMessage.textContent = copy[language].generatingLive;
  updateStatus();
  let lastFrame = 0;
  if (reducedMotion.matches) {
    coefficient.textContent = '···';
  } else {
    const animate = function (time) {
      if (time - lastFrame >= 85) {
        coefficient.textContent = randomCoefficient();
        lastFrame = time;
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
  }
  finishTimer = window.setTimeout(finishGeneration, DURATION_MS);
}

languageButtons.forEach(function (button) { button.addEventListener('click', function () { setLanguage(button.dataset.lang); }); });
generateButton.addEventListener('click', startGeneration);
window.addEventListener('pagehide', function () {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  if (finishTimer !== null) {
    clearTimeout(finishTimer);
    finishTimer = null;
    state = finalValue ? 'result' : 'idle';
    coefficient.textContent = finalValue || '—.—';
    card.dataset.state = state;
    card.setAttribute('aria-busy', 'false');
    generateButton.disabled = false;
    liveMessage.textContent = '';
    updateStatus();
  }
});
setLanguage(language);
