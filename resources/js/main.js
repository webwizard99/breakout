const gameController = (function(){
    const levels = [];
    const blocks = [];

    let levelSize = {
        x: 640,
        y: 480
    }

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
        damage: 3
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
        }

        
    }

})();

const UIController = (function(){
    const DOMStrings = {
        canvas: `#myCanvas`
    };

    drawRect = function(ctx, fill, x, y, h, w) {
        ctx.beginPath();
        ctx.rect(y, x, y + h, x + w);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
    }

    

    return {
        getDomStrings: function() {
           return DOMStrings;
        },

        drawCanvas: function(CTX) {
            drawRect(CTX, `#FF0000`, 20, 40, 30, 30);
            drawCircle(CTX, `green`, 240, 160, 20);
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

    // draw the game area, called by setInterval
    drawGame = function() {
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ctx = mCanvas.getContext("2d");

        const ball = gameCtrl.getBall();

        ctx.clearRect(0,0, mCanvas.width, mCanvas.height);

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

            setInterval(drawGame, 10);
            
        }
    }
})(gameController, UIController);

Controller.init();