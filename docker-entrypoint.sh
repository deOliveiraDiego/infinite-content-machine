#!/bin/bash
# Script de entrypoint para injetar variáveis de ambiente no código JavaScript

set -e

echo "================================"
echo "LinkedIn Posts Dashboard"
echo "Iniciando aplicação..."
echo "================================"

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  AVISO: Variáveis de ambiente não configuradas!"
    echo "Configure no Easypanel:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo "  - WEBHOOK_GENERATE_CONTENT"
    echo "  - WEBHOOK_GENERATE_IMAGES"
    echo ""
else
    echo "✓ Variáveis de ambiente detectadas"
fi

# Criar arquivo JavaScript com as variáveis de ambiente
# Este arquivo será injetado ANTES de env.js carregar
ENV_FILE="/usr/share/nginx/html/js/env-injected.js"

cat > "$ENV_FILE" <<EOF
// Variáveis de ambiente injetadas pelo Docker
window.ENV = {
    SUPABASE_URL: "${SUPABASE_URL:-}",
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY:-}",
    WEBHOOK_GENERATE_CONTENT: "${WEBHOOK_GENERATE_CONTENT:-}",
    WEBHOOK_GENERATE_IMAGES: "${WEBHOOK_GENERATE_IMAGES:-}"
};
EOF

echo "✓ Variáveis de ambiente injetadas em: $ENV_FILE"

# Atualizar os HTMLs para carregar env-injected.js ANTES de env.js
# Isso garante que window.ENV esteja disponível
HTML_FILES=(
    "/usr/share/nginx/html/posts/index.html"
    "/usr/share/nginx/html/posts/new.html"
    "/usr/share/nginx/html/posts/show.html"
)

for html_file in "${HTML_FILES[@]}"; do
    if [ -f "$html_file" ]; then
        # Adicionar script tag para env-injected.js antes de env.js
        if ! grep -q "env-injected.js" "$html_file"; then
            sed -i 's|<script src="../js/env.js"></script>|<script src="../js/env-injected.js"></script>\n    <script src="../js/env.js"></script>|g' "$html_file"
            echo "✓ Atualizado: $html_file"
        fi
    fi
done

echo "================================"
echo "✓ Aplicação pronta!"
echo "================================"
echo ""

# Executar o comando passado como argumento (nginx)
exec "$@"
