import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';

interface FileHandler {
  getModule(
    filename: string | null | undefined
  ): LicenseIdentifiedModule | null;
}

export { FileHandler };
