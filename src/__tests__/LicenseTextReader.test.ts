import { FileSystem } from '../FileSystem';
import { LicenseTextReader } from '../LicenseTextReader';

class FakeFileSystem implements FileSystem {
  pathSeparator: string;

  constructor(pathSeparator: string) {
    this.pathSeparator = pathSeparator;
  }

  readFileAsUtf8(filename: string) {
    return 'LICENSE-' + filename;
  }

  pathExists(filename: string) {
    return filename !== '/project/notexist.txt';
  }

  isFileInDirectory(filename: string, directory: string) {
    return (
      filename === '/project/LICENSE' || filename === '/project/LICENSE\r\n'
    );
  }

  join(...paths: string[]) {
    return paths.join(this.pathSeparator);
  }
}

describe('the license text reader', () => {
  let fakeFileSystem: FileSystem;

  beforeAll(() => {
    fakeFileSystem = new FakeFileSystem('/');
  });

  test('overrides are honored', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      ['LICENSE'],
      fakeFileSystem,
      {},
      { foo: 'custom' },
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('custom');
  });

  test('file matches are honored', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      ['LICENSE'],
      fakeFileSystem,
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      {
        name: 'foo',
        directory: '/project'
      },
      ''
    );
    expect(licenseText).toBe('LICENSE-/project/LICENSE');
  });

  test('line endings are normalized', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      ['LICENSE\r\n'],
      fakeFileSystem,
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
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
      ['notexist.txt'],
      fakeFileSystem,
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
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
      [],
      fakeFileSystem,
      {},
      {},
      '/templates',
      () => null
    );
    const licenseText = reader.readLicense(
      {
        name: 'foo',
        directory: '/project'
      },
      'MIT'
    );
    expect(licenseText).toBe('LICENSE-/templates/MIT.txt');
  });

  test('the SEE LICENSE IN license type resolves the license text from the specified file', () => {
    const reader: LicenseTextReader = new LicenseTextReader(
      [],
      fakeFileSystem,
      {},
      {},
      null,
      () => null
    );
    const licenseText = reader.readLicense(
      {
        name: 'foo',
        directory: '/project'
      },
      'SEE LICENSE IN custom_file.txt'
    );
    expect(licenseText).toBe('LICENSE-/project/custom_file.txt');
  });
});
