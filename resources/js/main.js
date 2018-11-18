const gameController = (function(){
    const levels = [];
    const blocks = [];

    let ball = {
        position: {
            x: 200,
            y: 400
        },

        velocity: 20,

        angle: 45
    }

    return {
        getBall: function() {
            return ball;
        },

        setBallPos: function(x, y) {
            ball.position.x = x;
            ball.position.y = y;
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

    drawGame = function() {
        const DOM = UICtrl.getDomStrings();
        const mCanvas = document.querySelector(DOM.canvas);
        const ctx = mCanvas.getContext("2d");

        const ball = gameCtrl.getBall();

        UICtrl.drawCircle(ctx,
            `#0095DD`,
            ball.position.y,
            ball.position.x,
            10);
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