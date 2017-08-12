'use strict';

var mockfs = require('mock-fs');

var FakeCompiler = require('./FakeCompiler');
var FakeCompilation = require('./FakeCompilation');
var FakeChunk = require('./FakeChunk');

function createCompiler(compilerSetup) {
  var compilationSetup = compilerSetup.compilation;
  var chunks = compilationSetup.chunks.map(function(chunk) {
    return new FakeChunk(chunk.name, chunk.hash, chunk.files, chunk.modules);
  });
  var compilation = new FakeCompilation(compilationSetup.assets, chunks);
  var compiler = new FakeCompiler(compilerSetup.context, compilation);
  return compiler;
}

function unmockfs() {
  mockfs.restore();
}

function setup(fixture) {
  mockfs(fixture.fs);
  return createCompiler(fixture.compiler);
}

function teardown() {
  unmockfs();
}

module.exports = {
  setup: setup,
  teardown: teardown
};
