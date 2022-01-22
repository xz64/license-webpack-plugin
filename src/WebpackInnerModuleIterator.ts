import { WebpackChunkModule } from './WebpackChunkModule';

class WebpackInnerModuleIterator {
  constructor(private requireResolve: RequireResolve) {}

  iterateModules(
    chunkModule: WebpackChunkModule,
    callback: (module: WebpackChunkModule) => void
  ) {
    const internalCallback = this.internalCallback.bind(this, callback);
    internalCallback(
      chunkModule.resource ? chunkModule : chunkModule.rootModule
    );
    if (Array.isArray(chunkModule.fileDependencies)) {
      const fileDependencies: string[] = chunkModule.fileDependencies;
      fileDependencies.forEach(fileDependency =>
        internalCallback({ resource: fileDependency })
      );
    }
    if (Array.isArray(chunkModule.dependencies)) {
      chunkModule.dependencies.forEach(module =>
        internalCallback(module.originModule)
      );
    }
  }

  private internalCallback(
    callback: (module: WebpackChunkModule) => void,
    module: WebpackChunkModule | undefined
  ): void {
    if (!module) return;
    const actualFileName = this.getActualFilename(module.resource);
    if (actualFileName) {
      callback({ ...module, resource: actualFileName });
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

export { WebpackInnerModuleIterator };
