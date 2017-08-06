'use strict';

function FakeCompiler(context, compilation) {
  this.context = context;
  this.compilation = compilation;
}

FakeCompiler.prototype.plugin = function(phase, callback) {
  if (phase === 'compilation') {
    callback(this.compilation);
  }
  if (phase === 'done') {
    callback();
  }
};

module.exports = FakeCompiler;
