// Funções auxiliares e utilitárias

/**
 * Mapeia status para classe CSS do Bootstrap
 * @param {string} status - Status do post
 * @returns {string} - Classe CSS
 */
function getStatusBadgeClass(status) {
    const statusMap = {
        'pending_generation': 'bg-secondary',
        'generating': 'bg-info',
        'pending_review': 'bg-warning',
        'approved': 'bg-primary',
        'generated': 'bg-info',
        'published': 'bg-success',
        'failed': 'bg-danger'
    };

    return statusMap[status] || 'bg-secondary';
}

/**
 * Mapeia status para ícone do Font Awesome
 * @param {string} status - Status do post
 * @returns {string} - Classe do ícone
 */
function getStatusIcon(status) {
    const iconMap = {
        'pending_generation': 'fa-clock',
        'generating': 'fa-spinner fa-spin',
        'pending_review': 'fa-hourglass-half',
        'approved': 'fa-check',
        'generated': 'fa-check',
        'published': 'fa-check-double',
        'failed': 'fa-triangle-exclamation'
    };

    return iconMap[status] || 'fa-circle';
}

/**
 * Traduz status para português
 * @param {string} status - Status do post
 * @returns {string} - Texto em português
 */
function translateStatus(status) {
    const translations = {
        'pending_generation': 'Aguardando Geração',
        'generating': 'Gerando',
        'pending_review': 'Aguardando Revisão',
        'approved': 'Aprovado',
        'generated': 'Gerado',
        'published': 'Publicado',
        'failed': 'Falhou'
    };

    return translations[status] || status;
}

/**
 * Traduz objetivo (goal) para português
 * @param {string} goal - Objetivo do post
 * @returns {string} - Texto em português
 */
function translateGoal(goal) {
    const translations = {
        'educate': 'Educar',
        'inspire': 'Inspirar',
        'sell': 'Vender/Promover',
        'engage': 'Engajar'
    };

    return translations[goal] || goal;
}

/**
 * Traduz tom (tone) para português
 * @param {string} tone - Tom do post
 * @returns {string} - Texto em português
 */
function translateTone(tone) {
    const translations = {
        'formal': 'Formal',
        'casual': 'Casual',
        'hybrid': 'Híbrido'
    };

    return translations[tone] || tone;
}

/**
 * Traduz formato (format) para português
 * @param {string} format - Formato do post
 * @returns {string} - Texto em português
 */
function translateFormat(format) {
    const translations = {
        'storytelling': 'Storytelling',
        'list': 'Lista',
        'tutorial': 'Tutorial'
    };

    return translations[format] || format;
}

/**
 * Traduz provider de imagem para nome exibível
 * @param {string} provider - Provider da imagem
 * @returns {string} - Nome formatado
 */
function translateProvider(provider) {
    const translations = {
        'gemini': 'Gemini',
        'chatgpt': 'ChatGPT'
    };

    return translations[provider] || provider;
}

/**
 * Formata data em formato relativo (ex: "2h atrás") ou absoluto
 * @param {string} dateString - Data em formato ISO
 * @returns {string} - Data formatada
 */
function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Se mais de 7 dias, mostrar formato absoluto
    if (diffDays > CONFIG.DATE_FORMATS.RELATIVE_THRESHOLD_DAYS) {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Formato relativo
    if (diffSeconds < 60) {
        return 'Agora mesmo';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m atrás`;
    } else if (diffHours < 24) {
        return `${diffHours}h atrás`;
    } else {
        return `${diffDays}d atrás`;
    }
}

/**
 * Trunca texto mantendo palavras completas
 * @param {string} text - Texto para truncar
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} - Texto truncado
 */
function truncateText(text, maxLength = CONFIG.PREVIEW_MAX_LENGTH) {
    if (!text || text.length <= maxLength) return text || '';

    const truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
        return truncated.substr(0, lastSpace) + '...';
    }

    return truncated + '...';
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto para escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Preserva quebras de linha em texto convertendo \n para <br>
 * @param {string} text - Texto com quebras de linha
 * @returns {string} - HTML com <br> tags
 */
function nl2br(text) {
    if (!text) return '';

    return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Extrai parâmetro da URL
 * @param {string} paramName - Nome do parâmetro
 * @returns {string|null} - Valor do parâmetro ou null
 */
function getUrlParameter(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 * @param {HTMLElement} container - Container para exibir o erro
 */
function showError(message, container) {
    container.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            <div>
                <strong>Erro:</strong> ${escapeHtml(message)}
            </div>
        </div>
    `;
}

/**
 * Mostra mensagem de loading
 * @param {string} message - Mensagem (opcional)
 * @param {HTMLElement} container - Container para exibir o loading
 */
function showLoading(message = 'Carregando...', container) {
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-muted">${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Mostra mensagem de lista vazia
 * @param {string} message - Mensagem (opcional)
 * @param {HTMLElement} container - Container para exibir a mensagem
 */
function showEmpty(message = 'Nenhuma publicação encontrada', container) {
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p class="text-muted">${escapeHtml(message)}</p>
        </div>
    `;
}
