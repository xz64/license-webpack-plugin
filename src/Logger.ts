import { ConstructedStats } from './ConstructedStats';
import { WebpackCompilation } from './WebpackCompilation';

class Logger {
  private static LOG_PREFIX: string = 'license-webpack-plugin: ';
  constructor(private stats: ConstructedStats) {}

  warn(compilation: WebpackCompilation, message: string) {
    if (this.stats.warnings) {
      compilation.warnings.push(`${Logger.LOG_PREFIX}${message}`);
    }
  }

  error(compilation: WebpackCompilation, message: string) {
    if (this.stats.errors) {
      compilation.errors.push(`${Logger.LOG_PREFIX}${message}`);
    }
  }
}

export { Logger };
