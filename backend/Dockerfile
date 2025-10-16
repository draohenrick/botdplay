FROM node:20-bullseye-slim

# Instala dependências do Puppeteer e Git
RUN apt-get update && apt-get install -y \
    git \
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

WORKDIR /usr/src/app

COPY package*.json ./

# Pula download do Chromium se já estiver instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

RUN npm install --omit=dev

COPY . .

EXPOSE 10000

# Usuário não-root
RUN useradd -m appuser
USER appuser

# Inicia o servidor
CMD ["node", "server.js"]
