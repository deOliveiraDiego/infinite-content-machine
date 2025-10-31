// Lógica da página de criação de novo post

// Elementos do DOM
const form = document.getElementById('newPostForm');
const submitBtn = document.getElementById('submitBtn');

/**
 * Inicializa a página
 */
function init() {
    setupFormValidation();
    setupFormSubmit();
}

/**
 * Configura validação do formulário
 */
function setupFormValidation() {
    // Validação nativa do HTML5
    form.classList.add('needs-validation');

    // Validação customizada para campos opcionais
    const linkInput = document.getElementById('link');
    if (linkInput) {
        linkInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (value && !isValidUrl(value)) {
                linkInput.setCustomValidity('Por favor, insira uma URL válida');
            } else {
                linkInput.setCustomValidity('');
            }
        });
    }
}

/**
 * Configura o submit do formulário
 */
function setupFormSubmit() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar formulário
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        await handleSubmit();
    });
}

/**
 * Handler do submit do formulário
 */
async function handleSubmit() {
    // Desabilitar botão e mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';

    // Coletar dados do formulário
    const formData = new FormData(form);
    const postData = {
        topic: formData.get('topic').trim(),
        goal: formData.get('goal'),
        target_audience: formData.get('target_audience').trim(),
        tone: formData.get('tone'),
        format: formData.get('format'),
        status: 'pending_generation' // Status inicial
    };

    // Adicionar campos opcionais se preenchidos
    const additionalContext = formData.get('additional_context')?.trim();
    if (additionalContext) {
        postData.additional_context = additionalContext;
    }

    const cta = formData.get('cta')?.trim();
    if (cta) {
        postData.cta = cta;
    }

    const link = formData.get('link')?.trim();
    if (link) {
        postData.link = link;
    }

    // Fazer requisição para criar post
    const result = await createPost(postData);

    if (result.success) {
        showSuccessAndRedirect(result.data.id);
    } else {
        showError(result.error);
        // Re-habilitar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Criar Post';
    }
}

/**
 * Mostra mensagem de sucesso e redireciona
 */
function showSuccessAndRedirect(postId) {
    // Criar toast de sucesso
    showToast(
        'Post criado com sucesso!',
        'Redirecionando para a página de detalhes...',
        'success'
    );

    // Redirecionar após 1.5 segundos
    setTimeout(() => {
        window.location.href = `show.html?id=${postId}`;
    }, 1500);
}

/**
 * Mostra mensagem de erro
 */
function showError(errorMessage) {
    showToast(
        'Erro ao criar post',
        errorMessage || 'Ocorreu um erro desconhecido. Tente novamente.',
        'error'
    );
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
 * Valida se uma string é uma URL válida
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Inicializa ao carregar página
document.addEventListener('DOMContentLoaded', init);
