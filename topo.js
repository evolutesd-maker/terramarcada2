(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'topo-btn'; b.setAttribute('aria-label', 'Voltar ao topo');
  b.innerHTML = '<svg viewBox="0 0 54 54" aria-hidden="true"><circle class="trilho-a" cx="27" cy="27" r="22"/><circle class="barra-a" cx="27" cy="27" r="22"/><path class="seta" d="M27 35V20M20 26.5L27 19.5l7 7"/></svg>';
  const pill = document.getElementById('waPill');
  pill ? pill.after(b) : document.body.append(b);
  const barra = b.querySelector('.barra-a');
  let ag = false;
  const tick = () => {
    ag = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    barra.style.strokeDashoffset = (138.2 * (1 - p)).toFixed(1);
    b.classList.toggle('on', scrollY > 500);
  };
  addEventListener('scroll', () => { if (!ag) { ag = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick);
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  tick();
})();
