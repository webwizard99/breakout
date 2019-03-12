const Constants = (function(){
    // Base Level Size
    const levelSize= {
        x: 640,
        y: 600
    };
    
    // timing for game mechanics
    const drag = 0.045;
    const boxCoEff = 1.12;
    const collisionDelay = 15;
    const randomVariance = 0.02;

    // timing delays for game state changes
    const titleDelay = 1800;
    const menuDelay = 500;

    // level layout constants
    const columnsProto = 12;
    const rowsProto = 40;
    const rowsProtoEditor = 32;

    const cyclesPerSecond = 120;

    const blockProportion = {
        width: .95,
        height: .90
    };
    
    const blockOffset = {
        width: 0.025,
        height: 0.05
    }

    const cell = {
        width: levelSize.x / columnsProto,
        height: levelSize.y / rowsProto
    }

    const blockProto = {
        width: cell.width * blockProportion.width,
        height: cell.height * blockProportion.height,
        offsetX: cell.width * blockOffset.width,
        offsetY: cell.height * blockOffset.height
    }

    const paddleFrictionCoeff = 10;
    const maxDeflectionRatio = 1.8;

    const maxRows = 20;
    const minBuffer = 1;
    const paletteBlocks = 16;
    const swapAnimationDelay = 400;


    return {
        getCell: function() {
            return cell;
        },

        getPaletteBlocks: function() {
          return paletteBlocks;
        },
        
        getBlockProto: function() {
            return blockProto;
        },

        getLevelSize: function() {
            return levelSize;
        },

        getDrag: function() {
            return drag;
        },

        getBoxCoEff: function() {
            return boxCoEff;
        },

        getCollisionDelay: function() {
            return collisionDelay;
        },

        getRandomVariance: function() {
            return randomVariance;
        },

        getColumnsProto: function() {
            return columnsProto;
        },

        getRowsProto: function() {
            
            return rowsProto;
        },

        getRowsProtoEditor: function() {

            return rowsProtoEditor;
        },

        getTitleDelay: function() {
            return titleDelay;
        },

        getMenuDelay: function() {
            return menuDelay;
        },

        getCyclesPerSecond: function() {
          return cyclesPerSecond;
        },

        checkBounds: function(r,c) {
            if (r < minBuffer ||
                r > maxRows ||
                c < minBuffer ||
                c > (columnsProto - minBuffer -1)) {
                return false;
            } else {
                return true;
            }
        },

        getSwapAnimationDelay: function() {
          return swapAnimationDelay;
        },

        getPaddleFrictionCoeff: function() {
          return paddleFrictionCoeff;
        },

        getMaxDeflectionRatio: function() {
          return maxDeflectionRatio;
        }
    }
})();

export default Constants;