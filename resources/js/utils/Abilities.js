const Abilities = (function(){
  let cycle = 0;
  const maxCycle = 9999;

  let abilityQueue = [];

  return {
    getCycle: function() {
      return cycle;
    },
    
    advanceCycle: function() {
      cycle++;
      if (cycle > maxCycle) {
        cycle = 0;
      }
    }
  }
}());

export default Abilities;