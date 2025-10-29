// Lógica da página de detalhes do post

// Elementos do DOM
const container = document.getElementById('postDetailsContainer');

/**
 * Inicializa a página
 */
async function init() {
    const postId = getUrlParameter('id');

    if (!postId) {
        showError('ID da publicação não fornecido na URL', container);
        return;
    }

    await loadPostDetails(postId);
}

/**
 * Carrega detalhes do post
 */
async function loadPostDetails(postId) {
    showLoading('Carregando detalhes da publicação...', container);

    const result = await fetchPostById(postId);

    if (!result.success) {
        showError(result.error, container);
        return;
    }

    renderPostDetails(result.data);
}

/**
 * Renderiza detalhes completos do post
 */
function renderPostDetails(post) {
    container.innerHTML = '';

    // Cabeçalho
    const header = createPostHeader(post);
    container.appendChild(header);

    // Seção: Informações
    const infoSection = createInfoSection(post);
    container.appendChild(infoSection);

    // Seção: Conteúdo
    const contentSection = createContentSection(post);
    container.appendChild(contentSection);

    // Seção: Imagens
    const imagesSection = createImagesSection(post);
    container.appendChild(imagesSection);
}

/**
 * Cria cabeçalho do post
 */
function createPostHeader(post) {
    const header = document.createElement('div');
    header.className = 'post-header-detail';

    const statusBadge = createStatusBadge(post.status);
    const dateText = formatDate(post.created_at);

    header.innerHTML = `
        ${statusBadge}
        <h1>${escapeHtml(post.topic || 'Sem título')}</h1>
        <p class="text-muted mb-0">
            <i class="fas fa-calendar"></i>
            Criado em ${escapeHtml(dateText)}
        </p>
    `;

    return header;
}

/**
 * Cria seção de informações
 */
function createInfoSection(post) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    section.innerHTML = `
        <h2><i class="fas fa-info-circle"></i> Informações do Post</h2>
        <div class="info-grid">
            ${createInfoItem('Objetivo', translateGoal(post.goal))}
            ${createInfoItem('Público-alvo', post.target_audience)}
            ${createInfoItem('Tom', translateTone(post.tone))}
            ${createInfoItem('Formato', translateFormat(post.format))}
            ${post.cta ? createInfoItem('CTA', post.cta) : ''}
            ${post.link ? createInfoItem('Link', post.link, true) : ''}
        </div>
        ${post.additional_context ? createAdditionalContext(post.additional_context) : ''}
    `;

    return section;
}

/**
 * Cria item de informação
 */
function createInfoItem(label, value, isLink = false) {
    if (!value) return '';

    const displayValue = isLink
        ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`
        : escapeHtml(value);

    return `
        <div class="info-item">
            <label>${escapeHtml(label)}</label>
            <div class="value">${displayValue}</div>
        </div>
    `;
}

/**
 * Cria seção de contexto adicional
 */
function createAdditionalContext(context) {
    return `
        <div class="info-item mt-3" style="grid-column: 1 / -1;">
            <label>Contexto Adicional</label>
            <div class="value">${escapeHtml(context)}</div>
        </div>
    `;
}

/**
 * Cria seção de conteúdo
 */
function createContentSection(post) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    section.innerHTML = `
        <h2><i class="fas fa-file-lines"></i> Conteúdo Gerado</h2>
        ${createContentDisplay(post)}
    `;

    return section;
}

/**
 * Cria display do conteúdo
 */
function createContentDisplay(post) {
    if (!post.post_contents || post.post_contents.length === 0) {
        return `
            <div class="no-content-message">
                <i class="fas fa-file-circle-question"></i>
                <p>Conteúdo ainda não foi gerado</p>
            </div>
        `;
    }

    // Pegar o conteúdo (normalmente há apenas um)
    const content = post.post_contents[0].content;

    if (!content) {
        return `
            <div class="no-content-message">
                <i class="fas fa-file-circle-question"></i>
                <p>Conteúdo vazio</p>
            </div>
        `;
    }

    return `
        <div class="content-display">${nl2br(content)}</div>
    `;
}

/**
 * Cria seção de imagens
 */
function createImagesSection(post) {
    const section = document.createElement('div');
    section.className = 'detail-section';

    section.innerHTML = `
        <h2><i class="fas fa-images"></i> Imagens Geradas</h2>
        ${createImagesDisplay(post)}
    `;

    return section;
}

/**
 * Cria display das imagens
 */
function createImagesDisplay(post) {
    if (!post.post_images || post.post_images.length === 0) {
        return `
            <div class="no-content-message">
                <i class="fas fa-image"></i>
                <p>Imagens ainda não foram geradas</p>
            </div>
        `;
    }

    const imagesGrid = document.createElement('div');
    imagesGrid.className = 'images-grid';

    post.post_images.forEach(image => {
        const imageCard = createImageCard(image);
        imagesGrid.appendChild(imageCard);
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(imagesGrid);

    return wrapper.innerHTML;
}

/**
 * Cria card de imagem
 */
function createImageCard(image) {
    const card = document.createElement('div');
    card.className = `image-card ${image.is_selected ? 'selected' : ''}`;

    const providerBadge = `
        <span class="provider-badge">
            ${escapeHtml(translateProvider(image.provider))}
        </span>
    `;

    const selectedBadge = image.is_selected
        ? '<span class="selected-badge"><i class="fas fa-check"></i> Selecionada</span>'
        : '';

    const prompt = image.image_prompt
        ? `<div class="image-prompt">${escapeHtml(image.image_prompt)}</div>`
        : '';

    card.innerHTML = `
        <img
            src="${escapeHtml(image.image_url)}"
            alt="Imagem gerada"
            loading="lazy"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 200%22%3E%3Crect fill=%22%23eee%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagem não disponível%3C/text%3E%3C/svg%3E'"
        >
        <div class="image-card-header">
            ${providerBadge}
            ${selectedBadge}
        </div>
        ${prompt}
    `;

    return card;
}

/**
 * Cria badge de status (reutilizando função de index.js)
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

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', init);
