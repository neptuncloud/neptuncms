"use strict";

let td = require("typedoc");

function DocsTheme(renderer, basePath) {
   td.output.DefaultTheme.call(this, renderer, basePath);
   renderer.plugins.assets.copyDefaultAssets = false;
   renderer.removePlugin("javascriptIndex");
}
DocsTheme.prototype = td.output.DefaultTheme.prototype;
DocsTheme.prototype.constructor = DocsTheme;
DocsTheme.prototype.isOutputDirectory = function() {
   return true;
};

exports = DocsTheme;
