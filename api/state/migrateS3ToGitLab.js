'use strict';

var self = migrateS3ToGitLab;
module.exports = self;

var fs = require('fs-extra');
var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var request = require('request');

var AWSAdapter = require('../../common/awsAdapter.js');
var GitLabAdapter = require('../../common/GitLabAdapter.js');

function migrateS3ToGitLab(amazonKeysIntegration, gitlabIntegration, resource,
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
    pushTemplatePath: path.resolve(__dirname, './gitlab/pushRepo.sh')
  };

  bag.who = util.format('state|%s|id:%s', self.name, bag.resourceId);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSubscriptionById.bind(null, bag),
      _createGitLabAdapter.bind(null, bag),
      _getNamespaceId.bind(null, bag),
      _createProject.bind(null, bag),
      _generateCloneScript.bind(null, bag),
      _saveCloneScript.bind(null, bag),
      _executeCloneScript.bind(null, bag),
      _getRootBucket.bind(null, bag),
      _createAWSAdapter.bind(null, bag),
      _getVersionCount.bind(null, bag),
      _migrate.bind(null, bag),
      _cleanupFiles.bind(null, bag)
    ],
    function (err) {
      logger.verbose(bag.who, 'Completed');
      if (err)
        logger.error(err);

      return callback(err);
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
  bag.shaFilePath = util.format('/tmp/%s.sha', uniqueIdentifier);

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
      bag.username = propertyBag.nodeUserName;
      bag.password = propertyBag.nodePassword;
      return next();
    }
  );
}

function _createGitLabAdapter(bag, next) {
  var who = bag.who + '|' + _createGitLabAdapter.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter = new GitLabAdapter(null,
    bag.gitlabIntegration.data.url, bag.username, bag.password);
  bag.gitlabAdapter.initialize(
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'initialize returned error ' + err + ' with body ' + body)
        );

      return next();
    }
  );
}

function _getNamespaceId(bag, next) {
  var who = bag.who + '|' + _getNamespaceId.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter.getNamespaces(
    function (err, namespaces) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'getNamespaces returned error', err)
        );

      if (_.isEmpty(namespaces))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'getNamespaces returned no namespaces')
        );

      var namespace = _.findWhere(namespaces, {kind: 'group'});

      if (!namespace)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'getNamespaces returned no namespace of kind group for ' +
              'subscriptionId: ' + bag.subscriptionId)
        );

      bag.projectNamespaceId = namespace.id;
      return next();
    }
  );
}

function _createProject(bag, next) {
  var who = bag.who + '|' + _createProject.name;
  logger.debug(who, 'Inside');

  var path = bag.resourceName.toLowerCase();
  bag.gitlabAdapter.postProject(bag.resourceName, path,
    bag.gitlabAdapter.visibilityLevels.PRIVATE, bag.projectNamespaceId,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postProject returned error with status code ' + err +
            'with body ' + util.inspect(body))
        );

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

function _createAWSAdapter(bag, next) {
  var who = bag.who + '|' + _createAWSAdapter.name;
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
        pushTemplatePath: bag.pushTemplatePath,
        awsAdapter: bag.awsAdapter,
        rootS3Bucket: bag.rootS3Bucket,
        pemFileLocation: bag.pemFileLocation,
        privateKey: bag.sshKeys.private,
        shaFilePath: bag.shaFilePath,
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

      var subSeriesBag = {
        who: who,
        resourceId: seriesBag.resourceId,
        isStateResource: seriesBag.isStateResource,
        subscriptionId: seriesBag.subscriptionId,
        cloneLocation: seriesBag.cloneLocation,
        scriptLocation: seriesBag.scriptLocation,
        pushTemplatePath: seriesBag.pushTemplatePath,
        awsAdapter: seriesBag.awsAdapter,
        rootS3Bucket: seriesBag.rootS3Bucket,
        pemFileLocation: seriesBag.pemFileLocation,
        privateKey: seriesBag.privateKey,
        shaFilePath: seriesBag.shaFilePath,
        versionId: version.id,
        previousSHA: sha,
        newSHA: null,
        propertyBag: version.propertyBag,
        files: []
      };
      async.series([
          _generateArtifactGetUrl.bind(null, subSeriesBag),
          _downloadGzipState.bind(null, subSeriesBag),
          _writeFiles.bind(null, subSeriesBag),
          _generatePushScript.bind(null, subSeriesBag),
          _savePushScript.bind(null, subSeriesBag),
          _pushFiles.bind(null, subSeriesBag),
          _getLatestSha.bind(null, subSeriesBag),
          _removeShaFile.bind(null, subSeriesBag),
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

function _generateArtifactGetUrl(seriesBag, next) {
  var who = seriesBag.who + '|' + _generateArtifactGetUrl.name;
  logger.debug(who, 'Inside');

  seriesBag.artifactPath = util.format('subscriptions/%s/resources/%s/%s-%s',
    seriesBag.subscriptionId, seriesBag.resourceId,
    seriesBag.previousSHA.replace('-', '/'), 'state.gz');

  var rootBucket = seriesBag.rootS3Bucket;
  var key = seriesBag.artifactPath;
  var expirationTimeSecs = 10 * 60;

  seriesBag.awsAdapter.S3.generateGETUrl(
    rootBucket, key, expirationTimeSecs,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Generating GET URL returned error: ' + util.inspect(err))
        );

      seriesBag.getURL = data;
      return next();
    }
  );
}

function _downloadGzipState(seriesBag, next) {
  var who = seriesBag.who + '|' + _downloadGzipState.name;
  logger.debug(who, 'Inside');

  var options = {
    url: seriesBag.getURL,
    gzip: true,
    json: true
  };

  request.get(options,
    function (err, res, data) {
      if (err || res.statusCode !== 200) {
        logger.warn(
          util.format('Failed to get state for path %s',
          seriesBag.artifactPath)
        );

        return next(
          new ActErr(who, ActErr.DataNotFound,
            util.format('Failed to get state for path %s',
            seriesBag.artifactPath)
          )
        );
      }

      seriesBag.files = data;
      return next();
    }
  );
}


function _writeFiles(seriesBag, next) {
  var who = seriesBag.who + '|' + _writeFiles.name;
  logger.debug(who, 'Inside');

  async.retry({ times: 5,
    interval: function(retryCount) {
        return 1000 * Math.pow(2, retryCount);
      }
    },
    function (callback) {
      async.eachLimit(seriesBag.files, 10,
        function (file, nextFile) {
          // Ignore all .git, .git/* files
          if (file.path === '.git' || file.path.substr(0, 5) === '.git/')
            return nextFile();

          var filePath = util.format('%s/%s',
            seriesBag.cloneLocation, file.path);
          fs.outputFile(filePath, file.contents,
            function (err) {
              if (err) {
                new ActErr(who, ActErr.OperationFailed,
                  'Failed to create file for resource: ' + seriesBag.resourceId,
                  err);
                return nextFile(err);
              }

              if (file.permissions) {
                fs.chmod(filePath, file.permissions,
                  function (err) {
                    if (err)
                      return nextFile(
                        new ActErr(who, ActErr.OperationFailed,
                          'Failed to set permission of file for id: ' +
                          seriesBag.resourceId, err)
                      );

                    return nextFile();
                  }
                );
              } else {
                return nextFile();
              }
            }
          );
        },
        function (err) {
          return callback(err);
        }
      );
    },
    function (shouldRetry, err) {
      return next(err);
    }
  );
}

function _generatePushScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _generatePushScript.name;
  logger.debug(who, 'Inside');

  var pushTemplatePayload = {
    privateKey: seriesBag.privateKey,
    cloneLocation: seriesBag.cloneLocation,
    pemFilePath: seriesBag.pemFileLocation,
    shaFilePath: seriesBag.shaFilePath,
    subscriptionEmail: seriesBag.subscriptionId + '@test.com',
    subscriptionName: seriesBag.subscriptionId,
    commitMessage: seriesBag.resourceId
  };

  var scriptContent =
    fs.readFileSync(seriesBag.pushTemplatePath).toString();
  var template = _.template(scriptContent);
  seriesBag.script = template(pushTemplatePayload);

  return next();
}

function _savePushScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _savePushScript.name;
  logger.debug(who, 'Inside');

  fs.writeFile(seriesBag.scriptLocation, seriesBag.script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to write output script: ' + util.inspect(err))
        );

      fs.chmodSync(seriesBag.scriptLocation, '755');
      return next();
    }
  );
}

function _pushFiles(seriesBag, next) {
  var who = seriesBag.who + '|' + _pushFiles.name;
  logger.debug(who, 'Inside');

  async.retry({ times: 5,
    interval: function(retryCount) {
        return 1000 * Math.pow(2, retryCount);
      }
    },
    function (callback) {
      var exec = spawn(seriesBag.scriptLocation, [], {});
      var errorMessages = [];

      exec.stderr.on('data',
        function (data) {
          errorMessages.push(data.toString());
        }
      );

      exec.on('close',
        function (code)  {
          if (code) {
            return callback(
              new ActErr(who, ActErr.OperationFailed,
                'Executing push script failed for id: ' +
                seriesBag.resourceId, errorMessages
              )
            );
          }

          return callback();
        }
      );
    },
    function (shouldRetry, err) {
      return next(err);
    }
  );
}

function _getLatestSha(bag, next) {
  var who = bag.who + '|' + _getLatestSha.name;
  logger.debug(who, 'Inside');

  fs.readFile(bag.shaFilePath,
    function (err, sha) {
      if (err)
        bag.newSHA = '';
      else
        bag.newSHA = _.first(sha.toString().split('\n'));

      return next();
    }
  );
}

function _removeShaFile(bag, next) {
  var who = bag.who + '|' + _removeShaFile.name;
  logger.debug(who, 'Inside');

  var command = util.format('rm -rf %s', bag.shaFilePath);

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
