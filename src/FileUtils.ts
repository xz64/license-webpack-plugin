import { accessSync } from 'fs';

class FileUtils {
  static MODULE_DIR: string = 'node_modules';

  static isThere(file: string): boolean {
    let exists = true;
    try {
      accessSync(file);
    } catch (e) {
      exists = false;
    }
    return exists;
  }
}

export { FileUtils };
