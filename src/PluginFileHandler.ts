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
    const PACKAGE_JSON = 'package.json';
    let dirOfModule = filename.substring(
      0,
      filename.lastIndexOf(pathSeparator)
    );
    let oldDirOfModule: string | null = null;

    while (
      !this.fileSystem.pathExists(
        this.fileSystem.join(dirOfModule, PACKAGE_JSON)
      )
    ) {
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

    const packageJsonText = this.fileSystem.readFileAsUtf8(
      this.fileSystem.join(dirOfModule, PACKAGE_JSON)
    );
    const packageJson: PackageJson = JSON.parse(packageJsonText);

    return {
      name: packageJson.name,
      directory: dirOfModule
    };
  }
}

export { PluginFileHandler };
