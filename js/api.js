// Funções para interação com a API do Supabase

/**
 * Retorna os headers necessários para requisições ao Supabase
 */
function getSupabaseHeaders() {
    return {
        'apikey': CREDENTIALS.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CREDENTIALS.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Faz uma requisição GET ao Supabase
 * @param {string} endpoint - Endpoint da API (ex: '/rest/v1/posts')
 * @param {Object} queryParams - Parâmetros de query (opcional)
 * @returns {Promise<Object>} - Dados retornados ou erro
 */
async function supabaseGet(endpoint, queryParams = {}) {
    try {
        // Construir URL com query params
        const url = new URL(`${CREDENTIALS.SUPABASE_URL}${endpoint}`);

        Object.keys(queryParams).forEach(key => {
            url.searchParams.append(key, queryParams[key]);
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getSupabaseHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Erro na requisição ao Supabase:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca lista de posts
 * @param {Object} options - Opções de filtro
 * @param {string} options.status - Filtrar por status (opcional)
 * @param {number} options.limit - Limite de resultados (padrão: CONFIG.DEFAULT_LIMIT)
 * @returns {Promise<Object>} - Array de posts ou erro
 */
async function fetchPosts(options = {}) {
    const queryParams = {
        order: 'created_at.desc'
    };

    // Adicionar limite
    if (options.limit) {
        queryParams.limit = options.limit;
    } else {
        queryParams.limit = CONFIG.DEFAULT_LIMIT;
    }

    // Adicionar filtro de status se fornecido
    if (options.status) {
        queryParams.status = `eq.${options.status}`;
    }

    return await supabaseGet('/rest/v1/posts', queryParams);
}

/**
 * Busca um post específico com seus relacionamentos
 * @param {string} postId - UUID do post
 * @returns {Promise<Object>} - Post com post_contents e post_images ou erro
 */
async function fetchPostById(postId) {
    if (!postId) {
        return { success: false, error: 'ID do post não fornecido' };
    }

    const queryParams = {
        id: `eq.${postId}`,
        select: '*,post_contents!post_contents_post_id_fkey(*),post_images(*)'
    };

    const result = await supabaseGet('/rest/v1/posts', queryParams);

    if (result.success && result.data) {
        // Supabase retorna array, pegar primeiro item
        if (result.data.length === 0) {
            return { success: false, error: 'Post não encontrado' };
        }

        return { success: true, data: result.data[0] };
    }

    return result;
}

/**
 * Testa a conexão com o Supabase
 * @returns {Promise<boolean>} - true se conectado com sucesso
 */
async function testSupabaseConnection() {
    try {
        const result = await supabaseGet('/rest/v1/posts', { limit: 1 });
        return result.success;
    } catch (error) {
        console.error('Falha ao conectar com Supabase:', error);
        return false;
    }
}

/**
 * Atualiza o selected_content_id de um post
 * @param {string} postId - UUID do post
 * @param {string} contentId - UUID do conteúdo selecionado
 * @returns {Promise<Object>} - Sucesso ou erro
 */
async function updateSelectedContent(postId, contentId) {
    try {
        const url = `${CREDENTIALS.SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: getSupabaseHeaders(),
            body: JSON.stringify({
                selected_content_id: contentId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return { success: true };

    } catch (error) {
        console.error('Erro ao atualizar conteúdo selecionado:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Dispara geração de conteúdo via webhook
 * @param {string} postId - UUID do post
 * @returns {Promise<Object>} - Sucesso ou erro
 */
async function generateContent(postId) {
    try {
        const response = await fetch(CREDENTIALS.WEBHOOK_GENERATE_CONTENT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Falha ao chamar webhook`);
        }

        return { success: true };

    } catch (error) {
        console.error('Erro ao gerar conteúdo:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Dispara geração de imagens via webhook
 * @param {string} postId - UUID do post
 * @param {string} contentId - UUID do conteúdo selecionado
 * @returns {Promise<Object>} - Sucesso ou erro
 */
async function generateImages(postId, contentId) {
    try {
        const response = await fetch(CREDENTIALS.WEBHOOK_GENERATE_IMAGES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                selected_content_id: contentId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Falha ao chamar webhook`);
        }

        return { success: true };

    } catch (error) {
        console.error('Erro ao gerar imagens:', error);
        return { success: false, error: error.message };
    }
}
