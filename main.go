package main

import (
	"fmt"
	"multGame/server"
)

func main() {
	server := server.New()
	server.AddGame()

	if err := server.ListenAndServe(); err != nil {
		fmt.Println(err.Error())
	}
}
