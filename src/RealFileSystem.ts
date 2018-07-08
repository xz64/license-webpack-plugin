import * as fs from 'fs';
import * as path from 'path';

import { FileSystem } from './FileSystem';

class RealFileSystem implements FileSystem {
  pathSeparator: string = path.sep;

  isFileInDirectory(filename: string, directory: string): boolean {
    const normalizedFile = this.resolvePath(filename);
    const normalizedDirectory = this.resolvePath(directory);
    return normalizedFile.indexOf(normalizedDirectory) === 0;
  }

  pathExists(filename: string): boolean {
    return fs.existsSync(filename);
  }

  readFileAsUtf8(filename: string): string {
    return fs.readFileSync(filename, 'utf8');
  }

  join(...paths: string[]): string {
    return path.join(...paths);
  }

  resolvePath(pathInput: string): string {
    return path.resolve(pathInput);
  }
}

export { RealFileSystem };
