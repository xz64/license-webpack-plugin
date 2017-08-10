'use strict';

function FakeCompiler(context, compilation) {
  this.context = context;
  this.compilation = compilation;
}

FakeCompiler.prototype.plugin = function(phase, callback) {
  if (phase === 'emit') {
    callback(this.compilation, Function.prototype);
  }
};

module.exports = FakeCompiler;
