# ABORDAGEM DEFINITIVA: Usa a imagem oficial do Puppeteer que já vem com Node.js e Chrome
# Esta imagem elimina a necessidade de instalar manualmente o Chrome e suas dependências.
FROM ghcr.io/puppeteer/puppeteer:22.10.0

# A imagem já vem com um usuário não-root 'pptruser'. Mudamos para a pasta de trabalho dele.
# Por segurança, a aplicação não rodará como 'root'.
WORKDIR /home/pptruser/app

# A imagem já inclui o 'git', então não precisamos instalá-lo.

# Copia os arquivos de pacote, garantindo que o dono seja o usuário 'pptruser'
COPY --chown=pptruser:pptruser package*.json ./

# Instala as dependências de produção do seu projeto
RUN npm install --omit=dev

# Copia o resto do código do seu projeto
COPY --chown=pptruser:pptruser . .

# Expõe a porta que o Render irá usar para se comunicar com o seu serviço
EXPOSE 10000

# O comando para iniciar a sua aplicação
CMD [ "node", "server.js" ]

