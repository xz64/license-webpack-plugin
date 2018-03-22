import { WebpackChunkHandler } from './WebpackChunkHandler';
import { WebpackCompilation } from './WebpackCompilation';
import { WebpackChunk } from './WebpackChunk';
import { WebpackCompiler } from './WebpackCompiler';
import { ChunkIncludeExcludeTester } from './ChunkIncludeExcludeTester';
import { ModuleCache } from './ModuleCache';
import { AssetManager } from './AssetManager';
import { Module } from './Module';

class WebpackCompilerHandler {
  constructor(
    private chunkIncludeTester: ChunkIncludeExcludeTester,
    private chunkHandler: WebpackChunkHandler,
    private assetManager: AssetManager,
    private moduleCache: ModuleCache,
    private addBanner: boolean,
    private perChunkOutput: boolean,
    private additionalChunkModules: { [chunkName: string]: Module[] },
    private additionalModules: Module[]
  ) {}

  handleCompiler(compiler: WebpackCompiler) {
    if (typeof compiler.hooks !== 'undefined') {
      compiler.hooks.compilation.tap(
        'LicenseWebpackPlugin',
        (compilation: WebpackCompilation) => {
          compilation.hooks.optimizeChunkAssets.tap(
            'LicenseWebpackPlugin',
            (chunks: IterableIterator<WebpackChunk>) => {
              this.iterateChunks(chunks, compilation);
            }
          );
        }
      );
    } else if (typeof compiler.plugin !== 'undefined') {
      compiler.plugin('compilation', (compilation: WebpackCompilation) => {
        if (typeof compilation.plugin !== 'undefined') {
          compilation.plugin(
            'optimize-chunk-assets',
            (chunks: IterableIterator<WebpackChunk>, callback: Function) => {
              this.iterateChunks(chunks, compilation);
              callback();
            }
          );
        }
      });
    }
  }

  private iterateChunks(
    chunks: IterableIterator<WebpackChunk>,
    compilation: WebpackCompilation
  ) {
    for (const chunk of chunks) {
      if (this.chunkIncludeTester.isIncluded(chunk.name)) {
        this.chunkHandler.processChunk(chunk, this.moduleCache);
        if (this.additionalChunkModules[chunk.name]) {
          this.additionalChunkModules[chunk.name].forEach(module =>
            this.chunkHandler.processModule(chunk, this.moduleCache, module)
          );
        }
        if (this.additionalModules.length > 0) {
          this.additionalModules.forEach(module =>
            this.chunkHandler.processModule(chunk, this.moduleCache, module)
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
          this.assetManager.writeChunkBanners(
            this.moduleCache.getAllModulesForChunk(chunk.name),
            compilation,
            chunk
          );
        }
      }
    }
    if (!this.perChunkOutput) {
      this.assetManager.writeAllLicenses(
        this.moduleCache.getAllModules(),
        compilation
      );
    }
  }
}

export { WebpackCompilerHandler };
