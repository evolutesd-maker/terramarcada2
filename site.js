(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '5555999345858';

  /* Cada chamada leva a sua própria mensagem para o WhatsApp */
  $$('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $('#ano').textContent = new Date().getFullYear();

  /* ---------- Carta cadastral do terreno de exemplo (viewBox 1200 x 800) ---------- */
  const M_POR_PX = 0.6;                       // escala do exemplo: 1 px = 0,6 m
  const LOTE = [[430, 250], [700, 215], [820, 330], [780, 520], [560, 570], [400, 430]];
  const VIZ = [
    [[210, 300], [430, 250], [400, 430], [230, 470]],
    [[700, 215], [960, 180], [1010, 360], [820, 330]],
    [[820, 330], [1010, 360], [980, 540], [780, 520]],
    [[230, 470], [400, 430], [560, 570], [500, 690], [300, 650]],
    [[560, 570], [780, 520], [980, 540], [940, 700], [700, 720], [500, 690]]
  ];
  const CTL = [[330, 190], [900, 440], [620, 655]];
  const d = pts => pts.map((p, i) => (i ? 'L' : 'M') + p.join(' ')).join(' ') + ' Z';
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const cx = LOTE.reduce((s, p) => s + p[0], 0) / LOTE.length;
  const cy = LOTE.reduce((s, p) => s + p[1], 0) / LOTE.length;
  const perimetro = LOTE.reduce((s, p, i) => s + dist(p, LOTE[(i + 1) % LOTE.length]), 0) * M_POR_PX;
  const area = Math.abs(LOTE.reduce((s, p, i) => { const q = LOTE[(i + 1) % LOTE.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2 * M_POR_PX * M_POR_PX / 10000;
  const fora = (p, k) => { const dx = p[0] - cx, dy = p[1] - cy, n = Math.hypot(dx, dy); return [p[0] + dx / n * k, p[1] + dy / n * k]; };
  const tri = c => `M${c[0]} ${c[1] - 13} L${c[0] + 12} ${c[1] + 9} L${c[0] - 12} ${c[1] + 9} Z`;

  function cadastro() {
    let s = VIZ.map(v => `<path class="nb" pathLength="1" d="${d(v)}"/>`).join('');
    s += '<path class="rd" pathLength="1" d="M-20 735 C300 700 700 765 1220 705"/>';
    s += `<polygon class="lotfill" points="${LOTE.map(p => p.join(',')).join(' ')}"/>`;
    s += `<path class="lot" pathLength="1" d="${d(LOTE)}"/>`;
    s += LOTE.map((p, i) => {
      const a = LOTE[(i + 1) % LOTE.length], m = [(p[0] + a[0]) / 2, (p[1] + a[1]) / 2], t = fora(m, 34);
      return `<rect class="dimbg" x="${(t[0] - 40).toFixed(0)}" y="${(t[1] - 20).toFixed(0)}" width="80" height="30" rx="15"/>
        <text class="dim" x="${t[0].toFixed(0)}" y="${(t[1] + 1).toFixed(0)}" text-anchor="middle">${Math.round(dist(p, a) * M_POR_PX)} m</text>`;
    }).join('');
    s += CTL.map(c => `<path class="ctl" d="${tri(c)}"/>`).join('');
    s += LOTE.map(p => `<circle class="vx" cx="${p[0]}" cy="${p[1]}" r="10"/>`).join('');
    s += LOTE.map((p, i) => { const t = fora(p, 30); return `<text class="vl" x="${t[0].toFixed(0)}" y="${(t[1] + 7).toFixed(0)}" text-anchor="middle">P${i + 1}</text>`; }).join('');
    return s;
  }
  $('#cad').innerHTML = cadastro();
  $('#cadFixo').innerHTML = cadastro();
  $('#cadFixo').classList.add('cad-fixo');

  const fmt = (v, c) => v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });

  /* ---------- Progresso de cena fixa ---------- */
  const prog = sec => {
    const r = sec.getBoundingClientRect();
    return clamp(-r.top / (sec.offsetHeight - innerHeight));
  };

  /* ---------- PICO: a carta se forma conforme a rolagem ---------- */
  const secMapa = $('#mapa'), prancha = $('#prancha'), pMapa = $('#pranchaMapa'), scan = $('#scan');
  const g = {
    nb: $$('#cad .nb'), rd: $('#cad .rd'), lot: $('#cad .lot'), fill: $('#cad .lotfill'),
    vx: $$('#cad .vx'), vl: $$('#cad .vl'), dim: $$('#cad .dim'), bg: $$('#cad .dimbg'), ctl: $$('#cad .ctl')
  };
  const eArea = $('#eArea'), ePer = $('#ePer');
  let largP = 0, lastP = -1;
  const medirPrancha = () => { largP = prancha.clientWidth; prancha.style.setProperty('--prancha-w', largP + 'px'); };
  medirPrancha(); addEventListener('resize', medirPrancha);

  function desenhar() {
    const r = secMapa.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const p = prog(secMapa);
    if (Math.abs(p - lastP) < .001) return;
    lastP = p;
    const s = clamp(p / .36);
    pMapa.style.clipPath = `inset(0 ${((1 - s) * 100).toFixed(2)}% 0 0)`;
    scan.style.opacity = p > .004 && p < .375 ? 1 : 0;
    scan.style.transform = `translateX(${(s * largP).toFixed(1)}px)`;
    g.nb.forEach((el, i) => { el.style.strokeDashoffset = (1 - clamp((p - (.3 + i * .03)) / .14)).toFixed(3); });
    g.rd.style.strokeDashoffset = (1 - clamp((p - .3) / .2)).toFixed(3);
    g.ctl.forEach((el, i) => { el.style.opacity = clamp((p - (.42 + i * .04)) / .06).toFixed(2); });
    g.lot.style.strokeDashoffset = (1 - clamp((p - .5) / .22)).toFixed(3);
    g.vx.forEach((el, i) => {
      const t = clamp((p - (.52 + i * .035)) / .04);
      el.style.opacity = t.toFixed(2);
      el.style.transform = `scale(${t.toFixed(2)})`;
    });
    g.vl.forEach(el => { el.style.opacity = clamp((p - .7) / .08).toFixed(2); });
    const td = clamp((p - .74) / .08).toFixed(2);
    g.dim.forEach(el => { el.style.opacity = td; });
    g.bg.forEach(el => { el.style.opacity = td; });
    g.fill.style.opacity = clamp((p - .78) / .1).toFixed(2);
    const n = clamp((p - .74) / .16);
    eArea.textContent = fmt(area * n, 1);
    ePer.textContent = fmt(Math.round(perimetro * n), 0);
  }
  if (reduce) { eArea.textContent = fmt(area, 1); ePer.textContent = fmt(Math.round(perimetro), 0); }

  /* ---------- HUD: a rolagem é o voo ---------- */
  const hud = $('#hud'), pill = $('#waPill'), nav = $('#nav');
  const hAlt = $('#hudAlt'), hLat = $('#hudLat'), hLon = $('#hudLon'), hBar = $('#hudBar'), hEsc = $('#hudEsc');
  const trechos = [['#voo', 0, 100], ['#mapa', 100, 100], ['#rigor', 100, 60], ['#servicos', 60, 20], ['#contato', 20, 0]]
    .map(([id, a, b]) => ({ el: $(id), a, b }));
  const hero = $('#terra');
  let ult = '', yAnt = 0;
  function atualizarHud() {
    const vh = innerHeight, y = scrollY;
    pill.classList.toggle('on', hero.getBoundingClientRect().bottom < vh * .4);
    nav.classList.toggle('sombra', y > 20);
    nav.classList.toggle('some', y > yAnt && y > 500);
    yAnt = y;
    hud.classList.toggle('on', trechos[0].el.getBoundingClientRect().top < vh * .75);
    let alt = 0;
    for (const t of trechos) {
      const r = t.el.getBoundingClientRect();
      if (r.top - vh * .5 > 0) break;
      alt = t.a + (t.b - t.a) * clamp((vh * .5 - r.top) / r.height);
    }
    alt = Math.round(alt);
    const f = y / Math.max(1, document.documentElement.scrollHeight - vh);
    const lat = (28.388 + f * .0042).toFixed(4), lon = (53.914 - f * .0036).toFixed(4);
    const chave = alt + lat + lon;
    if (chave === ult) return;
    ult = chave;
    hAlt.textContent = alt + ' m';
    hLat.textContent = lat + '° S';
    hLon.textContent = lon + '° O';
    hEsc.textContent = Math.max(5, Math.round(alt * 1.2 / 5) * 5) + ' m';
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
        const p = clamp((t - t0 - 600) / 1600);
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
    addEventListener('load', () => { medir(); medirPrancha(); });
    tick();
  } else {
    pMapa.style.clipPath = 'none';
  }
})();
