// Sistema de carregamento de credenciais
// Suporta variáveis de ambiente (produção) e arquivo local (desenvolvimento)

(function() {
    'use strict';

    // Se window.ENV existe (injetado pelo Docker em produção)
    if (typeof window.ENV !== 'undefined' && window.ENV !== null) {
        console.log('[ENV] Usando variáveis de ambiente (produção)');

        window.CREDENTIALS = {
            SUPABASE_URL: window.ENV.SUPABASE_URL,
            SUPABASE_ANON_KEY: window.ENV.SUPABASE_ANON_KEY,
            WEBHOOK_GENERATE_CONTENT: window.ENV.WEBHOOK_GENERATE_CONTENT,
            WEBHOOK_GENERATE_IMAGES: window.ENV.WEBHOOK_GENERATE_IMAGES
        };

        // Validar se todas as credenciais foram fornecidas
        const requiredVars = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'WEBHOOK_GENERATE_CONTENT',
            'WEBHOOK_GENERATE_IMAGES'
        ];

        const missingVars = requiredVars.filter(key => !window.CREDENTIALS[key]);

        if (missingVars.length > 0) {
            console.error('[ENV] Variáveis de ambiente faltando:', missingVars);
            alert('Erro: Configuração incompleta. Verifique as variáveis de ambiente.');
        } else {
            console.log('[ENV] Todas as credenciais carregadas com sucesso');
        }
    }
    // Se CREDENTIALS já existe (carregado de credentials.js)
    else if (typeof window.CREDENTIALS !== 'undefined') {
        console.log('[ENV] Usando credentials.js (desenvolvimento local)');
    }
    // Nenhuma credencial disponível
    else {
        console.warn('[ENV] Nenhuma credencial encontrada!');
        console.warn('[ENV] Desenvolvimento: Crie o arquivo js/credentials.js');
        console.warn('[ENV] Produção: Configure as variáveis de ambiente no Easypanel');

        // Criar objeto vazio para evitar erros
        window.CREDENTIALS = {
            SUPABASE_URL: '',
            SUPABASE_ANON_KEY: '',
            WEBHOOK_GENERATE_CONTENT: '',
            WEBHOOK_GENERATE_IMAGES: ''
        };
    }
})();
