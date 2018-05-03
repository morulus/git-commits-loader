"use strict";

var path = require(`path`);
var spawn = require(`cross-spawn`);
var loaderUtils = require(`loader-utils`);
var isObjectLike = require(`lodash.isobjectlike`);
var zipObject = require(`lodash.zipobject`);
var defaultsDeep = require(`lodash.defaultsdeep`);
var defaultOptions = require(`./defaultOptions`);

function getCommitOutputParser(placeholders, sep) {
  return function parseFormat(output) {
    var values = output.split(sep);
    return zipObject(placeholders, values);
  };
}

function addPercentSymbol(str) {
  return `%${str}`;
}

/* Converts array to pretty format query */
function buildPrettyFormat(placeholders, sep) {
  return placeholders.map(addPercentSymbol).join(sep);
}

function spawnGitLog(resourcePath, prettyFormat) {
  var middleOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  var options = [`log`].concat(middleOptions).concat([`--pretty=format:${prettyFormat}`, `--`, resourcePath]);
  var child = spawn.sync(`git`, options, {
    cwd: path.dirname(resourcePath)
  });

  return child.stdout.toString(`utf-8`);
}

function getCommitsLoader() {
  var options = loaderUtils.getOptions(this);
  var configuration = defaultsDeep(options, defaultOptions);

  /* Fast configuration validate */
  var validStructure = isObjectLike(configuration) && Array.isArray(configuration.placeholders);

  if (!validStructure) {
    this.emitError(new TypeError(`Invalid git-commits-loader configuration`));
  }

  var prettyFormat = buildPrettyFormat(configuration.placeholders, configuration.formatSep);

  var commits = {};

  if (configuration.all) {
    var rawOutput = spawnGitLog(this.resourcePath, prettyFormat);

    commits.all = rawOutput.split(`\n`).map(getCommitOutputParser(configuration.placeholders, configuration.formatSep));
  }

  if (configuration.initial) {
    var _rawOutput = spawnGitLog(this.resourcePath, prettyFormat, [`--diff-filter=A`, `-n 1`]);

    commits.initial = getCommitOutputParser(configuration.placeholders, configuration.formatSep)(_rawOutput);
  }

  if (configuration.last) {
    var _rawOutput2 = spawnGitLog(this.resourcePath, prettyFormat, [`-n 1`]);

    commits.last = getCommitOutputParser(configuration.placeholders, configuration.formatSep)(_rawOutput2);
  }

  return commits;
}

module.exports = getCommitsLoader;