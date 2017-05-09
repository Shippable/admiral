'use strict';

var self = Adapter;
module.exports = self;

var _ = require('underscore');
var fs = require('fs');

function Adapter(batchSize, bufferTimeInterval) {
  this.who = util.format('Admiral|common|consoleAdapter');

  this.batchSize = batchSize || 5;
  this.componentBuffer = {};
  this.bufferTimeInterval = bufferTimeInterval || 3000;
  this.bufferTimer = {};
  this.pendingCalls = 0;
}

Adapter.prototype.publish = function (component, consoles) {
  var that = this;
  var messages = [];
  if (!_.isArray(that.componentBuffer[component]))
    that.componentBuffer[component] = [];
  if (!_.isArray(consoles))
    messages = [consoles];
  else messages = messages.concat(consoles);

  _.each(messages,
    function (line) {
      that.componentBuffer[component].push(line);
    }
  );

  that._postToLogFile(component, false);
};

Adapter.prototype._postToLogFile = function (component, forced) {
  var that = this;
  var who = that.who + '|_postToLogFile';

  if (that.componentBuffer[component].length > that.batchSize || forced) {
    if (that.bufferTimer[component]) {
      // If a timeout has been set for the buffer, clear it.
      clearTimeout(that.bufferTimer[component]);
      that.bufferTimer[component] = null;
    }

    var logFile = global.config.runtimeDir + '/logs/' + component + '.log';
    var consoles = that.componentBuffer[component].splice(0,
      that.componentBuffer[component].length);

    if (consoles.length === 0)
      return;

    var message = consoles.join('\n') + '\n';

    that.pendingCalls ++;
    fs.appendFile(logFile, message,
      function (err) {
        that.pendingCalls --;
        if (err)
          logger.error(who,
            'writing logs for ' + component + ' has failed:', err);
        logger.debug(who, 'succeeded');
      }
    );

  } else if (!that.bufferTimer[component]) {
    // Set a timeout that will clear the buffer in three seconds if nothing has.
    that.bufferTimer[component] = setTimeout(
      function () {
        this._postToLogFile(component, true);
      }.bind(that),
      that.bufferTimeInterval);
  }
};

Adapter.prototype.getPendingApiCallCount = function() {
  var that = this;
  return that.pendingCalls;
};
