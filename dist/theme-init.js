(() => {
  const key = 'bruce-portfolio-theme';
  const system = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  const valid = value => value === 'light' || value === 'dark';
  let choice = null;
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) choice = saved;
  } catch { /* The theme works even when browser storage is unavailable. */ }

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#151a20' : '#faf9f6';
    window.dispatchEvent(new Event('portfolio:themechange'));
  }
  function systemTheme() { return system && system.matches ? 'dark' : 'light'; }

  window.portfolioTheme = {
    toggle() {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch { /* Keep the current choice for this visit. */ }
      apply(choice);
    }
  };
  apply(choice || systemTheme());
  const onSystemChange = () => { if (!choice) apply(systemTheme()); };
  if (system && typeof system.addEventListener === 'function') {
    system.addEventListener('change', onSystemChange);
  } else if (system && typeof system.addListener === 'function') {
    system.addListener(onSystemChange);
  }
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = valid(event.newValue) ? event.newValue : null;
    apply(choice || systemTheme());
  });
})();
