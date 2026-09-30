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

 ✓ src/components/Calculator.test.tsx (31 tests) 8122ms
   ✓ Calculator (31)
     ✓ initial state (1)
       ✓ starts with 0 on the screen 20ms
     ✓ number input (4)
       ✓ updates the screen with the clicked number 127ms
       ✓ appends consecutive digits 165ms
       ✓ replaces the leading zero 198ms
       ✓ supports the decimal separator only once  344ms
     ✓ operators (9)
       ✓ adds the operator to the screen when no operator was present 191ms
       ✓ replaces the operator when clicked twice in a row without calling the API 267ms
       ✓ starts a new number after an operator 282ms
       ✓ chaining (6)
         ✓ calls the sum endpoint after Add and shows the result 253ms
         ✓ calls the subtraction endpoint after Subtract and shows the result 238ms
         ✓ calls the multiplication endpoint after Multiply and shows the result 250ms
         ✓ calls the division endpoint after Divide and shows the result 236ms
         ✓ calls the exponentiation endpoint after Power and shows the result 269ms
         ✓ uses the chained result as the left operand of the next operation  393ms
     ✓ square root (2)
       ✓ calls the squareroot endpoint and shows the result 207ms
       ✓ shows Error when the squareroot endpoint responds with an error 142ms
     ✓ percentage (2)
       ✓ converts a number to its fraction when no operation is pending 203ms
       ✓ uses the left operand as the base after Add  475ms
     ✓ equals (3)
       ✓ calls the endpoint when an operator is present and shows the result 250ms
       ✓ does not call any endpoint when no operator is present 128ms
       ✓ starts a new calculation when a digit is clicked after the result  330ms
     ✓ backspace (4)
       ✓ removes the last digit 238ms
       ✓ goes back to 0 after removing every digit  329ms
       ✓ does not remove digits from a number that was not typed by the user 266ms
       ✓ does not modify a result, only clears the expression  310ms
     ✓ clear (2)
       ✓ CE clears only the current entry and keeps the pending operation  503ms
       ✓ C clears everything including the pending operation  410ms
     ✓ errors (4)
       ✓ shows Error when the endpoint responds with an error on equals 254ms
       ✓ shows Error when the endpoint responds with an error on a chained operator 271ms
       ✓ shows Error when the request fails 256ms
       ✓ starts over when a digit is clicked after an error  314ms

 Test Files  1 passed (1)
      Tests  31 passed (31)
   Start at  20:41:45
   Duration  16.98s (transform 62ms, setup 1.06s, import 1.35s, tests 8.12s, environment 6.04s)

 % Coverage report from v8
----------------|---------|----------|---------|---------|---------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s   
----------------|---------|----------|---------|---------|---------------------
All files       |   78.08 |    58.41 |   96.96 |   86.66 |                     
 Calculator.css |       0 |        0 |       0 |       0 |                     
 Calculator.tsx |   78.08 |    58.41 |   96.96 |   86.66 | 101-104,175,224-238 
----------------|---------|----------|---------|---------|---------------------
```

