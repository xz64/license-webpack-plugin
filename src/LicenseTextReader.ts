import { LicenseTextOverrides } from './LicenseTextOverrides';
import { FileSystem } from './FileSystem';
import { Module } from './Module';
import { LicenseFileOverrides } from './LicenseFilesOverrides';
import { WebpackCompilation } from './WebpackCompilation';
import { Logger } from './Logger';

class LicenseTextReader {
  constructor(
    private logger: Logger,
    private fileSystem: FileSystem,
    private fileOverrides: LicenseFileOverrides,
    private textOverrides: LicenseTextOverrides,
    private templateDir: string | undefined,
    private handleMissingLicenseText: (
      packageName: string,
      licenseType: string | null
    ) => string | null
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
      return this.fileSystem.isFileInDirectory(filename, module.directory)
        ? this.readText(module.directory, filename)
        : null;
    }

    const pathsInModuleDirectory: string[] = this.fileSystem.listPaths(
      module.directory
    );

    const guessedLicenseFilename = this.guessLicenseFilename(
      pathsInModuleDirectory,
      module.directory
    );

    if (guessedLicenseFilename !== null) {
      return this.readText(module.directory, guessedLicenseFilename);
    }

    if (this.templateDir) {
      const templateFilename = `${licenseType}.txt`;
      const templateFilePath = this.fileSystem.join(
        this.templateDir,
        templateFilename
      );
      if (
        this.fileSystem.isFileInDirectory(templateFilePath, this.templateDir)
      ) {
        return this.fileSystem
          .readFileAsUtf8(templateFilePath)
          .replace(/\r\n/g, '\n');
      }
    }

    this.logger.warn(
      compilation,
      `could not find any license file for ${module.name}. Use the licenseTextOverrides option to add the license text if desired.`
    );
    return this.handleMissingLicenseText(module.name, licenseType);
  }

  readText(directory: string, filename: string): string {
    return this.fileSystem
      .readFileAsUtf8(this.fileSystem.join(directory, filename))
      .replace(/\r\n/g, '\n');
  }

  private guessLicenseFilename(
    paths: string[],
    modulePath: string
  ): string | null {
    for (const path of paths) {
      const filePath = this.fileSystem.join(modulePath, path);
      if (this.fileSystem.isDirectory(filePath)) {
        continue;
      }
      if (/^licen[cs]e/i.test(path)) {
        return path;
      }
    }
    return null;
  }
}

export { LicenseTextReader };
