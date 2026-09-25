package main

import (
	"log"
	"net/http"
)

func main() {
	port := "8080"
	addr := ":" + port

	log.Printf("api listening on %s", addr)
	log.Printf("try: GET  http://localhost:%s%s", port, helloWorldPath)
	log.Printf("try: POST http://localhost:%s%s", port, sumPath)

	if err := http.ListenAndServe(addr, newRouter()); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
