import { LicenseTypeIdentifier } from './LicenseTypeIdentifier';
import { PackageJson } from './PackageJson';
import { LicenseTypeOverrides } from './LicenseTypeOverrides';

class PluginLicenseTypeIdentifier implements LicenseTypeIdentifier {
  constructor(
    private licenseTypeOverrides: LicenseTypeOverrides,
    private preferredLicenseTypes: string[],
    private handleLicenseAmbiguity: ((
      packageName: string,
      licenses: { type: string; url: string }[]
    ) => string),
    private handleMissingLicenseType: ((packageName: string) => string | null)
  ) {}

  findLicenseIdentifier(
    packageName: string,
    packageJson: PackageJson
  ): string | null {
    if (this.licenseTypeOverrides && this.licenseTypeOverrides[packageName]) {
      return this.licenseTypeOverrides[packageName];
    }

    if (packageJson.license) {
      return packageJson.license;
    }

    // handle deprecated "licenses" field in package.json
    if (
      Array.isArray(packageJson.licenses) &&
      packageJson.licenses.length > 0
    ) {
      if (packageJson.licenses.length === 1) {
        return packageJson.licenses[0].type;
      }

      // handle multiple licenses when we have a preferred license type
      const licenseTypes: string[] = packageJson.licenses.map(x => x.type);
      const licenseType: string | null = this.findPreferredLicense(
        licenseTypes,
        this.preferredLicenseTypes
      );
      if (licenseType !== null) {
        // found preferred license
        return licenseType;
      }

      return this.handleLicenseAmbiguity(packageName, packageJson.licenses);
    }

    return this.handleMissingLicenseType(packageName);
  }

  private findPreferredLicense(
    licenseTypes: string[],
    preferredLicenseTypes: string[]
  ): string | null {
    for (const preferredLicenseType of preferredLicenseTypes) {
      for (const licenseType of licenseTypes) {
        if (preferredLicenseType === licenseType) {
          return preferredLicenseType;
        }
      }
    }
    return null;
  }
}

export { PluginLicenseTypeIdentifier };
