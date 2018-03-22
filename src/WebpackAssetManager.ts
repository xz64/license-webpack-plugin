import { AssetManager } from './AssetManager';
import { ConcatSource, RawSource } from 'webpack-sources';
import { WebpackCompilation } from './WebpackCompilation';
import { WebpackChunk } from './WebpackChunk';
import { LicensesRenderer } from './LicensesRenderer';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';

class WebpackAssetManager implements AssetManager {
  constructor(
    private outputFilename: string,
    private licensesRenderer: LicensesRenderer
  ) {}

  writeChunkLicenses(
    modules: LicenseIdentifiedModule[],
    compilation: WebpackCompilation,
    chunk: WebpackChunk
  ): void {
    const text = this.licensesRenderer.renderLicenses(modules);
    if (text) {
      const filename = compilation.getPath(this.outputFilename, { chunk });
      compilation.assets[filename] = new RawSource(text);
    }
  }

  writeChunkBanners(
    modules: LicenseIdentifiedModule[],
    compilation: WebpackCompilation,
    chunk: WebpackChunk
  ): void {
    const filename = compilation.getPath(this.outputFilename, { chunk });
    const text = this.licensesRenderer.renderBanner(filename, modules);
    if (text) {
      chunk.files
        .filter((file: string) => /\.js$/.test(file))
        .forEach((file: string) => {
          compilation.assets[file] = new ConcatSource(
            text,
            compilation.assets[file]
          );
        });
    }
  }

  writeAllLicenses(
    modules: LicenseIdentifiedModule[],
    compilation: WebpackCompilation
  ): void {
    const text = this.licensesRenderer.renderLicenses(modules);
    if (text) {
      compilation.assets[this.outputFilename] = new RawSource(text);
    }
  }
}

export { WebpackAssetManager };
