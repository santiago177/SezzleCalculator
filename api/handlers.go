// Package api exposes the calculator operations as HTTP GET endpoints.
package api

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"

	"sezzleCalculator/calculator"
)

type resultResponse struct {
	Result float64 `json:"result"`
}

type errorResponse struct {
	Error string `json:"error"`
}

// BasePath is the common prefix for all API endpoints.
const BasePath = "/api/v1"

// NewRouter registers one GET endpoint per operation.
//
//	GET /api/v1/sum?a=1&b=2
//	GET /api/v1/subtraction?a=5&b=3
//	GET /api/v1/multiplication?a=2&b=4
//	GET /api/v1/division?a=10&b=2
//	GET /api/v1/exponentiation?a=2&b=3      (a = base, b = exponent)
//	GET /api/v1/squareroot?a=16
//	GET /api/v1/percentage?a=20&b=50        (a percent of b)
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET "+BasePath+"/sum", sumHandler)
	mux.HandleFunc("GET "+BasePath+"/subtraction", subtractionHandler)
	mux.HandleFunc("GET "+BasePath+"/multiplication", multiplicationHandler)
	mux.HandleFunc("GET "+BasePath+"/division", divisionHandler)
	mux.HandleFunc("GET "+BasePath+"/exponentiation", exponentiationHandler)
	mux.HandleFunc("GET "+BasePath+"/squareroot", squareRootHandler)
	mux.HandleFunc("GET "+BasePath+"/percentage", percentageHandler)
	return mux
}

func sumHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Sum(a, b)
	respond(w, result, err)
}

func subtractionHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Subtraction(a, b)
	respond(w, result, err)
}

func multiplicationHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Multiplication(a, b)
	respond(w, result, err)
}

func divisionHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Division(a, b)
	respond(w, result, err)
}

func exponentiationHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Exponentiation(a, b)
	respond(w, result, err)
}

func squareRootHandler(w http.ResponseWriter, r *http.Request) {
	a, err := parseParam(r, "a")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{err.Error()})
		return
	}
	result, err := calculator.SquareRoot(a)
	respond(w, result, err)
}

func percentageHandler(w http.ResponseWriter, r *http.Request) {
	a, b, ok := parseTwoParams(w, r)
	if !ok {
		return
	}
	result, err := calculator.Percentage(a, b)
	respond(w, result, err)
}

// parseTwoParams parses query params "a" and "b". On failure it writes a 400
// response and returns ok=false.
func parseTwoParams(w http.ResponseWriter, r *http.Request) (a, b float64, ok bool) {
	a, err := parseParam(r, "a")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{err.Error()})
		return 0, 0, false
	}
	b, err = parseParam(r, "b")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{err.Error()})
		return 0, 0, false
	}
	return a, b, true
}

func respond(w http.ResponseWriter, result float64, err error) {
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, resultResponse{result})
}

func parseParam(r *http.Request, name string) (float64, error) {
	raw := strings.TrimSpace(r.URL.Query().Get(name))
	if raw == "" {
		return 0, fmt.Errorf("missing required query parameter %q", name)
	}
	v, err := strconv.ParseFloat(raw, 64)
	if err != nil || math.IsNaN(v) || math.IsInf(v, 0) {
		return 0, fmt.Errorf("query parameter %q must be a valid finite number", name)
	}
	return v, nil
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
