import { WebpackChunk } from '../WebpackChunk';
import { WebpackChunkModule } from '../WebpackChunkModule';
import { WebpackChunkModuleIterator } from '../WebpackChunkModuleIterator';

class WebpackV2Chunk implements WebpackChunk {
  name = 'main';
  files = [];
  modules: WebpackChunkModule[] = [
    {
      resource: 'a'
    }
  ];
}

class WebpackV3Chunk implements WebpackChunk {
  name = 'main';
  files = [];
  underlyingModules: WebpackChunkModule[] = [
    {
      resource: 'a'
    }
  ];
  forEachModule(callback) {
    this.underlyingModules.forEach(callback);
  }
}

class WebpackV4Chunk implements WebpackChunk {
  name = 'main';
  files = [];
  modulesIterable: IterableIterator<WebpackChunkModule> = (function*() {
    yield {
      resource: 'a'
    };
  })();
}

describe('chunk iterator', () => {
  let iterator: WebpackChunkModuleIterator;

  beforeAll(() => {
    iterator = new WebpackChunkModuleIterator();
  });

  test('handles modules array from a chunk', () => {
    const mockCallback = jest.fn();
    iterator.iterateModules(new WebpackV2Chunk(), mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toEqual({ resource: 'a' });
  });

  test('handles forEachModule property', () => {
    const mockCallback = jest.fn();
    iterator.iterateModules(new WebpackV3Chunk(), mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toEqual({ resource: 'a' });
  });

  test('handles modulesIterable property', () => {
    const mockCallback = jest.fn();
    iterator.iterateModules(new WebpackV4Chunk(), mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toEqual({ resource: 'a' });
  });
});
