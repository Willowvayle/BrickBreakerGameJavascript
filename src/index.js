import Game from '/src/game.js';
import Paddle from "./paddle.js";

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

let lastTime = 0;



function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); // Clear before the next update
    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);




export default class InputHandler {
    constructor(paddle, game) {
        document.addEventListener('keydown', (event) => {
            //alert(event.keyCode);

            switch(event.keyCode){
                case 37:
                    paddle.moveLeft();
                    break;

                case 39:
                    paddle.moveRight();
                    break;

                case 27:
                    game.togglePause();
                    break;

                case 32:
                    game.start();
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            //alert(event.keyCode);

            switch(event.keyCode){
                case 37:
                    if (paddle.speed < 0)
                        paddle.stop();
                    break;

                case 39:
                    if (paddle.speed > 0)
                        paddle.stop();
                    break;
            }
        });
    }
}