/* A preferência de visual é compartilhada apenas pelas páginas que carregam este script. */
(function () {
  'use strict';

  const key = 'huba:visual-version';
  const root = document.documentElement;
  const toolbar = document.querySelector('.huba-language');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'huba-visual-toggle';
  button.dataset.noTranslate = '';
  toolbar.appendChild(button);

  let legacyHud;
  let legacyBitsHud;
  function updateLabel() {
    const version = root.dataset.visual === '2' ? '1.0' : '2.0';
    const english = window.HUBA_I18N?.language === 'en';
    button.textContent = version;
    const label = (english ? 'Switch to Hubdle ' : 'Mudar para Hubdle ') + version;
    button.title = label;
    button.setAttribute('aria-label', label);
  }

  function apply(useNewVisual) {
    if (useNewVisual && root.dataset.visual !== '2') {
      legacyHud = root.dataset.hud;
      legacyBitsHud = root.dataset.bitsHud;
      root.dataset.hud = 'original';
      root.dataset.bitsHud = 'original';
      root.dataset.visual = '2';
    } else if (!useNewVisual && root.dataset.visual === '2') {
      root.dataset.hud = legacyHud;
      root.dataset.bitsHud = legacyBitsHud;
      delete root.dataset.visual;
    }
    updateLabel();
  }

  function loadPreference() {
    try { apply(localStorage.getItem(key) === '2'); } catch { updateLabel(); }
  }

  button.addEventListener('click', () => {
    const useNewVisual = root.dataset.visual !== '2';
    apply(useNewVisual);
    try { localStorage.setItem(key, useNewVisual ? '2' : '1'); } catch {}
  });
  document.addEventListener('huba:language', updateLabel);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) loadPreference();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) loadPreference();
  });
  loadPreference();
})();
