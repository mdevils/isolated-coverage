var path = require('path');
var FS = require('./tools/fs');
var RSync = require('./tools/rsync');
var Istanbul = require('./tools/istanbul');
var LocalShell = require('./shell/local-shell');
var vow = require('vow');
var vowFs = require('vow-fs');
var SourceTree = require('./source-tree');
var CoveragePipeline = require('./coverage-pipeline');
var istanbul = require('istanbul');
var minimatch = require('minimatch');
var Instrumenter = istanbul.Instrumenter;

var IsolatedCoverage = (function () {
    function IsolatedCoverage() {
        this.sourcePaths = [];
        this.threadCount = 1;
        this.ignores = [];
    }
    IsolatedCoverage.prototype.addSourcePath = function (sourcePath) {
        this.sourcePaths.push(sourcePath);
    };

    IsolatedCoverage.prototype.setBuildCommand = function (command) {
        this.buildCommand = command;
    };

    IsolatedCoverage.prototype.setRunCommand = function (command) {
        this.runCommand = command;
    };

    IsolatedCoverage.prototype.setThreadCount = function (threadCount) {
        this.threadCount = threadCount;
    };

    IsolatedCoverage.prototype.addIgnore = function (ignore) {
        this.ignores.push(ignore);
    };

    IsolatedCoverage.prototype.run = function () {
        var _this = this;
        var projectDirectory = process.cwd();
        var initialShell = new LocalShell(projectDirectory);
        var fs = new FS(initialShell);
        var rsync = new RSync(initialShell);
        var istanbul = new Istanbul(initialShell);
        var projectName = path.basename(projectDirectory);
        var tmpDir;
        var tmpProjectDir;
        var tmpShell;
        var sourceTree;
        var filterSourceFiles = function (filename) {
            return !_this.ignores.some(function (ignore) {
                return minimatch(filename, ignore);
            });
        };

        return fs.createTmpDir().then(function (newTmpDir) {
            tmpDir = newTmpDir;
            tmpProjectDir = path.join(tmpDir, projectName);
            tmpShell = new LocalShell(tmpProjectDir);
        }).then(function () {
            sourceTree = new SourceTree(projectDirectory, tmpProjectDir);
            return sourceTree.load(_this.sourcePaths).then(function () {
                return sourceTree.split(_this.threadCount);
            });
        }).then(function (subSourceTrees) {
            return vow.all(subSourceTrees.map(function (sourceTree) {
                return rsync.sync('.', sourceTree.getTmpRoot(), ['node_modules', '.git']).then(function () {
                    return vowFs.symLink(path.join(sourceTree.getRoot(), 'node_modules'), path.join(sourceTree.getTmpRoot(), 'node_modules'));
                }).then(function () {
                    var coveragePipeline = new CoveragePipeline(sourceTree, _this.buildCommand, _this.runCommand);
                    return coveragePipeline.run();
                });
            })).then(function (coverageResults) {
                var result = {};
                coverageResults.forEach(function (coverageResult) {
                    for (var i in coverageResult) {
                        if (coverageResult.hasOwnProperty(i)) {
                            result[i] = coverageResult[i];
                        }
                    }
                });
                return result;
            });
        }).then(function (result) {
            return vow.all(sourceTree.getSourceFiles().filter(filterSourceFiles).map(function (filename) {
                var fullname = path.join(projectDirectory, filename);
                if (!result[fullname]) {
                    return vowFs.read(fullname, 'utf8').then(function (data) {
                        var instrumenter = new Instrumenter();
                        instrumenter.instrumentSync(data, filename);
                        result[filename] = instrumenter.coverState;
                    });
                } else {
                    result[filename] = result[fullname];
                    result[filename].path = filename;
                    delete result[fullname];
                }
            })).then(function () {
                return result;
            });
        }).then(function (result) {
            var coverageJsonPath = path.join(tmpProjectDir, 'coverage.json');
            return vowFs.write(coverageJsonPath, JSON.stringify(result), 'utf8').then(function () {
                return istanbul.buildHtmlReport(coverageJsonPath);
            });
        }).then(function () {
            return fs.remove(tmpDir);
        }, function (e) {
            return fs.remove(tmpDir).then(function () {
                throw e;
            });
        });
    };
    return IsolatedCoverage;
})();

module.exports = IsolatedCoverage;
