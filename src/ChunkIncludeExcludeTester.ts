import { IncludeExcludeTest } from './IncludeExcludeTest';

class ChunkIncludeExcludeTester {
  constructor(private includeExcludeTest: IncludeExcludeTest) {}

  isIncluded(chunkName: string) {
    if (typeof this.includeExcludeTest === 'function') {
      return this.includeExcludeTest(chunkName);
    }

    // only include
    if (this.includeExcludeTest.include && !this.includeExcludeTest.exclude) {
      return this.includeExcludeTest.include.indexOf(chunkName) > -1;
    }

    // only exclude
    if (this.includeExcludeTest.exclude && !this.includeExcludeTest.include) {
      // included as long as it's not excluded
      return !(this.includeExcludeTest.exclude.indexOf(chunkName) > -1);
    }

    // include and exclude together
    if (this.includeExcludeTest.include && this.includeExcludeTest.exclude) {
      return (
        !(this.includeExcludeTest.exclude.indexOf(chunkName) > -1) &&
        this.includeExcludeTest.include.indexOf(chunkName) > -1
      );
    }

    return true;
  }
}

export { ChunkIncludeExcludeTester };
