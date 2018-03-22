import { FileHandler } from './FileHandler';
import { FileSystem } from './FileSystem';
import { Module } from './Module';

class PluginFileHandler implements FileHandler {
  private modulesDirectories: string[];

  constructor(
    private fileSystem: FileSystem,
    buildRoot: string,
    modulesDirectories: string[]
  ) {
    this.modulesDirectories = modulesDirectories.map(
      x => buildRoot + this.fileSystem.pathSeparator + x
    );
  }

  getModule(filename: string): Module | null {
    if (filename === null || filename === undefined) {
      return null;
    }

    for (const modulesDirectory of this.modulesDirectories) {
      if (this.fileSystem.isFileInDirectory(filename, modulesDirectory)) {
        const module: Module | null = this.findModuleDir(
          filename,
          modulesDirectory
        );
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
    let moduleSubDir: string = filename.replace(
      modulesDirectory + pathSeparator,
      ''
    );
    if (moduleSubDir.indexOf(this.fileSystem.pathSeparator) === -1) {
      // this could be a file like node_modules/a.js, which should be excluded as it does not belong to any package
      return null;
    }
    if (moduleSubDir.charAt(0) === '@') {
      // extract @scope/a out of @scope/a/filename.js
      moduleSubDir = moduleSubDir.substring(
        0,
        moduleSubDir.replace(pathSeparator, ' ').indexOf(pathSeparator)
      );
    } else {
      moduleSubDir = moduleSubDir.substring(
        0,
        moduleSubDir.indexOf(pathSeparator)
      );
    }
    return {
      name: moduleSubDir.replace('\\', '/'),
      directory: modulesDirectory + this.fileSystem.pathSeparator + moduleSubDir
    };
  }
}

export { PluginFileHandler };
