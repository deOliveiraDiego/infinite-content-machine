# Dashboard de Publicações LinkedIn - V0

Interface simples para visualizar publicações geradas pelo sistema de conteúdo para LinkedIn.

## 🎯 Sobre

Este dashboard permite visualizar e gerenciar publicações do LinkedIn de forma simples e intuitiva:
- **Listagem de posts** com filtros por status
- **Detalhes completos** de cada publicação (informações, conteúdo e imagens)
- **Auto-refresh** a cada 30 segundos
- **Design responsivo** para desktop, tablet e mobile

## 🚀 Setup Inicial

### 1. Configure as Credenciais do Supabase

Copie o arquivo de exemplo:

```bash
cp js/credentials.example.js js/credentials.js
```

### 2. Adicione suas Credenciais Reais

Edite o arquivo `js/credentials.js` e substitua pelos valores do seu projeto Supabase:

```javascript
const CREDENTIALS = {
    SUPABASE_URL: 'https://seu-projeto.supabase.co',
    SUPABASE_ANON_KEY: 'sua-chave-anon-key-aqui'
};
```

**Como obter as credenciais:**
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### 3. Inicie um Servidor Local

O dashboard precisa ser servido via HTTP (não funciona abrindo o arquivo diretamente).

**Opção 1 - Python:**
```bash
python -m http.server 8000
```

**Opção 2 - Node.js:**
```bash
npx http-server
```

**Opção 3 - VS Code:**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html`
- Selecione "Open with Live Server"

### 4. Acesse o Dashboard

Abra seu navegador em:
```
http://localhost:8000
```

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** commite o arquivo `js/credentials.js`
- Esse arquivo está listado no `.gitignore` e não deve ir para o repositório
- Use `js/credentials.example.js` apenas como template
- Se as credenciais vazarem, gire-as imediatamente no Supabase

## 📁 Estrutura do Projeto

```
/
├── index.html              # Página de listagem de posts
├── post.html               # Página de detalhes do post
├── css/
│   └── style.css           # Estilos customizados
└── js/
    ├── credentials.js      # ⚠️ Credenciais (NÃO COMMITAR)
    ├── credentials.example.js  # Template de credenciais
    ├── config.js           # Configurações gerais
    ├── api.js              # Funções de API Supabase
    ├── utils.js            # Funções auxiliares
    ├── index.js            # Lógica da listagem
    └── post.js             # Lógica dos detalhes
```

## 🛠️ Tecnologias

- **HTML5** puro
- **CSS3** puro
- **JavaScript Vanilla** (sem frameworks)
- **Bootstrap 5.3** (via CDN)
- **Font Awesome 6** (via CDN)
- **Supabase** (PostgreSQL + REST API)

## 📋 Funcionalidades

### Página de Listagem (index.html)

- ✅ Grid responsivo de cards (3 colunas → 2 → 1)
- ✅ Filtros por status (Todos, Pendentes, Publicados, etc.)
- ✅ Badges coloridos de status com ícones
- ✅ Preview do conteúdo
- ✅ Auto-refresh a cada 30 segundos
- ✅ Estados: loading, empty, error

### Página de Detalhes (post.html)

- ✅ Informações completas do post
- ✅ Conteúdo gerado formatado
- ✅ Galeria de imagens (2 colunas)
- ✅ Destaque da imagem selecionada
- ✅ Campos opcionais tratados (CTA, Link, Contexto)

## 🎨 Personalização

### Alterar Limite de Posts

Em `js/config.js`:
```javascript
DEFAULT_LIMIT: 50  // Altere para o número desejado
```

### Alterar Intervalo de Auto-refresh

Em `js/config.js`:
```javascript
AUTO_REFRESH_INTERVAL: 30000  // Em milissegundos (30000 = 30s)
```

## 🐛 Solução de Problemas

### "Credenciais não encontradas"

Verifique se:
1. O arquivo `js/credentials.js` existe
2. As credenciais estão corretas
3. O arquivo está sendo carregado antes dos outros scripts

### "Erro ao carregar publicações"

Verifique se:
1. As credenciais do Supabase estão corretas
2. Você tem acesso à internet
3. As tabelas existem no banco de dados
4. As políticas RLS (Row Level Security) permitem leitura com a anon key

### Imagens não carregam

Verifique se:
1. As URLs das imagens estão corretas no banco
2. As imagens estão hospedadas em servidores acessíveis
3. Não há bloqueio de CORS

## 📊 Estrutura do Banco (Supabase)

O dashboard espera as seguintes tabelas:

### posts
```sql
- id (uuid, PK)
- topic (text)
- goal (varchar)
- target_audience (text)
- tone (varchar)
- format (varchar)
- additional_context (text, nullable)
- cta (text, nullable)
- link (text, nullable)
- status (varchar)
- created_at (timestamp)
- updated_at (timestamp)
- selected_content_id (uuid, nullable)
```

### post_contents
```sql
- id (uuid, PK)
- post_id (uuid, FK → posts.id)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### post_images
```sql
- id (uuid, PK)
- post_id (uuid, FK → posts.id)
- image_url (text)
- image_prompt (text, nullable)
- provider (varchar)
- is_selected (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🚧 Limitações (V0)

Esta é uma versão inicial focada apenas em **visualização**. Não inclui:
- ❌ Autenticação/Login
- ❌ Criação de posts
- ❌ Edição de posts
- ❌ Aprovação/Publicação
- ❌ Paginação
- ❌ Busca/Pesquisa
- ❌ Exportação de dados

## 📝 Próximos Passos (Roadmap)

Para versões futuras, considere adicionar:
- 🔐 Sistema de autenticação
- ✏️ Editor de posts
- ✅ Fluxo de aprovação
- 🔍 Busca e filtros avançados
- 📄 Paginação
- 📊 Analytics/Estatísticas
- 🌙 Dark mode
- 📱 PWA (Progressive Web App)

## 🤝 Contribuindo

1. Clone o repositório
2. Configure suas credenciais locais (`js/credentials.js`)
3. Faça suas alterações
4. **Nunca** commite `js/credentials.js`
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte do sistema Infinite Content Machine.

---

**Versão:** 1.0
**Data:** 29/10/2025
**Status:** ✅ Pronto para uso
