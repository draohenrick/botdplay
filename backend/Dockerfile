# NOVA ABORDAGEM: Usa uma imagem oficial pré-construída que já contém o Puppeteer e o Chrome.
# Isso elimina a necessidade de instalar manualmente o Chrome e suas dependências.
FROM ghcr.io/puppeteer/puppeteer:22.10.0

# O Puppeteer já vem instalado. Agora, instalamos o Git que é necessário para o whatsapp-web.js.
# O usuário 'pptruser' já existe nesta imagem, então mudamos para o root para instalar pacotes.
USER root
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Volta para o usuário padrão não-root para mais segurança.
USER pptruser

# Define o diretório de trabalho dentro da pasta home do usuário pptruser.
WORKDIR /home/pptruser/app

# Copia os arquivos de pacote para o diretório de trabalho.
COPY --chown=pptruser:pptruser package*.json ./

# Instala apenas as dependências de produção do seu projeto.
RUN npm install --omit=dev

# Copia o resto do código do seu projeto.
COPY --chown=pptruser:pptruser . .

# Comando para iniciar a aplicação.
CMD [ "node", "server.js" ]

