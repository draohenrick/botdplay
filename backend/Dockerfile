# Use Node 20 oficial
FROM node:20-bullseye-slim

# Instala dependências necessárias para Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Diretório da aplicação
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Define variável para pular download do Chromium se já estiver instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Instala dependências de produção
RUN npm install --omit=dev

# Copia todo o restante do app
COPY . .

# Expõe porta do Render (Render usará process.env.PORT)
EXPOSE 10000

# Cria usuário não-root (opcional, mais seguro)
RUN useradd -m appuser
USER appuser

# Comando para iniciar o servidor
CMD ["node", "server.js"]
