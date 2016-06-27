var path = require('path');
var fs = require('fs');

var licensePlugin = function(opts) {
};

licensePlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function() {
    fs.writeFileSync('./3rdpartylicenses.txt', 'data');
  });
};

module.exports = licensePlugin;
