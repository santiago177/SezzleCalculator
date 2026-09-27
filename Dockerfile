# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Build the frontend (Vite + React) into static assets.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first to leverage Docker layer caching.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy the rest of the frontend source and build the static files.
COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Build the Go backend binary.
# ---------------------------------------------------------------------------
FROM golang:1.27-alpine AS backend-builder
WORKDIR /app

# Download modules first (cached unless go.mod/go.sum change).
COPY go.mod go.sum* ./
RUN go mod download

# Copy the Go source and compile a static binary.
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# ---------------------------------------------------------------------------
# Stage 3: Minimal runtime image with the binary + built frontend assets.
# ---------------------------------------------------------------------------
FROM alpine:3.20 AS runtime
WORKDIR /app

# The server serves static files from the relative path "frontend/dist",
# so preserve that directory layout in the final image.
COPY --from=backend-builder /app/server ./server
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8080

ENTRYPOINT ["/app/server"]

