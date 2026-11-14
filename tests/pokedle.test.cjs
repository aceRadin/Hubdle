const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.HUBA_PLAYWRIGHT_MODULE || 'playwright');

test('Pokédle mantém pistas, progresso diário e revelação nos quatro modos', { timeout: 60000 }, async t => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const mime = { '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
      res.setHeader('Content-Type', mime[path.extname(pathname)] || 'text/html');
      res.end(await fs.readFile(path.join(root, pathname)));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.HUBA_CHROME ? { executablePath: process.env.HUBA_CHROME } : {})
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('huba:tutorial:v1:pokedle', '1'));
  // Uma imagem real local deixa o teste independente das duas CDNs de imagens.
  const image = await fs.readFile(path.join(root, 'social-card.png'));
  await page.route('https://**/*', route => {
    if (/githubusercontent|tcgdex/.test(route.request().url())) {
      return route.fulfill({ contentType: 'image/png', body: image, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    return route.abort();
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  await page.goto(base + '/jogos/pokedle/index.html');
  await page.waitForFunction(() => !document.querySelector('[data-mode="classic"]').disabled);
  assert.notEqual(await page.evaluate(() => normalize('Nidoran♀')), await page.evaluate(() => normalize('Nidoran♂')));
  for (const mode of ['classic', 'quote', 'ability', 'splash']) {
    await page.click('[data-mode="' + mode + '"]');
    if (mode === 'ability') await page.waitForSelector('canvas');
    if (mode === 'splash') await page.waitForSelector('.poke-card');
    const target = await page.evaluate(() => answer.id);
    const wrong = target === 658 ? 25 : 658;
    await page.fill('#guess', String(wrong));
    await page.click('#guess-form button[type="submit"]');
    assert.equal(await page.evaluate(() => guesses.length), 1);
    if (mode === 'classic') {
      assert.equal(await page.locator('#comparison th span').count(), 0);
      assert.equal(await page.locator('#comparison td').count(), 9);
      assert.equal(await page.evaluate(() => renderComparison(champions.get(658)).querySelector('.lol-unknown') !== null), true);
      assert.equal(await page.evaluate(() => {
        const original = answer;
        answer = { ...champions.get(6), type1: 'flying', type2: 'fire' };
        const cells = renderComparison(champions.get(6)).querySelectorAll('td');
        const result = cells[0].className === 'lol-partial' && cells[1].className === 'lol-partial';
        answer = original;
        return result;
      }), true);
    }
    if (mode === 'quote') {
      assert.ok((await page.locator('blockquote').textContent()).length > 20);
    }
    if (mode === 'ability') assert.equal(await page.locator('canvas').getAttribute('data-revealed'), '4');
    if (mode === 'splash') assert.equal(await page.locator('.poke-card').evaluate(el => el.style.filter), 'blur(21px)');
    await page.fill('#guess', String(wrong));
    await page.click('#guess-form button[type="submit"]');
    assert.equal(await page.evaluate(() => guesses.length), 1, 'repetição não avança a pista');
    await page.reload();
    await page.click('[data-mode="' + mode + '"]');
    assert.equal(await page.evaluate(() => answer.id), target);
    assert.equal(await page.evaluate(() => guesses.length), 1);
    await page.fill('#guess', String(target));
    await page.click('#guess-form button[type="submit"]');
    assert.equal(await page.locator('#result').isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.click('#back-modes');
  }
  await page.click('[data-generation="1"]');
  await page.click('[data-generation="4"]');
  for (const mode of ['classic', 'quote', 'ability', 'splash']) {
    await page.click('[data-mode="' + mode + '"]');
    assert.ok([1, 4].includes(await page.evaluate(() => answer.generation)));
    assert.equal(await page.evaluate(() => guesses.length), 0);
    await page.fill('#guess', 'Sprigatito');
    assert.equal(await page.locator('#champions button').count(), 0);
    await page.click('#guess-form button[type="submit"]');
    assert.equal(await page.evaluate(() => guesses.length), 0);
    await page.click('#back-modes');
  }
  await page.click('[data-mode="classic"]');
  const filteredGuess = await page.evaluate(() => answer.id === 1 ? '4' : '1');
  await page.fill('#guess', filteredGuess);
  await page.click('#guess-form button[type="submit"]');
  await page.reload();
  assert.equal(await page.locator('[data-generation="1"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('[data-generation="4"]').getAttribute('aria-pressed'), 'true');
  await page.click('[data-mode="classic"]');
  assert.deepEqual(await page.evaluate(() => guesses), [Number(filteredGuess)]);
  await page.click('#back-modes');
  await page.click('[data-generation="0"]');
  await page.click('[data-mode="classic"]');
  assert.equal(await page.locator('#result').isVisible(), true);
  await page.click('#back-modes');
  await page.evaluate(() => HUBA.setMode('training'));
  await page.click('[data-mode="classic"]');
  const first = await page.evaluate(() => answer.id);
  await page.fill('#guess', String(first));
  await page.click('#guess-form button[type="submit"]');
  await page.click('#next-round');
  assert.notEqual(await page.evaluate(() => answer.id), first);
  assert.equal(await page.evaluate(() => guesses.length), 0);
  await page.goto(base + '/index.html');
  assert.equal(await page.locator('a.gcard-pokedle').getAttribute('href'), 'jogos/pokedle/index.html');
  assert.deepEqual(errors, []);
});
