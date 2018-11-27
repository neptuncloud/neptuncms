"use strict";

let fs = require("fs");
let path = require("path");

let info = {
   cisService: {
      prefixes: {
         applmgmt: "com.vmware.appliance",
         builtin: "BUILTIN",
         cis: "com.vmware.cis",
         content: "com.vmware.content",
         ovf: "com.vmware.vcenter.ovf",
         tagging: "com.vmware.cis.tagging",
         vapi: "com.vmware.vapi",
         vcenter: "com.vmware.vcenter"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Object",
         "deserializeObject(obj: Object)": "Object",
         "getSecurityContext()": "Object",
         "setSecurityContext(securityContext: Object)": "void",
         "uuid()": "string"
      }
   },
   integrityService: {
      prefixes: {
         integrity: "urn:integrity",
         integrityPort: "urn:integrityService",
         vim: "urn:vim25",
         xs: "http://www.w3.org/2001/XMLSchema"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Node",
         "deserializeObject(obj: Node)": "Object",
         serviceInstance: "integrityService.vim.ManagedObjectReference",
         serviceContent: "integrityService.integrity.VcIntegrityContent"
      }
   },
   srmService: {
      prefixes: {
         srm: "urn:srm0",
         srmPort: "urn:srm0Service",
         vim: "urn:vim25",
         xs: "http://www.w3.org/2001/XMLSchema"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Node",
         "deserializeObject(obj: Node)": "Object",
         serviceInstance: "srmService.vim.ManagedObjectReference",
         serviceContent: "srmService.srm.SrmServiceInstanceContent"
      }
   },
   stsService: {
      prefixes: {
         del: "urn:oasis:names:tc:SAML:2.0:conditions:delegation",
         dsig: "http://www.w3.org/2000/09/xmldsig#",
         saml: "urn:oasis:names:tc:SAML:2.0:assertion",
         smle: "http://www.rsa.com/names/2009/12/std-ext/SAML2.0",
         smlp: "http://www.rsa.com/names/2010/04/std-prof/SAML2.0",
         stsPort: "http://docs.oasis-open.org/ws-sx/ws-trust/200512/wsdl",
         wsa: "http://www.w3.org/2005/08/addressing",
         wsse: "http://docs.oasis-open.org/wss/2004/01/" +
               "oasis-200401-wss-wssecurity-secext-1.0.xsd",
         wst13: "http://docs.oasis-open.org/ws-sx/ws-trust/200512",
         wst14: "http://docs.oasis-open.org/ws-sx/ws-trust/200802",
         wsta: "http://www.rsa.com/names/2009/12/std-ext/" +
               "WS-Trust1.4/advice",
         wsu: "http://docs.oasis-open.org/wss/2004/01/" +
               "oasis-200401-wss-wssecurity-utility-1.0.xsd",
         xs: "http://www.w3.org/2001/XMLSchema"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Node",
         "deserializeObject(obj: Node)": "Object"
      }
   },
   vimService: {
      prefixes: {
         vim: "urn:vim25",
         vimPort: "urn:vim25Service",
         xs: "http://www.w3.org/2001/XMLSchema"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Node",
         "deserializeObject(obj: Node)": "Object",
         serviceInstance: "vimService.vim.ManagedObjectReference",
         serviceContent: "vimService.vim.ServiceContent"
      }
   },
   vsanhealthService: {
      prefixes: {
         vim: "urn:vim25",
         vsanhealthPort: "urn:vim25Service",
         xs: "http://www.w3.org/2001/XMLSchema"
      },
      properties: {
         "addHandler(handler: Function)": "void",
         "removeHandler(handler: Function)": "void",
         "serializeObject(obj: Object, name: string)": "Node",
         "deserializeObject(obj: Node)": "Object"
      }
   }
};

function keys(obj) {
   return Object.keys(obj);
}

function formatName(str) {
   return str.replace(/[^_]_[^_]/g, function(match) {
      return match.charAt(0) + match.charAt(2).toUpperCase();
   });
}

function toCamelCase(str) {
   return formatName(str).replace(/[^.]+$/, function(match) {
      return match.charAt(0).toLowerCase() + match.substr(1);
   });
}

function toPascalCase(str) {
   return formatName(str).replace(/[^.]+$/, function(match) {
      return match.charAt(0).toUpperCase() + match.substr(1);
   });
}

function isArray(obj) {
   return /^ArrayOf/.test(obj.name) || obj.maxOccurs === "unbounded";
}

function isOptional(name) {
   return name === "OPTIONAL";
}

function isBuiltInType(name) {
   return name === "any" || name === "boolean" || name === "Date" ||
         name === "number" || name === "string";
}

function getNamespacePrefix(key, namespace) {
   return keys(info[key].prefixes).find(function(name) {
      return (info[key].prefixes[name] === namespace);
   });
}

function getTypeName(key, arr) {
   let namespace = metadata[key].namespaces[arr[0]];
   let typeName = namespace.types[arr[1]];
   let obj = getTypeObj(key, arr) || {};
   let container = obj.container;
   if (container) {
      let containerName =
            metadata[key].namespaces[container[0]].types[container[1]];
      typeName = typeName.replace(containerName, toPascalCase(containerName));
   }
   typeName = typeName.replace(namespace.name + ".", "");
   let namespacePrefix = getNamespacePrefix(key, namespace.name);
   if (namespacePrefix) {
      return toPascalCase(key + "." + namespacePrefix + "." + typeName);
   }
   return toPascalCase(typeName);
}

function getSignatureName(key, obj) {
   let typeName = getTypeName(key, obj.type);
   switch (typeName.split(".").pop()) {
      case "AnyType":
         return isArray(obj) ? "Array<any>" : "any";
      case "AnyURI":
      case "Base64Binary":
      case "ID":
      case "NCName":
      case "QName":
      case "String":
      case "BINARY":
      case "SECRET":
      case "STRING":
      case "URI":
         return isArray(obj) ? "Array<string>" : "string";
      case "Boolean":
      case "BOOLEAN":
         return isArray(obj) ? "Array<boolean>" : "boolean";
      case "Byte":
      case "Double":
      case "Float":
      case "Int":
      case "Integer":
      case "Long":
      case "NegativeInteger":
      case "NonNegativeInteger":
      case "NonPositiveInteger":
      case "PositiveInteger":
      case "Short":
      case "UnsignedLong":
      case "DOUBLE":
      case "LONG":
         return isArray(obj) ? "Array<number>" : "number";
      case "DateTime":
      case "DATETIME":
         return isArray(obj) ? "Array<Date>" : "Date";
      case "VOID":
         return "void";
      case "LIST":
      case "SET":
         return "Array<" + getSignatureName(key, obj.typeElement) + ">";
      case "MAP":
         return "{ [K: string" + "]: " +
               getSignatureName(key, obj.typeValue) + " }";
      case "OPTIONAL":
         switch (getSignatureName(key, obj.typeElement)) {
            case "LIST":
            case "SET":
               return "Array<" + getSignatureName(key,
                     obj.typeElement.typeElement) + ">";
            case "MAP":
               return "{ [K: " + "string" + "]: " +
                     getSignatureName(key, obj.typeElement.typeValue) + " }";
            default:
               return getSignatureName(key, obj.typeElement);
         }
   }
   return isArray(obj) ? "Array<" + typeName + ">" : typeName;
}

function getOperationObj(key, arr) {
   return metadata[key].operations[arr[0]][arr[1]];
}

function getTypeObj(key, arr) {
   return metadata[key].types[arr[0]][arr[1]];
}

function getTypeProperties(key, arr) {
   let obj = getTypeObj(key, arr);
   let properties = [];
   if (obj !== undefined && !isArray(obj)) {
      let attrs = obj.attributes || [];
      let elements = obj.elements || [];
      let union = properties.concat(attrs, elements);
      properties = union.reduce(function(previous, prop) {
         if (prop.name && prop.type) {
            let propName = prop.name;
            let typeName = getTypeName(key, prop.type);
            let propIndex = previous.findIndex(function(prop) {
               return new RegExp("^" + propName + ":").test(prop);
            });
            let optionalPropIndex = previous.findIndex(function(prop) {
               return new RegExp("^" + propName + "\\?:").test(prop);
            });
            if (optionalPropIndex !== -1) {
               previous.splice(optionalPropIndex, 1);
            }
            if (propIndex === -1) {
               if (isOptional(typeName) || prop.minOccurs === "0") {
                  previous.push(propName + "?: " + getSignatureName(key, prop));
               } else {
                  previous.push(propName + ": " + getSignatureName(key, prop));
               }
            }
         }
         return previous;
      }, []);
   }
   if (obj === undefined ||
         (obj.base !== undefined && getTypeObj(key, obj.base) === undefined)) {
      properties.push("value: string");
   }
   return properties;
}

function getTypeConstants(key, arr) {
   let obj = getTypeObj(key, arr);
   let constants = [];
   if (obj !== undefined && !isArray(obj)) {
      constants = (obj.constants || []).reduce(function(previous, constant) {
         return previous.concat(constant.name + ": " +
               getSignatureName(key, constant));
      }, []);
   }
   return constants;
}

function getTypeEnumerations(key, arr) {
   let obj = getTypeObj(key, arr);
   let enumerations = [];
   if (obj !== undefined && !isArray(obj)) {
      enumerations = (obj.enumerations || []).reduce(function(previous, name) {
         return previous.concat("\"" + name + "\": string");
      }, []);
   }
   return enumerations;
}

let modules = {};
let metadata = {};
let localStorage = path.join(__dirname, "../.localStorage");
fs.readdirSync(localStorage).forEach(function(file) {
   let name = file.replace(/(%3A[^%]+)?(%2F[^%]+)$/, "");
   let data = fs.readFileSync(path.join(localStorage, file));
   metadata[name] = JSON.parse(data.toString());
});

keys(metadata).forEach(function(key) {
   modules[key] = {};
   metadata[key].namespaces.forEach(function(namespace, namespaceIndex) {
      let prefix = getNamespacePrefix(key, namespace.name);
      if (prefix == undefined) {
         return;
      }
      let data = {};
      namespace.operations.forEach(function(operation, operationIndex) {
         let arr = [namespaceIndex, operationIndex];
         let obj = getOperationObj(key, arr);
         let result = {};
         if (Array.isArray(obj[0])) { // JSONRPC
            result.parameters = obj[0].map(function(obj) {
               return toCamelCase(obj.name) + ": " + getSignatureName(key, obj);
            });
            if (obj[1].type) {
               result.value = getSignatureName(key, obj[1]);
            } else {
               result.value = "void";
            }
         } else { // SOAP
            if (obj[0].type) {
               let typeObj = getTypeObj(key, obj[0].type);
               if (typeObj && typeObj.attributes) {
                  result.parameters = [toCamelCase(obj[0].name) + ": " +
                        getTypeName(key, obj[0].type)];
               } else {
                  let properties = getTypeProperties(key, obj[0].type);
                  result.parameters = properties.map(function(prop) {
                     return prop.replace(/\?:/, ":");
                  });
               }
            } else {
               result.parameters = [];
            }
            if (obj[1].type) {
               let typeObj = getTypeObj(key, obj[0].type);
               if (typeObj && typeObj.attributes) {
                  result.value = getTypeName(key, obj[1].type);
               } else {
                  let value = getTypeProperties(key, obj[1].type);
                  if (value.length !== 0) {
                     result.value = value[0].replace(/returnval\??: /, "");
                  } else {
                     result.value = "void";
                  }
               }
            } else {
               result.value = "void";
            }
         }
         data[toCamelCase(operation)] = result;
      });
      namespace.services.forEach(function(service, typeIndex) {
         let arr = [namespaceIndex, typeIndex];
         Object.assign(data[toCamelCase(service)] || {}, {
            constants: getTypeConstants(key, arr)
         });
      });
      namespace.types.forEach(function(type, typeIndex) {
         let arr = [namespaceIndex, typeIndex];
         let obj = getTypeObj(key, arr);
         let result = {
            constants: getTypeConstants(key, arr),
            enumerations: getTypeEnumerations(key, arr),
            properties: getTypeProperties(key, arr)
         };
         if (obj) {
            if (obj.base !== undefined) {
               let baseName = getTypeName(key, obj.base);
               if (!isBuiltInType(baseName)) {
                  result.base = baseName;
               }
            }
            if (obj.container) {
               let containerName = metadata[key].namespaces
                     [obj.container[0]].types[obj.container[1]];
               type = type.replace(containerName, toPascalCase(containerName));
            }
         }
         data[toPascalCase(type)] = result;
      });
      keys(data).forEach(function(name) {
         let re = /RequestType$/;
         if (re.test(name) && data[name.replace(re, "Response")]) {
            delete data[name];
            delete data[name.replace(re, "Response")];
         }
         if (re.test(name) && data[name.replace(re, "TaskResponse")]) {
            delete data[name];
            delete data[name.replace(re, "TaskResponse")];
         }
      });
      let pattern = RegExp("^" + namespace.name + "\.");
      modules[key][prefix] = keys(data).reduce(function(previous, current) {
         let parts = current.replace(pattern, "").split(".");
         let value = data[current];
         let ref = previous;
         parts.forEach(function(part, index) {
            if (index + 1 === parts.length) {
               ref[part] = value;
            } else if (ref[part] === undefined) {
               ref[part] = {};
               ref = ref[part];
            } else {
               ref = ref[part];
            }
         });
         return previous;
      }, {});
   });
});

function getContentKeys(obj) {
   return keys(obj).filter(function(key) {
      return !/base|constants|enumerations|properties/.test(key);
   });
}

function getIndent(depth) {
   return new Array(depth).fill("   ").join("");
}

function getProperties(key, name, module, depth) {
   let buffer = [getIndent(depth) + name + ": {"];
   keys(module).forEach(function(moduleName) {
      let obj = module[moduleName];
      if (obj.value) {
         let parameters = obj.parameters;
         let value = obj.value;
         buffer.push(getIndent(depth + 1) + moduleName + "(" +
               parameters.join(", ") + "): Promise<" + value + ">;");
      } else if (obj.enumerations && obj.enumerations.length) {
         buffer.push(getIndent(depth + 1) + moduleName + ": {");
         obj.enumerations.forEach(function(enumeration) {
            buffer.push(getIndent(depth + 2) + enumeration + ";");
         });
         buffer.push(getIndent(depth + 1) + "};");
      } else if (obj.properties) {
         buffer.push(getIndent(depth + 1) + moduleName + ": {");
         buffer.push(getIndent(depth + 2) + "(options?: " +
               key + "." + name + "." + moduleName + "): " +
               key + "." + name + "." + moduleName + ";");
         obj.constants.forEach(function(constant) {
            buffer.push(getIndent(depth + 2) + constant + ";");
         });
         let keys = getContentKeys(obj);
         if (keys.length) {
            keys.forEach(function(name) {
               buffer.push(getIndent(depth + 2) + name + ": {");
               obj[name].enumerations.forEach(function(enumeration) {
                  buffer.push(getIndent(depth + 3) + enumeration + ";");
               });
               buffer.push(getIndent(depth + 2) + "}");
            });
         }
         buffer.push(getIndent(depth + 1) + "};");
      } else if (obj.constants) {
         buffer.push(getIndent(depth + 1) + moduleName + ": {");
         obj.constants.forEach(function(constant) {
            buffer.push(getIndent(depth + 2) + constant + ";");
         });
         buffer.push(getIndent(depth + 1) + "};");
      } else {
         buffer = buffer.concat(getProperties(key + "." + name,
               moduleName, obj, depth + 1));
      }
   });
   buffer.push(getIndent(depth) + "}");
   return buffer;
}

function getInterface(key, module, depth) {
   let buffer = [getIndent(depth) + "interface " + key + " {"];
   if (info[key]) {
      keys(info[key].properties).forEach(function(prop) {
         buffer.push(getIndent(depth + 1) + prop + ": " +
               info[key].properties[prop] + ";");
      });
      keys(module).forEach(function(name) {
         buffer = buffer.concat(getProperties(key, name,
               module[name], depth + 1));
      });
   } else {
      keys(module).forEach(function(name) {
         let properties = module[name].properties;
         if (module[name].value) {
            buffer.push(getIndent(depth + 1) + name + "(" +
                  module[name].parameters.join(", ") + "): Promise<" +
                  module[name].value + ">;");
         } else if (properties === undefined) {
            buffer.push(getIndent(depth + 1) + name + ": " +
                  key + "." + name + ";");
         }
      });
   }
   buffer.push(getIndent(depth) + "}");
   return buffer;
}

function getNamespace(key, module, depth) {
   let buffer = [getIndent(depth) + "namespace " + key + " {"];
   keys(module).forEach(function(name) {
      let base = module[name].base;
      let obj = module[name];
      if (obj.enumerations && obj.enumerations.length) {
         buffer.push(getIndent(depth + 1) + "enum " +  name + " {");
         obj.enumerations.forEach(function(enumeration) {
            buffer.push(getIndent(depth + 2) +
                  enumeration.replace(": string", "") + ",");
         });
         buffer.push(getIndent(depth + 1) + "}");
      } else if (obj.properties) {
         let ext = base !== undefined ? " extends " + base : "";
         buffer.push(getIndent(depth + 1) + "interface " +  name + ext + " {");
         obj.constants.forEach(function(constant) {
            buffer.push(getIndent(depth + 2) + constant + ";");
         });
         obj.properties.forEach(function(prop) {
            buffer.push(getIndent(depth + 2) + prop + ";");
         });
         buffer.push(getIndent(depth + 1) + "}");
         let keys = getContentKeys(obj);
         if (keys.length) {
            buffer.push(getIndent(depth + 1) + "namespace " + name + " {");
            keys.forEach(function(name) {
               buffer.push(getIndent(depth + 2) + "enum " +  name + " {");
               buffer.push(getIndent(depth + 3) +
                     obj[name].enumerations.map(function(enumeration) {
                        return enumeration.replace(": string", "");
                     }).join(", "));
               buffer.push(getIndent(depth + 2) + "}");
            });
            buffer.push(getIndent(depth + 1) + "}");
         }
      } else if (obj.constants && obj.constants.length) {
         let ext = base !== undefined ? " extends " + base : "";
         buffer.push(getIndent(depth + 1) + "interface " +  name + ext + " {");
         obj.constants.forEach(function(constant) {
            buffer.push(getIndent(depth + 2) + constant + ";");
         });
         buffer.push(getIndent(depth + 1) + "}");
      } else if (!obj.value && !obj.constants) {
         buffer = buffer.concat(getInterface(name, obj, depth + 1));
         buffer = buffer.concat(getNamespace(name, obj, depth + 1));
      }
   });
   buffer.push(getIndent(depth) + "}");
   return buffer;
}

let buffer = ["declare module vsphere {"];
keys(modules).forEach(function(key) {
   let optional = /integrityService|vsanhealthService/.test(key) ? "" : "?";
   buffer.push(getIndent(1) + "function " + key + "(hostname: string, " +
         "options" + optional + ": {" +
         "definitions" + optional + ": Array<string>; " +
         "debug?: boolean; " +
         "endpoint?: string; " +
         "key?: string; " +
         "port?: number; " +
         "prefixes?: boolean;" +
         "proxy?: boolean;" +
         "proxyHeader?: string;" +
         "}): Promise<vsphere." + key + ">;");
   buffer = buffer.concat(getInterface(key, modules[key], 1));
   buffer = buffer.concat(getNamespace(key, modules[key], 1));
});
buffer.push("}");

buffer.push("declare module \"vsphere\" {");
buffer.push("   export = vsphere;");
buffer.push("}");

fs.writeFileSync(path.join(__dirname, "../dist/vsphere.d.ts"),
      buffer.join("\n"));
