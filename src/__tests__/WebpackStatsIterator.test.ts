import { WebpackStatsIterator } from '../WebpackStatsIterator';
import { WebpackStats } from '../WebpackStats';
import { WebpackChunkModule } from '../WebpackChunkModule';

describe('WebpackStatsIterator', () => {
  let iterator: WebpackStatsIterator;

  beforeEach(() => {
    iterator = new WebpackStatsIterator();
  });

  it('should produce webpack chunks from stats', () => {
    const expected: WebpackChunkModule[] = [
      {
        resource: '/a/node_modules/b/index.js'
      },
      {
        resource: '/a/node_modules/c/index.js'
      }
    ];
    const stats: WebpackStats = {
      chunks: [
        {
          names: ['main'],
          modules: [
            {
              identifier: '/a/node_modules/b/index.js',
              modules: [
                {
                  identifier: '/a/node_modules/c/index.js'
                }
              ]
            }
          ]
        }
      ]
    };
    const actual: WebpackChunkModule[] = iterator.collectModules(stats, 'main');
    expect(actual).toEqual(expected);
  });
});
