import GameController from './GameController.js';
import UIController from './UIController.js';

const Controller = (function(gameCtrl, UICtrl){
    
    const tasks = [];
    const validTasks = {
      drawBlocks: 'drawBlocks',
      highScore: 'highScore',
      updateUI: 'updateUI',
      checkClear: 'checkClear',
      advanceLevel: 'advanceLevel',
      setLevel0: 'setLevel0'};

    const validPhases = {
      menu: 'menu',
      title: 'title',
      game: 'game'
    }

    const gamePhase = [validPhases.menu, validPhases.title, validPhases.game];
    
    const setEventListeners = function() {
        
        document.addEventListener('keydown', (e) => {
            handleMovement(e);
        });
        document.addEventListener('keyup', (e) => {
            toggleMovement(e);
        });
    }

    const getTask = function(taskName) {
      const tTask = tasks.findIndex(tTask => tTask === taskName);
      if (tTask === -1) {
        return false;
      } else {
        return tasks.splice(tTask, 1);
      }
    }

    
    const addTask = function(taskName) {
      console.log(validTasks[taskName]);
      if (validTasks[taskName]) {
        tasks.push(taskName);
      }
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
                
            } else if (gameCtrl.getVictory()) {
                setTimeout(function(){
                    
                    gameCtrl.setLevel(0)
                    gameCtrl.setMenuOn(true);
                }, 500);
            }
        }

        if (event.keyCode === 27) {
                       
            if (gameCtrl.getMenuOn()) {
                
                
                
                setTimeout(function(){
                    console.log('handleMovement ESC');
                    gameCtrl.setContinueCount(0);
                    gameCtrl.setScore(0);
                    gameCtrl.setVictory(false);
                    gameCtrl.setDisplayLevelName(true);
                    gameCtrl.setMenuOn(false);
                    gameCtrl.setLevel(0);
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
        
        const startPos = gameCtrl.getStartPos();
        gameCtrl.setBallPos(startPos.x, startPos.y);
        const paddleStartPos = gameCtrl.getPaddleStartPos();
        gameCtrl.setPaddlePos(paddleStartPos.x, paddleStartPos.y);
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
        addTask(validTasks.updateUI);
        
    }
    
    // start a new game
    const startGame = function() {
        const ball = gameCtrl.getBall();

        gameCtrl.uplinkLevels();
        gameCtrl.setLives(gameCtrl.getMaxLives());
        const thisLives = gameCtrl.getLives();
        const thisPaddle = gameCtrl.getPaddle();
        UICtrl.initActiveObjects();
        let UIObjects = UICtrl.getActiveObjets();
        UICtrl.drawLives(thisLives, thisPaddle);
        gameCtrl.setBallPos(ball.position.x, ball.position.y);
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
        gameCtrl.setIsStarted(true);
        gameCtrl.setGameInit();
        UIObjects.player.ball = true;
        UIObjects.player.paddle = true;
        UIObjects.UI.score = true;
        UIObjects.UI.lives = true;
        UICtrl.setActiveObjects(UIObjects);
        addTask(validTasks.updateUI);
        addTask(validTasks.drawBlocks);
    }


    const restartGame = function() {
        gameCtrl.setInitUI(false);
        UICtrl.initActiveObjects();
        gameCtrl.setLives(gameCtrl.getMaxLives());
        gameCtrl.uplinkLevels();
        
        setStartConditions();
        
        gameCtrl.setPaddleVelocity(0);
        gameCtrl.setBallVelocity(gameCtrl.startRandom());
        let UIObjects = UICtrl.getActiveObjets();
        UIObjects.player.ball = true;
        UIObjects.player.paddle = true;
        UIObjects.UI.score = true;
        UIObjects.UI.lives = true;
        UICtrl.setActiveObjects(UIObjects);
        

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

        let UIObjects = UICtrl.getActiveObjets();

        // link to the Canvas DOM object
        const DOM = UICtrl.getDomStrings();
        // const mCanvas = document.querySelector(DOM.canvas);
        // const ctx = mCanvas.getContext("2d");


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


                window.setTimeout(function(){
                    
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


        const playerCanvas = document.querySelector(DOM.Canvas.player);
        const playerCtx = playerCanvas.getContext("2d");

        // clear the canvas
        playerCtx.clearRect(0,0, playerCanvas.width, playerCanvas.height);

        if (gameCtrl.getVictory()) {
            if (!Layers.hud) {
              UIObjects.UI.victory = true;
              UICtrl.displayVictory(gameCtrl.getScore());
            }
            
            return;
        }
        
        // If in menu mode, draw menu
        if (gameCtrl.getMenuOn()) {
            const currContinues = gameCtrl.getContinueCount();
            if (!UIObjects.UI.menu) {
              UICtrl.drawMenu(currContinues);
              UIObjects.UI.menu = true;
            }
            
            return;
        } else {
          if (UIObjects.UI.menu = true) {
            UICtrl.clearMenu();
            UIObjects.UI.menu = false;
          }
        }

        // check the blocks for collisions
        const checkHit = gameCtrl.checkBlocks();

        if (checkHit) {
          addTask(validTasks.highScore);
          addTask(validTasks.updateUI);
          addTask(validTasks.checkClear);
          addTask(validTasks.drawBlocks);
        }

        const checkScore = getTask(validTasks.highScore);
        if (checkScore) {

          // update max score if needed
          let tScore = gameCtrl.getScore();
          let tMax = gameCtrl.getHighScore();
              
          if (tScore > tMax) {
              gameCtrl.setHighScore(tScore);
              UICtrl.setHighScore(tScore);
          }
        }

        const checkClear = getTask(validTasks.checkClear);
        if (checkClear) {
          
          //check for stage completion
          if (gameCtrl.checkComplete()) {
            // alert('complete!')
            
            setStartConditions();
            gameCtrl.setPaddleVelocity(0);

            if (gameCtrl.getLevel() + 1 < gameCtrl.getMaxLevel()) {
                gameCtrl.uplinkLevel(gameCtrl.getLevel());
                let nextLevel = gameCtrl.getLevel();
                nextLevel += 1;
                gameCtrl.setLevel(nextLevel);
                gameCtrl.setDisplayLevelName(true);
                
            } else {
                gameCtrl.setVictory(true);
            }
            
            
            gameCtrl.setIsStarted(false);
            window.setTimeout(function(){ 
                gameCtrl.setIsStarted(true);
                
            }, 1200);
            
          }

        }

        const checkUI = getTask(validTasks.updateUI);
        if (checkUI) {
          UICtrl.setScore(gameCtrl.getScore());
          // UICtrl.setHighScore(gameCtrl.getHighScore());
          UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
      
          const thisLives = gameCtrl.getLives();
          const thisPaddle = gameCtrl.getPaddle();
          UICtrl.drawLives(thisLives, thisPaddle);
        }

        // draw blocks on <Canvas> element
        // (or display level name)
        const blockProtoT = gameCtrl.getBlockProto();
        const cellT = gameCtrl.getCell();
        
        if (!gameCtrl.getDisplayLevelName()) {
          if (UIObjects.UI.title) {
            UICtrl.clearTitle();
            UIObjects.UI.title = false;
          }
          const drawBlocks = getTask(validTasks.drawBlocks);
          if (drawBlocks) {
            const blocksCanvas = document.querySelector(DOM.Canvas.blocks);
            const blocksCtx = blocksCanvas.getContext("2d");
            blocksCtx.clearRect(0,0, blocksCanvas.width, blocksCanvas.height);
            UICtrl.drawCanvas(blocksCtx, blockProtoT, cellT);
            UIObjects.blocks = true;
          }
        } else {
            const tName = gameCtrl.getLevelName();
            UICtrl.drawTitle(tName);
            UIObjects.UI.title = true;
            gameCtrl.setIsStarted(false);
            setTimeout(function(){
                gameCtrl.setDisplayLevelName(false);
                gameCtrl.setIsStarted(true);
            }, gameCtrl.getTitleDelay())
        }
        

        // draw the ball and paddle
        UICtrl.drawBall(playerCtx, ball);
        UICtrl.drawPaddle(playerCtx, paddle);

        // after drawing frame, move ball
        gameCtrl.setBallPos(
            ball.position.x + (ball.velocity.x * (100 / gameCtrl.getCyclesSec())),
            ball.position.y - (ball.velocity.y * (100 / gameCtrl.getCyclesSec())));

        gameCtrl.setPaddlePos(
            paddle.position.x + (paddle.velocity * (100 / gameCtrl.getCyclesSec())),
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

        UICtrl.setActiveObjects(UIObjects);
    }

    // define timer for setInterval that runs
    // the update function
    const Timer = function(fnToRun, rate) {
        this.timerRef = null;
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
    
    return {
        init: function() {
            setEventListeners();
            UICtrl.initCanvases();
            
            // set the starting conditions for a game
            startGame();

            
            mainDrive.startTimer();
            
        },

        initReact: function() {
            setEventListeners();
            UICtrl.initCanvases();
            // set the starting conditions for a game
            startGame();
        },

        updateReact: function() {
            update();
        },

        getUpdateRateReact: function() {
            return gameCtrl.getUpdateRate();
        },

        getHighScoreReact: function() {
            return gameCtrl.getHighScore();
        },

        setHighScoreReact: function(nScore) {
            if (nScore && nScore > 0) {
                gameCtrl.setHighScore(nScore);
                UICtrl.setHighScore(nScore);
            }
        },
        
        stop: function() {
            mainDrive.stopTimer();
            gameCtrl.setMenuOn(true);
            gameCtrl.setIsStarted(false);
        }
    }
})(GameController, UIController);

export default Controller;