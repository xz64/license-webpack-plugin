import { PluginFileHandler } from '../PluginFileHandler';
import { FileHandler } from '../FileHandler';
import { FileSystem } from '../FileSystem';
import { Module } from '../Module';

class FakeFileSystem implements FileSystem {
  pathSeparator: string;

  constructor(pathSeparator: string) {
    this.pathSeparator = pathSeparator;
  }

  readFileAsUtf8(filename: string) {
    return filename;
  }

  pathExists() {
    return true;
  }

  isFileInDirectory(filename: string, directory: string) {
    if (
      filename.indexOf('other_modules') > -1 &&
      directory.indexOf('node_modules') > -1
    ) {
      return false;
    }
    return (
      filename.indexOf('node_modules') > -1 ||
      filename.indexOf('other_modules') > -1
    );
  }

  join(...paths: string[]) {
    return paths.join(this.pathSeparator);
  }
}

describe('the file handler', () => {
  let fakeFileSystem: FileSystem;
  let fakeWindowsFileSystem: FileSystem;
  let pluginFileHandler: FileHandler;
  let windowsPluginFileHandler: FileHandler;

  beforeAll(() => {
    fakeFileSystem = new FakeFileSystem('/');
    fakeWindowsFileSystem = new FakeFileSystem('\\');
    pluginFileHandler = new PluginFileHandler(fakeFileSystem, '/home/repo', [
      'node_modules',
      'other_modules'
    ]);
    windowsPluginFileHandler = new PluginFileHandler(
      fakeWindowsFileSystem,
      'C:\\home\\repo',
      ['node_modules', 'other_modules']
    );
  });

  test('returns null for null filename', () => {
    const module: Module = pluginFileHandler.getModule(null);
    expect(module).toBeNull();
  });

  test('returns null for undefined filename', () => {
    const module: Module = pluginFileHandler.getModule(undefined);
    expect(module).toBeNull();
  });

  test('handles a simple module from node_modules', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/node_modules/foo/lib.js'
    );
    expect(module.name).toBe('foo');
    expect(module.directory).toBe('/home/repo/node_modules/foo');
  });

  test('returns null for a stray file in node_modules', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/node_modules/a.js'
    );
    expect(module).toBeNull();
  });

  test('returns null for local non-module file', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/src/main.js'
    );
    expect(module).toBeNull();
  });

  test('extracts scoped package names correctly', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/node_modules/@foo/bar/lib.js'
    );
    expect(module.name).toBe('@foo/bar');
    expect(module.directory).toBe('/home/repo/node_modules/@foo/bar');
  });

  test('extracts double scoped package names correctly', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/node_modules/@foo/bar/@bar/lib.js'
    );
    expect(module.name).toBe('@foo/bar');
    expect(module.directory).toBe('/home/repo/node_modules/@foo/bar');
  });

  test('handles custom modules directories', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/other_modules/someothermodule/lib.js'
    );
    expect(module.name).toBe('someothermodule');
    expect(module.directory).toBe('/home/repo/other_modules/someothermodule');
  });

  test('extracts scoped package names correctly on windows', () => {
    const module: Module = windowsPluginFileHandler.getModule(
      'C:\\home\\repo\\node_modules\\@foo\\bar\\lib.js'
    );
    expect(module.name).toBe('@foo/bar');
    expect(module.directory).toBe('C:\\home\\repo\\node_modules\\@foo\\bar');
  });
});
