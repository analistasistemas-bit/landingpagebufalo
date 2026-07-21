#!/usr/bin/env bash
# content-resilience.sh — garante que a-marca.astro/qualidade.astro não quebram
# o build quando o cliente edita "Valores"/"Blocos" pelo painel Sveltia e a
# lista fica menor do que o número de itens original (regressão corrigida
# na revisão de 2026-07-21 — ver code-review-v2.md).
set -euo pipefail
cd "$(dirname "$0")/.."

A_MARCA="src/content/paginas/a-marca.json"
QUALIDADE="src/content/paginas/qualidade.json"
BACKUP_DIR=$(mktemp -d)
trap 'cp "$BACKUP_DIR/a-marca.json" "$A_MARCA"; cp "$BACKUP_DIR/qualidade.json" "$QUALIDADE"; rm -rf "$BACKUP_DIR"' EXIT

cp "$A_MARCA" "$BACKUP_DIR/a-marca.json"
cp "$QUALIDADE" "$BACKUP_DIR/qualidade.json"

python3 - "$A_MARCA" "$QUALIDADE" <<'PY'
import json, sys
a_marca_path, qualidade_path = sys.argv[1:3]

d = json.load(open(a_marca_path))
d["valores"] = d["valores"][:3]
json.dump(d, open(a_marca_path, "w"), ensure_ascii=False, indent=2)

d2 = json.load(open(qualidade_path))
d2["blocos"] = d2["blocos"][:2]
json.dump(d2, open(qualidade_path, "w"), ensure_ascii=False, indent=2)
PY

echo "Rodando build com 'valores' (3 itens) e 'blocos' (2 itens) — simula edição no CMS..."
npm run build

echo "OK — build não quebrou com listas de tamanho reduzido."
