"use strict";

let fs = require("fs");
let path = require("path");
let reporter = require("tap-mocha-reporter");
let tap = require("tap");

tap.unpipe(process.stdout);
tap.pipe(reporter("classic"));

fs.readdirSync(path.join(__dirname, "../tests")).filter(function(file) {
   return /\.js$/.test(file);
}).map(function(file) {
   return path.join(__dirname, "../tests", file);
}).forEach(function(file) {
   tap.spawn(process.execPath, [file], process.env, file, {
      file: file
   });
});
