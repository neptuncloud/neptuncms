"use strict";

let fs = require("fs");
let path = require("path");
let uglify = require("uglify-js");

let result = uglify.minify(path.join(__dirname, "../dist/vsphere.js"), {
   output: {
      comments: /VMware/
   }
});
fs.writeFileSync(path.join(__dirname, "../dist/vsphere.min.js"), result.code);
