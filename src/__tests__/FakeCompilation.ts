import { WebpackCompilation } from '../WebpackCompilation';
import { FakeWebpackStats } from './FakeWebpackStats';

class FakeCompilation implements WebpackCompilation {
  chunks = null;
  assets = null;
  errors = [];
  warnings = [];
  getPath = null;
  hooks = null;
  chunkGraph = undefined;
  getStats() {
    return {
      toJson: () => {
        return new FakeWebpackStats();
      }
    };
  }
}

export { FakeCompilation };
