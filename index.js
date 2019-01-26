const GAMESTATE = {
    PAUSED: 0,
    RUNNING: 1,
    MENU: 2,
    GAMEOVER: 3,
    NEWLEVEL: 4,
    WIN: 5
};

const level1 = [
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0]
];

const level2 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0]
];


// Original index.js
let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let game = new Game();
game.init(GAME_WIDTH, GAME_HEIGHT);

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
// End index.js


// Original game.js
function Game() {
    this.init = function(gameWidth, gameHeight) {

        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gamestate = GAMESTATE.MENU;
        this.paddle = new Paddle();
        this.paddle.init(this);
        this.ball = new Ball();
        this.ball.init(this);

        this.gameObjects = [];
        this.bricks = [];
        this.lives = 3;

        this.levels = [level1, level2];
        this.currentLevel = 0;

        this.input = new InputHandler();
        this.input.init(this.paddle, this);
    }

    this.start = function() {

        if (this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return;

        this.bricks = buildLevel(this, this.levels[this.currentLevel]);
        this.ball.reset();

        this.gameObjects = [
            this.ball,
            this.paddle
        ];

        this.gamestate = GAMESTATE.RUNNING;
    }

    this.update = function(deltaTime) {

        if (this.lives == 0) this.gamestate = GAMESTATE.GAMEOVER;

        if (this.gamestate === GAMESTATE.PAUSED || this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.GAMEOVER) return;

        if (this.bricks.length === 0) {
            this.currentLevel++;
            if (this.currentLevel < this.levels.length) {
                this.gamestate = GAMESTATE.NEWLEVEL;
                this.start();
            }
            else {
                this.gamestate = GAMESTATE.WIN;
            }
        }

        [...this.gameObjects, ...this.bricks].forEach((object) => object.update(deltaTime));

        this.bricks = this.bricks.filter(brick => !brick.toBeDestroyed);
    }

    this.draw = function(ctx) {
        [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx));

        if (this.gamestate === GAMESTATE.PAUSED) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);
        }

        if (this.gamestate === GAMESTATE.MENU) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Press Spacebar To Begin", this.gameWidth / 2, this.gameHeight / 2);
        }

        if (this.gamestate === GAMESTATE.GAMEOVER) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("You've met with a terrible fate, haven't you?", this.gameWidth / 2, this.gameHeight / 2);
        }

        if (this.gamestate === GAMESTATE.WIN) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "red";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "green";
            ctx.textAlign = "center";
            ctx.fillText("You Win!", this.gameWidth / 2, this.gameHeight / 2);
        }
    }

    this.togglePause = function() {
        if (this.gamestate !== GAMESTATE.MENU) {
            if (this.gamestate == GAMESTATE.PAUSED) {
                this.gamestate = GAMESTATE.RUNNING;
            }
            else {
                this.gamestate = GAMESTATE.PAUSED;
            }
        }
    }
}
// End game.js


// Original levels.js
function buildLevel(game, level) {
    let bricks = [];

    level.forEach((row, rowIndex) => {
        row.forEach((brick, brickIndex) => {
            if (brick == 1) {
                let position = {
                    x: 80 * brickIndex,
                    y: 75 + 24 * rowIndex
                };
                var newBrick = new Brick();
                newBrick.init(game, position);
                bricks.push(newBrick);
            }
        });
    });

    return bricks;
}
// End levels.js



// Taken from InputHandler.js
function InputHandler() {
    this.init = function(paddle, game) {
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
// end INputHandler.js


// Originally from collisionDetection.js
function detectCollision(ball, gameObject) {
    // collision with paddle
    let bottomOfBall = ball.position.y + ball.size;
    let topOfBall = ball.position.y;

    let topOfObject = gameObject.position.y;
    let leftSideOfObject = gameObject.position.x;
    let rightSideOfObject = gameObject.position.x + gameObject.width;
    let bottomOfObject = gameObject.position.y + gameObject.height;

    if(bottomOfBall >= topOfObject && topOfBall <= bottomOfObject && ball.position.x >= leftSideOfObject && ball.position.x + ball.size < rightSideOfObject) {
        return true;
    }
    else {
        return false;
    }
}
// End collisionDetection.js



// Original paddle.js
function Paddle() {

    this.init = function(game) {
        this.gameWidth = game.gameWidth;
        this.width = 150;
        this.height = 20;
        this.maxSpeed = 6;
        this.speed = 0;

        this.position = {
            x: game.gameWidth/2 - this.width/2,
            y: game.gameHeight - this.height - 10,
        };
    }

    this.moveLeft = function() {
        this.speed = -this.maxSpeed;
    }
    this.moveRight = function() {
        this.speed = this.maxSpeed;
    }
    this.stop = function() {
        this.speed = 0;0
    }

    this.draw = function(ctx) {
        ctx.fillStyle = "#0f0";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    this.update = function(deltaTime) {
        this.position.x += this.speed;

        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > this.gameWidth) this.position.x = this.gameWidth - this.width;
    }
}
// End paddle.js



// Original ball.js
function Ball() {
    this.init = function(game) {
        this.image = document.getElementById("imageBall");

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.game = game;
        this.reset();

        this.size = 16;
    }

    this.reset = function() {
        this.position = {x: 10, y: 400}
        this.speed = {x: 4, y: -2}
    }

    this.draw = function(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }

    this.update = function(deltatime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // Wall on left or right
        if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        }

        // wall on top
        if (this.position.y < 0) {
            this.speed.y = -this.speed.y;
        }

        // Bottom of game
        if (this.position.y + this.size > this.gameHeight) {
            this.game.lives--;
            this.reset();
        }

        if (detectCollision(this, this.game.paddle)) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size;
        }
    }
}
// End ball.js




// Original brick.js
function Brick() {

    this.init = function(game, position) {
        this.image = document.getElementById("imageBrick");

        this.game = game;

 
        this.position = position;
        this.width = 80;
        this.height = 24;

        this.toBeDestroyed = false;
    };

    this.update = function(deltaTime) {
        if(detectCollision(this.game.ball, this)) {
            this.game.ball.speed.y = -this.game.ball.speed.y;

            this.toBeDestroyed = true;
        }
    };

    this.draw = function(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    };
}
// End brick.js