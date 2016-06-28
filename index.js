var path = require('path');
var fs = require('fs');


var licensePlugin = function(opts) {
  var errorMessages = {
    'no-pattern': 'license-webpack-plugin: Please specify a regular expression '
                + 'as the pattern property on the plugin options.'
  }
  this.errors = [];
  if(!opts || !opts.pattern || !(opts.pattern instanceof RegExp)) {
    this.errors.push(errorMessages['no-pattern']);
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
        .replace(path.join(context, 'node_modules') + path.sep, '')
        .replace(moduleSuffix, '');
      moduleMap[moduleName] = {};
    });
    self.modules = Object.keys(moduleMap);
    fs.writeFileSync(path.join(outputPath, self.filename));
  });
};

module.exports = licensePlugin;
