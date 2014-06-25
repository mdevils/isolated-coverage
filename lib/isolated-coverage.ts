import fs = require('fs');
import path = require('path');
import FS = require('./tools/fs');
import RSync = require('./tools/rsync');
import Istanbul = require('./tools/istanbul');
import LocalShell = require('./shell/local-shell');
import vow = require('vow');
import vowFs = require('vow-fs');
import SourceTree = require('./source-tree');
import CoveragePipeline = require('./coverage-pipeline');
import istanbul = require('istanbul');
import minimatch = require('minimatch');
var Instrumenter = istanbul.Instrumenter;

class IsolatedCoverage {
    private sourcePaths: string[] = [];
    private runCommand: string;
    private buildCommand: string;
    private threadCount: number = 1;
    private ignores: string[] = [];

    addSourcePath(sourcePath: string) {
        this.sourcePaths.push(sourcePath);
    }

    setBuildCommand(command: string) {
        this.buildCommand = command;
    }

    setRunCommand(command: string) {
        this.runCommand = command;
    }

    setThreadCount(threadCount: number) {
        this.threadCount = threadCount;
    }

    addIgnore(ignore: string) {
        this.ignores.push(ignore);
    }

    run(): vow.Promise {
        var projectDirectory = process.cwd();
        var initialShell = new LocalShell(projectDirectory);
        var fs = new FS(initialShell);
        var rsync = new RSync(initialShell);
        var istanbul = new Istanbul(initialShell);
        var projectName = path.basename(projectDirectory);
        var tmpDir;
        var tmpProjectDir;
        var tmpShell;
        var sourceTree: SourceTree;
        var filterSourceFiles = (filename: string): boolean => {
            return !this.ignores.some((ignore) => minimatch(filename, ignore));
        };

        return fs.createTmpDir()
            .then((newTmpDir) => {
                tmpDir = newTmpDir;
                tmpProjectDir = path.join(tmpDir, projectName);
                tmpShell = new LocalShell(tmpProjectDir);
            })
            .then(() => {
                sourceTree = new SourceTree(projectDirectory, tmpProjectDir);
                return sourceTree.load(this.sourcePaths).then(() => {
                    return sourceTree.split(this.threadCount);
                })
            })
            .then((subSourceTrees: SourceTree[]) => {
                return vow.all(
                    subSourceTrees.map((sourceTree) => {
                        return rsync.sync('.', sourceTree.getTmpRoot(), ['node_modules', '.git'])
                            .then(() => {
                                return vowFs.symLink(
                                    path.join(sourceTree.getRoot(), 'node_modules'),
                                    path.join(sourceTree.getTmpRoot(), 'node_modules')
                                );
                            })
                            .then(() => {
                                var coveragePipeline = new CoveragePipeline(sourceTree, this.buildCommand, this.runCommand);
                                return coveragePipeline.run();
                            });
                    })
                ).then((coverageResults: Object[]) => {
                    var result = {};
                    coverageResults.forEach((coverageResult) => {
                        for (var i in coverageResult) {
                            if (coverageResult.hasOwnProperty(i)) {
                                result[i] = coverageResult[i];
                            }
                        }
                    });
                    return result;
                });
            })
            .then((result) => {
                return vow.all(sourceTree.getSourceFiles().filter(filterSourceFiles).map((filename) => {
                    var fullname = path.join(projectDirectory, filename);
                    if (!result[fullname]) {
                        return vowFs.read(fullname, 'utf8').then((data) => {
                            var instrumenter = new Instrumenter();
                            instrumenter.instrumentSync(data, filename);
                            result[filename] = instrumenter.coverState;
                        });
                    } else {
                        result[filename] = result[fullname];
                        result[filename].path = filename;
                        delete result[fullname];
                    }
                })).then(() => {
                    return result;
                });

            })
            .then((result) => {
                var coverageJsonPath = path.join(tmpProjectDir, 'coverage.json');
                return vowFs.write(coverageJsonPath, JSON.stringify(result), 'utf8').then(() => {
                    return istanbul.buildHtmlReport(coverageJsonPath);
                });
            })
            .then(() => {
                return fs.remove(tmpDir);
            }, (e) => {
                return fs.remove(tmpDir).then(() => {
                    throw e;
                })
            });
    }

}

export = IsolatedCoverage;
