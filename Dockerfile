# ==========================================
# Stage 1: Build the React 19 + Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python FastAPI Backend
# ==========================================
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code, data, and config
COPY backend/ ./backend/
COPY data/ ./data/
COPY pytest.ini .env.example ./

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose dynamic port
EXPOSE 8000

# Start unified FastAPI server
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
