const Abilities = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let activeAbilityIds = [];
  let nextAbilityId = 1;

  let abilityQueue = [];

  const Ability = function(interval) {
    this.interval = interval;
  }

  Ability.prototype.createId = function() {
    const newId = getAbilityId();
    return newId;
  }

  Ability.prototype.scheduleProc = function() {
    this.nextProc = cycle + this.interval;
    abilityQueue.push({
      id: this.id,
      cycle: this.nextProc
    });
  }

  const getAbilityId = function() {
    const thisAbilityID = nextAbilityId;
    nextAbilityId++;
    activeAbilityIds.push(thisAbilityID);
    return thisAbilityID;
  }

  return {
    getCycle: function() {
      return cycle;
    },
    
    advanceCycle: function() {
      cycle++;
      if (cycle > maxCycle) {
        cycle = 0;
      }
    },

    fetchAbilities: function() {
      const retAbilities = [];

      
    }
  }
}());

export default Abilities;

//builtincolorado