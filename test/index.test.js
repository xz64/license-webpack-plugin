'use strict';

var test = require('tape');
var sinon = require('sinon');
var mock = require('mock-fs');
var fs = require('fs');
var path = require('path');
var LicenseWebpackPlugin = require('../index');

var fileSystem = {
  '/project1': {
    'dist': {},
    'node_modules': {},
    'license_overrides': {
      'lib1.txt': 'License Override'
    },
    'license_templates': {
      'FOO.txt': 'The foo license'
    }
  }
};

addNodeModule(fileSystem, '/project1', 'lib1', 'MIT');
addNodeModule(fileSystem, '/project1', 'lib2', 'ISC');
addNodeModule(fileSystem, '/project1', 'lib3', 'MIT', 'license.txt');
addNodeModule(fileSystem, '/project1', 'lib4', 'MIT', 'LICENSE.md');
addNodeModule(fileSystem, '/project1', 'lib5', 'FOO', 'neverfound');

mock(fileSystem);

function addNodeModule(fileSystem, context, name, license, licenseFilename) {
  fileSystem[context].node_modules[name] = createNodeModule(license,
    licenseFilename);
}

function createNodeModule(license, licenseFilename) {
  var mod = {
    'package.json': JSON.stringify({
      license: license,
      version: '0.0.1'
    })
  };
  mod[licenseFilename || 'LICENSE'] = license;
  return mod;
}

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
        },
        {
          resource: '/project1/node_modules/lib2/dist/lib2.js'
        },
        {
          resource: '/project1/node_modules/lib3/dist/lib3.js'
        },
        {
          resource: '/project1/node_modules/lib4/dist/lib4.js'
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
  var opts = { pattern: /^MIT|ISC*/, filename: 'custom_file.txt' }
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
  var plugin;
  var compiler = createCompiler();
  var failed = false;
  try { 
    plugin = createPlugin(opts);
    plugin.apply(compiler);
  }
  catch(e) {
    failed = true;
  }
  t.ok(failed);
  t.end();
});

test('the plugin generates an error if no regexp is provided', function(t) {
  var opts = {};
  var plugin;
  var compiler = createCompiler();
  var failed = false;
  try { 
    plugin = createPlugin(opts);
    plugin.apply(compiler);
  }
  catch(e) {
    failed = true;
  }
  t.ok(failed);
  t.end();
});

test('the plugin generates an error on invalid regexp property', function(t) {
  var opts = {
    pattern: 'not_a_regex'
  };
  var plugin;
  var compiler = createCompiler();
  var failed = false;
  try { 
    plugin = createPlugin(opts);
    plugin.apply(compiler);
  }
  catch(e) {
    failed = true;
  }
  t.ok(failed);
  t.end();
});

test('the plugin should pick up modules from node_modules', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  var libs;
  plugin.apply(compiler);
  libs = plugin.modules.map(function(mod) { return mod.name; });
  t.deepEqual(libs, ['lib1', 'lib2', 'lib3', 'lib4']);
  t.end();
});

test('the plugin should skip non-matching licenses', function(t) {
  var opts = { pattern: /^MIT$/ };
  var plugin = createPlugin(opts);
  var compiler = createCompiler();
  var libs;
  plugin.apply(compiler);
  libs = plugin.modules.map(function(mod) { return mod.name; });
  t.deepEqual(libs, ['lib1', 'lib3', 'lib4']);
  t.end();
});

test('the plugin should match a file named LICENSE', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  var libs;
  plugin.apply(compiler);
  t.equal(plugin.modules[0].licenseText, 'MIT');
  t.end();
});

test('the plugin\'s output should contain all licenses', function(t) {
  var stats = {
    compilation: {
      modules: [
        {
          resource: '/project1/node_modules/lib1/dist/lib1.js'
        },
        {
          resource: '/project1/node_modules/lib2/dist/lib2.js'
        }
      ]
    }
  }
  var plugin = createPlugin();
  var compiler = createCompiler(stats);
  plugin.apply(compiler);
  var licenseFile = fs.readFileSync('/project1/dist/3rdpartylicenses.txt')
    .toString('utf8');
  t.equal(licenseFile, 'lib1@0.0.1\nMIT\n\nlib2@0.0.1\nISC');
  t.end();
});

test('the plugin allows overriding license file per module', function(t) {
  var opts = createOpts();
  opts.licenseOverrides = {
    lib1: path.join('/project1', 'license_overrides', 'lib1.txt')
  }
  var stats = {
    compilation: {
      modules: [
        {
          resource: '/project1/node_modules/lib1/dist/lib1.js'
        }
      ]
    }
  }
  var plugin = createPlugin(opts);
  var compiler = createCompiler(stats);
  plugin.apply(compiler);
  var licenseFile = fs.readFileSync('/project1/dist/3rdpartylicenses.txt')
    .toString('utf8');
  t.equal(licenseFile, 'lib1@0.0.1\nLicense Override');
  t.end();
});

test('the plugin matches license.txt', function(t) {
  var plugin = createPlugin();
  var compiler = createCompiler();
  var libs;
  plugin.apply(compiler);
  libs = plugin.modules.map(function(mod) { return mod.name; });
  t.ok(libs.indexOf('lib3') > -1);
  t.end();
})

test('the plugin allows you to specify an array of licenses to match',
  function(t) {
  var opts = createOpts();
  opts.licenseFilenames = ['LICENSE'];
  var plugin = createPlugin(opts);
  var compiler = createCompiler();
  plugin.apply(compiler);
  var licenseFile = fs.readFileSync('/project1/dist/3rdpartylicenses.txt')
    .toString('utf8');
  t.equal(licenseFile, 'lib1@0.0.1\nMIT\n\nlib2@0.0.1\nISC\n\nlib3@0.0.1\nMIT'
    + '\n\nlib4@0.0.1\nMIT');
  t.ok(plugin.errors.length > 1);
  t.end();
})

test('the plugin falls back to a license template directory', function(t) {
  var opts = createOpts();
  opts.licenseTemplateDir = path.join('/project1', 'license_templates');
  opts.pattern = /^FOO$/;
  var stats = createStats();
  stats.compilation.modules = [{
    resource: '/project1/node_modules/lib5/dist/lib5.js'
  }];
  var plugin = createPlugin(opts);
  var compiler = createCompiler(stats);
  plugin.apply(compiler);
  var licenseFile = fs.readFileSync('/project1/dist/3rdpartylicenses.txt')
    .toString('utf8');
  t.equal(licenseFile, 'lib5@0.0.1\nThe foo license');
  t.end();
})
