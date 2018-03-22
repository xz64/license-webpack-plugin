import { PluginLicenseTestRunner } from '../PluginLicenseTestRunner';

describe('License Test Runner', () => {
  test('It handles functions', () => {
    const licenseTestRunner = new PluginLicenseTestRunner(x => x === 'MIT');
    expect(licenseTestRunner.test('MIT')).toBe(true);
    expect(licenseTestRunner.test('ISC')).toBe(false);
  });
});
