import * as path from 'path';

import { FileUtils } from './FileUtils';
import { ConstructedOptions } from './ConstructedOptions';
import { Module } from './Module';
import { LicenseExtractor } from './LicenseExtractor';
import { LicenseWebpackPluginError } from './LicenseWebpackPluginError';

class ModuleProcessor {
  private modulePrefix: string;
  private licenseExtractor: LicenseExtractor;

  constructor(
    private context: string,
    private options: ConstructedOptions,
    private errors: LicenseWebpackPluginError[]
  ) {
    this.modulePrefix = path.join(this.context, FileUtils.MODULE_DIR);
    this.licenseExtractor = new LicenseExtractor(
      this.context,
      this.options,
      this.errors
    );
  }

  processFile(filename: string): string | null {
    if (
      !filename ||
      filename.trim() === '' ||
      !this.isFromNodeModules(filename)
    ) {
      return null;
    }

    const packageName: string = this.extractPackageName(filename);
    return this.processPackage(packageName);
  }

  processPackage(packageName: string): string | null {
    const isParsed: boolean = this.licenseExtractor.parsePackage(packageName);
    return isParsed ? packageName : null;
  }

  getPackageInfo(packageName: string): Module {
    return this.licenseExtractor.getCachedPackage(packageName);
  }

  private extractPackageName(filename: string): string {
    const tokens: string[] = filename
      .replace(path.join(this.context, FileUtils.MODULE_DIR) + path.sep, '')
      .split(path.sep);

    return tokens[0].charAt(0) === '@'
      ? tokens.slice(0, 2).join('/')
      : tokens[0];
  }

  private isFromNodeModules(filename: string): boolean {
    return (
      !!filename &&
      filename.startsWith(this.modulePrefix) &&
      // files such as node_modules/foo.js are not considered to be from a module inside node_modules
      filename.replace(this.modulePrefix + path.sep, '').indexOf(path.sep) > -1
    );
  }
}

export { ModuleProcessor };
