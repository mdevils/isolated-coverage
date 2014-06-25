var path = require('path');
var vow = require('vow');
var vowFs = require('vow-fs');
var TestBundle = require('./test-bundle');

var SourceTree = (function () {
    function SourceTree(root, tmpRoot, bundles) {
        if (typeof bundles === "undefined") { bundles = []; }
        this.root = root;
        this.tmpRoot = tmpRoot;
        this.bundles = bundles;
        this.fileList = [];
    }
    SourceTree.prototype.hasBundles = function () {
        return this.bundles.length > 0;
    };

    SourceTree.prototype.shiftBundle = function () {
        return this.bundles.shift();
    };

    SourceTree.prototype.addBundle = function (testBundle) {
        this.bundles.push(testBundle);
    };

    SourceTree.prototype.getRoot = function () {
        return this.root;
    };

    SourceTree.prototype.getTmpRoot = function () {
        return this.tmpRoot;
    };

    SourceTree.prototype.load = function (sourceRoots) {
        var _this = this;
        return vow.all(sourceRoots.map(function (sourcePath) {
            return _this.collectTestFilePaths(sourcePath, _this.root);
        })).then(function (res) {
            return [].concat.apply([], res);
        }).then(function (fileList) {
            fileList = fileList.filter(function (filename) {
                return Boolean(filename.match(/\.js$/));
            });
            _this.fileList = fileList;
            _this.bundles = _this.splitIntoBundles(fileList);
        });
    };

    SourceTree.prototype.splitIntoBundles = function (fileList) {
        var result = [];
        var bundleIndex = {};
        fileList.forEach(function (filename) {
            var base = stripExt(filename);
            bundleIndex[base] = bundleIndex[base] || [];
            bundleIndex[base].push(filename);
        });
        fileList.forEach(function (filename) {
            if (isTestFile(filename)) {
                var base = stripExt(filename);
                var sources = bundleIndex[base].filter(function (filename) {
                    return !isTestFile(filename);
                });
                result.push(new TestBundle(filename, sources));
            }
        });
        return result;
    };

    SourceTree.prototype.collectTestFilePaths = function (directory, context) {
        var _this = this;
        var directoryPath = path.join(context, directory);
        return vowFs.listDir(directory).then(function (files) {
            return vow.all(files.map(function (filename) {
                return vowFs.stat(path.join(directoryPath, filename)).then(function (stat) {
                    var fullname = path.join(directory, filename);
                    return stat.isDirectory() ? _this.collectTestFilePaths(fullname, context) : [fullname];
                });
            })).then(function (results) {
                return [].concat.apply([], results);
            });
        });
    };

    SourceTree.prototype.split = function (parts) {
        var result = [];
        for (var i = 0; i < parts; i++) {
            result.push(new SourceTree(this.root, path.join(this.tmpRoot, String(i + 1))));
        }
        for (i = 0; i < this.bundles.length; i++) {
            result[i % parts].addBundle(this.bundles[i]);
        }
        return vow.all(result.map(function (sourceTree) {
            return vowFs.makeDir(sourceTree.getTmpRoot());
        })).then(function () {
            return result;
        });
    };

    SourceTree.prototype.getSourceFiles = function () {
        return this.fileList.filter(function (filename) {
            return !isTestFile(filename);
        });
    };
    return SourceTree;
})();

function isTestFile(filename) {
    return Boolean(filename.match(/\.test\.js$/));
}

function stripExt(filename) {
    return filename.replace(/(\.[\w]+)+$/, '');
}

module.exports = SourceTree;
