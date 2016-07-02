var path = require('path');
var fs = require('fs');

var MODULE_DIR = 'node_modules';

var licensePlugin = function(opts) {
  var errorMessages = {
    'no-pattern': 'license-webpack-plugin: Please specify a regular expression '
                + 'as the pattern property on the plugin options.'
  }
  this.errors = [];
  if(!opts || !opts.pattern || !(opts.pattern instanceof RegExp)) {
    this.errors.push(errorMessages['no-pattern']);
    throw errorMessages['no-pattern'];
  }
  this.pattern = opts.pattern;
  this.filename = opts.filename || '3rdpartylicenses.txt';
  this.modules = [];
  this.licenseOverrides = opts.licenseOverrides || {};
};

licensePlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin('done', function(stats) {
    var outputPath = compiler.outputPath;
    var context = compiler.context;
    var moduleMap = {};
    var moduleCache = {};
    var licenseCompilation = '';
    var moduleSuffix = new RegExp(path.sep + '.*$');
    stats.compilation.modules.forEach(function(mod) {
      var moduleName = mod.resource
        .replace(path.join(context, MODULE_DIR) + path.sep, '')
        .replace(moduleSuffix, '');
      moduleMap[moduleName] = {};
    });
    self.modules = Object.keys(moduleMap)
      .filter(function(mod) {
        var moduleInfo = getModuleInfo(context, mod, moduleCache);
        var isMatching = self.pattern.test(moduleInfo.license);
        if(isMatching) {
          moduleCache[mod] = moduleInfo;
        }
        return isMatching;
      })
      .map(function(mod) {
        return parseModuleInfo(context, mod, moduleCache[mod],
          self.licenseOverrides);
      });
    licenseCompilation = self.modules
      .reduce(function(prev, curr) {
        return prev + '\n\n' + formatLicenseOutput(curr);
      }, '')
      .replace('\n\n', '');
    fs.writeFileSync(path.join(outputPath, self.filename),
      licenseCompilation);
  });
};

function formatLicenseOutput(mod) {
  return mod.name + '@' + mod.version + '\n' + mod.licenseText;
}

function getLicenseText(context, mod, licenseOverrides) {
  var file = licenseOverrides[mod]
    || path.join(context, MODULE_DIR, mod, 'LICENSE');
  return fs.readFileSync(file).toString('utf8');
}

function readPackageJson(context, mod) {
  var pathName = path.join(context, MODULE_DIR, mod, 'package.json');
  var file = fs.readFileSync(pathName);
  return JSON.parse(file);
}

function parseModuleInfo(context, mod, packagejson, licenseOverrides) {
  return {
    name: mod,
    version: packagejson.version,
    license: packagejson.license,
    licenseText: getLicenseText(context, mod, licenseOverrides)
  };
}

function getModuleInfo(context, mod, moduleCache) {
  var packagejson = readPackageJson(context, mod);
  return packagejson;
}

module.exports = licensePlugin;
