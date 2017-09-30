import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';

import { RawSource, ConcatSource } from 'webpack-sources';

import { LicenseWebpackPluginError } from './LicenseWebpackPluginError';
import { ErrorMessage } from './ErrorMessage';
import { ConstructedOptions } from './ConstructedOptions';
import { Options } from './Options';
import { FileUtils } from './FileUtils';
import { ModuleProcessor } from './ModuleProcessor';
import { Module } from './Module';

class LicenseWebpackPlugin {
  private buildRoot: string;
  private options: ConstructedOptions;
  private moduleProcessor: ModuleProcessor;
  private template: ejs.TemplateFunction;
  private errors: LicenseWebpackPluginError[] = [];

  constructor(options: Options) {
    if (!options || !options.pattern || !(options.pattern instanceof RegExp)) {
      throw new LicenseWebpackPluginError(ErrorMessage.NO_PATTERN);
    }

    if (
      options.unacceptablePattern !== undefined &&
      options.unacceptablePattern !== null &&
      !(options.unacceptablePattern instanceof RegExp)
    ) {
      throw new LicenseWebpackPluginError(
        ErrorMessage.UNACCEPTABLE_PATTERN_NOT_REGEX
      );
    }

    this.options = {
      ...{
        licenseFilenames: [
          'LICENSE',
          'LICENSE.md',
          'LICENSE.txt',
          'license',
          'license.md',
          'license.txt'
        ],
        perChunkOutput: true,
        outputTemplate: path.resolve(__dirname, '../output.template.ejs'),
        outputFilename:
          options.perChunkOutput === false
            ? 'licenses.txt'
            : '[name].licenses.txt',
        suppressErrors: false,
        includePackagesWithoutLicense: false,
        abortOnUnacceptableLicense: false,
        addBanner: false,
        bannerTemplate:
          '/*! 3rd party license information is available at <%- filename %> */',
        includedChunks: [],
        excludedChunks: [],
        additionalPackages: []
      },
      ...options
    };

    if (!FileUtils.isThere(this.options.outputTemplate)) {
      throw new LicenseWebpackPluginError(
        ErrorMessage.OUTPUT_TEMPLATE_NOT_EXIST,
        this.options.outputTemplate
      );
    }

    const templateString = fs.readFileSync(this.options.outputTemplate, 'utf8');
    this.template = ejs.compile(templateString);
  }

  apply(compiler: any) {
    this.buildRoot = this.findBuildRoot(compiler.context);
    this.moduleProcessor = new ModuleProcessor(
      this.buildRoot,
      this.options,
      this.errors
    );

    compiler.plugin('emit', (compilation: any, callback: Function) => {
      const totalChunkModuleMap: { [key: string]: boolean } = {};
      compilation.chunks.forEach((chunk: any) => {
        if (this.options.excludedChunks.indexOf(chunk.name) > -1) {
          return;
        }
        if (
          this.options.includedChunks.length > 0 &&
          this.options.includedChunks.indexOf(chunk.name) === -1
        ) {
          return;
        }
        const outputPath = compilation.getPath(
          this.options.outputFilename,
          this.options.perChunkOutput
            ? {
                chunk
              }
            : compilation
        );
        const chunkModuleMap: { [key: string]: boolean } = {};

        const moduleCallback = (chunkModule: any) => {
          const packageName = this.moduleProcessor.processFile(
            chunkModule.resource ||
              (chunkModule.rootModule && chunkModule.rootModule.resource)
          );
          if (packageName) {
            chunkModuleMap[packageName] = true;
            totalChunkModuleMap[packageName] = true;
          }
        };

        // scan all files used in compilation for this chunk
        if (typeof chunk.forEachModule === 'function') {
          chunk.forEachModule(moduleCallback);
        } else {
          chunk.modules.forEach(moduleCallback); // chunk.modules was deprecated in webpack v3
        }

        this.options.additionalPackages.forEach((packageName: string) => {
          this.moduleProcessor.processPackage(packageName);
          chunkModuleMap[packageName] = true;
          totalChunkModuleMap[packageName] = true;
        });

        const renderedFile = this.renderLicenseFile(
          Object.keys(chunkModuleMap)
        );

        // Only write license file if there is something to write.
        if (renderedFile.trim() !== '') {
          if (this.options.addBanner) {
            chunk.files
              .filter((file: string) => /\.js$/.test(file))
              .forEach((file: string) => {
                compilation.assets[file] = new ConcatSource(
                  ejs.render(this.options.bannerTemplate, {
                    filename: outputPath
                  }),
                  '\n',
                  compilation.assets[file]
                );
              });
          }
          if (this.options.perChunkOutput) {
            compilation.assets[outputPath] = new RawSource(renderedFile);
          }
        }
      });

      if (!this.options.perChunkOutput) {
        // produce master licenses file
        const outputPath = compilation.getPath(
          this.options.outputFilename,
          compilation
        );
        const renderedFile = this.renderLicenseFile(
          Object.keys(totalChunkModuleMap)
        );

        if (renderedFile.trim() !== '') {
          compilation.assets[outputPath] = new RawSource(renderedFile);
        }
      }

      if (!this.options.suppressErrors) {
        this.errors.forEach(error => console.error(error.message));
      }

      callback();
    });
  }

  private renderLicenseFile(packageNames: string[]): string {
    const packages: Module[] = packageNames.map(
      this.moduleProcessor.getPackageInfo,
      this.moduleProcessor
    );
    return this.template({ packages });
  }

  private findBuildRoot(context: string): string {
    let buildRoot: string = context;
    let lastPathSepIndex: number;

    if (buildRoot.indexOf(FileUtils.MODULE_DIR) > -1) {
      buildRoot = buildRoot.substring(
        0,
        buildRoot.indexOf(FileUtils.MODULE_DIR) - 1
      );
    } else {
      let oldBuildRoot: string | null = null;
      while (!FileUtils.isThere(path.join(buildRoot, FileUtils.MODULE_DIR))) {
        lastPathSepIndex = buildRoot.lastIndexOf(path.sep);
        if (lastPathSepIndex === -1 || oldBuildRoot === buildRoot) {
          throw new LicenseWebpackPluginError(ErrorMessage.NO_PROJECT_ROOT);
        }
        oldBuildRoot = buildRoot;
        buildRoot = buildRoot.substring(0, buildRoot.lastIndexOf(path.sep));
      }
    }

    return buildRoot;
  }
}

export { LicenseWebpackPlugin };
