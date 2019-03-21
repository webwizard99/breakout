const Abilities = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let activeAbilityIds = [];
  let nextAbilityId = 1;

  let abilityQueue = [];

  const Ability = function(interval, abilityName, args) {
    this.interval = interval;
    this.abilityCall = abilityName;
    this.args = args;
  }

  Ability.prototype.createId = function() {
    const newId = getAbilityId();
    this.id = newId;
    return newId;
  }

  Ability.prototype.unregister = function() {
    const thisIndex = activeAbilityIds.indexOf(this.id);
    const deletedId = activeAbilityIds.splice[thisIndex];
    if (deletedId) {
      return true;
    } else {
      return false;
    }
  }

  Ability.prototype.clearFromQueue = function() {
    clearAbilityFromQueue(this.id);
  }

  Ability.prototype.scheduleProc = function() {
    this.nextProc = cycle + this.interval;
    abilityQueue.push({
      id: this.id,
      cycle: this.nextProc
    });
    console.log(abilityQueue);
  }

  const clearAbilityFromQueue = function(id) {
    if (abilityQueue.length < 1) return true;
    
    const markedAbility = abilityQueue.filter(ability => ability.id === id);
    markedAbility.forEach(ability => {
      const abilityIndex = abilityQueue.indexOf(ability);
      abilityQueue.slice(abilityIndex, 1);
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
    },

    getNewAbility: function(abilityProto) {
      const newAbility = new Ability(abilityProto.interval,
        abilityProto.abilityName, abilityProto.args);
      return newAbility;
    },

    clearAbilities: function() {
      activeAbilityIds = [];
      nextAbilityId = 1;
      abilityQueue = [];
    }
  }
}());

export default Abilities;

//builtincolorado