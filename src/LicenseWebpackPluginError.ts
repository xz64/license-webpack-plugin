import { ErrorMessage } from './ErrorMessage';

class LicenseWebpackPluginError extends Error {
  constructor(message: ErrorMessage, ...params: string[]) {
    let replacedMessage: string = 'license-webpack-plugin: ';
    replacedMessage += message
      .replace('{0}', params[0])
      .replace('{1}', params[1]);
    super(replacedMessage);
  }
}

export { LicenseWebpackPluginError };
