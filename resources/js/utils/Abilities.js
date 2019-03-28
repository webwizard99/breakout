const Abilities = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let activeAbilityIds = [];
  let nextAbilityId = 1;

  let abilityQueue = [];

  const registeredAbilities = {
    heal: {
      name: 'heal',
      interval: 1500
    }
  }

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
      cycle: this.nextProc,
      ability: this.abilityCall
    });
  }

  const clearAbilityFromQueue = function(id) {
    if (abilityQueue.length < 1) return true;
    const markedAbility = abilityQueue.filter(ability => ability.id === id);
    markedAbility.forEach(ability => {
      const abilityIndex = abilityQueue.indexOf(ability);
      abilityQueue.splice(abilityIndex, 1);
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
      const returnAbilities = abilityQueue.filter(
        ability => {
          // console.log(`ability.cycle: ${ability.cycle}, cycle: ${cycle}`);
          return (ability.cycle === cycle ||
            ability.cycle - maxCycle === cycle)});

      // console.log(`returnAbilities: ${returnAbilities}, cycle: ${cycle}`);
      returnAbilities.forEach(function(ability){
        const abilityReference = abilityQueue.find(
          queueAbility => queueAbility.id === ability.id
        );
        const removalIndex = abilityQueue.indexOf(abilityReference);
        abilityQueue.splice(removalIndex, 1);
      });

      if (returnAbilities.length > 0) {
        return JSON.parse(JSON.stringify(returnAbilities));
      } else {
        return false;
      }

    },

    getRegisteredAbility: function(name) {
      const returnAbility = registeredAbilities[name];
      if (returnAbility) {
        return returnAbility;
      }
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