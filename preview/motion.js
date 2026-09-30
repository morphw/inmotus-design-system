import { createElasticIndicator, createElasticSelection, installPressFeedback } from '../motion/inmotus.mjs';

const disposePress = installPressFeedback();
const cleanups = [disposePress];
const select = (selector) => document.querySelector(selector);
select('#theme').addEventListener('click', (event) => {
  const dark = document.body.dataset.inmotusTheme !== 'dark';
  document.body.dataset.inmotusTheme = dark ? 'dark' : 'light';
  event.currentTarget.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
});
const refreshers = [];
select('#mode').addEventListener('change', (event) => {
  document.body.dataset.inmotusFeedback = event.target.value;
  refreshers.forEach((refresh) => refresh());
});
try {
  const { animate, motionValue } = await import('motion');
  const engine = { animate, motionValue };
  for (const id of ['segments', 'navigation']) {
    const container = select(`#${id}`);
    const items = [...container.querySelectorAll('button, a')];
    const adapter = createElasticSelection(container, container.querySelector('.inmotus-elastic-indicator'), items, engine, { bleed: id === 'navigation' ? 4 : 0 });
    let active = items[0];
    adapter.select(active);
    items.forEach((item) => item.addEventListener('click', (event) => {
      if (id === 'navigation') event.preventDefault();
      active = item;
      items.forEach((other) => {
        if (id === 'segments') other.setAttribute('aria-pressed', String(other === item));
        else if (other === item) other.setAttribute('aria-current', 'page');
        else other.removeAttribute('aria-current');
      });
      adapter.select(item);
    }));
    refreshers.push(() => adapter.select(active, { animate: false }));
    cleanups.push(() => adapter.destroy());
  }
  const control = select('#switch');
  const thumb = createElasticIndicator(control.querySelector('.switch-thumb'), engine, { unit: 'rem', minimumWidth: 1.5 });
  let checked = false;
  const render = (animate = true) => {
    const left = checked ? 1.35 : 0;
    thumb.setBounds(left, left + 1.5, { animate });
    control.setAttribute('aria-checked', String(checked));
  };
  render();
  control.addEventListener('click', () => { checked = !checked; render(); });
  refreshers.push(() => render(false));
  cleanups.push(() => thumb.destroy());
  select('#engine-status').textContent = 'Отклики готовы. Можно переключать быстро и менять размер окна.';
} catch (error) {
  select('#engine-status').textContent = 'Для капсул нужен доступ к CDN Motion. Кнопки и всплывающие поверхности работают без него.';
  console.error(error);
}

const popup = select('#popup');
const trigger = select('#popup-trigger');
let popupTimer;
const exitMs = (element) => parseFloat(getComputedStyle(element).animationDuration) * 1000 + 16;
const closePopup = () => {
  if (popup.hidden || popup.dataset.state === 'closed') return;
  popup.dataset.state = 'closed'; popup.inert = true; popup.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false'); trigger.focus();
  popupTimer = setTimeout(() => { popup.hidden = true; }, exitMs(popup));
};
trigger.addEventListener('click', () => {
  if (!popup.hidden && popup.dataset.state === 'open') { closePopup(); return; }
  clearTimeout(popupTimer); popup.hidden = false; popup.inert = false; popup.removeAttribute('aria-hidden');
  popup.dataset.side = select('#side').value; popup.dataset.state = 'open';
  trigger.setAttribute('aria-expanded', 'true'); popup.querySelector('button').focus();
});
popup.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { trigger.textContent = button.textContent; closePopup(); }));
popup.addEventListener('keydown', (event) => {
  const items = [...popup.querySelectorAll('button')];
  const index = items.indexOf(document.activeElement);
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  }
});
document.addEventListener('pointerdown', (event) => { if (!popup.parentElement.contains(event.target)) closePopup(); });

const sheetRoot = select('#sheet-root');
const sheet = sheetRoot.querySelector('.sheet');
const overlay = sheetRoot.querySelector('.sheet-overlay');
let sheetTimer;
const closeSheet = () => {
  if (sheetRoot.hidden || sheet.dataset.state === 'closed') return;
  for (const element of [sheet, overlay]) { element.dataset.state = 'closed'; element.inert = true; element.setAttribute('aria-hidden', 'true'); }
  select('main').inert = false;
  select('#sheet-trigger').focus();
  sheetTimer = setTimeout(() => { sheetRoot.hidden = true; }, exitMs(sheet));
};
select('#sheet-trigger').addEventListener('click', () => {
  clearTimeout(sheetTimer); sheetRoot.hidden = false;
  for (const element of [sheet, overlay]) { element.dataset.state = 'open'; element.inert = false; element.removeAttribute('aria-hidden'); }
  select('main').inert = true; select('#sheet-close').focus();
});
select('#sheet-close').addEventListener('click', closeSheet);
overlay.addEventListener('click', closeSheet);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!popup.hidden && popup.dataset.state === 'open') closePopup();
    else if (!sheetRoot.hidden) closeSheet();
  }
  if (event.key === 'Tab' && !sheetRoot.hidden && sheet.dataset.state === 'open') { event.preventDefault(); select('#sheet-close').focus(); }
});
window.addEventListener('pagehide', () => { clearTimeout(popupTimer); clearTimeout(sheetTimer); cleanups.forEach((cleanup) => cleanup()); });
