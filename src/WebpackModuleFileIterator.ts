import { WebpackChunkModule } from './WebpackChunkModule';

class WebpackModuleFileIterator {
  iterateFiles(
    chunkModule: WebpackChunkModule,
    callback: (filename: string | null | undefined) => void
  ) {
    const internalCallback = this.internalCallback.bind(this, callback);
    internalCallback(
      chunkModule.resource ||
        (chunkModule.rootModule && chunkModule.rootModule.resource)
    );
    if (Array.isArray(chunkModule.fileDependencies)) {
      const fileDependencies: string[] = chunkModule.fileDependencies;
      fileDependencies.forEach(internalCallback);
    }
    if (Array.isArray(chunkModule.dependencies)) {
      chunkModule.dependencies.forEach(module =>
        internalCallback(module.originModule && module.originModule.resource)
      );
    }
  }

  private internalCallback(
    callback: (filename: string | null | undefined) => void,
    filename: string | null | undefined
  ): void {
    if (filename && filename.indexOf('webpack/runtime') === 0) {
      callback(require.resolve('webpack'));
    } else {
      callback(filename);
    }
  }
}

export { WebpackModuleFileIterator };
