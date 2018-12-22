import Levels from '../utils/Levels.js';

// ---#######--#######--#######--#######
// -------#######--#######--#######-----
// --- <<< GameController >>>
// -------#######--#######--#######-----
// ---#######--#######--#######--#######

// Model for game calculations
const GameController = (function(){
    // array to hold all level objects
    let levels = [];
    

    // Base Level Size
    const levelSize = {
        x: 640,
        y: 480
    }

    // game state object
    const game = {
        cyclesSincePaddle: 0,
        updateCyclesSec: 100,
        points: 0,
        lives: 4,
        maxLives: 4,
        started: true,
        paused: false,
        level: 0,
        hasChanged: true,
        leftPress: false,
        rightPress: false,
        isGameOver: false,
        toggleRebound: false,
        startPos: {
            x: levelSize.x / 2,
            y: levelSize.y - 40
        },
        paddleStartPos: {
            x: (levelSize.x / 2) -45,
            y: levelSize.y - 30
        },
        startVel: {
            x: 2,
            y: 2
        }
    }

    

    const drag = 0.045;
    const boxCoEff = 1.06;
    const collisionDelay = 85;
    const randomVariance = 0.02;
    // const horizontalBounds = 0.16;

    const blockHP = 5;


    //let tBlock = new Block(1, blockHP, 1, 'basic', x, y, row, col);
    // Block function constructor
    const Block = function(width, color, hp, density, type, x, y, row, col) {
        this.width = width;
        this.color = color;
        this.hp = hp;
        this.maxHp = hp;
        this.density = density;
        this.type = type;
        this.position = {
            x: x,
            y: y
        }
        this.row = row;
        this.col = col;
    };

    Block.prototype.takeDamage = function(val) {
        
        if (val) {
            this.hp -= val;
            this.opacity = Math.floor(((this.hp/ this.maxHp) * 70) + 20);
            game.hasChanged = true;
        }
        if (this.hp <= 0) {
            this.die();
        }
    };

    Block.prototype.die = function() {
        game.points += 30 + Math.floor(game.cyclesSincePaddle / game.updateCyclesSec);
        levels[game.level][this.row][this.col] = false;
        
    }

    const Collision = function() {
        this.leftCollide = false;
        this.rightCollide = false;
        this.topCollide = false;
        this.bottomCollide = false;
    }

    Collision.prototype.effectCollide = function() {
        // If ball has rebounded already this frame, exit function
        if (game.toggleRebound) return;
        
        if (this.leftCollide || this.rightCollide) {
            reverseHorizontalVelocity();
        }

        if (this.topCollide || this.bottomCollide) {
            reverseVerticalVelocity();
        }

        if (this.leftCollide || this.rightCollide || this.topCollide || this.bottomCollide) {
            
            game.toggleRebound = true;
            setTimeout(function(){
                game.toggleRebound = false;
            }, collisionDelay);
        }

        

        this.leftCollide = false;
        this.rightCollide = false;
        this.topCollide = false;
        this.bottomCollide = false;
    }


    

    const columnsProto = 16;
    const rowsProto = 32; 
    const cell = {
        width: levelSize.x / columnsProto,
        height: levelSize.y / rowsProto,
        
    }

    const blockProto = {
        width: cell.width * 0.95,
        height: cell.height * 0.90,
        offsetX: cell.width * 0.025,
        offsetY: cell.height * 0.05
    }

    

    // ball object
    let ball = {
        position: {
            x: levelSize.x / 2,
            y: levelSize.y - 40
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
        color: `rgba(210, 165, 85, .9)`,
        
        position: {
            x: (levelSize.x / 2) -45,
            y: levelSize.y - 30
        },

        velocity: 0,
        acceleration: 0.16,

        size: {
            x: 90,
            y: 10
        },

        maxSpeed: 3.5
    }

    const startRandom = function() {
        return (Math.random() * 3);
    }
    
    const randomRub = function() {
        const handicap = game.cyclesSincePaddle / 10000;
        const randomx = Math.random() * randomVariance * handicap;
        const randomy = Math.random() * randomVariance * handicap;
        addBallVelocity('x', randomx - (randomVariance / 2));
        addBallVelocity('y', randomy - (randomVariance / 2));
        
    }

    const checkCollision = function(isPaddle, x, y, w, h, cell) {
        
        let collisionT = new Collision();
        let collided = false;

        if ((ball.position.x + ball.size) > x && 
            (ball.position.x - ball.size) < (x + w) && 
            (ball.position.y + ball.size) > y &&
            (ball.position.y - ball.size) < (y + h)) {

                
            // Check for collision along left edge
            if (Math.abs(ball.position.x - x) <= (ball.size * boxCoEff ) && ball.velocity.x > 0) {
                
                // Check if there's a block adjacent on the side of the block closest to the ball
                if (isPaddle) {
                    collisionT.leftCollide = true;
            
                    collided = true;
                } else if((!(levels[game.level][cell.y][cell.x - 1]))) {
                
                    collisionT.leftCollide = true;
            
                    collided = true;
                    
                } 
                
            }

            // Check for collision along right edge
            if (Math.abs(ball.position.x - (x + w)) <= (ball.size * boxCoEff) && ball.velocity.x < 0) {
                
                if (isPaddle) {
                    collisionT.rightCollide = true;
            
                    collided = true;
                } else if((!(levels[game.level][cell.y][cell.x + 1]))) {
                    
                        collisionT.rightCollide = true;
                
                        collided = true;
                    
                } 
                
            }

            // Check for collision along top edge
            if (Math.abs(ball.position.y - y) <= (ball.size * boxCoEff) && ball.velocity.y < 0) {
                
                if (isPaddle) {
                    collisionT.topCollide = true;
            
                    collided = true;
                } else if((!(levels[game.level][cell.y - 1][cell.x]))) {

                    collisionT.topCollide = true;

                    collided = true;
                }
                
            }

            // Check for collision along bottom edge
            if (Math.abs(ball.position.y - (y + h)) <= (ball.size * boxCoEff) && ball.velocity.y > 0) {
                
                if (isPaddle) {
                    collisionT.bottomCollide = true;
            
                    collided = true;
                } else if((!(levels[game.level][cell.y + 1][cell.x]))) {
                    collisionT.bottomCollide = true;
                    
                    collided = true;
                }
            }
        }

        if (collided) {
            return collisionT;
        } else {
            return false;
        }

    }

    const reverseVerticalVelocity = function() {
        // do not reverse horizontal velocity if ball is beneath paddle
        if (ball.position.y > paddle.position.y + paddle.size.y + ball.size) return;
        ball.velocity.y *= -1; 
        randomRub();
    }

    const reverseHorizontalVelocity = function() {
        ball.velocity.x *= -1;
        randomRub();
    }

    const addBallVelocity = function(axis, vel) {
            
        ball.velocity[axis] += vel;
        
    }

    const checkEmpty = function(Ecell) {
        return Ecell === false;
    }

    const checkRange = function(blockR) {
        let x, y;
        x = blockR.position.x;
        y = blockR.position.y;
        return (Math.abs(x - ball.position.x) <= blockProto.width && Math.abs(y - ball.position.y) <= blockProto.width);
    }

    const fetchNotBlank = function(cellF) {
        return cellF != false;
    }

    return {
        getBall: function() {
            return ball;
        },

        getPaddleVelocity: function() {
            return paddle.velocity;
        },

        setPaddleVelocity: function(x) {
            // if (!x) return;
            paddle.velocity = x;
            
        },

        getPaddle: function() {
            return paddle;
        },

        getLives: function() {
            
            return game.lives;
        },

        setLives: function(tLives) {
            game.lives = tLives;
        },

        getMaxLives: function() {
            return game.maxLives;
        },

        getStartPos: function() {
            return game.startPos;
        },

        getPaddleStartPos: function() {
            return game.paddleStartPos;
        },

        getIsStarted: function() {
            return game.started;
        },

        setIsStarted: function(state) {
            game.started = state;
        },

        getUpdateRate: function() {
            return (Math.floor(1000 / game.updateCyclesSec));
        },

        getLevel: function() {
            return game.level;
        },

        setLevel: function(levelN) {
            if (levelN <= Levels.length) {
                game.level = levelN;
            }
        },

        setBallPos: function(x, y) {
            ball.position.x = x;
            ball.position.y = y;

            // reverse horizontal velocity if out of bounds
            if (ball.position.x <= (ball.size /2) * boxCoEff
            || ball.position.x >= (levelSize.x - (ball.size /2 * boxCoEff))) {
                if (ball.position.x <= (ball.size /2) * boxCoEff) {
                    ball.position.x = (ball.size /2) * boxCoEff;
                }
                if (ball.position.x >= (levelSize.x - (ball.size /2 * boxCoEff))) {
                    ball.position.x = (levelSize.x - (ball.size /2 * boxCoEff))
                }
                reverseHorizontalVelocity();
            } 

            // reverse vertical velocity if out of bounds
            if (ball.position.y <= (ball.size /2) * boxCoEff
            || ball.position.y >= (levelSize.y - ((ball.size /2) * boxCoEff))) {
                if (ball.position.y <= (ball.size /2) * boxCoEff) {
                    ball.position.y = (ball.size /2) * boxCoEff;
                }
                // if (ball.position.y >= (levelSize.y - ((ball.size /2) * boxCoEff))) {
                //     ball.position.y >= (levelSize.y - ((ball.size /2) * boxCoEff));
                // }
                if (ball.position.y <= (paddle.position.y + paddle.size.y + ball.size))
                {
                    reverseVerticalVelocity();
                }
            } 

            // Check for game over conditions
            if (ball.position.y >= (levelSize.y - ball.size /2)) {
                // game.started = false;
                game.isGameOver = true;
            }


            //check if ball is colliding with paddle
            let paddleCollide = checkCollision(true, paddle.position.x, 
                paddle.position.y, 
                paddle.size.x, 
                paddle.size.y, 
                {
                    row: rowsProto -2,
                    col: Math.floor((columnsProto / 2) - 1)
                });
            if (!paddleCollide) {
                if (game.cyclesSincePaddle < 60000) {
                    game.cyclesSincePaddle += 1;
                }    
                return;
            } else {
                
                paddleCollide.effectCollide();
                game.cyclesSincePaddle = 0;
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

        uplinkLevels: function() {
            let tLevelSet = [];

            let tImport = Levels;

            tImport.forEach(tLevelTemplate => {

                let tLevel = [];
                            
                // iterate through the rows and columns and
                // populate an area of blocks with boolean false
                // elsewise
                for (let row = 0; row < rowsProto; row++) {
                    let cellsRow = [];
                    for (let col = 0; col < columnsProto; col++) {
                        if (!tLevelTemplate[row][col]) {
                            cellsRow.push(false);
                        } else {
                                let x = Math.floor(cell.width * col);
                                let y = Math.floor(cell.height * row);
                                let tImportBlock = tLevelTemplate[row][col];
                                let tBlock = new Block(1, tImportBlock.color, tImportBlock.hp, 1, tImportBlock.type, x, y, row, col);
                                cellsRow.push(tBlock);
                        }
                    }

                    tLevel.push(cellsRow);
                }

                tLevelSet.push(tLevel);
                
            });
            
            levels = tLevelSet.slice(0,tLevelSet.length);
            
            //return tLevel;
        },

        getLevelObjectForUI: function() {
            let levelT = [];
            levels[game.level].forEach((row) => {
               let rowT = row.map((cell) => {
                    if (cell) {
                        return {
                            width: cell.width,
                            type: cell.type,
                            color: cell.color,
                            position: {
                                y: cell.position.x,
                                x: cell.position.y
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

        toggleRebound: function() {
            game.toggleRebound = !game.toggleRebound;
        },

        checkBlocks: function(){
            
            let masterCollide = new Collision();
            let allCollides = [];
            
            let filteredLevel = [];
            
            levels[game.level].forEach((row, nRow) => {
                if (row.find(fetchNotBlank)) {
                    let filteredRow = [];
                    const checkRow = row.filter(fetchNotBlank);
                    filteredRow = checkRow.filter(checkRange);
                    
                    if (filteredRow.length > 0) {
                        filteredLevel.push(filteredRow);
                    }
                }
            });

            if (filteredLevel.length < 1) return;

            
            

            filteredLevel.forEach((row, nRow) => {
                                    
                row.forEach((col, nCol) => {
                    
                    if (filteredLevel[nRow][nCol]) {
                        let tCell = col;
                        // let x = Math.floor(cell.width * nCol);
                        // let y = Math.floor(cell.height * nRow);
                        let x = col.position.x;
                        let y = col.position.y;
                        let w = Math.floor(blockProto.width);
                        let h = blockProto.height;
                        
                        

                        let blockCollide = checkCollision(false, x, y, w, h, 
                            {
                                x: tCell.col,
                                y: tCell.row
                            });

                        if (blockCollide.leftCollide) {
                            masterCollide.leftCollide = true;
                        }
                        if (blockCollide.rightCollide) {
                            masterCollide.rightCollide = true;
                        }
                        if (blockCollide.topCollide) {
                            masterCollide.topCollide = true;
                        }
                        if (blockCollide.bottomCollide) {
                            masterCollide.bottomCollide = true;
                        }

                        if (blockCollide.leftCollide ||
                            blockCollide.rightCollide ||
                            blockCollide.topCollide ||
                            blockCollide.bottomCollide) {
                            allCollides.push(tCell);
                            
                        }
                        

                        if (!blockCollide) {
                            return;
                        } 
                    }
                });
            });

            if (masterCollide.topCollide && masterCollide.bottomCollide) {
                masterCollide.topCollide = false;
                masterCollide.bottomCollide = false;
            }

            if (masterCollide.rightCollide && masterCollide.leftCollide) {
                masterCollide.rightCollide = false;
                masterCollide.leftCollide = false;
            }
            masterCollide.effectCollide();

            if (allCollides) {
                    allCollides.forEach( tCell => {
                        tCell.takeDamage(ball.damage);
                });
            }
        },

        checkComplete: function() {
            let tLevel = levels[game.level];
            
            let emptyAll = true;
            tLevel.forEach(tRow => {
                if (!tRow.every(checkEmpty)) {
                    emptyAll = false;
                }
            });
            
            if (emptyAll) {
                return true;
            } else {
                return false;
            }
        },

        getColumnsProto: function() {
            return columnsProto;
        },

        getRowsProto: function() {
            return rowsProto;
        },

        getBlockProto: function() {
            return blockProto;
        },

        getCell: function() {
            return cell;
        },



        setToggleRebound: function(val){
            game.toggleRebound = val;
        },

        getScore: function() {
            return game.points;
        },

        test: function() {
            console.log(levels[game.level]);
        }



        
    }

})();


// ---#######--#######--#######--#######
// -------#######--#######--#######-----
// --- <<< UIController >>>
// -------#######--#######--#######-----
// ---#######--#######--#######--#######

const UIController = (function(){
    const DOMStrings = {
        canvas: `#myCanvas`,
        container: `#mainContainer`,
        score: `#score`,
        LivesView: `#LivesView`
    };

    const levelThemes = [
        {
            basic: `rgba(80, 100, 140, %alpha)`
        }
    ];
    
    let currentLevel = [];

    const drawRect = function(ctx, fill, x, y, h, w) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
    }

    const drawCircle = function(ctx, fill, y, x, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, false);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
    }

    return {
        getDomStrings: function() {
           return DOMStrings;
        },

        drawBox: function(color, x, y, w, h) {
            const canvasRef = document.querySelector(DOMStrings.canvas);
            const CTX = canvasRef.getContext("2d");
            drawRect(CTX, color, x, y, h, w);
        },

        drawBall: function(ctx, ball) {
        
            drawCircle(ctx,
                `#0095DD`,
                ball.position.y,
                ball.position.x,
                ball.size);
        },
        
        // draw blocks on canvas
        drawCanvas: function(CTX, blockProtoT, cellT) {
            
            
            for (let row = 0; row < currentLevel.length; row++) {
                for (let col = 0; col < currentLevel[0].length; col++) {
                    
                    if (!currentLevel[row][col]) {
                        
                        
                    } else {
                        
                        
                        let x = Math.floor(cellT.width * col) + blockProtoT.offsetX;
                        let y = Math.floor(cellT.height * row) + blockProtoT.offsetY;
                        let w = Math.floor(blockProtoT.width);
                        let h = blockProtoT.height;
                        const posThis = {
                            x: x,
                            y: y
                        };

                        let tCBlock = currentLevel[row][col];

                        const colorT = tCBlock.color.replace('%alpha', (tCBlock.opacity / 100).toString());
                        // const colorT = `rgba(140, 40, 140, 1)`;
                        
                        drawRect(CTX,
                            colorT,
                            posThis.x,
                            posThis.y,
                            h,
                            w);
                    }
                }
                
            }
            
            
        },

        

        drawPaddle: function(ctx, paddle) {
            drawRect(ctx, paddle.color, paddle.position.x, paddle.position.y, paddle.size.y, paddle.size.x)
        },

        drawLives: function(lives, paddle) {
            const LivesView = document.querySelector(DOMStrings.LivesView);
            
            LivesView.innerHTML = '';
            for (let drawLife = 0; drawLife < lives; drawLife++) {
                const tLifeView = document.createElement('div');
                tLifeView.classList.add('life');
                const displayAdjust = 0.75;
                tLifeView.style.width = `${paddle.size.x * displayAdjust}px`;
                tLifeView.style.height = `${paddle.size.y * displayAdjust}px`;
                tLifeView.style.backgroundColor = paddle.color;
                LivesView.appendChild(tLifeView);
                
            }

        },

        // populates the currentLevel object in the
        // UIController
        setCurrentLevel: function(level) {
            currentLevel = level;
        },

        setScore: function(score) {
            const scoreEle = document.querySelector(DOMStrings.score);
            scoreEle.innerText = score;
        },

        test: function() {
            console.table(currentLevel);
        }

        
    }
})();


// ---#######--#######--#######--#######
// -------#######--#######--#######-----
// --- <<< Controller >>>
// -------#######--#######--#######-----
// ---#######--#######--#######--#######

const Controller = (function(gameCtrl, UICtrl){
    
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
    }

    // draw the player ball
    const drawBall = function(ctx, ball) {
        
        UICtrl.drawBall(ctx,
            `#0095DD`,
            ball.position.y,
            ball.position.x,
            ball.size);
    }

    const drawPaddle = function(ctx, paddle) {
        UICtrl.drawPaddle(ctx, paddle);
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
        
        // check for level clear
        
        

        // check for Game Over
        if (gameCtrl.isGameOver()) {
            const lives = gameCtrl.getLives();
            

            if (lives <=0) {
                alert(`lives: ${lives} game over!`);               
                document.location.reload();
            } else {
                gameCtrl.setLives(lives -1);
                setStartConditions();
                gameCtrl.setPaddleVelocity(0);
                
                gameCtrl.setIsStarted(false);
                gameCtrl.setGameOver(false); 
                
                window.setTimeout(function(){ 
                    gameCtrl.setIsStarted(true);
                    
                }, 1200);
            }
            gameCtrl.setGameOver(false);
        }

        if (!gameCtrl.isStarted()) return;

        // clear the canvas
        ctx.clearRect(0,0, mCanvas.width, mCanvas.height);

        // check if the state of the level has changed
        const needsUpdate = gameCtrl.getLevelState();
        if (needsUpdate) {
            
            //check for stage completion
            if (gameCtrl.checkComplete()) {
                // alert('complete!')
                setStartConditions();
                gameCtrl.setPaddleVelocity(0);
                gameCtrl.setLevel(gameCtrl.getLevel() + 1);
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
            UICtrl.setCurrentLevel(gameCtrl.getLevelObjectForUI());
        
            const thisLives = gameCtrl.getLives();
            const thisPaddle = gameCtrl.getPaddle();
            UICtrl.drawLives(thisLives, thisPaddle);
            gameCtrl.setLevelState(false);
        }

        // draw blocks on <Canvas> element
        const blockProtoT = gameCtrl.getBlockProto();
        const cellT = gameCtrl.getCell();
        UICtrl.drawCanvas(ctx, blockProtoT, cellT);

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
    }
    
    return {
        init: function() {
            setEventListeners();
            
            // set the starting conditions for a game
            startGame();

            setInterval(update, gameCtrl.getUpdateRate());
            
        }
    }
})(GameController, UIController);

Controller.init();