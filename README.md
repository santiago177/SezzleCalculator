# Setup instructions

This project can be run using Docker. Run the following commands from the root directory:

```bash
docker build -t sezzle-calculator .
docker run -p 8080:8080 sezzle-calculator
```

The calculator will be available in http://localhost:8080/

## Run without docker

To run the project without docker you need Go 1.27.1 and npm
1. Generate static files from `/frontend` by running `npm run build`
2. Then run `go run main.go` from the root directory of the project

# Stack
- go version go1.27.1 windows/amd64
- react 19.2.8

# API calls with examples
 The service has one API for each calculator operation, which are the following:
- GET /api/v1/sum?a=1&b=2
- GET /api/v1/subtraction?a=5&b=3
- GET /api/v1/multiplication?a=2&b=4
- GET /api/v1/division?a=10&b=2
- GET /api/v1/exponentiation?a=2&b=3      (a = base, b = exponent)
- GET /api/v1/squareroot?a=16
- GET /api/v1/percentage?a=20&b=50        (a percent of b)

## Sum example

- URL: `http://localhost:8080/api/v1/sum?a=1&b=2`
- Request type: GET
- Response:
```json
{
    "result": 3
}
```

## Subtraction example

- URL: `http://localhost:8080/api/v1/subtraction?a=5&b=3`
- Request type: GET
- Response:
```json
{
    "result": 2
}
```

## Multiplication example

- URL: `http://localhost:8080/api/v1/multiplication?a=2&b=4`
- Request type: GET
- Response:
```json
{
    "result": 8
}
```

## Division example

- URL: `http://localhost:8080/api/v1/division?a=10&b=2`
- Request type: GET
- Response:
```json
{
    "result": 5
}
```

## Exponentiation example

- URL: `http://localhost:8080/api/v1/exponentiation?a=2&b=3`
- Request type: GET
- Response:
```json
{
    "result": 8
}
```

## Square root example

- URL: `http://localhost:8080/api/v1/squareroot?a=16`
- Request type: GET
- Response:
```json
{
    "result": 4
}
```

## Percentage example

- URL: `http://localhost:8080/api/v1/percentage?a=20&b=50`
- Request type: GET
- Response:
```json
{
    "result": 3
}
```

# Design decisions and assumptions
- I decided to implement this project using Go for the backend and React for the frontend
- I had not used Go before, but I am confident that I can make a simple backend service with it
- Most of the development was done with LLM assistance by using GitHub Copilot, which is a good opportunity to test it
- I decided to create a separate endpoint for each calculator operation
- I decided to copy the visual design of Windows calculator to keep it simple
- I eliminated operations that were not required for the assignment from the Windows calculator, like memory, 1/x and x/- operators. For simplicity and to focus on the requirements
- I made the decision to create a dockerfile to run the project easily
- The home page of the calculator is the simple http://localhost:8080/
- The LLM attempted to do iterative unit testing, which can be easily done for very similar requests like sum, subtraction multiplication etc. However, I decided to make explicit separate unit tests, my background is in Java and we try to avoid making iterative unit tests in for loops. Iterative loops might be a common practice in Go but I'm not sure about that, it's an interesting topic to discuss
- I made the same decision for the frontend unit tests. I refactored them from iterative tests to separate unit tests each in its own function
- I decided to make the frontend development using Vite. I've used it in the past and it has worked well for me
- As I was already using vite I used this opportunity to try Vitest, in the past I've used Jest but this is a good opportunity to see how Vitest works
- All calculator operations except square root and percentage have parameters `a` and `b` which are read from left to right to perform the operation. This is important as some operations are non commutative like subtraction and division. Which means that `division?a=10&b=2` is the same as `a / b = 10 / 2 = 5` 
- The initial value of the calculator is 0 similar to Window calculator
- The square root operator is a unary operator, it takes a single parameter and returns the square root of it
- The calculator uses signed 64 bits floats. Anything above that will overflow. This could be refactored to use Big Decimals, but it was not part of the requirements and there is a challenge in displaying very big numbers in the UI
- In the frontend you can make a strong case to create a `Button` component as it's used repeatedly in the template. I decided to not do that for now to let me implement the frontend faster, but it can be refactored and it would be an improvement. I'll do it if I have enough time
- The percentage operator is a strange one which I never use in the calculator because it requires to have an operator before it. As the requirements didn't specify the behavior of the percentage operator. I decided to keep it simple and treat it as `a / 100 * b`. This can be refactored to replicate the behavior of the Windows calculator, but it's a bit more complicated
- If the operation is invalid or the request to the endpoint fails, the calculator will show an `Error` message
- I decided to make unit tests for `calculator.go` as it took little effort to do, but these tests are in some way repetition of the tests in `handlers_test.go`

# Test coverage results

## Backend unit tests

Run `go test -cover ./...` from the project root to get the test coverage, the result is:

```bash
sezzleCalculator                coverage: 0.0% of statements
ok      sezzleCalculator/api    0.248s  coverage: 89.7% of statements
ok      sezzleCalculator/calculator     0.152s  coverage: 100.0% of statements
```

## Frontend unit tests

Run `px vitest run --coverage` in the `frontend` directory, the test coverage is:

```bash
 RUN  v4.1.11 C:/Users/santi/GolandProjects/sezzleCalculator/frontend
      Coverage enabled with v8

 ✓ src/components/Calculator.test.tsx (51 tests) 10918ms
   ✓ Calculator (51)
     ✓ initial state (1)
       ✓ starts with 0 on the screen 22ms
     ✓ number input (6)
       ✓ updates the screen with the clicked number 94ms
       ✓ appends consecutive digits 196ms
       ✓ replaces the leading zero 173ms
       ✓ supports the decimal separator only once  365ms
       ✓ starts a new number with "0." when the decimal is pressed after an operator  360ms
       ✓ starts a new calculation with "0." when the decimal is pressed after a result  350ms
     ✓ operators (9)
       ✓ adds the operator to the screen when no operator was present 222ms
       ✓ replaces the operator when clicked twice in a row without calling the API 253ms
       ✓ starts a new number after an operator 284ms
       ✓ chaining (6)
         ✓ calls the sum endpoint after Add and shows the result 286ms
         ✓ calls the subtraction endpoint after Subtract and shows the result 268ms
         ✓ calls the multiplication endpoint after Multiply and shows the result 254ms
         ✓ calls the division endpoint after Divide and shows the result 267ms
         ✓ calls the exponentiation endpoint after Power and shows the result 286ms
         ✓ uses the chained result as the left operand of the next operation  459ms
     ✓ square root (2)
       ✓ calls the squareroot endpoint and shows the result 218ms
       ✓ shows Error when the squareroot endpoint responds with an error 140ms
     ✓ percentage (2)
       ✓ converts a number to its fraction when no operation is pending 240ms
       ✓ uses the left operand as the base after Add  488ms
     ✓ equals (5)
       ✓ calls the endpoint when an operator is present and shows the result 284ms
       ✓ does not call any endpoint when no operator is present 142ms
       ✓ appends "=" to the expression after a square root without calling the API again 269ms
       ✓ shows only the current value when equals is pressed twice  316ms
       ✓ starts a new calculation when a digit is clicked after the result  329ms
     ✓ backspace (4)
       ✓ removes the last digit 255ms
       ✓ goes back to 0 after removing every digit  313ms
       ✓ does not remove digits from a number that was not typed by the user 238ms
       ✓ does not modify a result, only clears the expression  334ms
     ✓ clear (2)
       ✓ CE clears only the current entry and keeps the pending operation  552ms
       ✓ C clears everything including the pending operation  460ms
     ✓ errors (4)
       ✓ shows Error when the endpoint responds with an error on equals 236ms
       ✓ shows Error when the endpoint responds with an error on a chained operator 253ms
       ✓ shows Error when the request fails 237ms
       ✓ starts over when a digit is clicked after an error  302ms
     ✓ keyboard (16)
       ✓ types digits 79ms
       ✓ uses "." as decimal separator 63ms
       ✓ uses "," as decimal separator 80ms
       ✓ "+" calls the sum endpoint 94ms
       ✓ "-" calls the subtraction endpoint 77ms
       ✓ "*" calls the multiplication endpoint 95ms
       ✓ "/" calls the division endpoint 80ms
       ✓ "^" calls the exponentiation endpoint 76ms
       ✓ "%" calls the percentage endpoint 96ms
       ✓ "=" works as equals 77ms
       ✓ Backspace removes the last digit 79ms
       ✓ Escape clears everything 112ms
       ✓ Delete clears only the current entry 113ms
       ✓ ignores unsupported keys 45ms
       ✓ prevents the default browser action for handled keys 3ms
       ✓ does not prevent the default browser action for unsupported keys 1ms

 Test Files  1 passed (1)
      Tests  51 passed (51)
   Start at  21:31:24
   Duration  11.60s (transform 42ms, setup 63ms, import 137ms, tests 10.92s, environment 321ms)

 % Coverage report from v8
----------------|---------|----------|---------|---------|-------------------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s             
----------------|---------|----------|---------|---------|-------------------------------
All files       |   96.62 |    91.08 |     100 |     100 |                               
 Calculator.css |       0 |        0 |       0 |       0 |                               
 Calculator.tsx |   96.62 |    91.08 |     100 |     100 | 49,92,111,144,150,169,199,292 
----------------|---------|----------|---------|---------|-------------------------------
```

