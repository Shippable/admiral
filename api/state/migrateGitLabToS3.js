'use strict';

var self = migrateGitLabToS3;
module.exports = self;

var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var request = require('request');
var zlib = require('zlib');

var AWSAdapter = require('../../common/awsAdapter.js');

function migrateGitLabToS3(gitlabIntegration, amazonKeysIntegration, resource,
  isStateResource, apiAdapter, callback) {
  var bag = {
    resourceId: resource.id,
    resourceName: resource.name,
    subscriptionId: resource.subscriptionId,
    isStateResource: isStateResource,
    gitlabIntegration: gitlabIntegration,
    amazonKeysIntegration: amazonKeysIntegration,
    apiAdapter: apiAdapter,
    sshKeys: {},
    cloneTemplatePath: path.resolve(__dirname, './gitlab/cloneRepo.sh'),
    checkoutTemplatePath: path.resolve(__dirname, './gitlab/checkoutSHA.sh')
  };

  bag.who = util.format('state|%s|id:%s', self.name, bag.resourceId);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSubscriptionById.bind(null, bag),
      _generateCloneScript.bind(null, bag),
      _saveCloneScript.bind(null, bag),
      _executeCloneScript.bind(null, bag),
      _getRootBucket.bind(null, bag),
      _createAdapter.bind(null, bag),
      _getVersionCount.bind(null, bag),
      _migrate.bind(null, bag),
      _cleanupFiles.bind(null, bag)
    ],
    function (err) {
      logger.verbose(bag.who, 'Completed');
      if (err)
        logger.error(err);

      return callback();
    }
  );
}


function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.debug(who, 'Inside');

  if (!bag.resourceId)
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'parameter not found :resource')
    );

  if (!bag.gitlabIntegration)
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'parameter not found :gitlabIntegration')
    );

  if (!bag.amazonKeysIntegration)
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'parameter not found :amazonKeysIntegration')
    );

  var uniqueIdentifier = util.format('%s-%s', bag.subscriptionId, uuid.v4());

  bag.scriptLocation = util.format('/tmp/%s.sh', uniqueIdentifier);
  bag.cloneLocation = util.format('/tmp/%s', uniqueIdentifier);
  bag.pemFileLocation =  util.format('/tmp/%s.pem', uniqueIdentifier);

  return next();
}

function _getSubscriptionById(bag, next) {
  var who = bag.who + '|' + _getSubscriptionById.name;
  logger.debug(who, 'Inside');

  var query = util.format(
    'SELECT "propertyBag" FROM subscriptions WHERE id=\'%s\'',
    bag.subscriptionId);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find subscription ' + bag.subscriptionId +
            ' with error: ' + util.inspect(err))
        );

      if (!res.rows[0])
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No subscription found for id ' + bag.subscriptionId)
        );

      var propertyBag = JSON.parse(res.rows[0].propertyBag);

      bag.sshKeys.private = propertyBag.sshPrivateKey;
      bag.sshKeys.public = propertyBag.sshPublicKey;
      return next();
    }
  );
}

function _generateCloneScript(bag, next) {
  var who = bag.who + '|' + _generateCloneScript.name;
  logger.debug(who, 'Inside');

  var gitServerLocation = url.parse(bag.gitlabIntegration.data.url).hostname;
  var sshPort = bag.gitlabIntegration.data.sshPort || 22;

  var projectSshUrl =
    util.format('ssh://git@%s:%s/%s/%s.git', gitServerLocation,
      sshPort, bag.subscriptionId, bag.resourceName.toLowerCase());

  var templateObj = {
    projectSshUrl: projectSshUrl,
    cloneLocation: bag.cloneLocation,
    pemFileLocation: bag.pemFileLocation,
    privateKey: bag.sshKeys.private,
    sha: null
  };

  var scriptContent =
    fs.readFileSync(bag.cloneTemplatePath).toString();
  var template = _.template(scriptContent);
  bag.script = template(templateObj);
  logger.debug(
    util.format('Generated clone project script: %s', bag.script)
  );

  return next();

}

function _saveCloneScript(bag, next) {
  var who = bag.who + '|' + _saveCloneScript.name;
  logger.debug(who, 'Inside');

  fs.writeFile(bag.scriptLocation, bag.script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to write output script: ' + util.inspect(err))
        );

      fs.chmodSync(bag.scriptLocation, '755');
      logger.debug(
        util.format('Successfully saved project clone script for resource:',
          bag.resourceName)
      );
      return next();
    }
  );
}

function _executeCloneScript(bag, next) {
  var who = bag.who + '|' + _executeCloneScript.name;
  logger.debug(who, 'Inside');

  var exec = spawn(bag.scriptLocation, [], {});
  var errorMessages = [];

  exec.stderr.on('data',
    function (data)  {
      errorMessages.push(data.toString());
    }
  );

  exec.on('close',
    function (code) {
      if (code) {
        logger.warn(
          util.format('Failed to execute project clone script for ' +
            'resource with id %s and name %s with err %s',
              bag.resourceId, bag.resourceName, errorMessages
          )
        );

        return next(
          new ActErr(who, ActErr.DataNotFound,
            util.format('Failed to execute project clone script for ' +
              'resource with id %s and name %s with err %s',
                bag.resourceId, bag.resourceName, errorMessages
            )
          )
        );
      }
      return next();
    }
  );
}

function _getRootBucket(bag, next) {
  var who = bag.who + '|' + _getRootBucket.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "rootS3Bucket" from "systemSettings";';
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find rootS3Bucket setting with error: ' +
            util.inspect(err))
        );

      if (!_.isEmpty(res.rows) && !_.isEmpty(res.rows[0].rootS3Bucket))
        bag.rootS3Bucket = res.rows[0].rootS3Bucket;

      return next();
    }
  );
}

function _createAdapter(bag, next) {
  var who = bag.who + '|' + _createAdapter.name;
  logger.debug(who, 'Inside');

  var accessKey = bag.amazonKeysIntegration.data.accessKey;
  var secretKey = bag.amazonKeysIntegration.data.secretKey;

  if (_.isEmpty(accessKey))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'SystemIntegration.data.accessKey parameter ' +
        'not found for id: ' + bag.amazonKeysIntegration.id)
    );

  if (_.isEmpty(secretKey))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'SystemIntegration.data.secretKey parameter ' +
        'not found for id: ' + bag.amazonKeysIntegration.id)
    );

  bag.awsAdapter = new AWSAdapter(accessKey, secretKey);
  bag.awsAdapter.initialize(
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Initialize awsAdapter returned error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _getVersionCount(bag, next) {
  var who = bag.who + '|' + _getVersionCount.name;
  logger.verbose(who, 'Inside');

  var query = util.format(
    'SELECT COUNT(1) FROM versions WHERE "resourceId"=%s;', bag.resourceId);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to count versions for resourceId: ' + bag.resourceId +
            ' with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.versionCount = res.rows[0].count;

      return next();
    }
  );
}

function _migrate(bag, next) {
  var who = bag.who + '|' + _migrate.name;
  logger.verbose(who, 'Inside');

  var versionIdOffset = 0;

  async.whilst(
    function () {
      return versionIdOffset < bag.versionCount;
    },
    function (done) {
      var seriesBag = {
        who: who,
        resourceId: bag.resourceId,
        isStateResource: bag.isStateResource,
        subscriptionId: bag.subscriptionId,
        cloneLocation: bag.cloneLocation,
        scriptLocation: bag.scriptLocation,
        checkoutTemplatePath: bag.checkoutTemplatePath,
        awsAdapter: bag.awsAdapter,
        rootS3Bucket: bag.rootS3Bucket,
        versionIdOffset: versionIdOffset,
        pageLimit: 100,
        apiAdapter: bag.apiAdapter,
        versions: []
      };
      async.series([
          _listVersions.bind(null, seriesBag),
          _migrateVersions.bind(null, seriesBag)
        ],
        function (err) {
          versionIdOffset = versionIdOffset + 100;
          return done(err);
        }
      );

    },
    function (err) {
      return next(err);
    }
  );
}

function _listVersions(seriesBag, next) {
  var who = seriesBag.who + '|' + _migrateVersions.name;
  logger.debug(who, 'Inside');

  var query = util.format('SELECT id,"propertyBag","createdAt" FROM versions ' +
    'WHERE "resourceId"=%s ORDER BY id ASC LIMIT %s OFFSET %s;',
    seriesBag.resourceId, seriesBag.pageLimit, seriesBag.versionIdOffset);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find versions for resourceId: ' + seriesBag.resourceId +
            ' with error: ' + util.inspect(err))
        );

      seriesBag.versions = res.rows;
      return next();
    }
  );
}

function _migrateVersions(seriesBag, next) {
  var who = seriesBag.who + '|' + _migrateVersions.name;
  logger.debug(who, 'Inside');

  async.eachSeries(seriesBag.versions,
    function (version, done) {
      /* jshint maxcomplexity:15 */
      if (!version.propertyBag) return done();
      version.propertyBag = JSON.parse(version.propertyBag);

      var sha;
      if (seriesBag.isStateResource)
        sha = version.propertyBag.shaData;
      else
        sha = version.propertyBag.sha;
      if (!sha || sha === 'HEAD')
        return done();

      var createdDate = new Date(version.createdAt);
      var year = createdDate.getUTCFullYear();
      var month = createdDate.getUTCMonth() + 1;
      var day = createdDate.getUTCDate();
      var hours = createdDate.getUTCHours();
      var minutes = createdDate.getUTCMinutes();
      var seconds = createdDate.getSeconds();
      var milliseconds = createdDate.getMilliseconds();

      if (month < 10)
        month = '0' + month;

      if (day < 10)
        day = '0' + day;

      if (hours < 10)
        hours = '0' + hours;

      if (minutes < 10)
        minutes = '0' + minutes;

      if (seconds < 10)
        seconds = '0' + seconds;

      if (milliseconds < 10)
        milliseconds = '00' + milliseconds;
      else if (milliseconds < 100)
        milliseconds = '0' + milliseconds;

      var newSHA = util.format('%s%s%s-%s%s%s%s',
        year, month, day, hours, minutes, seconds, milliseconds);

      var subSeriesBag = {
        who: who,
        resourceId: seriesBag.resourceId,
        isStateResource: seriesBag.isStateResource,
        subscriptionId: seriesBag.subscriptionId,
        cloneLocation: seriesBag.cloneLocation,
        scriptLocation: seriesBag.scriptLocation,
        checkoutTemplatePath: seriesBag.checkoutTemplatePath,
        awsAdapter: seriesBag.awsAdapter,
        rootS3Bucket: seriesBag.rootS3Bucket,
        versionId: version.id,
        previousSHA: sha,
        newSHA: newSHA,
        propertyBag: version.propertyBag,
        allFilesPermissions: {},
        files: []
      };
      async.series([
          _generateCheckoutScript.bind(null, subSeriesBag),
          _saveCheckoutScript.bind(null, subSeriesBag),
          _executeCheckoutScript.bind(null, subSeriesBag),
          _getFilePaths.bind(null, subSeriesBag),
          _readFilePermissions.bind(null, subSeriesBag),
          _constructJson.bind(null, subSeriesBag),
          _generatePath.bind(null, subSeriesBag),
          _compressFiles.bind(null, subSeriesBag),
          _generateArtifactPutUrl.bind(null, subSeriesBag),
          _uploadCompressedFiles.bind(null, subSeriesBag),
          _updateVersion.bind(null, subSeriesBag)
        ],
        function (err) {
          if (err)
            logger.error(err);

          return done();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _generateCheckoutScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _generateCheckoutScript.name;
  logger.debug(who, 'Inside');

  var templateObj = {
    cloneLocation: seriesBag.cloneLocation,
    sha: seriesBag.previousSHA
  };

  var scriptContent =
    fs.readFileSync(seriesBag.checkoutTemplatePath).toString();
  var template = _.template(scriptContent);
  seriesBag.script = template(templateObj);
  logger.debug(util.format('Generated checkout SHA script: %s',
    seriesBag.script));

  return next();
}

function _saveCheckoutScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _saveCheckoutScript.name;
  logger.debug(who, 'Inside');

  fs.writeFile(seriesBag.scriptLocation, seriesBag.script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to write output script: ' + util.inspect(err))
        );

      fs.chmodSync(seriesBag.scriptLocation, '755');
      logger.debug(
        util.format('Successfully saved checkout SHA script for resource:',
          seriesBag.resourceId)
      );
      return next();
    }
  );
}

function _executeCheckoutScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _executeCheckoutScript.name;
  logger.debug(who, 'Inside');

  var exec = spawn(seriesBag.scriptLocation, [], {});
  var errorMessages = [];

  exec.stderr.on('data',
    function (data)  {
      errorMessages.push(data.toString());
    }
  );

  exec.on('close',
    function (code) {
      if (code) {
        logger.warn(
          util.format('Failed to execute checkout SHA script for ' +
            'resource with id %s and version %s with err %s',
              seriesBag.resourceId, seriesBag.versionId, errorMessages
          )
        );

        return next(
          new ActErr(who, ActErr.DataNotFound,
            util.format('Failed to execute checkout SHA script for ' +
              'resource with id %s and name %s with err %s',
                seriesBag.resourceId, seriesBag.versionId, errorMessages
            )
          )
        );
      }
      return next();
    }
  );
}

function _getFilePaths(seriesBag, next) {
  var who = seriesBag.who + '|' + _getFilePaths.name;
  logger.debug(who, 'Inside');

  seriesBag.allFilesLocation = getFileListRecursively(seriesBag.cloneLocation);
  return next();
}

function _readFilePermissions(seriesBag, next) {
  var who = seriesBag.who + '|' + _readFilePermissions.name;
  logger.debug(who, 'Inside');

  async.eachLimit(seriesBag.allFilesLocation, 10,
    function (fileLocation, nextFileLocation) {
      fs.stat(fileLocation,
        function (err, stats) {
          if (err)
            return nextFileLocation(
              new ActErr(who, ActErr.OperationFailed,
                'Failed to read file perms at location' + fileLocation, err)
            );
          var permission = parseInt(stats.mode);
          seriesBag.allFilesPermissions[fileLocation] = permission;
          return nextFileLocation();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _constructJson(seriesBag, next) {
  var who = seriesBag.who + '|' + _constructJson.name;
  logger.debug(who, 'Inside');

  async.eachLimit(seriesBag.allFilesLocation, 10,
    function (fileLocation, nextFileLocation) {
      fs.readFile(fileLocation,
        function (err, data) {
          if (err)
            return nextFileLocation(
              new ActErr(who, ActErr.OperationFailed,
                'Failed to read files at location' + fileLocation, err)
            );
          var obj = {
            permissions: seriesBag.allFilesPermissions[fileLocation],
            path: fileLocation.substring(seriesBag.cloneLocation.length,
              fileLocation.length),
            contents: data.toString()
          };

          seriesBag.files.push(obj);
          return nextFileLocation();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _generatePath(seriesBag, next) {
  var who = seriesBag.who + '|' + _generatePath.name;
  logger.debug(who, 'Inside');

  seriesBag.artifactPath =
    util.format('subscriptions/%s/resources/%s/%s-%s',
      seriesBag.subscriptionId, seriesBag.resourceId,
      seriesBag.newSHA.replace('-', '/'), 'state.gz');

  logger.debug('Generated artifacts path ' + seriesBag.artifactPath);

  return next();
}

function _compressFiles(seriesBag, next) {
  var who = seriesBag.who + '|' + _compressFiles.name;
  logger.debug(who, 'Inside');

  zlib.gzip(JSON.stringify(seriesBag.files),
    function (err, compressedFiles) {
      if (err) {
        logger.warn(who,
          util.format('Failed to compress files for versionId: %s',
            seriesBag.versionId), err
        );
        return next(
          new ActErr(who, ActErr.OperationFailed,
            util.format('Failed to compress files for versionId: %s',
              seriesBag.versionId))
        );
      }

      seriesBag.compressedFiles = compressedFiles;
      return next();
    }
  );
}

function _generateArtifactPutUrl(seriesBag, next) {
  var who = seriesBag.who + '|' + _generateArtifactPutUrl.name;
  logger.debug(who, 'Inside');

  var rootBucket = seriesBag.rootS3Bucket;
  var key = seriesBag.artifactPath;
  var expirationTimeSecs = 10 * 60;
  var additionalParams = {
    ContentType: 'application/javascript'
  };

  seriesBag.awsAdapter.S3.generatePUTUrl(
    rootBucket, key, expirationTimeSecs, additionalParams,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Generating PUT URL returned error: ' + util.inspect(err))
        );

      seriesBag.putURL = data;
      return next();
    }
  );
}

function _uploadCompressedFiles(seriesBag, next) {
  var who = seriesBag.who + '|' + _uploadCompressedFiles.name;
  logger.debug(who, 'Inside');

  var options = {
    method: 'PUT',
    url: seriesBag.putURL,
    body: seriesBag.compressedFiles,
    headers: {
      'Content-Type': 'application/javascript',
      'Content-Encoding': 'gzip'
    }
  };

  request(options,
    function (err, res, body) {
      var error = err || (res && res.statusCode > 299);
      if (error)
        logger.warn(who,
          util.format('Failed PUT %s for resourceId: %s with error: %s',
            seriesBag.putURL, seriesBag.resourceId, err || res.statusCode), body
        );

      return next(error);
    }
  );
}

function _updateVersion(seriesBag, next) {
  var who = seriesBag.who + '|' + _updateVersion.name;
  logger.debug(who, 'Inside');

  if (seriesBag.isStateResource)
    seriesBag.propertyBag.shaData = seriesBag.newSHA;
  else
    seriesBag.propertyBag.sha = seriesBag.newSHA;

  var propertyBag = JSON.stringify(seriesBag.propertyBag);

  var query = util.format(
    'UPDATE versions SET "propertyBag"=\'%s\' WHERE id=\'%s\'',
    propertyBag, seriesBag.versionId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update version ' + seriesBag.versionId +
            ' with error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _cleanupFiles(bag, next) {
  var who = bag.who + '|' + _cleanupFiles.name;
  logger.debug(who, 'Inside');

  var command = util.format('rm -rf %s %s %s', bag.cloneLocation,
    bag.scriptLocation, bag.pemFileLocation);

  exec(command,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to clean up files', err)
        );

      return next();
    }
  );
}

function getFileListRecursively(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];

  _.each(files,
    function (file) {
      if (file === '.git' || file.substr(0, 5) === '.git/')
        return;
      if (fs.statSync(dir + '/' + file).isDirectory())
        filelist = getFileListRecursively(dir + '/' + file, filelist);
      else
        filelist.push(dir + '/' + file);
    }
  );
  return filelist;
}
