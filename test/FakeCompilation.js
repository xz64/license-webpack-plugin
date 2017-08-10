'use strict';

var FakeRawSource = require('./FakeRawSource');

function FakeCompilation(assets, chunks) {
  Object.keys(assets).forEach(function(file) {
    assets[file] = new FakeRawSource(assets[file]);
  });
  this.assets = assets;
  this.chunks = chunks;
}

FakeCompilation.prototype.getPath = function(template, opts) {
  return template
    .replace(/\[name\]/g, opts.chunk && opts.chunk.name)
    .replace(/\[hash\]/g, opts.chunk && opts.chunk.hash);
};

module.exports = FakeCompilation;
