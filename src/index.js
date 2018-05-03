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
    const values = output.split(sep);
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

function spawnGitLog(resourcePath, prettyFormat, middleOptions = []) {
  const options = [`log`]
    .concat(middleOptions)
    .concat([`--pretty=format:${prettyFormat}`, `--`, resourcePath]);
  const child = spawn.sync(`git`, options, {
    cwd: path.dirname(resourcePath)
  });

  return child.stdout.toString(`utf-8`);
}

function getCommitsLoader() {
  const options = loaderUtils.getOptions(this);
  const configuration = defaultsDeep(options, defaultOptions);

  /* Fast configuration validate */
  const validStructure = isObjectLike(configuration) &&
    Array.isArray(configuration.placeholders);

  if (!validStructure) {
    this.emitError(new TypeError(`Invalid git-commits-loader configuration`));
  }

  const prettyFormat = buildPrettyFormat(
    configuration.placeholders,
    configuration.formatSep
  );

  const commits = {};

  if (configuration.all) {
    const rawOutput = spawnGitLog(
      this.resourcePath,
      prettyFormat
    );

    commits.all = rawOutput
      .split(`\n`)
      .map(getCommitOutputParser(
        configuration.placeholders,
        configuration.formatSep
      ));
  }

  if (configuration.initial) {
    const rawOutput = spawnGitLog(
      this.resourcePath,
      prettyFormat,
      [`--diff-filter=A`, `-n 1`]
    );

    commits.initial = getCommitOutputParser(
      configuration.placeholders,
      configuration.formatSep
    )(rawOutput);
  }

  if (configuration.last) {
    const rawOutput = spawnGitLog(
      this.resourcePath,
      prettyFormat,
      [`-n 1`]
    );

    commits.last = getCommitOutputParser(
      configuration.placeholders,
      configuration.formatSep
    )(rawOutput);
  }

  return `module.exports = Object.assign(
    module.exports,
    ${JSON.stringify(commits)},
  )`;
}

module.exports = getCommitsLoader;