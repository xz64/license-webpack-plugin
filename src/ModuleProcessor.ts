import * as path from 'path';

import { ConstructedOptions } from './ConstructedOptions';
import { Module } from './Module';
import { LicenseExtractor } from './LicenseExtractor';
import { LicenseWebpackPluginError } from './LicenseWebpackPluginError';
import { FileUtils } from './FileUtils';

class ModuleProcessor {
  private modulePrefixes: string[];
  private licenseExtractor: LicenseExtractor;

  constructor(
    private context: string,
    private options: ConstructedOptions,
    private errors: LicenseWebpackPluginError[]
  ) {
    this.modulePrefixes = options.modulesDirectories.map(dir =>
      path.join(this.context, dir)
    );
    this.licenseExtractor = new LicenseExtractor(this.options, this.errors);
  }

  processFile(filename: string): string | null {
    if (!filename || filename.trim() === '') {
      return null;
    }

    const modulePrefix = this.findModulePrefix(filename);
    if (!this.isFromModuleDirectory(filename, modulePrefix)) {
      return null;
    }

    const packageName: string = this.extractPackageName(filename, modulePrefix);
    return this.processPackage(packageName, modulePrefix);
  }

  processPackage(
    packageName: string,
    modulePrefix: string | null
  ): string | null {
    const isParsed: boolean = this.licenseExtractor.parsePackage(
      packageName,
      modulePrefix
    );
    return isParsed ? packageName : null;
  }

  processExternalPackage(packageName: string): string | null {
    let modulePrefix: string | null = null;
    for (const currentModulePrefix of this.modulePrefixes) {
      if (FileUtils.isThere(path.join(currentModulePrefix, packageName))) {
        modulePrefix = currentModulePrefix;
        break;
      }
    }
    const isParsed: boolean = this.licenseExtractor.parsePackage(
      packageName,
      modulePrefix
    );
    return isParsed ? packageName : null;
  }

  getPackageInfo(packageName: string): Module {
    return this.licenseExtractor.getCachedPackage(packageName);
  }

  private extractPackageName(
    filename: string,
    modulePrefix: string | null
  ): string {
    const tokens: string[] = filename
      .replace(modulePrefix + path.sep, '')
      .split(path.sep);

    return tokens[0].charAt(0) === '@'
      ? tokens.slice(0, 2).join('/')
      : tokens[0];
  }

  private isFromModuleDirectory(
    filename: string,
    modulePrefix: string | null
  ): boolean {
    let isPackageFile = false;
    if (modulePrefix) {
      // files like /path/to/node_modules/a.js do not count since they don't belong to any package
      isPackageFile =
        filename.replace(modulePrefix + path.sep, '').indexOf(path.sep) > -1;
    }
    return !!filename && !!modulePrefix && isPackageFile;
  }

  private findModulePrefix(filename: string): string | null {
    for (const modulePrefix of this.modulePrefixes) {
      if (filename.startsWith(modulePrefix)) {
        return modulePrefix;
      }
    }
    return null;
  }
}

export { ModuleProcessor };
