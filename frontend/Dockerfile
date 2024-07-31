FROM node:22-alpine3.18

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# RUN npm install --save-dev @types/next-auth

COPY . /app

# Build the Next.js app for production
# RUN npm run build

EXPOSE 3000
# Define the command to run your Next.js app
CMD ["npm", "run", "dev"]