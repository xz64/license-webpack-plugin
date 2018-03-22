import { WebpackChunk } from './WebpackChunk';
import { ModuleCache } from './ModuleCache';
import { Module } from './Module';

interface WebpackChunkHandler {
  processChunk(chunk: WebpackChunk, moduleCache: ModuleCache): void;
  processModule(
    chunk: WebpackChunk,
    moduleCache: ModuleCache,
    module: Module
  ): void;
}

export { WebpackChunkHandler };
