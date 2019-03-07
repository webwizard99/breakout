const UIController = (function(){
    const DOMStrings = {
        Canvas: {
          background: `#Canvas-background`,
          player: `#Canvas-player`,
          blocks: `#Canvas-blocks`,
          hud: `#Canvas-hud`,
          effects: `#Canvas-effects`
        },
        container: `#mainContainer`,
        score: `#score`,
        highScore: `#highScore`,
        LivesView: `#LivesView`,
        BallHit: `#BallHit`
    };

    const Layers = {
      background: false,
      player: false,
      blocks: false,
      hud: false,
      effects: false
    }

    const Title = {
        background: {
            position: {
                x: 120,
                y: 60
            },
            size: {
                x: 400,
                y: 60
            },
            colorStart: `rgba(80, 90, 140, 0.9`,
            colorEnd: `rgba(140, 150, 200, 0.85)`,
            shadow: `rgba(40, 40, 40, 0.5)`
            
        },
        text: {
            position: {
                x: 140,
                y: 100
            },
            size: `1.5rem`,
            color: `rgba(245, 250, 255, 0.95)`,
            shadow: `rgba(40, 40, 40, 0.8)`
        }
    }

    // const levelThemes = [
    //     {
    //         basic: `rgba(80, 100, 140, %alpha)`
    //     }
    // ];
    
    let currentLevel = [];

    const drawRect = function(ctx, fill, x, y, h, w) {
        ctx.beginPath();
        
        ctx.rect(x, y, w, h);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
    }

    const drawShadowedRect = function(ctx, fill, fillShadow, x, y, h, w) {
        ctx.save();
        ctx.beginPath();
        ctx.shadowColor = fillShadow;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 3;
        ctx.rect(x, y, w, h);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    const drawGradientRect = function(ctx, fillStart, fillEnd, x, y, h, w, fillShadow) {
        ctx.save();
        ctx.beginPath();
        var grd = ctx.createLinearGradient(0,0, w, 0);
        grd.addColorStop(0, fillStart);
        grd.addColorStop(1, fillEnd);
        if (fillShadow) {
            ctx.shadowColor = fillShadow;
            ctx.shadowOffsetX = -1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 10;
        }
        ctx.rect(x, y, w, h);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    const drawText = function(ctx, fill, fontSize, text, x, y, shadow) {
        ctx.save();
        ctx.font = `${fontSize} Bungee`;
        if (shadow) {
            ctx.shadowColor = shadow;
            ctx.shadowBlur = 6;
        }
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
        ctx.restore();
        
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

        // drawBox: function(color, x, y, w, h) {
        //     const canvasRef = document.querySelector(DOMStrings.canvas);
        //     const CTX = canvasRef.getContext("2d");
        //     drawRect(CTX, color, x, y, h, w);
        // },

        drawBall: function(ctx, ball) {
            Layers.player = true;
            drawCircle(ctx,
                `#0095DD`,
                ball.position.y,
                ball.position.x,
                ball.size);
        },

        clearBall: function(ctx, pos, ball) {
          const ballClear = 1.2;
          drawCircle(ctx,
            `rgb(230,230,250)`,
            pos.y,
            pos.x,
            ball.size * ballClear);
        },
        
        // draw blocks on canvas
        drawCanvas: function(CTX, blockProtoT, cellT) {
            
            Layers.blocks = true;
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

        displayVictory: function(score) {
            Layers.hud = true;
            const tCanv = document.querySelector(`${DOMStrings.Canvas.hud}`);
            const ctx = tCanv.getContext('2d');            
            const victoryText = `You win!    ${score}pts!`;

            drawGradientRect(ctx, 
                Title.background.colorStart,
                Title.background.colorEnd,
                Title.background.position.x,
                Title.background.position.y,
                Title.background.size.y, 
                Title.background.size.x,
                Title.background.shadow
                );

            drawText(ctx,
                Title.text.color,
                Title.text.size,
                victoryText,
                Title.text.position.x,
                Title.text.position.y,
                Title.text.shadow);
        },

        drawPaddle: function(ctx, paddle) {
            Layers.player = true;
            drawRect(ctx, paddle.color, paddle.position.x, paddle.position.y, paddle.size.y, paddle.size.x)
        },

        clearPaddle: function(ctx, pos, paddle) {
          ctx.clearRect(pos.x - 1, pos.y - 1, paddle.size.x + 2, paddle.size.y + 2);
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

        setHighScore: function(score) {
            const highScoreEle = document.querySelector(DOMStrings.highScore);
            highScoreEle.textContent = score;
        },

        drawMenu: function(continues) {
            Layers.hud = true;
            const tCanv = document.querySelector(`${DOMStrings.Canvas.hud}`);
            const ctx = tCanv.getContext('2d');
            
            drawShadowedRect(ctx, 
                    `rgb(210,210,240)`,
                    `rgb(130,130,150)`,
                    120, 80, 120, 400);
            
            let gameOverText = '';
            let continueText = '';
            if (continues <= 0) {
                gameOverText = 'Game Over - Press Enter to Start';

            } else {
                let continueCost = continues * 500;
                gameOverText = 'Game Over - Enter (continue) or Esc (restart)'
                continueText = `${continueCost} to Continue.`
            }
            drawText(ctx,
                    `rgb(70,70,90)`,
                    `14px`,
                    gameOverText,
                    140, 100);

            if (continueText !== '') {
                drawText(ctx,
                    `rgb(70,70,90)`,
                    `14px`,
                    continueText,
                    140, 130);
            }
        },

        drawTitle: function(title) {
            Layers.hud = true;
            const tCanv = document.querySelector(`${DOMStrings.Canvas.hud}`);
            const ctx = tCanv.getContext('2d');
            drawGradientRect(ctx, 
                Title.background.colorStart,
                Title.background.colorEnd,
                Title.background.position.x,
                Title.background.position.y,
                Title.background.size.y, 
                Title.background.size.x,
                Title.background.shadow
                );
            
            drawText(ctx,
                Title.text.color,
                Title.text.size,
                title,
                Title.text.position.x,
                Title.text.position.y,
                Title.text.shadow);
            
        },

        test: function() {
            console.table(currentLevel);
        },

        playBallHit: function() {
            const ballHit = document.querySelector(`${DOMStrings.BallHit}`);
            ballHit.currentTime = 0;
            ballHit.play();
        },

        getLayers: function() {
          return JSON.parse(JSON.stringify(Layers));
        },

        setLayers: function(newLayers) {
          Layers = newLayers;
        },

        initCanvases: function() {
          const baseCanvas = document.querySelector(DOMStrings.Canvas.background);
          const baseRect = baseCanvas.getBoundingClientRect();
          console.log(baseRect);
          const basePos = {
            x: baseRect.x,
            y: baseRect.y,
            top: baseRect.top
          }
          for (let layerNum = 1; layerNum < 5; layerNum++) {
            const canvasLayer = document.querySelector(`[layer="${layerNum}"]`);
            let layerRect = canvasLayer.getBoundingClientRect();
            const vOffset = (layerRect.top) - basePos.top;
            canvasLayer.style.transform = `translate(0px, ${-vOffset}px)`;

          }

        }

        
    }
})();

export default UIController;