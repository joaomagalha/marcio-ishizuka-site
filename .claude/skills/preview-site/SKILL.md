---
name: preview-site
description: Builda o CSS do Tailwind e sobe um servidor local pra testar o site do Márcio no navegador. Use sempre que for verificar visualmente uma mudança neste projeto.
---

# Preview do site (marcio-ishizuka-site)

Este projeto é HTML/CSS/JS puro com Tailwind via CLI (sem dev server próprio).
Antes desta skill, cada verificação repetia os mesmos passos manuais
(matar porta, buildar CSS, subir servidor, abrir navegador) — a skill
empacota isso.

## Passos

1. Buildar o CSS do Tailwind (garante que `css/tailwind.build.css` reflete
   as classes usadas em `index.html`/`js/**`):
   ```bash
   npm run build:css
   ```
2. Matar qualquer servidor antigo na porta 8935 e subir um novo:
   ```bash
   lsof -ti:8935 | xargs kill -9 2>/dev/null; true
   python3 -m http.server 8935 > /tmp/marcio-site-server.log 2>&1 &
   sleep 1
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8935/index.html
   ```
3. Abrir `http://localhost:8935/index.html` no Chrome (ferramentas
   `mcp__claude-in-chrome__*` ou o MCP do Playwright) e conferir a mudança.
4. Ao terminar a verificação, encerrar o servidor:
   ```bash
   lsof -ti:8935 | xargs kill -9 2>/dev/null; true
   ```

Se o projeto ganhar outra página além de `index.html`/`semente.html`,
adicionar aqui o caminho novo.
