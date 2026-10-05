# Terra Marcada · site institucional

Site estático (HTML, CSS e JavaScript puros, sem build) da Terra Marcada, mapeamento territorial em Ijuí/RS.

## Páginas
| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial em cenas: hero, problema, voo, time lapse da carta, rigor, serviços e REURB, contato |
| `servicos.html` | Serviços com filtros e detalhes |
| `documentacao.html` | Lista de conferência de documentos por situação |
| `sobre.html` | Quem somos, como trabalhamos e perfil da Dra. Sandra Bado |
| `privacidade.html` | Política de privacidade (LGPD). **Revisar com advogado antes de publicar** |

## Como rodar localmente
Qualquer servidor estático serve. Exemplos:
```bash
python3 -m http.server 4600      # ou
npx http-server -p 4600
```
Abra `http://localhost:4600`. (Abrir os arquivos direto do disco também funciona, mas o relevo é gerado na própria página em vez de em segundo plano.)

Verificação de links e arquivos: `node scripts/verificar-links.mjs`.

## Estrutura
- `site.css` e `pages.css`: estilos (tokens de cor e tipografia no `:root` de `site.css`).
- `site.js`: cenas da página inicial. `paginas.js`: páginas internas. `nav.js`: menu do celular, pausa das animações, divisores. `topo.js`: botão de voltar ao topo. `config.js`: dados do negócio.
- `terrain.js` (carregador), `terrain-worker.js` e `terrain-core.js` (gerador do relevo, roda em Web Worker).
- `sites-incriveis.js` e `.css`: motor de animação por rolagem (não editar).
- `assets/`: imagens otimizadas. `materiais-originais/`: arquivos de origem, fora do site.

## O que atualizar com dados reais
- **WhatsApp**: `config.js` (e os links do HTML, usados sem JavaScript).
- **Dra. Sandra Bado**: em `sobre.html`, trocar o monograma pela foto (comentário no código) e preencher as três "gavetas" (formação e registro profissional, atuação, mensagem).
- **Registros profissionais** (CREA, CFT, credenciamento do piloto): incluir na cena "O rigor".
- **Terreno de exemplo** da cena do mapa é ilustrativo e está marcado como tal.

## Acessibilidade e desempenho
Respeita `prefers-reduced-motion`, tem link "pular para o conteúdo", menu acessível no celular, botão para pausar animações e conteúdo legível sem JavaScript.
