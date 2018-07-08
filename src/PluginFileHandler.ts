import { FileHandler } from './FileHandler';
import { FileSystem } from './FileSystem';
import { Module } from './Module';
import { PackageJson } from './PackageJson';

class PluginFileHandler implements FileHandler {
  private fullModulesDirectories: string[];

  constructor(
    private fileSystem: FileSystem,
    buildRoot: string,
    modulesDirectories: string[],
    private excludedPackageTest: ((packageName: string) => boolean)
  ) {
    this.fullModulesDirectories = modulesDirectories.map(modulesDirectory =>
      this.fileSystem.resolvePath(
        this.fileSystem.join(buildRoot, modulesDirectory)
      )
    );
  }

  getModule(filename: string): Module | null {
    if (filename === null || filename === undefined) {
      return null;
    }

    for (const modulesDirectory of this.fullModulesDirectories) {
      if (this.fileSystem.isFileInDirectory(filename, modulesDirectory)) {
        const module: Module | null = this.findModuleDir(
          filename,
          modulesDirectory
        );
        if (module !== null && this.excludedPackageTest(module.name)) {
          return null;
        }
        return module;
      }
    }
    return null;
  }

  private findModuleDir(
    filename: string,
    modulesDirectory: string
  ): Module | null {
    const pathSeparator = this.fileSystem.pathSeparator;
    const PACKAGE_JSON = 'package.json';
    let dirOfModule = filename.substring(
      0,
      filename.lastIndexOf(pathSeparator)
    );

    // exit if we found something like node_modules/foo.js
    // as it does not belong to any package
    if (dirOfModule === modulesDirectory) {
      return null;
    }

    while (
      !this.fileSystem.pathExists(
        this.fileSystem.join(dirOfModule, PACKAGE_JSON)
      )
    ) {
      // check parent directory
      dirOfModule = this.fileSystem.resolvePath(
        dirOfModule + pathSeparator + '..' + pathSeparator
      );
      if (dirOfModule === modulesDirectory) {
        // traversed too many directories up
        return null;
      }
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
