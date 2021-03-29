import { WebpackChunkHandler } from './WebpackChunkHandler';
import { WebpackChunk } from './WebpackChunk';
import { WebpackChunkModuleIterator } from './WebpackChunkModuleIterator';
import { WebpackModuleFileIterator } from './WebpackModuleFileIterator';
import { FileHandler } from './FileHandler';
import { LicenseTypeIdentifier } from './LicenseTypeIdentifier';
import { FileSystem } from './FileSystem';
import { PackageJson } from './PackageJson';
import { LicenseTextReader } from './LicenseTextReader';
import { ModuleCache } from './ModuleCache';
import { LicensePolicy } from './LicensePolicy';
import { Module } from './Module';
import { WebpackCompilation } from './WebpackCompilation';
import { Logger } from './Logger';
import { WebpackStats } from './WebpackStats';

class PluginChunkReadHandler implements WebpackChunkHandler {
  private moduleIterator = new WebpackChunkModuleIterator();
  private fileIterator = new WebpackModuleFileIterator(require.resolve);

  constructor(
    private logger: Logger,
    private fileHandler: FileHandler,
    private licenseTypeIdentifier: LicenseTypeIdentifier,
    private licenseTextReader: LicenseTextReader,
    private licensePolicy: LicensePolicy,
    private fileSystem: FileSystem
  ) {}

  processChunk(
    compilation: WebpackCompilation,
    chunk: WebpackChunk,
    moduleCache: ModuleCache,
    stats: WebpackStats | undefined
  ) {
    this.moduleIterator.iterateModules(compilation, chunk, stats, module => {
      this.fileIterator.iterateFiles(
        module,
        (filename: string | null | undefined) => {
          const module = this.fileHandler.getModule(filename);
          this.processModule(compilation, chunk, moduleCache, module);
        }
      );
    });
  }

  private getPackageJson(directory: string): PackageJson {
    const filename: string = `${directory}${this.fileSystem.pathSeparator}package.json`;
    return JSON.parse(this.fileSystem.readFileAsUtf8(filename));
  }

  processModule(
    compilation: WebpackCompilation,
    chunk: WebpackChunk,
    moduleCache: ModuleCache,
    module: Module | null
  ) {
    if (module && !moduleCache.alreadySeenForChunk(chunk.name, module.name)) {
      const alreadyIncludedModule = moduleCache.getModule(module.name);
      if (alreadyIncludedModule !== null) {
        moduleCache.registerModule(chunk.name, alreadyIncludedModule);
      } else {
        // module not yet in cache
        const packageJson: PackageJson = this.getPackageJson(module.directory);
        const licenseType:
          | string
          | null = this.licenseTypeIdentifier.findLicenseIdentifier(
          compilation,
          module.name,
          packageJson
        );
        if (this.licensePolicy.isLicenseUnacceptableFor(licenseType)) {
          this.logger.error(
            compilation,
            `unacceptable license found for ${module.name}: ${licenseType}`
          );
          this.licensePolicy.handleUnacceptableLicense(
            module.name,
            licenseType
          );
        }
        if (this.licensePolicy.isLicenseWrittenFor(licenseType)) {
          const licenseText = this.licenseTextReader.readLicense(
            compilation,
            module,
            licenseType
          );
          moduleCache.registerModule(chunk.name, {
            licenseText,
            packageJson,
            name: module.name,
            directory: module.directory,
            licenseId: licenseType
          });
        }
      }
      moduleCache.markSeenForChunk(chunk.name, module.name);
    }
  }
}

export { PluginChunkReadHandler };
