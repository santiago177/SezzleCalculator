package main

import (
	"log"
	"net/http"
)

func main() {
	port := "8080"
	addr := ":" + port

	log.Printf("api listening on %s", addr)
	log.Printf("serving frontend from %s at http://localhost:%s/", frontendDistDir, port)
	log.Printf("try: GET  http://localhost:%s%s", port, helloWorldPath)
	log.Printf("try: GET  http://localhost:%s%s?a=2&b=3.5", port, sumPath)

	if err := http.ListenAndServe(addr, newRouter()); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
