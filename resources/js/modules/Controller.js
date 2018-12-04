import gameController from './GameController';
import UIController from './UIController';

const Controller = (function(gameCtrl, UICtrl){
    
    setEventListeners = function() {
        const DOM = UICtrl.getDomStrings();
        document.addEventListener('keydown', (e) => {
            handleMovement(e);
        });
        document.addEventListener('keyup', (e) => {
            toggleMovement(e);
        });
    }

    handleMovement = function(event) {
        if (!event.isTrusted) return;
        let paddle = gameCtrl.getPaddle();
        
        if (event.keyCode === 37) {
            if (!gameCtrl.isLeftPress()) {
                gameCtrl.setLeftPress(true);
            }
            
        } else if (event.keyCode === 39) {
            if (!gameCtrl.isRightPress()) {
                gameCtrl.setRightPress(true);
            }
            
        }

    }

    toggleMovement = function(event) {
        if (event.keyCode === 37) {
            if (gameCtrl.isLeftPress()) {
                gameCtrl.setLeftPress(false);
            }
            
        } else if (event.keyCode === 39) {
            if (gameCtrl.isRightPress()) {
                gameCtrl.setRightPress(false);
            }
            
        }
    } 
    
    // start a new game
    startGame = function() {
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ball = gameCtrl.getBall();

        gameCtrl.createBasicLevel();
        gameCtrl.setBallPos(ball.position.x, ball.position.y);
    }

    // draw the player ball
    drawBall = function(ctx, ball) {
        
        UICtrl.drawCircle(ctx,
            `#0095DD`,
            ball.position.y,
            ball.position.x,
            ball.size);
    }

    drawPaddle = function(ctx, paddle) {
        UICtrl.drawPaddle(ctx, paddle);
    }

    // handle an update frame called by setInterval
    update = function() {
        // set any frame-based game state variables
        //gameCtrl.setToggleRebound(false);
        
        // link to the Canvas DOM object
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ctx = mCanvas.getContext("2d");

        // get information from the game controller
        // about the ball and paddle
        const ball = gameCtrl.getBall();
        const paddle = gameCtrl.getPaddle();
        

        // clear the canvas
        ctx.clearRect(0,0, mCanvas.width, mCanvas.height);

        // check for Game Over
        if (gameCtrl.isGameOver()) {
            alert('Game Over!');
            document.location.reload();
            gameCtrl.setGameOver(false);
        }

        if (!gameCtrl.isStarted()) return;

        // check if the state of the level has changed
        const needsUpdate = gameCtrl.getLevelState();
        if (needsUpdate) {
            UICtrl.setScore(gameCtrl.getScore());
            UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
            gameCtrl.setLevelState(false);
        }

        // draw blocks on <Canvas> element
        const blockProtoT = gameCtrl.getBlockProto();
        const cellT = gameCtrl.getCell();
        UICtrl.drawCanvas(ctx, blockProtoT, cellT);

        // draw the ball and paddle
        drawBall(ctx, ball);
        drawPaddle(ctx, paddle);

        // check the blocks for collisions
        gameCtrl.checkBlocks();

        // after drawing frame, move ball
        gameCtrl.setBallPos(
            ball.position.x + ball.velocity.x,
            ball.position.y - ball.velocity.y);

        gameCtrl.setPaddlePos(
            paddle.position.x + paddle.velocity,
            paddle.position.y
        );

        

        // handle Paddle movement if a key is pressed
        if (gameCtrl.isLeftPress()) {
            gameCtrl.addPaddleVelocity(-paddle.acceleration);
        }
        if (gameCtrl.isRightPress()) {
            gameCtrl.addPaddleVelocity(paddle.acceleration);
        }

        // assert drag if not control is active
        if (!gameCtrl.isLeftPress() && !gameCtrl.isRightPress()) {
            gameCtrl.dragPaddle();
        }
    }
    
    return {
        init: function() {
            setEventListeners();
            
            // set the starting conditions for a game
            startGame();

            setInterval(update, gameCtrl.getUpdateRate());
            
        }
    }
})(gameController, UIController);

export default Controller;