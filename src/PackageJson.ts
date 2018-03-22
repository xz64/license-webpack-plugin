interface PackageJson {
  name: string;
  license?: string;
  licenses?: { type: string; url: string }[];
  version: string;
}

export { PackageJson };
