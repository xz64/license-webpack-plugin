import { WebpackCompilation } from '../WebpackCompilation';

class FakeCompilation implements WebpackCompilation {
  chunks = null;
  assets = null;
  errors = [];
  warnings = [];
  getPath = null;
  hooks = null;
  chunkGraph = undefined;
}

export { FakeCompilation };
