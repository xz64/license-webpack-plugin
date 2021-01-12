import { WebpackChunkHandler } from './WebpackChunkHandler';
import { WebpackCompilation } from './WebpackCompilation';
import { WebpackChunk } from './WebpackChunk';
import { WebpackCompiler } from './WebpackCompiler';
import { ChunkIncludeExcludeTester } from './ChunkIncludeExcludeTester';
import { ModuleCache } from './ModuleCache';
import { AssetManager } from './AssetManager';
import { Module } from './Module';
import { WebpackStats } from './WebpackStats';

class WebpackCompilerHandler {
  // copied from webpack/lib/Compilation.js
  static PROCESS_ASSETS_STAGE_ADDITIONS = -100;
  static PROCESS_ASSETS_STAGE_REPORT = 5000;
  constructor(
    private chunkIncludeTester: ChunkIncludeExcludeTester,
    private chunkHandler: WebpackChunkHandler,
    private assetManager: AssetManager,
    private moduleCache: ModuleCache,
    private addBanner: boolean,
    private perChunkOutput: boolean,
    private additionalChunkModules: { [chunkName: string]: Module[] },
    private additionalModules: Module[],
    private skipChildCompilers: boolean
  ) {}

  handleCompiler(compiler: WebpackCompiler) {
    if (typeof compiler.hooks !== 'undefined') {
      const hookType = this.skipChildCompilers
        ? 'thisCompilation'
        : 'compilation';
      compiler.hooks[hookType].tap(
        'LicenseWebpackPlugin',
        (compilation: WebpackCompilation) => {
          if (typeof compilation.hooks.processAssets !== 'undefined') {
            // webpack v5
            compilation.hooks.processAssets.tap(
              {
                name: 'LicenseWebpackPlugin',
                stage: WebpackCompilerHandler.PROCESS_ASSETS_STAGE_REPORT
              },
              () => {
                // the chunk graph does not contain ES modules
                // use stats instead to find the ES module imports
                const stats: WebpackStats = compilation.getStats().toJson();
                this.iterateChunks(compilation, compilation.chunks, stats);
              }
            );
          } else {
            // webpack v4
            compilation.hooks.optimizeChunkAssets.tap(
              'LicenseWebpackPlugin',
              (chunks: IterableIterator<WebpackChunk>) => {
                this.iterateChunks(compilation, chunks);
              }
            );
          }
        }
      );
      if (!this.perChunkOutput) {
        compiler.hooks[hookType].tap(
          'LicenseWebpackPlugin',
          (compilation: WebpackCompilation) => {
            if (!compilation.compiler.isChild()) {
              // Select only root compiler to avoid writing license file multiple times per compilation
              if (typeof compilation.hooks.processAssets !== 'undefined') {
                // webpack v5
                compilation.hooks.processAssets.tap(
                  {
                    name: 'LicenseWebpackPlugin',
                    stage:
                      WebpackCompilerHandler.PROCESS_ASSETS_STAGE_REPORT + 1
                  },
                  () => {
                    this.assetManager.writeAllLicenses(
                      this.moduleCache.getAllModules(),
                      compilation
                    );
                  }
                );
              } else {
                // webpack v4
                compilation.hooks.optimizeChunkAssets.tap(
                  'LicenseWebpackPlugin',
                  () => {
                    this.assetManager.writeAllLicenses(
                      this.moduleCache.getAllModules(),
                      compilation
                    );
                  }
                );
              }
            }
          }
        );
      }
    } else if (typeof compiler.plugin !== 'undefined') {
      compiler.plugin('compilation', (compilation: WebpackCompilation) => {
        if (typeof compilation.plugin !== 'undefined') {
          compilation.plugin(
            'optimize-chunk-assets',
            (chunks: IterableIterator<WebpackChunk>, callback: Function) => {
              this.iterateChunks(compilation, chunks);
              callback();
            }
          );
        }
      });
    }
  }

  private iterateChunks(
    compilation: WebpackCompilation,
    chunks: IterableIterator<WebpackChunk>,
    stats?: WebpackStats
  ) {
    for (const chunk of chunks) {
      if (this.chunkIncludeTester.isIncluded(chunk.name)) {
        this.chunkHandler.processChunk(
          compilation,
          chunk,
          this.moduleCache,
          stats
        );
        if (this.additionalChunkModules[chunk.name]) {
          this.additionalChunkModules[chunk.name].forEach(module =>
            this.chunkHandler.processModule(
              compilation,
              chunk,
              this.moduleCache,
              module
            )
          );
        }
        if (this.additionalModules.length > 0) {
          this.additionalModules.forEach(module =>
            this.chunkHandler.processModule(
              compilation,
              chunk,
              this.moduleCache,
              module
            )
          );
        }
        if (this.perChunkOutput) {
          this.assetManager.writeChunkLicenses(
            this.moduleCache.getAllModulesForChunk(chunk.name),
            compilation,
            chunk
          );
        }
        if (this.addBanner) {
          if (typeof compilation.hooks.processAssets !== 'undefined') {
            // webpack v5
            compilation.hooks.processAssets.tap(
              {
                name: 'LicenseWebpackPlugin',
                stage: WebpackCompilerHandler.PROCESS_ASSETS_STAGE_ADDITIONS
              },
              () => {
                this.assetManager.writeChunkBanners(
                  this.moduleCache.getAllModulesForChunk(chunk.name),
                  compilation,
                  chunk
                );
              }
            );
          } else {
            // webpack v4
            this.assetManager.writeChunkBanners(
              this.moduleCache.getAllModulesForChunk(chunk.name),
              compilation,
              chunk
            );
          }
        }
      }
    }
  }
}

export { WebpackCompilerHandler };
