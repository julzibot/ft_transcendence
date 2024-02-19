FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build the Next.js app for production
RUN npm run build


EXPOSE 3000
# Define the command to run your Next.js app
CMD ["npm", "run", "dev"]