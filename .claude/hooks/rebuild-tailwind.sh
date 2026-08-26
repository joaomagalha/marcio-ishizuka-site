#!/bin/bash
# Depois de editar HTML/JS (fontes de classe do Tailwind, ver
# tailwind.config.js `content`), rebuilda o CSS automaticamente. Evita
# subir/pushar tailwind.build.css desatualizado nesse repo que tem
# auto-push sem confirmação.
file_path=$(cat | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))")

if [[ "$file_path" == *.html ]] || [[ "$file_path" == */js/*.js ]]; then
  cd "$CLAUDE_PROJECT_DIR" || exit 0
  npm run build:css --silent >&2
fi

exit 0
