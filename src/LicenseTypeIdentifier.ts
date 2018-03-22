import { PackageJson } from './PackageJson';

interface LicenseTypeIdentifier {
  findLicenseIdentifier(
    packageName: string,
    packageJson: PackageJson
  ): string | null;
}

export { LicenseTypeIdentifier };
