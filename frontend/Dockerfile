FROM node:22 AS build

WORKDIR /app/src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM docker.io/nginx

COPY --from=build /app/src/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
