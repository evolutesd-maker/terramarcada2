(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Topographic contour lines (SVG gerado) ---------- */
  function seeded(seed) {
    let s = seed;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  function blob(cx, cy, r, rnd, k) {
    const a1 = 0.07 + rnd() * 0.05, a2 = 0.05 + rnd() * 0.04, a3 = 0.03 * rnd();
    const p1 = rnd() * 6.28, p2 = rnd() * 6.28, p3 = rnd() * 6.28;
    let d = '';
    const N = 90;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const rr = r * (1 + a1 * Math.sin(2 * t + p1 + k * 0.08) + a2 * Math.sin(3 * t + p2) + a3 * Math.sin(5 * t + p3));
      d += (i ? 'L' : 'M') + (cx + Math.cos(t) * rr).toFixed(1) + ' ' + (cy + Math.sin(t) * rr * 0.82).toFixed(1);
    }
    return d + 'Z';
  }
  function contours(svg, seed, cx, cy, rings, step, w = 1200, h = 800) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const g = document.createElementNS(NS, 'g');
    const rnd = seeded(seed);
    for (let i = 1; i <= rings; i++) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', blob(cx, cy, i * step, rnd, i));
      g.appendChild(p);
    }
    svg.appendChild(g);
  }
  contours($('#contours'), 42, 880, 360, 22, 48);
  contours($('#contours2'), 7, 900, 200, 16, 40, 1200, 500);

  /* ---------- Carrossel flutuante ---------- */
  const apps = [
    ['Rural', 'Limites de propriedade', 'Perímetros e áreas com coordenadas precisas.', ['#d9e4c8', '#5f7d4f']],
    ['Relevo', 'Curvas de nível', 'Declividade e drenagem para planejar o uso do solo.', ['#efe9dc', '#b0804f']],
    ['Imagem', 'Ortomosaico', 'Visão aérea contínua em escala real.', ['#cfe0d4', '#2d5242']],
    ['Obras', 'Volumes e terraplenagem', 'Cortes, aterros e estoques medidos com rapidez.', ['#e8dcc6', '#8a6a3f']],
    ['Lavoura', 'Monitoramento', 'Acompanhe o desenvolvimento e identifique falhas.', ['#dfe9c9', '#6f8f45']],
    ['Urbano', 'Loteamentos', 'Plantas planialtimétricas para projetos e viabilidade.', ['#d6e0d9', '#3d6b57']]
  ];
  const track = $('#track');
  const slideHTML = (a, i) => {
    const rnd = seeded(11 + i * 17);
    let paths = '';
    for (let r = 1; r <= 9; r++) paths += `<path d="${blob(150, 95, r * 15, rnd, r)}" stroke="${a[3][1]}" opacity="${r % 4 ? .45 : .9}"/>`;
    return `<article class="slide" style="--i:${i}"><div class="slide-in">
      <svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice" style="background:${a[3][0]}" aria-hidden="true">${paths}</svg>
      <div class="slide-body"><span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p></div></div></article>`;
  };
  const html = apps.map(slideHTML).join('');
  track.innerHTML = html + html; // duplicado para loop contínuo
  $$('.slide', track).slice(apps.length).forEach(s => s.setAttribute('aria-hidden', 'true'));

  const car = $('#carousel');
  let x = 0, speed = 0.5, paused = false, dragging = false, startX = 0, startPos = 0, half = 0;
  const measure = () => { half = track.scrollWidth / 2; };
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  car.addEventListener('mouseenter', () => paused = true);
  car.addEventListener('mouseleave', () => { paused = false; });
  car.addEventListener('pointerdown', e => { dragging = true; startX = e.clientX; startPos = x; car.classList.add('drag'); car.setPointerCapture(e.pointerId); });
  car.addEventListener('pointermove', e => { if (dragging) x = startPos + (e.clientX - startX); });
  const end = () => { dragging = false; car.classList.remove('drag'); };
  car.addEventListener('pointerup', end); car.addEventListener('pointercancel', end);
  (function loop() {
    if (!paused && !dragging && !reduce) x -= speed;
    if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
    track.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(loop);
  })();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Contadores ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Progresso, navbar ---------- */
  const bar = $('.progress'), nav = $('#nav');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 20);
    nav.classList.toggle('hide', y > lastY && y > 400 && !$('#links').classList.contains('open'));
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), links = $('#links');
  const toggle = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => toggle(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => toggle(false)));

  /* ---------- Parallax do drone (mouse) ---------- */
  const hero = $('.hero'), dw = $('#droneWrap');
  if (!reduce && matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      dw.style.transform = `translate(${px * 26}px,${py * 18}px) rotate(${px * 4}deg)`;
      $('#contours').style.transform = `translate(${px * -22}px,${py * -16}px) scale(1.06)`;
    });
    hero.addEventListener('mouseleave', () => { dw.style.transform = ''; $('#contours').style.transform = ''; });
  }

  /* ---------- Tilt + brilho nos cards ---------- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
        if (c.classList.contains('in')) c.style.transform = `perspective(800px) rotateX(${(.5 - py) * 7}deg) rotateY(${(px - .5) * 9}deg) translateY(-4px)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
    });
    /* botões magnéticos */
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Formulário -> WhatsApp ---------- */
  // TODO: substitua pelo número real da empresa (formato internacional, só dígitos). Ex.: 5555999999999
  const WHATSAPP = '5555000000000';
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, note = $('#note');
    if (!f.nome.value.trim()) { note.textContent = 'Por favor, informe seu nome.'; f.nome.focus(); return; }
    const text = `Olá, Terra Marcada! Sou ${f.nome.value.trim()} e gostaria de um orçamento de ${f.servico.value}.${f.msg.value.trim() ? '\n\n' + f.msg.value.trim() : ''}`;
    note.textContent = 'Abrindo o WhatsApp…';
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  $('#year').textContent = new Date().getFullYear();
})();
