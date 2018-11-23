"use strict";

var path = require(`path`);
var spawn = require(`cross-spawn`);
var loaderUtils = require(`loader-utils`);
var isObjectLike = require(`lodash.isobjectlike`);
var zipObject = require(`lodash.zipobject`);
var defaultsDeep = require(`lodash.defaultsdeep`);
var babel = require(`babel-core`);
var defaultOptions = require(`./defaultOptions`);
/* Var fs = require(`fs`);
   Var logFile = fs.createWriteStream(`${__dirname}/debug.log`, { flags: `w` }); */

/* Babel repl */
function repl(code) {
  return babel.transform(code, {
    presets: [
      [
  require.resolve(`babel-preset-env`), {
        targets: {
          ie: 10
        }
      }
  ]
    ],
    ast: false,
    babelrc: false,
    comments: false,
    compact: true,
    filename: `md.chunk.js`,
    sourceType: `module`
  });
}

function getCommitOutputParser(placeholders, sep) {
  return function parseFormat(output) {
    if (!output.trim()) {
      /* Return false if there is no commit information */
      return false;
    }
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
  const result = `module.exports = Object.assign(
    module.exports,
    ${JSON.stringify(commits)},
  )`;
  return repl(result).code;
}

module.exports = getCommitsLoader;