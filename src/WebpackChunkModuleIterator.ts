import { WebpackChunk } from './WebpackChunk';
import { WebpackChunkModule } from './WebpackChunkModule';
import { WebpackCompilation } from './WebpackCompilation';
import { WebpackStats } from './WebpackStats';
import { WebpackStatsIterator } from './WebpackStatsIterator';

class WebpackChunkModuleIterator {
  private statsIterator: WebpackStatsIterator = new WebpackStatsIterator();
  iterateModules(
    compilation: WebpackCompilation,
    chunk: WebpackChunk,
    stats: WebpackStats | undefined,
    callback: ((module: WebpackChunkModule) => void)
  ): void {
    if (
      typeof compilation.chunkGraph !== 'undefined' &&
      typeof stats !== 'undefined'
    ) {
      // webpack v5
      for (const module of compilation.chunkGraph.getChunkModulesIterable(
        chunk
      )) {
        callback(module);
      }
      const statsModules = this.statsIterator.collectModules(stats, chunk.name);
      for (const module of statsModules) {
        callback(module);
      }
    } else if (typeof chunk.modulesIterable !== 'undefined') {
      for (const module of chunk.modulesIterable) {
        callback(module);
      }
    } else if (typeof chunk.forEachModule === 'function') {
      chunk.forEachModule(callback);
    } else if (Array.isArray(chunk.modules)) {
      chunk.modules.forEach(callback);
    }
    if (typeof compilation.chunkGraph !== 'undefined') {
      for (const module of compilation.chunkGraph.getChunkEntryModulesIterable(
        chunk
      )) {
        callback(module);
      }
    } else if (chunk.entryModule) {
      callback(chunk.entryModule);
    }
  }
}

export { WebpackChunkModuleIterator };
