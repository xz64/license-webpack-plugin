import { WebpackStats, WebpackStatsChunk } from '../WebpackStats';

export class FakeWebpackStats implements WebpackStats {
  chunks: WebpackStatsChunk[] = [
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
  ];
}
