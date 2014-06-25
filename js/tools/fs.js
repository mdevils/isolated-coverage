var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var os = require('os');
var path = require('path');

var vowFs = require('vow-fs');
var Tool = require('../tool');

var FS = (function (_super) {
    __extends(FS, _super);
    function FS() {
        _super.apply(this, arguments);
    }
    FS.prototype.copy = function (from, to) {
        return this.shell.exec('cp', ['-R', from, to]);
    };
    FS.prototype.remove = function (what) {
        return this.shell.exec('rm', ['-Rf', what]);
    };
    FS.prototype.createTmpDir = function () {
        var tmpDir = os.tmpDir();
        function tryCreateNewDirectory() {
            var tmpName = path.join(tmpDir, (new Date()).getTime() + '-' + Math.round(1000000 * Math.random()));
            return vowFs.exists(tmpName).then(function (exists) {
                return exists ? tryCreateNewDirectory() : vowFs.makeDir(tmpName).then(function () {
                    return tmpName;
                });
            });
        }
        return tryCreateNewDirectory();
    };
    return FS;
})(Tool);

module.exports = FS;
