import { Logger } from '../Logger';

const FakeLogger: Logger = new Logger({ errors: true, warnings: true });

export { FakeLogger };
