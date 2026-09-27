// Package calculator contains the pure arithmetic operations supported by the service.
package calculator

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero   = errors.New("division by zero is not allowed")
	ErrNegativeSqrt     = errors.New("square root of a negative number is not allowed")
	ErrInvalidResult    = errors.New("result is not a finite number")
	ErrUndefinedPowZero = errors.New("zero raised to a negative power is undefined")
)

func checkFinite(v float64) (float64, error) {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return 0, ErrInvalidResult
	}
	return v, nil
}

func Sum(a, b float64) (float64, error)            { return checkFinite(a + b) }
func Subtraction(a, b float64) (float64, error)    { return checkFinite(a - b) }
func Multiplication(a, b float64) (float64, error) { return checkFinite(a * b) }

func Division(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return checkFinite(a / b)
}

func Exponentiation(base, exp float64) (float64, error) {
	if base == 0 && exp < 0 {
		return 0, ErrUndefinedPowZero
	}
	return checkFinite(math.Pow(base, exp))
}

func SquareRoot(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}
	return checkFinite(math.Sqrt(a))
}

// Percentage returns a percent of b (e.g. Percentage(20, 50) = 10).
func Percentage(a, b float64) (float64, error) {
	return checkFinite(a / 100 * b)
}
