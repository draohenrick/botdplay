# Usa uma imagem base mais completa que a 'alpine'
FROM node:18-slim

# Instala o Git e a lista completa de dependências necessárias para o Puppeteer
RUN apt-get update && apt-get install -y \
    git \
    wget \
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

# NOVA ABORDAGEM: Baixa o pacote do Google Chrome diretamente
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Instala o pacote baixado e corrige quaisquer dependências faltantes
RUN dpkg -i google-chrome-stable_current_amd64.deb || apt-get install -f -y

# Limpa o cache do apt e o arquivo baixado para reduzir o tamanho da imagem
RUN rm -rf /var/lib/apt/lists/* \
    && rm google-chrome-stable_current_amd64.deb

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

