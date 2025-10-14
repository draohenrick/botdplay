# Usar Node 18
FROM node:18-alpine

# Definir diretório da aplicação
WORKDIR /usr/src/app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar todo o código
COPY . .

# Expor porta padrão
EXPOSE 3000

# Comando para iniciar o backend
CMD ["node", "server.js"]
