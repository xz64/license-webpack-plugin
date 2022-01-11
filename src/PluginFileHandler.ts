import { FileHandler } from './FileHandler';
import { FileSystem } from './FileSystem';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';
import { PackageJson } from './PackageJson';

class PluginFileHandler implements FileHandler {
  private cache: { [key: string]: any } = {};
  constructor(
    private fileSystem: FileSystem,
    private buildRoot: string,
    private modulesDirectories: string[] | null,
    private excludedPackageTest: (packageName: string) => boolean
  ) {}

  static PACKAGE_JSON: string = 'package.json';

  getModule(filename: string): LicenseIdentifiedModule | null {
    return this.cache[filename] === undefined
      ? (this.cache[filename] = this.getModuleInternal(filename))
      : this.cache[filename];
  }

  isInModuleDirectory(filename: string) {
    if (this.modulesDirectories === null) return true;
    if (filename === null || filename === undefined) return false;
    let foundInModuleDirectory = false;
    const resolvedPath = this.fileSystem.resolvePath(filename);
    for (const modulesDirectory of this.modulesDirectories) {
      if (
        resolvedPath.startsWith(this.fileSystem.resolvePath(modulesDirectory))
      ) {
        foundInModuleDirectory = true;
      }
    }
    return foundInModuleDirectory;
  }

  isBuildRoot(filename: string) {
    return this.buildRoot === filename;
  }

  private getModuleInternal(
    filename: string
  ): Partial<LicenseIdentifiedModule> | null {
    if (filename === null || filename === undefined) return null;
    if (!this.isInModuleDirectory(filename)) return null;

    const module = this.findModuleDir(filename);

    if (module !== null && this.excludedPackageTest(module.name)) {
      return null;
    }

    return module;
  }

  private findModuleDir(
    filename: string
  ): Pick<
    LicenseIdentifiedModule,
    'name' | 'packageJson' | 'directory'
  > | null {
    const pathSeparator = this.fileSystem.pathSeparator;
    let dirOfModule = filename.substring(
      0,
      filename.lastIndexOf(pathSeparator)
    );
    let oldDirOfModule: string | null = null;

    while (!this.dirContainsValidPackageJson(dirOfModule)) {
      // check parent directory
      oldDirOfModule = dirOfModule;
      dirOfModule = this.fileSystem.resolvePath(
        `${dirOfModule}${pathSeparator}..${pathSeparator}`
      );

      // reached filesystem root
      if (oldDirOfModule === dirOfModule) {
        return null;
      }
    }

    if (this.isBuildRoot(dirOfModule)) {
      return null;
    }

    const packageJson: PackageJson = this.parsePackageJson(dirOfModule);

    return {
      packageJson,
      name: packageJson.name,
      directory: dirOfModule
    };
  }

  private parsePackageJson(dirOfModule: string): PackageJson {
    const packageJsonText = this.fileSystem.readFileAsUtf8(
      this.fileSystem.join(dirOfModule, PluginFileHandler.PACKAGE_JSON)
    );
    const packageJson: PackageJson = JSON.parse(packageJsonText);
    return packageJson;
  }

  private dirContainsValidPackageJson(dirOfModule: string): boolean {
    if (
      !this.fileSystem.pathExists(
        this.fileSystem.join(dirOfModule, PluginFileHandler.PACKAGE_JSON)
      )
    ) {
      return false;
    }

    const packageJson: PackageJson = this.parsePackageJson(dirOfModule);
    return !!packageJson.name;
  }
}

export { PluginFileHandler };
