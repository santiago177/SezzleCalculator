package main

import (
	"encoding/json"
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

	var got helloResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}

	if got.Response != "Hello, World!" {
		t.Fatalf("response = %q, want %q", got.Response, "Hello, World!")
	}
}

func TestSum(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, sumPath+"?a=2&b=3.5", nil)
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	var got sumResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}

	if got.Result != 5.5 {
		t.Fatalf("result = %v, want %v", got.Result, 5.5)
	}
}

func TestSumMissingParameter(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, sumPath+"?a=2", nil)
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}

	var got errorResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}

	if !strings.Contains(got.Error, "missing query parameter: b") {
		t.Fatalf("error = %q, want it to contain %q", got.Error, "missing query parameter: b")
	}
}

func TestSumInvalidParameter(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, sumPath+"?a=2&b=oops", nil)
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}

	var got errorResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}

	if !strings.Contains(got.Error, "invalid query parameter: b") {
		t.Fatalf("error = %q, want it to contain %q", got.Error, "invalid query parameter: b")
	}
}

// TestMethodNotAllowedSetsAllowHeader documents that the mux advertises the
// supported verbs on a 405, without any handler-level validation code.
func TestMethodNotAllowedSetsAllowHeader(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, sumPath, strings.NewReader(``))
	rec := httptest.NewRecorder()

	newRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusMethodNotAllowed)
	}

	if got := rec.Header().Get("Allow"); !strings.Contains(got, http.MethodGet) {
		t.Fatalf("Allow = %q, want it to contain %q", got, http.MethodGet)
	}
}
