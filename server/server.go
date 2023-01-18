package server

import (
	"fmt"
	"multGame/game"
	"multGame/socketServer"
	"net/http"

	"github.com/gorilla/mux"
)

type server struct {
	r     *mux.Router
	games map[string]*game.Game
}

func New() server {
	s := server{
		r:     mux.NewRouter(),
		games: make(map[string]*game.Game),
	}

	s.r.HandleFunc("/game/{gameId}", s.gameHandler())

	return s
}

func (s server) gameHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		gameId, exists := mux.Vars(r)["gameId"]
		fmt.Println("Request for game", gameId)
		if !exists {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("Game does not exist"))
		}

		socketServer.NewHandlerFunc(s.games[gameId])(w, r)
	}
}

func (s server) AddGame() {
	gameId := "todo"
	s.games[gameId] = game.NewGame()
	s.games[gameId].Run()
}

func (s server) ListenAndServe() error {
	return http.ListenAndServe(":8080", s.r)
}
