// Dependency-free regression checks for initialization and browser API fallbacks.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const dist = path.resolve(__dirname, '../dist');

function setup({ legacyMedia = false, missingMedia = false, nativeDialog = true, blockedStorage = false, saved = null, dark = false } = {}) {
  const listeners = new Map();
  let focused = null;
  let stored = saved;
  function events(target) {
    target.addEventListener = (type, fn) => {
      const handlers = listeners.get(target) || {};
      (handlers[type] ||= []).push(fn);
      listeners.set(target, handlers);
    };
    target.emit = (type, event = {}) => (listeners.get(target)?.[type] || []).forEach(fn => fn(event));
    return target;
  }
  function element() {
    const attributes = new Map();
    const classes = new Set();
    return events({
      dataset: {}, style: {}, textContent: '', children: {},
      setAttribute: (key, value) => attributes.set(key, String(value)),
      getAttribute: key => attributes.get(key) ?? null,
      removeAttribute: key => attributes.delete(key),
      hasAttribute: key => attributes.has(key),
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) },
      querySelector(selector) { return this.children[selector]; },
      querySelectorAll() { return []; },
      focus() { focused = this; },
      getBoundingClientRect: () => ({left:0, top:0, right:100, bottom:100})
    });
  }
  const selectors = ['.menu-toggle', '#site-nav', '#theme-toggle', '#theme-status', '#year', '#project-dialog', '.project-open', '.dialog-close', 'meta[name="theme-color"]'];
  const elements = Object.fromEntries(selectors.map(selector => [selector, element()]));
  elements['.menu-toggle'].children.span = element();
  elements['#theme-toggle'].children['.theme-label'] = element();
  const dialog = elements['#project-dialog'];
  if (nativeDialog) {
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => dialog.removeAttribute('open');
  }
  const document = events({ documentElement: element(), querySelector: selector => elements[selector] });
  const queries = new Map();
  const window = events({});
  window.dispatchEvent = event => window.emit(event.type, event);
  if (!missingMedia) window.matchMedia = query => {
    if (!queries.has(query)) {
      const media = { matches: query.includes('color-scheme') && dark };
      const listen = (...args) => { media.change = args[args.length - 1]; };
      if (legacyMedia) media.addListener = listen;
      else media.addEventListener = listen;
      queries.set(query, media);
    }
    return queries.get(query);
  };
  const context = vm.createContext({window, document, Date, Event: class { constructor(type) { this.type = type; } }, localStorage: {
    getItem() { if (blockedStorage) throw Error('Blocked storage'); return stored; },
    setItem(_, value) { if (blockedStorage) throw Error('Blocked storage'); stored = value; }
  }});
  for (const file of ['theme-init.js', 'script.js']) vm.runInContext(fs.readFileSync(path.join(dist, file), 'utf8'), context, { filename: file });
  return {window, document, elements, queries, get stored() { return stored; }, get focused() { return focused; }};
}

for (const options of [{}, {legacyMedia:true, nativeDialog:false}, {missingMedia:true, nativeDialog:false}, {blockedStorage:true}]) {
  const app = setup(options);
  const root = app.document.documentElement;
  assert.equal(root.dataset.theme, 'light');
  app.elements['#theme-toggle'].emit('click');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(app.elements['#theme-toggle'].getAttribute('aria-label'), 'Switch to light mode');
  app.elements['.menu-toggle'].emit('click');
  assert.equal(app.elements['.menu-toggle'].getAttribute('aria-expanded'), 'true');
  app.document.emit('keydown', {key:'Escape'});
  assert.equal(app.elements['.menu-toggle'].getAttribute('aria-expanded'), 'false');
  app.elements['.project-open'].emit('click');
  assert.equal(app.elements['#project-dialog'].hasAttribute('open'), true);
  app.elements['.dialog-close'].emit('click');
  assert.equal(app.elements['#project-dialog'].hasAttribute('open'), false);
  assert.equal(app.focused, app.elements['.project-open']);
  if (options.nativeDialog === false) {
    app.elements['.project-open'].emit('click');
    app.document.emit('keydown', {key:'Escape'});
    assert.equal(app.elements['#project-dialog'].hasAttribute('open'), false);
  }
}
const saved = setup({dark:true, saved:'light'});
assert.equal(saved.document.documentElement.dataset.theme, 'light');
saved.elements['#theme-toggle'].emit('click');
assert.equal(saved.stored, 'dark');
const device = setup({legacyMedia:true});
const media = device.queries.get('(prefers-color-scheme: dark)');
media.matches = true;
media.change(media);
assert.equal(device.document.documentElement.dataset.theme, 'dark');
device.elements['#theme-toggle'].emit('click');
media.change(media);
assert.equal(device.document.documentElement.dataset.theme, 'light');
console.log('PASS: modern/legacy/missing media APIs, storage failures, persisted preferences, menu dismissal, project opening/closing and focus restoration.');
