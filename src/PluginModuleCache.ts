import { ModuleCache } from './ModuleCache';
import { LicenseIdentifiedModule } from './LicenseIdentifiedModule';

type ModuleMap = { [key: string]: LicenseIdentifiedModule };

class PluginModuleCache implements ModuleCache {
  private totalCache: ModuleMap = {};
  private chunkCache: { [key: string]: ModuleMap } = {};
  private chunkSeenCache: { [key: string]: { [key: string]: boolean } } = {};

  registerModule(chunkName: string, module: LicenseIdentifiedModule) {
    this.totalCache[module.name] = module;
    if (!this.chunkCache[chunkName]) {
      this.chunkCache[chunkName] = {};
    }
    this.chunkCache[chunkName][module.name] = module;
  }

  getModule(packageName: string): LicenseIdentifiedModule | null {
    return this.totalCache[packageName] || null;
  }

  markSeenForChunk(chunkName: string, packageName: string): void {
    if (!this.chunkSeenCache[chunkName]) {
      this.chunkSeenCache[chunkName] = {};
    }
    this.chunkSeenCache[chunkName][packageName] = true;
  }

  alreadySeenForChunk(chunkName: string, packageName: string): boolean {
    return !!(
      this.chunkSeenCache[chunkName] &&
      this.chunkSeenCache[chunkName][packageName]
    );
  }

  getAllModulesForChunk(chunkName: string): LicenseIdentifiedModule[] {
    const modules: LicenseIdentifiedModule[] = [];
    const cache = this.chunkCache[chunkName];
    if (cache) {
      Object.keys(cache).forEach(key => {
        modules.push(cache[key]);
      });
    }
    return modules;
  }

  getAllModules(): LicenseIdentifiedModule[] {
    const modules: LicenseIdentifiedModule[] = [];
    Object.keys(this.totalCache).forEach(key => {
      modules.push(this.totalCache[key]);
    });
    return modules;
  }
}

export { PluginModuleCache };
