# LoLdle do Hubdle

Abra `/jogos/loldle/` em um servidor HTTP que sirva a raiz do repositório.
Por exemplo, se Python estiver instalado, execute `python -m http.server 8000`
na raiz e acesse `http://localhost:8000/jogos/loldle/`.

O jogo usa quatro desafios diários independentes, com virada à meia-noite em
São Paulo. Os palpites ficam neste navegador. Tema e HUD compartilham as
preferências dos outros jogos do Hubdle.

- **Clássico**: compara sete pistas. As setas indicam se a resposta foi lançada
  antes ou depois do palpite.
- **Falas**: rotação inicial de 11 falas de seleção, com áudio original em
  inglês do CommunityDragon e texto adaptado em português.
- **Habilidade**: mostra o ícone da passiva ou de uma habilidade.
- **Splash art**: cada palpite válido reduz o desfoque até revelar a arte.

## Dados

- `output.json` é a exportação de [iEranDEV/loldle-data](https://github.com/iEranDEV/loldle-data).
  Fornece a maioria das pistas e as URLs de ícones de habilidades e artes.
- `champion.json` vem do [Data Dragon](https://ddragon.leagueoflegends.com/cdn/16.5.1/data/pt_BR/champion.json).
  Fornece nomes localizados, IDs numéricos, retratos e recursos.
- O [CommunityDragon](https://www.communitydragon.org/docs/assets) fornece os
  áudios de seleção. As mídias precisam de conexão com a internet.
- As posições ausentes de Nunu e Talon foram preenchidas na integração.
  O recurso vazio de Bel'Veth é exibido como “Sem recurso”.
- As frases são adaptações das falas de seleção consultadas no
  [índice de falas](https://www.nerfplz.com/lol-champion-quotes/#pick-ban).

Ao atualizar as duas bases, mantenha os IDs compatíveis. Mudar a composição
da lista pode alterar a rotação dos desafios.

