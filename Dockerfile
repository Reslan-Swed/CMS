FROM node:lts-alpine3.14
RUN addgroup app && adduser -S -G app app
WORKDIR /app
COPY package*.json .
RUN npm i
COPY .env .
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD npm start