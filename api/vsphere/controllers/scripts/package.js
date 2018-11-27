"use strict";

let child = require("child_process");
let fs = require("fs");
let pkg = require("../package.json");
let path = require("path");
let tarfs = require("tar-fs");
let tarstream = require("tar-stream");
let zlib = require("zlib");

function fork(script) {
   return new Promise(function(resolve) {
      var module = path.join(__dirname, script);
      child.fork(module).on("close", function(code) {
         if (code !== 0) {
            process.exit(code);
         }
         resolve();
      });
   });
}

fork("clear.js").then(function() {
   return fork("lint.js");
}).then(function() {
   return fork("test.js");
}).then(function() {
   // Run the tests with cached metadata
   return fork("test.js");
}).then(function() {
   return fork("declarations.js");
}).then(function() {
   return fork("docs.js");
}).then(function() {
   return fork("minify.js");
}).then(function() {
   let name = pkg.name + "-" + pkg.version;
   let pack = tarstream.pack();
   pack.entry({
      name: "package/package.json"
   }, JSON.stringify({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      keywords: pkg.keywords,
      license: pkg.license,
      author: pkg.author,
      contributors: pkg.contributors,
      main: pkg.main,
      types: pkg.types,
      dependencies: pkg.dependencies,
      browser: pkg.browser
   }, null, 3));
   tarfs.pack(path.join(__dirname, ".."), {
      entries: [
         "dist",
         "LICENSE"
      ],
      ignore: function(name) {
         return /\.DS_Store$/.test(name);
      },
      map: function(header) {
         header.name = "package/" + header.name;
         return header;
      },
      pack: pack
   }).pipe(zlib.createGzip()).pipe(fs.createWriteStream(name + ".tgz"));
   tarfs.pack(path.join(__dirname, ".."), {
      entries: [
         ".editorconfig",
         ".eslintignore",
         ".eslintrc",
         "definitions",
         "dist",
         "docs",
         "LICENSE",
         "package.json",
         "README.md",
         "samples",
         "scripts",
         "tests"
      ],
      ignore: function(name) {
         return /\.DS_Store$/.test(name);
      },
   }).pipe(zlib.createGzip()).pipe(fs.createWriteStream(name + "-src.tgz"));
});
