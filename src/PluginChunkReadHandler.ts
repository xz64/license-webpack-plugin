import { WebpackChunkHandler } from './WebpackChunkHandler';
import { WebpackChunk } from './WebpackChunk';
import { WebpackChunkModule } from './WebpackChunkModule';
import { WebpackChunkModuleIterator } from './WebpackChunkModuleIterator';
import { WebpackInnerModuleIterator } from './WebpackInnerModuleIterator';
import { FileHandler } from './FileHandler';
import { LicenseTypeIdentifier } from './LicenseTypeIdentifier';
import { FileSystem } from './FileSystem';
import { PackageJson } from './PackageJson';
import { LicenseTextReader } from './LicenseTextReader';
import { ModuleCache } from './ModuleCache';
import { LicensePolicy } from './LicensePolicy';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';
import { WebpackCompilation } from './WebpackCompilation';
import { Logger } from './Logger';
import { WebpackStats } from './WebpackStats';

class PluginChunkReadHandler implements WebpackChunkHandler {
  private moduleIterator = new WebpackChunkModuleIterator();
  private innerModuleIterator = new WebpackInnerModuleIterator(require.resolve);

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
    this.moduleIterator.iterateModules(
      compilation,
      chunk,
      stats,
      chunkModule => {
        this.innerModuleIterator.iterateModules(
          chunkModule,
          (module: WebpackChunkModule) => {
            const identifiedModule =
              this.extractIdentifiedModule(module) ||
              this.fileHandler.getModule(module.resource);
            if (identifiedModule) {
              this.processModule(
                compilation,
                chunk,
                moduleCache,
                identifiedModule
              );
            }
          }
        );
      }
    );
  }

  private extractIdentifiedModule(
    module: WebpackChunkModule
  ): LicenseIdentifiedModule | undefined {
    const resolved = module.resourceResolveData;
    if (!resolved) return undefined;
    const {
      descriptionFileRoot: directory,
      descriptionFileData: packageJson
    } = resolved;
    if (
      this.fileHandler.isInModuleDirectory(directory) &&
      !this.fileHandler.isBuildRoot(directory) &&
      !this.fileHandler.excludedPackageTest(packageJson.name)
    ) {
      return {
        directory,
        packageJson,
        name: packageJson.name
      };
    }
    return undefined;
  }

  private getPackageJson(directory: string): PackageJson {
    const filename: string = `${directory}${this.fileSystem.pathSeparator}package.json`;
    return JSON.parse(this.fileSystem.readFileAsUtf8(filename));
  }

  processModule(
    compilation: WebpackCompilation,
    chunk: WebpackChunk,
    moduleCache: ModuleCache,
    module: LicenseIdentifiedModule
  ) {
    if (!moduleCache.alreadySeenForChunk(chunk.name, module.name)) {
      const alreadyIncludedModule = moduleCache.getModule(module.name);
      if (alreadyIncludedModule !== null) {
        moduleCache.registerModule(chunk.name, alreadyIncludedModule);
      } else {
        // module not yet in cache
        const packageJson =
          module.packageJson ?? this.getPackageJson(module.directory);
        const licenseType = this.licenseTypeIdentifier.findLicenseIdentifier(
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
