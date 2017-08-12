# Migration Guide

## 0.6.x to 1.x

* Change `require('license-webpack-plugin')` to `require('license-webpack-plugin').LicenseWebpackPlugin`.
* Change `includeUndefined` in the plugin options to `includePackagesWithoutLicense`.
* The following options have been removed: 
  - `addVersion` - Use the new `outputTemplate` option to configure an ejs template to be used for writing the output.
  - `addLicenseText` - Use the new `outputTemplate` option to configure an ejs template to be used for writing the output.
  - `addUrl` - Use the new `outputTemplate` option to configure an ejs template to be used for writing the output.
  - `filename` - The plugin outputs an individual file per chunk now and is configured by the `outputFilename` option. Check the `README.md` file to see how it works.
