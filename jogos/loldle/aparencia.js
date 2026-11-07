(function () {
  'use strict';

  const storageKey = 'huba:loldle:appearance:v1';
  const sizes = [
    ['--lol-width', 'Largura da página', 'Page width', 360, 1440, 1020],
    ['--lol-menu-width', 'Largura do menu', 'Menu width', 240, 1000, 580, 'menu'],
    ['--lol-gap', 'Espaço entre cartões', 'Space between cards', 0, 40, 12],
    ['--lol-padding', 'Espaço interno', 'Inner padding', 4, 40, 18],
    ['--lol-radius', 'Cantos arredondados', 'Corner radius', 0, 36, 14],
    ['--lol-text', 'Tamanho do texto', 'Text size', 12, 24, 16],
    ['--lol-title', 'Tamanho dos destaques', 'Heading size', 14, 36, 20],
    ['--lol-icon', 'Ícone de habilidade', 'Ability icon', 48, 240, 106, 'game'],
    ['--lol-splash', 'Largura da arte', 'Artwork width', 180, 1000, 540, 'game'],
    ['--lol-cell', 'Espaço nas linhas do Clássico', 'Classic row padding', 2, 24, 8, 'game'],
    ['--lol-suggestions', 'Altura das sugestões', 'Suggestion list height', 80, 420, 240, 'game'],
    ['--lol-shade', 'Escurecimento da foto', 'Photo dimming', 0, 90, 35]
  ];
  const colors = [
    ['--bg', 'Fundo', 'Background'], ['--card', 'Cartões', 'Cards'],
    ['--fg', 'Texto', 'Text'], ['--muted', 'Texto secundário', 'Muted text'],
    ['--accent', 'Destaque', 'Accent'], ['--accent-fg', 'Texto sobre destaque', 'Accent text'],
    ['--line', 'Bordas', 'Borders']
  ];
  const fits = ['cover', 'contain'];
  const positions = ['center', 'top', 'bottom', 'left', 'right'];
  const imagePattern = /^data:image\/(?:png|jpeg|webp|gif|avif);base64,[a-z0-9+/=]+$/i;
  const maxImageBytes = 1.5 * 1024 * 1024;
  const profiles = { menu: {}, game: {} };

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    for (const scope of ['menu', 'game']) {
      if (saved?.[scope] && typeof saved[scope] === 'object') profiles[scope] = saved[scope];
    }
  } catch {}

  function profileCss(scope) {
    const profile = profiles[scope];
    const rules = [];
    for (const [key, , , min, max] of sizes) {
      const value = profile[key];
      if (Number.isInteger(value) && value >= min && value <= max) {
        rules.push(`${key}: ${key === '--lol-shade' ? value / 100 : value + 'px'}`);
      }
    }
    for (const [key] of colors) {
      if (/^#[0-9a-f]{6}$/i.test(profile[key])) rules.push(`${key}: ${profile[key]}`);
    }
    if (fits.includes(profile.fit)) rules.push(`--lol-fit: ${profile.fit}`);
    if (positions.includes(profile.position)) rules.push(`--lol-position: ${profile.position}`);
    if (typeof profile.image === 'string' && imagePattern.test(profile.image)) {
      rules.push(`--lol-photo: url("${profile.image}")`);
    }
    const selector = scope === 'game' ? 'body.lol-page.lol-playing' : 'body.lol-page:not(.lol-playing)';
    return rules.length ? `${selector} {\n  ${rules.join(';\n  ')};\n}` : '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toolbar = document.querySelector('.lol-top .huba-language');
    if (!toolbar) return;
    const style = document.createElement('style');
    document.head.append(style);

    const editor = document.createElement('details');
    editor.className = 'lol-appearance';
    editor.dataset.noTranslate = '';
    editor.innerHTML = `<summary>🛠️</summary><div class="lol-appearance-panel">
      <h2></h2><p class="lol-appearance-scope"></p>
      <fieldset data-group="sizes"><legend></legend></fieldset>
      <fieldset data-group="colors"><legend></legend></fieldset>
      <fieldset data-group="photo"><legend></legend>
        <label><span data-copy="upload"></span></label>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" aria-labelledby="lol-upload-label">
        <label><span data-copy="fit"></span><select data-setting="fit"></select></label>
        <label><span data-copy="position"></span><select data-setting="position"></select></label>
        <button type="button" data-action="remove"></button>
      </fieldset>
      <div class="lol-appearance-actions">
        <button type="button" data-action="reset"></button>
        <button type="button" data-action="copy"></button>
      </div>
      <p role="status"></p><textarea hidden readonly rows="5" aria-label="CSS"></textarea>
    </div>`;
    toolbar.prepend(editor);
    const find = selector => editor.querySelector(selector);
    const title = find('summary');
    const panel = find('.lol-appearance-panel');
    const status = find('[role="status"]');
    const fileInput = find('input[type="file"]');
    const exportArea = find('textarea');
    const uploadLabel = find('[data-copy="upload"]');
    uploadLabel.id = 'lol-upload-label';
    const scope = () => document.body.classList.contains('lol-playing') ? 'game' : 'menu';
    const tr = (pt, en) => window.HUBA_I18N?.language === 'en' ? en : pt;

    function apply() {
      style.textContent = [profileCss('menu'), profileCss('game')].filter(Boolean).join('\n\n');
    }

    function save() {
      apply();
      try {
        localStorage.setItem(storageKey, JSON.stringify(profiles));
        status.textContent = '';
      } catch {
        status.textContent = tr('Prévia aplicada. O navegador não conseguiu salvar as preferências.', 'Preview applied. The browser could not save your settings.');
      }
    }

    const controls = [];
    function addControl(group, key, pt, en, limits, onlyOn) {
      const label = document.createElement('label');
      const text = document.createElement('span');
      const input = document.createElement('input');
      const output = limits ? document.createElement('output') : null;
      input.type = limits ? 'range' : 'color';
      if (limits) {
        input.min = limits[0];
        input.max = limits[1];
      }
      label.append(text, input);
      if (output) label.append(output);
      if (key === '--lol-shade') find('[data-group="photo"]').insertBefore(label, find('[data-action="remove"]'));
      else find(`[data-group="${group}"]`).append(label);
      controls.push({ key, pt, en, label, text, input, output, limits, onlyOn });
      input.addEventListener('input', () => {
        profiles[scope()][key] = limits ? input.valueAsNumber : input.value;
        if (output) output.value = input.value + (key === '--lol-shade' ? '%' : '');
        save();
      });
    }
    for (const [key, pt, en, min, max, initial, onlyOn] of sizes) {
      addControl('sizes', key, pt, en, [min, max, initial], onlyOn);
    }
    for (const [key, pt, en] of colors) addControl('colors', key, pt, en);

    const choices = {
      fit: [['cover', 'Preencher', 'Fill'], ['contain', 'Mostrar inteira', 'Fit entire photo']],
      position: [['center', 'Centro', 'Center'], ['top', 'Topo', 'Top'], ['bottom', 'Embaixo', 'Bottom'], ['left', 'Esquerda', 'Left'], ['right', 'Direita', 'Right']]
    };
    for (const select of editor.querySelectorAll('select')) {
      select.addEventListener('change', () => {
        profiles[scope()][select.dataset.setting] = select.value;
        save();
      });
    }

    function refresh() {
      const current = scope();
      const profile = profiles[current];
      const heading = tr('Editar aparência', 'Edit appearance');
      title.title = heading;
      title.setAttribute('aria-label', heading);
      find('h2').textContent = heading;
      find('.lol-appearance-scope').textContent = current === 'menu' ? tr('Editando o menu', 'Editing the menu') : tr('Editando a tela de partida', 'Editing the game screen');
      find('[data-group="sizes"] legend').textContent = tr('Tamanhos e espaçamento', 'Sizes and spacing');
      find('[data-group="colors"] legend').textContent = tr('Cores', 'Colors');
      find('[data-group="photo"] legend').textContent = tr('Foto de fundo', 'Background photo');
      uploadLabel.textContent = tr('Escolher imagem de até 1,5 MB', 'Choose an image up to 1.5 MB');
      find('[data-copy="fit"]').textContent = tr('Encaixe', 'Fit');
      find('[data-copy="position"]').textContent = tr('Posição', 'Position');
      find('[data-action="remove"]').textContent = tr('Remover foto', 'Remove photo');
      find('[data-action="remove"]').disabled = !profile.image;
      find('[data-action="reset"]').textContent = tr('Restaurar esta tela', 'Reset this screen');
      find('[data-action="copy"]').textContent = tr('Copiar CSS', 'Copy CSS');
      const theme = getComputedStyle(document.documentElement);
      for (const { key, pt, en, label, text, input, output, limits, onlyOn } of controls) {
        label.hidden = Boolean(onlyOn && onlyOn !== current);
        text.textContent = tr(pt, en);
        input.value = profile[key] ?? (limits ? limits[2] : theme.getPropertyValue(key).trim());
        if (output) output.value = input.value + (key === '--lol-shade' ? '%' : '');
      }
      for (const select of editor.querySelectorAll('select')) {
        const key = select.dataset.setting;
        select.replaceChildren(...choices[key].map(([value, pt, en]) => new Option(tr(pt, en), value)));
        select.value = profile[key] ?? choices[key][0][0];
      }
    }

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const current = scope();
      const profile = profiles[current];
      fileInput.disabled = true;
      try {
        if (file.size > maxImageBytes) throw new Error('size');
        const image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        if (!imagePattern.test(image)) throw new Error('format');
        const preview = new Image();
        preview.src = image;
        await preview.decode();
        if (profiles[current] === profile) {
          profile.image = image;
          save();
          refresh();
        }
      } catch (error) {
        status.textContent = error.message === 'size'
          ? tr('A imagem precisa ter até 1,5 MB.', 'The image must be 1.5 MB or smaller.')
          : tr('Não foi possível abrir essa imagem.', 'Could not open this image.');
      } finally {
        fileInput.value = '';
        fileInput.disabled = false;
      }
    });

    find('[data-action="remove"]').onclick = () => {
      delete profiles[scope()].image;
      save();
      refresh();
    };
    find('[data-action="reset"]').onclick = () => {
      profiles[scope()] = {};
      exportArea.hidden = true;
      save();
      refresh();
    };
    find('[data-action="copy"]').onclick = async () => {
      const css = style.textContent;
      if (!css) {
        status.textContent = tr('Faça um ajuste para gerar o CSS.', 'Change a setting to generate CSS.');
        return;
      }
      try {
        await navigator.clipboard.writeText(css);
        exportArea.hidden = true;
        status.textContent = tr('CSS copiado.', 'CSS copied.');
      } catch {
        exportArea.value = css;
        exportArea.hidden = false;
        exportArea.select();
        status.textContent = tr('Use Ctrl+C para copiar o CSS selecionado.', 'Use Ctrl+C to copy the selected CSS.');
      }
    };

    function positionPanel() {
      const top = title.getBoundingClientRect().bottom + 8;
      panel.style.top = `${top}px`;
      panel.style.maxHeight = `${Math.max(100, innerHeight - top - 8)}px`;
    }
    title.addEventListener('click', positionPanel);
    editor.addEventListener('toggle', () => { if (editor.open) positionPanel(); });
    window.addEventListener('resize', () => { if (editor.open) positionPanel(); });
    editor.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        editor.open = false;
        title.focus();
        event.stopPropagation();
      }
    });
    document.addEventListener('huba:language', refresh);
    new MutationObserver(refresh).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    apply();
    refresh();
  });
})();
