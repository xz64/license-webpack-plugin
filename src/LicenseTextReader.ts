import { LicenseTextOverrides } from './LicenseTextOverrides';
import { FileSystem } from './FileSystem';
import { Module } from './Module';
import { LicenseFileOverrides } from './LicenseFilesOverrides';
import { WebpackCompilation } from './WebpackCompilation';

class LicenseTextReader {
  constructor(
    private fileSystem: FileSystem,
    private fileOverrides: LicenseFileOverrides,
    private textOverrides: LicenseTextOverrides,
    private templateDir: string | undefined,
    private handleMissingLicenseText: ((
      packageName: string,
      licenseType: string | null
    ) => string | null)
  ) {}

  readLicense(
    compilation: WebpackCompilation,
    module: Module,
    licenseType: string | null
  ): string | null {
    if (this.textOverrides[module.name]) {
      return this.textOverrides[module.name];
    }

    if (this.fileOverrides[module.name]) {
      return this.readText(module.directory, this.fileOverrides[module.name]);
    }

    if (licenseType && licenseType.indexOf('SEE LICENSE IN ') === 0) {
      const filename = licenseType.split(' ')[3];
      return this.readText(module.directory, filename);
    }

    const pathsInModuleDirectory: string[] = this.fileSystem.listPaths(
      module.directory
    );
    const guessedLicenseFilename = this.guessLicenseFilename(
      pathsInModuleDirectory
    );

    if (guessedLicenseFilename !== null) {
      return this.readText(module.directory, guessedLicenseFilename);
    }

    if (this.templateDir) {
      return this.fileSystem
        .readFileAsUtf8(
          this.fileSystem.join(this.templateDir, `${licenseType}.txt`)
        )
        .replace(/\r\n/g, '\n');
    }

    compilation.warnings.push(
      `license-webpack-plugin: could not find any license file for ${
        module.name
      }. Use the licenseTextOverrides option to add the license text if desired.`
    );
    return this.handleMissingLicenseText(module.name, licenseType);
  }

  readText(directory: string, filename: string): string {
    return this.fileSystem
      .readFileAsUtf8(this.fileSystem.join(directory, filename))
      .replace(/\r\n/g, '\n');
  }

  private guessLicenseFilename(paths: string[]): string | null {
    for (const path of paths) {
      if (/^licen[cs]e/i.test(path)) {
        return path;
      }
    }
    return null;
  }
}

export { LicenseTextReader };
