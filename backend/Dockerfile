# Usa a imagem base leve do Node.js
FROM node:18-slim

# Define variáveis de ambiente para evitar prompts interativos durante a instalação
ENV DEBIAN_FRONTEND=noninteractive

# Instala o Git e as dependências essenciais para o Puppeteer de forma otimizada
RUN apt-get update \
    && apt-get install -y \
    git \
    # Dependências do Chrome/Puppeteer
    ca-certificates \
    fonts-liberation \
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
    wget \
    xdg-utils \
    --no-install-recommends \
    # Limpa o cache do apt no final para reduzir o tamanho da imagem
    && rm -rf /var/lib/apt/lists/*

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

