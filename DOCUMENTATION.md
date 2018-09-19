# Documentation

## Basic Setup

Below is an example of how to add the plugin to a webpack config:

```javascript
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;

module.exports = {
  plugins: [
    new LicenseWebpackPlugin()
  ]
};
```

## Configuration Examples

The below examples showcase all functionality available in the plugin.

---

**limit which license types get included in the output**

```javascript
new LicenseWebpackPlugin({
  licenseInclusionTest: (licenseType) => (licenseType === 'MIT')
});
```

Notes: All license identifiers in npm packages are supposed to follow SPDX format. If your requirements are very specific, it is recommended to set up this option using the [`spdx-satisfies`](https://www.npmjs.com/package/spdx-satisfies) package. The plugin does not provide the `spdx-satisfies` package, so you must install it separately if you want to use it.

Example using `spdx-satisfies`:

```javascript
const satisfies = require('spdx-satisfies');

new LicenseWebpackPlugin({
  licenseInclusionTest: (licenseType) => satisfies(licenseType, '(ISC OR MIT)')
});

```

---

**change the output filename**

```javascript
new LicenseWebpackPlugin({
  outputFilename: '[name].[hash].licenses.txt'
});
```

---

**do something when an unacceptable license is found**

```javascript
new LicenseWebpackPlugin({
  unacceptableLicenseTest: (licenseType) => (licenseType === 'GPL'),
  handleUnacceptableLicense: (packageName, licenseType) => {
    throw new Error(packageName + ' has unacceptable license type: ' + licenseType)
  }
});
```

---

**exclude specific packages**

```javascript
new LicenseWebpackPlugin({
  excludedPackageTest: (packageName) => packageName === 'excluded-package'
});
```

---


**combine all license information into one file instead of having one file per chunk**

```javascript
new LicenseWebpackPlugin({
  perChunkOutput: false
});
```

---

**write banner to top of js files**

```javascript
new LicenseWebpackPlugin({
  addBanner: true
});
```

---

**override the license type for specific packages**

```javascript
new LicenseWebpackPlugin({
  licenseTypeOverrides: {
    foopkg: 'MIT'
  }
});
```

---

**override the license text for specific packages**

```javascript
new LicenseWebpackPlugin({
  licenseTypeOverrides: {
    foopkg: 'License text for foopkg'
  }
});
```

---

**override the license filename for specific packages**

```javascript
new LicenseWebpackPlugin({
  licenseFileOverrides: {
    foopkg: 'The-License.txt'
  }
});
```

Notes: The license filename is resolved relative to the package directory.

---

**change the format / contents of the generated license file**

```javascript
new LicenseWebpackPlugin({
  renderLicenses: (modules) => {
    console.log(modules[0].packageJson, modules[0].licenseId, modules[0].licenseText);
    return JSON.stringify(modules);
  }
});
```

---

**change the format / contents of the banner written to the top of each js file**

```javascript
new LicenseWebpackPlugin({
  addBanner: true, 
  renderBanner: (filename, modules) => {
    console.log(modules);
    return '/*! licenses are at ' + filename + '*/';
  }
});
```

---

**do something when license text is missing from a package**

```javascript
new LicenseWebpackPlugin({
  handleMissingLicenseText: (packageName, licenseType) => {
    console.log('Cannot find license for ' + packageName);
    return 'UNKNOWN';
  }
});
```

Notes: You can return your own license text from this function, but you should prefer using `licenseTextOverrides` first.

---

**use fallback license files for when a package is missing a license file**

```javascript
new LicenseWebpackPlugin({
  licenseTemplateDir: path.resolve(__dirname, 'licenseTemplates')
});
```

Notes: This option specifies a directory containing `.txt` files containing the license text based on the license type. (e.g. `MIT.txt`). Templates can be found [here](https://github.com/spdx/license-list).

---

**control which chunks gets processed by the plugin**

```javascript
new LicenseWebpackPlugin({
  chunkIncludeExcludeTest: {
    exclude: ['foo'],
    include: ['bar']
  }
});

new LicenseWebpackPlugin({
  chunkIncludeExcludeTest: (chunkName) => chunkName.startsWith('abc')
});
```

Notes: If there is a duplicate entry in both the `exclude` and `include` array, the duplicated entry will be excluded.

---

**limit which folders get scanned for license files**

```javascript
new LicenseWebpackPlugin({
  modulesDirectories: [
    path.resolve(__dirname, 'node_modules')
  ]
});
```

---

**add additional node modules to a chunk**

```javascript
new LicenseWebpackPlugin({
  additionalChunkModules: {
    main: [
      {
        name: 'somepkg'
        directory: path.join(__dirname, 'node_modules', 'somepkg')
      }
    ]
  }
});
```

---

**add additional node modules to the scan**

```javascript
new LicenseWebpackPlugin({
  additionalModules: [
    {
      name: 'somepkg'
      directory: path.join(__dirname, 'node_modules', 'somepkg')
    }
  ]
});
```

---

**help the plugin decide which license type to pick in case a package specifies multiple licenses**

```javascript
new LicenseWebpackPlugin({
  preferredLicenseTypes: ['MIT', 'ISC']
});
```

---

**do something when the plugin finds ambiguous license types**

```javascript
new LicenseWebpackPlugin({
  handleLicenseAmbiguity: (packageName, licenses) => {
    console.log(packageName);
    console.log(licenses[0].url);
    return licenses[0].type;
  }
});
```

Notes: This function is called whenever a license type could not be determined when a package uses the deprecated `licenses` field (which is an array of license types) in its package.json. It should return the license type to use. By default, the plugin prints a warning message to the console and chooses the first license type. You should use the `preferredLicenseTypes` option instead of this one.

---

**do something when a package is missing a license type**

```javascript
new LicenseWebpackPlugin({
  handleMissingLicenseType: (packageName) => {
    console.log(packageName);
    return null;
  }
});
```

Notes: You can return a license type from this function, but it is a better idea to use the `licenseTypeOverides` option.
