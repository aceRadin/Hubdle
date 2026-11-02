# HUDs compartilhados

O botão **🖥️** está junto aos seletores de tema, modo e idioma, na página inicial e nos quatro jogos. As opções são **Original, Estúdio, Arcade, Terminal, Painel, Editorial, Órbita, Blueprint, Mosaico e Faixa**. Tema controla as cores; HUD controla a apresentação dos elementos da partida.

A escolha fica em `localStorage`, na chave `huba:hud:v1`, e acompanha a navegação entre os jogos. A seleção antiga do Bits continua sendo reconhecida. A opção Foco foi removida; quem a tinha salva passa para Original. Escolher **Original** restaura a organização anterior. Trocar HUD não recria os controles, não sorteia outra música e não apaga palpites ou letras.

- `js/huds.js` é o seletor único; substitui o antigo `jogos/bits/bits-huds.js`.
- `css/huds.css` contém o seletor, as adaptações do Musical, Streakal e Wording, e os ajustes do botão Voltar e contador do Bits.
- `jogos/bits/bits-huds.css` mantém os quatro layouts anteriores próprios do Bits.
- Os HTMLs carregam os arquivos compartilhados. Os jogos continuam cuidando de suas próprias regras.

Estúdio e Painel usam colunas em telas grandes. No Wording, a disposição com teclado lateral se aplica ao modo de uma palavra; os modos com mais palavras mantêm a grade de tabuleiros. Em telas menores, os controles voltam a uma coluna. As cores de acerto/erro, as alternativas, o teclado, as estatísticas e os controles de áudio permanecem disponíveis.

No Bits, o botão Voltar tem largura natural, em vez de preencher a coluna do cabeçalho. O contador fixo na lateral foi removido do HTML e do JavaScript. O único contador da partida tem a mesma largura do cartão em cada HUD.

`tests/huds-compartilhados.test.cjs` verifica persistência entre páginas, seleção antiga, layouts nos quatro jogos, telas de 320 px, teclado e letras preservadas, tabuleiros múltiplos, botão Voltar e alinhamento do contador. Os testes do Bits também verificam troca durante um palpite e tela de resultado. As capturas de tela dos testes são salvas na pasta temporária do computador, fora do site.

Os cinco novos HUDs estão em `css/huds.css` e atendem aos quatro jogos:

- **Editorial:** títulos serifados, divisórias e alternativas em lista de duas colunas.
- **Órbita:** cápsulas, contornos suaves e capas/letras circulares.
- **Blueprint:** grade técnica discreta, bordas duplas e módulos delineados.
- **Mosaico:** blocos com cantos assimétricos e histórico em grade.
- **Faixa:** marcador vertical e faixa horizontal destacando o áudio.

Os testes percorrem os nove HUDs personalizados, preservando palpites/letras, áudio e resultados; verificam também a migração do Foco para Original.
