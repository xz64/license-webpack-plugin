import { ChunkIncludeExcludeTester } from '../ChunkIncludeExcludeTester';

describe('the chunk include exclude tester', () => {
  test('handles functions', () => {
    const tester = new ChunkIncludeExcludeTester(s => s.indexOf('a') > -1);
    expect(tester.isIncluded('a')).toBe(true);
    expect(tester.isIncluded('b')).toBe(false);
  });

  test('an exclude only configuration only excludes', () => {
    const tester = new ChunkIncludeExcludeTester({
      exclude: ['app']
    });
    expect(tester.isIncluded('app')).toBe(false);
    expect(tester.isIncluded('main')).toBe(true);
  });

  test('an include only configuration excludes everything except that which is included', () => {
    const tester = new ChunkIncludeExcludeTester({
      include: ['vendor']
    });
    expect(tester.isIncluded('vendor')).toBe(true);
    expect(tester.isIncluded('main')).toBe(false);
  });

  test('an include and exclude configuration makes exclude take precedence over include', () => {
    const tester = new ChunkIncludeExcludeTester({
      include: ['vendor'],
      exclude: ['vendor']
    });
    expect(tester.isIncluded('vendor')).toBe(false);
  });

  test('an include and exclude configuration tested against a non-matching chunk will get excluded', () => {
    const tester = new ChunkIncludeExcludeTester({
      include: ['vendor'],
      exclude: ['foo']
    });
    expect(tester.isIncluded('bar')).toBe(false);
  });

  test('an include and exclude configuration works against a match against both include and exclude fields', () => {
    const tester = new ChunkIncludeExcludeTester({
      include: ['vendor'],
      exclude: ['foo']
    });
    expect(tester.isIncluded('vendor')).toBe(true);
    expect(tester.isIncluded('foo')).toBe(false);
  });
});
