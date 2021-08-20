import { WebpackChunkModule } from './WebpackChunkModule';

class WebpackModuleFileIterator {
  constructor(private requireResolve: RequireResolve) {}

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
    const actualFileName = this.getActualFilename(filename);
    if (actualFileName) {
      callback(actualFileName);
    }
  }

  getActualFilename(filename: string | null | undefined): string | null {
    if (
      !filename ||
      filename.indexOf('delegated ') === 0 ||
      filename.indexOf('external ') === 0 ||
      filename.indexOf('container entry ') === 0 ||
      filename.indexOf('ignored|') === 0 ||
      filename.indexOf('remote ') === 0 ||
      filename.indexOf('data:') === 0
    ) {
      return null;
    }
    if (filename.indexOf('webpack/runtime') === 0) {
      return this.requireResolve('webpack');
    }
    if (filename.indexOf('!') > -1) {
      // file was procesed by loader, last item after ! is the actual file
      const tokens = filename.split('!');
      return tokens[tokens.length - 1];
    }
    if (filename.indexOf('provide module') === 0) {
      return filename.split('=')[1].trim();
    }
    if (filename.indexOf('consume-shared-module') === 0) {
      const tokens = filename.split('|');
      // 3rd to last item is the filename, see identifier() function in node_modules/webpack/lib/sharing/ConsumeSharedModule.js
      const actualFilename = tokens[tokens.length - 3];
      if (actualFilename === 'undefined') {
        return null;
      }
      return actualFilename;
    }
    return filename;
  }
}

export { WebpackModuleFileIterator };
