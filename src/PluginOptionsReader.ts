import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';
import { ConstructedOptions } from './ConstructedOptions';
import { PluginOptions } from './PluginOptions';

class PluginOptionsReader {
  constructor(private context: string) {}

  readOptions(options: PluginOptions): ConstructedOptions {
    const silent = options.silent === undefined ? false : options.silent;
    const licenseInclusionTest = options.licenseInclusionTest || (() => true);
    const unacceptableLicenseTest =
      options.unacceptableLicenseTest || (() => false);
    const perChunkOutput = options.perChunkOutput === undefined;
    const licenseTemplateDir = options.licenseTemplateDir;
    const licenseTextOverrides = options.licenseTextOverrides || {};
    const licenseTypeOverrides = options.licenseTypeOverrides || {};
    const handleUnacceptableLicense =
      options.handleUnacceptableLicense || (() => {});
    const handleMissingLicenseText =
      options.handleMissingLicenseText ||
      ((packageName: string) => {
        if (!silent) {
          console.warn(
            `license-webpack-plugin: could not find any license file for ${packageName}. Use the licenseTextOverrides option to add the license text if desired.`
          );
        }
        return null;
      });
    const renderLicenses =
      options.renderLicenses ||
      ((modules: LicenseIdentifiedModule[]) => {
        return (
          modules
            .reduce((file, module) => {
              return `${file}${module.name}${
                module.licenseId ? `\n${module.licenseId}` : ''
              }${module.licenseText ? `\n${module.licenseText}` : ''}\n\n`;
            }, '')
            .trim() + '\n'
        );
      });
    const renderBanner =
      options.renderBanner ||
      ((filename: string) => {
        return `/*! License information is available at ${filename} */`;
      });
    const outputFilename =
      options.outputFilename ||
      (perChunkOutput ? '[name].licenses.txt' : 'licenses.txt');
    const addBanner =
      options.addBanner === undefined ? false : options.addBanner;
    const chunkIncludeExcludeTest =
      options.chunkIncludeExcludeTest || (() => true);
    const modulesDirectories = options.modulesDirectories || null;
    const additionalChunkModules = options.additionalChunkModules || {};
    const additionalModules = options.additionalModules || [];
    const preferredLicenseTypes = options.preferredLicenseTypes || [];
    const handleLicenseAmbiguity =
      options.handleLicenseAmbiguity ||
      ((packageName, licenses) => {
        const selectedLicense = licenses[0].type;
        const licenseTypes: string = licenses.map(x => x.type).join();
        if (!silent) {
          console.warn(
            `license-webpack-plugin: ${packageName} specifies multiple licenses: ${licenseTypes}. Selecting ${selectedLicense}. Use the preferredLicenseTypes or the licenseTypeOverrides option to override this behavior.`
          );
        }
        return selectedLicense;
      });
    const handleMissingLicenseType =
      options.handleMissingLicenseType ||
      ((packageName: string) => {
        if (!silent) {
          console.error(
            `license-webpack-plugin: could not find any license type for ${packageName} in its package.json`
          );
        }
        return null;
      });
    const licenseFileOverrides: { [key: string]: string } =
      options.licenseFileOverrides || {};
    const excludedPackageTest: ((packageName: string) => boolean) =
      options.excludedPackageTest || (() => false);

    const constructedOptions: ConstructedOptions = {
      licenseInclusionTest,
      unacceptableLicenseTest,
      perChunkOutput,
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
      excludedPackageTest,
      buildRoot: this.context
    };

    return constructedOptions;
  }
}

export { PluginOptionsReader };
