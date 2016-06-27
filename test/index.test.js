'use strict';

var test = require('tape');
var sinon = require('sinon');
var mock = require('mock-fs');
var fs = require('fs');
var path = require('path');
var CleanWebpackPlugin = require('../index');

mock();

function createPlugin(opts) {
  return new CleanWebpackPlugin(opts);
}

function createCompiler(stats) {
  if(!stats) {
    stats = createStats();
  }
  return { 
    plugin: sinon.spy(function(event, callback) {
      if(event === 'done') {
        callback(stats);
      }
    })
  };
}

function createStats() {
  return {
    compilation: {
      compiler: {
        outputPath: '/tmp'
      }
    }
  };
}

test('the plugin exists', function(t) {
  t.ok(CleanWebpackPlugin);
  t.end();
});

test('the plugin can be instantiated with the new operator', function(t) {
  t.ok(createPlugin());
  t.end();
});

test('the plugin has an apply function on its prototype', function(t) {
  t.ok(typeof CleanWebpackPlugin.prototype.apply === 'function');
  t.end();
});

test('the plugin should invoke compiler.plugin', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(compiler.plugin.called);
  t.end();
});

test('the plugin should invoke compiler.plugin when done', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(compiler.plugin.calledWith('done'));
  t.end();
});

test('the plugin provides a callback after compilation is done', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(typeof compiler.plugin.args[0][1] === 'function');
  t.end();
});

test('the plugin defaults output to 3rdpartylicenses.txt', function(t) {
  var plugin = createPlugin();
  var stats = createStats();
  var outputPath = stats.compilation.compiler.outputPath;
  var compiler = createCompiler(stats);
  var fileExists = true;
  plugin.apply(compiler);
  try {
    fs.accessSync(path.join(outputPath, '3rdpartylicenses.txt'));
  }
  catch(e) {
    console.error(e);
    fileExists = false;
  }
  t.ok(fileExists);
  t.end();
});

test('the plugin allows you to choose an output filename', function(t) {
  var opts = { filename: 'custom_file.txt' }
  var plugin = createPlugin(opts);
  var stats = createStats();
  var outputPath = stats.compilation.compiler.outputPath;
  var compiler = createCompiler(stats);
  var fileExists = true;
  plugin.apply(compiler);
  try {
    fs.accessSync(path.join(outputPath, opts.filename));
  }
  catch(e) {
    console.error(e);
    fileExists = false;
  }
  t.ok(fileExists);
  t.end();
});
