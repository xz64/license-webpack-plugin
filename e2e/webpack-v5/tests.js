const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const webpack = promisify(require('webpack'));
const readFile = promisify(require('fs').readFile);
const LicenseWebpackPlugin = require('../../dist/index.js')
  .LicenseWebpackPlugin;

async function build(
  plugin,
  licenseFilename,
  expectedOutputFilename,
  jsFilename,
  expectedJsFilename
) {
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
  let [actual, expected] = await Promise.all([
    readFile(`${__dirname}/dist/${licenseFilename}`, 'utf8'),
    readFile(`${__dirname}/${expectedOutputFilename}`, 'utf8')
  ]);
  expect(actual).toEqual(expected);

  [actual, expected] = await Promise.all([
    readFile(`${__dirname}/dist/${jsFilename}`, 'utf8'),
    readFile(`${__dirname}/${expectedJsFilename}`, 'utf8')
  ]);
  expect(actual).toEqual(expected);
}

test('plugin works', async () => {
  await build(
    new LicenseWebpackPlugin({
      addBanner: true,
      renderBanner: filename => `/*! see licenses at ${filename} */`,
      excludedPackageTest: name => name === 'is-array'
    }),
    'main.licenses.txt',
    'expected_output_01.txt',
    'main.js',
    'expected_output_01.js.txt'
  );
});
