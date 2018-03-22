import { WebpackChunk } from './WebpackChunk';
import { WebpackChunkModule } from './WebpackChunkModule';

class WebpackChunkModuleIterator {
  iterateModules(
    chunk: WebpackChunk,
    callback: ((module: WebpackChunkModule) => void)
  ): void {
    if (typeof chunk.modulesIterable !== 'undefined') {
      for (const module of chunk.modulesIterable) {
        callback(module);
      }
    } else if (typeof chunk.forEachModule === 'function') {
      chunk.forEachModule(callback);
    } else if (Array.isArray(chunk.modules)) {
      chunk.modules.forEach(callback);
    }
    if (chunk.entryModule) {
      callback(chunk.entryModule);
    }
  }
}

export { WebpackChunkModuleIterator };
