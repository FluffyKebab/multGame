package socketServer

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"

	"multGame/game"
	"multGame/vectors"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func NewHandlerFunc(g *game.Game) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("upgrade failed: ", err)
			return
		}

		fmt.Println("Socket connected")

		playerId := g.AddPlayer()
		receiver := g.NewReceiver(playerId)
		err = conn.WriteJSON(struct {
			Id  string
			Pos vectors.Vector
		}{Id: playerId, Pos: g.Players[playerId].Pos})
		if err != nil {
			log.Print(err)
			conn.Close()
			return
		}

		go sendDataToGame(g, playerId, conn, g.ReceiveChannel)
		go getDataFromGame(g, playerId, conn, receiver)
	}
}

//Recives data from the websocket connection and sends it to the game
func sendDataToGame(g *game.Game, playerId string, conn *websocket.Conn, channel chan game.PlayerUpdate) {
	for {
		var update game.PlayerUpdate
		err := conn.ReadJSON(&update)
		if err != nil {
			conn.Close()
			g.DisconnectPlayer(playerId)
			return
		}

		update.PlayerId = playerId
		channel <- update
	}
}

//Recives data from the game and sends it to the websocket
func getDataFromGame(g *game.Game, playerId string, conn *websocket.Conn, channel chan []game.Player) {
	for {
		newPlayerData := <-channel

		err := conn.WriteJSON(newPlayerData)
		if err != nil {
			conn.Close()
			g.DisconnectPlayer(playerId)
			return
		}
	}
}
