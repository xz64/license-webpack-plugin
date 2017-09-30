'use strict';

var test = require('tape');
var proxyquire = require('proxyquire').noCallThru();
var pathjoin = require('path.join');

var fixtures = require('./fixtures');
var helpers = require('./helpers');
var setup = helpers.setup;
var teardown = helpers.teardown;
var FakeWebpackSources = require('./FakeWebpackSources');
var LicenseWebpackPlugin = proxyquire('../dist/LicenseWebpackPlugin', {
  'webpack-sources': FakeWebpackSources,
  path: {
    sep: '/',
    join: pathjoin,
    resolve: pathjoin,
    '@global': true
  }
}).LicenseWebpackPlugin;

test('the plugin exists', function(t) {
  t.ok(LicenseWebpackPlugin);
  t.end();
});

test('the plugin throws an error if no pattern is given', function(t) {
  t.throws(function() {
    new LicenseWebpackPlugin();
  });
  t.end();
});

test('the plugin throws an error if options are given but no pattern is given', function(
  t
) {
  t.throws(function() {
    new LicenseWebpackPlugin({});
  });
  t.end();
});

test('the plugin throws an error if a non-regexp pattern is given', function(
  t
) {
  t.throws(function() {
    new LicenseWebpackPlugin({
      pattern: 1
    });
  });
  t.end();
});

test('the plugin throws an error if a non-regexp unacceptable pattern is given', function(
  t
) {
  t.throws(function() {
    new LicenseWebpackPlugin({
      pattern: /^.$/,
      unacceptablePattern: 1
    });
  });
  t.end();
});

test('the plugin throws an error if the output template cannot be found', function(
  t
) {
  t.throws(function() {
    new LicenseWebpackPlugin({
      pattern: /^.*$/,
      outputTemplate: '/foo'
    });
  });
  t.end();
});

test('the plugin throws an error if it cannot find the build root', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.badBuildRootProject());
  t.throws(function() {
    plugin.apply(compiler);
  });
  teardown();
  t.end();
});

test('the plugin adds an additional asset to the compilation', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(Object.keys(compiler.compilation.assets).length > 1);
  teardown();
  t.end();
});

test('the plugin allows for custom output filename', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    outputFilename: '[name].[hash].licenses.txt'
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  var chunk = compiler.compilation.chunks[0];
  t.ok(
    compiler.compilation.assets[chunk.name + '.' + chunk.hash + '.licenses.txt']
  );
  teardown();
  t.end();
});

test('the plugin works if the webpack context is inside node_modules', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.nodeModulesContextProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin works if the webpack context is nested inside the project', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.nonRootContextProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin detects modules from node_modules', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['main.licenses.txt'].text.indexOf('lib1') > -1
  );
  teardown();
  t.end();
});

test('the plugin detects a LICENSE file from a module', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin detects a license.txt file from a module', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibProjectWithLicenseTxtFile());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin allows custom array of license filenames to match', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    licenseFilenames: ['license.txt']
  });
  var compiler = setup(fixtures.oneLibProjectWithLicenseTxtFile());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin should have the option of including modules which do not have a license', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^MIT$/,
    includePackagesWithoutLicense: true
  });
  var compiler = setup(fixtures.unknownLicenseProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['main.licenses.txt'].text.indexOf('Unknown') >
      -1
  );
  teardown();
  t.end();
});

test('the plugin allows a license template directory to be defined as backup in case the license file is not found', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    licenseTemplateDir: '/licenseTemplates'
  });
  var compiler = setup(fixtures.missingLicenseFileProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin skips modules which do not match the pattern', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^MIT$/
  });
  var compiler = setup(fixtures.multiModuleVaryingLicenseProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['main.licenses.txt'].text.indexOf('ISC') === -1
  );
  teardown();
  t.end();
});

test('the plugin can handle multiple modules', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.multiModuleVaryingLicenseProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['main.licenses.txt'].text.indexOf('ISC') > 0 &&
      compiler.compilation.assets['main.licenses.txt'].text.indexOf('MIT') > 0
  );
  teardown();
  t.end();
});

test('the plugin writes a 3rd party license notice to each js file when the banner option is enabled', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    addBanner: true
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['output.abcd.js'].text.indexOf('/*! 3rd') === 0
  );
  teardown();
  t.end();
});

test('the plugin allows for custom banner templates', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    addBanner: true,
    bannerTemplate: '/*! Test <%= filename %> */'
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['output.abcd.js'].text.indexOf(
      '/*! Test main.licenses.txt */'
    ) === 0
  );
  teardown();
  t.end();
});

test('the plugin allows overriding a license file for a module', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    licenseFileOverrides: {
      lib1: '/project1/custom.txt'
    }
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(
    compiler.compilation.assets['main.licenses.txt'].text.indexOf('custom') > 0
  );
  teardown();
  t.end();
});

test('the plugin should handle scoped packages properly', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibScopedPackageProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    '@org/lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin should handle scoped packages properly when there are two @ signs in the path to the library file', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.oneLibScopedPackageProjectWithAtSignResource());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    '@org/lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin allows an override of the license type', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    licenseTypeOverrides: {
      lib1: 'ISC'
    }
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nISC\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin picks the first license when license is not in package.json and licenses is an array in package.json', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.licenseArrayProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin handles license.type in package.json', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.licenseTypeProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin throws an error on an unacceptable license when abort option is set', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    unacceptablePattern: /MIT/,
    abortOnUnacceptableLicense: true
  });
  var compiler = setup(fixtures.oneLibProject());
  t.throws(function() {
    plugin.apply(compiler);
  });
  teardown();
  t.end();
});

test('the plugin adds an error on an unacceptable license when abort option is not set', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    unacceptablePattern: /MIT/
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.ok(plugin.errors.length > 0);
  teardown();
  t.end();
});

test('the plugin handles excluded chunks', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    excludedChunks: ['main']
  });
  var compiler = setup(fixtures.twoChunkProject());
  plugin.apply(compiler);
  t.ok(compiler.compilation.assets['vendor.licenses.txt']);
  t.notOk(compiler.compilation.assets['main.licenses.txt']);
  teardown();
  t.end();
});

test('the plugin handles included chunks', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    includedChunks: ['vendor']
  });
  var compiler = setup(fixtures.twoChunkProject());
  plugin.apply(compiler);
  t.ok(compiler.compilation.assets['vendor.licenses.txt']);
  t.notOk(compiler.compilation.assets['main.licenses.txt']);
  teardown();
  t.end();
});

test('the plugin excluded chunks overrides included chunks', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    excludedChunks: ['vendor'],
    includedChunks: ['vendor']
  });
  var compiler = setup(fixtures.twoChunkProject());
  plugin.apply(compiler);
  t.notOk(compiler.compilation.assets['vendor.licenses.txt']);
  teardown();
  t.end();
});

test('the plugin leaves quotation marks as is', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.licenseWithQuotationMarkProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\n"MIT License"'
  );
  teardown();
  t.end();
});

test('the plugin does not write output for a chunk with no licenses', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.no3rdPartyLicenseProject());
  plugin.apply(compiler);
  t.notOk(compiler.compilation.assets['main.licenses.txt']);
  teardown();
  t.end();
});

test('the plugin does not write a banner to a chunk with no referenced licenses', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    addBanner: true
  });
  var compiler = setup(fixtures.no3rdPartyLicenseProject());
  plugin.apply(compiler);
  t.equal(compiler.compilation.assets['output.abcd.js'].text, 'some test file');
  teardown();
  t.end();
});

test('the plugin writes a master file when the option is set', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    perChunkOutput: false
  });
  var compiler = setup(fixtures.oneLibProject());
  plugin.apply(compiler);
  t.notOk(compiler.compilation.assets['main.licenses.txt']);
  t.equal(
    compiler.compilation.assets['licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin can force certain packages to be in the output', function(t) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/,
    additionalPackages: ['lib1']
  });
  var compiler = setup(fixtures.no3rdPartyLicenseProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});

test('the plugin ignores stray files inside node_modules such as node_modules/foo.js', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.strayJsFileInNodeModulesProject());
  plugin.apply(compiler);
  t.notOk(compiler.compilation.assets['main.licenses.txt']);
  teardown();
  t.end();
});

test('the plugin handles rootModule when module.resource is not found', function(
  t
) {
  var plugin = new LicenseWebpackPlugin({
    pattern: /^.*$/
  });
  var compiler = setup(fixtures.rootModuleProject());
  plugin.apply(compiler);
  t.equal(
    compiler.compilation.assets['main.licenses.txt'].text,
    'lib1@0.0.1\nMIT\nMIT License'
  );
  teardown();
  t.end();
});
