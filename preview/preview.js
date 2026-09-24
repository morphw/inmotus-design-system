const body = document.body;
const themeButton = document.querySelector('#theme-toggle');
const themeIcon = themeButton.querySelector('use');
const themeLabel = themeButton.querySelector('span');

themeButton.addEventListener('click', () => {
  const dark = body.dataset.inmotusTheme !== 'dark';
  body.dataset.inmotusTheme = dark ? 'dark' : 'light';
  themeIcon.setAttribute('href', dark ? '#i-sun' : '#i-moon');
  themeLabel.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
  themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
});

document.querySelectorAll('.inmotus-segmented button').forEach((button) => {
  button.addEventListener('click', () => {
    button.parentElement.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  });
});

document.querySelectorAll('.preview-sidebar .inmotus-nav-item, .preview-mobile-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    document.querySelectorAll('.preview-sidebar .inmotus-nav-item, .preview-mobile-nav a').forEach((item) => {
      if (item.getAttribute('href') === href) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  });
});

const dialog = document.querySelector('#demo-dialog');
const dialogOpen = document.querySelector('#open-dialog');
const dialogClose = document.querySelector('#close-dialog');
const closeDialog = () => {
  dialog.hidden = true;
  dialogOpen.focus();
};
dialogOpen.addEventListener('click', () => { dialog.hidden = false; dialogClose.focus(); });
dialogClose.addEventListener('click', closeDialog);
document.querySelector('#dialog-done').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
document.addEventListener('keydown', (event) => {
  if (dialog.hidden) return;
  if (event.key === 'Escape') closeDialog();
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled])')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
