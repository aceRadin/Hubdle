# LoLdle do Hubdle

Abra `/jogos/loldle/` em um servidor HTTP que sirva a raiz do repositório.
Por exemplo, se Python estiver instalado, execute `python -m http.server 8000`
na raiz e acesse `http://localhost:8000/jogos/loldle/`.

O jogo usa quatro desafios diários independentes, com virada à meia-noite em
São Paulo. Os palpites ficam neste navegador. Tema e HUD compartilham as
preferências dos outros jogos do Hubdle.

- **Clássico**: compara sete pistas. As setas indicam se a resposta foi lançada
  antes ou depois do palpite.
- **Falas**: uma fala de seleção para cada um dos 172 campeões da base.
  O Diário percorre a lista em uma ordem fixa antes de repetir. No Treino,
  a escolha é aleatória e evita repetir o último campeão.
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
- `quote-transcripts.json` guarda as transcrições automáticas das gravações do
  CommunityDragon em português do Brasil e inglês. O jogo carrega a versão de
  áudio indicada no arquivo. Ao trocar a versão, confira as transcrições contra
  as novas gravações.

Ao atualizar as duas bases, mantenha os IDs compatíveis. Mudar a composição
da lista pode alterar a rotação dos desafios.

