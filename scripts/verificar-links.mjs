#!/usr/bin/env node
/* Verificação estática do site: arquivos, links e âncoras locais.
   Uso: node scripts/verificar-links.mjs   (na raiz do projeto) */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const raiz = process.cwd();
const paginas = readdirSync(raiz).filter(f => f.endsWith('.html'));
const ids = new Map();
const conteudo = new Map();
for (const p of paginas) {
  const h = readFileSync(join(raiz, p), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  conteudo.set(p, h);
  ids.set(p, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
}
let erros = 0;
const falha = msg => { erros++; console.error('  x', msg); };

for (const [p, h] of conteudo) {
  console.log(p);
  // ids repetidos
  const todos = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  todos.filter((v, i) => todos.indexOf(v) !== i).forEach(v => falha(`${p}: id repetido "${v}"`));
  // src/href locais
  for (const m of h.matchAll(/\s(?:src|href)="([^"#?][^"]*?)(#[^"]*)?"/g)) {
    const alvo = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(alvo)) continue;
    if (!existsSync(join(raiz, dirname(p), alvo))) falha(`${p}: arquivo inexistente "${alvo}"`);
    else if (m[2] && alvo.endsWith('.html') && !ids.get(alvo)?.has(m[2].slice(1))) falha(`${p}: âncora inexistente "${alvo}${m[2]}"`);
  }
  // âncoras da própria página
  for (const m of h.matchAll(/\shref="#([^"]+)"/g)) if (!ids.get(p).has(m[1])) falha(`${p}: âncora inexistente "#${m[1]}"`);
  // imagens sem alt
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) falha(`${p}: <img> sem alt`);
}
// scripts referenciados dentro dos próprios JS/CSS
for (const f of ['terrain-worker.js']) {
  const t = readFileSync(join(raiz, f), 'utf8');
  for (const m of t.matchAll(/importScripts\('([^']+)'\)/g)) if (!existsSync(join(raiz, m[1]))) falha(`${f}: importScripts inexistente "${m[1]}"`);
}
console.log(erros ? `\n${erros} problema(s) encontrado(s).` : '\nTudo certo: nenhum link ou arquivo quebrado.');
process.exit(erros ? 1 : 0);
