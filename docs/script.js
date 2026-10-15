const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

const themeToggle = document.querySelector('#theme-toggle');
const themeStatus = document.querySelector('#theme-status');
function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const next = isDark ? 'light' : 'dark';
  themeToggle.querySelector('.theme-label').textContent = `${isDark ? 'Light' : 'Dark'} mode`;
  themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
  themeToggle.title = `Switch to ${next} mode`;
}
updateThemeButton();
window.addEventListener('portfolio:themechange', updateThemeButton);
themeToggle.addEventListener('click', () => {
  window.portfolioTheme.toggle();
  themeStatus.textContent = `${document.documentElement.dataset.theme === 'dark' ? 'Dark' : 'Light'} mode enabled.`;
});

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('span').textContent = isOpen ? '+' : '−';
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
const desktopMedia = typeof window.matchMedia === 'function'
  ? window.matchMedia('(min-width: 701px)')
  : null;
const onDesktopChange = event => {
  if (event.matches) closeMenu();
};
if (desktopMedia && typeof desktopMedia.addEventListener === 'function') {
  desktopMedia.addEventListener('change', onDesktopChange);
} else if (desktopMedia && typeof desktopMedia.addListener === 'function') {
  desktopMedia.addListener(onDesktopChange);
}
document.querySelector('#year').textContent = new Date().getFullYear();

const projectDialog = document.querySelector('#project-dialog');
const projectButton = document.querySelector('.project-open');
const projectClose = document.querySelector('.dialog-close');
const nativeDialog = typeof projectDialog.showModal === 'function';

function closeProject() {
  if (nativeDialog) projectDialog.close();
  else projectDialog.removeAttribute('open');
  projectButton.focus();
}

projectButton.addEventListener('click', () => {
  if (projectDialog.hasAttribute('open')) return;
  if (nativeDialog) projectDialog.showModal();
  else {
    // Older browsers receive a dismissible, nonmodal project panel.
    projectDialog.classList.add('dialog-fallback');
    projectDialog.setAttribute('role', 'dialog');
    projectDialog.setAttribute('open', '');
    projectClose.focus();
  }
});
projectClose.addEventListener('click', closeProject);
document.addEventListener('keydown', event => {
  if (!nativeDialog && event.key === 'Escape' && projectDialog.hasAttribute('open')) {
    closeProject();
  }
});
projectDialog.addEventListener('click', event => {
  if (event.target !== projectDialog) return;
  const bounds = projectDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject();
});
