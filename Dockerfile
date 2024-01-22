FROM node:14-alpine

COPY server.js /server.js
COPY package.json /package.json

RUN npm install redis

CMD node /server.js
