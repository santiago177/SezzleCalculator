package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestSum(t *testing.T) {
	result, err := Sum(1, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 3 {
		t.Errorf("expected 3, got %v", result)
	}

	_, err = Sum(math.MaxFloat64, math.MaxFloat64)
	if !errors.Is(err, ErrInvalidResult) {
		t.Errorf("expected ErrInvalidResult on overflow, got %v", err)
	}
}

func TestSubtraction(t *testing.T) {
	result, err := Subtraction(5, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 2 {
		t.Errorf("expected 2, got %v", result)
	}

	_, err = Subtraction(-math.MaxFloat64, math.MaxFloat64)
	if !errors.Is(err, ErrInvalidResult) {
		t.Errorf("expected ErrInvalidResult on overflow, got %v", err)
	}
}

func TestMultiplication(t *testing.T) {
	result, err := Multiplication(2, 4)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 8 {
		t.Errorf("expected 8, got %v", result)
	}

	_, err = Multiplication(math.MaxFloat64, 2)
	if !errors.Is(err, ErrInvalidResult) {
		t.Errorf("expected ErrInvalidResult on overflow, got %v", err)
	}
}

func TestDivision(t *testing.T) {
	result, err := Division(10, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 5 {
		t.Errorf("expected 5, got %v", result)
	}
}

func TestDivisionByZero(t *testing.T) {
	result, err := Division(10, 0)
	if !errors.Is(err, ErrDivisionByZero) {
		t.Errorf("expected ErrDivisionByZero, got %v", err)
	}
	if result != 0 {
		t.Errorf("expected 0 result on error, got %v", result)
	}
}

func TestZeroDividedByZero(t *testing.T) {
	_, err := Division(0, 0)
	if !errors.Is(err, ErrDivisionByZero) {
		t.Errorf("expected ErrDivisionByZero, got %v", err)
	}
}

func TestExponentiation(t *testing.T) {
	result, err := Exponentiation(2, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 8 {
		t.Errorf("expected 8, got %v", result)
	}

	_, err = Exponentiation(10, 400)
	if !errors.Is(err, ErrInvalidResult) {
		t.Errorf("expected ErrInvalidResult on overflow, got %v", err)
	}
}

func TestSquareRoot(t *testing.T) {
	result, err := SquareRoot(16)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 4 {
		t.Errorf("expected 4, got %v", result)
	}
}

func TestZeroRaisedToNegativePower(t *testing.T) {
	result, err := Exponentiation(0, -1)
	if !errors.Is(err, ErrUndefinedPowZero) {
		t.Errorf("expected ErrUndefinedPowZero, got %v", err)
	}
	if result != 0 {
		t.Errorf("expected 0 result on error, got %v", result)
	}
}

func TestSquareRootOfNegativeNumber(t *testing.T) {
	result, err := SquareRoot(-4)
	if !errors.Is(err, ErrNegativeSqrt) {
		t.Errorf("expected ErrNegativeSqrt, got %v", err)
	}
	if result != 0 {
		t.Errorf("expected 0 result on error, got %v", result)
	}
}

func TestPercentage(t *testing.T) {
	result, err := Percentage(20, 50)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != 10 {
		t.Errorf("expected 10, got %v", result)
	}

	_, err = Percentage(math.MaxFloat64, math.MaxFloat64)
	if !errors.Is(err, ErrInvalidResult) {
		t.Errorf("expected ErrInvalidResult on overflow, got %v", err)
	}
}
