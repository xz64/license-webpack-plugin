import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';

interface FileHandler {
  getModule(
    filename: string | null | undefined
  ): LicenseIdentifiedModule | null;
  isBuildRoot(filename: string): boolean;
  isInModuleDirectory(filename: string): boolean;
}

export { FileHandler };
