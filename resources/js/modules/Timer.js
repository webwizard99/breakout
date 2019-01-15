const Timer = (function(fnToRun, rate) {

    var timerRef = null;
    var startTimer = function() {
        timerRef = setInterval(function() {
            fnToRun();
        }, rate);
    };
  
    var stopTimer = function() {
        clearInterval(timerRef);
    };
  
    return {
        startTimer: startTimer,
        stopTimer: stopTimer
    };
  
  })();