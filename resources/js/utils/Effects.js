import Constants from '../utils/Constants.js';

const Effects = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let activeEffectCreatorIds = [];
  let nextEffectCreatorId = 1;

  let effectsQueue = [];

  const msToCycles = function(ms) {
    return Math.floor(ms * Constants.getCyclesPerSecond() / 1000);
  }

  const Effect = function(start, duration, position, form, creatorId) {
    this.cycleStart = start;
    this.cycleEnd = start + duration;
    this.duration = duration;
    this.position = position;
    this.form = form;
    this.creatorId = creatorId
  }

  const EffectCreator = function() {
    this.id = getEffectCreatorId();
  }

  EffectCreator.prototype.createEffect = function(duration, position, form) {
    return new Effect(duration, position, form, this.id);
  }

  EffectCreator.prototype.clearEffects = function() {
    clearCreatorEffects(this.id);
  }

  EffectCreator.prototype.unregister = function() {
    const thisIndex = activeEffectCreatorIds.indexOf(this.id);
    const deletedId = activeEffectCreatorIds.splice[thisIndex];
    if (deletedId) {
      return true;
    } else {
      return false;
    }
  }

  EffectCreator.prototype.draftEffects = function(type, coordList) {

    const duration = msToCycles(55);
    const baseTime = 0.054;
    const exponentTime = 0.0005;
    const decayFrame = 8;
    const decayTime = 0.032;

    if (type === 'heal') {
      coordList.forEach(pos => {
        for (let frame = 0; frame < 15; frame++) {
          let alphaCalc = baseTime * frame + (exponentTime * frame * frame);
          if (frame > decayFrame) {
            alphaCalc -= (frame - decayFrame) * decayTime;
          }
          const newEffect = new Effect(cycle + (duration * frame),
            duration, 
            {x: pos.x + Constants.getBlockProto().offsetX,
            y: pos.y + Constants.getBlockProto().offsetY}, 
            {h: Constants.getBlockProto().height,
            w: Constants.getBlockProto().width,
            color: `rgba(120, 190, 140, ${alphaCalc})`},
            this.id
          );
          effectsQueue.push(newEffect);
        }
      });
    }
    
  }

  const getEffectCreatorId = function() {
    const thisCreatorID = nextEffectCreatorId;
    nextEffectCreatorId++;
    activeEffectCreatorIds.push(thisCreatorID);
    return thisCreatorID;
  }

  const clearCreatorEffects = function(id) {
    if (effectsQueue.length < 1) return true;

    const markedCreatorEffects = effectsQueue.filter(effect => effect.creatorId === id);
    markedCreatorEffects.forEach(effect => {
      const fxIndex = effectsQueue.indexOf(effect);
      effectsQueue.slice(fxIndex, 1);
    });


  }

  return {
    getCycle: function() {
      return cycle;
    },

    getMaxCycle: function() {
      return maxCycle;
    },

    advanceCycle: function() {
      
      cycle += 1;
      if (cycle > maxCycle) {
        cycle = 0;
      }
    },

    clearQueue: function() {
      effectsQueue = [];
    },

    getNewEffectCreator: function() {
      const newEffectCreator = new EffectCreator();
      return newEffectCreator;
    },

    fetchEffects: function() {
      
      const returnEffects = effectsQueue.filter(
        effect => {
          return (effect.cycleStart === cycle ||
            effectsQueue.cycle - maxCycle === cycle)
        }
      );

      returnEffects.forEach(function(effect){
        const effectReference = effectsQueue.find(
          queueEffect => queueEffect === effect
        );

        const removalIndex = effectsQueue.indexOf(effectReference);
        effectsQueue.splice(removalIndex, 1);
      });

      if (returnEffects.length > 0) {
        return JSON.parse(JSON.stringify(returnEffects));
      } else {
        return false;
      }
    }
  }
}());

export default Effects;