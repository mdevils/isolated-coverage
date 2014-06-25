import path = require('path');
import vow = require('vow');
import vowFs = require('vow-fs');
import SourceTree = require('./source-tree');
import LocalShell = require('./shell/local-shell');
import Istanbul = require('./tools/istanbul');
import TestBundle = require('./test-bundle');

class CoveragePipeline {
    constructor(private sourceTree: SourceTree, private buildCommand: string, private runCommand: string) {}

    run() {
        var phantomAdditions = ' -k ' + path.resolve(__dirname, '../hooks/phantom-dump-coverage.js');
        phantomAdditions += ' -t 10000';
        var tmpShell = new LocalShell(this.sourceTree.getTmpRoot());
        var istanbul = new Istanbul(tmpShell);
        var root = this.sourceTree.getRoot();
        var tmpRoot = this.sourceTree.getTmpRoot();
        var coverageResults = {};
        var processBundle = (testBundle: TestBundle): vow.Promise => {
            var processTemplate = (template: string): string => {
                return template.replace(/\{\{base\}\}/, testBundle.getBase());
            };
            return vow.all(testBundle.getSources().map((sourceFile) => {
                    return istanbul.instrument(path.join(root, sourceFile)).then((instrumentedData) => {
                        return vowFs.write(path.join(tmpRoot, sourceFile), instrumentedData);
                    });
                }))
                .then(() => {
                    return tmpShell.execCommandLine(processTemplate(this.buildCommand));
                })
                .then(() => {
                    return tmpShell.execCommandLine(processTemplate(this.runCommand) + phantomAdditions);
                })
                .then(() => {
                    return vowFs.read(path.join(tmpRoot, 'coverage.json'), 'utf8');
                })
                .then((coverageJsonString: string) => {
                    var coverageData = JSON.parse(coverageJsonString);
                    for (var i in coverageData) {
                        if (coverageData.hasOwnProperty(i)) {
                            coverageResults[i] = coverageData[i];
                        }
                    }
                })
                .then(() => {
                    return vow.all(testBundle.getSources().map((sourceFile) => {
                        return vowFs.copy(path.join(root, sourceFile), path.join(tmpRoot, sourceFile));
                    }));
                });
        };

        var nextBundle = (): any => {
            if (this.sourceTree.hasBundles()) {
                return processBundle(this.sourceTree.shiftBundle()).then(nextBundle);
            }
        };
        return nextBundle().then(() => {
            return coverageResults;
        });
    }
}

export = CoveragePipeline;
