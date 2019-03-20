const Abilities = (function(){
  let cycle = 0;
  const maxCycle = 99999;

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

  Ability.prototype.scheduleProc = function() {
    this.nextProc = cycle + this.interval;
    abilityQueue.push({
      id: this.id,
      cycle: this.nextProc
    });
    console.log(abilityQueue);
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
    }
  }
}());

export default Abilities;

//builtincolorado