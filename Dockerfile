# syntax=docker/dockerfile:1

# ---------- Stage 1: build the frontend static files ----------
FROM node:24-alpine AS frontend
WORKDIR /app/frontend

# Install npm dependencies (cached unless package files change)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the static assets into /app/frontend/dist
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: build the Go backend ----------
FROM golang:1.27-alpine AS backend
WORKDIR /src

COPY go.mod ./
RUN go mod download

COPY main.go ./
COPY api/ ./api/
COPY calculator/ ./calculator/

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server .

# ---------- Stage 3: minimal runtime image ----------
FROM alpine:3.22
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=backend /out/server ./server
# main.go serves static files from the relative path "frontend/dist"
COPY --from=frontend /app/frontend/dist ./frontend/dist

USER app
EXPOSE 8080

ENTRYPOINT ["./server"]

