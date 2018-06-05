import { LicenseTest } from './LicenseTest';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';
import { IncludeExcludeTest } from './IncludeExcludeTest';
import { Module } from './Module';

interface PluginOptions {
  licenseInclusionTest?: LicenseTest;
  unacceptableLicenseTest?: LicenseTest;
  handleUnacceptableLicense?: ((
    packageName: string,
    licenseType: string
  ) => void);
  handleMissingLicenseText?: ((
    packageName: string,
    licenseType: string | null
  ) => string | null);
  perChunkOutput?: boolean;
  licenseFilenames?: string[];
  licenseTemplateDir?: string;
  licenseTextOverrides?: { [key: string]: string };
  licenseFileOverrides?: { [key: string]: string };
  licenseTypeOverrides?: { [key: string]: string };
  renderLicenses?: ((modules: LicenseIdentifiedModule[]) => string);
  renderBanner?: ((
    filename: string,
    modules: LicenseIdentifiedModule[]
  ) => string);
  outputFilename?: string;
  addBanner?: boolean;
  chunkIncludeExcludeTest?: IncludeExcludeTest;
  buildRoot?: string;
  modulesDirectories?: string[];
  additionalChunkModules?: { [chunkName: string]: Module[] };
  additionalModules?: Module[];
  preferredLicenseTypes?: string[];
  handleLicenseAmbiguity?: ((
    packageName: string,
    licenses: { type: string; url: string }[]
  ) => string);
  handleMissingLicenseType?: ((packageName: string) => string | null);
  excludedPackageTest?: ((packageName: string) => boolean);
}

export { PluginOptions };
