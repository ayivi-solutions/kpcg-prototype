/*
 * AYIVI Systems Limited — KPCG evaluation prototype guard.
 * Deterrence only: browser-delivered code cannot be made impossible to inspect.
 */
(() => {
  'use strict';

  const VERSION = 'v17.1-ipguard-20260913';
  const ALLOWED_HOSTS = new Set(['kpcg.ayivisolutions.com', 'localhost', '127.0.0.1']);
  const host = String(location.hostname || '').toLowerCase();
  const authorized = ALLOWED_HOSTS.has(host);

  window.__AYIVI_IP_GUARD__ = Object.freeze({ version: VERSION, authorized, host });
  document.documentElement.classList.add('ayivi-ip-protected');
  document.documentElement.dataset.ayiviIpGuard = VERSION;

  const editable = target => Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
  const block = event => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  if (!authorized) {
    const deny = () => {
      document.documentElement.classList.add('ayivi-ip-unauthorized');
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addWatermark, { once: true });
  else addWatermark();

  console.info('%cAYIVI PROTECTED PROTOTYPE', 'font-weight:700;color:#0b5139', VERSION);
})();
