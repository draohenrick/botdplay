# Dockerfile

# 1. Imagem base oficial do Node.js
FROM node:18-alpine

# 2. Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala dependências
RUN npm install

# 5. Copia todo o restante do projeto para dentro do container
COPY . .

# 6. Expõe a porta que a aplicação irá rodar
EXPOSE 3000

# 7. Comando para iniciar o servidor
CMD ["node", "server.js"]
