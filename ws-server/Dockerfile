FROM node:22-alpine3.18

WORKDIR /server
COPY package.json /server

RUN npm install socket.io cors
RUN npm install -g nodemon
COPY . /server

CMD ["nodemon", "server.js"]