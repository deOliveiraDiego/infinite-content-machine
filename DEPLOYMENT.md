# 🚀 Guia de Deploy no Easypanel

Este guia detalha como fazer o deploy do **LinkedIn Posts Dashboard** no Easypanel com deploy automático via GitHub.

---

## 📋 Pré-requisitos

- Conta no [Easypanel](https://easypanel.io/)
- Repositório no GitHub com acesso
- Credenciais do Supabase (URL e Anon Key)
- URLs dos webhooks do N8N

---

## 🔧 Passo 1: Conectar GitHub ao Easypanel

### 1.1 Autorizar o Easypanel

1. Acesse seu Easypanel
2. Vá em **Settings** → **Git Providers**
3. Clique em **Connect GitHub**
4. Autorize o Easypanel a acessar seus repositórios
5. Selecione o repositório `infinite-content-machine`

---

## 🐳 Passo 2: Criar o App no Easypanel

### 2.1 Criar novo App

1. No Easypanel, clique em **Create App**
2. Escolha **GitHub** como source
3. Configurações:
   - **Repository**: selecione `infinite-content-machine`
   - **Branch**: `main`
   - **Auto Deploy**: ✅ **ON** (deploy automático no push)
   - **Build Method**: Docker (detectado automaticamente)
   - **Port**: `80`

### 2.2 Configurar Variáveis de Ambiente

No app criado, vá em **Environment** e adicione:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WEBHOOK_GENERATE_CONTENT=https://seu-n8n.com/webhook/generate-content
WEBHOOK_GENERATE_IMAGES=https://seu-n8n.com/webhook/generate-images
```

**⚠️ IMPORTANTE:**
- Substitua pelos valores reais do seu projeto
- Não commite essas credenciais no Git!

---

## 🌐 Passo 3: Configurar Domínio

### 3.1 Adicionar Domínio Personalizado

1. No app, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `linkedin-dashboard.seudominio.com`)
4. O Easypanel irá:
   - Gerar certificado SSL automaticamente (Let's Encrypt)
   - Configurar redirecionamento HTTPS

### 3.2 Configurar DNS

No seu provedor de DNS (Cloudflare, etc):

```
Tipo: A
Nome: linkedin-dashboard (ou subdomain desejado)
Valor: [IP fornecido pelo Easypanel]
TTL: Auto
```

**Ou use CNAME:**
```
Tipo: CNAME
Nome: linkedin-dashboard
Valor: [CNAME fornecido pelo Easypanel]
TTL: Auto
```

---

## 🚀 Passo 4: Fazer o Primeiro Deploy

### 4.1 Deploy Manual (primeira vez)

1. No app, clique em **Deploy**
2. Aguarde o build do Docker (~2-3 min)
3. Verifique os logs para garantir que não há erros
4. Acesse o domínio configurado

### 4.2 Testar a Aplicação

1. Acesse: `https://seu-dominio.com`
2. Deve redirecionar para `/posts/index.html`
3. Verifique no Console do navegador (F12):
   ```
   [ENV] Usando variáveis de ambiente (produção)
   [ENV] Todas as credenciais carregadas com sucesso
   ```

---

## 🔄 Fluxo de Deploy Automático

Após a configuração inicial, o deploy é automático:

```bash
# No seu computador
git add .
git commit -m "Nova funcionalidade"
git push origin main

# Easypanel detecta automaticamente:
# 1. GitHub webhook notifica Easypanel
# 2. Build da imagem Docker
# 3. Deploy automático
# 4. App atualizado em ~3 minutos
```

---

## 🐛 Troubleshooting

### Erro: "CREDENTIALS não encontradas"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Vá em **Environment** no Easypanel
2. Adicione todas as 4 variáveis obrigatórias
3. Clique em **Restart App**

### Erro: "Failed to fetch from Supabase"

**Causa**: URL ou Anon Key incorretos

**Solução**:
1. Verifique as credenciais no Supabase (Settings → API)
2. Atualize as ENV vars no Easypanel
3. Restart o app

### Build falha com "nginx not found"

**Causa**: Dockerfile não foi detectado

**Solução**:
1. Verifique se `Dockerfile` está na raiz do repositório
2. Force rebuild: **Deploy** → **Rebuild**

### SSL não funciona

**Causa**: DNS não propagado ainda

**Solução**:
1. Aguarde 5-15 minutos para propagação DNS
2. Verifique se o domínio aponta para o IP correto
3. Tente acessar com `https://` forçado

---

## 📊 Monitoramento

### Logs da Aplicação

No Easypanel:
1. Vá em **Logs**
2. Veja logs em tempo real
3. Filtre por erro: `grep ERROR`

### Health Check

A aplicação expõe um endpoint de health check:

```bash
curl https://seu-dominio.com/health
# Resposta: OK
```

---

## 🔒 Segurança

### Proteção de Credenciais

✅ **Correto** (variáveis de ambiente):
```
ENV vars no Easypanel → Docker → window.ENV → CREDENTIALS
```

❌ **Incorreto** (commitar credenciais):
```
credentials.js no Git → NUNCA FAÇA ISSO
```

### HTTPS Obrigatório

O Easypanel configura SSL automaticamente via Let's Encrypt.

---

## 🔧 Desenvolvimento Local

Para desenvolvimento local, continue usando `js/credentials.js`:

```bash
# Copiar template
cp js/credentials.example.js js/credentials.js

# Editar com suas credenciais locais
# (arquivo ignorado pelo Git)
```

O código detecta automaticamente:
- **Produção**: usa `window.ENV` (injetado pelo Docker)
- **Local**: usa `CREDENTIALS` de `credentials.js`

---

## 📝 Checklist de Deploy

- [ ] Repositório conectado ao Easypanel
- [ ] Branch `main` selecionada
- [ ] Auto Deploy ativado
- [ ] 4 variáveis de ambiente configuradas
- [ ] Domínio adicionado
- [ ] DNS configurado
- [ ] Primeiro deploy executado com sucesso
- [ ] Aplicação acessível via HTTPS
- [ ] Credenciais carregadas corretamente (verificar console)
- [ ] Funcionalidades testadas (criar post, gerar conteúdo, etc)

---

## 🆘 Suporte

**Problemas com Easypanel**: [Docs oficiais](https://easypanel.io/docs)

**Problemas com a aplicação**: Verifique os logs no Easypanel

---

🎉 **Deploy concluído com sucesso!**
