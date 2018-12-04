const UIController = (function(){
    const DOMStrings = {
        canvas: `#myCanvas`,
        container: `#mainContainer`,
        score: `#score`
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

        drawBox: function(color, x, y, w, h) {
            const canvasRef = document.querySelector(DOMStrings.canvas);
            const CTX = canvasRef.getContext("2d");
            drawRect(CTX, color, x, y, h, w);
        },
        
        // draw blocks on canvas
        drawCanvas: function(CTX, blockProtoT, cellT) {
            
            const canvasRef = document.querySelector(DOMStrings.canvas);
            

            for (let col = 0; col < currentLevel.length; col++) {
                for (let row = 0; row < currentLevel[0].length; row++) {
                    

                    
                    if (currentLevel[col][row]) {
                        
                        let x = Math.floor(cellT.width * row);
                        let y = Math.floor(cellT.height * col);
                        let w = Math.floor(blockProtoT.width);
                        let h = blockProtoT.height;
                        const posThis = {
                            x: x,
                            y: y
                        };

                        const colorT = levelThemes[0].basic.replace('%alpha', (currentLevel[col][row].opacity / 100).toString());
                        
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

        setScore: function(score) {
            const scoreEle = document.querySelector(DOMStrings.score);
            scoreEle.innerText = score;
        },

        test: function() {
            console.table(currentLevel);
        }

        
    }
})();

export default UIController;