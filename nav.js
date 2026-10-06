/* Comportamentos comuns a todas as páginas: menu do celular, pausa das animações,
   divisores em curva de nível e aviso de "abre em nova aba". */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } };
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* barra de navegação: encolhe e esmaece ao descer, volta ao subir ou ao passar o mouse */
  if (nav0()) {
    const barra = $('#nav'), movel = matchMedia('(max-width: 900px)');
    let yAnt = 0, ag = false;
    const tick = () => {
      ag = false;
      const y = scrollY, descendo = y > yAnt, aberto = !!$('.nav-links.aberto', barra);
      barra.classList.toggle('sombra', y > 20);
      if (movel.matches) {                               // celular: some ao descer, volta ao subir
        barra.classList.remove('compacto', 'esmaecido');
        barra.classList.toggle('some', descendo && y > 400 && !aberto);
      } else {                                           // computador: recua e fica translúcido
        barra.classList.remove('some');
        barra.classList.toggle('compacto', y > 80);
        if (y <= 200 || aberto) barra.classList.remove('esmaecido');
        else if (Math.abs(y - yAnt) > 2) barra.classList.toggle('esmaecido', descendo);
      }
      yAnt = y;
    };
    addEventListener('scroll', () => { if (!ag) { ag = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }
  function nav0() { return !!document.getElementById('nav'); }

  /* menu do celular */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  if (nav && burger && menu) {
    const abrir = abrir => {
      menu.classList.toggle('aberto', abrir);
      burger.setAttribute('aria-expanded', abrir);
      burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    };
    burger.addEventListener('click', () => abrir(!menu.classList.contains('aberto')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => abrir(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aberto')) { abrir(false); burger.focus(); } });
    document.addEventListener('click', e => { if (!nav.contains(e.target)) abrir(false); });
    matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) abrir(false); });
  }

  /* pausa das animações decorativas (WCAG 2.2.2) */
  if (menu) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pausa';
    const icone = pausado => pausado
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
    const aplicar = pausado => {
      document.documentElement.classList.toggle('pausado', pausado);
      b.setAttribute('aria-pressed', pausado);
      b.innerHTML = icone(pausado) + `<span class="pausa-txt">${pausado ? 'Retomar animações' : 'Pausar animações'}</span>`;
      b.title = pausado ? 'Retomar animações' : 'Pausar animações';
    };
    b.addEventListener('click', () => { const p = !document.documentElement.classList.contains('pausado'); aplicar(p); guardar('terramarcada-pausa', p ? '1' : '0'); });
    menu.appendChild(b);
    aplicar(ler('terramarcada-pausa') === '1');
  }

  /* divisores em curva de nível entre cenas */
  $$('[data-curva]').forEach(sec => {
    const cor = sec.dataset.curva;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1440 64'); svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'curva'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<path d="M0 0H1440V30C1260 58 1080 6 900 26S540 60 360 34 90 8 0 36Z" style="fill:var(--${cor})"/>
      <path class="fio" d="M0 36C90 8 180 34 360 34S540 60 900 26 1260 58 1440 30"/>`;
    sec.prepend(svg);
  });

  /* links que abrem em nova aba avisam quem usa leitor de tela */
  $$('a[target="_blank"]').forEach(a => {
    if (!$('.sr', a)) { const s = document.createElement('span'); s.className = 'sr'; s.textContent = ' (abre em nova aba)'; a.appendChild(s); }
  });
})();
