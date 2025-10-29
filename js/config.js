// Configurações gerais da aplicação
const CONFIG = {
    // Limite padrão de posts a carregar
    DEFAULT_LIMIT: 50,

    // Intervalo para auto-refresh (30 segundos)
    AUTO_REFRESH_INTERVAL: 30000,

    // Número máximo de caracteres para preview de contexto
    PREVIEW_MAX_LENGTH: 100,

    // Formatos de data
    DATE_FORMATS: {
        RELATIVE_THRESHOLD_DAYS: 7, // Mostrar formato relativo se menos de 7 dias
    },

    // Estados possíveis dos posts
    STATUS: {
        PENDING_GENERATION: 'pending_generation',
        GENERATING: 'generating',
        PENDING_REVIEW: 'pending_review',
        APPROVED: 'approved',
        GENERATED: 'generated',
        PUBLISHED: 'published',
        FAILED: 'failed'
    },

    // Objetivos possíveis
    GOALS: {
        EDUCATE: 'educate',
        INSPIRE: 'inspire',
        SELL: 'sell',
        ENGAGE: 'engage'
    },

    // Tons possíveis
    TONES: {
        FORMAL: 'formal',
        CASUAL: 'casual',
        HYBRID: 'hybrid'
    },

    // Formatos possíveis
    FORMATS: {
        STORYTELLING: 'storytelling',
        LIST: 'list',
        TUTORIAL: 'tutorial'
    },

    // Providers de imagem
    IMAGE_PROVIDERS: {
        GEMINI: 'gemini',
        CHATGPT: 'chatgpt'
    }
};
