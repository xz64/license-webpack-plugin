var path = require('path');
var fs = require('fs');
var IsThere = require('is-there');

var MODULE_DIR = 'node_modules';

var licensePlugin = function(opts) {
  this.errorMessages = {
    'no-pattern': 'Please specify a regular expression as the pattern property'
                + 'on the plugin options.',
    'no-license-file': 'Could not find a license file for {1}'
  }
  this.errors = [];
  if(!opts || !opts.pattern || !(opts.pattern instanceof RegExp)) {
    this.errors.push(this.errorMessages['no-pattern']);
    throw this.errorMessages['no-pattern'];
  }
  this.pattern = opts.pattern;
  this.filename = opts.filename || '3rdpartylicenses.txt';
  this.modules = [];
  this.licenseOverrides = opts.licenseOverrides || {};
  this.licenseFilenames = opts.licenseFilenames || [
    'LICENSE',
    'LICENSE.md',
    'LICENSE.txt',
    'license',
    'license.md',
    'license.txt'
  ];
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

    stats.compilation.modules
      .filter(function(mod) {
        return !!mod.resource;
      })
      .forEach(function(mod) {
        var moduleName = mod.resource
          .replace(path.join(context, MODULE_DIR) + path.sep, '')
          .replace(moduleSuffix, '');
        moduleMap[moduleName] = {};
      });

    self.modules = Object.keys(moduleMap)
      .filter(function(mod) {
        if(mod.trim() === '') {
          return false;
        }
        var moduleInfo = getModuleInfo(context, mod, moduleCache);
        var isMatching = self.pattern.test(moduleInfo.license);
        if(isMatching) {
          moduleCache[mod] = moduleInfo;
        }
        return isMatching;
      })
      .map(function(mod) {
        return parseModuleInfo(context, mod, moduleCache[mod],
          self.licenseOverrides, self.licenseFilenames, self);
      });

    licenseCompilation = self.modules
      .reduce(function(prev, curr) {
        return prev + '\n\n' + formatLicenseOutput(curr);
      }, '')
      .replace('\n\n', '');

    fs.writeFileSync(path.join(outputPath, self.filename),
      licenseCompilation);

    self.errors.forEach(function(error) {
      console.error('license-webpack-plugin: ' + error);
    });
  });
};

function formatLicenseOutput(mod) {
  return mod.name + '@' + mod.version + '\n' + mod.licenseText;
}

function getLicenseText(context, mod, licenseOverrides, licenseFilenames,
  plugin) {
  var file;
  var fileFound;
  var licenseText = '';
  if(licenseOverrides[mod] && IsThere(licenseOverrides[mod])) {
    fileFound = true;
    file = licenseOverrides[mod];
  }
  else {
    for(var i = 0; i < licenseFilenames.length; i++) {
      var licenseFile = path.join(context, MODULE_DIR, mod,
        licenseFilenames[i]);
      if(IsThere(licenseFile)) {
        file = licenseFile;
        fileFound = true;
        break;
      }
    };
  }
  if(fileFound) { 
    licenseText =  fs.readFileSync(file).toString('utf8');
  }
  else {
    plugin.errors.push(plugin.errorMessages['no-license-file'].replace('{1}',
      mod));
  }
  return licenseText;
}

function readPackageJson(context, mod) {
  var pathName = path.join(context, MODULE_DIR, mod, 'package.json');
  var file = fs.readFileSync(pathName);
  return JSON.parse(file);
}

function parseModuleInfo(context, mod, packagejson, licenseOverrides,
  licenseFilenames, plugin) {
  return {
    name: mod,
    version: packagejson.version,
    license: packagejson.license,
    licenseText: getLicenseText(context, mod, licenseOverrides,
      licenseFilenames, plugin)
  };
}

function getModuleInfo(context, mod, moduleCache) {
  var packagejson = readPackageJson(context, mod);
  return packagejson;
}

module.exports = licensePlugin;
