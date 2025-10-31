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
            button.classList.add('active');
        } else {
            button.classList.remove('active');
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
    const grid = document.createElement('div');
    grid.className = 'posts-grid';

    posts.forEach(post => {
        const card = createPostCard(post);
        grid.appendChild(card);
    });

    postsContainer.innerHTML = '';
    postsContainer.appendChild(grid);
}

/**
 * Cria um card de post
 */
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
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
        <div class="post-card-header">
            ${statusBadge}
            <span class="post-date">${escapeHtml(dateText)}</span>
        </div>

        <h3 class="post-title">${escapeHtml(post.topic || 'Sem título')}</h3>

        <div class="post-meta">
            ${metaBadges}
        </div>

        <div class="post-preview">
            ${escapeHtml(preview)}
        </div>

        <div class="post-card-footer">
            <button class="btn btn-primary btn-view-details">
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
    const badgeClass = getStatusBadgeClass(status);
    const icon = getStatusIcon(status);
    const text = translateStatus(status);

    return `
        <span class="post-status-badge ${badgeClass}">
            <i class="fas ${icon}"></i>
            ${escapeHtml(text)}
        </span>
    `;
}

/**
 * Cria badges de meta informações
 */
function createMetaBadges(post) {
    const badges = [];

    if (post.goal) {
        badges.push(`<span class="post-meta-badge">${escapeHtml(translateGoal(post.goal))}</span>`);
    }

    if (post.target_audience) {
        badges.push(`<span class="post-meta-badge">${escapeHtml(post.target_audience)}</span>`);
    }

    if (post.tone) {
        badges.push(`<span class="post-meta-badge">${escapeHtml(translateTone(post.tone))}</span>`);
    }

    if (post.format) {
        badges.push(`<span class="post-meta-badge">${escapeHtml(translateFormat(post.format))}</span>`);
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
