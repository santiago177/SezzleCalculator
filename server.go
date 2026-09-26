package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

// API paths.
const (
	helloWorldPath = "/api/v1/hello-world"
	sumPath        = "/api/v1/sum"
)

// frontendDistDir is the directory containing the built frontend assets
// (produced by `npm run build` in the frontend folder).
const frontendDistDir = "frontend/dist"

// helloResponse is the JSON payload returned by the hello world endpoint.
type helloResponse struct {
	Response string `json:"response"`
}

// sumResponse is the JSON payload returned by the sum endpoint.
type sumResponse struct {
	Result float64 `json:"result"`
}

// errorResponse is the JSON payload returned when a request fails.
type errorResponse struct {
	Error string `json:"error"`
}

// newRouter wires up the API routes.
func newRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET "+helloWorldPath, helloWorldHandler)
	mux.HandleFunc("GET "+sumPath, sumHandler)
	// Catch-all: serve the built frontend. API patterns above are more
	// specific, so the mux matches them before this root handler.
	mux.Handle("GET /", staticFileHandler(frontendDistDir))
	return mux
}

// helloWorldHandler returns {"response": "Hello, World!"}.
func helloWorldHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, helloResponse{Response: "Hello, World!"})
}

// sumHandler adds the two numbers in the query string.
func sumHandler(w http.ResponseWriter, r *http.Request) {
	a, err := parseQueryFloat(r, "a")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: err.Error()})
		return
	}

	b, err := parseQueryFloat(r, "b")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, sumResponse{Result: a + b})
}

// parseQueryFloat reads and validates a float query parameter.
func parseQueryFloat(r *http.Request, key string) (float64, error) {
	value := r.URL.Query().Get(key)
	if value == "" {
		return 0, fmt.Errorf("missing query parameter: %s", key)
	}

	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid query parameter: %s", key)
	}

	return parsed, nil
}

// writeJSON encodes payload as JSON with the given status code.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

// staticFileHandler serves files from dir, falling back to index.html so
// client-side routes (single-page app) still resolve to the app shell.
func staticFileHandler(dir string) http.Handler {
	fileServer := http.FileServer(http.Dir(dir))
	indexPath := filepath.Join(dir, "index.html")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Map the request path to a file inside dir. filepath.Clean keeps the
		// lookup contained within dir, preventing path traversal.
		requested := filepath.Join(dir, filepath.Clean(r.URL.Path))

		info, err := os.Stat(requested)
		if err != nil || info.IsDir() {
			// Missing file or a directory (including "/"): serve the SPA shell.
			http.ServeFile(w, r, indexPath)
			return
		}

		fileServer.ServeHTTP(w, r)
	})
}
