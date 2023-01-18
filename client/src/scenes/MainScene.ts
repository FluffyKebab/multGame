import { Container, Point, Ticker } from "pixi.js";
import { WebsocketConnection } from "../websocket/Websocket";
import { Enemy, Player } from "./Player"

export class Scene extends Container {
    private conn: WebsocketConnection
    private player: Player
    private enemies: Map<string, Enemy>
    private id: string
    private playerScreenPos: Point
    private lastFrame: number

    private mapPosition: Point
    //private connected: boolean

    constructor(screenWidth: number, screenHeight: number) {
        super();

        this.id = ""
        this.playerScreenPos = new Point(screenWidth/2, screenHeight/2)
        this.player = new Player(this.playerScreenPos.x, this.playerScreenPos.y)
        this.enemies = new Map<string, Enemy>()
        this.conn = new WebsocketConnection()
        this.lastFrame = Date.now()
        //this.connected = false
        this.mapPosition = new Point(0, 0)
        

        this.conn.onmessage = (e: MessageEvent<any>) => {
            const newData = JSON.parse(e.data)

            if (this.id == "") { // If this is the first message from the connection (different data sent)
                console.log("First:", newData)
                this.id = newData.Id
                this.mapPosition = new Point(newData.Pos.X, newData.Pos.Y)
                return
            }

            const hasGotten: Map<string, boolean> = new Map()
            this.enemies.forEach((_: Enemy, key: string) => {
                hasGotten.set(key, false)
            })

            for (let i = 0; i < newData.length; i++ ) {
                if (newData[i].Id == this.id) {
                    this.mapPosition = this.player.updateLastPosFromServer(new Point(newData[i].Pos.X, newData[i].Pos.Y), this.mapPosition)
                    continue
                }

                if (this.enemies.has(newData[i].Id)) {
                    this.enemies.get(newData[i].Id)?.addNewData(new Point(newData[i].Pos.X, newData[i].Pos.Y), newData[i].Dir)
                    hasGotten.set(newData[i].Id, true)
                    
                    continue
                }

                const newEnemy = new Enemy(newData[i].Pos.X, newData[i].Pos.Y, newData[i].Dir)

                this.enemies.set(newData[i].Id, newEnemy)
                this.addChild(newEnemy)
            }

            hasGotten.forEach((hasGotten: boolean, playerId: string) => {
                if (hasGotten) {
                    return
                }
                const enemyToRemove = this.enemies.get(playerId)
                if (enemyToRemove) {
                    this.removeChild(enemyToRemove)
                }
                    
                this.enemies.delete(playerId)
            })
        }

        this.conn.runOnOpen = () => {
            this.interactive = true

            this.on("pointermove", (e): void => { 
                this.player.updateRotation(e)
                this.conn.setNewDir(this.player.angle)
            }, this)

            window.addEventListener("keydown", (e: KeyboardEvent) => {
                this.player.addNewPush(e.key)
                this.conn.addNewPush(e.key)
            })
            
            this.addChild(this.player);

            this.enemies.forEach((e: Enemy) => {
                this.addChild(e)
            })
        }

        Ticker.shared.add(this.update, this)
    }

    private update(): void {
        let deltaTime: number = (Date.now()-this.lastFrame) / 1000

        this.lastFrame = Date.now()
        this.mapPosition = this.player.updateMapPos(deltaTime, this.mapPosition)

        this.enemies.forEach((e: Enemy) => {
            e.updateScreenPos(deltaTime, this.mapPosition, this.playerScreenPos)
        })
    }
}
