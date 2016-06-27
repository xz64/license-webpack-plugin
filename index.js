var path = require('path');
var fs = require('fs');

var licensePlugin = function(opts) {
  this.filename = (opts && opts.filename) || '3rdpartylicenses.txt';
};

licensePlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin('done', function(stats) {
    var outputPath = stats.compilation.compiler.outputPath;
    fs.writeFileSync(path.join(outputPath, self.filename));
  });
};

module.exports = licensePlugin;
