package game

import (
	"fmt"
	"math/rand"
	"time"
)

type Game struct {
	Players        map[string]*Player
	ReceiveChannel chan PlayerUpdate
	SendChannels   map[string]chan []Player
}

func NewGame() *Game {
	return &Game{
		Players:        make(map[string]*Player, 1),
		ReceiveChannel: make(chan PlayerUpdate),
		SendChannels:   make(map[string]chan []Player, 0),
	}
}

func (g *Game) AddPlayer() string {
	id := createPlayerId()
	g.Players[id] = newPlayer(id)
	return id
}

func (g *Game) NewReceiver(playerId string) chan []Player {
	channel := make(chan []Player)
	g.SendChannels[playerId] = channel

	return channel
}

func (g *Game) Run() {
	//Gets user input from socket connection
	go func() {
		for {
			update := <-g.ReceiveChannel
			g.Players[update.PlayerId].AddUserInput(update)
		}
	}()

	//Updates physics of each player
	go func() {
		for {
			lastUpdate := time.Now().UnixMilli()

			time.Sleep(time.Millisecond * 20)
			for _, player := range g.Players {
				player.PhysicsUpdate(float64(time.Now().UnixMilli() - lastUpdate))
			}
		}
	}()

	//Send player data to each socket connection
	go func() {
		for {
			time.Sleep(time.Second / 3)

			playerData := make([]Player, 0, len(g.Players))
			for _, value := range g.Players {
				playerData = append(playerData, *value)
			}

			//fmt.Println("Sending data to players: ", playerData)

			for _, channel := range g.SendChannels {
				channel <- playerData
			}
		}
	}()
}

func (g *Game) DisconnectPlayer(playerId string) {
	fmt.Println("Socket disconnected")

	delete(g.Players, playerId)
	delete(g.SendChannels, playerId)
}

func createPlayerId() string {
	possibleValues := []rune("qwertyuiopasdfghjklzxcvbnm1234567890")
	id := ""

	for i := 0; i < 5; i++ {
		randomIndex := rand.Intn(len(possibleValues))
		id += string(possibleValues[randomIndex])
	}

	return id
}
