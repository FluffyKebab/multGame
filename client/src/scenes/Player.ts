import { Container, Graphics, InteractionEvent, Point } from "pixi.js";


class Playable extends Container {
    constructor(posX: number, posY: number, fillColor: number) {
        super();
        this.x = posX
        this.y = posY
        
        const playerGraph: Graphics = new Graphics();

        playerGraph.beginFill(fillColor);
        playerGraph.lineStyle(4, 0x000000);
        playerGraph.drawCircle(0, 0, 30);
        playerGraph.lineTo(0, 50)
        playerGraph.endFill();

        this.addChild(playerGraph)
    }
} 

export class Player extends Playable {
    private movementForce: number = 5000.0
    //private frictionMagnetude: number = 200.0
    private acc: Point
    private vel: Point
    private lastPosFromServer: Point

    constructor(posX: number, posY: number) {
        super(posX, posY, 0x0000FF)
        this.acc = new Point(0)
        this.vel = new Point(0)
        this.lastPosFromServer = new Point(-Infinity)
    }

    public updateRotation(e: InteractionEvent): void {
        const mousePos = e.data.global;
        const playerToMouse = new Point(mousePos.x - this.x, mousePos.y - this.y)
        const angle: number =  -Math.atan2(playerToMouse.x, playerToMouse.y);
        this.rotation = angle
    }

    public updateMapPos(deltaTime: number, prevMapPos: Point): Point {
       /*  let frictionAcc = mult(normalize([this.vel.x, this.vel.y]), -1*this.frictionMagnetude)

        this.acc.x += frictionAcc[0]
        this.acc.y += frictionAcc[1]
        console.log("acc: ", this.acc) */
    
        this.vel = new Point(this.vel.x + this.acc.x , this.vel.y + this.acc.y ) //new Point(this.vel.x + (this.acc.x * deltaTime), this.vel.y + (this.acc.y * deltaTime))

        console.log("vel: ", this.vel)
        
        const newMapPos = new Point(prevMapPos.x + (this.vel.x * deltaTime), prevMapPos.y + (this.vel.y * deltaTime))

        this.acc.set(0,0)

        return newMapPos
    }

    public addNewPush(key: string) {
        switch ( key) {
        case "w":
            this.acc = new Point(0, -this.movementForce)
            break
        case "a":
            this.acc = new Point(-this.movementForce, 0)
            break
        case "s":
            this.acc = new Point(0, this.movementForce)
            break
        case "d":
            this.acc = new Point(this.movementForce, 0)
            break
        }
    }

    public updateLastPosFromServer(lastServerPos: Point, curMapPos: Point): Point {
        this.lastPosFromServer = lastServerPos
        this.lastPosFromServer = this.lastPosFromServer 
        /* console.log("last: ", this.lastPosFromServer)

        console.log("server pos:", [lastServerPos.x, lastServerPos.y] )
        console.log("mapPos:", [curMapPos.x, curMapPos.y]) */
        console.log("Diff: ", mag(sub([lastServerPos.x, lastServerPos.y], [curMapPos.x, curMapPos.y])))

       /*  if (mag(sub([lastServerPos.x, lastServerPos.y], [curMapPos.x, curMapPos.y])) >= 100) {
            this.first = false
            return this.lastPosFromServer
        } */

        return curMapPos
    }
}

export class Enemy extends Playable {
    private lastPos: Point

    private curPos: Point

    private futurePos: Point
    private futureDir: number
    private timeSinceLast: number
    private timeBetweenServerUpdates: number

    constructor(posX: number, posY: number, dir: number) {
        super(0, 0, 0xb80606)

        this.position.set(-100, -100)

        this.lastPos = new Point(posX, posY)

        this.curPos = new Point(posX, posY)

        this.futurePos = new Point(posX, posY)
        this.futureDir = dir

        this.timeSinceLast = 0
        this.timeBetweenServerUpdates= 20
    }

    public updateScreenPos(deltaTime: number, playerMapPos: Point, playerScreenPos: Point): void {
        this.calcCurMapPos(deltaTime)
        const playerToEnemy: Point = new Point(this.curPos.x - playerMapPos.x, this.curPos.y - playerMapPos.y) //Vector fra spilerens mapPos til fiendes mapPos

        this.position.set(playerToEnemy.x + playerScreenPos.x, playerToEnemy.y + playerScreenPos.y)
    }

    private calcCurMapPos(deltaTime: number): void {
        this.timeSinceLast += deltaTime

        const p = lerp(this.lastPos, this.futurePos,  this.timeSinceLast/this.timeBetweenServerUpdates);
 
        this.curPos = new Point(this.lastPos.x + p.x, this.lastPos.y + p.y);

        const rotationDifference = (this.futureDir - this.angle);
        this.angle +=  rotationDifference * (this.timeSinceLast/50);
        
    }

    public addNewData(newPoint: Point, newAngle: number): void {
        this.lastPos = this.futurePos
        this.futurePos = newPoint
        this.futureDir = newAngle

        this.timeBetweenServerUpdates = this.timeSinceLast
        this.timeSinceLast = 0
    }
}

function lerp(point1: Point, point2: Point, percent: any): Point {
    var p = new Point(point2.x - point1.x, point2.y - point1.y)
    return new Point(p.x * percent, p.y * percent)
}

/* function normalize(vector: Array<number>): Array<number> {
    const m = mag(vector)
    if (m == 0) {
        return [0, 0]
    }

    console.log("norm: ", [vector[0] * 1/m, vector[1] * 1/m])
    
    return [vector[0] * 1/m, vector[1] * 1/m]
} */

function mag(vector: Array<number>): number {
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2))
}
/* 
function mult(vector: Array<number>, num: number): Array<number> {
    return [vector[0] * num, vector[1] * num]
} */

function sub(vector1: Array<number>, vector2: Array<number>): Array<number> {
    return [vector1[0] - vector2[0], vector1[1] - vector2[1]]
}