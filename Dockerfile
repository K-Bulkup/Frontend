FROM node:20-alpine

WORKDIR /app

COPY package*.json ./ 
RUN npm ci

COPY . .

RUN npm run build
RUN npm install -g http-server

EXPOSE 8080

CMD ["npx", "http-server", "dist", "-p", "3000", "-a", "0.0.0.0"]