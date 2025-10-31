const CREDENTIALS = {
    SUPABASE_URL: 'https://[SEU-PROJETO].supabase.co',
    SUPABASE_ANON_KEY: 'SUA_ANON_KEY_AQUI',

    // Webhooks do n8n para geração de conteúdo e imagens
    WEBHOOK_GENERATE_CONTENT: 'https://[SEU-N8N]/webhook/generate-content',
    WEBHOOK_GENERATE_IMAGES: 'https://[SEU-N8N]/webhook/generate-images'
};

// Para usar:
// 1. Copie este arquivo para credentials.js
// 2. Substitua os valores acima pelas credenciais reais
// 3. O arquivo credentials.js está no .gitignore e não será commitado
//
// Para obter as credenciais do Supabase:
// 1. Acesse seu projeto no Supabase (https://app.supabase.com)
// 2. Vá em Settings > API
// 3. Copie a "Project URL" e a "anon public" key
//
// Para configurar os webhooks:
// 1. Configure os workflows no n8n
// 2. Copie as URLs dos webhooks
// 3. Cole aqui substituindo os valores de exemplo
