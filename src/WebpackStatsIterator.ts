import { WebpackChunkModule } from './WebpackChunkModule';
import { WebpackStats, WebpackStatsModule } from './WebpackStats';

export class WebpackStatsIterator {
  collectModules(stats: WebpackStats, chunkName: string): WebpackChunkModule[] {
    const chunkModules: WebpackChunkModule[] = [];
    for (const chunk of stats.chunks) {
      if (chunk.names[0] === chunkName) {
        this.traverseModules(chunk.modules, chunkModules);
      }
    }
    return chunkModules;
  }

  private traverseModules(
    modules: WebpackStatsModule[] | undefined,
    chunkModules: WebpackChunkModule[]
  ): void {
    if (!modules) {
      return;
    }
    for (const webpackModule of modules) {
      chunkModules.push({ resource: webpackModule.identifier });
      this.traverseModules(webpackModule.modules, chunkModules);
    }
  }
}
