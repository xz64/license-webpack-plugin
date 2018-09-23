import { LicensesRenderer } from './LicensesRenderer';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';

class PluginLicensesRenderer implements LicensesRenderer {
  constructor(
    public renderLicenses: (modules: LicenseIdentifiedModule[]) => string,
    public renderBanner: (
      filename: string,
      modules: LicenseIdentifiedModule[]
    ) => string
  ) {}
}

export { PluginLicensesRenderer };
