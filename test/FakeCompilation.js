'use strict';

var FakeRawSource = require('./FakeRawSource');

function FakeCompilation(assets, chunks) {
  Object.keys(assets).forEach(function(file) {
    assets[file] = new FakeRawSource(assets[file]);
  });
  this.assets = assets;
  this.chunks = chunks;
}

FakeCompilation.prototype.plugin = function(phase, callback) {
  if (phase === 'optimize-chunk-assets') {
    callback(this.chunks, Function.prototype);
  }
};

FakeCompilation.prototype.getPath = function(template, opts) {
  return template
    .replace(/\[name\]/g, opts.chunk.name)
    .replace(/\[hash\]/g, opts.chunk.hash);
};

module.exports = FakeCompilation;
