package main

import (
	"encoding/json"
	"net/http"
)

// API paths.
const (
	helloWorldPath = "/api/v1/hello-world"
	sumPath        = "/api/v1/sum"
)

// helloResponse is the JSON payload returned by the hello world endpoint.
type helloResponse struct {
	Response string `json:"response"`
}

// sumRequest is the JSON payload accepted by the sum endpoint.
type sumRequest struct {
	A float64 `json:"a"`
	B float64 `json:"b"`
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
	mux.HandleFunc("POST "+sumPath, sumHandler)
	return mux
}

// helloWorldHandler returns {"response": "Hello, World!"}.
func helloWorldHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, helloResponse{Response: "Hello, World!"})
}

// sumHandler adds the two numbers in the request body.
func sumHandler(w http.ResponseWriter, r *http.Request) {
	var req sumRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "invalid json body"})
		return
	}

	writeJSON(w, http.StatusOK, sumResponse{Result: req.A + req.B})
}

// writeJSON encodes payload as JSON with the given status code.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
