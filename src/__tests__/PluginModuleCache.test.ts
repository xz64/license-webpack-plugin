import { PluginModuleCache } from '../PluginModuleCache';
import { LicenseIdentifiedModule } from '../LicenseIdentifiedModule';
import { ModuleCache } from '../ModuleCache';

let moduleCache: ModuleCache;

const fooModule: LicenseIdentifiedModule = {
  name: 'foo',
  directory: '/proj/foo',
  packageJson: {
    name: 'foo',
    version: '1.0.0'
  },
  licenseId: 'MIT',
  licenseText: 'MIT'
};

describe('the module cache', () => {
  beforeEach(() => {
    moduleCache = new PluginModuleCache();
  });

  test('can recall modules that were cached', () => {
    moduleCache.registerModule('main', fooModule);
    const retrieved = moduleCache.getModule('foo');
    expect(retrieved).toEqual({
      name: 'foo',
      directory: '/proj/foo',
      packageJson: {
        name: 'foo',
        version: '1.0.0'
      },
      licenseId: 'MIT',
      licenseText: 'MIT'
    });
  });

  test('can recall all modules that were for a chunk', () => {
    moduleCache.registerModule('main', fooModule);
    const retrieved = moduleCache.getAllModulesForChunk('main');
    expect(retrieved).toEqual([
      {
        name: 'foo',
        directory: '/proj/foo',
        packageJson: {
          name: 'foo',
          version: '1.0.0'
        },
        licenseId: 'MIT',
        licenseText: 'MIT'
      }
    ]);
  });

  test('can recall modules that were processed for a chunk', () => {
    moduleCache.markSeenForChunk('main', 'foo');
    const seen = moduleCache.alreadySeenForChunk('main', 'foo');
    expect(seen).toBe(true);
  });

  test('does not recall modules that were processed for a different chunk', () => {
    moduleCache.markSeenForChunk('other', 'foo');
    const seen = moduleCache.alreadySeenForChunk('main', 'foo');
    expect(seen).toBe(false);
  });

  test('returns null for modules that were not cached', () => {
    const retrieved = moduleCache.getModule('foo');
    expect(retrieved).toBe(null);
  });
});
