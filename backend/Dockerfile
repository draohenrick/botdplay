# Usa uma imagem base mais completa que a 'alpine'
FROM node:18-slim

# Instala o Git e todas as dependências do sistema para o Puppeteer
RUN apt-get update && apt-get install -y \
    git \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends

# Define o caminho do executável do Chrome para o Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/opt/google/chrome/chrome

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de pacote
COPY package*.json ./

# Instala as dependências de produção.
RUN npm install --omit=dev

# Copia o resto do código do projeto
COPY . .

# Comando para iniciar a aplicação
CMD [ "node", "server.js" ]
