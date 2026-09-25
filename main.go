package main

import (
	"log"
	"net/http"
)

func main() {
	port := "8080"
	addr := ":" + port

	log.Printf("hello world api listening on %s", addr)
	log.Printf("try: http://localhost:%s%s", port, helloWorldPath)

	if err := http.ListenAndServe(addr, newRouter()); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
