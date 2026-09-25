package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHelloWorld(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, helloWorldPath, nil)
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	if got := strings.TrimSpace(rec.Body.String()); got != "Hello, World!" {
		t.Fatalf("body = %q, want %q", got, "Hello, World!")
	}
}

// TestMethodNotAllowedSetsAllowHeader documents that the mux advertises the
// supported verbs on a 405, without any handler-level validation code.
func TestMethodNotAllowedSetsAllowHeader(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, helloWorldPath, nil)
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusMethodNotAllowed)
	}

	if got := rec.Header().Get("Allow"); !strings.Contains(got, http.MethodGet) {
		t.Fatalf("Allow = %q, want it to contain %q", got, http.MethodGet)
	}
}
