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

# Substituir placeholders diretamente no arquivo credentials.js
# Isso evita expor as variáveis em window.ENV
CREDENTIALS_FILE="/usr/share/nginx/html/js/credentials.js"

# Criar o arquivo credentials.js com as variáveis de ambiente
cat > "$CREDENTIALS_FILE" <<EOF
// Credenciais geradas automaticamente pelo Docker
// Este arquivo é sobrescrito em produção com as variáveis de ambiente
window.CREDENTIALS = {
    SUPABASE_URL: "${SUPABASE_URL:-}",
    SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY:-}",
    WEBHOOK_GENERATE_CONTENT: "${WEBHOOK_GENERATE_CONTENT:-}",
    WEBHOOK_GENERATE_IMAGES: "${WEBHOOK_GENERATE_IMAGES:-}"
};
EOF

echo "✓ Credenciais injetadas diretamente em: $CREDENTIALS_FILE"

# Criar arquivo env-injected.js vazio (para não quebrar o HTML)
ENV_FILE="/usr/share/nginx/html/js/env-injected.js"
cat > "$ENV_FILE" <<EOF
// Arquivo vazio - as credenciais são injetadas diretamente em credentials.js
EOF

if [ -f "$CREDENTIALS_FILE" ]; then
    echo "✓ Arquivo criado: $CREDENTIALS_FILE"
else
    echo "⚠️  ERRO: Falha ao criar $CREDENTIALS_FILE"
fi

echo "================================"
echo "✓ Aplicação pronta!"
echo "================================"
echo ""

# Executar o comando passado como argumento (nginx)
exec "$@"
