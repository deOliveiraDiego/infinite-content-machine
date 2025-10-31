// Lógica da página de listagem de posts

// Estado da aplicação
let allPosts = [];
let currentFilter = 'all';
let autoRefreshInterval = null;

// Elementos do DOM
const postsContainer = document.getElementById('postsContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const refreshBtn = document.getElementById('refreshBtn');

/**
 * Inicializa a página
 */
async function init() {
    setupEventListeners();
    await loadPosts();
    startAutoRefresh();
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            setActiveFilter(filter);
            filterPosts(filter);
        });
    });

    // Botão de refresh
    refreshBtn.addEventListener('click', async () => {
        await loadPosts();
    });
}

/**
 * Define o filtro ativo
 */
function setActiveFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(button => {
        if (button.getAttribute('data-filter') === filter) {
            // Ativo: azul LinkedIn
            button.className = 'filter-btn px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-linkedin text-white shadow-sm';
        } else {
            // Inativo: cinza
            button.className = 'filter-btn px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    });
}

/**
 * Carrega posts da API
 */
async function loadPosts() {
    showLoading('Carregando publicações...', postsContainer);

    const result = await fetchPosts();

    if (!result.success) {
        showError(result.error, postsContainer);
        return;
    }

    allPosts = result.data;

    if (allPosts.length === 0) {
        showEmpty('Nenhuma publicação encontrada', postsContainer);
        return;
    }

    filterPosts(currentFilter);
}

/**
 * Filtra posts pelo status
 */
function filterPosts(filter) {
    let filteredPosts = allPosts;

    if (filter !== 'all') {
        filteredPosts = allPosts.filter(post => post.status === filter);
    }

    if (filteredPosts.length === 0) {
        showEmpty('Nenhuma publicação encontrada com este filtro', postsContainer);
        return;
    }

    renderPosts(filteredPosts);
}

/**
 * Renderiza a lista de posts
 */
function renderPosts(posts) {
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const card = createPostCard(post);
        postsContainer.appendChild(card);
    });
}

/**
 * Cria um card de post
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg border border-gray-200 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col h-full';
    card.onclick = () => navigateToPost(post.id);

    // Status badge
    const statusBadge = createStatusBadge(post.status);

    // Data
    const dateText = formatDate(post.created_at);

    // Meta badges (goal, tone, format)
    const metaBadges = createMetaBadges(post);

    // Preview do contexto
    const preview = post.additional_context
        ? truncateText(post.additional_context)
        : 'Sem contexto adicional';

    card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            ${statusBadge}
            <span class="text-xs text-gray-500">${escapeHtml(dateText)}</span>
        </div>

        <h3 class="text-lg font-semibold text-gray-800 mb-3">${escapeHtml(post.topic || 'Sem título')}</h3>

        <div class="flex flex-wrap gap-2 mb-3">
            ${metaBadges}
        </div>

        <div class="text-sm text-gray-600 mb-4 flex-grow">
            ${escapeHtml(preview)}
        </div>

        <div class="mt-auto">
            <button class="w-full px-4 py-2 bg-linkedin hover:bg-linkedin-dark text-white rounded-lg font-medium text-sm transition-all duration-200">
                Ver Detalhes
            </button>
        </div>
    `;

    return card;
}

/**
 * Cria badge de status
 */
function createStatusBadge(status) {
    const colors = getStatusColors(status);
    const icon = getStatusIcon(status);
    const text = translateStatus(status);

    return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors}">
            <i class="fas ${icon}"></i>
            ${escapeHtml(text)}
        </span>
    `;
}

/**
 * Retorna as cores Tailwind para cada status
 */
function getStatusColors(status) {
    const statusColors = {
        'pending_generation': 'bg-gray-100 text-gray-700',
        'generating': 'bg-blue-100 text-blue-700',
        'generated': 'bg-cyan-100 text-cyan-700',
        'pending_review': 'bg-yellow-100 text-yellow-700',
        'approved': 'bg-linkedin text-white',
        'published': 'bg-green-100 text-green-700',
        'failed': 'bg-red-100 text-red-700'
    };

    return statusColors[status] || 'bg-gray-100 text-gray-700';
}

/**
 * Cria badges de meta informações
 */
function createMetaBadges(post) {
    const badges = [];

    if (post.goal) {
        badges.push(`<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${escapeHtml(translateGoal(post.goal))}</span>`);
    }

    if (post.target_audience) {
        badges.push(`<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${escapeHtml(post.target_audience)}</span>`);
    }

    if (post.tone) {
        badges.push(`<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${escapeHtml(translateTone(post.tone))}</span>`);
    }

    if (post.format) {
        badges.push(`<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${escapeHtml(translateFormat(post.format))}</span>`);
    }

    return badges.join('');
}

/**
 * Navega para página de detalhes do post
 */
function navigateToPost(postId) {
    window.location.href = `show.html?id=${postId}`;
}

/**
 * Inicia auto-refresh
 */
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(async () => {
        // Recarrega sem mostrar loading (silencioso)
        const result = await fetchPosts();

        if (result.success) {
            allPosts = result.data;
            filterPosts(currentFilter);
        }
    }, CONFIG.AUTO_REFRESH_INTERVAL);
}

/**
 * Para auto-refresh (cleanup)
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', init);
