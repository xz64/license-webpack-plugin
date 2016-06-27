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
};

licensePlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin('done', function(stats) {
    var outputPath = stats.compilation.compiler.outputPath;
    fs.writeFileSync(path.join(outputPath, self.filename));
  });
};

module.exports = licensePlugin;
