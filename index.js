var path = require('path');

var licensePlugin = function(opts) {
};

licensePlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function() {
  });
};

module.exports = licensePlugin;
