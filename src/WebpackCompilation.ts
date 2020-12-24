import { WebpackChunk } from './WebpackChunk';
import { Source } from 'webpack-sources';
import { ChunkGraph } from './ChunkGraph';

export interface WebpackCompilation {
  hash: string;
  chunks: IterableIterator<WebpackChunk>;
  assets: { [key: string]: Source };
  errors: any[];
  warnings: any[];
  getPath(
    filename: string,
    data: {
      hash?: any;
      chunk?: any;
      filename?: string;
      basename?: string;
      query?: any;
    }
  ): string;
  hooks: {
    optimizeChunkAssets: {
      tap: (
        pluginName: string,
        handler: (chunks: IterableIterator<WebpackChunk>) => void
      ) => void;
    };
    processAssets: {
      tap: (
        options: { name: string; stage: number },
        handler: () => void
      ) => void;
    };
  };
  plugin?: (phase: string, callback: Function) => void;
  chunkGraph?: ChunkGraph;
}
