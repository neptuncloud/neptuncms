"use strict";

let eslint = require("eslint");
let path = require("path");

let cli = new eslint.CLIEngine();
let report = cli.executeOnFiles([path.join(__dirname, "..")]);
let errorResults = eslint.CLIEngine.getErrorResults(report.results);
if (errorResults.length !== 0) {
   let formatter = cli.getFormatter();
   console.log(formatter(report.results));
   process.exit(1);
}
