/*
 * AYIVI Systems Limited — KPCG evaluation prototype guard + theme controller.
 * Deterrence only: browser-delivered code cannot be made impossible to inspect.
 */
(() => {
  'use strict';

  const VERSION = 'v18.2-theme-20260914';
  const ALLOWED_HOSTS = new Set(['kpcg.ayivisolutions.com', 'localhost', '127.0.0.1']);
  const host = String(location.hostname || '').toLowerCase();
  const authorized = ALLOWED_HOSTS.has(host);
  const root = document.documentElement;

  window.__AYIVI_IP_GUARD__ = Object.freeze({ version: VERSION, authorized, host });
  root.classList.add('ayivi-ip-protected');
  root.dataset.ayiviIpGuard = VERSION;
  root.dataset.themeContract = 'v18.2';

  /* ---------------------------------------------------------------------
     KPCG day / night mode
     - first visit follows the operating-system preference
     - explicit light/dark choice persists across sessions and tabs
     - the visible glyph represents the CURRENT state: sun=day, moon=night
     - accessible labels describe the ACTION that clicking will perform
     - the header control is re-mounted after route/DOM re-renders
     --------------------------------------------------------------------- */
  const THEME_KEY = 'kpcg-theme';
  const systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const storedTheme = () => {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_) {
      return null;
    }
  };

  const resolvedSystemTheme = () => systemDark?.matches ? 'dark' : 'light';
  const currentTheme = () => root.dataset.theme === 'dark' ? 'dark' : 'light';

  const writeTheme = theme => {
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  };

  const setMetaContent = (name, value) => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta && meta.getAttribute('content') !== value) meta.setAttribute('content', value);
  };

  // IMPORTANT: glyph communicates CURRENT mode, not the destination action.
  const themeGlyph = theme => theme === 'dark' ? '☾' : '☀︎';

  const syncThemeToggle = button => {
    if (!button) return;
    const theme = currentTheme();
    const dark = theme === 'dark';
    const pressed = dark ? 'true' : 'false';
    const label = dark ? 'Switch to day mode' : 'Switch to night mode';
    const title = dark ? 'Night mode — switch to day mode' : 'Day mode — switch to night mode';
    button.dataset.themeMode = theme;
    if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    if (button.getAttribute('title') !== title) button.setAttribute('title', title);
    const glyph = button.querySelector('.kpcg-theme-glyph');
    const nextGlyph = themeGlyph(theme);
    if (glyph && glyph.textContent !== nextGlyph) glyph.textContent = nextGlyph;
  };

  const syncAllThemeToggles = () => {
    document.querySelectorAll('.kpcg-theme-toggle').forEach(syncThemeToggle);
  };

  const applyTheme = (theme, { persist = false } = {}) => {
    const next = theme === 'dark' ? 'dark' : 'light';
    if (root.dataset.theme !== next) root.dataset.theme = next;
    if (root.style.colorScheme !== next) root.style.colorScheme = next;
    root.classList.add('kpcg-theme-ready');
    setMetaContent('theme-color', next === 'dark' ? '#0b1210' : '#0b5139');
    setMetaContent('color-scheme', next);
    if (persist) writeTheme(next);
    syncAllThemeToggles();
    window.dispatchEvent(new CustomEvent('kpcg:themechange', { detail: { theme: next, persisted: persist } }));
    return next;
  };

  const toggleTheme = () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', { persist: true });

  // Resolve the theme as early as this deferred guard script runs.
  applyTheme(storedTheme() || resolvedSystemTheme());

  const ensureThemeToggle = () => {
    const actions = document.querySelector('.header-actions');
    if (!actions) return;
    let button = actions.querySelector('.kpcg-theme-toggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'icon-btn kpcg-theme-toggle';
      button.innerHTML = '<span class="kpcg-theme-glyph" aria-hidden="true"></span>';
      button.addEventListener('click', toggleTheme);
      const search = actions.querySelector('[data-open-search]');
      const menu = actions.querySelector('#menuToggle,[data-menu-toggle]');
      actions.insertBefore(button, search || menu || actions.firstChild);
    }
    syncThemeToggle(button);
  };

  let themeMountQueued = false;
  const queueThemeMount = () => {
    if (themeMountQueued) return;
    themeMountQueued = true;
    requestAnimationFrame(() => {
      themeMountQueued = false;
      ensureThemeToggle();
    });
  };

  if (systemDark) {
    const onSystemThemeChange = event => {
      if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    };
    if (typeof systemDark.addEventListener === 'function') systemDark.addEventListener('change', onSystemThemeChange);
    else if (typeof systemDark.addListener === 'function') systemDark.addListener(onSystemThemeChange);
  }

  window.addEventListener('storage', event => {
    if (event.key !== THEME_KEY) return;
    const value = event.newValue;
    applyTheme(value === 'light' || value === 'dark' ? value : resolvedSystemTheme());
  });

  window.KPCGTheme = Object.freeze({
    get: currentTheme,
    set: theme => applyTheme(theme, { persist: true }),
    toggle: toggleTheme,
    useSystem: () => {
      try { localStorage.removeItem(THEME_KEY); } catch (_) {}
      return applyTheme(resolvedSystemTheme());
    }
  });

  const editable = target => Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
  const block = event => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  if (!authorized) {
    const deny = () => {
      root.classList.add('ayivi-ip-unauthorized');
      document.body.innerHTML = '<main class="ayivi-ip-denied"><div><h1>Unauthorized deployment</h1><p>This AYIVI evaluation prototype is authorized only on the approved review domain. This copy is not an authorized KPCG/AYIVI deployment.</p></div></main>';
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', deny, { once: true });
    else deny();
    return;
  }

  document.addEventListener('contextmenu', e => editable(e.target) ? undefined : block(e), true);
  document.addEventListener('copy', e => editable(e.target) ? undefined : block(e), true);
  document.addEventListener('cut', e => editable(e.target) ? undefined : block(e), true);
  document.addEventListener('selectstart', e => editable(e.target) ? undefined : block(e), true);
  document.addEventListener('dragstart', e => {
    if (e.target?.closest?.('img,svg,picture,a')) block(e);
  }, true);

  document.addEventListener('keydown', e => {
    if (editable(e.target)) return;
    const key = String(e.key || '').toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    const devtoolsCombo = (mod && e.shiftKey && ['i','j','c','k'].includes(key)) ||
      (e.metaKey && e.altKey && ['i','j','c'].includes(key));
    const protectedShortcut = mod && ['a','c','x','s','u','p'].includes(key);
    if (e.key === 'F12' || devtoolsCombo || protectedShortcut || e.key === 'PrintScreen') block(e);
  }, true);

  const addWatermark = () => {
    if (document.querySelector('.ayivi-ip-watermark')) return;
    const el = document.createElement('div');
    el.className = 'ayivi-ip-watermark';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = 'AYIVI • Protected Evaluation Prototype';
    document.body.appendChild(el);
  };

  /* ---------------------------------------------------------------------
     v18 continuous-scroll section navigation
     Keep the user's selected anchor canonical until the smooth scroll has
     settled so scroll-spy cannot race the address-bar hash mid-transition.
     --------------------------------------------------------------------- */
  const installContinuousNavigation = () => {
    if (root.dataset.release !== 'v18.0' || !document.body || document.body.dataset.kpcgContinuousNav === '1') return;
    document.body.dataset.kpcgContinuousNav = '1';
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    document.addEventListener('click', event => {
      const anchor = event.target?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!/^#[A-Za-z][A-Za-z0-9_-]*$/.test(href)) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;

      event.preventDefault();
      const started = performance.now();
      const settleForMs = reducedMotion ? 120 : 2400;
      history.replaceState(null, '', href);
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });

      const settle = now => {
        if (location.hash !== href) history.replaceState(null, '', href);
        const header = document.getElementById('siteHeader');
        const desiredTop = header ? Math.round(header.getBoundingClientRect().height) : 0;
        const actualTop = Math.round(target.getBoundingClientRect().top);
        const settled = Math.abs(actualTop - desiredTop) <= 24;
        if (!settled && now - started < settleForMs) requestAnimationFrame(settle);
        else history.replaceState(null, '', href);
      };
      requestAnimationFrame(settle);
    }, false);
  };

  const loadEditorialRedesign = () => {
    // The editorial compatibility layer belongs only to the retained detailed
    // application. The new continuous public page has its own native layout.
    if (!document.querySelector('#app')) return;
    if (document.querySelector('script[data-kpcg-editorial-loader]')) return;
    const script = document.createElement('script');
    script.src = '/editorial-redesign-v3.js?v=18.0-20260913';
    script.defer = true;
    script.dataset.kpcgEditorialLoader = 'v18.0';
    script.onerror = () => console.warn('KPCG editorial redesign layer did not load; base prototype remains available.');
    document.head.appendChild(script);
  };

  const installThemeObserver = () => {
    ensureThemeToggle();
    const target = document.querySelector('#app') || document.body;
    if (!target || target.dataset.kpcgThemeObserver === '1') return;
    target.dataset.kpcgThemeObserver = '1';
    const observer = new MutationObserver(queueThemeMount);
    observer.observe(target, { childList: true, subtree: true });
  };

  const bootGuard = () => {
    addWatermark();
    installThemeObserver();
    installContinuousNavigation();
    loadEditorialRedesign();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootGuard, { once: true });
  else bootGuard();

  window.addEventListener('hashchange', queueThemeMount);
  window.addEventListener('pageshow', queueThemeMount);

  console.info('%cAYIVI PROTECTED PROTOTYPE', 'font-weight:700;color:#0b5139', VERSION);
})();