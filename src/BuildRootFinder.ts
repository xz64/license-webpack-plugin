import { FileSystem } from './FileSystem';

class BuildRootFinder {
  constructor(private fileSystem: FileSystem) {}

  findBuildRoot(context: string): string {
    const NODE_MODULES = 'node_modules';
    let buildRoot: string = context;
    let lastPathSepIndex: number;

    if (buildRoot.indexOf(NODE_MODULES) > -1) {
      buildRoot = buildRoot.substring(0, buildRoot.indexOf(NODE_MODULES) - 1);
    } else {
      let oldBuildRoot: string | null = null;
      while (
        !this.fileSystem.pathExists(
          this.fileSystem.join(buildRoot, NODE_MODULES)
        )
      ) {
        lastPathSepIndex = buildRoot.lastIndexOf(this.fileSystem.pathSeparator);
        if (lastPathSepIndex === -1 || oldBuildRoot === buildRoot) {
          throw new Error(
            'Unable to determine build root. Please set the buildRoot property in the plugin options.'
          );
        }
        oldBuildRoot = buildRoot;
        buildRoot = buildRoot.substring(
          0,
          buildRoot.lastIndexOf(this.fileSystem.pathSeparator)
        );
      }
    }

    return buildRoot;
  }
}

export { BuildRootFinder };
