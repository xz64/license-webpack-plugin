export const FAKE_REQUIRE_RESOLVE_OUTPUT = 'fakeRequireResolveOutput';
export const fakeRequireResolve: RequireResolve = ((() =>
  FAKE_REQUIRE_RESOLVE_OUTPUT) as unknown) as RequireResolve;
