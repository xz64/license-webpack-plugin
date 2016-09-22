var path = require('path');
var fs = require('fs');
var IsThere = require('is-there');
var objectAssign = require('object-assign');

var MODULE_DIR = 'node_modules';

var moduleReader = {
  readPackageJson: function(mod) {
    var pathName = path.join(this.context, MODULE_DIR, mod, 'package.json');
    var file = fs.readFileSync(pathName);
    return JSON.parse(file);
  },
  getModuleInfo: function(mod) {
    var packagejson = this.readPackageJson(mod);
    return packagejson;
  },
  parseModuleInfo: function(mod) {
    var packagejson = this.moduleCache[mod];
    return {
      name: mod,
      url: packagejson.repository && packagejson.repository.url,
      version: packagejson.version,
      license: packagejson.license,
      licenseText: this.getLicenseText(mod, packagejson.license)
    };
  },
  findPackageName: function(jsFilePath) {
    return jsFilePath
      .replace(path.join(this.context, MODULE_DIR) + path.sep, '')
      .split(path.sep)
      .filter(function(value, index, arr) {
        return value.charAt(0) === '@'
          || (index === 0 && value.charAt(0) !== '@')
          || (index > 0 && arr[index-1].charAt(0) === '@');
      })
      .join('/');
  },
  writeModuleInfo: function() {
    this.modules = Object.keys(this.moduleMap)
      .filter(function(mod) {
        if(mod.trim() === '') {
          return false;
        }
        var moduleInfo = this.getModuleInfo(mod);
        var isMatching = this.pattern.test(moduleInfo.license) || !moduleInfo.license && this.includeUndefined;
        if (isMatching) {
          this.moduleCache[mod] = moduleInfo;
        }
        return isMatching;
      }.bind(this))
      .map(this.parseModuleInfo.bind(this));
  },
  gatherModuleInfo: function(moduleStats) {
    var moduleMap = {};
    moduleStats
      .filter(function(mod) {
        return !!mod.resource;
      })
      .forEach(function(mod) {
        var moduleName = this.findPackageName(mod.resource);
        moduleMap[moduleName] = {};
      }.bind(this));
    this.moduleMap = moduleMap;
    this.writeModuleInfo();
  }
};

var licenseReader = {
  getLicenseText: function(mod, license) {
    var licenseText = '';
    var file =
      (this.licenseOverrides[mod] && IsThere(this.licenseOverrides[mod])) ?
      this.licenseOverrides[mod] : this.findLicenseFile(mod);
    
    if(file) {
      licenseText = fs.readFileSync(file).toString('utf8');
    }
    else {
      licenseText = this.readLicenseTemplate(license);
      if(!licenseText) {
        this.errors.push(
          this.errorMessages['no-license-file']
            .replace('{0}', mod)
            .replace('{1}', license)
        );
      }
    }

    return licenseText;
  },
  findLicenseFile: function(mod) {
    var file;
    for(var i = 0; i < this.licenseFilenames.length; i++) {
      var licenseFile = path.join(this.context, MODULE_DIR, mod,
        this.licenseFilenames[i]);
      if(IsThere(licenseFile)) {
        file = licenseFile;
        break;
      }
    }
    return file;
  },
  readLicenseTemplate: function(license) {
    var filename;
    if(!this.licenseTemplateCache[license]) {
      filename = path.join(this.licenseTemplateDir, license + '.txt');
      if(IsThere(filename)) {
        this.licenseTemplateCache[license] =
          fs.readFileSync(filename).toString('utf8');
      }
    }
    return this.licenseTemplateCache[license];
  }
};

var licenseWriter = {
  format: function(mod) {
    var formatted = mod.name + '@' + mod.version + ' ' + mod.license;
    if (this.addUrl && !!mod.url) {
      formatted += ' ' + mod.url;
    }
    if (this.addLicenseText && !!mod.licenseText) {
      formatted += '\n' + mod.licenseText
    }
    return formatted;
  },
  compile: function() {
    return this.modules
      .reduce(function(prev, curr) {
        return prev + '\n\n' + this.format(curr);
      }.bind(this), '')
      .replace('\n\n', '');
  },
  write: function() {
    var outputText = this.compile();
    var destFile = path.join(this.outputPath, this.filename);
    fs.writeFileSync(destFile, outputText);
  }
};

var plugin = {
  errorMessages: {
    'no-pattern': 'Please specify a regular expression as the pattern property'
                + 'on the plugin options.',
    'no-license-file': 'Could not find a license file for {0}, defaulting to '
                     + 'license name found in package.json: {1}'
  },
  apply: function(compiler) {
    compiler.plugin('done', function(stats) {
      this.outputPath = compiler.outputPath;
      this.context = compiler.context;

      this.gatherModuleInfo(stats.compilation.modules);
      this.write();

      this.errors.forEach(function(error) {
        console.error('license-webpack-plugin: ' + error);
      });
    }.bind(this));
  }
};

var composedPlugin = objectAssign(
  {},
  plugin,
  moduleReader,
  licenseReader,
  licenseWriter
);

var instance = function() {
  return {
    modules: [],
    errors: [],
    filename: '3rdpartylicenses.txt',
    moduleCache: {},
    addUrl: false,
    addLicenseText: true,
    includeUndefined: false,
    licenseTemplateDir: __dirname,
    licenseTemplateCache: {},
    licenseOverrides: {},
    licenseFilenames: [
      'LICENSE',
      'LICENSE.md',
      'LICENSE.txt',
      'license',
      'license.md',
      'license.txt'
    ]
  };
};

var licensePlugin = function(opts) {
  if(!opts || !opts.pattern || !(opts.pattern instanceof RegExp)) {
    this.errors.push(plugin.errorMessages['no-pattern']);
    throw plugin.errorMessages['no-pattern'];
  }
  objectAssign(this, composedPlugin, instance(), opts);
  this.apply = this.apply.bind(this);
};

module.exports = licensePlugin;
