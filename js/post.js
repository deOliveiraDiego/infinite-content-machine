// Lógica da página de detalhes do post com geração de conteúdo

// Estado global
let currentPost = null;
let selectedContentId = null;

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

    currentPost = result.data;
    renderPostDetails(currentPost);
}

/**
 * Recarrega os dados do post (para atualização manual)
 */
async function reloadPost() {
    if (!currentPost || !currentPost.id) return;
    await loadPostDetails(currentPost.id);
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

    // Seção: Conteúdo (com estados dinâmicos)
    const contentSection = createContentSection(post);
    container.appendChild(contentSection);

    // Seção: Imagens
    const imagesSection = createImagesSection(post);
    container.appendChild(imagesSection);

    // Adicionar event listeners após renderizar
    attachEventListeners(post);
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
 * Cria seção de conteúdo com estados dinâmicos
 */
function createContentSection(post) {
    const section = document.createElement('div');
    section.className = 'detail-section';
    section.id = 'contentSection';

    const hasContents = post.post_contents && post.post_contents.length > 0;
    const isGenerating = post.status === 'generating' && !hasContents;
    const hasSelection = post.selected_content_id !== null;

    section.innerHTML = `
        <h2><i class="fas fa-file-lines"></i> Conteúdo Gerado</h2>
        ${getContentDisplay(post, hasContents, isGenerating, hasSelection)}
    `;

    return section;
}

/**
 * Retorna o HTML apropriado para o estado atual do conteúdo
 */
function getContentDisplay(post, hasContents, isGenerating, hasSelection) {
    // Estado 1: Sem conteúdo
    if (!hasContents && !isGenerating) {
        return `
            <div class="no-content-message">
                <i class="fas fa-file-circle-question"></i>
                <p>Nenhum conteúdo gerado ainda</p>
                <button class="btn btn-primary btn-generate" id="btnGenerateContent">
                    <i class="fas fa-magic"></i> Gerar Texto
                </button>
            </div>
        `;
    }

    // Estado 2: Gerando
    if (isGenerating) {
        return `
            <div class="generating-message">
                <i class="fas fa-spinner fa-spin"></i>
                <p>
                    Gerando conteúdo... Aguarde alguns instantes e clique em "Atualizar" para ver o resultado.
                </p>
                <button class="btn btn-outline-primary btn-refresh" id="btnRefreshContent">
                    <i class="fas fa-sync-alt"></i> Atualizar
                </button>
            </div>
        `;
    }

    // Estado 3: Conteúdos gerados, aguardando seleção
    if (hasContents && !hasSelection) {
        return createContentSelectionView(post);
    }

    // Estado 4: Conteúdo selecionado
    if (hasContents && hasSelection) {
        return createContentSelectedView(post);
    }

    return '';
}

/**
 * Cria view de seleção de conteúdo
 */
function createContentSelectionView(post) {
    const contents = post.post_contents;

    if (contents.length < 2) {
        return `<p class="text-muted">Aguardando geração de conteúdos...</p>`;
    }

    return `
        <div class="content-selection-header">
            Selecione a versão que você prefere:
        </div>

        <div class="content-cards-grid">
            ${contents.map((content, index) => createContentCard(content, index, false)).join('')}
        </div>

        <div class="content-actions">
            <button class="btn btn-success" id="btnConfirmSelection" disabled>
                <i class="fas fa-check"></i> Confirmar Seleção
            </button>
        </div>
    `;
}

/**
 * Cria card de conteúdo
 */
function createContentCard(content, index, isConfirmed) {
    const isSelected = selectedContentId === content.id;
    const cardClass = isConfirmed
        ? (isSelected ? 'selected-confirmed' : 'disabled')
        : (isSelected ? 'selected' : '');

    return `
        <div class="content-card ${cardClass}" data-content-id="${content.id}">
            <div class="content-card-header">
                <input
                    type="radio"
                    name="content-selection"
                    id="content-${content.id}"
                    class="content-card-radio"
                    value="${content.id}"
                    ${isSelected ? 'checked' : ''}
                    ${isConfirmed ? 'disabled' : ''}
                >
                <label for="content-${content.id}" class="content-card-label">
                    Versão ${index + 1}
                </label>
            </div>
            <div class="content-card-text">${escapeHtml(content.content)}</div>
        </div>
    `;
}

/**
 * Cria view de conteúdo selecionado
 */
function createContentSelectedView(post) {
    const contents = post.post_contents;
    const selectedId = post.selected_content_id;

    return `
        <div class="content-selection-header selected">
            <i class="fas fa-check-circle"></i>
            Versão selecionada:
        </div>

        <div class="content-cards-grid">
            ${contents.map((content, index) => {
                selectedContentId = selectedId;
                return createContentCard(content, index, true);
            }).join('')}
        </div>

        <div class="content-selection-info">
            <i class="fas fa-info-circle"></i>
            Seleção confirmada. Gerando imagens...
        </div>
    `;
}

/**
 * Cria seção de imagens
 */
function createImagesSection(post) {
    const section = document.createElement('div');
    section.className = 'detail-section';
    section.id = 'imagesSection';

    const hasImages = post.post_images && post.post_images.length > 0;
    const hasSelection = post.selected_content_id !== null;
    const isGeneratingImages = hasSelection && !hasImages;

    section.innerHTML = `
        <h2><i class="fas fa-images"></i> Imagens Geradas</h2>
        ${getImagesDisplay(post, hasImages, hasSelection, isGeneratingImages)}
    `;

    return section;
}

/**
 * Retorna o HTML apropriado para o estado atual das imagens
 */
function getImagesDisplay(post, hasImages, hasSelection, isGeneratingImages) {
    // Gerando imagens
    if (isGeneratingImages) {
        return `
            <div class="generating-message">
                <i class="fas fa-spinner fa-spin"></i>
                <p>
                    Gerando imagens... Aguarde alguns instantes e clique em "Atualizar" para ver o resultado.
                </p>
                <button class="btn btn-outline-primary btn-refresh" id="btnRefreshImages">
                    <i class="fas fa-sync-alt"></i> Atualizar
                </button>
            </div>
        `;
    }

    // Sem seleção ainda
    if (!hasSelection) {
        return `
            <div class="no-content-message">
                <i class="fas fa-image"></i>
                <p>Selecione um conteúdo primeiro para gerar as imagens.</p>
            </div>
        `;
    }

    // Imagens geradas
    if (hasImages) {
        return createImagesGrid(post.post_images);
    }

    return '';
}

/**
 * Cria grid de imagens
 */
function createImagesGrid(images) {
    const imagesHtml = images.map(image => createImageCard(image)).join('');

    return `
        <div class="images-grid">
            ${imagesHtml}
        </div>
    `;
}

/**
 * Cria card de imagem
 */
function createImageCard(image) {
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

    const cardClass = image.is_selected ? 'selected' : '';

    return `
        <div class="image-card ${cardClass}">
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
        </div>
    `;
}

/**
 * Adiciona event listeners após renderização
 */
function attachEventListeners(post) {
    // Botão: Gerar Texto
    const btnGenerate = document.getElementById('btnGenerateContent');
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => handleGenerateContent(post.id));
    }

    // Botões: Atualizar
    const btnRefreshContent = document.getElementById('btnRefreshContent');
    if (btnRefreshContent) {
        btnRefreshContent.addEventListener('click', reloadPost);
    }

    const btnRefreshImages = document.getElementById('btnRefreshImages');
    if (btnRefreshImages) {
        btnRefreshImages.addEventListener('click', reloadPost);
    }

    // Radio buttons: Seleção de conteúdo
    const radioButtons = document.querySelectorAll('.content-card-radio');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleContentSelection);
    });

    // Cards: Clicar no card inteiro seleciona
    const contentCards = document.querySelectorAll('.content-card:not(.disabled)');
    contentCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'radio') {
                const radio = card.querySelector('.content-card-radio');
                if (radio && !radio.disabled) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            }
        });
    });

    // Botão: Confirmar Seleção
    const btnConfirm = document.getElementById('btnConfirmSelection');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => handleConfirmSelection(post.id));
    }
}

/**
 * Handler: Gerar Conteúdo
 */
async function handleGenerateContent(postId) {
    const btn = document.getElementById('btnGenerateContent');
    if (!btn) return;

    // Desabilitar botão
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';

    const result = await generateContent(postId);

    if (result.success) {
        showToast('Geração iniciada!', 'Aguarde alguns instantes e clique em "Atualizar".', 'success');
        // Recarregar após 2 segundos
        setTimeout(reloadPost, 2000);
    } else {
        showToast('Erro ao gerar conteúdo', result.error, 'error');
        // Re-habilitar botão
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Gerar Texto';
    }
}

/**
 * Handler: Seleção de Conteúdo
 */
function handleContentSelection(e) {
    selectedContentId = e.target.value;

    // Atualizar classes dos cards
    document.querySelectorAll('.content-card').forEach(card => {
        const cardContentId = card.getAttribute('data-content-id');
        if (cardContentId === selectedContentId) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    // Habilitar botão de confirmação
    const btnConfirm = document.getElementById('btnConfirmSelection');
    if (btnConfirm) {
        btnConfirm.disabled = false;
    }
}

/**
 * Handler: Confirmar Seleção
 */
async function handleConfirmSelection(postId) {
    if (!selectedContentId) {
        showToast('Erro', 'Selecione um conteúdo primeiro', 'error');
        return;
    }

    const btn = document.getElementById('btnConfirmSelection');
    if (!btn) return;

    // Desabilitar botão
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirmando...';

    // 1. Atualizar selected_content_id no banco
    const updateResult = await updateSelectedContent(postId, selectedContentId);

    if (!updateResult.success) {
        showToast('Erro ao salvar seleção', updateResult.error, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Seleção';
        return;
    }

    // 2. Disparar geração de imagens
    const generateResult = await generateImages(postId, selectedContentId);

    if (!generateResult.success) {
        showToast('Erro ao gerar imagens', generateResult.error, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Seleção';
        return;
    }

    // Sucesso!
    showToast('Seleção confirmada!', 'Gerando imagens... Aguarde alguns instantes.', 'success');

    // Recarregar página após 2 segundos
    setTimeout(reloadPost, 2000);
}

/**
 * Mostra notificação toast
 */
function showToast(title, message, type = 'success') {
    // Criar container se não existir
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Criar toast
    const toastId = 'toast-' + Date.now();
    const toastClass = type === 'success' ? 'toast-success' : 'toast-error';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    const toastHtml = `
        <div id="${toastId}" class="toast custom-toast ${toastClass}" role="alert">
            <div class="toast-header">
                <i class="fas ${icon} me-2"></i>
                <strong class="me-auto">${escapeHtml(title)}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${escapeHtml(message)}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Inicializar e mostrar toast (Bootstrap)
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();

    // Remover do DOM após fechar
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
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

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', init);
