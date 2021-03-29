import { LicensePolicy } from './LicensePolicy';
import { LicenseTestRunner } from './LicenseTestRunner';

class PluginLicensePolicy implements LicensePolicy {
  constructor(
    private licenseTester: LicenseTestRunner,
    private unacceptableLicenseTester: LicenseTestRunner,
    private unacceptableLicenseHandler: (
      packageName: string,
      licenseType: string
    ) => void,
    private missingLicenseTextHandler: (
      packageName: string,
      licenseType: string
    ) => void
  ) {}

  isLicenseWrittenFor(licenseType: string): boolean {
    return this.licenseTester.test(licenseType);
  }
  isLicenseUnacceptableFor(licenseType: string): boolean {
    return this.unacceptableLicenseTester.test(licenseType);
  }

  handleUnacceptableLicense(packageName: string, licenseType: string) {
    this.unacceptableLicenseHandler(packageName, licenseType);
  }

  handleMissingLicenseText(packageName: string, licenseType: string) {
    this.missingLicenseTextHandler(packageName, licenseType);
  }
}

export { PluginLicensePolicy };
