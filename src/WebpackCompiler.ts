import { WebpackCompilation } from './WebpackCompilation';

export interface WebpackCompiler {
  hooks: {
    compilation: {
      tap: (
        pluginName: string,
        handler: (compilation: WebpackCompilation) => void
      ) => void;
    };
    emit: {
      tap: (
        pluginName: string,
        handler: (compilation: WebpackCompilation) => void
      ) => void;
    };
  };
  context: string;
  plugin?: (phase: string, callback: Function) => void;
}
