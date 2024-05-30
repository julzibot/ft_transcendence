FROM node:21-alpine3.18

WORKDIR /app
COPY package.json .

# Install dependencies
RUN npm install socket.io cors
RUN npm install -g nodemon

COPY . /app

EXPOSE 5000

CMD ["nodemon", "server.js"]