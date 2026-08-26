#!/bin/bash
# Bloqueia edição/escrita em arquivos .env* pelo Claude neste projeto.
# Rede de segurança extra pro hábito de auto-push sem perguntar nesse repo:
# mesmo que o .gitignore falhe algum dia, o Claude nunca chega a mexer no
# arquivo de segredo.
file_path=$(cat | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))")

if [[ "$file_path" =~ \.env($|\.[^.]*$) ]] && [[ "$file_path" != *.env.example ]]; then
  echo "Bloqueado: edição em arquivo de segredo ($file_path). Peça pro João editar manualmente se precisar." >&2
  exit 2
fi

exit 0
