# Imagens do cartão Musical

Criadas com a ferramenta integrada image_gen, a partir das duas capturas fornecidas pelo usuário. São fundos decorativos da página inicial; não mudam as músicas ou o catálogo dos jogos. Os nomes abaixo foram inventados para a ilustração.

Arquivos finais: `css/images/musical-pt.png` e `css/images/musical-en.png`.

Capas e legendas usadas nas duas versões:

- After the Tide — Harbor Lines: estrada costeira.
- Sunday Static — The Quiet Hours: diner.
- Low Water — Northbound Echo: falésias em preto e branco.
- Night Rooms — Velvet Signal: cadeira vermelha em sala azul.

## Prompts utilizados

### Criação das quatro capas e edição PT

Use case: precise-object-edit. Edit target: attached Portuguese Musical game screenshot. Produce one wide screenshot preserving its exact composition, dark gray UI, four equal answer cards, progress dots, audio controls, all Portuguese interface text and existing song/artist labels below the images. Change ONLY the four square album artwork areas. Replace ALL existing recognizable covers and their branding with FOUR completely original, convincing professionally art-directed photographic indie/rock album covers. Left to right: (1) an understated grainy 35mm photograph of a deserted coastal road at blue hour, a small warm headlight in distance, deep slate and amber, tiny typeset fictional album title 'AFTER THE TIDE'; (2) candid analog photograph of an empty diner booth lit by early morning sun, muted cream and faded brick red, restrained small title 'SUNDAY STATIC'; (3) dramatic high-contrast black and white photograph of windswept coastal cliffs, subtle silver print texture, precise small title 'LOW WATER'; (4) minimalist real photograph of a lone red chair in a dark cobalt-lit room, subtle film grain, small title 'NIGHT ROOMS'. Each cover must feel like a real printed album sleeve scanned flat: authentic photographic imperfections, coherent lighting, restrained intentional typography, no fantasy or AI glossy aesthetic. No existing artist names, famous logos, recognizable album imitation, watermarks or brand names INSIDE the four new cover squares. Do not redraw or alter UI labels outside these squares. The first two covers should not resemble Nickelback/Bob Dylan originals, third not Fuel, fourth not Interpol. All four should be memorable and materially distinct in photography/palette. Preserve their placement and rounded clipping within the original cards. Output only the edited screenshot, no margins, no collage borders.

### Localização EN

Use case: text-localization. Input 1 is the EDIT TARGET, the finished Portuguese Musical screenshot with four newly created original album artworks. Input 2 is ONLY a reference for the English UI wording. Make the English-language version of INPUT 1. CRITICAL: preserve all FOUR album artworks from INPUT 1 exactly, same photos, same typography ('AFTER THE TIDE', 'SUNDAY STATIC', 'LOW WATER', 'NIGHT ROOMS'), same crop, colors, texture, size and placement. Do not regenerate, reinterpret, replace, retouch or relight those four album artworks. Preserve the entire layout, dimensions/aspect ratio and all song names and artist captions of INPUT 1. Only replace three Portuguese UI strings in INPUT 1: 'Pergunta 1 de 5' -> 'Question 1 of 5'; 'Tocar trecho' -> 'Play clip'; 'Prévia atualizada. Tente tocar novamente.' -> 'Preview refreshed. Try playing again.' Keep their exact alignment and understated UI typeface. No other edits. Output just the single English screenshot with all the same four original artworks from INPUT 1, without margins.

### Correção do texto EN

Use case: precise-object-edit / text-localization. Edit this image with an extremely small text correction ONLY. In the top UI helper sentence, change the accented word 'Préview' to plain ASCII 'Preview', so the full sentence reads exactly 'Preview refreshed. Try playing again.' All other pixels/photographs, four album covers, card captions, layout, typography, dark gray background, progress controls, dimensions and colors must remain as in the input. In particular do not redraw any of the four original album artworks. Output the corrected English screenshot.

### Nomes fictícios PT

Use case: precise-object-edit. Edit the provided Portuguese game screenshot. Replace only the song-title and artist captions UNDER the four cover squares, left to right, with these exact fictional pairs: 1. bold title 'After the Tide', artist 'Harbor Lines'; 2. bold title 'Sunday Static', artist 'The Quiet Hours'; 3. bold title 'Low Water', artist 'Northbound Echo'; 4. bold title 'Night Rooms', artist 'Velvet Signal'. Remove the old caption names Rockstar, Nickelback, Blowin' in the Wind, Bob Dylan, Hemorrhage, Fuel, Obstacle 1, Interpol completely. These are fictional demo captions. Preserve ALL FOUR album artworks exactly as the input: coastal road, diner booth, black and white cliffs, red chair in blue room, including their printed album titles. Do not redraw or redesign these artworks. Preserve all UI controls, layout, dimensions, dark gray color, Portuguese texts above the covers, 20% label and round progress dots. Change only the eight caption strings below the four cover images. Professional clean UI typography matching input, no other modifications.

### Nomes fictícios EN

Use case: precise-object-edit. Edit the provided English game screenshot. Replace only the song-title and artist captions UNDER the four cover squares, left to right, with these exact fictional pairs: 1. bold title 'After the Tide', artist 'Harbor Lines'; 2. bold title 'Sunday Static', artist 'The Quiet Hours'; 3. bold title 'Low Water', artist 'Northbound Echo'; 4. bold title 'Night Rooms', artist 'Velvet Signal'. Remove the old caption names Rockstar, Nickelback, Blowin' in the Wind, Bob Dylan, Hemorrhage, Fuel, Obstacle 1, Interpol completely. These are fictional demo captions. Preserve ALL FOUR album artworks exactly as the input: coastal road, diner booth, black and white cliffs, red chair in blue room, including their printed album titles. Do not redraw or redesign these artworks. Preserve all UI controls, layout, dimensions, dark gray color, English UI texts above the covers, 20% label and round progress dots. Ensure the helper sentence is spelled with NO accent in Preview: 'Preview refreshed. Try playing again.' Change only the eight caption strings and that single accent correction if needed. Professional clean UI typography matching input, no other modifications.

