"use strict";

const DEFAULT_GIT_FORMAT_SEPARATOR = `-unrepraduciible-mil-GEV-3155-`;

/* Perry format to get author name, author email, and create date */
const DEFAULT_COMMIT_PROPERTIES = [`an`, `ae`, `at`];

module.exports = {
  /* Array of placeholders, which should be parsed from git log */
  placeholders: DEFAULT_COMMIT_PROPERTIES,

  /* Get initial commit */
  initial: true,

  /* Get last commit */
  last: true,

  /* Get all commits */
  all: false,

  /* Seprator for pretty format */
  formatSep: DEFAULT_GIT_FORMAT_SEPARATOR,

  /* Iglify code */
  uglify: false
};