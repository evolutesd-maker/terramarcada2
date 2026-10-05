(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = (window.TM && window.TM.whatsapp) || '5555999345858';
  const pagina = document.body.dataset.pagina;

  /* comum: WhatsApp com mensagem própria, barra de navegação, ano */
  const ligarWa = (raiz = document) => $$('[data-wa]', raiz).forEach(a => {
    a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = '_blank'; a.rel = 'noopener';
  });
  ligarWa();
  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
  const nav = $('#nav'); let yAnt = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('sombra', y > 20);
    nav.classList.toggle('some', y > yAnt && y > 400 && !document.querySelector('.nav-links.aberto'));
    yAnt = y;
  }, { passive: true });

  /* ---------- QUEM SOMOS: a rota do voo percorre os passos ---------- */
  if (pagina === 'sobre') {
    const cont = $('#passos'), svg = $('#rotaV'), feita = $('.feita', svg), marc = $('#marcador'), passos = $$('.passo');
    const traçar = () => {
      const h = cont.offsetHeight;
      svg.setAttribute('viewBox', `0 0 70 ${h}`);
      const ys = passos.map(p => p.offsetTop + 22);
      let d = `M35 0`;
      ys.forEach((y, i) => { d += ` C ${i % 2 ? 62 : 8} ${y - 60}, ${i % 2 ? 8 : 62} ${y - 20}, 35 ${y}`; });
      d += ` L35 ${h}`;
      $('.trilha', svg).setAttribute('d', d);
      feita.setAttribute('d', d);
      feita.setAttribute('pathLength', '1');
    };
    const mover = () => {
      const r = cont.getBoundingClientRect();
      const p = clamp((innerHeight * .55 - r.top) / r.height);
      feita.style.strokeDashoffset = (1 - p).toFixed(4);
      const comp = $('.trilha', svg).getTotalLength();
      const pt = $('.trilha', svg).getPointAtLength(comp * p);
      marc.style.transform = `translate(${(pt.x - 35).toFixed(1)}px,${pt.y.toFixed(1)}px)`;
      passos.forEach(el => el.classList.toggle('ativo', el.offsetTop + 22 <= p * cont.offsetHeight + 40));
    };
    traçar(); mover();
    if (reduce) { passos.forEach(el => el.classList.add('ativo')); feita.style.strokeDashoffset = 0; }
    else {
      addEventListener('scroll', () => requestAnimationFrame(mover), { passive: true });
      addEventListener('resize', () => { traçar(); mover(); });
      addEventListener('load', () => { traçar(); mover(); });
    }
  }

  /* ---------- SERVIÇOS: filtros e detalhes ---------- */
  if (pagina === 'servicos') {
    const chips = $$('.chip'), cards = $$('.svc');
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', x === c));
      const f = c.dataset.filtro;
      cards.forEach(card => { card.hidden = !(f === 'todos' || card.dataset.grupo.split(' ').includes(f)); });
    }));
    $$('.mais-btn').forEach(b => b.addEventListener('click', () => {
      const card = b.closest('.svc'), aberto = card.classList.toggle('aberto');
      b.setAttribute('aria-expanded', aberto);
      b.textContent = aberto ? 'Ocultar detalhes' : 'Ver detalhes';
    }));
  }

  /* ---------- DOCUMENTAÇÃO: lista de conferência ---------- */
  if (pagina === 'documentacao') {
    const SITUACOES = {
      rural: {
        nome: 'Imóvel rural',
        docs: [
          ['Documento pessoal do proprietário', 'RG e CPF de quem consta na matrícula.'],
          ['Matrícula atualizada do imóvel', 'Certidão emitida pelo Cartório de Registro de Imóveis.'],
          ['CCIR mais recente', 'Certificado de Cadastro de Imóvel Rural.'],
          ['ITR do último exercício', 'Comprovante do imposto territorial rural.'],
          ['CAR, se houver', 'Recibo do Cadastro Ambiental Rural.'],
          ['Procuração, se alguém representa o proprietário', 'Com poderes para tratar do imóvel.'],
          ['Nome e contato dos vizinhos', 'Confrontantes que serão avisados dos limites.']
        ]
      },
      urbano: {
        nome: 'Imóvel urbano',
        docs: [
          ['Documento pessoal do proprietário', 'RG, CPF e certidão de estado civil.'],
          ['Comprovante de residência', 'Conta recente de água, luz ou telefone.'],
          ['Matrícula, escritura ou contrato de compra e venda', 'O documento mais completo que você tiver do imóvel.'],
          ['Carnê ou comprovante do IPTU', 'Do ano atual ou do mais recente.'],
          ['Planta, projeto ou levantamento anterior', 'Se já existir algum, mesmo antigo.']
        ]
      },
      reurb: {
        nome: 'REURB (regularização urbana)',
        docs: [
          ['Documentos pessoais de cada morador', 'RG, CPF e certidão de estado civil.'],
          ['Comprovante de moradia', 'Contas de água ou luz, correspondências ou IPTU que mostrem o endereço.'],
          ['Comprovante de tempo de posse', 'Recibos, declarações de vizinhos ou contratos antigos.'],
          ['Comprovante de renda, se pedido', 'Pode ser exigido para o enquadramento social da regularização.'],
          ['Contrato de compra e venda ou cessão, se houver', 'Mesmo sem registro em cartório.'],
          ['Documentos do terreno, se houver', 'Matrícula, planta ou levantamento da área.']
        ]
      },
      obra: {
        nome: 'Obra ou loteamento',
        docs: [
          ['Documento pessoal ou do responsável pela obra', 'RG e CPF, ou CNPJ e contrato social da empresa.'],
          ['Matrícula atualizada do terreno', 'Certidão do Cartório de Registro de Imóveis.'],
          ['Anteprojeto ou projeto, se houver', 'Em PDF ou DWG, para alinharmos o levantamento.'],
          ['Diretrizes do município', 'Recuos, usos permitidos e demais exigências locais.'],
          ['Levantamento anterior, se existir', 'Para comparar e atualizar.']
        ]
      }
    };
    const chaveLS = 'terramarcada-docs';
    let salvo = {};
    try { salvo = JSON.parse(localStorage.getItem(chaveLS) || '{}'); } catch (e) { salvo = {}; }
    const lista = $('#lista'), pct = $('#pct'), barra = $('#barra'), texto = $('#restam'), btnWa = $('#enviarWa'), btnCopiar = $('#copiar');
    let atual = 'rural';

    const gravar = () => { try { localStorage.setItem(chaveLS, JSON.stringify(salvo)); } catch (e) { /* sem armazenamento */ } };
    const marcados = () => (salvo[atual] || []);
    const resumo = () => {
      const s = SITUACOES[atual], m = marcados(), total = s.docs.length, r = m.length / total;
      pct.textContent = Math.round(r * 100) + '%';
      barra.style.strokeDashoffset = (213.6 * (1 - r)).toFixed(1);
      texto.textContent = m.length === total ? 'Tudo reunido. Envie para nós conferirmos.' : `Faltam ${total - m.length} de ${total} itens. Sem algum documento? Fale conosco, ajudamos a localizar.`;
      const tem = s.docs.filter((_, i) => m.includes(i)).map(d => d[0]), falta = s.docs.filter((_, i) => !m.includes(i)).map(d => d[0]);
      const msg = `Olá, Terra Marcada! Estou organizando os documentos para: ${s.nome}.\n\nJá tenho:\n${tem.map(x => '- ' + x).join('\n') || '- (ainda nenhum)'}\n\nAinda falta:\n${falta.map(x => '- ' + x).join('\n') || '- (nada)'}`;
      btnWa.dataset.wa = msg; ligarWa(btnWa.parentElement);
      btnCopiar.dataset.msg = msg;
    };
    const desenhar = () => {
      const s = SITUACOES[atual], m = marcados();
      lista.innerHTML = s.docs.map((d, i) => `<li><label class="item-doc${m.includes(i) ? ' ok' : ''}">
        <input type="checkbox" data-i="${i}"${m.includes(i) ? ' checked' : ''}>
        <span class="caixa"><svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        <span><b>${d[0]}</b><small>${d[1]}</small></span></label></li>`).join('');
      $$('input', lista).forEach(inp => inp.addEventListener('change', () => {
        const i = +inp.dataset.i, set = new Set(salvo[atual] || []);
        inp.checked ? set.add(i) : set.delete(i);
        salvo[atual] = [...set]; gravar();
        inp.closest('.item-doc').classList.toggle('ok', inp.checked);
        resumo();
      }));
      resumo();
    };
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === c));
      atual = c.dataset.sit; desenhar();
    }));
    btnCopiar.addEventListener('click', async () => {
      const msg = btnCopiar.dataset.msg;
      try { await navigator.clipboard.writeText(msg); btnCopiar.textContent = 'Lista copiada'; }
      catch (e) { btnCopiar.textContent = 'Selecione e copie a lista pelo WhatsApp'; }
      setTimeout(() => { btnCopiar.textContent = 'Copiar minha lista'; }, 2200);
    });
    desenhar();
  }

  /* ---------- PRIVACIDADE: sumário que acompanha a leitura ---------- */
  if (pagina === 'privacidade') {
    const barra = $('#progLeitura'), links = $$('.toc a'), secoes = links.map(a => $(a.getAttribute('href')));
    const tick = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      barra.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;
      let atual = 0;
      secoes.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .35) atual = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === atual));
    };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
    tick();
  }
})();
