FROM node:20-alpine

WORKDIR /app

# Build tools needed for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

EXPOSE 3000

ENV NODE_ENV=production
ENV DATA_DIR=/app/data

CMD ["node", "build/index.js"]
