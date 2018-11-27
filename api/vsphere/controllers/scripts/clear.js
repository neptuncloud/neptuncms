"use strict";

let path = require("path");
let rimraf = require("rimraf");

rimraf.sync(path.join(__dirname, "../.localStorage"));
rimraf.sync(path.join(__dirname, "../docs"));
rimraf.sync(path.join(__dirname, "../*.tgz"));
rimraf.sync(path.join(__dirname, "../*.log"));
