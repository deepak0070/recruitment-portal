# Stage 1: Build React + Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Node.js server serving API + built frontend
FROM node:20-alpine AS runner
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/uploads/resumes

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "backend/server.js"]
