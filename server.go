package main

import (
	"net/http"
)

// helloWorldPath is the custom URL for the hello world endpoint.
const helloWorldPath = "/api/v1/hello-world"

// newRouter wires up the API routes.
//
// The "GET " prefix is a Go 1.22+ ServeMux method pattern: the mux itself
// rejects other verbs with 405 and sets the Allow header, and HEAD is
// matched automatically alongside GET.
func newRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET "+helloWorldPath, helloWorldHandler)
	return mux
}

// helloWorldHandler returns a plain "Hello, World!" string.
func helloWorldHandler(w http.ResponseWriter, _ *http.Request) {

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Hello, World!"))
}
