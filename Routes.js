'use strict';

var self = Routes;
module.exports = self;

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var shipError = require('./common/shipError.js');
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
    initExpressMiddleware.bind(null, bag),
    initHelperRoutes.bind(null, bag)
  ],
    function () {
      logger.verbose(bag.who, 'Completed');
    }
  );
}

function initExpressMiddleware(bag, next) {
  var who = bag.who + '|' + initExpressMiddleware.name;
  logger.debug(who, 'Inside');

  // bag.app.use(favicon('./common/favicon.ico'));
  bag.app.use(bodyParser.json({
    limit: '10mb'
  }));
  bag.app.use(bodyParser.urlencoded({
    extended: true
  }));
  bag.app.use(methodOverride());

  // Views config
  bag.app.engine('html', require('ejs').renderFile);
  bag.app.set('view engine', 'html');

  // Serve static files
  bag.app.use(express.static(path.join(__dirname, '/static')));

  return next();
}

function initHelperRoutes(bag, next) {
  var who = bag.who + '|' + initHelperRoutes.name;
  logger.debug(who, 'Inside');
  // Base domain will authenticate and
  // send page based on cookie data
  bag.app.get('/',
    function (req, res) {
      res.render(path.resolve('static/login.html'), {},
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
      res.redirect('/');
    }
  );

  return next();
}
