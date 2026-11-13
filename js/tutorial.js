(() => {
  'use strict';

  const tutorials = {
    home: {
      pt: ['Boas-vindas ao Hubdle', 'Escolha um jogo no menu para começar.', [
        ['Música, palavras e campeões', 'Musical, Bits e Streakal desafiam seu ouvido. Wording é de palavras e LoLdle é de League of Legends.'],
        ['Diário ou Treino', 'Jogue os desafios do dia ou use o Treino para repetir quantas vezes quiser.'],
        ['Sequência diária', 'Conclua uma partida por dia para manter a chama do Hubdle acesa.']
      ]],
      en: ['Welcome to Hubdle', 'Pick a game from the menu to get started.', [
        ['Music, words and champions', 'Musical, Bits and Streakal test your ear. Wording is a word game and LoLdle is about League of Legends.'],
        ['Daily or Training', 'Play the daily challenges or use Training to play as often as you like.'],
        ['Daily streak', 'Finish a game each day to keep your Hubdle streak going.']
      ]]
    },
    musicle: {
      pt: ['Como jogar Musical', 'Escolha um gênero e identifique a música em cinco rodadas.', [
        ['Ouça e escolha', 'Toque o trecho e selecione uma das músicas da lista.'],
        ['Ajuste a dificuldade', 'O Casual toca 7 segundos. O Desafiador toca 1,5 segundo e oferece mais alternativas.']
      ]],
      en: ['How to play Musical', 'Pick a genre and identify the song in five rounds.', [
        ['Listen and choose', 'Play the clip and pick one of the songs listed.'],
        ['Choose a difficulty', 'Casual plays 7 seconds. Challenging plays 1.5 seconds and gives you more options.']
      ]]
    },
    bits: {
      pt: ['Como jogar Bits', 'Escolha um gênero e descubra a música em até seis tentativas.', [
        ['Comece com 1 segundo', 'Ouça o trecho, procure pelo título ou artista e envie seu palpite.'],
        ['Desbloqueie mais áudio', 'Cada erro ou pulo libera um trecho maior, até 16 segundos.']
      ]],
      en: ['How to play Bits', 'Pick a genre and guess the song in six attempts or fewer.', [
        ['Start with 1 second', 'Listen to the clip, search by title or artist, and submit your guess.'],
        ['Unlock more audio', 'Each wrong guess or skip unlocks a longer clip, up to 16 seconds.']
      ]]
    },
    streakal: {
      pt: ['Como jogar Streakal', 'Escolha um gênero e acerte o máximo de músicas seguidas.', [
        ['Ouça e escolha', 'Toque o trecho e marque a música certa. Um erro encerra a sequência.'],
        ['Aumente o desafio', 'Depois de acertar, a próxima rodada pode ter um trecho menor ou mais uma alternativa.']
      ]],
      en: ['How to play Streakal', 'Pick a genre and guess as many songs in a row as you can.', [
        ['Listen and choose', 'Play the clip and pick the right song. A wrong guess ends the run.'],
        ['Raise the difficulty', 'After a correct guess, the next round can have a shorter clip or one more option.']
      ]]
    },
    wording: {
      pt: ['Como jogar Wording', 'Descubra palavras de cinco letras. Há modos com 1, 2 ou 4 palavras.', [
        ['Digite um palpite', 'A mesma palavra vale para todos os tabuleiros ainda abertos.'],
        ['Leia as cores', 'Verde indica letra na posição certa. Amarelo indica letra em outra posição. Cinza indica letra ausente.']
      ]],
      en: ['How to play Wording', 'Guess five-letter words. Choose a mode with 1, 2 or 4 words.', [
        ['Enter a guess', 'The same word applies to every unsolved board.'],
        ['Read the colors', 'Green means the right letter in the right spot. Yellow means the letter belongs elsewhere. Gray means it is absent.']
      ]]
    },
    loldle: {
      pt: ['Como jogar LoLdle', 'Descubra o campeão de League of Legends em quatro modos.', [
        ['Clássico', 'Compare os atributos de cada palpite com os do campeão secreto.'],
        ['Falas', 'Reconheça o campeão pela fala e pelo áudio.'],
        ['Habilidade', 'Identifique o campeão pelo ícone de uma habilidade.'],
        ['Splash art', 'Reconheça a arte, que fica mais nítida a cada palpite válido.']
      ]],
      en: ['How to play LoLdle', 'Guess the League of Legends champion in four modes.', [
        ['Classic', 'Compare each guess’s attributes with those of the mystery champion.'],
        ['Quotes', 'Recognize the champion by their quote and voice.'],
        ['Ability', 'Identify the champion from an ability icon.'],
        ['Splash art', 'Recognize the artwork as it becomes clearer with each valid guess.']
      ]]
    }
  };

  function init() {
    const page = document.body.dataset.tutorial;
    const toolbar = document.querySelector('.huba-language');
    if (!toolbar || !tutorials[page]) return;

    const key = 'huba:tutorial:v1:' + page;
    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'huba-help';
    help.textContent = '?';
    help.dataset.noTranslate = '';
    help.setAttribute('aria-haspopup', 'dialog');
    help.setAttribute('aria-controls', 'huba-tutorial');
    toolbar.append(help);

    const dialog = document.createElement('dialog');
    dialog.id = 'huba-tutorial';
    dialog.className = 'huba-tutorial';
    dialog.dataset.noTranslate = '';
    dialog.setAttribute('aria-labelledby', 'huba-tutorial-title');
    dialog.innerHTML = `
      <h2 id="huba-tutorial-title" tabindex="-1" autofocus></h2>
      <p></p>
      <ul></ul>
      <form method="dialog">
        <button type="button" class="huba-tutorial-language"></button>
        <button class="primary"></button>
      </form>
    `;
    document.body.append(dialog);
    const title = dialog.querySelector('h2');
    const intro = dialog.querySelector('p');
    const list = dialog.querySelector('ul');
    const languageButton = dialog.querySelector('.huba-tutorial-language');
    const dismiss = dialog.querySelector('.primary');

    let tutorialLanguage;
    function render(language) {
      tutorialLanguage = language;
      const english = language === 'en';
      const [heading, description, tips] = tutorials[page][english ? 'en' : 'pt'];
      dialog.lang = english ? 'en' : 'pt-BR';
      title.textContent = heading;
      intro.textContent = description;
      list.replaceChildren(...tips.map(([label, tip]) => {
        const item = document.createElement('li');
        const name = document.createElement('strong');
        const text = document.createElement('span');
        name.textContent = label;
        text.textContent = tip;
        item.append(name, text);
        return item;
      }));
      languageButton.textContent = english ? 'Português' : 'English';
      languageButton.lang = english ? 'pt-BR' : 'en';
      dismiss.textContent = english ? 'Got it' : 'Entendi';
    }

    function open() {
      if (dialog.open) return;
      render(HUBA_I18N.language);
      dialog.showModal();
      try { localStorage.setItem(key, '1'); } catch {}
      dialog.scrollTop = 0;
    }

    function syncLanguage() {
      const language = HUBA_I18N.language;
      help.title = language === 'en' ? 'How to play' : 'Como jogar';
      help.setAttribute('aria-label', help.title);
      render(language);
    }

    help.addEventListener('click', open);
    languageButton.addEventListener('click', () => {
      render(tutorialLanguage === 'en' ? 'pt' : 'en');
    });
    document.addEventListener('huba:language', syncLanguage);
    dialog.addEventListener('keydown', event => event.stopPropagation());
    dialog.addEventListener('close', () => {
      help.focus({preventScroll: true});
    });
    syncLanguage();
    let seen;
    try { seen = localStorage.getItem(key) === '1'; } catch {}
    if (!seen) open();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
