(function () {
  'use strict';

  admiral.factory('statusCodes', [statusCodes]);

  function statusCodes() {
    var statusMap = {
      10: 'queued',
      20: 'processing',
      30: 'success',
      40: 'skipped',
      50: 'unstable',
      60: 'timeout',
      70: 'cancelled',
      80: 'failed',
      90: 'stopped',
      100: 'new',
      101: 'initialized',
      110: 'deleting',
      120: 'deleted',

      4000: 'queued',
      4001: 'processing',
      4002: 'success',
      4003: 'failed',
      4004: 'error',
      4005: 'queued',
      4006: 'cancelled',
      4007: 'unstable',
      4008: 'skipped'
    };

    var statusColorMap = {
      queued: '#58595b',
      processing: '#5183a0',
      success: '#8add6d',
      skipped: '#f8a97d',
      unstable: '#cea61b',
      timeout: '#a87073',
      cancelled: '#6bafbd',
      failed: '#dc5f59',
      new: '#58595b',
      initialized: '#f3ce85',
      default: '#a1abab',
      none: '#a1abab ',
      stopped: '#dc5f59'
    };
    var idle = createSubset([0, 10, 4000, 4005]);
    var processing = createSubset([20, 4001]);
    var incomplete = createSubset([0, 10, 20, 100, 101, 110, 4000, 4001, 4005]);
    var complete = createSubset([30, 40, 50, 60, 70, 80, 90, 4002, 4003, 4004,
      4006, 4007, 4008]);
    var successful = createSubset([30, 40, 90, 120, 4002]);
    var unsuccessful = createSubset([50, 60, 70, 80, 4003, 4004, 4006, 4007,
      4008]);
    var cancelled = createSubset([70, 4006]);
    var stopped = createSubset([90]);
    var notDeployed = createSubset([101]);
    var timeout = createSubset([60]);
    var skipped = createSubset([4008, 40]);

    function createSubset(codes) {
      var statusCodeSubset = {};
      statusCodeSubset.codes = codes;

      statusCodeSubset.lookup = function (code) {
        var found = false;
        for (var rep = 0; rep < statusCodeSubset.codes.length; rep++)
          if (code === statusCodeSubset.codes[rep])
            found = true;

        return found;
      };

      return statusCodeSubset;
    }

    return {
      statusMap: statusMap,
      isIdle: idle.lookup,
      isProcessing: processing.lookup,
      isIncomplete: incomplete.lookup,
      isTimedOut: timeout.lookup,
      isComplete: complete.lookup,
      isSuccessful: successful.lookup,
      isUnsuccessful: unsuccessful.lookup,
      isCancelled: cancelled.lookup,
      isStopped: stopped.lookup,
      isNotDeployed: notDeployed.lookup,
      isSkipped: skipped.lookup,

      badge: function (status) {
        var tempStatus = statusMap[status] ? statusMap[status] : 'default';
        return 'ship-badge-' + tempStatus;
      },
      btn: function (status) {
        var tempStatus = statusMap[status] ? statusMap[status] : 'default';
        return 'btn-' + tempStatus;
      },
      bg: function (status) {
        var tempStatus = statusMap[status] ? statusMap[status] : 'default';
        return 'ship-bg-' + tempStatus;
      },
      statusText: function (status) {
        return statusMap[status] ? statusMap[status] : 'default';
      },
      statusTextClass: function (status) {
        var tempStatus = statusMap[status] ? statusMap[status] : 'default';
        return 'ship-text-' + tempStatus;
      },
      getStatusColor: function (status) {
        var tempStatus = statusMap[status] ? statusMap[status] : 'default';
        return statusColorMap[tempStatus];
      }
    };
  }
}());
