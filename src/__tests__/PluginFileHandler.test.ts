import { PluginFileHandler } from '../PluginFileHandler';
import { FileHandler } from '../FileHandler';
import { FileSystem } from '../FileSystem';
import { Module } from '../Module';

class FakeFileSystem implements FileSystem {
  pathSeparator: string;
  availableFiles: { [key: string]: string } = {
    '/home/repo': '[directory]',
    '/home/repo/package.json': '{"name":"repo"}',
    '/home/repo/node_modules/foo': '[directory]',
    '/home/repo/node_modules/a.js': 'a.js',
    '/home/repo/node_modules/foo/lib.js': 'foo.txt',
    '/home/repo/node_modules/foo/package.json': '{"name":"foo"}',
    '/home/repo/other_modules': '[directory]',
    '/home/repo/other_modules/someothermodule': '[directory]',
    '/home/repo/other_modules/someothermodule/package.json':
      '{"name":"someothermodule"}',
    '/home/repo/other_modules/someothermodule/lib.js': 'lib.js',
    '/home/repo/node_modules/excluded-package': '[directory]',
    '/home/repo/node_modules/excluded-package/lib.js': 'lib.js'
  };

  constructor(pathSeparator: string) {
    this.pathSeparator = pathSeparator;
  }

  readFileAsUtf8(filename: string) {
    return this.availableFiles[filename];
  }

  pathExists(path: string) {
    return !!this.availableFiles[path];
  }

  isFileInDirectory(filename: string, directory: string) {
    return (
      this.resolvePath(filename).indexOf(this.resolvePath(directory)) === 0
    );
  }

  join(...paths: string[]) {
    return paths.join(this.pathSeparator);
  }

  resolvePath(pathInput: string) {
    if (pathInput.indexOf(this.pathSeparator) === -1) {
      return pathInput;
    }
    const pathElements: string[] = pathInput.split(this.pathSeparator);
    let resolvedPath = this.pathSeparator === '/' ? '' : 'C:';
    for (let i = 0; i < pathElements.length - 1; i++) {
      const pathElement = pathElements[i];
      if (pathElement === '') {
        continue;
      }
      if (pathElement === '..') {
        resolvedPath = resolvedPath.substring(
          0,
          resolvedPath.lastIndexOf(this.pathSeparator)
        );
        continue;
      }
      resolvedPath += this.pathSeparator + pathElement;
    }

    const lastPathElement = pathElements[pathElements.length - 1];
    if (lastPathElement !== '') {
      resolvedPath += this.pathSeparator + lastPathElement;
    }
    return resolvedPath;
  }

  listPaths(dir: string): string[] {
    throw new Error('not implemented');
  }
}

describe('the file handler', () => {
  let fakeFileSystem: FileSystem;
  let pluginFileHandler: FileHandler;

  beforeAll(() => {
    fakeFileSystem = new FakeFileSystem('/');
    pluginFileHandler = new PluginFileHandler(
      fakeFileSystem,
      '/home/repo',
      ['node_modules', 'other_modules'],
      packageName => packageName === 'excluded-package'
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

  test('handles custom modules directories', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/other_modules/someothermodule/lib.js'
    );
    expect(module.name).toBe('someothermodule');
    expect(module.directory).toBe('/home/repo/other_modules/someothermodule');
  });

  test('excludes packages according to the exclude option', () => {
    const module: Module = pluginFileHandler.getModule(
      '/home/repo/node_modules/excluded-package/lib.js'
    );
    expect(module).toBeNull();
  });
});
