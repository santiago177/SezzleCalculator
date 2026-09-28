package main

import (
	"log"
	"net/http"

	"sezzleCalculator/api"
)

const (
	addr = ":8080"
	// Directory with the built frontend (output of `npm run build` in ./frontend)
	staticDir = "frontend/dist"
)

func main() {
	mux := http.NewServeMux()
	// API endpoints under /api/v1/...
	mux.Handle("/api/", api.NewRouter())
	// Everything else is served from the frontend build
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))

	log.Printf("Calculator listening on %s (static files from %s)", addr, staticDir)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
