function oneLibProject() {
  return {
    fs: {
      '/project1/node_modules/lib1/package.json': JSON.stringify({
        name: 'lib1',
        license: 'MIT',
        version: '0.0.1'
      }),
      '/project1/path': {},
      '/project1/node_modules/lib1/LICENSE': 'MIT License',
      '/project1/custom.txt': 'custom license file',
      '/licenseTemplates/MIT.txt': 'MIT License'
    },
    compiler: {
      context: '/project1',
      compilation: {
        assets: {
          'output.abcd.js': 'some test file'
        },
        chunks: [
          {
            name: 'main',
            hash: 'abcdefg',
            files: ['output.abcd.js'],
            modules: [
              {
                resource: '/project1/node_modules/lib1/3rd_party_lib.js'
              },
              {
                resource: '/project1/myfile.js'
              }
            ]
          }
        ]
      }
    }
  };
}

function badBuildRootProject() {
  var fixture = oneLibProject();
  fixture.compiler.context = '/project2';
  return fixture;
}

function hasNonJsOutputProject() {
  var fixture = oneLibProject();
  fixture.compiler.compilation.assets['a.img'] = 'image';
  fixture.compiler.compilation.chunks[0].files.push('a.img');
  return fixture;
}

function multiModuleVaryingLicenseProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib2/package.json'] = JSON.stringify({
    name: 'lib2',
    license: 'ISC',
    version: '0.0.1'
  });
  fixture.fs['/project1/node_modules/lib2/LICENSE'] = 'ISC License';
  fixture.compiler.compilation.chunks[0].modules.push({
    resource: '/project1/node_modules/lib2/3rd_party_lib.js'
  });
  return fixture;
}

function oneLibProjectWithLicenseTxtFile() {
  var fixture = oneLibProject();
  delete fixture.fs['/project1/node_modules/lib1/LICENSE'];
  fixture.fs['/project1/node_modules/lib1/license.txt'] = 'MIT License';
  return fixture;
}

function unknownLicenseProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib1/package.json'] = JSON.stringify({
    name: 'lib1',
    version: '0.0.1'
  });
  return fixture;
}

function missingLicenseFileProject() {
  var fixture = oneLibProject();
  delete fixture.fs['/project1/node_modules/lib1/LICENSE'];
  return fixture;
}

function oneLibScopedPackageProject() {
  var fixture = oneLibProject();
  fixture.fs = {
    '/project1/node_modules/@org/lib1/package.json': JSON.stringify({
      name: '@org/lib1',
      license: 'MIT',
      version: '0.0.1'
    }),
    '/project1/node_modules/@org/lib1/LICENSE': 'MIT License'
  };
  fixture.compiler.compilation.chunks[0].modules[0].resource =
    '/project1/node_modules/@org/lib1/3rd_party_lib.js';
  return fixture;
}

function oneLibScopedPackageProjectWithAtSignResource() {
  var fixture = oneLibScopedPackageProject();
  fixture.compiler.compilation.chunks[0].modules[0].resource =
    '/project1/node_modules/@org/lib1/@org/lib1/3rd_party_lib.js';
  return fixture;
}

function nodeModulesContextProject() {
  var fixture = oneLibProject();
  fixture.compiler.context = '/project1/node_modules/lib1';
  return fixture;
}

function nonRootContextProject() {
  var fixture = oneLibProject();
  fixture.compiler.context = '/project1/path';
  return fixture;
}

function licenseArrayProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib1/package.json'] = JSON.stringify({
    name: 'lib1',
    licenses: [{ type: 'MIT' }, { type: 'ISC' }],
    version: '0.0.1'
  });
  return fixture;
}

function licenseTypeProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib1/package.json'] = JSON.stringify({
    name: 'lib1',
    license: { type: 'MIT' },
    version: '0.0.1'
  });
  return fixture;
}

function twoChunkProject() {
  var fixture = oneLibProject();
  var fixture2 = oneLibProject();
  var chunk = fixture2.compiler.compilation.chunks[0];
  chunk.name = 'vendor';
  fixture.compiler.compilation.chunks.push(chunk);
  return fixture;
}

function licenseWithQuotationMarkProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib1/LICENSE'] = '"MIT License"';
  return fixture;
}

function no3rdPartyLicenseProject() {
  var fixture = oneLibProject();
  fixture.compiler.compilation.chunks[0].modules = [
    { resource: '/project1/myfile.js' }
  ];
  return fixture;
}

function strayJsFileInNodeModulesProject() {
  var fixture = no3rdPartyLicenseProject();
  fixture.fs['/project1/node_modules/foo.js'] = 'void 0;';
  fixture.compiler.compilation.chunks[0].modules.push({
    resource: '/project1/node_modules/foo.js'
  });
  return fixture;
}

function rootModuleProject() {
  var fixture = oneLibProject();
  fixture.compiler.compilation.chunks[0].modules = [
    { rootModule: { resource: '/project1/node_modules/lib1/3rd_party_lib.js' } }
  ];
  return fixture;
}

function oneLibCRLFProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/node_modules/lib1/LICENSE'] = 'MIT\r\nLicense\r\ntest';
  return fixture;
}

function fileDependenciesProject() {
  var fixture = oneLibProject();
  var mod = fixture.compiler.compilation.chunks[0].modules[0];
  delete mod.resource;
  mod.fileDependencies = ['/project1/node_modules/lib1/3rd_party_lib.js'];
  return fixture;
}

function alternateModuleDirectoryProject() {
  var fixture = oneLibProject();
  fixture.fs = {
    '/project1/libs/lib1/package.json': JSON.stringify({
      name: 'lib1',
      license: 'MIT',
      version: '0.0.1'
    }),
    '/project1/libs/lib1/LICENSE': 'MIT License',
    '/project1/node_modules': {}
  };
  fixture.compiler.compilation.chunks[0].modules[0].resource =
    '/project1/libs/lib1/3rd_party_lib.js';
  return fixture;
}

function multiModuleDirectoryProject() {
  var fixture = oneLibProject();
  fixture.fs['/project1/libs/lib2/package.json'] = JSON.stringify({
    name: 'lib2',
    license: 'MIT',
    version: '0.0.1'
  });
  fixture.fs['/project1/libs/lib2/LICENSE'] = 'MIT License';
  fixture.compiler.compilation.chunks[0].modules.push({
    resource: '/project1/libs/lib2/3rd_party_lib.js'
  });
  return fixture;
}

module.exports = {
  oneLibProject: oneLibProject,
  badBuildRootProject: badBuildRootProject,
  hasNonJsOutputProject: hasNonJsOutputProject,
  multiModuleVaryingLicenseProject: multiModuleVaryingLicenseProject,
  oneLibProjectWithLicenseTxtFile: oneLibProjectWithLicenseTxtFile,
  unknownLicenseProject: unknownLicenseProject,
  missingLicenseFileProject: missingLicenseFileProject,
  oneLibScopedPackageProject: oneLibScopedPackageProject,
  oneLibScopedPackageProjectWithAtSignResource: oneLibScopedPackageProjectWithAtSignResource,
  nodeModulesContextProject: nodeModulesContextProject,
  nonRootContextProject: nonRootContextProject,
  licenseArrayProject: licenseArrayProject,
  licenseTypeProject: licenseTypeProject,
  twoChunkProject: twoChunkProject,
  licenseWithQuotationMarkProject: licenseWithQuotationMarkProject,
  no3rdPartyLicenseProject: no3rdPartyLicenseProject,
  strayJsFileInNodeModulesProject: strayJsFileInNodeModulesProject,
  rootModuleProject: rootModuleProject,
  oneLibCRLFProject: oneLibCRLFProject,
  fileDependenciesProject: fileDependenciesProject,
  alternateModuleDirectoryProject: alternateModuleDirectoryProject,
  multiModuleDirectoryProject: multiModuleDirectoryProject
};
