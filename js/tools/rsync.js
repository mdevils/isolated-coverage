var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tool = require('../tool');

var RSync = (function (_super) {
    __extends(RSync, _super);
    function RSync() {
        _super.apply(this, arguments);
    }
    RSync.prototype.sync = function (source, dest, excludes) {
        var args = ['-avzq'];
        if (excludes) {
            excludes.forEach(function (exclude) {
                args.push('--exclude');
                args.push(exclude);
            });
        }
        args.push(source);
        args.push(dest);
        return this.shell.exec('rsync', args);
    };
    return RSync;
})(Tool);

module.exports = RSync;
