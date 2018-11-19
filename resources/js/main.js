// Model for game calculations
const gameController = (function(){
    // array to hold all level objects
    const levels = [];
    
    // game state object
    const game = {
        started: true,
        level: 0,
        hasChanged: true
    }

    // Block function constructor
    const Block = function(width, hp, density, type) {
        this.width = width;
        this.hp = hp;
        this.maxHp = hp;
        this.density = density;
        this.type = type
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

    return {
        getBall: function() {
            return ball;
        },

        setBallPos: function(x, y) {
            ball.position.x = x;
            ball.position.y = y;

            // reverse horizontal velocity if out of bounds
            if (ball.position.x <= (ball.size /2)
            || ball.position.x >= (levelSize.x - ball.size /2)) {
                ball.velocity.x *= -1;
            } 

            // reverse vertical velocity if out of bounds
            if (ball.position.y <= (ball.size /2)
            || ball.position.y >= (levelSize.y - ball.size /2)) {
                ball.velocity.y *= -1;
            } 

        },

        getLevelSize: function() {
            return levelSize;
        },

        getLevelSizeInCells: function() {
            return {y: levels[game.level].length,
                    x: levels[game.level][0].length};
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
                            let tBlock = new Block(1, 10, 1, 'basic');
                            cellsRow.push(tBlock);
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

        test: function() {
            console.log(levels[game.level]);
        }



        
    }

})();

const UIController = (function(){
    const DOMStrings = {
        canvas: `#myCanvas`
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

        drawCanvas: function(CTX, x, y) {
            
            const canvasRef = document.querySelector(DOMStrings.canvas);
            

            for (let col = 0; col < currentLevel.length; col++) {
                for (let row = 0; row < currentLevel[0].length; row++) {
                    const posThis = {
                        x: Math.floor((canvasRef.width / (currentLevel[0].length + 1)) * row),
                        y: Math.floor((canvasRef.height / (currentLevel.length + 1)) * col)
                    };

                    
                    if (currentLevel[col][row]) {
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
            
            //drawRect(CTX, `#FF0000`, 20, 40, 30, 30);
            
            // CTX.beginPath();
            // CTX.rect(20, 40, 50, 50);
            // CTX.fillStyle = "#FF0000";
            // CTX.fill();
            // CTX.closePath();
        },

        drawCircle: function(ctx, fill, y, x, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, false);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
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

    // handle an update frame called by setInterval
    update = function() {
        // link to the Canvas DOM object
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ctx = mCanvas.getContext("2d");

        // get information from the game controller
        // about the ball
        const ball = gameCtrl.getBall();

        // clear the canvas
        ctx.clearRect(0,0, mCanvas.width, mCanvas.height);

        // check if the state of the level has changed
        const needsUpdate = gameCtrl.getLevelState();
        if (needsUpdate) {
            UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
            gameCtrl.setLevelState(false);
        }

        const size = gameCtrl.getLevelSizeInCells();
        UICtrl.drawCanvas(ctx, size.x, size.y);

        drawBall(ctx, ball);

        gameCtrl.setBallPos(
            ball.position.x + ball.velocity.x,
            ball.position.y - ball.velocity.y);
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