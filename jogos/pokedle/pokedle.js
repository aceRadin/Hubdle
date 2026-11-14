'use strict';

const byId = id => document.getElementById(id);
const modes = {
  classic: ['Clássico', 'Compare os atributos para encontrar o Pokémon.'],
  quote: ['Descrição', 'Qual Pokémon é descrito nesta entrada da Pokédex?'],
  ability: ['Silhueta', 'A cada palpite, novos pedaços da silhueta são revelados.'],
  splash: ['Cartão', 'A carta fica mais nítida a cada palpite válido.']
};
const labels = {
  grass:'Planta', poison:'Veneno', fire:'Fogo', flying:'Voador', water:'Água',
  electric:'Elétrico', normal:'Normal', fairy:'Fada', steel:'Aço', ghost:'Fantasma',
  dragon:'Dragão', fighting:'Lutador', dark:'Sombrio', bug:'Inseto', ground:'Terra',
  rock:'Pedra', ice:'Gelo', psychic:'Psíquico',
  green:'Verde', red:'Vermelho', blue:'Azul', yellow:'Amarelo', pink:'Rosa',
  gray:'Cinza', purple:'Roxo', brown:'Marrom', black:'Preto', white:'Branco',
  grassland:'Pradaria', mountain:'Montanha', 'waters-edge':'Beira d’água',
  forest:'Floresta', 'rough-terrain':'Terreno acidentado', cave:'Caverna',
  urban:'Urbano', sea:'Mar', rare:'Raro'
};
const fields = ['type1','type2','generation','region','habitat','color','stage','height','weight'];
let silhouette = null;
let clueVersion = 0;
let day = HUBA.dayKey();
let roster;
let champions;
let filteredRoster;
let generationKey = '';
const generationPreference = 'huba:pokedle:generations:v1';
let mode;
let answer;
let guesses = [];
let suggestions = [];
const lastTrainingAnswers = new Map();

function normalize(value) {
  return HUBA.norm(String(value)).replace(/♀/g, 'f').replace(/♂/g, 'm').replace(/[^a-z0-9]/g, '');
}

function storageKey() {
  return 'huba:pokedle:v1:' + day + ':' + mode + generationKey;
}

function eligiblePokemon(modeId) {
  if (modeId === 'quote') return filteredRoster.filter(pokemon => pokemon.description);
  if (modeId === 'splash') return filteredRoster.filter(pokemon => pokemon.cards.length);
  return filteredRoster;
}

function initGenerationFilter(regions) {
  const generations = [...new Set(roster.map(pokemon => pokemon.generation))].sort((a, b) => a - b);
  let selected = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(generationPreference));
    if (Array.isArray(saved)) selected = new Set(saved.filter(value => generations.includes(value)));
  } catch {}
  const options = byId('generation-options');
  function updateFilter() {
    if (selected.size === generations.length) selected.clear();
    const active = generations.filter(generation => selected.has(generation));
    generationKey = active.length ? ':gen:' + active.join(',') : '';
    filteredRoster = active.length ? roster.filter(pokemon => selected.has(pokemon.generation)) : roster;
    for (const button of options.children) {
      const generation = Number(button.dataset.generation);
      button.setAttribute('aria-pressed', String(generation ? selected.has(generation) : !selected.size));
    }
    document.querySelectorAll('[data-mode]').forEach(button => {
      button.disabled = !eligiblePokemon(button.dataset.mode).length;
    });
  }
  for (const generation of [0, ...generations]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.generation = generation;
    button.textContent = generation ? generation + 'ª · ' + regions[generation] : 'Todas';
    button.onclick = () => {
      if (!generation) selected.clear();
      else if (selected.has(generation)) selected.delete(generation);
      else selected.add(generation);
      updateFilter();
      try { localStorage.setItem(generationPreference, JSON.stringify([...selected])); } catch {}
    };
    options.append(button);
  }
  updateFilter();
  byId('generation-filter').hidden = false;
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
  const order = HUBA.shuffle(items.slice(), HUBA.mulberry(HUBA.hash('huba:pokedle:v1:' + key)));
  const dayNumber = Math.floor(Date.parse(day) / 86400000);
  return order[dayNumber % order.length];
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function selectMode(next, focus = false) {
  const eligible = eligiblePokemon(next);
  if (!eligible.length) return;
  day = HUBA.dayKey();
  mode = next;
  byId('mode-selection').hidden = true;
  byId('play').classList.remove('hidden');
  byId('back-modes').hidden = false;
  byId('hub-link').hidden = true;
  document.body.classList.add('lol-playing');
  if (HUBA.isDaily) {
    answer = pickDaily(eligible, mode + generationKey);
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
  const version = ++clueVersion;
  silhouette = null;
  const clue = byId('clue');
  clue.replaceChildren();
  clue.hidden = mode === 'classic';
  if (mode === 'classic') return;
  if (mode === 'quote') {
    const quote = document.createElement('blockquote');
    quote.dataset.noTranslate = '';
    const translation = window.HUBA_I18N?.language === 'en'
      ? null : window.HUBA_POKEDEX_PT_BR?.[answer.id];
    // Só use a tradução quando ela corresponder à entrada atual do catálogo.
    const localized = translation?.source === answer.description;
    quote.lang = localized ? 'pt-BR' : 'en';
    quote.textContent = localized ? translation.text : answer.description;
    clue.append(quote);
    return;
  }
  const image = new Image();
  const status = document.createElement('p');
  status.className = 'note';
  status.setAttribute('role', 'status');
  status.textContent = 'Carregando imagem…';
  clue.append(status);
  image.onload = () => {
    if (version !== clueVersion) return;
    status.remove();
    if (mode === 'ability') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 480;
        canvas.className = 'poke-silhouette';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Pedaços da silhueta do Pokémon misterioso');
        const source = document.createElement('canvas');
        source.width = source.height = 480;
        const context = source.getContext('2d');
        const scale = Math.min(440 / image.width, 440 / image.height);
        const width = image.width * scale, height = image.height * scale;
        context.drawImage(image, (480-width)/2, (480-height)/2, width, height);
        const pixels = context.getImageData(0, 0, 480, 480).data;
        const occupied = [];
        for (let tile = 0; tile < 36; tile++) {
          const x = tile % 6 * 80, y = Math.floor(tile/6)*80;
          let solid = false;
          for (let py = y; py < y+80 && !solid; py += 2) {
            for (let px = x; px < x+80; px += 2) {
              if (pixels[(py*480+px)*4+3] > 64) { solid = true; break; }
            }
          }
          if (solid) occupied.push(tile);
        }
        // Começa na coluna mais à esquerda que contém parte do Pokémon.
        const edge = Math.min(...occupied.map(tile => tile % 6));
        const border = occupied.filter(tile => tile % 6 === edge);
        const random = HUBA.mulberry(HUBA.hash(storageKey() + ':' + answer.id));
        const first = border[Math.floor(random()*border.length)];
        const order = [first, ...HUBA.shuffle(occupied.filter(tile => tile !== first), random)];
        silhouette = {canvas, source, order};
        clue.append(canvas);
      } catch {
        showError();
      }
    } else {
      image.className = 'poke-card';
      image.alt = 'Carta do Pokémon misterioso';
      clue.append(image);
    }
    renderSplash(guesses.includes(answer.id));
  };
  function showError() {
    if (version !== clueVersion) return;
    status.textContent = 'Não foi possível carregar a imagem.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Tentar novamente';
    retry.onclick = renderClue;
    clue.replaceChildren(status, retry);
  }
  image.onerror = showError;
  if (mode === 'ability') {
    image.crossOrigin = 'anonymous';
    image.src = answer.portrait;
  } else {
    image.src = pickDaily(answer.cards, 'card:' + answer.id).image;
  }
}

function formatField(champion, field) {
  const value = champion[field];
  if (field === 'type2' && value == null) return 'Nenhum';
  if (value == null) return 'Sem dados';
  if (field === 'height') return (value / 10).toLocaleString('pt-BR') + ' m';
  if (field === 'weight') return (value / 10).toLocaleString('pt-BR') + ' kg';
  return labels[value] ?? String(value);
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
  portrait.alt = champion.name;
  portrait.title = champion.name;
  portrait.src = champion.portrait;
  name.append(portrait);
  row.append(name);
  for (const field of fields) {
    const cell = document.createElement('td');
    let result = compare(champion[field], answer[field]);
    if (field === 'habitat' && (!champion.habitat || !answer.habitat)) result = 'unknown';
    if (['type1', 'type2'].includes(field) && result === 'miss' && champion[field] &&
        [answer.type1, answer.type2].includes(champion[field])) result = 'partial';
    let symbol = { match: '✓', partial: '◐', miss: '×', unknown: '—' }[result];
    if (['generation','stage','height','weight'].includes(field) && result === 'miss') {
      symbol = answer[field] > champion[field] ? '↑' : '↓';
    }
    cell.className = 'lol-' + result;
    cell.textContent = formatField(champion, field) + ' ' + symbol;
    row.append(cell);
  }
  return row;
}

function updateStreak() {
  byId('statDailyStreak').textContent = HUBA.currentStreak('pokedle');
}

function renderSplash(won) {
  const card = document.querySelector('.poke-card');
  if (card) card.style.filter = 'blur(' + (won ? 0 : Math.max(0, 24 - guesses.length * 3)) + 'px)';
  if (!silhouette) return;
  const {canvas, source, order} = silhouette;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 480, 480);
  if (won) {
    context.drawImage(source, 0, 0);
    canvas.setAttribute('aria-label', answer.name);
    return;
  }
  const revealed = Math.min(order.length, 1 + guesses.length * 3);
  for (const tile of order.slice(0, revealed)) {
    const x = tile % 6 * 80, y = Math.floor(tile / 6) * 80;
    context.drawImage(source, x, y, 80, 80, x, y, 80, 80);
  }
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = '#111827';
  context.fillRect(0, 0, 480, 480);
  context.globalCompositeOperation = 'source-over';
  canvas.dataset.revealed = String(revealed);
}

function renderRound() {
  const won = guesses.includes(answer.id);
  if (won && HUBA.isDaily) { HUBA.recordDailyStreak('pokedle', day); HUBA.recordPlayedGame('pokedle', day); }
  byId('play').classList.toggle('lol-complete', won);
  byId('finish-actions').hidden = !won;
  if (won) {
    const order = Object.keys(modes);
    const next = order.slice(order.indexOf(mode) + 1)
      .find(id => eligiblePokemon(id).length);
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
  renderSplash(won);

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
  suggestions = query ? filteredRoster
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
  if (HUBA.dayKey() !== day && HUBA.isDaily) { selectMode(mode); byId('feedback').textContent = 'Novo dia. O desafio foi atualizado.'; return; }
  if (guesses.includes(answer.id)) return;
  const input = byId('guess');
  const value = normalize(input.value);
  const exact = value && filteredRoster.find(entry =>
    normalize(entry.name) === value || normalize(entry.id) === value
  );
  const firstSuggestion = byId('champions').hidden ? null : suggestions[0];
  const champion = exact || firstSuggestion;
  if (!champion || guesses.includes(champion.id)) {
    byId('feedback').textContent = champion ? 'Você já tentou este Pokémon.' : 'Escolha um Pokémon da lista.';
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
  roster = window.HUBA_POKEDEX;
  if (!Array.isArray(roster) || !roster.length) throw new Error('Catálogo do Pokédle ausente.');
  const regions = ['', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  roster.forEach(pokemon => {
    pokemon.region = pokemon.id >= 899 && pokemon.id <= 905 ? 'Hisui' :
      [808, 809].includes(pokemon.id) ? 'Desconhecida' : regions[pokemon.generation];
  });
  champions = new Map(roster.map(champion => [champion.id, champion]));
  initGenerationFilter(regions);
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
    button.addEventListener('click', () => selectMode(button.dataset.mode, true));
  });
  byId('back-modes').addEventListener('click', () => {
    clueVersion++;
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
  byId('loading').textContent = 'Não foi possível carregar o catálogo do Pokédle. Recarregue a página e confira se o arquivo pokemon.js está na pasta do jogo.';
});

