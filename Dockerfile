# LinkedIn Posts Dashboard - Dockerfile para Easypanel
# Serve arquivos estáticos com nginx e injeta variáveis de ambiente

# Stage 1: Build (preparação)
FROM nginx:alpine AS final

# Instalar dependências necessárias para o entrypoint
RUN apk add --no-cache bash

# Copiar arquivos do projeto para o nginx
COPY . /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expor porta 80
EXPOSE 80

# Usar entrypoint customizado que injeta ENV vars
ENTRYPOINT ["/docker-entrypoint.sh"]

# Comando padrão (executado após entrypoint)
CMD ["nginx", "-g", "daemon off;"]
