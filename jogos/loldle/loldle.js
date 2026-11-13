'use strict';

const byId = id => document.getElementById(id);
const modes = {
  classic: ['Clássico', 'Compare as pistas de cada palpite para encontrar o campeão.'],
  quote: ['Falas', 'De qual campeão é esta fala de seleção?'],
  ability: ['Habilidade', 'A qual campeão pertence este ícone?'],
  splash: ['Splash art', 'A arte fica mais nítida a cada palpite válido.']
};

const positionOverrides = { Nunu: ['JUNGLE'], Talon: ['MID', 'JUNGLE'] };
const labels = {
  FEMALE: 'Feminino', MALE: 'Masculino', OTHER: 'Outro',
  TOP: 'Topo', MID: 'Meio', JUNGLE: 'Selva', BOTTOM: 'Atirador', SUPPORT: 'Suporte',
  MELEE: 'Corpo a corpo', RANGED: 'À distância', None: 'Sem recurso',
  Human: 'Humano', Undead: 'Morto-vivo', 'Void-Being': 'Ser do Vazio',
  Ionia: 'Ionia', 'Shadow Isles': 'Ilhas das Sombras', 'Bandle City': 'Bandópolis',
  Bilgewater: 'Águas de Sentina', 'The Void': 'Vazio'
};
const fields = ['gender', 'positions', 'species', 'resource', 'attackType', 'regions', 'releaseYear'];
const splashAspectRatio = 1215 / 717;
const day = HUBA.dayKey();
let roster;
let champions;
let quoteCatalog;
let quoteRoster;
let mode;
let answer;
let guesses = [];
let suggestions = [];
let splashCenter;
const lastTrainingAnswers = new Map();

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path);
  return response.json();
}

function normalize(value) {
  return HUBA.norm(value).replace(/[^a-z0-9]/g, '');
}

function storageKey() {
  return 'huba:loldle:v1:' + day + ':' + mode;
}

function restoreGuesses() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()));
    if (saved?.answer === answer.id && Array.isArray(saved.guesses)) {
      const valid = [...new Set(saved.guesses.filter(id => champions.has(id)))];
      const winner = valid.indexOf(answer.id);
      return winner < 0 ? valid : valid.slice(0, winner + 1);
    }
  } catch {}
  return [];
}

function pickDaily(items, key) {
  const order = HUBA.shuffle(items.slice(), HUBA.mulberry(HUBA.hash('huba:loldle:v1:' + key)));
  const dayNumber = Math.floor(Date.parse(day) / 86400000);
  return order[dayNumber % order.length];
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function selectMode(next, focus = false) {
  mode = next;
  byId('mode-selection').hidden = true;
  byId('play').classList.remove('hidden');
  byId('back-modes').hidden = false;
  byId('hub-link').hidden = true;
  document.body.classList.add('lol-playing');
  const eligible = mode === 'quote' ? quoteRoster : roster.filter(champion => {
    if (mode === 'ability') return champion.abilities.length;
    if (mode === 'splash') return champion.skins.length;
    return true;
  });
  if (HUBA.isDaily) {
    answer = pickDaily(eligible, mode);
    guesses = restoreGuesses();
  } else {
    const available = eligible.filter(champion => champion.id !== lastTrainingAnswers.get(mode));
    answer = pickRandom(available.length ? available : eligible);
    lastTrainingAnswers.set(mode, answer.id);
    guesses = [];
  }
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  });
  byId('play').dataset.lolMode = mode;
  byId('mode-title').textContent = modes[mode][0];
  byId('prompt').textContent = modes[mode][1];
  byId('guess').value = '';
  renderSuggestions();
  byId('feedback').textContent = '';
  byId('history-toggle').setAttribute('aria-expanded', 'false');
  renderClue();
  renderRound();
  if (focus) (byId('guess').disabled ? byId('mode-title') : byId('guess')).focus();
}

function renderClue() {
  const clue = byId('clue');
  clue.querySelector('audio')?.pause();
  clue.replaceChildren();
  clue.hidden = mode === 'classic';
  if (mode === 'classic') return;

  if (mode === 'quote') {
    const inPortuguese = window.HUBA_I18N?.language !== 'en';
    const audioLocale = inPortuguese ? 'pt_br' : 'default';
    const quote = document.createElement('blockquote');
    quote.dataset.noTranslate = '';
    const transcript = quoteCatalog.transcripts[answer.numericId];
    const text = inPortuguese ? transcript.pt : transcript.en;
    quote.textContent = text.startsWith('[') ? text : '“' + text + '”';
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'none';
    audio.setAttribute('aria-label', 'Fala de seleção do campeão');
    audio.src = 'https://raw.communitydragon.org/' + quoteCatalog.audioVersion +
      '/plugins/rcp-be-lol-game-data/global/' + audioLocale + '/v1/champion-choose-vo/' + answer.numericId + '.ogg';
    const caption = document.createElement('p');
    caption.className = 'note';
    caption.textContent = inPortuguese ? 'Áudio em português do Brasil' : 'Áudio em inglês';
    audio.addEventListener('error', () => {
      caption.textContent = 'Áudio indisponível. Use a frase acima como pista.';
    });
    clue.append(quote, audio, caption);
    return;
  }

  const assets = mode === 'ability' ? answer.abilities : answer.skins;
  const asset = HUBA.isDaily ? pickDaily(assets, mode + ':' + answer.id) : pickRandom(assets);
  const frame = document.createElement('div');
  frame.className = 'lol-media lol-' + mode;
  const image = new Image();
  image.alt = mode === 'ability' ? 'Ícone da habilidade misteriosa' : 'Arte misteriosa de uma skin';
  image.src = asset.url;
  image.addEventListener('error', () => {
    frame.textContent = 'Imagem indisponível. Tente recarregar a página.';
  });
  frame.append(image);
  if (mode === 'splash') {
    const random = HUBA.isDaily
      ? HUBA.mulberry(HUBA.hash(storageKey() + ':reveal:' + answer.id))
      : Math.random;
    splashCenter = { x: random() * 100, y: random() * 100 };
    const reveal = image.cloneNode();
    reveal.alt = '';
    reveal.className = 'lol-splash-reveal';
    frame.append(reveal);
  }
  clue.append(frame);
  const caption = document.createElement('p');
  caption.className = 'note';
  caption.id = 'asset-name';
  caption.dataset.name = asset.name === 'default' ? answer.name + ' · Arte base' : asset.name;
  clue.append(caption);
}

function formatField(champion, field) {
  const values = Array.isArray(champion[field]) ? champion[field] : [champion[field]];
  return values.map(value => labels[value] ?? value).join(', ');
}

function compare(guess, target) {
  const values = new Set(Array.isArray(guess) ? guess : [guess]);
  const expected = new Set(Array.isArray(target) ? target : [target]);
  const overlap = [...values].filter(value => expected.has(value)).length;
  if (overlap === values.size && overlap === expected.size) return 'match';
  return overlap ? 'partial' : 'miss';
}

function renderComparison(champion) {
  const row = document.createElement('tr');
  const name = document.createElement('th');
  name.scope = 'row';
  const portrait = new Image(76, 76);
  portrait.alt = '';
  portrait.src = champion.portrait;
  const label = document.createElement('span');
  label.textContent = champion.name;
  name.append(portrait, label);
  row.append(name);
  for (const field of fields) {
    const cell = document.createElement('td');
    const result = compare(champion[field], answer[field]);
    let symbol = { match: '✓', partial: '◐', miss: '×' }[result];
    if (field === 'releaseYear' && result === 'miss') {
      symbol = answer.releaseYear > champion.releaseYear ? '↑' : '↓';
    }
    cell.className = 'lol-' + result;
    cell.textContent = formatField(champion, field) + ' ' + symbol;
    row.append(cell);
  }
  return row;
}

function updateStreak() {
  byId('statDailyStreak').textContent = HUBA.currentStreak('loldle');
}

function renderSplash(won) {
  const reveal = document.querySelector('.lol-splash-reveal');
  if (!reveal) return;

  const blur = won ? 0 : Math.max(0, 32 - guesses.length * 4);
  reveal.parentElement.style.setProperty('--splash-blur', blur + 'px');
  if (!blur) {
    reveal.style.clipPath = 'inset(0)';
    return;
  }

  const height = 12 + guesses.length * 10;
  const width = height / splashAspectRatio;
  const left = Math.max(0, Math.min(splashCenter.x - width / 2, 100 - width));
  const top = Math.max(0, Math.min(splashCenter.y - height / 2, 100 - height));
  const right = 100 - left - width;
  const bottom = 100 - top - height;
  reveal.style.clipPath = `inset(${top}% ${right}% ${bottom}% ${left}%)`;
}

function renderRound() {
  const won = guesses.includes(answer.id);
  if (won && HUBA.isDaily) HUBA.recordDailyStreak('loldle', day);
  byId('play').classList.toggle('lol-complete', won);
  byId('finish-actions').hidden = !won;
  if (won) {
    const order = Object.keys(modes);
    const next = order.slice(order.indexOf(mode) + 1)
      .find(id => id !== 'quote' || quoteRoster.length);
    const nextButton = byId('next-mode');
    nextButton.hidden = !next;
    byId('finish-hub').hidden = !!next;
    if (next) {
      nextButton.textContent = 'Jogar ' + modes[next][0] + ' ›';
      nextButton.onclick = () => selectMode(next, true);
    }
    byId('result-portrait').src = answer.portrait;
    byId('result-champion').textContent = answer.name;
  }
  byId('next-round').hidden = !won || HUBA.isDaily;
  updateStreak();
  byId('result').hidden = !won;
  byId('prompt').hidden = won;
  byId('guess-form').hidden = won;
  byId('guess').disabled = won;
  const count = byId('count');
  count.textContent = guesses.length === 1 ? '1 palpite' : guesses.length + ' palpites';
  if (won) byId('finish-actions').before(count);
  else byId('feedback').after(count);
  const assetName = byId('asset-name');
  if (assetName) assetName.textContent = won ? assetName.dataset.name : '';
  if (mode === 'splash') renderSplash(won);

  const classic = mode === 'classic';
  byId('classic-history').hidden = !classic || !guesses.length;
  byId('guess-history').hidden = classic || !guesses.length;
  const history = classic ? byId('comparison') : byId('guess-history');
  history.replaceChildren();
  for (const id of guesses.slice().reverse()) {
    const champion = champions.get(id);
    if (classic) {
      history.append(renderComparison(champion));
    } else {
      const item = document.createElement('li');
      const correct = id === answer.id;
      item.className = correct ? 'ok' : 'no';
      const mark = document.createElement('span');
      mark.className = 'lol-guess-mark';
      mark.textContent = correct ? '✓' : '×';
      item.append(mark, ' ' + champion.name);
      history.append(item);
    }
  }
}

function closeSuggestions() {
  byId('champions').hidden = true;
}

function renderSuggestions() {
  const query = normalize(byId('guess').value);
  const list = byId('champions');
  list.replaceChildren();
  suggestions = query ? roster
    .filter(entry => !guesses.includes(entry.id) && normalize(entry.name).startsWith(query))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 8) : [];
  for (const champion of suggestions) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const portrait = new Image(36, 36);
    portrait.src = champion.portrait;
    portrait.alt = '';
    button.append(portrait, champion.name);
    button.addEventListener('click', () => {
      byId('guess').value = champion.name;
      closeSuggestions();
      byId('guess').focus();
    });
    item.append(button);
    list.append(item);
  }
  list.hidden = !suggestions.length;
}

function submitGuess(event) {
  event.preventDefault();
  if (guesses.includes(answer.id)) return;
  const input = byId('guess');
  const value = normalize(input.value);
  const exact = value && roster.find(entry =>
    normalize(entry.name) === value || normalize(entry.id) === value
  );
  const firstSuggestion = byId('champions').hidden ? null : suggestions[0];
  const champion = firstSuggestion || exact;
  if (!champion || guesses.includes(champion.id)) {
    byId('feedback').textContent = champion ? 'Você já tentou este campeão.' : 'Escolha um campeão da lista.';
    input.focus();
    return;
  }
  guesses.push(champion.id);
  if (HUBA.isDaily) {
    try { localStorage.setItem(storageKey(), JSON.stringify({ answer: answer.id, guesses })); } catch {}
  }
  input.value = '';
  renderSuggestions();
  byId('feedback').textContent = champion.id === answer.id ? '' : champion.name + ' não é a resposta.';
  renderRound();
  if (!input.disabled) input.focus();
}

async function init() {
  updateStreak();
  window.addEventListener('pageshow', updateStreak);
  window.addEventListener('storage', updateStreak);
  const [source, dragon, quotes] = await Promise.all([
    loadJson('output.json'),
    loadJson('champion.json'),
    loadJson('quote-transcripts.json').catch(error => {
      console.error('Falha ao carregar as transcrições do LoLdle.', error);
      return null;
    })
  ]);
  roster = source.map(entry => {
    const official = dragon.data[entry.id];
    const resource = official.partype.trim();
    return {
      ...entry,
      name: official.name,
      numericId: official.key,
      portrait: 'https://ddragon.leagueoflegends.com/cdn/' + dragon.version + '/img/champion/' + official.image.full,
      resource: !resource || /^(none|sem recurso|nenhum)$/i.test(resource) ? 'None' : resource,
      positions: positionOverrides[entry.id] ?? entry.positions
    };
  });
  champions = new Map(roster.map(champion => [champion.id, champion]));
  quoteCatalog = quotes;
  quoteRoster = roster.filter(champion => {
    const transcript = quoteCatalog?.transcripts?.[champion.numericId];
    return transcript?.pt && transcript.en;
  });
  const form = byId('guess-form');
  byId('guess').addEventListener('input', renderSuggestions);
  form.addEventListener('focusout', event => {
    if (!form.contains(event.relatedTarget)) closeSuggestions();
  });
  form.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSuggestions();
      byId('guess').focus();
    }
  });
  byId('next-round').addEventListener('click', () => selectMode(mode, true));
  const historyToggle = byId('history-toggle');
  historyToggle.addEventListener('click', () => {
    historyToggle.setAttribute('aria-expanded', String(historyToggle.getAttribute('aria-expanded') !== 'true'));
  });
  document.addEventListener('huba:language', () => {
    if (mode === 'quote' && !byId('play').classList.contains('hidden')) {
      renderClue();
    }
  });
  document.addEventListener('huba:mode', () => {
    if (!byId('play').classList.contains('hidden')) selectMode(mode);
  });
  byId('guess-form').addEventListener('submit', submitGuess);
  document.querySelectorAll('[data-mode]').forEach(button => {
    if (button.dataset.mode === 'quote' && !quoteRoster.length) return;
    button.disabled = false;
    button.addEventListener('click', () => selectMode(button.dataset.mode, true));
  });
  byId('back-modes').addEventListener('click', () => {
    document.querySelector('#clue audio')?.pause();
    byId('play').classList.add('hidden');
    byId('mode-selection').hidden = false;
    byId('back-modes').hidden = true;
    byId('hub-link').hidden = false;
    document.body.classList.remove('lol-playing');
    document.querySelector('[data-mode="' + mode + '"]').focus();
  });
  byId('loading').hidden = true;
}

init().catch(error => {
  console.error(error);
  byId('loading').textContent = 'Não foi possível carregar os campeões. Abra o jogo por um servidor local e recarregue a página.';
});

