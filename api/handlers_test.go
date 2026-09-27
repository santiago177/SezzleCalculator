package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// doRequest sends a request to BasePath+url and returns the recorded response.
func doRequest(t *testing.T, method, url string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, BasePath+url, nil)
	rec := httptest.NewRecorder()
	NewRouter().ServeHTTP(rec, req)
	return rec
}

// assertResult checks for a 200 response with the expected JSON result.
func assertResult(t *testing.T, rec *httptest.ResponseRecorder, want float64) {
	t.Helper()
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body: %s)", rec.Code, http.StatusOK, rec.Body.String())
	}
	var body resultResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Result != want {
		t.Fatalf("result = %v, want %v", body.Result, want)
	}
}

// assertStatus checks that the response has the expected status code.
func assertStatus(t *testing.T, rec *httptest.ResponseRecorder, want int) {
	t.Helper()
	if rec.Code != want {
		t.Fatalf("status = %d, want %d (body: %s)", rec.Code, want, rec.Body.String())
	}
}

func TestSum(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/sum?a=2&b=3")
	assertResult(t, rec, 5)
}

func TestSubtraction(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/subtraction?a=5&b=8")
	assertResult(t, rec, -3)
}

func TestMultiplication(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/multiplication?a=4&b=2.5")
	assertResult(t, rec, 10)
}

func TestDivision(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/division?a=10&b=4")
	assertResult(t, rec, 2.5)
}

func TestDivisionByZero(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/division?a=10&b=0")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestExponentiation(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/exponentiation?a=2&b=10")
	assertResult(t, rec, 1024)
}

func TestExponentiationZeroNegativePower(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/exponentiation?a=0&b=-1")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestSquareRoot(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/squareroot?a=16")
	assertResult(t, rec, 4)
}

func TestSquareRootNegative(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/squareroot?a=-4")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestPercentage(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/percentage?a=20&b=50")
	assertResult(t, rec, 10)
}

func TestNonNumericParam(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/sum?a=abc&b=1")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestMissingParam(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/sum?a=1")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestNaNParam(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "/sum?a=NaN&b=1")
	assertStatus(t, rec, http.StatusBadRequest)
}

func TestWrongMethod(t *testing.T) {
	rec := doRequest(t, http.MethodPost, "/sum?a=1&b=1")
	assertStatus(t, rec, http.StatusMethodNotAllowed)
}
