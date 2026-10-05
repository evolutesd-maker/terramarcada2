(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '5555999345858';

  /* ---------- Links de WhatsApp: cada chamada leva sua própria mensagem ---------- */
  $$('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $('#ano').textContent = new Date().getFullYear();

  /* ---------- Geração de relevo (curvas de nível) ---------- */
  const seeded = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const NS = 'http://www.w3.org/2000/svg';
  function blob(cx, cy, r, rnd, k) {
    const a1 = .07 + rnd() * .05, a2 = .05 + rnd() * .04, a3 = .03 * rnd();
    const p1 = rnd() * 6.28, p2 = rnd() * 6.28, p3 = rnd() * 6.28;
    let d = '';
    for (let i = 0; i <= 72; i++) {
      const t = i / 72 * Math.PI * 2;
      const rr = r * (1 + a1 * Math.sin(2 * t + p1 + k * .08) + a2 * Math.sin(3 * t + p2) + a3 * Math.sin(5 * t + p3));
      d += (i ? 'L' : 'M') + (cx + Math.cos(t) * rr).toFixed(1) + ' ' + (cy + Math.sin(t) * rr * .82).toFixed(1);
    }
    return d + 'Z';
  }
  const rings = (seed, cx, cy, n, step, animated) => {
    const rnd = seeded(seed);
    let s = '';
    for (let i = 1; i <= n; i++) s += `<path d="${blob(cx, cy, i * step, rnd, i)}"${animated ? ' pathLength="1"' : ''}/>`;
    return s;
  };

  /* hero e cenas decorativas */
  $('#heroMapa').innerHTML = `
    <g class="c">${rings(42, 330, 290, 24, 30)}</g>
    <path d="M70 460 L190 300 L360 260 L470 340" fill="none" stroke="#C49A2A" stroke-width="3.5" stroke-dasharray="9 8"/>
    <circle cx="190" cy="300" r="5" fill="#0F3A2C"/><circle cx="360" cy="260" r="5" fill="#0F3A2C"/>`;
  $('#dubiaContornos').innerHTML = rings(7, 320, 260, 14, 34);
  $('#discoContornos').innerHTML = rings(21, 200, 200, 12, 20);

  /* ---------- Mapa do terreno (geometria única, usada no pico e no rigor) ---------- */
  const P = [[170, 130], [400, 100], [470, 230], [430, 380], [260, 400], [150, 290]];
  const rotP = [[-30, -10], [0, -14], [16, 6], [14, 22], [-6, 24], [-36, 4]];
  const poly = P.map((p, i) => (i ? 'L' : 'M') + p.join(' ')).join(' ') + ' Z';
  const tri = (x, y) => `M${x} ${y - 9} L${x + 9} ${y + 7} L${x - 9} ${y + 7} Z`;
  const PC = [[100, 200], [520, 330], [300, 455]];
  const norte = `<g><path class="norte" d="M548 88 L548 38 M539 52 L548 38 L557 52"/><text class="norte-t" x="540" y="112">N</text></g>`;
  const mapaBase = animated => `
    <g class="c">${rings(11, 320, 255, 15, 30, animated)}</g>
    <polygon class="area" points="${P.map(p => p.join(',')).join(' ')}" ${animated ? '' : 'style="fill:#C49A2A;opacity:.2"'}/>
    <path class="lim" d="${poly}" ${animated ? 'pathLength="1"' : 'style="fill:none;stroke:#C49A2A;stroke-width:4;stroke-linejoin:round"'}/>
    ${P.map((p, i) => `<circle class="v" cx="${p[0]}" cy="${p[1]}" r="6.5" ${animated ? '' : 'style="fill:#0F3A2C"'}/>
      <text class="pl" x="${p[0] + rotP[i][0]}" y="${p[1] + rotP[i][1]}" ${animated ? '' : 'style="opacity:1"'}>P${i + 1}</text>`).join('')}
    ${PC.map(c => `<path class="pc" d="${tri(c[0], c[1])}" ${animated ? '' : 'style="fill:none;stroke:#0F3A2C;stroke-width:2"'}/>`).join('')}
    ${norte}`;
  $('#picoMapa').innerHTML = mapaBase(true);
  $('#reguaMapa').innerHTML = mapaBase(false);

  /* "imagem do voo": mosaico de talhões, mata, telhados e estrada (sem foto real) */
  (function ortofoto() {
    const rnd = seeded(5);
    const verdes = ['#6E8B4A', '#7C9A55', '#5C7A3E', '#8DA562', '#A0A66A', '#B4A773', '#5A7448'];
    let s = '<rect width="600" height="500" fill="#6E8B4A"/>';
    for (let y = 0; y < 500; y += 62)
      for (let x = 0; x < 600; x += 75)
        s += `<polygon points="${x + rnd() * 10},${y + rnd() * 10} ${x + 75 - rnd() * 10},${y + rnd() * 14} ${x + 72 - rnd() * 10},${y + 62 - rnd() * 10} ${x + rnd() * 12},${y + 60 - rnd() * 12}" fill="${verdes[Math.floor(rnd() * verdes.length)]}" opacity=".95"/>`;
    s += '<path d="M-10 420 C150 380 260 330 400 360 S600 300 620 250" stroke="#D8CBA6" stroke-width="14" fill="none"/>';
    for (let i = 0; i < 38; i++)
      s += `<circle cx="${rnd() * 600}" cy="${rnd() * 500}" r="${6 + rnd() * 9}" fill="#3E5B2F" opacity=".75"/>`;
    [[240, 210], [330, 250], [210, 300]].forEach(r => s += `<rect x="${r[0]}" y="${r[1]}" width="22" height="14" fill="#B5603F"/><rect x="${r[0] + 3}" y="${r[1] + 3}" width="9" height="8" fill="#8E4A30"/>`);
    $('#reguaCrua').innerHTML = s;
  })();

  /* ---------- Progresso de cena fixa ---------- */
  const prog = sec => {
    const r = sec.getBoundingClientRect();
    return clamp(-r.top / (sec.offsetHeight - innerHeight));
  };

  /* ---------- PICO: o mapa se desenha com a rolagem ---------- */
  const secMapa = $('#mapa');
  const conts = $$('#picoMapa .c path');
  const lim = $('#picoMapa .lim');
  const vs = $$('#picoMapa .v');
  const pls = $$('#picoMapa .pl');
  const pcs = $$('#picoMapa .pc');
  const area = $('#picoMapa .area');
  let lastP = -1;
  function desenhar() {
    const r = secMapa.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const p = prog(secMapa);
    if (Math.abs(p - lastP) < .001) return;
    lastP = p;
    conts.forEach((el, i) => {
      const a = i * .03;
      el.style.strokeDashoffset = (1 - clamp((p - a) / .17)).toFixed(3);
    });
    pcs.forEach((el, i) => { el.style.opacity = clamp((p - (.3 + i * .05)) / .06).toFixed(2); });
    lim.style.strokeDashoffset = (1 - clamp((p - .42) / .26)).toFixed(3);
    vs.forEach((el, i) => {
      const t = clamp((p - (.46 + i * .04)) / .04);
      el.style.opacity = t.toFixed(2);
      el.style.transform = `scale(${t.toFixed(2)})`;
    });
    pls.forEach(el => { el.style.opacity = clamp((p - .7) / .1).toFixed(2); });
    area.style.opacity = (clamp((p - .78) / .12) * .2).toFixed(3);
  }

  /* ---------- HUD: a rolagem é o voo ---------- */
  const hud = $('#hud'), pill = $('#waPill');
  const hAlt = $('#hudAlt'), hLat = $('#hudLat'), hLon = $('#hudLon'), hBar = $('#hudBar'), hEsc = $('#hudEsc');
  const trechos = [['#voo', 0, 100], ['#mapa', 100, 100], ['#rigor', 100, 60], ['#servicos', 60, 20], ['#contato', 20, 0]]
    .map(([id, a, b]) => ({ el: $(id), a, b }));
  const hero = $('#terra');
  let ult = '';
  function atualizarHud() {
    const vh = innerHeight;
    pill.classList.toggle('on', hero.getBoundingClientRect().bottom < vh * .4);
    const rv = trechos[0].el.getBoundingClientRect();
    hud.classList.toggle('on', rv.top < vh * .75);
    let alt = 0;
    for (const t of trechos) {
      const r = t.el.getBoundingClientRect();
      if (r.top - vh * .5 > 0) break;
      const k = clamp((vh * .5 - r.top) / r.height);
      alt = t.a + (t.b - t.a) * k;
    }
    alt = Math.round(alt);
    const f = scrollY / Math.max(1, document.documentElement.scrollHeight - vh);
    const lat = (28.388 + f * .0042).toFixed(4), lon = (53.914 - f * .0036).toFixed(4);
    const dist = Math.max(5, Math.round(alt * 1.2 / 5) * 5);
    const chave = alt + lat + lon;
    if (chave === ult) return;
    ult = chave;
    hAlt.textContent = alt + ' m';
    hLat.textContent = lat + '° S';
    hLon.textContent = lon + '° O';
    hEsc.textContent = dist + ' m';
    hBar.style.width = (28 + Math.min(alt, 100) * .5) + 'px';
  }

  /* ---------- Régua de conferência ---------- */
  const regua = $('#regua'), entrada = $('#reguaIn'), puxador = $('#puxador');
  let larg = 0;
  const posicionar = v => {
    regua.style.setProperty('--x', v + '%');
    puxador.style.transform = `translateX(${(larg * v / 100).toFixed(1)}px)`;
  };
  const medir = () => { larg = regua.clientWidth; posicionar(+entrada.value); };
  addEventListener('resize', medir);
  entrada.addEventListener('input', () => posicionar(+entrada.value));
  medir();
  if (!reduce) {
    let tocou = false;
    entrada.addEventListener('pointerdown', () => { tocou = true; });
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      const t0 = performance.now();
      (function passo(t) {
        if (tocou) return;
        const p = clamp((t - t0 - 600) / 1500);
        const v = 96 - 46 * (1 - Math.pow(1 - p, 3));
        entrada.value = v;
        posicionar(v);
        if (p < 1) requestAnimationFrame(passo);
      })(t0);
    }, { threshold: .5 }).observe(regua);
  }

  /* ---------- Ciclo único de rolagem ---------- */
  if (!reduce) {
    let ag = false;
    const tick = () => { ag = false; desenhar(); atualizarHud(); };
    addEventListener('scroll', () => { if (!ag) { ag = true; requestAnimationFrame(tick); } }, { passive: true });
    addEventListener('resize', tick);
    addEventListener('load', medir);
    tick();
  }
})();
