# Use uma imagem oficial Node 20 com Puppeteer
FROM node:20-bullseye-slim

# Configurações de Puppeteer/Chromium
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
    && rm -rf /var/lib/apt/lists/*

# Cria diretório da aplicação
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências, ignora devDependencies
RUN npm install --omit=dev

# Copia todo o restante do app
COPY . .

# Define variáveis de ambiente essenciais para Render
# Render define PORT automaticamente, mas é bom garantir
ENV NODE_ENV=production
ENV PORT=10000

# Expõe a porta do Render
EXPOSE 10000

# Comando para iniciar o app
# Puppeteer precisa de args --no-sandbox
CMD ["node", "-e", "process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'; require('./server.js')"]
