import { LicenseTest } from './LicenseTest';
import { LicenseTestRunner } from './LicenseTestRunner';

class PluginLicenseTestRunner implements LicenseTestRunner {
  constructor(private licenseTest: LicenseTest) {}

  test(licenseId: string): boolean {
    return this.licenseTest(licenseId);
  }
}

export { PluginLicenseTestRunner };
