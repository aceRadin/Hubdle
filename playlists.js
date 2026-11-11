/* Catálogo compartilhado pelo Musical e pelo Streakal. */
(function () {
  // O Deezer fornece o top de cada artista. Limites aceitos: 5, 10 ou 15.
  const faixasPorArtista = 15;
  // Use os IDs numéricos das páginas dos artistas no Deezer.
  const artistasPorGenero = {
    rock: [],
    metal: [],
    pop: [],
    anime: [],
    games: [],
    'power metal': []
  };

  const playlists = [
    'rock: playlist:1306931615, playlist:4047160366, playlist:11335739484, playlist:8763353462, playlist:12535397823',
    'metal: https://www.deezer.com/en/playlist/1050179021, https://www.deezer.com/en/playlist/1367442165, https://www.deezer.com/en/playlist/2655390504, https://www.deezer.com/en/playlist/1388965575',
    'pop: playlist:8326097522, playlist:8282573142, playlist:1036183001, playlist:10806335362, playlist:12104186351',
    'anime: playlist:12283980831, playlist:7967291482, playlist:4521288042, playlist:7490833544',
    'games: playlist:10753812222, playlist:7290479924',
    'power metal: playlist:10035573042, playlist:9076579722, playlist:13004031423'
  ];

  const fontesDeArtistas = Object.entries(artistasPorGenero)
    .filter(([, ids]) => ids.length > 0)
    .map(([genero, ids]) => {
      const fontes = ids.map(id => 'artist-top:' + id + ':' + faixasPorArtista);
      return genero + ': ' + fontes.join(', ');
    });

  window.HUBA_MUSICAS = { fontes: playlists.concat(fontesDeArtistas) };
})();
