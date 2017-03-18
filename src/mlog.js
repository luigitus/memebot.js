module.exports = {
  LOGLEVEL: {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    CRITICAL: "CRITICAL",
    FATAL: "FATAL"
  },

  log: function(message, level) {
    if(typeof level === 'undefined') { level = this.LOGLEVEL.INFO; }

    var d = new Date;
    var dformat = [d.getMonth()+1,
               d.getDate(),
               d.getFullYear()].join('/')+' '+
              [d.getHours(),
               d.getMinutes(),
               d.getSeconds()].join(':');
    var message = "[" + level + "]" + "<" + dformat + "> " + message
    console.log(message);
    if(level == this.LOGLEVEL.FATAL) { throw message; }
  }
}
