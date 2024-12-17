FROM node:20 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .

FROM base AS local
CMD npm run start