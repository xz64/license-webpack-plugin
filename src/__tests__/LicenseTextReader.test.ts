import { FileSystem } from '../FileSystem';
import { LicenseTextReader } from '../LicenseTextReader';
import { Compilation as compilation } from './FakeCompilation';
import { FakeLogger as logger } from './FakeLogger';

class FakeFileSystem implements FileSystem {
  pathSeparator: string = '/';

  constructor(
    private licenseFilenames: string[],
    private useCRLF: boolean = false
  ) {}

  readFileAsUtf8(filename: string) {
    return 'LICENSE-' + filename + (this.useCRLF ? '\r\n' : '');
  }

  pathExists(filename: string) {
    return filename !== '/project/notexist.txt';
  }

  isFileInDirectory(filename: string, directory: string) {
    return (
      filename === '/project/LICENSE' ||
      filename === 'custom_file.txt' ||
      (directory === '/templates' && filename === 'MIT.txt')
    );
  }

  join(...paths: string[]) {
    return paths.join(this.pathSeparator);
  }

  resolvePath(pathInput: string) {
    return pathInput;
  }

  listPaths(dir: string): string[] {
    if (dir === '/project' || dir === '/example-js-lib') {
      return this.licenseFilenames;
    }
    throw new Error(`not implemented for ${dir}`);
  }

  isDirectory(dir: string): boolean {
    return dir === '/example-js-lib/licence';
  }
}

describe('the license text reader', () => {
  test('overrides are honored', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENSE']),
      {},
      { foo: 'custom' },
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('custom');
  });

  test('LICENSE file is detected', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENSE']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/LICENSE');
  });

  test('LICENCE file is detected', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENCE']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/LICENCE');
  });

  test('license files ending with an extension are detected', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['license.txt']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/license.txt');
  });

  test('license files with a suffix are detected', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['license-MIT.txt']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/license-MIT.txt');
  });

  test('line endings are normalized', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENSE'], true),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/LICENSE\n');
  });

  test('non-matches return null', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem([]),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      'MIT'
    );
    expect(licenseText).toBe(null);
  });

  test('template dir is used as a fallback', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem([]),
      {},
      {},
      '/templates',
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      'MIT'
    );
    expect(licenseText).toBe('LICENSE-/templates/MIT.txt');
  });

  test('calls handleMissingLicenseText if template dir is used as a fallback but no template is available', () => {
    const handleMissingLicenseText = jest.fn();
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem([]),
      {},
      {},
      '/templates',
      handleMissingLicenseText
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      'FOO'
    );
    expect(handleMissingLicenseText).toBeCalledWith('foo', 'FOO');
  });

  test('the SEE LICENSE IN license type resolves the license text from the specified file', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENSE']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      'SEE LICENSE IN custom_file.txt'
    );
    expect(licenseText).toBe('LICENSE-/project/custom_file.txt');
  });

  test('the SEE LICENSE IN license type does not try to resolve nonexistent files', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['LICENSE']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/project'
      },
      'SEE LICENSE IN https://something'
    );
    expect(licenseText).toBeNull();
  });

  test('it does not try to resolve licence type when it is a directory', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      logger,
      new FakeFileSystem(['licence']),
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      compilation,
      {
        name: 'foo',
        directory: '/example-js-lib'
      },
      ''
    );
    expect(licenseText).toBeNull();
  });
});
