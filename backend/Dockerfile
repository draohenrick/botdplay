# Usa uma imagem base mais completa que a 'alpine'
FROM node:18-slim

# Instala o Git e dependências essenciais para adicionar novos repositórios de pacotes
RUN apt-get update && apt-get install -y \
    git \
    wget \
    gnupg \
    --no-install-recommends

# Adiciona o repositório do Google Chrome de forma segura e moderna
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-archive-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Instala o Google Chrome e a lista completa de dependências necessárias para o Puppeteer
RUN apt-get update && apt-get install -y \
    google-chrome-stable \
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
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
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
    xdg-utils \
    --no-install-recommends

# Limpa o cache do apt para reduzir o tamanho final da imagem
RUN rm -rf /var/lib/apt/lists/*

# Define o caminho correto para o executável do Chrome que foi instalado
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de pacote
COPY package*.json ./

# Instala as dependências de produção
RUN npm install --omit=dev

# Copia o resto do código do projeto
COPY . .

# Comando para iniciar a aplicação
CMD [ "node", "server.js" ]

