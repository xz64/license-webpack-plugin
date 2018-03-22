import { BuildRootFinder } from '../BuildRootFinder';
import { FileSystem } from '../FileSystem';

class FakeFileSystem implements FileSystem {
  pathSeparator = '/';

  constructor(private existingPaths: string[] = []) {}

  readFileAsUtf8(filename: string) {
    return filename;
  }

  pathExists(filename: string) {
    return this.existingPaths.indexOf(filename) > -1;
  }

  isFileInDirectory(filename: string, directory: string): boolean {
    throw new Error('not implemented');
  }

  join(...paths: string[]) {
    return paths.join(this.pathSeparator);
  }
}

describe('the build root finder', () => {
  test('can find the build root from a straightforward webpack compiler context', () => {
    const fileSystem = new FakeFileSystem([
      '/project1',
      '/project1/node_modules'
    ]);
    const buildRootFinder = new BuildRootFinder(fileSystem);
    const buildRoot = buildRootFinder.findBuildRoot('/project1');
    expect(buildRoot).toBe('/project1');
  });

  test('can find the build root from a webpack compiler context inside node_modules', () => {
    const fileSystem = new FakeFileSystem(['/project1']);
    const buildRootFinder = new BuildRootFinder(fileSystem);
    const buildRoot = buildRootFinder.findBuildRoot(
      '/project1/node_modules/foo/webpack-gen'
    );
    expect(buildRoot).toBe('/project1');
  });

  test('can find the build root from a webpack compiler context somewhere inside the project directory', () => {
    const fileSystem = new FakeFileSystem([
      '/project1',
      '/project1/node_modules'
    ]);
    const buildRootFinder = new BuildRootFinder(fileSystem);
    const buildRoot = buildRootFinder.findBuildRoot('/project1/configs');
    expect(buildRoot).toBe('/project1');
  });

  test('throws an error if it cannot find the build root', () => {
    const fileSystem = new FakeFileSystem(['/project1']);
    const buildRootFinder = new BuildRootFinder(fileSystem);
    expect(() => buildRootFinder.findBuildRoot('/project1/configs')).toThrow();
  });
});
