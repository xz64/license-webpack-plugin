import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';
import { ConstructedOptions } from './ConstructedOptions';
import { PluginOptions } from './PluginOptions';

class PluginOptionsReader {
  constructor(private guessedBuildRoot: string) {}

  readOptions(options: PluginOptions): ConstructedOptions {
    const buildRoot = options.buildRoot || this.guessedBuildRoot;
    const licenseInclusionTest = options.licenseInclusionTest || (() => true);
    const unacceptableLicenseTest =
      options.unacceptableLicenseTest || (() => false);
    const perChunkOutput = options.perChunkOutput === undefined;
    const licenseFilenames = options.licenseFilenames || [
      'LICENSE',
      'LICENSE.md',
      'LICENSE.txt',
      'license',
      'license.md',
      'license.txt'
    ];
    const licenseTemplateDir = options.licenseTemplateDir;
    const licenseTextOverrides = options.licenseTextOverrides || {};
    const licenseTypeOverrides = options.licenseTypeOverrides || {};
    const handleUnacceptableLicense =
      options.handleUnacceptableLicense || (() => {});
    const handleMissingLicenseText =
      options.handleMissingLicenseText ||
      ((packageName: string) => {
        console.warn(
          `license-webpack-plugin: could not find any license file for ${packageName}. Use the licenseTextOverrides option to add the license text if desired.`
        );
        return null;
      });
    const renderLicenses =
      options.renderLicenses ||
      ((modules: LicenseIdentifiedModule[]) => {
        return modules
          .reduce((file, module) => {
            return `${file}${module.name}${
              module.licenseId ? `\n${module.licenseId}` : ''
            }${module.licenseText ? `\n${module.licenseText}` : ''}\n\n`;
          }, '')
          .trim();
      });
    const renderBanner =
      options.renderBanner ||
      ((filename: string) => {
        return `/*! License information is available at ${filename} */`;
      });
    const outputFilename = options.outputFilename || '[name].licenses.text';
    const addBanner =
      options.addBanner === undefined ? true : options.addBanner;
    const chunkIncludeExcludeTest =
      options.chunkIncludeExcludeTest || (() => true);
    const modulesDirectories = options.modulesDirectories || ['node_modules'];
    const additionalChunkModules = options.additionalChunkModules || {};
    const additionalModules = options.additionalModules || [];
    const preferredLicenseTypes = options.preferredLicenseTypes || [];
    const handleLicenseAmbiguity =
      options.handleLicenseAmbiguity ||
      ((packageName, licenses) => {
        const selectedLicense = licenses[0].type;
        const licenseTypes: string = licenses.map(x => x.type).join();
        console.warn(
          `license-webpack-plugin: ${packageName} specifies multiple licenses: ${licenseTypes}. Selecting ${selectedLicense}. Use the preferredLicenseTypes or the licenseTypeOverrides option to override this behavior.`
        );
        return selectedLicense;
      });
    const handleMissingLicenseType =
      options.handleMissingLicenseType ||
      ((packageName: string) => {
        console.error(
          `license-webpack-plugin: could not find any license type for ${packageName} in its package.json`
        );
        return null;
      });
    const licenseFileOverrides: { [key: string]: string } =
      options.licenseFileOverrides || {};
    const excludedPackageTest: ((packageName: string) => boolean) =
      options.excludedPackageTest || (() => false);

    const constructedOptions: ConstructedOptions = {
      buildRoot,
      licenseInclusionTest,
      unacceptableLicenseTest,
      perChunkOutput,
      licenseFilenames,
      licenseTemplateDir,
      licenseTextOverrides,
      licenseFileOverrides,
      licenseTypeOverrides,
      handleUnacceptableLicense,
      handleMissingLicenseText,
      renderLicenses,
      renderBanner,
      outputFilename,
      addBanner,
      chunkIncludeExcludeTest,
      modulesDirectories,
      additionalChunkModules,
      additionalModules,
      preferredLicenseTypes,
      handleLicenseAmbiguity,
      handleMissingLicenseType,
      excludedPackageTest
    };

    return constructedOptions;
  }
}

export { PluginOptionsReader };
