import { PluginLicenseTypeIdentifier } from '../PluginLicenseTypeIdentifier';

describe('LicenseTypeIdentifier', () => {
  test('It handles overrides', () => {
    const identifier = new PluginLicenseTypeIdentifier(
      { foo: 'ISC' },
      [],
      (_, licenses) => licenses[0].type,
      () => null
    );
    expect(
      identifier.findLicenseIdentifier('foo', { name: 'foo', version: '1.0.0' })
    ).toBe('ISC');
  });

  test('It handles the license field in package.json', () => {
    const identifier = new PluginLicenseTypeIdentifier(
      {},
      [],
      (_, licenses) => licenses[0].type,
      () => null
    );
    expect(
      identifier.findLicenseIdentifier('foo', {
        name: 'foo',
        version: '1.0.0',
        license: 'ISC'
      })
    ).toBe('ISC');
  });

  test('It selects the first license type when there are multiple license types', () => {
    const identifier = new PluginLicenseTypeIdentifier(
      {},
      [],
      (_, licenses) => licenses[0].type,
      () => null
    );
    const fooPackageJson = {
      name: 'foo',
      version: '1.0.0',
      licenses: [
        {
          type: 'MIT',
          url: 'b'
        },
        {
          type: 'BSD-3-Clause',
          url: 'a'
        }
      ]
    };
    const licenseType = identifier.findLicenseIdentifier('foo', fooPackageJson);
    expect(licenseType).toBe('MIT');
  });

  test('It selects a preferred license when there is a preferred license type match', () => {
    const identifier = new PluginLicenseTypeIdentifier(
      {},
      ['BSD-3-Clause'],
      (_, licenses) => licenses[0].type,
      () => null
    );
    const fooPackageJson = {
      name: 'foo',
      version: '1.0.0',
      licenses: [
        {
          type: 'MIT',
          url: 'b'
        },
        {
          type: 'BSD-3-Clause',
          url: 'a'
        }
      ]
    };
    const licenseType = identifier.findLicenseIdentifier('foo', fooPackageJson);
    expect(licenseType).toBe('BSD-3-Clause');
  });

  test('It selects the first license if there is no preferred license matched', () => {
    const identifier = new PluginLicenseTypeIdentifier(
      {},
      ['BSD-3-Clause'],
      (_, licenses) => licenses[0].type,
      () => null
    );
    const fooPackageJson = {
      name: 'foo',
      version: '1.0.0',
      licenses: [
        {
          type: 'MIT',
          url: 'b'
        },
        {
          type: 'ABCD',
          url: 'a'
        }
      ]
    };
    const licenseType = identifier.findLicenseIdentifier('foo', fooPackageJson);
    expect(licenseType).toBe('MIT');
  });
});
