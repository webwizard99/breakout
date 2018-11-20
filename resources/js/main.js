// Model for game calculations
const gameController = (function(){
    // array to hold all level objects
    const levels = [];
    
    // game state object
    const game = {
        started: true,
        level: 0,
        hasChanged: true,
        leftPress: false,
        rightPress: false,
        isGameOver: false
    }

    const drag = 0.045;
    const boxCoEff = 0.09;
    const horizontalBounds = 0.16;

    // Block function constructor
    const Block = function(width, hp, density, type, x, y) {
        this.width = width;
        this.hp = hp;
        this.maxHp = hp;
        this.density = density;
        this.type = type;
        this.position = {
            x: x,
            y: y
        }
    };


    // Base Level Size
    let levelSize = {
        x: 640,
        y: 480
    }

    // ball object
    let ball = {
        position: {
            x: 200,
            y: 400
        },

        velocity: {
            x: 2,
            y: 2
        },
        
        size: 6,
        damage: 3,
        maxSpeed: 4
    }

    let paddle = {
        color: `rgba(80, 110, 80, .9)`,
        
        position: {
            x: 200,
            y: 410,
        },

        velocity: 0,
        acceleration: 0.16,

        size: {
            x: 90,
            y: 10
        },

        maxSpeed: 3.5
    }

    checkColision = function(x, y, w, h) {
        
        if (x <= (ball.position.x - (boxCoEff) + ((ball.size + boxCoEff))) && ((x + w + boxCoEff) >= (ball.position.x - (boxCoEff) - ((ball.size + boxCoEff))))) {
            
            if (y <= (ball.position.y + (boxCoEff) + ((ball.size + boxCoEff))) && ((y + h + boxCoEff) >= (ball.position.y - (boxCoEff) - ((ball.size + boxCoEff))))) {
                
                return true;
            }
        }
        return false;
    }

    reverseVerticalVelocity = function() {
        ball.velocity.y *= -1; 
    }

    reverseHorizontalVelocity = function() {
        ball.velocity.x *= -1;
    }

    return {
        getBall: function() {
            return ball;
        },

        getPaddle: function() {
            return paddle;
        },

        setBallPos: function(x, y) {
            ball.position.x = x;
            ball.position.y = y;

            // reverse horizontal velocity if out of bounds
            if (ball.position.x <= (ball.size /2)
            || ball.position.x >= (levelSize.x - ball.size /2)) {
                reverseHorizontalVelocity();
            } 

            // reverse vertical velocity if out of bounds
            if (ball.position.y <= (ball.size /2)
            || ball.position.y >= (levelSize.y - ball.size /2)) {
                reverseVerticalVelocity();
            } 

            //check if ball is colliding with paddle
            if (checkColision(paddle.position.x, paddle.position.y, paddle.size.x, paddle.size.y)) {
                if (ball.position.y <= paddle.position.y) {
                    reverseVerticalVelocity();
                    ball.velocity.x += paddle.velocity / 6;
                }
            }

            if (ball.position.y >= (levelSize.y - ball.size /2)) {
                game.started = false;
                game.isGameOver = true;
            }

        },

        

        setPaddlePos: function(x, y) {
            
            if (x > 0 && x < levelSize.x - (0 + paddle.size.x)) {
                
                paddle.position.x = x;
            } 

            if (x + paddle.size.x > levelSize.x) {
                paddle.position.x = levelSize.x - (paddle.size.x +1);
            }
            if (x < 0) {
                x = 0;
            }
            
            paddle.position.y = y;
        },

        getLevelSize: function() {
            return levelSize;
        },

        createBasicLevel: function() {
            let tLevel = [];
            const columns = Math.floor(levelSize.x / 36);
            const rows = Math.floor(levelSize.y / 18);
            
            // iterate through the rows and columns and
            // populate an area of blocks with boolean false
            // elsewise
            for (let row = 0; row < rows; row++) {
                let cellsRow = [];
                for (let col = 0; col < columns; col++) {
                    if (row > 2 && row < 10) {
                        if (col > 2 && col < columns - 2) {
                            if (row % 2 === 0 && col % 2 === 0) {    
                                let x = Math.floor((levelSize.x / (levelSize.x / 36)) * col);
                                let y = Math.floor((levelSize.y / (levelSize.y / 18)) * row);
                                
                                let tBlock = new Block(1, 10, 1, 'basic', x, y);
                                cellsRow.push(tBlock);
                            } else {
                                cellsRow.push(false);    
                            }
                        } else {
                            cellsRow.push(false);
                        }
                    } else {
                        cellsRow.push(false);
                    }
                }

                tLevel.push(cellsRow);
            }
            
            levels.push(tLevel);
            //return tLevel;
        },

        getCell: function(x, y) {
            return levels[game.level][x][y];
        },

        getLevelObjectForUI: function() {
            let levelT = [];
            levels[game.level].forEach((row) => {
               let rowT = row.map((cell) => {
                    if (cell) {
                        return {
                            width: cell.width,
                            type: cell.type,
                            position: {
                                x: cell.position.x,
                                y: cell.position.y
                            },
                            opacity: Math.floor(((cell.hp/ cell.maxHp) * 70) + 30)
                        }
                    } else {
                        return false;
                    }
               });
               levelT.push(rowT);
            });

            return levelT;
        },

        getLevelState: function() {
            return game.hasChanged;
        },

        setLevelState: function(state) {
            game.hasChanged = state;
        },

        dragPaddle: function() {
            if ((paddle.velocity > 0 && paddle.velocity > drag) || paddle.velocity < 0 && paddle.velocity < -drag) {
                if (paddle.velocity > 0) {
                    paddle.velocity -= drag;
                } else if (paddle.velocity < 0) {
                    paddle.velocity += drag;
                }
            }
        },

        addPaddleVelocity: function(vel) {
            
            if (vel !== 0) {
                if ((paddle.velocity >= 0 && paddle.velocity < paddle.maxSpeed) ||
                    paddle.velocity <= 0 && paddle.velocity > -paddle.maxSpeed) {
                    paddle.velocity += vel;
                }
            }
            
        },

        isLeftPress: function() {
            return game.leftPress;
        },

        isRightPress: function() {
            return game.rightPress;
        },

        setLeftPress: function(val) {
            game.leftPress = val;
        },

        setRightPress: function(val) {
            game.rightPress = val;
        },

        isGameOver: function() {
            return game.isGameOver;
        },

        setGameOver: function(val){
            game.isGameOver = val;
        },

        isStarted: function() {
            return game.started;
        },

        setStarted: function(val) {
            game.started = val;
        },

        checkBlocks: function(){
            // iterate through each row and then column of the current level object
            levels[game.level].forEach((row, nRow) => {
                row.forEach((col, nCol) => {
                    
                    if (levels[game.level][nRow][nCol]) {
                        let tCell = levels[game.level][nRow][nCol];
                        let x = Math.floor((levelSize.x / (levels[game.level][0].length + 1)) * nRow);
                        let y = Math.floor((levelSize.y / (levels[game.level].length + 1)) * nCol);
                        let w = Math.floor((levels[game.level][nCol][nRow].width * ((640 / levels[game.level][0].length) * .8)))
                        let h = 8;
                        
                        if (checkColision(x, y, w, h)) {
                            if (ball.position.x + ball.size < (x + horizontalBounds) ||
                                ball.position.x - ball.size > (x - horizontalBounds)) {
                                reverseHorizontalVelocity();
                            } else {
                                reverseVerticalVelocity();
                            }
                        };
                    }
                });
            });
        },

        test: function() {
            console.log(levels[game.level]);
        }



        
    }

})();

const UIController = (function(){
    const DOMStrings = {
        canvas: `#myCanvas`,
        container: `#mainContainer`
    };

    const levelThemes = [
        {
            basic: `rgba(80, 100, 140, %alpha)`
        }
    ];
    
    let currentLevel = [];

    drawRect = function(ctx, fill, x, y, h, w) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
    }

    return {
        getDomStrings: function() {
           return DOMStrings;
        },

        // draw blocks on canvas
        drawCanvas: function(CTX) {
            
            const canvasRef = document.querySelector(DOMStrings.canvas);
            

            for (let col = 0; col < currentLevel.length; col++) {
                for (let row = 0; row < currentLevel[0].length; row++) {
                    

                    
                    if (currentLevel[col][row]) {
                        const posThis = {
                            x: currentLevel[col][row].position.x,
                            y: currentLevel[col][row].position.y
                        };

                        const colorT = levelThemes[0].basic.replace('%alpha', (currentLevel[col][row].opacity / 100).toString());
                        
                        drawRect(CTX,
                            colorT,
                            posThis.x,
                            posThis.y,
                            8,
                            Math.floor((currentLevel[col][row].width * ((640 / currentLevel[0].length) * .8))),
                            );
                    }
                }
                
            }
            
            
        },

        drawCircle: function(ctx, fill, y, x, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, false);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        drawPaddle: function(ctx, paddle) {
            drawRect(ctx, paddle.color, paddle.position.x, paddle.position.y, paddle.size.y, paddle.size.x)
        },

        // populates the currentLevel object in the
        // UIController so that level objects can be
        // rendered independently of the Model without
        // sending too much information to the
        // UI module
        setCurrentLevel: function(level) {
            currentLevel = level;
        },

        test: function() {
            console.table(currentLevel);
        }

        
    }
})();



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


        gameCtrl.createBasicLevel();
        gameCtrl.setBallPos(mCanvas.width /2, mCanvas.height -30);
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

        if (gameCtrl.isGameOver()) {
            alert('Game Over!');
            document.location.reload();
            gameCtrl.setGameOver(false);
        }

        if (!gameCtrl.isStarted()) return;

        // check if the state of the level has changed
        const needsUpdate = gameCtrl.getLevelState();
        if (needsUpdate) {
            UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
            gameCtrl.setLevelState(false);
        }

        // draw blocks on <Canvas> element
        UICtrl.drawCanvas(ctx);

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

            setInterval(update, 10);
            
        }
    }
})(gameController, UIController);

Controller.init();