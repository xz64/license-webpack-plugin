const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const webpack = promisify(require('webpack'));
const readFile = promisify(require('fs').readFile);
const LicenseWebpackPlugin = require('../../dist/index.js')
  .LicenseWebpackPlugin;

async function build(plugin, licenseFilename, expectedOutputFilename) {
  await rimraf(`${__dirname}/dist`);
  const stuff = await webpack({
    context: __dirname,
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    plugins: [plugin]
  });
  const [actual, expected] = await Promise.all([
    readFile(`${__dirname}/dist/${licenseFilename}`, 'utf8'),
    readFile(`${__dirname}/${expectedOutputFilename}`, 'utf8')
  ]);
  expect(actual).toEqual(expected);
}

test('default config works', async () => {
  await build(
    new LicenseWebpackPlugin(),
    'main.licenses.txt',
    'expected_output_01.txt'
  );
});
