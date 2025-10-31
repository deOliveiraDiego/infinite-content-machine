// Sistema de validação de credenciais
// As credenciais são carregadas de credentials.js (gerado em produção ou manual em dev)

(function() {
    'use strict';

    // Validar se as credenciais foram carregadas
    if (typeof window.CREDENTIALS !== 'undefined' && window.CREDENTIALS !== null) {
        const requiredVars = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'WEBHOOK_GENERATE_CONTENT',
            'WEBHOOK_GENERATE_IMAGES'
        ];

        const missingVars = requiredVars.filter(key => !window.CREDENTIALS[key]);

        if (missingVars.length > 0) {
            console.error('[ENV] Credenciais faltando:', missingVars);
            console.error('[ENV] Desenvolvimento: Verifique js/credentials.js');
            console.error('[ENV] Produção: Verifique as variáveis de ambiente no Easypanel');
        } else {
            console.log('[ENV] Credenciais carregadas com sucesso');
        }
    } else {
        console.error('[ENV] Arquivo credentials.js não encontrado!');
        console.error('[ENV] Desenvolvimento: Crie o arquivo js/credentials.js');
        console.error('[ENV] Produção: Configure as variáveis de ambiente no Easypanel');

        // Criar objeto vazio para evitar erros
        window.CREDENTIALS = {
            SUPABASE_URL: '',
            SUPABASE_ANON_KEY: '',
            WEBHOOK_GENERATE_CONTENT: '',
            WEBHOOK_GENERATE_IMAGES: ''
        };
    }
})();
