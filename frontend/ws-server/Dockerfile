FROM node:22-alpine3.18

WORKDIR /server
COPY package.json .

# Install dependencies
RUN npm install socket.io cors
RUN npm install -g nodemon

COPY . /server

EXPOSE 6500

CMD ["nodemon", "server.js"]