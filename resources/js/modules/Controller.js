import Timer from './Timer';
import GameController from './GameController';
import UIController from './UIController';

const Controller = (function(gameCtrl, UICtrl){
    
    const Timer = function(fnToRun, rate) {
        let timerRef = null;
        const startTimer = function() {
            this.timerRef = setInterval(function(){
                update();
            }, rate);
        };

        const stopTimer = function() {
            clearInterval(this.timerRef);
        };

        return {
            startTimer: startTimer,
            stopTimer: stopTimer
        }
    }

    let mainDrive = new Timer(update, gameCtrl.getUpdateRate());
    
    const setEventListeners = function() {
        const DOM = UICtrl.getDomStrings();
        document.addEventListener('keydown', (e) => {
            handleMovement(e);
        });
        document.addEventListener('keyup', (e) => {
            toggleMovement(e);
        });
    }

    const handleMovement = function(event) {
        if (!event.isTrusted) return;
        
        
        if (event.keyCode === 13) {
            if (gameCtrl.getMenuOn()) {
                let tPoints = gameCtrl.getScore();
                let tContinues = gameCtrl.getContinueCount();
                if (tContinues === 0 || tPoints >= tContinues * 500) {
                    
                    
                    setTimeout(function(){
                        gameCtrl.setDisplayLevelName(true);
                        gameCtrl.setScore(tPoints - (tContinues * 500));
                        gameCtrl.setContinueCount(tContinues + 1);
                        gameCtrl.setMenuOn(false);
                        restartGame();
                    }, gameCtrl.getMenuDelay());
                }
                
            }

            if (gameCtrl.getVictory()) {
                setTimeout(function(){
                    gameCtrl.setVictory(false);
                    gameCtrl.setMenuOn(true);
                }, 500);
            }
        }

        if (event.keyCode === 27) {
                       
            if (gameCtrl.getMenuOn()) {
                
                
            
                setTimeout(function(){
                    gameCtrl.setContinueCount(0);
                    gameCtrl.setScore(0);
                    gameCtrl.setLevel(0);
                    gameCtrl.setDisplayLevelName(true);
                    gameCtrl.setMenuOn(false);
                    restartGame();
                }, gameCtrl.getMenuDelay());
                
                
            }

            if (gameCtrl.getVictory()) {
                setTimeout(function(){
                    gameCtrl.setVictory(false);
                    gameCtrl.setMenuOn(true);
                }, 500);
            }
        }

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

    const toggleMovement = function(event) {
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

    // enable level and set position of ball and paddle
    const setStartConditions = function() {
        gameCtrl.setLevelState(true);
        const startPos = gameCtrl.getStartPos();
        gameCtrl.setBallPos(startPos.x, startPos.y);
        const paddleStartPos = gameCtrl.getPaddleStartPos();
        gameCtrl.setPaddlePos(paddleStartPos.x, paddleStartPos.y);
        
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
    }
    
    // start a new game
    const startGame = function() {
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ball = gameCtrl.getBall();

        gameCtrl.uplinkLevels();
        gameCtrl.setLives(gameCtrl.getMaxLives());
        const thisLives = gameCtrl.getLives();
        const thisPaddle = gameCtrl.getPaddle();
        UICtrl.drawLives(thisLives, thisPaddle);
        gameCtrl.setBallPos(ball.position.x, ball.position.y);
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
        gameCtrl.setIsStarted(true);
        gameCtrl.setGameInit();
    }


    const restartGame = function() {
        gameCtrl.setLives(gameCtrl.getMaxLives());
        gameCtrl.setLevelState(true);
        setStartConditions();
        gameCtrl.setPaddleVelocity(0);
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
        // gameCtrl.setScore(0);
    }

    // handle an update frame called by setInterval
    const update = function() {
        // set any frame-based game state variables
        //gameCtrl.setToggleRebound(false);
                
        // if game state is not started, exit update
        if (!gameCtrl.getIsStarted()) {
            return;
        }


        // link to the Canvas DOM object
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ctx = mCanvas.getContext("2d");


        // get information from the game controller
        // about the ball and paddle
        const ball = gameCtrl.getBall();
        const paddle = gameCtrl.getPaddle();
        
        

        // check for Game Over
        if (gameCtrl.isGameOver()) {
            const lives = gameCtrl.getLives();
            

            if (lives <=0) {
                
                // reload levels from file to erase
                // current level progress
                gameCtrl.uplinkLevels();
                gameCtrl.setGameOver(false);
                gameCtrl.setMenuOn(true);
                if (gameCtrl.getContinueCount() === 0) {
                    gameCtrl.setContinueCount(1);
                }


                // after delay, start the game back with
                // high score set as needed and score set to 0
                window.setTimeout(function(){
                    
                    // restartGame();
                    
                    
                    
                }, 2500)
            } else {
                // handle 'game over' if user has more lives,
                // reset game state and subtract life
                gameCtrl.setLives(lives -1);
                setStartConditions();
                gameCtrl.setPaddleVelocity(0);
                gameCtrl.setBallVelocity(gameCtrl.startRandom());
                
                gameCtrl.setIsStarted(false);
                gameCtrl.setGameOver(false); 
                
                window.setTimeout(function(){ 
                    gameCtrl.setIsStarted(true);
                    gameCtrl.setGameOver(false);
                }, 1200);
            }
            
        }

        if (!gameCtrl.isStarted()) return;

        // clear the canvas
        ctx.clearRect(0,0, mCanvas.width, mCanvas.height);

        if (gameCtrl.getVictory()) {
            UICtrl.displayVictory(gameCtrl.getScore());
            return;
        }
        
        // If in menu mode, draw menu
        if (gameCtrl.getMenuOn()) {
            const currContinues = gameCtrl.getContinueCount();

            UICtrl.drawMenu(currContinues);
            return;
        }

        // check if the state of the level has changed
        const needsUpdate = gameCtrl.getLevelState();
        if (needsUpdate) {
            
            let tScore = gameCtrl.getScore();
            let tMax = gameCtrl.getHighScore();
            
            if (tScore > tMax) {
                gameCtrl.setHighScore(tScore);
                UICtrl.setHighScore(tScore);
            }

            //check for stage completion
            if (gameCtrl.checkComplete()) {
                // alert('complete!')
                
                

                
                
                setStartConditions();
                gameCtrl.setPaddleVelocity(0);
                
                console.log(`clvl: ${gameCtrl.getLevel()} mlvl: ${gameCtrl.getMaxLevel()}`);

                if (gameCtrl.getLevel() + 1 < gameCtrl.getMaxLevel()) {
                    console.log('advancing level...');
                    console.log(`level: ${gameCtrl.getLevel()}`);
                    let nextLevel = gameCtrl.getLevel();
                    nextLevel += 1;
                    console.log(nextLevel);
                    gameCtrl.setLevel(nextLevel);
                    console.log(`level: ${gameCtrl.getLevel()}`);
                    gameCtrl.setDisplayLevelName(true);
                } else {
                    gameCtrl.setVictory(true);
                }
                
                
                gameCtrl.setIsStarted(false);
                window.setTimeout(function(){ 
                    gameCtrl.setIsStarted(true);
                    
                }, 1200);
                // gameCtrl.setLevelState(true);
                // const startPos = gameCtrl.getStartPos();
                //     gameCtrl.setBallPos(startPos.x, startPos.y);
                //     const paddleStartPos = gameCtrl.getPaddleStartPos();
                //     gameCtrl.setPaddlePos(paddleStartPos.x, paddleStartPos.y);
            }


            UICtrl.setScore(gameCtrl.getScore());
            // UICtrl.setHighScore(gameCtrl.getHighScore());
            UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
        
            const thisLives = gameCtrl.getLives();
            const thisPaddle = gameCtrl.getPaddle();
            UICtrl.drawLives(thisLives, thisPaddle);
            gameCtrl.setLevelState(false);
        }

        // draw blocks on <Canvas> element
        // (or display level name)
        const blockProtoT = gameCtrl.getBlockProto();
        const cellT = gameCtrl.getCell();
        
        if (!gameCtrl.getDisplayLevelName()) {
            UICtrl.drawCanvas(ctx, blockProtoT, cellT);
        } else {
            const tName = gameCtrl.getLevelName();
            UICtrl.drawTitle(tName);
            gameCtrl.setIsStarted(false);
            setTimeout(function(){
                gameCtrl.setDisplayLevelName(false);
                gameCtrl.setIsStarted(true);
            }, gameCtrl.getTitleDelay())
        }
        

        // draw the ball and paddle
        UICtrl.drawBall(ctx, ball);
        UICtrl.drawPaddle(ctx, paddle);

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

        // play sound if ballHit is true
        const isHit = gameCtrl.getBallHit();
        if (isHit) {
            UICtrl.playBallHit();
            gameCtrl.setBallHit(false);
        }
    }

    
    
    return {
        init: function() {
            setEventListeners();
            
            // set the starting conditions for a game
            startGame();

            
            mainDrive.startTimer();
            
        },

        initReact: function() {
            setEventListeners();
            // set the starting conditions for a game
            startGame();
        },

        updateReact: function() {
            update();
        },

        getUpdateRateReact: function() {
            return gameCtrl.getUpdateRate();
        },
        
        stop: function() {
            mainDrive.stopTimer();
            gameCtrl.setMenuOn(true);
            gameCtrl.setIsStarted(false);
        }
    }
})(GameController, UIController);

export default Controller;