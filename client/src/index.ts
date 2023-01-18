import { Application } from 'pixi.js'
import { Scene } from './scenes/MainScene';

const app = new Application({
    view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x57c259,
    width: outerWidth,
    height: outerHeight
});

const scene: Scene = new Scene(app.screen.width, app.screen.height);
app.stage.addChild(scene)