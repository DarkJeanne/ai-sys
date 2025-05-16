# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve with a lightweight Node.js image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built frontend from previous stage
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

RUN npm install --omit=dev

EXPOSE 4173

<<<<<<< Updated upstream
CMD ["npx", "vite", "preview", "--host"]
=======
CMD ["npx", "vite", "preview", "--host"]
>>>>>>> Stashed changes
