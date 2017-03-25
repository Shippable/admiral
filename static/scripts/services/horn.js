(function () {
  'use strict';

  admiral.factory('horn', ['$rootScope', '$timeout', horn]);

  function horn($rootScope, $timeout) {
    // Alert message container
    $rootScope.horns = [];

    var apiError = function (errObj) {
      var message = '(Id: ' + errObj.id + ') ' + errObj.message;
      var err = '<div class="ship-break-words">';
      err += errObj.logType + ': ' + errObj.methodName;
      if (errObj.link)
        err += '<br/>' + JSON.stringify(errObj.link);
      message += err + '</div>';
      return message;
    };

    var removeMessage = function (msgObj) {
      var msgPos = $rootScope.horns.indexOf(msgObj);
      if (msgPos === -1) return false;
      $rootScope.horns.splice(msgPos, 1);
      return true;
    };

    var addMessage = function (msgObj) {
      var hornMsg = {};
      if (!msgObj) return false;
      if (typeof msgObj === 'string') {
        hornMsg.message = msgObj;
        hornMsg.type = 'info';
        hornMsg.timeout = 3000;
      } else {
        if (!msgObj.message) return false;
        hornMsg = msgObj;
      }
      if (typeof hornMsg.message === 'object')
        hornMsg.message = JSON.stringify(hornMsg.message);

      $rootScope.horns.push(hornMsg);
      if (hornMsg.timeout)
        $timeout(removeMessage.bind(null, hornMsg), hornMsg.timeout);
      return hornMsg;
    };

    $rootScope.removeHornMessage = function (msgObj) {
      return removeMessage(msgObj);
    };
    $rootScope.hornMessageStyle = function (msgObj) {
      if (msgObj.type === 'success')
        return 'alert-success';

      if (msgObj.type === 'info')
        return 'alert-info';

      if (msgObj.type === 'error')
        return 'alert-danger';

      if (msgObj.type === 'warning')
        return 'alert-warning';

      return 'alert-info';
    };

    return {
      add: function (msgObj) {
        return addMessage(msgObj);
      },
      success: function (mes) {
        var msgObj = {
          message: mes,
          type: 'success',
          timeout: 3000
        };
        return addMessage(msgObj);
      },
      info: function (mes) {
        var msgObj = {
          message: mes,
          type: 'info',
          timeout: 3000
        };
        return addMessage(msgObj);
      },
      warn: function (mes) {
        var msgObj = {
          message: mes,
          type: 'warning',
          timeout: 3000
        };
        return addMessage(msgObj);
      },
      error: function (mes) {
        var msgObj = {
          message: mes,
          type: 'error'
        };
        if (typeof mes === 'object' && mes.id)
          msgObj.message = apiError(mes);
        return addMessage(msgObj);
      },
      remove: function (msgObj) {
        return removeMessage(msgObj);
      },
      clear: function () {
        $rootScope.horns = [];
      }
    };
  }
}());
