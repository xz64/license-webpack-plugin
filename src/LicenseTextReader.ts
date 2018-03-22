import { LicenseTextOverrides } from './LicenseTextOverrides';
import { FileSystem } from './FileSystem';
import { Module } from './Module';
import { LicenseFileOverrides } from './LicenseFilesOverrides';

class LicenseTextReader {
  constructor(
    private licenseFilenames: string[],
    private fileSystem: FileSystem,
    private fileOverrides: LicenseFileOverrides,
    private textOverrides: LicenseTextOverrides,
    private templateDir: string | undefined,
    private handleMissingLicenseText: ((
      packageName: string,
      licenseType: string | null
    ) => string | null)
  ) {}

  readLicense(module: Module, licenseType: string | null): string | null {
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

    for (const filename of this.licenseFilenames) {
      if (
        this.fileSystem.pathExists(
          this.fileSystem.join(module.directory, filename)
        )
      ) {
        return this.readText(module.directory, filename);
      }
    }

    if (this.templateDir) {
      return this.fileSystem
        .readFileAsUtf8(
          this.fileSystem.join(this.templateDir, `${licenseType}.txt`)
        )
        .replace(/\r\n/g, '\n');
    }

    return this.handleMissingLicenseText(module.name, licenseType);
  }

  readText(directory: string, filename: string): string {
    return this.fileSystem
      .readFileAsUtf8(this.fileSystem.join(directory, filename))
      .replace(/\r\n/g, '\n');
  }
}

export { LicenseTextReader };
