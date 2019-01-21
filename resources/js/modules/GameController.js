import Levels from '../utils/Levels.js';
import Constants from '../utils/Constants.js';
// import LevelStorage from '../../../../../Utils/LevelStorage';

// Model for game calculations
const GameController = (function(){
    // array to hold all level objects
    let levels = [];
    let levelNames = [];
    

    // Base Level Size
    const levelSize = Constants.getLevelSize();

    // game state object
    const game = {
        cyclesSincePaddle: 0,
        updateCyclesSec: 50,
        points: 0,
        highScore: 0,
        lives: 4,
        maxLives: 4,
        started: true,
        paused: false,
        menuOn: true,
        menuChoice: true,
        continueCount: 0,
        victory: false,
        level: 0,
        displayLevelName: false,
        hasChanged: true,
        leftPress: false,
        rightPress: false,
        isGameOver: false,
        toggleRebound: false,
        ballHit: false,
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

    

    const drag = Constants.getDrag();
    const boxCoEff = Constants.getBoxCoEff();
    const collisionDelay = Constants.getCollisionDelay();
    const randomVariance = Constants.getRandomVariance();
    const titleDelay = Constants.getTitleDelay();
    const menuDelay = Constants.getMenuDelay();


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


    

    const columnsProto = Constants.getColumnsProto();
    const rowsProto = Constants.getRowsProto(); 
    const cell = Constants.getCell();

    const blockProto = Constants.getBlockProto();

    

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
        game.ballHit = true;
    }

    const reverseHorizontalVelocity = function() {
        ball.velocity.x *= -1;
        randomRub();
        game.ballHit = true;
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
        return cellF !== false;
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

        getMaxLevel: function() {
            return levels.length;
        },

        setLevel: function(levelN) {
            console.log(levels.length);
            if (levelN <= levels.length && levelN > 0) {
                game.level = levelN;
            }
        },

        getMenuOn: function() {
            return game.menuOn;
        },

        setMenuOn: function(val) {
            game.menuOn = val;
        },

        getMenuChoice: function() {
            return game.menuChoice;
        },

        setMenuChoice: function(val) {
            game.menuChoice = val;
        },

        getContinueCount: function() {
            return game.continueCount;
        },

        setContinueCount: function(val) {
            game.continueCount = val;
        },

        getVictory: function() {
            return game.victory;
        },

        setVictory: function(val) {
            game.victory = val;
        },

        setBallVelocity: function(vel) {
            ball.velocity.x = vel.x;
            ball.velocity.y = vel.y;
        },

        getTitleDelay: function() {
            return titleDelay;
        },

        getMenuDelay: function() {
            return menuDelay;
        },

        setGameInit: function() {
            game.cyclesSincePaddle = 0;
            game.updateCyclesSec = 100;
            game.points = 0;
            game.highScore = 0;
            game.lives = 4;
            game.maxLives = 4;
            game.started = true;
            game.paused = false;
            game.menuOn = true;
            game.menuChoice = true;
            game.continueCount = 0;
            game.level = 0;
            game.displayLevelName = false;
            game.hasChanged = true;
            game.leftPress = false;
            game.rightPress = false;
            game.isGameOver = false;
            game.toggleRebound = false;
            game.ballHit = false;
            game.victory = false;
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

        startRandom: function() {
            let polar = (Math.random() * 2) -1;
            if (polar > 0) {
                polar = 1;
            } else if (polar <= 0) {
                polar = -1;
            }
            let xOut = (1.6 + (Math.random() * 0.8) + (game.level * 0.04)) * polar;
            return ({x: xOut, y: 2});
        },

        uplinkLevels: function() {
            let tLevelSet = [];
            let tLevelNames = [];

            let tImport = Levels.getLevels();
            //let tImport = LevelStorage.getLevels();
            

            tImport.forEach(tLevelTemplate => {

                let tLevel = [];
                tLevelNames.push(tLevelTemplate.name);
                            
                // iterate through the rows and columns and
                // populate an area of blocks with boolean false
                // elsewise
                for (let row = 0; row < rowsProto; row++) {
                    let cellsRow = [];
                    for (let col = 0; col < columnsProto; col++) {
                        if (!tLevelTemplate.map[row][col]) {
                            cellsRow.push(false);
                        } else {
                                let x = Math.floor(cell.width * col);
                                let y = Math.floor(cell.height * row);
                                let tImportBlock = tLevelTemplate.map[row][col];
                                let tBlock = new Block(1, tImportBlock.color, tImportBlock.hp, 1, tImportBlock.type, x, y, row, col);
                                cellsRow.push(tBlock);
                        }
                    }

                    tLevel.push(cellsRow);
                }

                tLevelSet.push(tLevel);
                
            });
            
            levels = tLevelSet.slice(0,tLevelSet.length);
            levelNames = tLevelNames.slice(0,tLevelNames.length);
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

        getDisplayLevelName: function() {
            return game.displayLevelName;
        },

        setDisplayLevelName: function( val) {
            game.displayLevelName = val;
        },

        dragPaddle: function() {
            if ((paddle.velocity > 0 && paddle.velocity > drag) || (paddle.velocity < 0 && paddle.velocity < -drag)) {
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
                    (paddle.velocity <= 0 && paddle.velocity > -paddle.maxSpeed)) {
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

        setBallHit: function(val) {
            game.ballHit = val;
        },

        getBallHit: function() {
            return game.ballHit;
        },

        getLevelName: function() {
            return levelNames[game.level];
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

        setScore: function(score) {
            game.points = score;
        },

        getHighScore: function() {
            return game.highScore;
        },

        setHighScore: function(score) {
            game.highScore = score;
        },

        test: function() {
            console.log(levels[game.level]);
        }



        
    }

})();

export default GameController;