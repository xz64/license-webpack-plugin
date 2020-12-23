import { WebpackChunk } from './WebpackChunk';
import { WebpackChunkModule } from './WebpackChunkModule';
import { WebpackCompilation } from './WebpackCompilation';

class WebpackChunkModuleIterator {
  iterateModules(
    compilation: WebpackCompilation,
    chunk: WebpackChunk,
    callback: ((module: WebpackChunkModule) => void)
  ): void {
    if (typeof compilation.chunkGraph !== 'undefined') {
      for (const module of compilation.chunkGraph.getChunkModulesIterable(
        chunk
      )) {
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
