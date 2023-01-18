package game

import (
	"fmt"
	"math/rand"
	"multGame/vectors"
)

type Player struct {
	Pos    vectors.Vector
	Vel    vectors.Vector
	Acc    vectors.Vector
	Dir    int
	Health int
	Id     string
}

type PlayerUpdate struct {
	PlayerId string
	Keys     []string
	Dir      int
}

const movementForce = 5000.0
const frictionMagnetude = 200.0

func (p *Player) AddUserInput(update PlayerUpdate) {
	for i := 0; i < len(update.Keys); i++ {
		switch update.Keys[i] {
		case "w":
			p.Acc = vectors.New(0, -movementForce)
			break
		case "a":
			p.Acc = vectors.New(-movementForce, 0)
			break
		case "s":
			p.Acc = vectors.New(0, movementForce)
			break
		case "d":
			p.Acc = vectors.New(movementForce, 0)
			break
		}
	}

	p.Dir = update.Dir
}

func (p *Player) PhysicsUpdate(deltaTime float64) {
	/* //Adding friction
	friction := vectors.Scale(vectors.Normalize(p.Vel), -1*frictionMagnetude)

	p.Acc = vectors.Add(p.Acc, friction)
	fmt.Println("acc: ", p.Acc) */

	p.Vel = vectors.Add(p.Vel, p.Acc) //vectors.Add(p.Vel, vectors.Scale(p.Acc, float64(deltaTime)))
	fmt.Println("velocity: ", p.Vel)

	p.Pos = vectors.Add(p.Pos, vectors.Scale(p.Vel, float64(deltaTime)))

	p.Acc = vectors.New(0, 0)
}

func newPlayer(id string) *Player {
	return &Player{
		Pos:    vectors.New(rand.Float64()*300, rand.Float64()*300),
		Vel:    vectors.New(0, 0),
		Acc:    vectors.New(0, 0),
		Dir:    0,
		Health: 100,
		Id:     id,
	}
}
