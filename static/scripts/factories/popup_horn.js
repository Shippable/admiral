(function () {
  'use strict';

  admiral.factory('popup_horn', ['notify', popup_horn]);

  function popup_horn(notify) {
    notify.config({
      maximumOpen: 1,
      startTop: 75
    });

    return {
      error: function (message) {
        notify({
          message: message,
          duration: -1,
          position: getPosition(),
          classes: ['alert-danger']
        });
      },

      warn: function (message) {
        notify({
          message: message,
          position: getPosition(),
          classes: ['alert-warning']
        });
      },

      success: function (message) {
        notify({
          message: message,
          position: getPosition(),
          classes: ['alert-success']
        });
      },

      info: function (message) {
        notify({
          message: message,
          position: getPosition(),
          classes: ['alert-info']
        });
      },

      infoHtml: function (message, scope) {
        notify({
          duration: -1,
          messageTemplate: message,
          position: getPosition(),
          scope: scope,
          classes: ['alert-info']
        });
      },

      closeAll: function () {
        notify.closeAll();
      }
    };
  }
  function getPosition() {
    return window.innerWidth > 1300 ? 'center' : 'right';
  }
}());
