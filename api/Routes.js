'use strict';

var self = Routes;
module.exports = self;

var shipError = require('../common/shipError.js');
var path = require('path');

// Utils
var async = require('async');

function Routes(app) {
  var bag = {
    app: app,
    who: 'Routes'
  };
  logger.verbose(bag.who, 'Starting');

  async.series([
    initHelperRoutes.bind(null, bag)
  ],
    function () {
      logger.verbose(bag.who, 'Completed');
    }
  );
}

function initHelperRoutes(bag, next) {
  var who = bag.who + '|' + initHelperRoutes.name;
  logger.debug(who, 'Inside');
  // Base domain will authenticate and
  // send page based on cookie data

  bag.app.get('/login',
    function (req, res) {
      res.cookie('admiralUrl', req.protocol + '://' + req.get('host'));

      var opts = {};
      res.render(path.resolve('static/app.html'), opts,
        function (err, html) {
          if (err) {
            shipError(err.stack);
            res.status(500).send('Internal Error. See logs');
          }
          res.send(html);
        }
      );
    }
  );

  bag.app.get('*',
    function (req, res) {
      if (!req.cookies.loginToken)
        return res.redirect('/login');

      var opts = {};
      res.render(path.resolve('static/app.html'), opts,
        function (err, html) {
          if (err) {
            shipError(err.stack);
            res.status(500).send('Internal Error. See logs');
          }
          res.send(html);
        }
      );
    }
  );

  return next();
}
