import { WebpackCompiler } from './WebpackCompiler';
import { WebpackPlugin } from './WebpackPlugin';
import { ChunkIncludeExcludeTester } from './ChunkIncludeExcludeTester';
import { WebpackChunkHandler } from './WebpackChunkHandler';
import { PluginChunkReadHandler } from './PluginChunkReadHandler';
import { PluginFileHandler } from './PluginFileHandler';
import { FileHandler } from './FileHandler';
import { WebpackFileSystem } from './WebpackFileSystem';
import { PluginLicenseTypeIdentifier } from './PluginLicenseTypeIdentifier';
import { LicenseTextReader } from './LicenseTextReader';
import { LicensePolicy } from './LicensePolicy';
import { WebpackCompilerHandler } from './WebpackCompilerHandler';
import { PluginModuleCache } from './PluginModuleCache';
import { ModuleCache } from './ModuleCache';
import { WebpackAssetManager } from './WebpackAssetManager';
import { BuildRootFinder } from './BuildRootFinder';
import { PluginLicensesRenderer } from './PluginLicensesRenderer';
import { ConstructedOptions } from './ConstructedOptions';
import { PluginLicensePolicy } from './PluginLicensePolicy';
import { PluginLicenseTestRunner } from './PluginLicenseTestRunner';
import { PluginOptionsReader } from './PluginOptionsReader';
import { PluginOptions } from './PluginOptions';

class LicenseWebpackPlugin implements WebpackPlugin {
  constructor(private pluginOptions: PluginOptions = {}) {}

  apply(compiler: WebpackCompiler) {
    const fileSystem = new WebpackFileSystem(compiler.inputFileSystem);
    const buildRootFinder = new BuildRootFinder(fileSystem);
    const guessedBuildRoot: string = buildRootFinder.findBuildRoot(
      compiler.context
    );
    const optionsReader: PluginOptionsReader = new PluginOptionsReader(
      guessedBuildRoot
    );
    const options: ConstructedOptions = optionsReader.readOptions(
      this.pluginOptions
    );
    const fileHandler: FileHandler = new PluginFileHandler(
      fileSystem,
      options.buildRoot,
      options.modulesDirectories,
      options.excludedPackageTest
    );
    const licenseTypeIdentifier = new PluginLicenseTypeIdentifier(
      options.licenseTypeOverrides,
      options.preferredLicenseTypes,
      options.handleLicenseAmbiguity,
      options.handleMissingLicenseType
    );
    const licenseTextReader = new LicenseTextReader(
      fileSystem,
      options.licenseFileOverrides,
      options.licenseTextOverrides,
      options.licenseTemplateDir,
      options.handleMissingLicenseText
    );
    const licenseTestRunner = new PluginLicenseTestRunner(
      options.licenseInclusionTest
    );
    const unacceptableLicenseTestRunner = new PluginLicenseTestRunner(
      options.unacceptableLicenseTest
    );
    const policy: LicensePolicy = new PluginLicensePolicy(
      licenseTestRunner,
      unacceptableLicenseTestRunner,
      options.handleUnacceptableLicense,
      options.handleMissingLicenseText
    );
    const readHandler: WebpackChunkHandler = new PluginChunkReadHandler(
      fileHandler,
      licenseTypeIdentifier,
      licenseTextReader,
      policy,
      fileSystem
    );
    const licenseRenderer = new PluginLicensesRenderer(
      options.renderLicenses,
      options.renderBanner
    );
    const moduleCache: ModuleCache = new PluginModuleCache();
    const assetManager = new WebpackAssetManager(
      options.outputFilename,
      licenseRenderer
    );
    const chunkIncludeExcludeTester = new ChunkIncludeExcludeTester(
      options.chunkIncludeExcludeTest
    );
    const handler = new WebpackCompilerHandler(
      chunkIncludeExcludeTester,
      readHandler,
      assetManager,
      moduleCache,
      options.addBanner,
      options.perChunkOutput,
      options.additionalChunkModules,
      options.additionalModules
    );
    handler.handleCompiler(compiler);
  }
}

export { LicenseWebpackPlugin };
