'use strict';

// var _test = require('tape');
var tape = require('tape');
var tapes = require('tapes');
var test = tapes(tape);

var proxyquire = require('proxyquire');
var sinon = require('sinon');
var mock = require('mock-fs');
var path = require('path');
var pathjoin = require('path.join');
var rimraf = require('rimraf');

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

addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib1',
  url: 'lib1.com',
  license: 'MIT'
});
addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib2',
  license: 'ISC'
});
addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib3',
  url: 'lib3.ru',
  license: 'MIT', licenseFilename: 'license.txt'
});
addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib4',
  license: 'MIT', licenseFilename: 'LICENSE.md'
});
addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib5',
  license: 'FOO', licenseFilename: 'neverfound'
});
addNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib6',
  license: 'MIT', licenseFilename: 'LICENSE.md', scope: '@foo'
});
addNodeModule({fileSystem: fileSystem, context: '/project1', name: 'lib7'});
addArrayLicenseNodeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib8',
  licenses: [
    {
      type: 'MIT',
      url: 'https://example.com/'
    },
    {
      type: 'ISC',
      url: 'https://example.com/'
    }
  ]
});
addLicenseTypeModule({
  fileSystem: fileSystem, context: '/project1', name: 'lib9', license: 'MIT',
  url: 'https://example.com/'
});

var mockfs = mock.fs(fileSystem);

var LicenseWebpackPlugin = proxyquire('../index', {
  path: {
    sep: '/',
    join: pathjoin
  },
  fs: mockfs
});

function addLicenseTypeModule(opts) {
  fileSystem[opts.context].node_modules[opts.name]
    = createLicenseTypeModule(opts.license, opts.url);
}

function addArrayLicenseNodeModule(opts) {
  fileSystem[opts.context].node_modules[opts.name]
    = createArrayLicenseNodeModule(opts.licenses, opts.url);
}

function addNodeModule(opts) {
  if (opts.scope) {
    fileSystem[opts.context].node_modules[opts.scope] = {};
    fileSystem[opts.context].node_modules[opts.scope][opts.name]
      = createNodeModule(opts.license, opts.licenseFilename, opts.url);
  } else {
    fileSystem[opts.context].node_modules[opts.name] = createNodeModule(
      opts.license, opts.licenseFilename, opts.url);
  }
}

function createLicenseTypeModule(license, url) {
  var mod = {
    'package.json': JSON.stringify({
      license: {
        type: license
      },
      repository: {
        url: url
      },
      version: '0.0.1'
    })
  };
  return mod;
}

function createArrayLicenseNodeModule(licenses, url) {
  var mod = {
    'package.json': JSON.stringify({
      licenses: licenses,
      repository: {
        url: url
      },
      version: '0.0.1'
    })
  };
  return mod;
}

function createNodeModule(license, licenseFilename, url) {
  var mod = {
    'package.json': JSON.stringify({
      license: license,
      repository: {
        url: url
      },
      version: '0.0.1'
    })
  };
  if (license) {
    mod[licenseFilename || 'LICENSE'] = 'text: ' + license;
  }
  return mod;
}

function createPlugin(opts) {
  if(!opts) {
    opts = createOpts();
  }
  return new LicenseWebpackPlugin(opts);
}

function createCompiler(stats) {
  if (!stats) {
    stats = createStats();
  }
  return {
    plugin: sinon.spy(function (event, callback) {
      if (event === 'done') {
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

function getModuleList(plugin) {
  return plugin.modules.map(function (mod) {
    return mod.name;
  });
}

test('plugin', function (t) {

  t.afterEach(function (t) {
    rimraf.sync('/project1/dist/*', mockfs);
    t.end();
  });

  t.test('the plugin exists', function (t) {
    t.ok(LicenseWebpackPlugin);
    t.end();
  });

  t.test('the plugin can be instantiated with the new operator', function (t) {
    t.ok(createPlugin());
    t.end();
  });

  t.test('the plugin has an apply function', function (t) {
    t.ok(typeof createPlugin().apply === 'function');
    t.end();
  });

  t.test('the plugin should invoke compiler.plugin', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    plugin.apply(compiler);
    t.ok(compiler.plugin.called);
    t.end();
  });

  t.test('the plugin should invoke compiler.plugin when done', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    plugin.apply(compiler);
    t.ok(compiler.plugin.calledWith('done'));
    t.end();
  });

  t.test('the plugin provides a callback after compilation is done', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    plugin.apply(compiler);
    t.ok(typeof compiler.plugin.args[0][1] === 'function');
    t.end();
  });

  t.test('the plugin defaults output to 3rdpartylicenses.txt', function (t) {
    var plugin = createPlugin();
    var stats = createStats();
    var compiler = createCompiler(stats);
    var outputPath = compiler.outputPath;
    var fileExists = true;
    plugin.apply(compiler);
    try {
      mockfs.accessSync(pathjoin(outputPath, '3rdpartylicenses.txt'));
    }
    catch (e) {
      fileExists = false;
    }
    t.ok(fileExists);
    t.end();
  });

  t.test('the plugin allows you to choose an output filename', function (t) {
    var opts = {pattern: /^MIT|ISC/, filename: 'custom_file.txt'};
    var plugin = createPlugin(opts);
    var stats = createStats();
    var compiler = createCompiler(stats);
    var outputPath = compiler.outputPath;
    var fileExists = true;
    plugin.apply(compiler);
    try {
      mockfs.accessSync(pathjoin(outputPath, opts.filename));
    }
    catch (e) {
      fileExists = false;
    }
    t.ok(fileExists);
    t.end();
  });

  t.test('the plugin generates an error if no options are provided', function (t) {
    var opts = {};
    var plugin;
    var compiler = createCompiler();
    var failed = false;
    try {
      plugin = createPlugin(opts);
      plugin.apply(compiler);
    }
    catch (e) {
      failed = true;
    }
    t.ok(failed);
    t.end();
  });

  t.test('the plugin generates an error if no regexp is provided', function (t) {
    var opts = {};
    var plugin;
    var compiler = createCompiler();
    var failed = false;
    try {
      plugin = createPlugin(opts);
      plugin.apply(compiler);
    }
    catch (e) {
      failed = true;
    }
    t.ok(failed);
    t.end();
  });

  t.test('the plugin generates an error on invalid regexp property', function (t) {
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
    catch (e) {
      failed = true;
    }
    t.ok(failed);
    t.end();
  });

  t.test('the plugin should pick up modules from node_modules', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    var libs;
    plugin.apply(compiler);
    libs = getModuleList(plugin);
    t.deepEqual(libs, ['lib1', 'lib2', 'lib3', 'lib4']);
    t.end();
  });

  t.test('the plugin should skip non-matching licenses', function (t) {
    var opts = {pattern: /^MIT$/};
    var plugin = createPlugin(opts);
    var compiler = createCompiler();
    var libs;
    plugin.apply(compiler);
    libs = getModuleList(plugin);
    t.deepEqual(libs, ['lib1', 'lib3', 'lib4']);
    t.end();
  });

  t.test('the plugin should match a file named LICENSE', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    var libs;
    plugin.apply(compiler);
    libs = getModuleList(plugin);
    t.equal(plugin.modules[0].licenseText, 'text: MIT');
    t.end();
  });

  t.test('the plugin\'s output should contain all licenses', function (t) {
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
    };
    var plugin = createPlugin();
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib1@0.0.1 MIT\ntext: MIT\n\nlib2@0.0.1 ISC\ntext: ISC');
    t.end();
  });

  t.test('the plugin allows overriding license file per module', function (t) {
    var opts = createOpts();
    opts.licenseOverrides = {
      lib1: pathjoin('/project1', 'license_overrides', 'lib1.txt')
    };
    var stats = {
      compilation: {
        modules: [
          {
            resource: '/project1/node_modules/lib1/dist/lib1.js'
          }
        ]
      }
    };
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib1@0.0.1 MIT\nLicense Override');
    t.end();
  });

  t.test('the plugin matches license.txt', function (t) {
    var plugin = createPlugin();
    var compiler = createCompiler();
    var libs;
    plugin.apply(compiler);
    libs = getModuleList(plugin);
    t.ok(libs.indexOf('lib3') > -1);
    t.end();
  });

  t.test('the plugin allows you to specify an array of licenses to match',
    function (t) {
      var opts = createOpts();
      opts.licenseFilenames = ['LICENSE'];
      var plugin = createPlugin(opts);
      var compiler = createCompiler();
      plugin.apply(compiler);
      var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
        .toString('utf8');
      t.equal(licenseFile, 'lib1@0.0.1 MIT\ntext: MIT\n\nlib2@0.0.1 ISC\ntext: ISC\n\nlib3@0.0.1 MIT'
        + '\n\nlib4@0.0.1 MIT');
      t.ok(plugin.errors.length > 1);
      t.end();
    });

  t.test('the plugin should include packages without license if includeUndefined property is set', function (t) {
    var opts = {pattern: /^MIT$/, includeUndefined: true};
    var stats = createStats();
    stats.compilation.modules.push({
      resource: '/project1/node_modules/lib7/dist/lib7.js'
    });
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    var libs;
    plugin.apply(compiler);
    libs = getModuleList(plugin);
    t.deepEqual(libs, ['lib1', 'lib3', 'lib4', 'lib7']);
    t.end();
  });


  t.test('the plugin should include packages url if addUrl property is set', function (t) {
    var opts = createOpts();
    opts.addUrl = true;
    opts.addLicenseText = false;
    var stats = createStats();
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib1@0.0.1 MIT lib1.com\n\nlib2@0.0.1 ISC\n\nlib3@0.0.1 MIT lib3.ru\n\nlib4@0.0.1 MIT');
    t.end();
  });


  t.test('the plugin\'s output should not contain if addLicenseText is set to false', function (t) {
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
    };
    var opts = createOpts();
    opts.addLicenseText = false;
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib1@0.0.1 MIT\n\nlib2@0.0.1 ISC');
    t.end();
  });

  t.test('the plugin falls back to a license template directory', function (t) {
    var opts = createOpts();
    opts.licenseTemplateDir = pathjoin('/project1', 'license_templates');
    opts.pattern = /^FOO$/;
    var stats = createStats();
    stats.compilation.modules = [{
      resource: '/project1/node_modules/lib5/dist/lib5.js'
    }];
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib5@0.0.1 FOO\nThe foo license');
    t.end();
  });

  t.test('the plugin should handle scoped packages properly', function (t) {
    var stats = createStats();
    stats.compilation.modules = [{
      resource: '/project1/node_modules/@foo/lib6/dist/lib6.js'
    }];
    var plugin = createPlugin();
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, '@foo/lib6@0.0.1 MIT\ntext: MIT');
    t.end();
  });

  t.test('the plugin allows you to override a license for a module',
    function(t) {
    var stats = createStats();
    stats.compilation.modules = [{
      resource: '/project1/node_modules/lib8/dist/lib8.js'
    }];
    var opts = createOpts();
    opts.licenseTypeOverrides = {
      lib8: 'ISC'
    };
    var plugin = createPlugin(opts);
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib8@0.0.1 ISC');
    t.end();
  });

  t.test('the plugin defaults to the first license when encountering a license '
    + 'array', function(t) {
    var stats = createStats();
    stats.compilation.modules = [{
      resource: '/project1/node_modules/lib8/dist/lib8.js'
    }];
    var plugin = createPlugin();
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib8@0.0.1 MIT');
    t.end();
  });

  t.test('the plugin handles license.type in package.json', function(t) {
    var stats = createStats();
    stats.compilation.modules = [{
      resource: '/project1/node_modules/lib9/dist/lib9.js'
    }];
    var plugin = createPlugin();
    var compiler = createCompiler(stats);
    plugin.apply(compiler);
    var licenseFile = mockfs.readFileSync('/project1/dist/3rdpartylicenses.txt')
      .toString('utf8');
    t.equal(licenseFile, 'lib9@0.0.1 MIT');
    t.end();
  });

  t.end();
});
