"use strict";

let path = require("path");
let typedoc = require("typedoc");

let app = new typedoc.Application({
   entryPoint: "vsphere",
   includeDeclarations: true,
   mode: "file",
   name: "vSphere SDK for JavaScript",
   readme: "none",
   target: "ES6",
   theme: "scripts/docs"
});
app.generateDocs(app.convert([path.join(__dirname, "../dist/vsphere.d.ts")]),
      path.join(__dirname, "../docs"));
