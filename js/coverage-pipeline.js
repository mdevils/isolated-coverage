var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');

var LocalShell = require('./shell/local-shell');
var Istanbul = require('./tools/istanbul');

var CoveragePipeline = (function () {
    function CoveragePipeline(sourceTree, buildCommand, runCommand) {
        this.sourceTree = sourceTree;
        this.buildCommand = buildCommand;
        this.runCommand = runCommand;
    }
    CoveragePipeline.prototype.run = function () {
        var _this = this;
        var phantomAdditions = ' -k ' + path.resolve(__dirname, '../hooks/phantom-dump-coverage.js');
        phantomAdditions += ' -t 10000';
        var tmpShell = new LocalShell(this.sourceTree.getTmpRoot());
        var istanbul = new Istanbul(tmpShell);
        var root = this.sourceTree.getRoot();
        var tmpRoot = this.sourceTree.getTmpRoot();
        var coverageResults = {};
        var processBundle = function (testBundle) {
            var processTemplate = function (template) {
                return template.replace(/\{\{base\}\}/, testBundle.getBase());
            };
            return vow.all(testBundle.getSources().map(function (sourceFile) {
                return istanbul.instrument(path.join(root, sourceFile)).then(function (instrumentedData) {
                    return vowFs.write(path.join(tmpRoot, sourceFile), instrumentedData);
                });
            })).then(function () {
                return tmpShell.execCommandLine(processTemplate(_this.buildCommand));
            }).then(function () {
                return tmpShell.execCommandLine(processTemplate(_this.runCommand) + phantomAdditions);
            }).then(function () {
                return vowFs.read(path.join(tmpRoot, 'coverage.json'), 'utf8');
            }).then(function (coverageJsonString) {
                var coverageData = JSON.parse(coverageJsonString);
                for (var i in coverageData) {
                    if (coverageData.hasOwnProperty(i)) {
                        coverageResults[i] = coverageData[i];
                    }
                }
            }).then(function () {
                return vow.all(testBundle.getSources().map(function (sourceFile) {
                    return vowFs.copy(path.join(root, sourceFile), path.join(tmpRoot, sourceFile));
                }));
            });
        };

        var nextBundle = function () {
            if (_this.sourceTree.hasBundles()) {
                return processBundle(_this.sourceTree.shiftBundle()).then(nextBundle);
            }
        };
        return nextBundle().then(function () {
            return coverageResults;
        });
    };
    return CoveragePipeline;
})();

module.exports = CoveragePipeline;
