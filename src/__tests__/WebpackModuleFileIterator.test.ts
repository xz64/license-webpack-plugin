import { WebpackModuleFileIterator } from '../WebpackModuleFileIterator';
import {
  fakeRequireResolve,
  FAKE_REQUIRE_RESOLVE_OUTPUT
} from './FakeRequireResolve';

const iterator = new WebpackModuleFileIterator(fakeRequireResolve);

describe('WebpackModuleFileIterator', () => {
  it('returns null for falsy filename', () => {
    expect(iterator.getActualFilename('')).toBeNull();
    expect(iterator.getActualFilename(null)).toBeNull();
    expect(iterator.getActualFilename(undefined)).toBeNull();
  });

  it('ignores files external to webpack', () => {
    expect(iterator.getActualFilename('external abcd')).toBeNull();
  });

  it('returns path for webpack itself', () => {
    expect(iterator.getActualFilename('webpack/runtime abcd')).toBe(
      FAKE_REQUIRE_RESOLVE_OUTPUT
    );
  });

  it('returns correct filename for file which went through a loader', () => {
    expect(
      iterator.getActualFilename(
        '/home/repo/node_modules/@abc-def/foo/loader.js??ruleSet[0].rules[9].use[0]!/home/repo/node_modules/other/otherThing.js!/home/repo/node_modules/foo/lib.js'
      )
    ).toBe('/home/repo/node_modules/foo/lib.js');
  });

  it('returns correct filename for a "provide module" string found in webpack stats', () => {
    expect(
      iterator.getActualFilename(
        'provide module (default) rxjs@5.6.3 = /home/repo/node_modules/foo/lib.js'
      )
    ).toBe('/home/repo/node_modules/foo/lib.js');
  });

  it('returns correct filename for a shared module', () => {
    expect(
      iterator.getActualFilename(
        'consume-shared-module|default|@angular/core|=10.0.2|false|/home/repo/node_modules/foo/lib.js|true|false'
      )
    ).toBe('/home/repo/node_modules/foo/lib.js');
  });

  test('returns null for a shared module with undefined filename', () => {
    expect(
      iterator.getActualFilename(
        'consume-shared-module|default|@angular/core|=10.0.2|false|undefined|true|false'
      )
    ).toBeNull();
  });

  test('returns null for container entry module', () => {
    expect(
      iterator.getActualFilename(
        'container entry (default) [["./Viewer",{"import":["./plugins/todo/src/app/viewer/viewer.component.ts"]}],["./Designer",{"import":["./plugins/todo/src/app/designer/designer.component.ts"]}]]'
      )
    ).toBeNull();
  });

  test('returns null for ignored module', () => {
    expect(iterator.getActualFilename('ignored|ws')).toBeNull();
  });

  test('returns null for remote module', () => {
    expect(
      iterator.getActualFilename(
        'remote (default) webpack/container/reference/Routing.module'
      )
    ).toBeNull();
  });
});
