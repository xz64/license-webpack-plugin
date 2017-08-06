'use strict';

function FakeChunk(name, hash, files, modules) {
  this.name = name;
  this.hash = hash;
  this.renderedHash = hash;
  this.files = files;
  this.modules = modules;
}

FakeChunk.prototype.forEachModule = function(callback) {
  this.modules.forEach(callback);
};

module.exports = FakeChunk;
