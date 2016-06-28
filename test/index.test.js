'use strict';

var test = require('tape');
var sinon = require('sinon');
var mock = require('mock-fs');
var fs = require('fs');
var path = require('path');
var LicenseWebpackPlugin = require('../index');

mock({
  '/project1': {
    'dist': {},
    'node_modules': {
      'lib1': {
        'package.json': JSON.stringify({
          license: 'ISC'
        })
      }
    }
  }
});

function createPlugin(opts) {
  if(!opts) {
    opts = createOpts();
  }
  return new LicenseWebpackPlugin(opts);
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
    }),
    outputPath: '/project1/dist',
    context: '/project1'
  };
}

function createStats() {
  return {
    compilation: {
      modules: [
        {
          resource: '/project1/node_modules/lib1/dist/lib1.js'
        }
      ]
    }
  };
}

function createOpts() {
  return {
    pattern: /^(MIT|ISC)$/
  };
}

test('the plugin exists', function(t) {
  t.ok(LicenseWebpackPlugin);
  t.end();
});

test('the plugin can be instantiated with the new operator', function(t) {
  t.ok(createPlugin());
  t.end();
});

test('the plugin has an apply function on its prototype', function(t) {
  t.ok(typeof LicenseWebpackPlugin.prototype.apply === 'function');
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
  var compiler = createCompiler(stats);
  var outputPath = compiler.outputPath;
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
  var compiler = createCompiler(stats);
  var outputPath = compiler.outputPath;
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

test('the plugin generates an error if no options are provided', function(t) {
  var opts = {};
  var plugin = createPlugin(opts);
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(plugin.errors.length > 0);
  t.end();
});

test('the plugin generates an error if no regexp is provided', function(t) {
  var opts = {};
  var plugin = createPlugin(opts);
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(plugin.errors.length > 0);
  t.end();
});

test('the plugin generates an error on invalid regexp property', function(t) {
  var opts = {
    pattern: 'not_a_regex'
  };
  var plugin = createPlugin(opts);
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.ok(plugin.errors.length > 0);
  t.end();
});

test('the plugin should pick up modules from node_modules', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  plugin.apply(compiler);
  t.deepEqual(plugin.modules, ['lib1']);
  t.end();
});
