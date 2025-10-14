# Use a imagem oficial do Node.js LTS
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install --production

# Copia todo o restante do projeto para dentro do container
COPY . .

# Exponha a porta que o app vai rodar
EXPOSE 3000

# Variável de ambiente para produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
