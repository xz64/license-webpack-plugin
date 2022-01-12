import * as path from 'path';

import { FileSystem } from './FileSystem';

class WebpackFileSystem implements FileSystem {
  pathSeparator: string = path.sep;

  constructor(private fs: any) {}

  isFileInDirectory(filename: string, directory: string): boolean {
    const normalizedFile = this.resolvePath(filename);
    const normalizedDirectory = this.resolvePath(directory);
    return (
      !this.isDirectory(normalizedFile) &&
      normalizedFile.indexOf(normalizedDirectory) === 0
    );
  }

  pathExists(filename: string): boolean {
    try {
      const stat = this.fs.statSync(filename, { throwIfNoEntry: false });
      return !!stat;
    } catch (e) {
      return false;
    }
  }

  readFileAsUtf8(filename: string): string {
    return this.fs.readFileSync(filename).toString('utf8');
  }

  join(...paths: string[]): string {
    return path.join(...paths);
  }

  resolvePath(pathInput: string): string {
    return path.resolve(pathInput);
  }

  listPaths(dir: string): string[] {
    return this.fs.readdirSync(dir);
  }

  isDirectory(dir: string): boolean {
    let isDir = false;
    try {
      isDir = this.fs.statSync(dir, { throwIfNoEntry: false }).isDirectory();
    } catch (e) {}
    return isDir;
  }
}

export { WebpackFileSystem };
