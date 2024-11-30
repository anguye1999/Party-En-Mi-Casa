FROM docker.io/node:22

WORKDIR /app/src

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
