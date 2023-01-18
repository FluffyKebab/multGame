package vectors

import "math"

type Vector struct {
	X float64
	Y float64
}

func Scale(v Vector, scaler float64) Vector {
	return New(v.X*scaler, v.Y*scaler)
}

func Add(v1, v2 Vector) Vector {
	return New(v1.X+v2.X, v1.Y+v2.Y)
}

func Copy(v Vector) Vector {
	return v
}

func Normalize(v Vector) Vector {
	m := Magnitude(v)
	if m == 0 {
		return New(0, 0)
	}

	return Scale(v, 1/m)
}

func Magnitude(v Vector) float64 {
	return math.Sqrt(math.Pow(v.X, 2) + math.Pow(v.Y, 2))
}

func New(x, y float64) Vector {
	return Vector{
		X: x,
		Y: y,
	}
}
