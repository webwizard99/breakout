const Effects = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let activeEffectCreatorIds = [];
  let nextEffectCreatorId = 1;

  const Effect = function(duration, position, form, creatorId) {
    this.cycleStart = cycle;
    this.cycleEnd = cycle + duration;
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

  let effectsQueue = [];

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

    advanceCycle: function() {
      
      cycle += 1;
      if (cycle > maxCycle) {
        cycle = 0;
      }
    },

    clearQueue: function() {
      effectsQueue = [];
    }
  }
}());

export default Effects;