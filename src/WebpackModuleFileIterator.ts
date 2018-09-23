import { WebpackChunkModule } from './WebpackChunkModule';

class WebpackModuleFileIterator {
  iterateFiles(
    chunkModule: WebpackChunkModule,
    callback: (filename: string | null | undefined) => void
  ) {
    callback(
      chunkModule.resource ||
        (chunkModule.rootModule && chunkModule.rootModule.resource)
    );
    if (Array.isArray(chunkModule.fileDependencies)) {
      const fileDependencies: string[] = chunkModule.fileDependencies;
      fileDependencies.forEach(callback);
    }
    if (Array.isArray(chunkModule.dependencies)) {
      chunkModule.dependencies.forEach(module =>
        callback(module.originModule && module.originModule.resource)
      );
    }
  }
}

export { WebpackModuleFileIterator };
