# Usa uma imagem oficial e leve do Node.js
FROM node:18-slim

# Instala as dependências de sistema corretas e atualizadas
# para o Puppeteer/Chrome rodar no ambiente da Render.
RUN apt-get update && apt-get install -y \
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

# Define o caminho para o executável do Chrome para o Puppeteer encontrar
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Copia o resto dos arquivos do projeto
COPY . .

# Comando para iniciar a aplicação
CMD [ "node", "server.js" ]
