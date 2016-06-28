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
};

licensePlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin('done', function(stats) {
    var outputPath = compiler.outputPath;
    var context = compiler.context;
    var moduleMap = {};
    var moduleSuffix = new RegExp(path.sep + '.*$');
    stats.compilation.modules.forEach(function(mod) {
      var moduleName = mod.resource
        .replace(path.join(context, MODULE_DIR) + path.sep, '')
        .replace(moduleSuffix, '');
      moduleMap[moduleName] = {};
    });
    self.modules = Object.keys(moduleMap)
      .filter(function(mod) {
        return self.pattern.test(getLicense(context, mod));
      });
    fs.writeFileSync(path.join(outputPath, self.filename));
  });
};

function getLicense(context, mod) {
  var loc = path.join(context, MODULE_DIR, mod, 'package.json');
  var packagejson = JSON.parse(fs.readFileSync(loc));
  return packagejson.license || 'No license specified!';
}

module.exports = licensePlugin;
