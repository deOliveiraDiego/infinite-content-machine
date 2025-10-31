// Lógica da página de detalhes do post com geração de conteúdo

// Estado global
let currentPost = null;
let selectedContentId = null;
let autoReloadInterval = null;

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

    // Verificar se deve iniciar ou parar auto-reload
    checkAutoReload(currentPost);
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
    header.className = 'mb-6';

    const statusBadge = createStatusBadge(post.status);
    const dateText = formatDate(post.created_at);

    header.innerHTML = `
        ${statusBadge}
        <h1 class="text-3xl font-bold text-gray-900 mt-4 mb-2">${escapeHtml(post.topic || 'Sem título')}</h1>
        <p class="text-gray-600 flex items-center gap-2">
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
    section.className = 'bg-white rounded-lg shadow-sm p-6 mb-6';

    section.innerHTML = `
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fas fa-info-circle text-linkedin"></i>
            Informações do Post
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer" class="text-linkedin hover:underline">${escapeHtml(value)}</a>`
        : escapeHtml(value);

    return `
        <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm font-semibold text-gray-700 mb-1">${escapeHtml(label)}</div>
            <div class="text-gray-800">${displayValue}</div>
        </div>
    `;
}

/**
 * Cria seção de contexto adicional
 */
function createAdditionalContext(context) {
    return `
        <div class="bg-gray-50 p-4 rounded-lg mt-4 col-span-full">
            <div class="text-sm font-semibold text-gray-700 mb-1">Contexto Adicional</div>
            <div class="text-gray-800">${escapeHtml(context)}</div>
        </div>
    `;
}

/**
 * Cria seção de conteúdo com estados dinâmicos
 */
function createContentSection(post) {
    const section = document.createElement('div');
    section.className = 'bg-white rounded-lg shadow-sm p-6 mb-6';
    section.id = 'contentSection';

    const hasContents = post.post_contents && post.post_contents.length > 0;
    const isGenerating = post.status === 'generating' && !hasContents;
    const hasSelection = post.selected_content_id !== null;

    section.innerHTML = `
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fas fa-file-lines text-linkedin"></i>
            Conteúdo Gerado
        </h2>
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
            <div class="text-center py-12">
                <i class="fas fa-file-circle-question text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-600 mb-6">Nenhum conteúdo gerado ainda</p>
                <button class="px-6 py-3 bg-linkedin hover:bg-linkedin-dark text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2" id="btnGenerateContent">
                    <i class="fas fa-magic"></i>
                    Gerar Texto
                </button>
            </div>
        `;
    }

    // Estado 2: Gerando
    if (isGenerating) {
        return `
            <div class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-linkedin text-5xl mb-4"></i>
                <p class="text-gray-700 font-medium">
                    Gerando conteúdo... A página será atualizada automaticamente a cada 10 segundos.
                </p>
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
        return `<p class="text-gray-600 text-center py-4">Aguardando geração de conteúdos...</p>`;
    }

    return `
        <div class="mb-4 p-4 bg-blue-50 border-l-4 border-linkedin rounded">
            <p class="text-gray-800 font-medium">Selecione a versão que você prefere:</p>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-6">
            ${contents.map((content, index) => createContentCard(content, index, false)).join('')}
        </div>

        <div class="flex justify-end">
            <button class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" id="btnConfirmSelection" disabled>
                <i class="fas fa-check"></i>
                Confirmar Seleção
            </button>
        </div>
    `;
}

/**
 * Cria card de conteúdo
 */
function createContentCard(content, index, isConfirmed) {
    const isSelected = selectedContentId === content.id;

    let cardClasses = 'bg-white border-2 rounded-lg p-5 cursor-pointer transition-all duration-200';

    if (isConfirmed) {
        if (isSelected) {
            cardClasses += ' border-green-600 bg-green-50';
        } else {
            cardClasses += ' border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed';
        }
    } else {
        if (isSelected) {
            cardClasses += ' border-linkedin bg-blue-50';
        } else {
            cardClasses += ' border-gray-200 hover:border-linkedin';
        }
    }

    return `
        <div class="${cardClasses}" data-content-id="${content.id}">
            <div class="flex items-center gap-3 mb-3">
                <input
                    type="radio"
                    name="content-selection"
                    id="content-${content.id}"
                    class="w-4 h-4 text-linkedin focus:ring-linkedin focus:ring-2"
                    value="${content.id}"
                    ${isSelected ? 'checked' : ''}
                    ${isConfirmed ? 'disabled' : ''}
                >
                <label for="content-${content.id}" class="font-semibold text-gray-900 cursor-pointer">
                    Versão ${index + 1}
                </label>
            </div>
            <div class="text-gray-700 whitespace-pre-wrap">${escapeHtml(content.content)}</div>
        </div>
    `;
}

/**
 * Cria view de conteúdo selecionado
 */
function createContentSelectedView(post) {
    const contents = post.post_contents;
    const selectedId = post.selected_content_id;
    const hasImages = post.post_images && post.post_images.length > 0;

    // Separar conteúdo selecionado das outras versões
    const selectedContent = contents.find(c => c.id === selectedId);
    const otherContents = contents.filter(c => c.id !== selectedId);

    selectedContentId = selectedId;

    return `
        <div class="mb-4 p-4 bg-green-50 border-l-4 border-green-600 rounded flex items-center gap-2">
            <i class="fas fa-check-circle text-green-600"></i>
            <p class="text-gray-800 font-medium">Versão selecionada:</p>
        </div>

        <!-- Versão Selecionada -->
        <div class="mb-6">
            ${selectedContent ? createContentCard(selectedContent, 0, true) : ''}
        </div>

        <!-- Outras Versões (Colapsável) -->
        ${otherContents.length > 0 ? `
            <div class="mb-6">
                <button
                    id="toggleOtherVersions"
                    class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-between"
                    onclick="document.getElementById('otherVersionsContainer').classList.toggle('hidden'); document.getElementById('toggleIcon').classList.toggle('rotate-180');"
                >
                    <span>Ver outras versões (${otherContents.length})</span>
                    <i id="toggleIcon" class="fas fa-chevron-down transition-transform duration-200"></i>
                </button>
                <div id="otherVersionsContainer" class="hidden mt-4 grid grid-cols-1 gap-4">
                    ${otherContents.map((content, index) => createContentCard(content, index + 1, true)).join('')}
                </div>
            </div>
        ` : ''}

        <!-- Banner de Geração (só mostrar se NÃO tiver imagens) -->
        ${!hasImages ? `
            <div class="p-4 bg-blue-50 border-l-4 border-linkedin rounded flex items-center gap-2">
                <i class="fas fa-info-circle text-linkedin"></i>
                <p class="text-gray-700">Seleção confirmada. Gerando imagens...</p>
            </div>
        ` : ''}
    `;
}

/**
 * Cria seção de imagens
 */
function createImagesSection(post) {
    const section = document.createElement('div');
    section.className = 'bg-white rounded-lg shadow-sm p-6 mb-6';
    section.id = 'imagesSection';

    const hasImages = post.post_images && post.post_images.length > 0;
    const hasSelection = post.selected_content_id !== null;
    const isGeneratingImages = hasSelection && !hasImages;

    section.innerHTML = `
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fas fa-images text-linkedin"></i>
            Imagens Geradas
        </h2>
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
            <div class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-linkedin text-5xl mb-4"></i>
                <p class="text-gray-700 font-medium">
                    Gerando imagens... A página será atualizada automaticamente a cada 10 segundos.
                </p>
            </div>
        `;
    }

    // Sem seleção ainda
    if (!hasSelection) {
        return `
            <div class="text-center py-12">
                <i class="fas fa-image text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-600">Selecione um conteúdo primeiro para gerar as imagens.</p>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${imagesHtml}
        </div>
    `;
}

/**
 * Cria card de imagem
 */
function createImageCard(image) {
    const providerBadge = `
        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            ${escapeHtml(translateProvider(image.provider))}
        </span>
    `;

    const selectedBadge = image.is_selected
        ? '<span class="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium inline-flex items-center gap-1"><i class="fas fa-check"></i> Selecionada</span>'
        : '';

    const prompt = image.image_prompt
        ? `<div class="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">${escapeHtml(image.image_prompt)}</div>`
        : '';

    const cardClasses = image.is_selected
        ? 'bg-white border-2 border-green-600 rounded-lg overflow-hidden transition-all duration-200'
        : 'bg-white border-2 border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-linkedin';

    return `
        <div class="${cardClasses}">
            <img
                src="${escapeHtml(image.image_url)}"
                alt="Imagem gerada"
                loading="lazy"
                class="w-full h-auto"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 200%22%3E%3Crect fill=%22%23eee%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3EImagem não disponível%3C/text%3E%3C/svg%3E'"
            >
            <div class="p-4">
                <div class="flex items-center gap-2 flex-wrap">
                    ${providerBadge}
                    ${selectedBadge}
                </div>
                ${prompt}
            </div>
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

    // Radio buttons: Seleção de conteúdo
    const radioButtons = document.querySelectorAll('input[name="content-selection"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', handleContentSelection);
    });

    // Cards: Clicar no card inteiro seleciona
    const contentCards = document.querySelectorAll('[data-content-id]');
    contentCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Não processar clique se o card está desabilitado
            if (card.classList.contains('cursor-not-allowed') || card.classList.contains('opacity-50')) {
                return;
            }

            // Se não clicou diretamente no radio, simular clique
            if (e.target.type !== 'radio') {
                const radio = card.querySelector('input[type="radio"]');
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

    // 1. Atualizar status para "generating"
    const statusResult = await updatePostStatus(postId, 'generating');

    if (!statusResult.success) {
        showToast('Erro ao atualizar status', statusResult.error, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Gerar Texto';
        return;
    }

    // 2. Disparar webhook de geração
    const result = await generateContent(postId);

    if (result.success) {
        showToast('Geração iniciada!', 'O conteúdo será atualizado automaticamente.', 'success');
        // Recarregar página para mostrar loading state e iniciar auto-reload
        setTimeout(reloadPost, 1000);
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
    document.querySelectorAll('[data-content-id]').forEach(card => {
        const cardContentId = card.getAttribute('data-content-id');

        if (cardContentId === selectedContentId) {
            // Aplicar estilo selecionado
            card.className = 'bg-white border-2 rounded-lg p-5 cursor-pointer transition-all duration-200 border-linkedin bg-blue-50';
        } else {
            // Aplicar estilo não selecionado
            card.className = 'bg-white border-2 rounded-lg p-5 cursor-pointer transition-all duration-200 border-gray-200 hover:border-linkedin';
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
    showToast('Seleção confirmada!', 'As imagens serão atualizadas automaticamente.', 'success');

    // Recarregar página para mostrar loading state e iniciar auto-reload
    setTimeout(reloadPost, 1000);
}

/**
 * Mostra notificação toast
 */
function showToast(title, message, type = 'success') {
    // Criar container se não existir
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }

    // Criar toast
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    const toastHtml = `
        <div id="${toastId}" class="${bgColor} text-white rounded-lg shadow-lg p-4 min-w-[320px] max-w-md flex items-start gap-3 animate-slide-in" role="alert">
            <i class="fas ${icon} text-xl mt-0.5"></i>
            <div class="flex-1">
                <div class="font-semibold mb-1">${escapeHtml(title)}</div>
                <div class="text-sm opacity-90">${escapeHtml(message)}</div>
            </div>
            <button type="button" class="text-white hover:opacity-80 transition-opacity" onclick="document.getElementById('${toastId}').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.style.opacity = '0';
            toastElement.style.transform = 'translateX(100%)';
            toastElement.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toastElement.remove(), 300);
        }
    }, 5000);
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
 * Verifica se deve iniciar ou parar o auto-reload
 */
function checkAutoReload(post) {
    const hasContents = post.post_contents && post.post_contents.length > 0;
    const isGeneratingContent = post.status === 'generating' && !hasContents;

    const hasImages = post.post_images && post.post_images.length > 0;
    const hasSelection = post.selected_content_id !== null;
    const isGeneratingImages = hasSelection && !hasImages;

    // Iniciar auto-reload se estiver gerando conteúdo ou imagens
    if (isGeneratingContent || isGeneratingImages) {
        startAutoReload();
    } else {
        stopAutoReload();
    }
}

/**
 * Inicia auto-reload a cada 10 segundos
 */
function startAutoReload() {
    // Evitar múltiplos intervals
    if (autoReloadInterval) {
        return;
    }

    console.log('Auto-reload iniciado (10s)');

    autoReloadInterval = setInterval(async () => {
        console.log('Auto-reload: carregando dados...');
        await reloadPost();
    }, 10000); // 10 segundos
}

/**
 * Para o auto-reload
 */
function stopAutoReload() {
    if (autoReloadInterval) {
        console.log('Auto-reload parado');
        clearInterval(autoReloadInterval);
        autoReloadInterval = null;
    }
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    stopAutoReload();
});

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', init);
