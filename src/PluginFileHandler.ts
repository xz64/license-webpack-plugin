import { FileHandler } from './FileHandler';
import { FileSystem } from './FileSystem';
import { Module } from './Module';
import { PackageJson } from './PackageJson';

class PluginFileHandler implements FileHandler {
  constructor(
    private fileSystem: FileSystem,
    private buildRoot: string,
    private modulesDirectories: string[] | null,
    private excludedPackageTest: ((packageName: string) => boolean)
  ) {}

  static PACKAGE_JSON: string = 'package.json';

  getModule(filename: string): Module | null {
    if (filename === null || filename === undefined) {
      return null;
    }

    if (this.modulesDirectories !== null) {
      let foundInModuleDirectory = false;
      for (const modulesDirectory of this.modulesDirectories) {
        if (this.fileSystem.isFileInDirectory(filename, modulesDirectory)) {
          foundInModuleDirectory = true;
        }
      }
      if (!foundInModuleDirectory) {
        return null;
      }
    }

    const module: Module | null = this.findModuleDir(filename);

    if (module !== null && this.excludedPackageTest(module.name)) {
      return null;
    }

    return module;
  }

  private findModuleDir(filename: string): Module | null {
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

    if (this.buildRoot === dirOfModule) {
      return null;
    }

    const packageJson: PackageJson = this.parsePackageJson(dirOfModule);

    return {
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
