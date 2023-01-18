export class WebsocketConnection extends WebSocket {
    private buffer: {Dir: number, Keys: string[]}
    private runInterval: NodeJS.Timer
    public runOnOpen: Function
    private lastDir: number

    constructor() {
        super("ws://localhost:8080/game/todo")
        this.buffer = {
            Dir: -1,
            Keys: [],
        }

        this.lastDir = Infinity

        this.runOnOpen = () => {}

        this.runInterval = setInterval((): void => {}, 100000)

        this.onopen = (): void => {
            console.log("Open connection")
            this.runInterval = setInterval(this.sendData.bind(this), 500)
            this.runOnOpen()
        }

        this.onclose = (): void => {
            clearInterval(this.runInterval)
        }
    }

    private sendData():  void {
        if (this.readyState != 1) { // 1 is open
            return
        }

        if (this.buffer.Dir == this.lastDir && this.buffer.Keys.length == 0) {
            return
        }

        this.send(JSON.stringify({PlayerId: "", Keys: this.buffer.Keys, Dir: this.buffer.Dir}))

        this.buffer.Keys = []
        this.lastDir = this.buffer.Dir
    }

    setNewDir(angle: number): void {
        this.buffer.Dir = Math.floor(angle)
    }

    addNewPush(key: string): void {
        this.buffer.Keys.push(key)
    }
}

